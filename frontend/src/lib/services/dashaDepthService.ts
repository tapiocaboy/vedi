/**
 * Third-level (pratyantardasha) depth report for a single antardasha.
 *
 * Pulls together everything needed to answer the two questions a timeline row
 * cannot: which sub-windows carry the most weight, and how to work the period
 * profitably given what its lords actually are.
 */

import { getPlanetPositions } from '../core/ephemeris';
import { VimshottariDasha, type AntardashaPeriodInfo } from '../core/dasha';
import { DashaPredictionEngine, type ChartContext } from '../core/predictions';
import { type Lang, getStoredLang } from '../core/i18n';
import { assessPlanetStrength, type PlanetStrength } from '../core/dashaStrength';
import { scanWindowTransits, type NatalPoint, type TransitHit } from '../core/dashaTransits';
import {
  assessWeight,
  weightHeadline,
  type PeriodTone,
  type WeightBand,
  type WeightFactor,
} from '../core/dashaWeight';
import { buildPeriodStrategy, type PeriodStrategy, type WeightedWindow } from '../core/periodStrategy';
import { judgeAntardasha, type AntardashaJudgement } from '../core/antardashaJudgement';
import { buildChartContext, formatPrediction } from './predictionService';
import type { BirthData } from '../../types/astrology';
import type { DashaPredictionData } from '../../services/api';

/** A life area whose outlook actually moves inside this sub-window. */
export interface TrendShift {
  area: string;
  from: string;
  to: string;
}

export interface WeightedPratyantardasha {
  lord: string;
  start: string;
  end: string;
  days: number;
  /** 0–10 — how many layers of the chart converge on this window. */
  weight: number;
  band: WeightBand;
  tone: PeriodTone;
  /** The single most decisive factor, for the collapsed row. */
  headline: string;
  factors: WeightFactor[];
  transitHits: TransitHit[];
  /**
   * What this window changes relative to the antardasha outlook. The base
   * reading is stated once on the report; only the differences live here, so
   * nothing is repeated nine times over.
   */
  trendShifts: TrendShift[];
  addedDetails: string[];
  isCurrent: boolean;
}

export interface AntardashaDepthReport {
  mahadashaLord: string;
  antardashaLord: string;
  start: string;
  end: string;
  days: number;
  /**
   * The antardasha-level reading — life areas, remedies and activities. These
   * are governed by the mahadasha and antardasha lords, so they are stated
   * once here rather than repeated inside every sub-window.
   */
  prediction: DashaPredictionData;
  /**
   * Classical judgement of this specific mahadasha/antardasha pair — the
   * mutual disposition of the two lords and everything that qualifies it.
   * This, not the engine's mahadasha-driven rating, is what distinguishes one
   * antardasha from another inside the same mahadasha.
   */
  judgement: AntardashaJudgement;
  /** Chart-specific explanation of what "weight" is measuring here. */
  weightDefinition: string[];
  periods: WeightedPratyantardasha[];
  strategy: PeriodStrategy;
  currentLord: string | null;
}

const engine = new DashaPredictionEngine();

/** Natal points worth watching a slow transit against. */
const NATAL_BODIES: Array<[string, string]> = [
  ['SUN', 'Sun'], ['MOON', 'Moon'], ['MARS', 'Mars'], ['MERCURY', 'Mercury'],
  ['JUPITER', 'Jupiter'], ['VENUS', 'Venus'], ['SATURN', 'Saturn'],
  ['RAHU', 'Rahu'], ['KETU', 'Ketu'], ['ASCENDANT', 'Lagna'],
];

function contains(start: Date, end: Date, t: Date): boolean {
  return t >= start && t <= end;
}

/**
 * Locate the antardasha that begins at `antardashaStartISO` and return it
 * alongside the one that follows it (crossing into the next mahadasha when the
 * antardasha is the last of its cycle).
 */
function locateAntardasha(
  calc: VimshottariDasha,
  antardashaStartISO: string,
): { antardasha: AntardashaPeriodInfo; next: AntardashaPeriodInfo | null } | null {
  // Probe just inside the window so a boundary-exact start still resolves.
  const probe = new Date(new Date(antardashaStartISO).getTime() + 1000);
  const mahadashas = calc.generateMahadashaTimeline();
  const mdIdx = mahadashas.findIndex(md => contains(md.start, md.end, probe));
  if (mdIdx === -1) return null;

  const antardashas = calc.calculateAntardasha(mahadashas[mdIdx]);
  const adIdx = antardashas.findIndex(ad => contains(ad.start, ad.end, probe));
  if (adIdx === -1) return null;

  let next: AntardashaPeriodInfo | null = antardashas[adIdx + 1] ?? null;
  if (!next && mahadashas[mdIdx + 1]) {
    next = calc.calculateAntardasha(mahadashas[mdIdx + 1])[0] ?? null;
  }
  return { antardasha: antardashas[adIdx], next };
}

function buildWeightDefinition(
  md: string,
  ad: string,
  periods: WeightedPratyantardasha[],
  totalHits: number,
): string[] {
  const bullets: string[] = [];

  const repeats = periods.filter(p => p.lord === ad || p.lord === md).map(p => p.lord);
  bullets.push(
    `Repetition across dasha levels — when the pratyantardasha lord is also the antardasha or mahadasha lord, ` +
    `the same planet speaks at two levels and its signification compounds. ` +
    (repeats.length
      ? `Here ${[...new Set(repeats)].join(' and ')} ${repeats.length > 1 ? 'do' : 'does'} exactly that.`
      : `No lord repeats inside this antardasha, so weight comes from the other layers.`),
  );

  bullets.push(
    `Transit reinforcement — a slow planet striking a sensitive natal point, changing sign, or stationing ` +
    `inside the window. ` +
    (totalHits
      ? `${totalHits} such event${totalHits > 1 ? 's fall' : ' falls'} inside this antardasha, and each one is ` +
        `attributed to the exact sub-window it lands in.`
      : `No slow-planet event lands inside this antardasha, so the period runs on dasha structure alone.`),
  );

  bullets.push(
    `Natal condition of the sub-lord — dignity, house lordship, combustion and retrogression. A strong ` +
    `benefic sub-lord lightens the window and can turn it productive; a separative or afflicted one intensifies it. ` +
    `Strength raises weight in either direction: it decides tone, not volume.`,
  );

  bullets.push(
    `Nodal and station points — Rahu/Ketu sub-periods, and the moments a slow planet reverses direction. ` +
    `These are pressure points regardless of what else is running.`,
  );

  return bullets;
}

/**
 * Full depth report for one antardasha. `antardashaStartISO` identifies the
 * exact instance (a lord recurs across the 120-year cycle).
 */
export async function getAntardashaDepth(
  bd: BirthData,
  antardashaStartISO: string,
  asOf: Date = new Date(),
  lang: Lang = getStoredLang(),
): Promise<AntardashaDepthReport | null> {
  const positions = await getPlanetPositions(bd.date, bd.latitude, bd.longitude, bd.timezone, bd.ayanamsa);
  const ctx: ChartContext = buildChartContext(positions);
  const calc = new VimshottariDasha(positions['MOON'].longitude, new Date(bd.date));

  const located = locateAntardasha(calc, antardashaStartISO);
  if (!located) return null;
  const { antardasha: ad, next } = located;
  const md = ad.mahadashaLord;

  const pratyantars = calc.calculatePratyantardasha(ad);

  // Natal condition lookups are pure and reused across all nine windows.
  const strengthCache = new Map<string, PlanetStrength | null>();
  const strengthOf = (planet: string): PlanetStrength | null => {
    if (!strengthCache.has(planet)) {
      strengthCache.set(planet, ctx.planetRashis ? assessPlanetStrength(planet, ctx, lang) : null);
    }
    return strengthCache.get(planet)!;
  };

  const natalPoints: NatalPoint[] = NATAL_BODIES.flatMap(([key, name]) => {
    const p = positions[key];
    return p ? [{ name, longitude: p.longitude }] : [];
  });

  // One ephemeris scan covers the whole antardasha; each window filters it.
  const transitHits = await scanWindowTransits(ad.start, ad.end, natalPoints, bd.ayanamsa);

  // The antardasha reading is the baseline every sub-window is measured against.
  const baseline = engine.generateCompletePrediction(md, ad.lord, undefined, undefined, ctx, lang);

  // ...and the classical judgement is what makes this antardasha differ from
  // its eight siblings inside the same mahadasha.
  const judgement = judgeAntardasha({ mahadashaLord: md, antardashaLord: ad.lord, ctx, strengthOf, lang });

  const periods: WeightedPratyantardasha[] = pratyantars.map(pd => {
    const hotTargets = new Set([md, ad.lord, pd.lord, 'Sun', 'Moon', 'Lagna']);
    const assessment = assessWeight({
      mahadashaLord: md,
      antardashaLord: ad.lord,
      pratyantarLord: pd.lord,
      start: pd.start,
      end: pd.end,
      subLordStrength: strengthOf(pd.lord),
      transitHits,
      hotTargets,
    });

    // Only the difference from the baseline is worth showing at this level.
    const sub = engine.generateCompletePrediction(md, ad.lord, pd.lord, undefined, ctx, lang);
    const trendShifts: TrendShift[] = [];
    const addedDetails: string[] = [];
    for (const [area, base] of Object.entries(baseline.predictions)) {
      const now = sub.predictions[area];
      if (!now) continue;
      if (now.trend !== base.trend) {
        trendShifts.push({ area, from: base.trend, to: now.trend });
      }
      for (const detail of now.details) {
        if (!base.details.includes(detail)) addedDetails.push(detail);
      }
    }

    return {
      lord: pd.lord,
      start: pd.start.toISOString(),
      end: pd.end.toISOString(),
      days: Math.round(pd.days * 10) / 10,
      weight: assessment.weight,
      band: assessment.band,
      tone: assessment.tone,
      headline: weightHeadline(assessment, pd.lord),
      factors: assessment.factors,
      transitHits: assessment.transitHits,
      trendShifts,
      addedDetails,
      isCurrent: contains(pd.start, pd.end, asOf),
    };
  });

  const windows: WeightedWindow[] = pratyantars.map((pd, i) => ({
    lord: pd.lord,
    start: pd.start,
    end: pd.end,
    days: pd.days,
    weight: periods[i].weight,
    band: periods[i].band,
    tone: periods[i].tone,
  }));

  const strategy = buildPeriodStrategy({
    mahadashaLord: md,
    antardashaLord: ad.lord,
    periods: windows,
    judgement,
    strengthOf,
    nextAntardasha: next ? { lord: next.lord, start: next.start, end: next.end } : null,
    lang,
  });

  return {
    mahadashaLord: md,
    antardashaLord: ad.lord,
    start: ad.start.toISOString(),
    end: ad.end.toISOString(),
    days: Math.round(ad.days * 10) / 10,
    prediction: formatPrediction(baseline),
    judgement,
    weightDefinition: buildWeightDefinition(md, ad.lord, periods, transitHits.length),
    periods,
    strategy,
    currentLord: periods.find(p => p.isCurrent)?.lord ?? null,
  };
}

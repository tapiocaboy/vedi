/**
 * Prediction Service — local-only, delegates to DashaPredictionEngine
 */

import { getPlanetPositions, type PlanetPosition } from '../core/ephemeris';
import { VimshottariDasha } from '../core/dasha';
import { DashaPredictionEngine, type DashaPrediction, type ChartContext } from '../core/predictions';
import { type Lang, getStoredLang } from '../core/i18n';
import { computeAshtakavarga, type Contributor } from '../core/ashtakavarga';
import { getCurrentTransits, summarizeGocharaForPrediction } from '../core/transits';
import type { BirthData } from '../../types/astrology';
import type { DashaPredictionData } from '../../services/api';

function toIso(d: Date): string { return d.toISOString(); }

export function formatPrediction(pred: DashaPrediction): DashaPredictionData {
  const predictions = Object.fromEntries(
    Object.entries(pred.predictions).map(([area, p]) => [area, {
      trend: p.trend, intensity: p.intensity, summary: p.summary,
      details: p.details, remedies: p.remedies, keywords: p.keywords,
    }])
  ) as DashaPredictionData['predictions'];

  return {
    dashaLord: pred.dashaLord,
    antardasha: pred.antardasha,
    pratyantardasha: pred.pratyantardasha,
    sookshmaDasha: pred.sookshmaDasha,
    periodType: pred.periodType,
    overallTheme: pred.overallTheme,
    overallRating: pred.overallRating,
    predictions,
    favorableActivities: pred.favorableActivities,
    unfavorableActivities: pred.unfavorableActivities,
    importantTransits: pred.importantTransits,
    lordStrengths: pred.lordStrengths,
    natalFoundation: pred.natalFoundation,
    remedies: { gemstone: pred.gemstone, mantra: pred.mantra, deity: pred.deity },
    combinationWarning: pred.combinationWarning,
    combinationBonus: pred.combinationBonus,
  };
}

async function getMoonLon(bd: BirthData): Promise<number> {
  const positions = await getPlanetPositions(bd.date, bd.latitude, bd.longitude, bd.timezone, bd.ayanamsa);
  return positions['MOON'].longitude;
}

const ENGINE_PLANET_KEY: Record<string, Contributor> = {
  SUN: 'Sun', MOON: 'Moon', MARS: 'Mars', MERCURY: 'Mercury',
  JUPITER: 'Jupiter', VENUS: 'Venus', SATURN: 'Saturn',
};

export function buildChartContext(positions: Record<string, PlanetPosition>): ChartContext {
  const rashis = { Lagna: positions['ASCENDANT'].rashi } as Record<Contributor, number>;
  for (const [k, v] of Object.entries(ENGINE_PLANET_KEY)) {
    rashis[v] = positions[k].rashi;
  }
  const ascRashi = positions['ASCENDANT'].rashi;
  // Whole-sign natal house + full natal condition for every body
  // (including the nodes, which Ashtakavarga skips).
  const planetHouses: Record<string, number> = {};
  const planetRashis: Record<string, number> = {};
  const planetLongitudes: Record<string, number> = {};
  const planetRetro: Record<string, boolean> = {};
  for (const key of ['SUN','MOON','MARS','MERCURY','JUPITER','VENUS','SATURN','RAHU','KETU']) {
    const p = positions[key];
    if (p == null) continue;
    const name = key.charAt(0) + key.slice(1).toLowerCase(); // SUN -> Sun
    planetHouses[name] = ((p.rashi - ascRashi + 12) % 12) + 1;
    planetRashis[name] = p.rashi;
    planetLongitudes[name] = p.longitude;
    planetRetro[name] = p.isRetrograde;
  }
  return {
    ashtakavarga: computeAshtakavarga(rashis),
    planetHouses,
    ascendantRashi: ascRashi,
    planetRashis,
    planetLongitudes,
    planetRetro,
    moonRashi: positions['MOON'].rashi,
  };
}

async function getCurrentDashaContext(bd: BirthData): Promise<{
  moonLon: number; ctx: ChartContext;
}> {
  const positions = await getPlanetPositions(bd.date, bd.latitude, bd.longitude, bd.timezone, bd.ayanamsa);
  return { moonLon: positions['MOON'].longitude, ctx: buildChartContext(positions) };
}

const engine = new DashaPredictionEngine();

async function chartCtxFor(bd: BirthData): Promise<ChartContext> {
  const positions = await getPlanetPositions(bd.date, bd.latitude, bd.longitude, bd.timezone, bd.ayanamsa);
  return buildChartContext(positions);
}

export async function getMahadashaPrediction(bd: BirthData, dashaLord: string, lang: Lang = getStoredLang()): Promise<DashaPredictionData> {
  const ctx = await chartCtxFor(bd);
  return formatPrediction(engine.generateCompletePrediction(dashaLord, undefined, undefined, undefined, ctx, lang));
}

export async function getAntardashaPrediction(bd: BirthData, mahadasha: string, antardasha: string, lang: Lang = getStoredLang()): Promise<DashaPredictionData> {
  const ctx = await chartCtxFor(bd);
  return formatPrediction(engine.generateCompletePrediction(mahadasha, antardasha, undefined, undefined, ctx, lang));
}

export async function getPratyantardashaPrediction(bd: BirthData, mahadasha: string, antardasha: string, pratyantardasha: string, lang: Lang = getStoredLang()): Promise<DashaPredictionData> {
  const ctx = await chartCtxFor(bd);
  return formatPrediction(engine.generateCompletePrediction(mahadasha, antardasha, pratyantardasha, undefined, ctx, lang));
}

/** Just the Ashtakavarga grid for the chart. */
export async function getAshtakavargaForChart(bd: BirthData) {
  const positions = await getPlanetPositions(bd.date, bd.latitude, bd.longitude, bd.timezone, bd.ayanamsa);
  return computeAshtakavarga({
    Lagna: positions['ASCENDANT'].rashi,
    Sun: positions['SUN'].rashi,
    Moon: positions['MOON'].rashi,
    Mars: positions['MARS'].rashi,
    Mercury: positions['MERCURY'].rashi,
    Jupiter: positions['JUPITER'].rashi,
    Venus: positions['VENUS'].rashi,
    Saturn: positions['SATURN'].rashi,
  });
}

export async function getCurrentPeriodPrediction(bd: BirthData, targetDate?: Date, lang: Lang = getStoredLang()): Promise<DashaPredictionData> {
  const { moonLon, ctx } = await getCurrentDashaContext(bd);
  const calc = new VimshottariDasha(moonLon, new Date(bd.date));
  const td = targetDate ?? new Date();
  const current = calc.getCurrentPeriods(td);
  if ('error' in current) throw new Error(current.error);

  // Fold current transits (Sade Sati, Guru blessing…) into the prediction.
  try {
    const gochara = await getCurrentTransits(bd.ayanamsa, ctx.moonRashi!, ctx.ascendantRashi!, td, undefined, undefined, lang);
    const transitSummary = summarizeGocharaForPrediction(gochara, lang);
    ctx.transitNotes = transitSummary.notes;
    ctx.transitScoreMod = transitSummary.scoreMod;
  } catch {
    // Transits are an enhancement — never block the core prediction.
  }

  const pred = engine.generateCompletePrediction(
    current.mahadasha.lord,
    current.antardasha.lord,
    current.pratyantardasha?.lord,
    current.sookshmaDasha?.lord,
    ctx,
    lang,
  );
  const result = formatPrediction(pred);
  result.currentPeriods = {
    mahadasha: { lord: current.mahadasha.lord, start: toIso(current.mahadasha.start), end: toIso(current.mahadasha.end) },
    antardasha: { lord: current.antardasha.lord, start: toIso(current.antardasha.start), end: toIso(current.antardasha.end) },
    ...(current.pratyantardasha ? {
      pratyantardasha: { lord: current.pratyantardasha.lord, start: toIso(current.pratyantardasha.start), end: toIso(current.pratyantardasha.end) },
    } : {}),
    ...(current.sookshmaDasha ? {
      sookshmaDasha: { lord: current.sookshmaDasha.lord, start: toIso(current.sookshmaDasha.start), end: toIso(current.sookshmaDasha.end) },
    } : {}),
  };
  return result;
}

export interface SookshmaEntry {
  lord: string;
  start: string;
  end: string;
  days: number;
  isCurrent: boolean;
}

export interface SookshmaPeriodList {
  mahadasha: string;
  antardasha: string;
  pratyantardasha: string;
  pratyantarStart: string;
  pratyantarEnd: string;
  sookshmas: SookshmaEntry[];
  currentSookshmaLord: string | null;
}

export async function getSookshmaPeriodsForCurrent(bd: BirthData, targetDate?: Date): Promise<SookshmaPeriodList | null> {
  const moonLon = await getMoonLon(bd);
  const calc = new VimshottariDasha(moonLon, new Date(bd.date));
  const td = targetDate ?? new Date();
  const current = calc.getCurrentPeriods(td);
  if ('error' in current || !current.pratyantardasha) return null;

  const mahadashas = calc.generateMahadashaTimeline();
  const currentMd = mahadashas.find(md => md.lord === current.mahadasha.lord && md.start <= td && md.end >= td);
  if (!currentMd) return null;
  const antardashas = calc.calculateAntardasha(currentMd);
  const currentAd = antardashas.find(ad => ad.lord === current.antardasha.lord && ad.start <= td && ad.end >= td);
  if (!currentAd) return null;
  const pratyantars = calc.calculatePratyantardasha(currentAd);
  const currentPd = pratyantars.find(pd => pd.lord === current.pratyantardasha!.lord && pd.start <= td && pd.end >= td);
  if (!currentPd) return null;

  const sookshmas = calc.calculateSookshmaDasha(currentPd);

  return {
    mahadasha: current.mahadasha.lord,
    antardasha: current.antardasha.lord,
    pratyantardasha: current.pratyantardasha.lord,
    pratyantarStart: toIso(currentPd.start),
    pratyantarEnd: toIso(currentPd.end),
    currentSookshmaLord: current.sookshmaDasha?.lord ?? null,
    sookshmas: sookshmas.map(sd => ({
      lord: sd.lord,
      start: toIso(sd.start),
      end: toIso(sd.end),
      days: Math.round(sd.days * 10) / 10,
      isCurrent: sd.lord === current.sookshmaDasha?.lord &&
        new Date(toIso(sd.start)) <= td && new Date(toIso(sd.end)) >= td,
    })),
  };
}

export async function getTimelineWithPredictions(bd: BirthData, yearsAhead = 80, lang: Lang = getStoredLang()): Promise<unknown[]> {
  const { moonLon, ctx } = await getCurrentDashaContext(bd);
  const calc = new VimshottariDasha(moonLon, new Date(bd.date));
  const mahadashas = calc.generateMahadashaTimeline(yearsAhead);

  return mahadashas.map(md => {
    const prediction = engine.generateCompletePrediction(md.lord, undefined, undefined, undefined, ctx, lang);
    const antardashas = calc.calculateAntardasha(md);

    return {
      lord: md.lord,
      start: toIso(md.start),
      end: toIso(md.end),
      years: Math.round(md.years * 100) / 100,
      isBirthDasha: md.isBirthDasha,
      prediction: formatPrediction(prediction),
      antardashas: antardashas.map(ad => {
        const adPred = engine.generateCompletePrediction(md.lord, ad.lord, undefined, undefined, ctx, lang);
        return {
          lord: ad.lord,
          start: toIso(ad.start),
          end: toIso(ad.end),
          days: Math.round(ad.days * 10) / 10,
          predictionSummary: {
            overallTheme: adPred.overallTheme,
            overallRating: adPred.overallRating,
            health: { trend: adPred.predictions.health.trend, summary: adPred.predictions.health.summary },
            wealth: { trend: adPred.predictions.wealth.trend, summary: adPred.predictions.wealth.summary },
            career: { trend: adPred.predictions.career.trend, summary: adPred.predictions.career.summary },
            relationships: { trend: adPred.predictions.relationships.trend, summary: adPred.predictions.relationships.summary },
            favorableActivities: adPred.favorableActivities.slice(0, 3),
            remedies: { gemstone: adPred.gemstone, mantra: adPred.mantra, deity: adPred.deity },
            combinationWarning: adPred.combinationWarning,
            combinationBonus: adPred.combinationBonus,
          },
        };
      }),
    };
  });
}

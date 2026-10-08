/**
 * Period snapshot — orchestrates the data shown on the "Now" tab.
 *
 * Builds an end-to-end view of where the person is right now: current dasha
 * tree, chart-aware prediction, current planetary transits (Gochara), an
 * optional relocated chart for a different location, and an actionable
 * playbook (best/avoid days, key opportunities, pitfalls).
 */

import { VimshottariDasha } from '../core/dasha';
import { birthInstant } from '../core/birthInstant';
import { DashaPredictionEngine } from '../core/predictions';
import { type Lang, getStoredLang, planetName } from '../core/i18n';
import { PLAYBOOK_TEXT, WEEKDAY } from '../core/text/readingText';
import { PLANET_THEME, type PlanetKey } from '../core/text/plainSummaryText';
import { getCurrentTransits, summarizeGocharaForPrediction, type GocharaSnapshot, type CurrentLocation } from '../core/transits';
import { relocateChart, type RelocatedChart } from '../core/relocation';
import { getPlanetPositions } from '../core/ephemeris';
import { formatPrediction, buildChartContext } from './predictionService';
import { transitSignsFrom } from '../core/classicalIndicators';
import type { BirthData } from '../../types/astrology';
import type { DashaPredictionData } from '../../services/api';

const PLANET_KEYS = ['SUN','MOON','MARS','MERCURY','JUPITER','VENUS','SATURN','RAHU','KETU'] as const;

function toName(canonicalKey: string): string {
  return canonicalKey.charAt(0) + canonicalKey.slice(1).toLowerCase();
}

/** Weekday ruled by each planet, Sunday = 0 (indexes WEEKDAY in text/readingText). */
const PLANET_WEEKDAY: Record<string, number> = {
  Sun: 0, Moon: 1, Mars: 2, Mercury: 3, Jupiter: 4, Venus: 5, Saturn: 6,
};

const PLANET_FRIENDS: Record<string, string[]> = {
  Sun: ['Moon', 'Mars', 'Jupiter'],
  Moon: ['Sun', 'Mercury'],
  Mars: ['Sun', 'Moon', 'Jupiter'],
  Mercury: ['Sun', 'Venus'],
  Jupiter: ['Sun', 'Moon', 'Mars'],
  Venus: ['Mercury', 'Saturn'],
  Saturn: ['Mercury', 'Venus'],
  Rahu: ['Saturn', 'Venus'],
  Ketu: ['Mars', 'Venus'],
};

const PLANET_ENEMIES: Record<string, string[]> = {
  Sun: ['Venus', 'Saturn'],
  Moon: [],
  Mars: ['Mercury'],
  Mercury: ['Moon'],
  Jupiter: ['Mercury', 'Venus'],
  Venus: ['Sun', 'Moon'],
  Saturn: ['Sun', 'Moon', 'Mars'],
  Rahu: ['Sun', 'Moon', 'Mars'],
  Ketu: ['Sun', 'Moon'],
};

const PLANET_REMEDY: Record<string, { mantra: string; charity: string }> = {
  Sun:     { mantra: 'Om Suryaya Namah (108x at dawn)',     charity: 'Wheat, jaggery, copper to elders' },
  Moon:    { mantra: 'Om Somaya Namah (Mondays, evening)',  charity: 'Milk, rice, silver to women' },
  Mars:    { mantra: 'Om Mangalaya Namah (Tuesdays)',       charity: 'Red lentils, jaggery, courage to siblings' },
  Mercury: { mantra: 'Om Budhaya Namah (Wednesdays)',       charity: 'Green moong, books, education for the young' },
  Jupiter: { mantra: 'Om Gurave Namah (Thursdays, dawn)',   charity: 'Turmeric, yellow cloth, support a teacher' },
  Venus:   { mantra: 'Om Shukraya Namah (Fridays)',         charity: 'White cloth, sugar, rice; honour a partner' },
  Saturn:  { mantra: 'Om Shanaye Namah (Saturdays)',        charity: 'Sesame, iron, service to the elderly/poor' },
  Rahu:    { mantra: 'Om Rahave Namah; chant Durga Saptashati', charity: 'Black cloth, donations on Saturday twilight' },
  Ketu:    { mantra: 'Om Ketave Namah; worship Ganesha',    charity: 'Blankets, multicoloured cloth, food to dogs' },
};

export interface Playbook {
  bestDays: string[];
  avoidDays: string[];
  dailyPractice: { mantra: string; charity: string };
  opportunities: string[];
  pitfalls: string[];
  decisionWindow: string;
  monthAhead: string;
}

export interface PeriodSnapshot {
  asOf: string;
  birthData: BirthData;
  currentPeriods: {
    mahadasha:       { lord: string; start: string; end: string; daysRemaining: number };
    antardasha:      { lord: string; start: string; end: string; daysRemaining: number };
    pratyantardasha: { lord: string; start: string; end: string; daysRemaining: number } | null;
    sookshmaDasha:   { lord: string; start: string; end: string; daysRemaining: number } | null;
  };
  prediction: DashaPredictionData;
  gochara: GocharaSnapshot;
  relocation: {
    location: CurrentLocation;
    chart: RelocatedChart;
  } | null;
  playbook: Playbook;
}

function daysBetween(a: Date, b: Date): number {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86_400_000));
}

function buildPlaybook(
  mdLord: string,
  adLord: string,
  pdLord: string | null,
  prediction: DashaPredictionData,
  lang: Lang,
): Playbook {
  const good = new Set<number>();
  const bad = new Set<number>();

  for (const lord of [mdLord, adLord]) {
    if (lord in PLANET_WEEKDAY) good.add(PLANET_WEEKDAY[lord]);
    for (const f of PLANET_FRIENDS[lord] ?? []) {
      if (f in PLANET_WEEKDAY) good.add(PLANET_WEEKDAY[f]);
    }
    for (const e of PLANET_ENEMIES[lord] ?? []) {
      if (e in PLANET_WEEKDAY) bad.add(PLANET_WEEKDAY[e]);
    }
  }
  // A day can't be both — when in doubt, favourable wins.
  for (const d of good) bad.delete(d);
  const dayNames = (set: Set<number>) => [...set].sort((a, b) => a - b).map(i => WEEKDAY[i][lang]);

  // Plain wording, no planet jargon: the reader needs when to commit, not why.
  const friend = (PLANET_FRIENDS[mdLord] ?? []).includes(adLord);
  const enemy = (PLANET_ENEMIES[mdLord] ?? []).includes(adLord);
  const decisionWindow = PLAYBOOK_TEXT[friend ? 'decisionFriend' : enemy ? 'decisionEnemy' : 'decisionNeutral'][lang];

  const monthLord = pdLord ?? adLord;
  const monthAhead = PLAYBOOK_TEXT[pdLord ? 'monthPd' : 'monthAd'][lang]
    .replace('{planet}', planetName(monthLord, lang))
    .replace('{theme}', PLANET_THEME[monthLord as PlanetKey]?.[lang] ?? '');

  return {
    bestDays: dayNames(good),
    avoidDays: dayNames(bad),
    dailyPractice: PLANET_REMEDY[mdLord] ?? { mantra: '', charity: '' },
    opportunities: prediction.favorableActivities.slice(0, 6),
    pitfalls: prediction.unfavorableActivities.slice(0, 6),
    decisionWindow,
    monthAhead,
  };
}

export async function getPeriodSnapshot(
  bd: BirthData,
  currentLocation?: CurrentLocation,
  asOf?: Date,
  lang: Lang = getStoredLang(),
): Promise<PeriodSnapshot> {
  const td = asOf ?? new Date();

  // Natal positions + chart context.
  const positions = await getPlanetPositions(bd.date, bd.latitude, bd.longitude, bd.timezone, bd.ayanamsa);
  const ctx = buildChartContext(positions);

  // Dasha tree.
  const calc = new VimshottariDasha(positions['MOON'].longitude, birthInstant(bd));
  const periodsRaw = calc.getCurrentPeriods(td);
  if ('error' in periodsRaw) throw new Error(periodsRaw.error);

  // Gochara / current transits — computed first so the prediction can use them.
  const natalMoonRashi = positions['MOON'].rashi;
  const natalLagnaRashi = positions['ASCENDANT'].rashi;
  const gochara = await getCurrentTransits(bd.ayanamsa, natalMoonRashi, natalLagnaRashi, td, currentLocation, positions, lang);
  const transitSummary = summarizeGocharaForPrediction(gochara, lang, {
    maha: periodsRaw.mahadasha.lord, antar: periodsRaw.antardasha.lord,
  });
  ctx.transitNotes = transitSummary.notes;
  ctx.transitScoreMod = transitSummary.scoreMod;
  ctx.transitDiverges = transitSummary.diverges;
  ctx.transitSigns = transitSignsFrom(gochara.transits);
  if (transitSummary.erashtaka) {
    ctx.erashtaka = { level: transitSummary.erashtaka.level, areas: transitSummary.erashtaka.areas };
    // The headline card shows this description — carry the dasha-aware grade.
    if (gochara.sadeSati.active && gochara.erashtaka) {
      gochara.sadeSati.description = gochara.sadeSati.description
        .replace(gochara.erashtaka.summary, transitSummary.erashtaka.summary);
    }
  }

  // Chart-aware prediction.
  const engine = new DashaPredictionEngine();
  const predRaw = engine.generateCompletePrediction(
    periodsRaw.mahadasha.lord,
    periodsRaw.antardasha.lord,
    periodsRaw.pratyantardasha?.lord,
    periodsRaw.sookshmaDasha?.lord,
    ctx,
    lang,
  );
  const prediction = formatPrediction(predRaw);
  prediction.currentPeriods = {
    mahadasha:  { lord: periodsRaw.mahadasha.lord,  start: periodsRaw.mahadasha.start.toISOString(),  end: periodsRaw.mahadasha.end.toISOString() },
    antardasha: { lord: periodsRaw.antardasha.lord, start: periodsRaw.antardasha.start.toISOString(), end: periodsRaw.antardasha.end.toISOString() },
    ...(periodsRaw.pratyantardasha ? { pratyantardasha: { lord: periodsRaw.pratyantardasha.lord, start: periodsRaw.pratyantardasha.start.toISOString(), end: periodsRaw.pratyantardasha.end.toISOString() } } : {}),
    ...(periodsRaw.sookshmaDasha   ? { sookshmaDasha:   { lord: periodsRaw.sookshmaDasha.lord,   start: periodsRaw.sookshmaDasha.start.toISOString(),   end: periodsRaw.sookshmaDasha.end.toISOString() } }     : {}),
  };

  // Optional relocation.
  let relocation: PeriodSnapshot['relocation'] = null;
  if (currentLocation) {
    const natalRashis: Record<string, number> = {};
    for (const k of PLANET_KEYS) {
      natalRashis[toName(k)] = positions[k].rashi;
    }
    const chart = await relocateChart(bd, currentLocation.latitude, currentLocation.longitude, natalRashis, natalLagnaRashi);
    relocation = { location: currentLocation, chart };
  }

  const currentPeriods = {
    mahadasha:       { lord: periodsRaw.mahadasha.lord,        start: periodsRaw.mahadasha.start.toISOString(),       end: periodsRaw.mahadasha.end.toISOString(),       daysRemaining: daysBetween(td, periodsRaw.mahadasha.end) },
    antardasha:      { lord: periodsRaw.antardasha.lord,       start: periodsRaw.antardasha.start.toISOString(),      end: periodsRaw.antardasha.end.toISOString(),      daysRemaining: daysBetween(td, periodsRaw.antardasha.end) },
    pratyantardasha: periodsRaw.pratyantardasha ? { lord: periodsRaw.pratyantardasha.lord, start: periodsRaw.pratyantardasha.start.toISOString(), end: periodsRaw.pratyantardasha.end.toISOString(), daysRemaining: daysBetween(td, periodsRaw.pratyantardasha.end) } : null,
    sookshmaDasha:   periodsRaw.sookshmaDasha   ? { lord: periodsRaw.sookshmaDasha.lord,   start: periodsRaw.sookshmaDasha.start.toISOString(),   end: periodsRaw.sookshmaDasha.end.toISOString(),   daysRemaining: daysBetween(td, periodsRaw.sookshmaDasha.end) }   : null,
  };

  const playbook = buildPlaybook(
    periodsRaw.mahadasha.lord,
    periodsRaw.antardasha.lord,
    periodsRaw.pratyantardasha?.lord ?? null,
    prediction,
    lang,
  );

  return {
    asOf: td.toISOString(),
    birthData: bd,
    currentPeriods,
    prediction,
    gochara,
    relocation,
    playbook,
  };
}

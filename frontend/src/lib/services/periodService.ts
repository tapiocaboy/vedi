/**
 * Period snapshot — orchestrates the data shown on the "Now" tab.
 *
 * Builds an end-to-end view of where the person is right now: current dasha
 * tree, chart-aware prediction, current planetary transits (Gochara), an
 * optional relocated chart for a different location, and an actionable
 * playbook (best/avoid days, key opportunities, pitfalls).
 */

import { VimshottariDasha } from '../core/dasha';
import { DashaPredictionEngine, type ChartContext } from '../core/predictions';
import { computeAshtakavarga, type Contributor } from '../core/ashtakavarga';
import { getCurrentTransits, type GocharaSnapshot, type CurrentLocation } from '../core/transits';
import { relocateChart, type RelocatedChart } from '../core/relocation';
import { getPlanetPositions, type PlanetPosition } from '../core/ephemeris';
import { formatPrediction } from './predictionService';
import type { BirthData } from '../../types/astrology';
import type { DashaPredictionData } from '../../services/api';

const PLANET_KEYS = ['SUN','MOON','MARS','MERCURY','JUPITER','VENUS','SATURN','RAHU','KETU'] as const;

function toName(canonicalKey: string): string {
  return canonicalKey.charAt(0) + canonicalKey.slice(1).toLowerCase();
}

const PLANET_WEEKDAY: Record<string, string> = {
  Sun: 'Sunday',  Moon: 'Monday',   Mars: 'Tuesday',  Mercury: 'Wednesday',
  Jupiter: 'Thursday', Venus: 'Friday', Saturn: 'Saturday',
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

function buildChartContext(positions: Record<string, PlanetPosition>): ChartContext {
  const rashis: Record<Contributor, number> = { Lagna: positions['ASCENDANT'].rashi } as never;
  rashis.Sun = positions['SUN'].rashi;
  rashis.Moon = positions['MOON'].rashi;
  rashis.Mars = positions['MARS'].rashi;
  rashis.Mercury = positions['MERCURY'].rashi;
  rashis.Jupiter = positions['JUPITER'].rashi;
  rashis.Venus = positions['VENUS'].rashi;
  rashis.Saturn = positions['SATURN'].rashi;

  const ascRashi = positions['ASCENDANT'].rashi;
  const planetHouses: Record<string, number> = {};
  for (const k of PLANET_KEYS) {
    planetHouses[toName(k)] = ((positions[k].rashi - ascRashi + 12) % 12) + 1;
  }

  return { ashtakavarga: computeAshtakavarga(rashis), planetHouses, ascendantRashi: ascRashi };
}

function daysBetween(a: Date, b: Date): number {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86_400_000));
}

function buildPlaybook(
  mdLord: string,
  adLord: string,
  pdLord: string | null,
  prediction: DashaPredictionData,
): Playbook {
  const good = new Set<string>();
  const bad = new Set<string>();

  for (const lord of [mdLord, adLord]) {
    if (PLANET_WEEKDAY[lord]) good.add(PLANET_WEEKDAY[lord]);
    for (const f of PLANET_FRIENDS[lord] ?? []) {
      if (PLANET_WEEKDAY[f]) good.add(PLANET_WEEKDAY[f]);
    }
    for (const e of PLANET_ENEMIES[lord] ?? []) {
      if (PLANET_WEEKDAY[e]) bad.add(PLANET_WEEKDAY[e]);
    }
  }
  // A day can't be both — when in doubt, favourable wins.
  for (const d of good) bad.delete(d);

  const decisionWindow = (() => {
    const friend = (PLANET_FRIENDS[mdLord] ?? []).includes(adLord);
    const enemy = (PLANET_ENEMIES[mdLord] ?? []).includes(adLord);
    if (friend) return `Major decisions are well-timed — ${mdLord} and ${adLord} are aligned. Commit to a 90-day plan in the area of life this sub-period emphasizes.`;
    if (enemy) return `Hold off on irreversible commitments — ${mdLord} and ${adLord} create friction. Use this window to test, learn, and tighten plans; do not sign on the dotted line.`;
    return `Neutral decision window — small consistent actions accumulate. Reserve the big move for when ${mdLord} and the antardasha lord are aligned.`;
  })();

  const monthAhead = pdLord
    ? `Next 30 days are coloured by Pratyantardasha of ${pdLord}: themes are ${pdLord}-style — see the Pratyantardasha guidance below. Use this short window for ${pdLord}-friendly activities; avoid ${(PLANET_ENEMIES[pdLord] ?? []).join(', ') || 'none in particular'}.`
    : `Use the current Antardasha (${adLord}) to set the tone for the next several months.`;

  return {
    bestDays: [...good],
    avoidDays: [...bad],
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
): Promise<PeriodSnapshot> {
  const td = asOf ?? new Date();

  // Natal positions + chart context.
  const positions = await getPlanetPositions(bd.date, bd.latitude, bd.longitude, bd.timezone, bd.ayanamsa);
  const ctx = buildChartContext(positions);

  // Dasha tree.
  const calc = new VimshottariDasha(positions['MOON'].longitude, new Date(bd.date));
  const periodsRaw = calc.getCurrentPeriods(td);
  if ('error' in periodsRaw) throw new Error(periodsRaw.error);

  // Chart-aware prediction.
  const engine = new DashaPredictionEngine();
  const predRaw = engine.generateCompletePrediction(
    periodsRaw.mahadasha.lord,
    periodsRaw.antardasha.lord,
    periodsRaw.pratyantardasha?.lord,
    periodsRaw.sookshmaDasha?.lord,
    ctx,
  );
  const prediction = formatPrediction(predRaw);
  prediction.currentPeriods = {
    mahadasha:  { lord: periodsRaw.mahadasha.lord,  start: periodsRaw.mahadasha.start.toISOString(),  end: periodsRaw.mahadasha.end.toISOString() },
    antardasha: { lord: periodsRaw.antardasha.lord, start: periodsRaw.antardasha.start.toISOString(), end: periodsRaw.antardasha.end.toISOString() },
    ...(periodsRaw.pratyantardasha ? { pratyantardasha: { lord: periodsRaw.pratyantardasha.lord, start: periodsRaw.pratyantardasha.start.toISOString(), end: periodsRaw.pratyantardasha.end.toISOString() } } : {}),
    ...(periodsRaw.sookshmaDasha   ? { sookshmaDasha:   { lord: periodsRaw.sookshmaDasha.lord,   start: periodsRaw.sookshmaDasha.start.toISOString(),   end: periodsRaw.sookshmaDasha.end.toISOString() } }     : {}),
  };

  // Gochara / current transits.
  const natalMoonRashi = positions['MOON'].rashi;
  const natalLagnaRashi = positions['ASCENDANT'].rashi;
  const gochara = await getCurrentTransits(bd.ayanamsa, natalMoonRashi, natalLagnaRashi, td, currentLocation);

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

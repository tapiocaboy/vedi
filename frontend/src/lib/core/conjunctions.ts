/**
 * Planet-pair (conjunction) analysis for the planets sharing one house.
 *
 * Two planets in the same sign are a conjunction, but "same sign" hides a lot:
 * 0°12′ apart is a planetary war, 2° is a fused single force, and 26° is two
 * planets that barely notice each other. This module measures the actual angle
 * between them and grades the result, then answers the two questions a chart
 * owner actually asks — *what does this do to me*, and *when*.
 *
 * Everything is derived from data already in the chart: exact longitudes for
 * the angle, the Ascendant for functional lordship, and the Vimshottari
 * timeline for the timing. Nothing here is randomised or approximated beyond
 * the classical rules it names.
 */

import type { CurrentDasha, DashaPeriod, PlanetPosition } from '../../types/astrology';
import { type Lang, joinAnd, planetName, pick } from './i18n';
import {
  assessStrength, getCombustion, getDigBala, getDignity,
  getFunctionalNature, inMoolatrikona, normalizePlanetKey,
  type DignityLevel,
} from './planetaryAnalysis';
import { PLANETARY_RELATIONSHIPS } from './predictions';
import { DASHA_SEQUENCE, DASHA_YEARS, DAYS_PER_YEAR, TOTAL_DASHA_YEARS } from './dasha';
import {
  ACTIVATION_LABEL, ORB_BAND_LABEL, ORB_BAND_PLAIN, PAIR_FRAMES, RELATION_LABEL,
  VERDICT_LABEL, factorText, getPairReading, houseShort, housePlain,
} from './text/conjunctionText';

// ─── Types ─────────────────────────────────────────────────────────────────

export type OrbBand = 'yuddha' | 'exact' | 'close' | 'moderate' | 'wide';
export type PairVerdict = 'very-supportive' | 'supportive' | 'mixed' | 'straining' | 'difficult';
export type ActivationLevel = 'peak' | 'high' | 'moderate' | 'background';
export type PairRelation = 'friend' | 'neutral' | 'mixed' | 'enemy';

/** One line of the "why this score" breakdown. Weight is signed. */
export interface PairFactor {
  key: string;
  text: string;
  weight: number;
}

export interface PairWindow {
  /** "Saturn period · Mars sub-period" — already localised. */
  label: string;
  start: string;
  end: string;
  state: 'past' | 'current' | 'future';
  /** A peak is both planets running at once; a chapter is one of them leading. */
  kind: 'peak' | 'chapter';
}

export interface PairNow {
  level: ActivationLevel;
  label: string;
  /** 0–100 — how much of this pair is switched on today. */
  score: number;
  text: string;
  /** End of the innermost matching dasha window, when one matches. */
  windowEnd: string | null;
  /** "The next time it switches fully on is …" */
  nextText: string | null;
}

export interface PairLifetime {
  summary: string;
  maturityText: string;
  /** Age at which the later of the two planets matures. */
  fullyOnAge: number;
  currentAge: number | null;
  windows: PairWindow[];
}

export interface PlanetPairAnalysis {
  /** Chart-cased codes ('SUN'…'KETU'); `a` is the planet earlier in the sign. */
  a: string;
  b: string;
  /** Title-cased engine keys. */
  aKey: string;
  bKey: string;
  house: number;

  /** Exact angular distance in degrees, 0–180. */
  separation: number;
  orbBand: OrbBand;
  orbLabel: string;
  orbText: string;
  /** 0–100 — how completely the two act as one force. */
  intensity: number;
  /** True when the faster planet was still closing in at birth. */
  applying: boolean;

  relation: PairRelation;
  relationLabel: string;
  /** −100…+100 net quality of the combination for this chart. */
  harmony: number;
  verdict: PairVerdict;
  verdictLabel: string;

  name: string;
  plain: string;
  gift: string;
  cost: string;
  headline: string;
  orderText: string;
  motionText: string;
  fusionText: string;

  /** 0–100 — what this pairing can give. */
  power: number;
  /** 0–100 — the friction it carries. */
  drag: number;
  powerFactors: PairFactor[];
  dragFactors: PairFactor[];

  combustion: { planet: string; separation: number; limit: number; text: string } | null;
  grahaYuddha: { winner: string; loser: string; text: string } | null;

  now: PairNow;
  lifetime: PairLifetime;

  degrees: { a: number; b: number };
  retrograde: { a: boolean; b: boolean };
  dignity: { a: DignityLevel; b: DignityLevel };
  strength: { a: number; b: number };
}

/** A planet sharing the house, as the angle diagram needs it. */
export interface HouseOccupant {
  /** Chart-cased code ('SUN'…'KETU'). */
  planet: string;
  /** Position within the sign, 0–30. */
  degreeInSign: number;
  isRetrograde: boolean;
}

export interface HousePairsResult {
  house: number;
  pairs: PlanetPairAnalysis[];
  /** Occupants ordered by position in the sign — the x-axis of the diagram. */
  occupants: HouseOccupant[];
  /** Gap in degrees between each neighbouring pair, left to right. */
  gaps: Array<{ from: string; to: string; degrees: number }>;
  /** Set only when three or more planets crowd the house. */
  groupHeadline: string | null;
}

export interface PairInput {
  houseNumber: number;
  ascendantRashiIndex: number;
  planets: PlanetPosition[];
  currentDasha?: CurrentDasha | null;
  mahadashaTimeline?: DashaPeriod[] | null;
  birthDate?: string | null;
  now?: Date;
  lang?: Lang;
}

// ─── Classical constants ───────────────────────────────────────────────────

/**
 * Age at which each graha's results "mature" (Graha Paripakam). Until then a
 * planet gives partial results, which is why a natal combination can sit almost
 * silent for decades and then switch on.
 */
export const MATURITY_AGE: Record<string, number> = {
  Sun: 22, Moon: 24, Mars: 28, Mercury: 32, Jupiter: 16,
  Venus: 25, Saturn: 36, Rahu: 42, Ketu: 48,
};

/** Only the five star-planets fight a graha yuddha; luminaries and nodes do not. */
const WAR_PLANETS = new Set(['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']);

const KENDRA_TRIKONA = new Set([1, 4, 5, 7, 9, 10]);
const DUSTHANA = new Set([6, 8, 12]);

const DIGNITY_STRENGTH: Record<DignityLevel, number> = {
  exalted: 1.0, 'own-sign': 0.8, 'friend-sign': 0.7,
  'neutral-sign': 0.5, 'enemy-sign': 0.3, debilitated: 0.1,
};

const MS_PER_DAY = 86_400_000;

// ─── Geometry ──────────────────────────────────────────────────────────────

/** Shortest angular distance between two longitudes, 0–180. */
export function angularSeparation(lonA: number, lonB: number): number {
  const raw = Math.abs(lonA - lonB) % 360;
  return raw > 180 ? 360 - raw : raw;
}

/** Signed difference a − b wrapped to (−180, 180]. */
function signedDelta(lonA: number, lonB: number): number {
  let d = (lonA - lonB) % 360;
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}

/**
 * Was the gap still closing at birth? A conjunction that is still applying keeps
 * tightening in the progressed sense and reads as a theme that grows; a
 * separating one has already peaked.
 */
export function isApplying(a: { longitude: number; speed: number }, b: { longitude: number; speed: number }): boolean {
  const d = signedDelta(a.longitude, b.longitude);
  const rate = a.speed - b.speed;
  if (d === 0 || rate === 0) return false;
  // |d| grows when d and rate share a sign — that is separation.
  return Math.sign(d) !== Math.sign(rate);
}

export function orbBandFor(separation: number, aKey: string, bKey: string): OrbBand {
  if (separation < 1 && WAR_PLANETS.has(aKey) && WAR_PLANETS.has(bKey)) return 'yuddha';
  if (separation <= 3) return 'exact';
  if (separation <= 8) return 'close';
  if (separation <= 15) return 'moderate';
  return 'wide';
}

/**
 * How completely the two planets fuse, 0–100. Same-sign placement never drops to
 * zero — the classical reading is sign-based — but a 1° pairing is a different
 * animal from a 27° one, and the number has to say so.
 */
export function blendIntensity(separation: number): number {
  const capped = Math.min(separation, 30);
  const closeness = Math.pow(1 - capped / 30, 1.4);
  return Math.round(Math.max(8, 30 + 70 * closeness));
}

// ─── Nature & relationship ─────────────────────────────────────────────────

function relationOneWay(from: string, to: string): 'friend' | 'neutral' | 'enemy' {
  const rel = PLANETARY_RELATIONSHIPS[from];
  if (!rel) return 'neutral';
  if ((rel.friends ?? []).includes(to)) return 'friend';
  if ((rel.enemies ?? []).includes(to)) return 'enemy';
  return 'neutral';
}

export function pairRelation(aKey: string, bKey: string): PairRelation {
  const score = (r: string) => (r === 'friend' ? 1 : r === 'enemy' ? -1 : 0);
  const ab = relationOneWay(aKey, bKey);
  const ba = relationOneWay(bKey, aKey);
  const sum = score(ab) + score(ba);
  if (score(ab) * score(ba) < 0) return 'mixed';
  if (sum >= 1) return 'friend';
  if (sum <= -1) return 'enemy';
  return 'neutral';
}

type Nature = 'benefic' | 'neutral' | 'malefic';

/**
 * Natural benefic / malefic status. Mercury takes the colour of its company and
 * the Moon depends on how far it is from the Sun — treating either as fixed
 * misreads a large share of real charts.
 */
function naturalNature(key: string, partnerKey: string, moonElongation: number | null): Nature {
  switch (key) {
    case 'Jupiter':
    case 'Venus':
      return 'benefic';
    case 'Moon': {
      if (moonElongation === null) return 'benefic';
      // Bright (waxing past the first eighth, before the last) — a dark Moon is weak.
      return moonElongation >= 72 && moonElongation <= 288 ? 'benefic' : 'neutral';
    }
    case 'Mercury':
      return partnerKey === 'Jupiter' || partnerKey === 'Venus' ? 'benefic' : 'neutral';
    default:
      return 'malefic';
  }
}

// ─── Dasha helpers ─────────────────────────────────────────────────────────

/**
 * The antardasha of `adLord` inside a mahadasha, as absolute dates.
 *
 * The first mahadasha in a timeline is the balance left at birth, so its
 * `durationYears` is a remainder, not the real length. Sub-periods still run off
 * the full-length cycle — scaling them to the remainder would shift every window
 * by years — so the notional start is reconstructed backwards from the end.
 */
export function antardashaWindow(md: DashaPeriod, adLord: string): { start: Date; end: Date } | null {
  const startIdx = DASHA_SEQUENCE.indexOf(md.lord);
  if (startIdx < 0) return null;

  const fullYears = md.isBirthDasha ? (DASHA_YEARS[md.lord] ?? md.durationYears) : md.durationYears;
  const mdEndMs = new Date(md.end).getTime();
  const mdStartMs = new Date(md.start).getTime();
  let cursor = md.isBirthDasha ? mdEndMs - fullYears * DAYS_PER_YEAR * MS_PER_DAY : mdStartMs;

  for (let i = 0; i < 9; i++) {
    const lord = DASHA_SEQUENCE[(startIdx + i) % 9];
    const days = (fullYears * (DASHA_YEARS[lord] ?? 0) * DAYS_PER_YEAR) / TOTAL_DASHA_YEARS;
    const end = cursor + days * MS_PER_DAY;
    if (lord === adLord) {
      // Clip to the visible part of the mahadasha; skip what happened before birth.
      if (end <= mdStartMs) return null;
      return { start: new Date(Math.max(cursor, mdStartMs)), end: new Date(end) };
    }
    cursor = end;
  }
  return null;
}

function fmtDate(iso: string | Date, lang: Lang): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toLocaleDateString(lang === 'si' ? 'si-LK' : undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function periodLabel(mdLord: string, adLord: string | null, lang: Lang): string {
  const md = planetName(mdLord, lang);
  if (!adLord) return lang === 'si' ? `${md} මහ දශාව` : `${md} period`;
  const ad = planetName(adLord, lang);
  return lang === 'si' ? `${md} මහ දශාව · ${ad} අන්තර් දශාව` : `${md} period · ${ad} sub-period`;
}

function stateOf(start: Date, end: Date, now: Date): PairWindow['state'] {
  if (end.getTime() < now.getTime()) return 'past';
  if (start.getTime() > now.getTime()) return 'future';
  return 'current';
}

// ─── The analysis ──────────────────────────────────────────────────────────

function ruledAreas(rulesHouses: number[], lang: Lang): string {
  return joinAnd(rulesHouses.map(h => houseShort(h, lang)), lang);
}

function analyzePair(
  pa: PlanetPosition,
  pb: PlanetPosition,
  input: Required<Pick<PairInput, 'houseNumber' | 'ascendantRashiIndex' | 'planets'>> & PairInput,
): PlanetPairAnalysis {
  const lang: Lang = input.lang ?? 'en';
  const now = input.now ?? new Date();
  const house = input.houseNumber;
  const asc = input.ascendantRashiIndex;

  // `a` is whichever sits earlier in the sign, so "ahead / behind" prose is stable.
  const [first, second] = pa.rashiDegree <= pb.rashiDegree ? [pa, pb] : [pb, pa];
  const aKey = normalizePlanetKey(first.planet);
  const bKey = normalizePlanetKey(second.planet);
  const aName = planetName(aKey, lang);
  const bName = planetName(bKey, lang);

  const separation = angularSeparation(first.longitude, second.longitude);
  const orbBand = orbBandFor(separation, aKey, bKey);
  const intensity = blendIntensity(separation);
  const applying = isApplying(first, second);

  const relation = pairRelation(aKey, bKey);

  // ── Individual strength, reused from the single-planet engine ─────────────
  const sun = input.planets.find(p => p.planet.toUpperCase() === 'SUN');
  const moon = input.planets.find(p => p.planet.toUpperCase() === 'MOON');
  const moonElongation = sun && moon ? ((moon.longitude - sun.longitude) % 360 + 360) % 360 : null;

  const strengthOf = (p: PlanetPosition, key: string) => {
    const dignity = getDignity(key, p.rashiIndex);
    const h = ((p.rashiIndex - asc + 12) % 12) + 1;
    const combustion = sun && key !== 'Sun'
      ? getCombustion(key, p.longitude, sun.longitude, p.isRetrograde, lang)
      : null;
    return {
      dignity,
      house: h,
      combustion,
      functional: getFunctionalNature(key, asc, lang),
      assessment: assessStrength({
        planet: key,
        dignity,
        moolatrikona: inMoolatrikona(key, p.rashiIndex, p.rashiDegree, dignity),
        dig: getDigBala(key, h, lang),
        functional: getFunctionalNature(key, asc, lang),
        isRetrograde: p.isRetrograde,
        combust: combustion?.isCombust ?? false,
        lang,
      }),
    };
  };

  const sa = strengthOf(first, aKey);
  const sb = strengthOf(second, bKey);
  const avgStrength = (sa.assessment.score + sb.assessment.score) / 2;

  const natureA = naturalNature(aKey, bKey, moonElongation);
  const natureB = naturalNature(bKey, aKey, moonElongation);

  // ── Combustion: only meaningful when the Sun itself is one of the pair ────
  let combustion: PlanetPairAnalysis['combustion'] = null;
  if (aKey === 'Sun' || bKey === 'Sun') {
    const burntKey = aKey === 'Sun' ? bKey : aKey;
    const burnt = aKey === 'Sun' ? second : first;
    const info = getCombustion(burntKey, burnt.longitude, aKey === 'Sun' ? first.longitude : second.longitude, burnt.isRetrograde, lang);
    if (info?.isCombust) {
      combustion = {
        planet: burntKey,
        separation: info.separation,
        limit: info.limit,
        text: PAIR_FRAMES.combust(planetName(burntKey, lang), info.separation, info.limit, lang),
      };
    }
  }
  const combustDepth = combustion ? Math.max(0, 1 - combustion.separation / combustion.limit) : 0;

  // ── Graha yuddha: within 1°, the more northerly planet wins ──────────────
  let grahaYuddha: PlanetPairAnalysis['grahaYuddha'] = null;
  if (orbBand === 'yuddha') {
    const aWins = (first.latitude ?? 0) >= (second.latitude ?? 0);
    const winner = aWins ? aKey : bKey;
    const loser = aWins ? bKey : aKey;
    grahaYuddha = {
      winner,
      loser,
      text: PAIR_FRAMES.yuddha(planetName(winner, lang), planetName(loser, lang), lang),
    };
  }

  const reading = getPairReading(aKey, bKey);
  const polarity = reading?.polarity ?? 0;

  // ── Harmony ──────────────────────────────────────────────────────────────
  let harmony = 0;
  harmony += relation === 'friend' ? 25 : relation === 'enemy' ? -25 : relation === 'mixed' ? -8 : 0;

  const benefics = [natureA, natureB].filter(n => n === 'benefic').length;
  const malefics = [natureA, natureB].filter(n => n === 'malefic').length;
  if (benefics === 2) harmony += 20;
  else if (malefics === 2) harmony -= 18;
  else if (benefics === 1 && malefics === 1) harmony -= 6;
  else if (benefics === 1) harmony += 10;
  else if (malefics === 1) harmony -= 8;

  harmony += ((sa.functional.score + sb.functional.score) / 2 - 0.5) * 40;
  harmony += ((DIGNITY_STRENGTH[sa.dignity] + DIGNITY_STRENGTH[sb.dignity]) / 2 - 0.5) * 30;
  harmony += polarity * 8;
  harmony -= combustDepth * 14;
  if (grahaYuddha) harmony -= 12;
  if (KENDRA_TRIKONA.has(house)) harmony += 6;
  if (DUSTHANA.has(house)) harmony -= 8;

  harmony *= 0.6 + 0.4 * (intensity / 100);
  harmony = Math.max(-100, Math.min(100, Math.round(harmony)));

  const verdict: PairVerdict =
    harmony >= 35 ? 'very-supportive' :
    harmony >= 12 ? 'supportive' :
    harmony > -12 ? 'mixed' :
    harmony > -35 ? 'straining' : 'difficult';

  // ── Power / drag, with the reasoning kept visible ─────────────────────────
  const powerFactors: PairFactor[] = [];
  const dragFactors: PairFactor[] = [];
  const addPower = (key: string, weight: number) => {
    if (weight > 0) powerFactors.push({ key, text: factorText(key, lang), weight });
  };
  const addDrag = (key: string, weight: number) => {
    if (weight > 0) dragFactors.push({ key, text: factorText(key, lang), weight });
  };

  let power = avgStrength * 0.45;
  if (relation === 'friend') { power += 14; addPower('friends', 14); }
  if (benefics === 2) { power += 14; addPower('bothBenefic', 14); }
  else if (benefics === 1) { power += 6; addPower('bothBenefic', 6); }

  const strongDignities = [sa.dignity, sb.dignity].filter(d => d === 'exalted' || d === 'own-sign').length;
  if (strongDignities > 0) { power += 7 * strongDignities; addPower('strongDignity', 7 * strongDignities); }

  const yogakarakas = [sa.functional, sb.functional].filter(f => f.isYogakaraka).length;
  if (yogakarakas > 0) { power += 9 * yogakarakas; addPower('yogakaraka', 9 * yogakarakas); }

  if (KENDRA_TRIKONA.has(house)) { power += 8; addPower('goodHouse', 8); }
  if (polarity > 0) { power += polarity * 6; addPower('auspicious', polarity * 6); }
  if (intensity >= 80) { power += 5; addPower('tightOrb', 5); }

  let drag = (100 - avgStrength) * 0.25;
  if (relation === 'enemy') { drag += 18; addDrag('enemies', 18); }
  else if (relation === 'mixed') { drag += 9; addDrag('mixedRel', 9); }
  if (malefics === 2) { drag += 16; addDrag('bothMalefic', 16); }
  else if (malefics === 1 && benefics === 1) { drag += 7; addDrag('mixedNature', 7); }

  const debilitated = [sa.dignity, sb.dignity].filter(d => d === 'debilitated').length;
  if (debilitated > 0) { drag += 11 * debilitated; addDrag('debilitated', 11 * debilitated); }
  const enemySigns = [sa.dignity, sb.dignity].filter(d => d === 'enemy-sign').length;
  if (enemySigns > 0) { drag += 5 * enemySigns; addDrag('weakDignity', 5 * enemySigns); }

  if (DUSTHANA.has(house)) { drag += 10; addDrag('hardHouse', 10); }
  const functionalMalefics = [sa.functional, sb.functional].filter(f => f.nature === 'malefic' || f.nature === 'maraka').length;
  if (functionalMalefics > 0) { drag += 7 * functionalMalefics; addDrag('functionalMalefic', 7 * functionalMalefics); }
  if (combustDepth > 0) { drag += 16 * combustDepth; addDrag('combust', 16 * combustDepth); }
  if (grahaYuddha) { drag += 12; addDrag('yuddha', 12); }
  if (polarity < 0) { drag += -polarity * 7; addDrag('inauspicious', -polarity * 7); }

  const malefRetro = (first.isRetrograde && natureA === 'malefic') || (second.isRetrograde && natureB === 'malefic');
  if (malefRetro) { drag += 4; addDrag('retrograde', 4); }
  if (intensity < 45) { drag *= 0.85; power *= 0.9; dragFactors.push({ key: 'wideOrb', text: factorText('wideOrb', lang), weight: 0 }); }

  power = Math.round(Math.max(5, Math.min(97, power * (0.7 + 0.3 * (intensity / 100)))));
  drag = Math.round(Math.max(4, Math.min(95, drag * (0.6 + 0.4 * (intensity / 100)))));
  powerFactors.sort((x, y) => y.weight - x.weight);
  dragFactors.sort((x, y) => y.weight - x.weight);

  // ── Which parts of life these two fuse ───────────────────────────────────
  const aRules = sa.functional.rulesHouses;
  const bRules = sb.functional.rulesHouses;
  let fusionText: string;
  if (aRules.length && bRules.length) {
    fusionText = PAIR_FRAMES.fusion(aName, ruledAreas(aRules, lang), bName, ruledAreas(bRules, lang), lang);
  } else if (aRules.length) {
    fusionText = PAIR_FRAMES.fusionShadow(aName, ruledAreas(aRules, lang), bName, lang);
  } else if (bRules.length) {
    fusionText = PAIR_FRAMES.fusionShadow(bName, ruledAreas(bRules, lang), aName, lang);
  } else {
    fusionText = PAIR_FRAMES.genericPlain(aName, bName, lang);
  }

  // ── Right now ────────────────────────────────────────────────────────────
  const nowInfo = computeNow(aKey, bKey, aName, bName, input.currentDasha ?? null, input.mahadashaTimeline ?? null, now, lang);

  // ── Across the life ──────────────────────────────────────────────────────
  const windows = computeWindows(aKey, bKey, input.mahadashaTimeline ?? null, now, lang);
  const ageA = MATURITY_AGE[aKey] ?? 30;
  const ageB = MATURITY_AGE[bKey] ?? 30;
  const [youngKey, youngAge, olderKey, olderAge] = ageA <= ageB
    ? [aKey, ageA, bKey, ageB]
    : [bKey, ageB, aKey, ageA];
  const maturityText = youngAge === olderAge
    ? PAIR_FRAMES.maturitySame(`${aName} & ${bName}`, olderAge, lang)
    : PAIR_FRAMES.maturity(planetName(youngKey, lang), youngAge, planetName(olderKey, lang), olderAge, lang);

  const currentAge = input.birthDate
    ? Math.floor((now.getTime() - new Date(input.birthDate).getTime()) / (365.25 * MS_PER_DAY))
    : null;

  return {
    a: first.planet,
    b: second.planet,
    aKey,
    bKey,
    house,
    separation,
    orbBand,
    orbLabel: pick(ORB_BAND_LABEL[orbBand], lang),
    orbText: pick(ORB_BAND_PLAIN[orbBand], lang),
    intensity,
    applying,
    relation,
    relationLabel: pick(RELATION_LABEL[relation], lang),
    harmony,
    verdict,
    verdictLabel: pick(VERDICT_LABEL[verdict], lang),
    name: reading ? pick(reading.name, lang) : `${aName} — ${bName}`,
    plain: reading ? pick(reading.plain, lang) : PAIR_FRAMES.genericPlain(aName, bName, lang),
    gift: reading ? pick(reading.gift, lang) : '',
    cost: reading ? pick(reading.cost, lang) : '',
    headline: PAIR_FRAMES.headline(aName, bName, separation, house, lang),
    orderText: PAIR_FRAMES.order(aName, bName, lang),
    motionText: PAIR_FRAMES.motion(applying, lang),
    fusionText,
    power,
    drag,
    powerFactors,
    dragFactors,
    combustion,
    grahaYuddha,
    now: nowInfo,
    lifetime: {
      summary: PAIR_FRAMES.lifetime(verdict, house, housePlain(house, lang), lang),
      maturityText,
      fullyOnAge: olderAge,
      currentAge,
      windows,
    },
    degrees: { a: first.rashiDegree, b: second.rashiDegree },
    retrograde: { a: first.isRetrograde, b: second.isRetrograde },
    dignity: { a: sa.dignity, b: sb.dignity },
    strength: { a: sa.assessment.score, b: sb.assessment.score },
  };
}

/** How much of the pair is switched on by the running dasha chain today. */
function computeNow(
  aKey: string,
  bKey: string,
  aName: string,
  bName: string,
  currentDasha: CurrentDasha | null,
  timeline: DashaPeriod[] | null,
  now: Date,
  lang: Lang,
): PairNow {
  const background = (): PairNow => ({
    level: 'background',
    label: pick(ACTIVATION_LABEL.background, lang),
    score: 15,
    text: PAIR_FRAMES.nowBackground(aName, bName, lang),
    windowEnd: null,
    nextText: nextPeakText(aKey, bKey, timeline, now, lang),
  });

  if (!currentDasha) return background();

  const chain: Array<{ lord: string; end: string; levelKey: 'maha' | 'antar' | 'praty' | 'sookshma'; weight: number }> = [
    { lord: currentDasha.mahadasha.lord, end: currentDasha.mahadasha.end, levelKey: 'maha', weight: 55 },
    { lord: currentDasha.antardasha.lord, end: currentDasha.antardasha.end, levelKey: 'antar', weight: 70 },
  ];
  if (currentDasha.pratyantardasha) {
    chain.push({ lord: currentDasha.pratyantardasha.lord, end: currentDasha.pratyantardasha.end, levelKey: 'praty', weight: 40 });
  }
  if (currentDasha.sookshmaDasha) {
    chain.push({ lord: currentDasha.sookshmaDasha.lord, end: currentDasha.sookshmaDasha.end, levelKey: 'sookshma', weight: 25 });
  }

  const hitA = chain.filter(c => c.lord === aKey);
  const hitB = chain.filter(c => c.lord === bKey);

  const levelName = (k: string) => {
    const en: Record<string, string> = { maha: 'main period', antar: 'sub-period', praty: 'sub-sub-period', sookshma: 'fine period' };
    const si: Record<string, string> = { maha: 'මහ දශාව', antar: 'අන්තර් දශාව', praty: 'ප්‍රත්‍යන්තර් දශාව', sookshma: 'සූක්ෂ්ම දශාව' };
    return lang === 'si' ? si[k] : en[k];
  };

  if (hitA.length && hitB.length) {
    const levels = new Set([...hitA, ...hitB].map(c => c.levelKey));
    const bothTop = levels.has('maha') && levels.has('antar');
    const innermost = [...hitA, ...hitB].sort(
      (x, y) => new Date(x.end).getTime() - new Date(y.end).getTime(),
    )[0];
    return {
      level: bothTop ? 'peak' : 'high',
      label: pick(ACTIVATION_LABEL[bothTop ? 'peak' : 'high'], lang),
      score: bothTop ? 100 : 85,
      text: PAIR_FRAMES.nowPeak(aName, bName, fmtDate(innermost.end, lang), lang),
      windowEnd: innermost.end,
      nextText: null,
    };
  }

  const single = [...hitA, ...hitB].sort((x, y) => y.weight - x.weight)[0];
  if (single) {
    const who = single.lord === aKey ? aName : bName;
    const score = single.weight;
    const level: ActivationLevel = score >= 70 ? 'high' : 'moderate';
    return {
      level,
      label: pick(ACTIVATION_LABEL[level], lang),
      score,
      text: PAIR_FRAMES.nowHigh(who, levelName(single.levelKey), fmtDate(single.end, lang), lang),
      windowEnd: single.end,
      nextText: nextPeakText(aKey, bKey, timeline, now, lang),
    };
  }

  return background();
}

/** All the windows where this pair runs together, plus each planet's own chapter. */
function computeWindows(
  aKey: string,
  bKey: string,
  timeline: DashaPeriod[] | null,
  now: Date,
  lang: Lang,
): PairWindow[] {
  if (!timeline?.length) return [];
  const out: PairWindow[] = [];

  for (const md of timeline) {
    if (md.lord !== aKey && md.lord !== bKey) continue;
    const other = md.lord === aKey ? bKey : aKey;

    const peak = antardashaWindow(md, other);
    if (peak) {
      out.push({
        label: periodLabel(md.lord, other, lang),
        start: peak.start.toISOString(),
        end: peak.end.toISOString(),
        state: stateOf(peak.start, peak.end, now),
        kind: 'peak',
      });
    }

    const mdStart = new Date(md.start);
    const mdEnd = new Date(md.end);
    out.push({
      label: periodLabel(md.lord, null, lang),
      start: md.start,
      end: md.end,
      state: stateOf(mdStart, mdEnd, now),
      kind: 'chapter',
    });
  }

  out.sort((x, y) => new Date(x.start).getTime() - new Date(y.start).getTime());
  return out;
}

function nextPeakText(
  aKey: string,
  bKey: string,
  timeline: DashaPeriod[] | null,
  now: Date,
  lang: Lang,
): string | null {
  if (!timeline?.length) return null;
  const peaks = computeWindows(aKey, bKey, timeline, now, lang).filter(w => w.kind === 'peak');
  const next = peaks.find(w => new Date(w.start).getTime() > now.getTime());
  if (!next) return null;
  return PAIR_FRAMES.nextWindow(next.label, fmtDate(next.start, lang), fmtDate(next.end, lang), lang);
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Every planet pair sharing the given house, strongest blend first.
 *
 * Returns an empty list when the house holds fewer than two planets — the panel
 * that renders this simply does not appear in that case.
 */
export function analyzeHousePairs(input: PairInput): HousePairsResult {
  const lang: Lang = input.lang ?? 'en';
  const rashiIndex = (input.ascendantRashiIndex + input.houseNumber - 1) % 12;
  const occupants = input.planets.filter(
    p => p.rashiIndex === rashiIndex && p.planet.toUpperCase() !== 'ASCENDANT',
  );

  // Ordered by position in the sign — the diagram reads left to right, and the
  // gaps below are between neighbours in that order.
  const ordered: HouseOccupant[] = [...occupants]
    .sort((p, q) => p.rashiDegree - q.rashiDegree)
    .map(p => ({ planet: p.planet, degreeInSign: p.rashiDegree, isRetrograde: p.isRetrograde }));

  const gaps = ordered.slice(1).map((p, i) => ({
    from: ordered[i].planet,
    to: p.planet,
    degrees: p.degreeInSign - ordered[i].degreeInSign,
  }));

  if (occupants.length < 2) {
    return { house: input.houseNumber, pairs: [], occupants: ordered, gaps: [], groupHeadline: null };
  }

  const pairs: PlanetPairAnalysis[] = [];
  for (let i = 0; i < occupants.length; i++) {
    for (let j = i + 1; j < occupants.length; j++) {
      pairs.push(analyzePair(occupants[i], occupants[j], input as PairInput & Required<Pick<PairInput, 'houseNumber' | 'ascendantRashiIndex' | 'planets'>>));
    }
  }
  pairs.sort((x, y) => y.intensity - x.intensity);

  return {
    house: input.houseNumber,
    pairs,
    occupants: ordered,
    gaps,
    groupHeadline: occupants.length >= 3
      ? PAIR_FRAMES.stellium(occupants.length, housePlain(input.houseNumber, lang), lang)
      : null,
  };
}

/**
 * Layer 3 — marriage promise. What each chart says about partnership before the
 * other person exists.
 *
 * This is the layer most commonly left out of matching engines, and classically
 * it outranks the guna count. Ashtakoot reads one variable, the Moon; none of the
 * things below are visible to it. A chart whose 7th lord is combust in the 8th
 * can score 32/36 against the right partner and still be the harder chart of the
 * two, and nothing in Layer 1 can say so.
 *
 * Two rules govern the output. Navamsa dignity of the 7th lord **outranks** its
 * rashi dignity — a D1-only reading is the most common error in the area. And no
 * total is emitted: five dimensions, each on a three-band scale, because summing
 * them would recreate exactly the scalar the engine exists to avoid.
 */

import { getDignity, getCombustion, RASHI_LORDS, type DignityLevel } from './planetaryAnalysis';
import { getNakshatra } from './nakshatra';
import { RASHIS, RASHI_ENGLISH } from './rashi';
import type { MatchInput } from './matching';

export type PromiseBand = 'supportive' | 'mixed' | 'testing';

export interface PromiseDimension {
  key: 'seventhHouse' | 'seventhLord' | 'karaka' | 'navamsa' | 'upapada';
  label: string;
  band: PromiseBand;
  /** What the chart says, with the reasoning visible. */
  notes: string[];
}

export interface Darakaraka {
  planet: string;
  /** Degree within its sign, the value the Jaimini ranking sorts on. */
  degree: number;
  rashi: number;
  /** D9 sign, when the navamsa is available. */
  d9Rashi: number | null;
}

export interface UpapadaLagna {
  /** The arudha pada of the 12th house. */
  rashi: number;
  lord: string;
  /** Sign of the 2nd from UL — marriage sustenance. */
  secondRashi: number;
  maleficsOnUL: string[];
  lordDignity: DignityLevel | null;
}

export interface MarriagePromise {
  dimensions: PromiseDimension[];
  seventhRashi: number;
  seventhLord: string;
  seventhLordHouse: number | null;
  seventhLordDignity: DignityLevel | null;
  seventhLordD9Dignity: DignityLevel | null;
  seventhLordCombust: boolean;
  seventhLordRetrograde: boolean;
  seventhLordNakshatraLord: string | null;
  darakaraka: Darakaraka | null;
  upapada: UpapadaLagna | null;
  /** Grahas holding own sign or exaltation in 2 or more of D1 / D9 / D30. */
  loadBearing: string[];
  vargottama: string[];
  /** Written synthesis. No score. */
  synthesis: string;
}

const MALEFICS = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];
const BENEFICS = ['Jupiter', 'Venus', 'Moon', 'Mercury'];

/** Jaimini chara-karaka set: the seven grahas plus Rahu. Ketu is excluded. */
const KARAKA_GRAHAS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu'];

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
}

const DIGNITY_WORD: Record<DignityLevel, string> = {
  'exalted': 'exalted', 'own-sign': 'in its own sign', 'friend-sign': 'in a friendly sign',
  'neutral-sign': 'in a neutral sign', 'enemy-sign': 'in an enemy sign', 'debilitated': 'debilitated',
};
const STRONG_DIGNITY = new Set<DignityLevel>(['exalted', 'own-sign']);
const WEAK_DIGNITY = new Set<DignityLevel>(['debilitated', 'enemy-sign']);

/**
 * Darakaraka — the significator of the spouse.
 *
 * Jaimini ranks the eight chara karakas by descending degree within sign; the
 * lowest is the Darakaraka. Rahu's degree is counted in reverse (30 − degree)
 * because it moves retrograde, which is the standard treatment and changes which
 * graha wins often enough to matter.
 */
export function findDarakaraka(m: MatchInput): Darakaraka | null {
  const lons = m.planetLongitudes;
  if (!lons) return null;

  let lowest: { planet: string; degree: number } | null = null;
  for (const planet of KARAKA_GRAHAS) {
    const lon = lons[planet];
    if (lon == null) continue;
    const raw = lon % 30;
    const degree = planet === 'Rahu' ? 30 - raw : raw;
    if (!lowest || degree < lowest.degree) lowest = { planet, degree };
  }
  if (!lowest) return null;

  const rashi = Math.floor((lons[lowest.planet] % 360) / 30);
  return {
    planet: lowest.planet,
    degree: lowest.degree,
    rashi,
    d9Rashi: m.d9Rashis?.[lowest.planet] ?? null,
  };
}

/**
 * Arudha pada of a house: count from the house to its lord, then the same
 * distance again from the lord. If the result lands on the house itself or the
 * 7th from it, the 10th from that is taken instead — the classical exception,
 * without which two of the twelve arudhas collapse onto their own house.
 */
export function arudhaPada(houseRashi: number, lordRashi: number): number {
  const distance = ((lordRashi - houseRashi + 12) % 12);
  const arudha = (lordRashi + distance) % 12;
  const isSelfOrSeventh = arudha === houseRashi || ((arudha - houseRashi + 12) % 12) === 6;
  return isSelfOrSeventh ? (arudha + 9) % 12 : arudha;
}

function computeUpapada(m: MatchInput): UpapadaLagna | null {
  const asc = m.ascendantRashi;
  const rashis = m.planetRashis;
  if (asc == null || !rashis) return null;

  const twelfthRashi = (asc + 11) % 12;
  const twelfthLord = RASHI_LORDS[twelfthRashi];
  const lordRashi = rashis[twelfthLord];
  if (lordRashi == null) return null;

  const ulRashi = arudhaPada(twelfthRashi, lordRashi);
  const ulLord = RASHI_LORDS[ulRashi];
  const ulLordRashi = rashis[ulLord];

  return {
    rashi: ulRashi,
    lord: ulLord,
    secondRashi: (ulRashi + 1) % 12,
    maleficsOnUL: Object.entries(rashis).filter(([p, r]) => r === ulRashi && MALEFICS.includes(p)).map(([p]) => p),
    lordDignity: ulLordRashi != null ? getDignity(ulLord, ulLordRashi) : null,
  };
}

function bandFromCounts(supportive: number, testing: number): PromiseBand {
  if (supportive > testing) return 'supportive';
  if (testing > supportive) return 'testing';
  return 'mixed';
}

/**
 * `femaleNativity` selects Jupiter as patikaraka (the significator of the
 * husband). It changes which karaka leads the reading, so it is an explicit
 * input rather than an inference.
 */
export function assessMarriagePromise(m: MatchInput, femaleNativity = false): MarriagePromise | null {
  const asc = m.ascendantRashi;
  const rashis = m.planetRashis;
  if (asc == null || !rashis) return null;

  const houseOf = (r: number) => ((r - asc + 12) % 12) + 1;
  const seventhRashi = (asc + 6) % 12;
  const seventhLord = RASHI_LORDS[seventhRashi];
  const lordRashi = rashis[seventhLord];
  const lons = m.planetLongitudes;

  // ── 7th house condition ──
  const occupants = Object.entries(rashis).filter(([, r]) => r === seventhRashi).map(([p]) => p);
  const beneficsIn = occupants.filter(p => BENEFICS.includes(p));
  const maleficsIn = occupants.filter(p => MALEFICS.includes(p));
  const seventhNotes: string[] = [];
  if (occupants.length === 0) {
    seventhNotes.push(
      `No graha occupies the 7th (${RASHI_ENGLISH[seventhRashi]}), which is the ordinary case — ` +
      `the house is read through its lord ${seventhLord} instead.`);
  } else {
    if (beneficsIn.length) {
      seventhNotes.push(`${beneficsIn.join(' and ')} in the 7th — a natural benefic there is protective of the partnership.`);
    }
    if (maleficsIn.length) {
      seventhNotes.push(`${maleficsIn.join(' and ')} in the 7th — the partnership asks more, and often indicates a partner with a strong will.`);
    }
  }
  // The 2nd and 8th bear on the household and on the union's longevity.
  const secondOccupants = Object.entries(rashis).filter(([, r]) => houseOf(r) === 2).map(([p]) => p);
  const eighthMalefics = Object.entries(rashis)
    .filter(([p, r]) => houseOf(r) === 8 && MALEFICS.includes(p)).map(([p]) => p);
  if (eighthMalefics.length) {
    seventhNotes.push(`${eighthMalefics.join(' and ')} in the 8th (mangalya) — the sustaining of the union is under some pressure.`);
  }
  if (secondOccupants.length) {
    seventhNotes.push(`The 2nd (kutumba, family sustenance) carries ${secondOccupants.join(', ')}.`);
  }
  const seventhBand = bandFromCounts(beneficsIn.length, maleficsIn.length + eighthMalefics.length * 0.5);

  // ── 7th lord condition ──
  const seventhLordDignity = lordRashi != null ? getDignity(seventhLord, lordRashi) : null;
  const seventhLordHouse = lordRashi != null ? houseOf(lordRashi) : null;
  const retro = m.planetRetro?.[seventhLord] ?? false;
  const combustion = lons?.[seventhLord] != null && lons?.Sun != null
    ? getCombustion(seventhLord, lons[seventhLord], lons.Sun, retro)
    : null;
  const combust = combustion?.isCombust ?? false;
  const nakLord = lons?.[seventhLord] != null ? getNakshatra(lons[seventhLord]).lord : null;

  const lordNotes: string[] = [];
  if (seventhLordDignity && seventhLordHouse) {
    lordNotes.push(
      `${seventhLord} rules the 7th and sits ${DIGNITY_WORD[seventhLordDignity]} in the ${ordinal(seventhLordHouse)}.` +
      (nakLord ? ` Its nakshatra lord is ${nakLord}.` : ''));
  }
  if (combust) {
    lordNotes.push(
      `${seventhLord} is combust — ${combustion!.separation.toFixed(2)}° from the Sun, inside the ${combustion!.limit}° orb. ` +
      'A combust 7th lord materially changes the reading and is invisible to guna matching.');
  }
  if (retro) lordNotes.push(`${seventhLord} is retrograde, so partnership matters arrive by revision and second attempts.`);
  if (seventhLordHouse && [6, 8, 12].includes(seventhLordHouse)) {
    lordNotes.push(`The 7th lord in the ${ordinal(seventhLordHouse)} is a dusthana placement — results delayed, hidden, or reached indirectly.`);
  }
  const lordSupport = (seventhLordDignity && STRONG_DIGNITY.has(seventhLordDignity) ? 1 : 0)
    + (seventhLordHouse && [1, 4, 5, 7, 9, 10, 11].includes(seventhLordHouse) ? 1 : 0);
  const lordTesting = (seventhLordDignity && WEAK_DIGNITY.has(seventhLordDignity) ? 1 : 0)
    + (combust ? 1 : 0) + (seventhLordHouse && [6, 8, 12].includes(seventhLordHouse) ? 1 : 0);
  const lordBand = bandFromCounts(lordSupport, lordTesting);

  // ── Karaka condition (Venus always; Jupiter as patikaraka for a female chart) ──
  const karakaNotes: string[] = [];
  let karakaSupport = 0, karakaTesting = 0;
  for (const karaka of femaleNativity ? ['Venus', 'Jupiter'] : ['Venus']) {
    const r = rashis[karaka];
    if (r == null) continue;
    const dignity = getDignity(karaka, r);
    const kRetro = m.planetRetro?.[karaka] ?? false;
    const kComb = lons?.[karaka] != null && lons?.Sun != null
      ? getCombustion(karaka, lons[karaka], lons.Sun, kRetro) : null;
    const role = karaka === 'Jupiter' ? 'patikaraka (the husband)' : 'the significator of marriage';
    karakaNotes.push(
      `${karaka}, ${role}, is ${DIGNITY_WORD[dignity]} in the ${ordinal(houseOf(r))}.` +
      (kComb?.isCombust ? ` It is combust at ${kComb.separation.toFixed(2)}° from the Sun.` : ''));
    if (STRONG_DIGNITY.has(dignity)) karakaSupport++;
    if (WEAK_DIGNITY.has(dignity)) karakaTesting++;
    if (kComb?.isCombust) karakaTesting++;
  }
  const dk = findDarakaraka(m);
  if (dk) {
    karakaNotes.push(
      `Darakaraka (Jaimini significator of the spouse) is ${dk.planet} at ${dk.degree.toFixed(2)}° of ${RASHIS[dk.rashi]}` +
      (dk.d9Rashi != null ? `, in ${RASHIS[dk.d9Rashi]} in the navamsa.` : '.'));
  }
  const karakaBand = bandFromCounts(karakaSupport, karakaTesting);

  // ── D9 confirmation ──
  // Navamsa dignity of the 7th lord outranks its rashi dignity for marriage.
  const d9 = m.d9Rashis;
  const d9Asc = m.d9Ascendant;
  const seventhLordD9 = d9?.[seventhLord];
  const seventhLordD9Dignity = seventhLordD9 != null ? getDignity(seventhLord, seventhLordD9) : null;
  const navamsaNotes: string[] = [];
  let navSupport = 0, navTesting = 0;

  if (d9Asc != null) {
    const d9Lord = RASHI_LORDS[d9Asc];
    const d9LordD9 = d9?.[d9Lord];
    const d9LordDignity = d9LordD9 != null ? getDignity(d9Lord, d9LordD9) : null;
    navamsaNotes.push(
      `The navamsa rises in ${RASHI_ENGLISH[d9Asc]}, ruled by ${d9Lord}` +
      (d9LordDignity ? `, which is ${DIGNITY_WORD[d9LordDignity]} in the navamsa.` : '.'));
    if (d9LordDignity && STRONG_DIGNITY.has(d9LordDignity)) navSupport++;
    if (d9LordDignity && WEAK_DIGNITY.has(d9LordDignity)) navTesting++;
  }
  if (seventhLordD9Dignity) {
    navamsaNotes.push(
      `The 7th lord ${seventhLord} is ${DIGNITY_WORD[seventhLordD9Dignity]} in the navamsa. ` +
      'This outranks its rashi-chart dignity for marriage.');
    // Weighted double, because it is the decisive factor in this dimension.
    if (STRONG_DIGNITY.has(seventhLordD9Dignity)) navSupport += 2;
    if (WEAK_DIGNITY.has(seventhLordD9Dignity)) navTesting += 2;
  }
  const venusD9 = d9?.Venus;
  if (venusD9 != null) {
    const vd = getDignity('Venus', venusD9);
    navamsaNotes.push(`Venus is ${DIGNITY_WORD[vd]} in the navamsa.`);
    if (STRONG_DIGNITY.has(vd)) navSupport++;
    if (WEAK_DIGNITY.has(vd)) navTesting++;
  }

  // Vargottama and cross-varga repetition. A graha holding its own sign or
  // exaltation across D1, D9 and D30 is load bearing regardless of a weak D1.
  const vargottama: string[] = [];
  const loadBearing: string[] = [];
  if (d9) {
    for (const planet of Object.keys(rashis)) {
      if (d9[planet] === rashis[planet]) vargottama.push(planet);
      const holds = [rashis[planet], d9[planet], m.d30Rashis?.[planet]]
        .filter((r): r is number => r != null)
        .filter(r => STRONG_DIGNITY.has(getDignity(planet, r))).length;
      if (holds >= 2) loadBearing.push(planet);
    }
  }
  if (vargottama.includes(seventhLord)) {
    navamsaNotes.push(`${seventhLord} is vargottama — the same sign in D1 and D9. A vargottama 7th lord is a strong stabiliser.`);
    navSupport += 2;
  }
  if (loadBearing.length) {
    navamsaNotes.push(
      `${loadBearing.join(', ')} ${loadBearing.length > 1 ? 'hold' : 'holds'} own sign or exaltation ` +
      'across two or more of D1, D9 and D30 — ' +
      'structurally load bearing whatever the rashi chart shows.');
  }
  const navamsaBand = bandFromCounts(navSupport, navTesting);

  // ── Upapada Lagna ──
  const upapada = computeUpapada(m);
  const ulNotes: string[] = [];
  let ulSupport = 0, ulTesting = 0;
  if (upapada) {
    ulNotes.push(
      `Upapada Lagna (arudha of the 12th) falls in ${RASHI_ENGLISH[upapada.rashi]}, ruled by ${upapada.lord}. ` +
      'UL reads the institution of marriage, as distinct from the relationship itself.');
    if (upapada.maleficsOnUL.length) {
      ulNotes.push(`${upapada.maleficsOnUL.join(' and ')} sit on the UL — strain in the standing of the marriage.`);
      ulTesting++;
    }
    if (upapada.lordDignity) {
      ulNotes.push(`The UL lord ${upapada.lord} is ${DIGNITY_WORD[upapada.lordDignity]}.`);
      if (STRONG_DIGNITY.has(upapada.lordDignity)) ulSupport++;
      if (WEAK_DIGNITY.has(upapada.lordDignity)) ulTesting++;
    }
    ulNotes.push(`The 2nd from UL (${RASHI_ENGLISH[upapada.secondRashi]}) carries marriage sustenance.`);
  }
  const upapadaBand = bandFromCounts(ulSupport, ulTesting);

  const dimensions: PromiseDimension[] = [
    { key: 'seventhHouse', label: '7th house condition', band: seventhBand, notes: seventhNotes },
    { key: 'seventhLord', label: '7th lord condition', band: lordBand, notes: lordNotes },
    { key: 'karaka', label: 'Karaka condition', band: karakaBand, notes: karakaNotes },
    { key: 'navamsa', label: 'Navamsa confirmation', band: navamsaBand, notes: navamsaNotes },
    { key: 'upapada', label: 'Upapada (the institution)', band: upapadaBand, notes: ulNotes },
  ];

  const testingCount = dimensions.filter(d => d.band === 'testing').length;
  const supportiveCount = dimensions.filter(d => d.band === 'supportive').length;
  const synthesis =
    supportiveCount > testingCount
      ? `This chart is well disposed to partnership on ${supportiveCount} of five dimensions. ` +
        'The promise is there; what a specific pairing does with it is Layer 4’s question.'
      : testingCount > supportiveCount
        ? `This chart asks more of partnership, testing on ${testingCount} of five dimensions` +
          (seventhLordD9Dignity && STRONG_DIGNITY.has(seventhLordD9Dignity)
            ? ' — though the navamsa 7th lord is a real mitigant, and it outranks the rashi reading.'
            : '. Read the dimensions rather than the count: which one is weak decides what to expect.')
        : 'This chart is balanced on partnership — neither an easy promise nor an afflicted one.';

  return {
    dimensions,
    seventhRashi, seventhLord, seventhLordHouse, seventhLordDignity, seventhLordD9Dignity,
    seventhLordCombust: combust, seventhLordRetrograde: retro, seventhLordNakshatraLord: nakLord,
    darakaraka: dk, upapada, loadBearing, vargottama, synthesis,
  };
}

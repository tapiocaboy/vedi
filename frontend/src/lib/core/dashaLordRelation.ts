/**
 * Classical relations between running dasha lords, and between a lord and the
 * houses it touches — the rules a Jyotishi reads before anything else when
 * judging a Mahadasha–Antardasha pair.
 *
 *   • Naisargika maitri (natural friendship). An antardasha lord that is a
 *     natural friend of the mahadasha lord cooperates with it; an enemy pulls
 *     against the grain of the period. (BPHS Ch. 3; Phaladeepika 20.)
 *   • Mutual placement. The two lords' spacing in the natal chart colours the
 *     sub-period: trine (5/9) is the most harmonious, 6/8 (shadashtaka) and
 *     2/12 (dwirdwadasa) are the classical stress spacings, 1/7 (samasaptaka)
 *     is a standoff, 4/10 (mutual kendra) is active and eventful.
 *   • House class. Kendra (1,4,7,10) is a platform, trikona (5,9) is auspicious,
 *     dusthana (6,8,12) brings friction, upachaya (3,11 — 6 and 10 are taken by
 *     the classes above) improves with time.
 *   • Graha drishti. Whole-sign aspects: every planet sees the 7th; Mars also
 *     the 4th and 8th, Jupiter the 5th and 9th, Saturn the 3rd and 10th.
 *
 * Pure functions over rashi indices (0 = Mesha … 11 = Meena) and title-case
 * planet names, so the UI and the tests can share them.
 */

import { PLANETARY_RELATIONSHIPS } from './predictions';
import { aspectsRashi } from './natalFoundation';

export type Maitri = 'friend' | 'neutral' | 'enemy';

export type MutualPlacement =
  | 'conjunct'      // 1/1
  | 'samasaptaka'   // 1/7
  | 'trine'         // 5/9
  | 'kendra'        // 4/10
  | 'shadashtaka'   // 6/8
  | 'dwirdwadasa'   // 2/12
  | 'growth';       // 3/11

export type HouseClass = 'kendra' | 'trikona' | 'dusthana' | 'upachaya' | 'other';

export type PairVerdict = 'good' | 'mixed' | 'bad';

export interface LordPairJudgement {
  maitri: Maitri;
  placement: MutualPlacement;
  /** Houses from the mahadasha lord to the antardasha lord, 1–12. */
  distance: number;
  verdict: PairVerdict;
}

const title = (p: string) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();

/**
 * Natural friendship as `from` regards `to`. The classical table is asymmetric
 * (Saturn calls Mercury a friend; Mercury calls Saturn neutral), and the dasha
 * rule is read from the mahadasha lord's side — "if the antardasha lord is a
 * friend of the dasha lord…" — so callers pass the mahadasha lord first.
 */
export function naturalRelation(from: string, to: string): Maitri {
  if (title(from) === title(to)) return 'friend';
  const rel = PLANETARY_RELATIONSHIPS[title(from)];
  if (!rel) return 'neutral';
  if (rel.friends?.includes(title(to))) return 'friend';
  if (rel.enemies?.includes(title(to))) return 'enemy';
  return 'neutral';
}

/** Houses counted from rashi `a` to rashi `b`, inclusive (1–12). */
export function housesApart(a: number, b: number): number {
  return ((b - a + 12) % 12) + 1;
}

export function mutualPlacement(rashiA: number, rashiB: number): MutualPlacement {
  const d = housesApart(rashiA, rashiB);
  if (d === 1) return 'conjunct';
  if (d === 7) return 'samasaptaka';
  if (d === 5 || d === 9) return 'trine';
  if (d === 4 || d === 10) return 'kendra';
  if (d === 6 || d === 8) return 'shadashtaka';
  if (d === 2 || d === 12) return 'dwirdwadasa';
  return 'growth';
}

const MAITRI_SCORE: Record<Maitri, number> = { friend: 1, neutral: 0, enemy: -1 };
const PLACEMENT_SCORE: Record<MutualPlacement, number> = {
  trine: 1, kendra: 0.5, growth: 0.5, conjunct: 0.5, samasaptaka: 0, shadashtaka: -1, dwirdwadasa: -1,
};

/**
 * Judge a Mahadasha–Antardasha pair from friendship and mutual placement.
 * When the lords are the same planet (Saturn–Saturn), the placement is
 * conjunct and the verdict rests on friendship alone (always 'friend').
 */
export function judgeLordPair(mdLord: string, adLord: string, mdRashi: number, adRashi: number): LordPairJudgement {
  const maitri = naturalRelation(mdLord, adLord);
  const placement = mutualPlacement(mdRashi, adRashi);
  const score = MAITRI_SCORE[maitri] + PLACEMENT_SCORE[placement];
  const verdict: PairVerdict = score >= 1 ? 'good' : score <= -1 ? 'bad' : 'mixed';
  return { maitri, placement, distance: housesApart(mdRashi, adRashi), verdict };
}

/** Whole-sign house (1–12) of a rashi for the given ascendant rashi. */
export function houseOfRashi(rashi: number, ascendantRashi: number): number {
  return ((rashi - ascendantRashi + 12) % 12) + 1;
}

/** Rashi (0–11) that falls in house `house` for the given ascendant. */
export function rashiOfHouse(house: number, ascendantRashi: number): number {
  return (ascendantRashi + house - 1) % 12;
}

/**
 * Bhava class. Where a house belongs to more than one classical group (the 6th
 * is both dusthana and upachaya, the 10th both kendra and upachaya), the group
 * that matters more for judging a period wins.
 */
export function houseClass(house: number): HouseClass {
  if (house === 6 || house === 8 || house === 12) return 'dusthana';
  if (house === 1 || house === 4 || house === 7 || house === 10) return 'kendra';
  if (house === 5 || house === 9) return 'trikona';
  if (house === 3 || house === 11) return 'upachaya';
  return 'other';
}

/** Houses (1–12) that `planet`, sitting in `planetRashi`, aspects by graha drishti. */
export function aspectedHouses(planet: string, planetRashi: number, ascendantRashi: number): number[] {
  const out: number[] = [];
  for (let h = 1; h <= 12; h++) {
    if (aspectsRashi(title(planet), planetRashi, rashiOfHouse(h, ascendantRashi))) out.push(h);
  }
  return out;
}

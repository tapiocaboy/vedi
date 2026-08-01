/**
 * The dasa-porutham checks that Ashtakoot does not cover.
 *
 * The North Indian 36-point count and the South Indian / Sri Lankan ten-porutham
 * system overlap on most checks (Dina≈Tara, Gana, Yoni, Rasi≈Bhakoot,
 * Rasyadhipati≈Graha Maitri), but four poruthams have no Ashtakoot equivalent —
 * and one of them, Rajju, is the check a traditional matcher in that tradition
 * reads *first*, before any point total. An engine that reports 30/36 while both
 * Moons sit in the same rajju is, to that reader, reporting the wrong verdict.
 *
 * All four are pure nakshatra-table checks, computed girl→boy where directional
 * (Mahendra and Stree-Deergha count from the girl's star; Rajju and Vedha are
 * symmetric). Like the kootas, each check states its reasoning in plain words —
 * these strings are read by people who have never heard the word "porutham".
 */

import { NAKSHATRAS } from './nakshatra';

export type PoruthamKey = 'rajju' | 'vedha' | 'mahendra' | 'streeDeergha';

export interface PoruthamCheck {
  key: PoruthamKey;
  name: string;
  passed: boolean;
  /** True for the half-pass band (only Stree-Deergha has one). */
  partial: boolean;
  /** How much a traditional matcher weighs this check. */
  importance: 'critical' | 'supportive';
  reason: string;
  detail: Record<string, string | number | boolean>;
}

export interface PoruthamResult {
  checks: PoruthamCheck[];
  /** True when Rajju fails — the one result tradition treats as a stop sign. */
  rajjuFailed: boolean;
}

// ─── Rajju ───────────────────────────────────────────────────────────────────
//
// The 27 nakshatras divide into five rajjus ("ropes"), named for parts of the
// body. Two Moons on the same rope is Rajju dosha; the afflicted body part names
// what tradition says the marriage wears down. Different ropes pass — that is
// the whole check.

type Rajju = 'Pada' | 'Kati' | 'Nabhi' | 'Kantha' | 'Siro';

const RAJJU_OF: Rajju[] = [
  'Pada',   // 0  Ashwini
  'Kati',   // 1  Bharani
  'Nabhi',  // 2  Krittika
  'Kantha', // 3  Rohini
  'Siro',   // 4  Mrigashira
  'Kantha', // 5  Ardra
  'Nabhi',  // 6  Punarvasu
  'Kati',   // 7  Pushya
  'Pada',   // 8  Ashlesha
  'Pada',   // 9  Magha
  'Kati',   // 10 Purva Phalguni
  'Nabhi',  // 11 Uttara Phalguni
  'Kantha', // 12 Hasta
  'Siro',   // 13 Chitra
  'Kantha', // 14 Swati
  'Nabhi',  // 15 Vishakha
  'Kati',   // 16 Anuradha
  'Pada',   // 17 Jyeshtha
  'Pada',   // 18 Mula
  'Kati',   // 19 Purva Ashadha
  'Nabhi',  // 20 Uttara Ashadha
  'Kantha', // 21 Shravana
  'Siro',   // 22 Dhanishta
  'Kantha', // 23 Shatabhisha
  'Nabhi',  // 24 Purva Bhadrapada
  'Kati',   // 25 Uttara Bhadrapada
  'Pada',   // 26 Revati
];

/** What sharing each rope is classically read as straining. */
const RAJJU_STRAIN: Record<Rajju, string> = {
  Siro:   'the head rope — read as the hardest to share, touching the husband’s wellbeing',
  Kantha: 'the neck rope — read as touching the wife’s wellbeing',
  Nabhi:  'the navel rope — read as touching children',
  Kati:   'the waist rope — read as touching material stability',
  Pada:   'the foot rope — read as a restless, unsettled household',
};

// ─── Vedha ───────────────────────────────────────────────────────────────────
//
// Certain star pairs "pierce" each other. Twelve fixed pairs, plus one group of
// three (Mrigashira, Chitra, Dhanishta) that mutually obstruct. The same star
// twice is not vedha.

const VEDHA_PAIR: Array<[number, number]> = [
  [0, 17],  // Ashwini – Jyeshtha
  [1, 16],  // Bharani – Anuradha
  [2, 15],  // Krittika – Vishakha
  [3, 14],  // Rohini – Swati
  [5, 21],  // Ardra – Shravana
  [6, 20],  // Punarvasu – Uttara Ashadha
  [7, 19],  // Pushya – Purva Ashadha
  [8, 18],  // Ashlesha – Mula
  [9, 26],  // Magha – Revati
  [10, 25], // Purva Phalguni – Uttara Bhadrapada
  [11, 24], // Uttara Phalguni – Purva Bhadrapada
  [12, 23], // Hasta – Shatabhisha
];
const VEDHA_TRIO = new Set([4, 13, 22]); // Mrigashira, Chitra, Dhanishta

function isVedha(a: number, b: number): boolean {
  if (a === b) return false;
  if (VEDHA_TRIO.has(a) && VEDHA_TRIO.has(b)) return true;
  return VEDHA_PAIR.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
}

// ─── Counts from the girl's star ─────────────────────────────────────────────

/** Inclusive count from `from` to `to`, 1–27. */
function starCount(from: number, to: number): number {
  return ((to - from + 27) % 27) + 1;
}

/** The counts Mahendra names as protective. */
const MAHENDRA_COUNTS = new Set([4, 7, 10, 13, 16, 19, 22, 25]);

// ─── Entry point ─────────────────────────────────────────────────────────────

const starName = (i: number) => NAKSHATRAS[i][0];

/**
 * `girlNakshatra` / `boyNakshatra` are the directional roles the counting
 * checks are written for, same convention as the asymmetric kootas.
 */
export function computePoruthams(girlNakshatra: number, boyNakshatra: number): PoruthamResult {
  const checks: PoruthamCheck[] = [];
  const g = starName(girlNakshatra);
  const b = starName(boyNakshatra);

  // Rajju — same rope fails, different ropes pass.
  const rajjuG = RAJJU_OF[girlNakshatra];
  const rajjuB = RAJJU_OF[boyNakshatra];
  const rajjuPassed = rajjuG !== rajjuB;
  checks.push({
    key: 'rajju',
    name: 'Rajju',
    passed: rajjuPassed,
    partial: false,
    importance: 'critical',
    detail: { girlRajju: rajjuG, boyRajju: rajjuB },
    reason: rajjuPassed
      ? `The birth stars sit on different body ropes (${rajjuG} and ${rajjuB}), which is what this check asks for. In the Southern tradition this is the first thing a matcher verifies.`
      : `Both birth stars sit on ${RAJJU_STRAIN[rajjuG]}. Traditional matchers treat a shared rope as a serious warning regardless of how many points the pair scores elsewhere.`,
  });

  // Vedha — the pair must not pierce each other.
  const vedha = isVedha(girlNakshatra, boyNakshatra);
  checks.push({
    key: 'vedha',
    name: 'Vedha',
    passed: !vedha,
    partial: false,
    importance: 'critical',
    detail: { girlStar: g, boyStar: b },
    reason: vedha
      ? `${g} and ${b} are a vedha (obstruction) pair — stars the tradition says work against each other, each blocking what the other builds.`
      : `${g} and ${b} are not an obstruction pair — neither star blocks the other.`,
  });

  // Mahendra — counted from the girl's star to the boy's.
  const count = starCount(girlNakshatra, boyNakshatra);
  const mahendra = MAHENDRA_COUNTS.has(count);
  checks.push({
    key: 'mahendra',
    name: 'Mahendra',
    passed: mahendra,
    partial: false,
    importance: 'supportive',
    detail: { count },
    reason: mahendra
      ? `Counting from ${g} to ${b} gives ${count} — one of the protective counts. Read as supporting the family line and the couple standing up for each other.`
      : `Counting from ${g} to ${b} gives ${count}, which is not one of the eight protective counts. A miss here is common and is not read as a warning on its own.`,
  });

  // Stree-Deergha — the same count, wanting distance. Above 13 is the full
  // pass; 9–13 is the concession several authorities allow; below 9 fails.
  const full = count > 13;
  const partial = !full && count >= 9;
  checks.push({
    key: 'streeDeergha',
    name: 'Stree Deergha',
    passed: full || partial,
    partial,
    importance: 'supportive',
    detail: { count },
    reason: full
      ? `The star count (${count}) exceeds 13 — the full pass. Read as the marriage giving the wife room to flourish.`
      : partial
        ? `The star count (${count}) sits in the 9–13 band — a partial pass most authorities accept.`
        : `The star count (${count}) falls below 9. Classically read as the marriage keeping the wife’s life smaller than it should be.`,
  });

  return { checks, rajjuFailed: !rajjuPassed };
}

/**
 * Yoni koota reference data — versioned, with per-cell provenance.
 *
 * The 27 nakshatra→yoni assignments and the seven "bitter enemy" pairs are
 * stable across the classical sources. The remaining cells of the 14×14 matrix
 * are not: authorities disagree meaningfully on which cross-species pairs count
 * as friendly, neutral or merely inimical, and picking one silently would
 * present a choice as a fact.
 *
 * So every cell carries its provenance. `attested` cells are transcribed from
 * the agreed material. `derived` cells come from the stated class rule below and
 * are marked as such, so a project that wants a specific edition's table can
 * replace DERIVED_FRIENDLY / DERIVED_INIMICAL without touching any scoring code
 * and without having to work out which cells were real to begin with.
 *
 * Derivation rule for the intermediate cells:
 *
 *   friendly (3) — the two yonis belong to the same natural group (both bovine,
 *                  both feline, both mounts, both docile grazers). Classical
 *                  commentary consistently reads same-group pairs as easy.
 *   inimical (1) — a direct predator/prey relationship that is not already one
 *                  of the seven attested bitter pairs.
 *   neutral  (2) — everything else. This is the deliberate default: absent a
 *                  positive reason to score a pair up or down, neutral is the
 *                  honest answer rather than the average of two guesses.
 *
 * DATA VERSION: bump on any change to the tables below, because match results
 * are not comparable across versions.
 */

export const YONI_DATA_VERSION = '1.0.0';

export type Yoni =
  | 'Ashwa' | 'Gaja' | 'Mesha' | 'Sarpa' | 'Shwan' | 'Marjara' | 'Mushaka'
  | 'Gau' | 'Mahisha' | 'Vyaghra' | 'Mriga' | 'Vanara' | 'Nakula' | 'Simha';

export type YoniGender = 'M' | 'F';

/** Plain-English gloss, for prose that should not assume Sanskrit. */
export const YONI_ANIMAL: Record<Yoni, string> = {
  Ashwa: 'horse', Gaja: 'elephant', Mesha: 'sheep', Sarpa: 'serpent',
  Shwan: 'dog', Marjara: 'cat', Mushaka: 'rat', Gau: 'cow',
  Mahisha: 'buffalo', Vyaghra: 'tiger', Mriga: 'deer', Vanara: 'monkey',
  Nakula: 'mongoose', Simha: 'lion',
};

/**
 * Nakshatra index (0–26) → yoni and its gender. Attested; agreed across sources.
 * Order follows Ashwini … Revati.
 */
export const NAKSHATRA_YONI: ReadonlyArray<{ yoni: Yoni; gender: YoniGender }> = [
  { yoni: 'Ashwa',   gender: 'M' },  //  0 Ashwini
  { yoni: 'Gaja',    gender: 'M' },  //  1 Bharani
  { yoni: 'Mesha',   gender: 'F' },  //  2 Krittika
  { yoni: 'Sarpa',   gender: 'M' },  //  3 Rohini
  { yoni: 'Sarpa',   gender: 'F' },  //  4 Mrigashira
  { yoni: 'Shwan',   gender: 'F' },  //  5 Ardra
  { yoni: 'Marjara', gender: 'F' },  //  6 Punarvasu
  { yoni: 'Mesha',   gender: 'M' },  //  7 Pushya
  { yoni: 'Marjara', gender: 'M' },  //  8 Ashlesha
  { yoni: 'Mushaka', gender: 'M' },  //  9 Magha
  { yoni: 'Mushaka', gender: 'F' },  // 10 Purva Phalguni
  { yoni: 'Gau',     gender: 'M' },  // 11 Uttara Phalguni
  { yoni: 'Mahisha', gender: 'F' },  // 12 Hasta
  { yoni: 'Vyaghra', gender: 'F' },  // 13 Chitra
  { yoni: 'Mahisha', gender: 'M' },  // 14 Swati
  { yoni: 'Vyaghra', gender: 'M' },  // 15 Vishakha
  { yoni: 'Mriga',   gender: 'F' },  // 16 Anuradha
  { yoni: 'Mriga',   gender: 'M' },  // 17 Jyeshtha
  { yoni: 'Shwan',   gender: 'M' },  // 18 Mula
  { yoni: 'Vanara',  gender: 'M' },  // 19 Purva Ashadha
  { yoni: 'Nakula',  gender: 'M' },  // 20 Uttara Ashadha
  { yoni: 'Vanara',  gender: 'F' },  // 21 Shravana
  { yoni: 'Simha',   gender: 'F' },  // 22 Dhanishta
  { yoni: 'Ashwa',   gender: 'F' },  // 23 Shatabhisha
  { yoni: 'Simha',   gender: 'M' },  // 24 Purva Bhadrapada
  { yoni: 'Gau',     gender: 'F' },  // 25 Uttara Bhadrapada
  { yoni: 'Gaja',    gender: 'F' },  // 26 Revati
];

/**
 * Bitter enemies — score 0. ATTESTED: the spec notes these seven as
 * "well attested across sources", and they are the only cells the classical
 * material agrees on beyond the diagonal.
 */
export const ATTESTED_BITTER: ReadonlyArray<readonly [Yoni, Yoni]> = [
  ['Gau', 'Vyaghra'],
  ['Gaja', 'Simha'],
  ['Ashwa', 'Mahisha'],
  ['Shwan', 'Mriga'],
  ['Sarpa', 'Nakula'],
  ['Vanara', 'Mesha'],
  ['Marjara', 'Mushaka'],
];

/**
 * DERIVED (same natural group) — score 3. Replace wholesale if you adopt a
 * cited edition's table; nothing else depends on the contents.
 */
export const DERIVED_FRIENDLY: ReadonlyArray<readonly [Yoni, Yoni]> = [
  ['Gau', 'Mahisha'],      // bovines
  ['Simha', 'Vyaghra'],    // great cats
  ['Marjara', 'Vyaghra'],  // felines
  ['Marjara', 'Simha'],    // felines
  ['Ashwa', 'Gaja'],       // large domesticated mounts
  ['Mriga', 'Mesha'],      // docile grazers
];

/**
 * DERIVED (direct predator/prey, excluding the attested bitter pairs) — score 1.
 */
export const DERIVED_INIMICAL: ReadonlyArray<readonly [Yoni, Yoni]> = [
  ['Simha', 'Mriga'],
  ['Simha', 'Mesha'],
  ['Simha', 'Gau'],
  ['Simha', 'Mahisha'],
  ['Vyaghra', 'Mriga'],
  ['Vyaghra', 'Mesha'],
  ['Vyaghra', 'Mahisha'],
  ['Shwan', 'Mesha'],
  ['Shwan', 'Mushaka'],
  ['Marjara', 'Sarpa'],
  ['Sarpa', 'Mushaka'],
];

export type YoniProvenance = 'attested' | 'derived';

export interface YoniCell {
  score: 0 | 1 | 2 | 3 | 4;
  band: 'identical' | 'friendly' | 'neutral' | 'inimical' | 'bitter';
  provenance: YoniProvenance;
}

function key(a: Yoni, b: Yoni): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

const CELLS = new Map<string, YoniCell>();
for (const [a, b] of ATTESTED_BITTER) {
  CELLS.set(key(a, b), { score: 0, band: 'bitter', provenance: 'attested' });
}
for (const [a, b] of DERIVED_FRIENDLY) {
  // Attested cells win: a pair named as a bitter enemy is never re-scored up.
  if (!CELLS.has(key(a, b))) CELLS.set(key(a, b), { score: 3, band: 'friendly', provenance: 'derived' });
}
for (const [a, b] of DERIVED_INIMICAL) {
  if (!CELLS.has(key(a, b))) CELLS.set(key(a, b), { score: 1, band: 'inimical', provenance: 'derived' });
}

/**
 * Yoni compatibility for two nakshatras. Symmetric by construction — the
 * classical Yoni koota is not directional; only the gender-polarity flag is.
 */
export function yoniCell(a: Yoni, b: Yoni): YoniCell {
  if (a === b) return { score: 4, band: 'identical', provenance: 'attested' };
  return CELLS.get(key(a, b)) ?? { score: 2, band: 'neutral', provenance: 'derived' };
}

/**
 * Dominance inversion: the female party's yoni is male and the male party's is
 * female. Classical commentary notes it; it carries no numeric effect, so it is
 * returned as a flag rather than folded into the score.
 */
export function genderPolarityInverted(boyNakshatra: number, girlNakshatra: number): boolean {
  return NAKSHATRA_YONI[boyNakshatra].gender === 'F'
    && NAKSHATRA_YONI[girlNakshatra].gender === 'M';
}

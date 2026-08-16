/**
 * Western zodiac sign metadata.
 *
 * Sign *names*, elements and modalities are the same twelve words in both
 * traditions — Aries is Aries whether you get there by ayanamsa or not — so
 * this reuses `RASHI_ENGLISH` / `RASHI_ELEMENTS` / `RASHI_MODALITIES` from
 * `../rashi.ts` rather than re-declaring them. Only rulership is genuinely
 * different: Western practice (since the outer planets' discovery) assigns
 * Uranus/Neptune/Pluto as modern rulers of Aquarius/Pisces/Scorpio, displacing
 * Saturn/Jupiter/Mars as sole ruler there — both are kept, modern as primary.
 */

import { RASHIS, RASHI_ENGLISH, RASHI_ELEMENTS, RASHI_MODALITIES } from '../rashi';

export const SIGNS = RASHI_ENGLISH;
export type SignIndex = number; // 0=Aries … 11=Pisces

/** U+FE0E forces monochrome text presentation over the platform emoji glyph. */
export const SIGN_GLYPHS = [
  '♈︎', '♉︎', '♊︎', '♋︎', '♌︎', '♍︎',
  '♎︎', '♏︎', '♐︎', '♑︎', '♒︎', '♓︎',
] as const;

// `RASHI_ELEMENTS`/`RASHI_MODALITIES` are keyed by the Sanskrit name (`RASHIS`,
// e.g. 'Mesha'), not the English one — index through `RASHIS`, not `RASHI_ENGLISH`.
export function signElement(idx: SignIndex): string { return RASHI_ELEMENTS[RASHIS[idx]]; }
export function signModality(idx: SignIndex): string { return RASHI_MODALITIES[RASHIS[idx]]; }

/**
 * The shared `RASHI_MODALITIES` table uses the Vedic terms (Movable/Fixed/
 * Dual) since it's structural, not tradition-specific. Western readers know
 * these as Cardinal/Fixed/Mutable — this is display-label-only, the
 * underlying value from `signModality()` is unchanged.
 */
export function westernModalityLabel(modality: string): string {
  return modality === 'Movable' ? 'Cardinal' : modality === 'Dual' ? 'Mutable' : modality;
}

/** Modern (primary) ruler of each sign. */
export const MODERN_RULER: Record<SignIndex, string> = {
  0: 'Mars', 1: 'Venus', 2: 'Mercury', 3: 'Moon',
  4: 'Sun', 5: 'Mercury', 6: 'Venus', 7: 'Pluto',
  8: 'Jupiter', 9: 'Saturn', 10: 'Uranus', 11: 'Neptune',
};

/** Pre-outer-planet (traditional) ruler — the co-ruler shown alongside the modern one. */
export const TRADITIONAL_RULER: Record<SignIndex, string> = {
  0: 'Mars', 1: 'Venus', 2: 'Mercury', 3: 'Moon',
  4: 'Sun', 5: 'Mercury', 6: 'Venus', 7: 'Mars',
  8: 'Jupiter', 9: 'Saturn', 10: 'Saturn', 11: 'Jupiter',
};

/** Signs 3 apart mod 12, index-aligned with `getRashi` etc. */
export function signOf(tropicalLongitude: number): SignIndex {
  return Math.floor(((tropicalLongitude % 360) + 360) % 360 / 30);
}

export function degreeInSign(tropicalLongitude: number): number {
  const l = ((tropicalLongitude % 360) + 360) % 360;
  return l % 30;
}

/** "14°23' Leo" style readout. */
export function formatSignDegree(tropicalLongitude: number): string {
  const idx = signOf(tropicalLongitude);
  const deg = degreeInSign(tropicalLongitude);
  const d = Math.floor(deg);
  const m = Math.round((deg - d) * 60);
  return `${d}°${m.toString().padStart(2, '0')}' ${SIGNS[idx]}`;
}

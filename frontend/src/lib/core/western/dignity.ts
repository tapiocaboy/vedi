/**
 * Essential dignity — domicile (rulership) / exaltation / detriment / fall.
 *
 * Deliberately stops at the four states a general-audience reading actually
 * uses (the ones Co-Star/TimePassages-style apps surface); triplicity/term/
 * face are a further five-tier classical refinement that's out of scope for
 * this pass (see WESTERN_TODO.md §7).
 *
 * Exaltation/fall are only asserted for the seven classical bodies — Sun
 * through Saturn share the same exaltation degrees in both the Western and
 * Vedic traditions (Vedic's `yogas.ts` `EXALTATION` table has the identical
 * signs), which is corroborating rather than coincidence: both trace to the
 * same Hellenistic-era source. Whether Uranus/Neptune/Pluto have a genuine
 * exaltation sign is unsettled among Western astrologers, so none is claimed
 * — they get domicile/detriment only, via modern + traditional rulership.
 */

import { MODERN_RULER, TRADITIONAL_RULER, type SignIndex } from './signs';

export type DignityLevel = 'rulership' | 'exaltation' | 'detriment' | 'fall' | 'neutral';

const EXALTATION: Partial<Record<string, SignIndex>> = {
  Sun: 0, Moon: 1, Mercury: 5, Venus: 11, Mars: 9, Jupiter: 3, Saturn: 6,
};

const rulesSign = (planet: string, sign: SignIndex): boolean =>
  MODERN_RULER[sign] === planet || TRADITIONAL_RULER[sign] === planet;

/** Every sign a planet rules (own-sign / domicile), by either scheme. */
export function rulesOf(planet: string): SignIndex[] {
  const out: SignIndex[] = [];
  for (let s = 0; s < 12; s++) if (rulesSign(planet, s)) out.push(s);
  return out;
}

export function essentialDignity(planet: string, sign: SignIndex): DignityLevel {
  if (rulesSign(planet, sign)) return 'rulership';
  const exaltSign = EXALTATION[planet];
  if (exaltSign !== undefined) {
    if (sign === exaltSign) return 'exaltation';
    if (sign === (exaltSign + 6) % 12) return 'fall';
  }
  // Detriment: opposite any sign the planet rules.
  for (const ruled of rulesOf(planet)) {
    if (sign === (ruled + 6) % 12) return 'detriment';
  }
  return 'neutral';
}

export const DIGNITY_LABEL: Record<DignityLevel, string> = {
  rulership: 'Domicile', exaltation: 'Exalted', detriment: 'Detriment', fall: 'Fall', neutral: 'Peregrine',
};

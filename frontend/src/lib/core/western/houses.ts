/**
 * Placidus house placement.
 *
 * Western house 1..12 boundaries are the twelve *unequal* Placidus cusps
 * (`westernEphemeris.ts`'s `houses.cusps`), not whole-sign offsets from the
 * ascendant like the Vedic bhava convention this app otherwise uses. A planet
 * belongs to house N when its longitude falls between cusp N and cusp N+1
 * (wrapping at 12→1).
 *
 * Note: Placidus cusps become degenerate inside the polar circles (no
 * meaningful sunrise/sunset framework to divide) — out of scope here, same as
 * the rest of this pass; see WESTERN_TODO.md §7.
 */

function mod360(x: number): number {
  return ((x % 360) + 360) % 360;
}

export type Angularity = 'angular' | 'succedent' | 'cadent';

const ANGULARITY: Record<number, Angularity> = {
  1: 'angular', 4: 'angular', 7: 'angular', 10: 'angular',
  2: 'succedent', 5: 'succedent', 8: 'succedent', 11: 'succedent',
  3: 'cadent', 6: 'cadent', 9: 'cadent', 12: 'cadent',
};

export function angularityOf(house: number): Angularity {
  return ANGULARITY[house] ?? 'cadent';
}

/** House 1..12 a tropical longitude falls in, given the 12 Placidus cusps. */
export function houseOfLongitude(longitude: number, cusps: number[]): number {
  const lon = mod360(longitude);
  for (let h = 0; h < 12; h++) {
    const start = mod360(cusps[h]);
    const span = mod360(cusps[(h + 1) % 12] - start);
    const pos = mod360(lon - start);
    if (span === 0 ? pos === 0 : pos < span) return h + 1;
  }
  return 12;
}

/** How far (degrees) a longitude sits past its house's starting cusp — 0 at the cusp itself. */
export function degreesIntoHouse(longitude: number, house: number, cusps: number[]): number {
  const start = mod360(cusps[house - 1]);
  return mod360(longitude - start);
}

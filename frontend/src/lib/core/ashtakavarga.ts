/**
 * Ashtakavarga — the classical Vedic benefic-points system (BPHS Ch. 66).
 *
 * For each of the 7 planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn),
 * we compute a Bhinnashtakavarga: a 12-rashi grid where each entry is the
 * number of "bindus" (auspicious points) that planet receives in that rashi.
 *
 * A bindu is awarded by each of 8 contributors (the 7 planets + the
 * Ascendant/Lagna) when the subject rashi falls at one of the contributor's
 * auspicious house-offsets from the contributor's own rashi.
 *
 * The Sarvashtakavarga is the elementwise sum of the 7 Bhinna grids
 * (Lagna is a contributor, not a subject; total bindus across all rashis = 337).
 *
 * Reference totals per Bhinna: Sun 48, Moon 49, Mars 39, Mercury 54,
 * Jupiter 56, Venus 52, Saturn 39.
 */

export type Planet = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn';
export type Contributor = Planet | 'Lagna';

/** 12-entry array indexed by rashi (0 = Aries, 11 = Pisces). */
export type RashiVector = number[];

export interface AshtakavargaResult {
  /** Per-planet 12-rashi bindu vector. */
  bhinna: Record<Planet, RashiVector>;
  /** Elementwise sum of the 7 Bhinna vectors. */
  sarva: RashiVector;
  /** Each planet's bindus in the rashi it occupies natally (its "self strength"). */
  selfStrength: Record<Planet, number>;
  /** Natal rashi (0–11) for each planet, echoed back for UI use. */
  natalRashi: Record<Planet, number>;
}

export const PLANETS: readonly Planet[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const;
const CONTRIBUTORS: readonly Contributor[] = [...PLANETS, 'Lagna'] as const;

/**
 * Contribution rules from BPHS Ch. 66.
 * RULES[subject][contributor] = list of 1-indexed house-offsets (from contributor's rashi)
 * at which the subject planet earns one bindu.
 */
const RULES: Record<Planet, Record<Contributor, number[]>> = {
  Sun: {
    Sun:     [1, 2, 4, 7, 8, 9, 10, 11],
    Moon:    [3, 6, 10, 11],
    Mars:    [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [3, 5, 6, 9, 10, 11, 12],
    Jupiter: [5, 6, 9, 11],
    Venus:   [6, 7, 12],
    Saturn:  [1, 2, 4, 7, 8, 9, 10, 11],
    Lagna:   [3, 4, 6, 10, 11, 12],
  },
  Moon: {
    Sun:     [3, 6, 7, 8, 10, 11],
    Moon:    [1, 3, 6, 7, 10, 11],
    Mars:    [2, 3, 5, 6, 9, 10, 11],
    Mercury: [1, 3, 4, 5, 7, 8, 10, 11],
    Jupiter: [1, 4, 7, 8, 10, 11, 12],
    Venus:   [3, 4, 5, 7, 9, 10, 11],
    Saturn:  [3, 5, 6, 11],
    Lagna:   [3, 6, 10, 11],
  },
  Mars: {
    Sun:     [3, 5, 6, 10, 11],
    Moon:    [3, 6, 11],
    Mars:    [1, 2, 4, 7, 8, 10, 11],
    Mercury: [3, 5, 6, 11],
    Jupiter: [6, 10, 11, 12],
    Venus:   [6, 8, 11, 12],
    Saturn:  [1, 4, 7, 8, 9, 10, 11],
    Lagna:   [1, 3, 6, 10, 11],
  },
  Mercury: {
    Sun:     [5, 6, 9, 11, 12],
    Moon:    [2, 4, 6, 8, 10, 11],
    Mars:    [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [1, 3, 5, 6, 9, 10, 11, 12],
    Jupiter: [6, 8, 11, 12],
    Venus:   [1, 2, 3, 4, 5, 8, 9, 11],
    Saturn:  [1, 2, 4, 7, 8, 9, 10, 11],
    Lagna:   [1, 2, 4, 6, 8, 10, 11],
  },
  Jupiter: {
    Sun:     [1, 2, 3, 4, 7, 8, 9, 10, 11],
    Moon:    [2, 5, 7, 9, 11],
    Mars:    [1, 2, 4, 7, 8, 10, 11],
    Mercury: [1, 2, 4, 5, 6, 9, 10, 11],
    Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
    Venus:   [2, 5, 6, 9, 10, 11],
    Saturn:  [3, 5, 6, 12],
    Lagna:   [1, 2, 4, 5, 6, 7, 9, 10, 11],
  },
  Venus: {
    Sun:     [8, 11, 12],
    Moon:    [1, 2, 3, 4, 5, 8, 9, 11, 12],
    Mars:    [3, 5, 6, 9, 11, 12],
    Mercury: [3, 5, 6, 9, 11],
    Jupiter: [5, 8, 9, 10, 11],
    Venus:   [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Saturn:  [3, 4, 5, 8, 9, 10, 11],
    Lagna:   [1, 2, 3, 4, 5, 8, 9, 11],
  },
  Saturn: {
    Sun:     [1, 2, 4, 7, 8, 10, 11],
    Moon:    [3, 6, 11],
    Mars:    [3, 5, 6, 10, 11, 12],
    Mercury: [6, 8, 9, 10, 11, 12],
    Jupiter: [5, 6, 11, 12],
    Venus:   [6, 11, 12],
    Saturn:  [3, 5, 6, 11],
    Lagna:   [1, 3, 4, 6, 10, 11],
  },
};

/**
 * Compute Bhinnashtakavarga for a single planet given natal rashis (0-indexed)
 * for every contributor.
 */
function computeBhinna(
  subject: Planet,
  contribRashi: Record<Contributor, number>,
): RashiVector {
  const grid: RashiVector = new Array(12).fill(0);
  const rules = RULES[subject];
  for (const c of CONTRIBUTORS) {
    const cRashi = contribRashi[c];
    for (const h of rules[c]) {
      const rashi = (cRashi + h - 1) % 12;
      grid[rashi]++;
    }
  }
  return grid;
}

/**
 * Compute the full Ashtakavarga from natal rashi positions.
 * @param positions rashi index (0–11) for each of the 7 planets and Lagna
 */
export function computeAshtakavarga(positions: Record<Contributor, number>): AshtakavargaResult {
  const bhinna = {} as Record<Planet, RashiVector>;
  const sarva: RashiVector = new Array(12).fill(0);
  for (const p of PLANETS) {
    bhinna[p] = computeBhinna(p, positions);
    for (let i = 0; i < 12; i++) sarva[i] += bhinna[p][i];
  }
  const selfStrength = {} as Record<Planet, number>;
  const natalRashi = {} as Record<Planet, number>;
  for (const p of PLANETS) {
    natalRashi[p] = positions[p];
    selfStrength[p] = bhinna[p][positions[p]];
  }
  return { bhinna, sarva, selfStrength, natalRashi };
}

/**
 * Map a bindu count (0–8) to a prediction-score modifier (−2…+2).
 * 0–2 = weak, 3 = mildly weak, 4 = neutral, 5 = mildly strong, 6–8 = strong.
 */
export function bindusToScoreModifier(bindus: number): number {
  if (bindus <= 2) return -2;
  if (bindus === 3) return -1;
  if (bindus === 4) return 0;
  if (bindus === 5) return 1;
  return 2;
}

/** Strength label for UI display. */
export function bindusToLabel(bindus: number): 'weak' | 'below average' | 'average' | 'good' | 'strong' {
  if (bindus <= 2) return 'weak';
  if (bindus === 3) return 'below average';
  if (bindus === 4) return 'average';
  if (bindus === 5) return 'good';
  return 'strong';
}

/** Strength label for a Sarva rashi (0–56 range, typical chart 20–35 per rashi). */
export function sarvaToLabel(s: number): 'very weak' | 'weak' | 'average' | 'strong' | 'very strong' {
  if (s < 20) return 'very weak';
  if (s < 25) return 'weak';
  if (s < 30) return 'average';
  if (s < 35) return 'strong';
  return 'very strong';
}

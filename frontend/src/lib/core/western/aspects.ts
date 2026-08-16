/**
 * Ptolemaic aspects — the five major aspects plus the quincunx, orb-decayed
 * rather than a binary hit/miss (the same principle `matchSynastry.ts` uses
 * for the Vedic side: a conjunction at 0°30' and one at 7° are not the same
 * event). Shared by the natal aspect grid, transit-to-natal, and synastry —
 * all three are "find the aspect between longitude X and longitude Y", just
 * with different sources for X and Y.
 */

export type AspectType = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition' | 'quincunx';

export const ASPECT_ANGLE: Record<AspectType, number> = {
  conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180, quincunx: 150,
};

export const ASPECT_NATURE: Record<AspectType, 'harmonious' | 'challenging' | 'neutral'> = {
  conjunction: 'neutral', sextile: 'harmonious', trine: 'harmonious',
  square: 'challenging', opposition: 'challenging', quincunx: 'challenging',
};

/** All six recognised in this pass — semisquare/sesquiquadrate/quintile are out of scope (see WESTERN_TODO.md §7). */
export const ALL_ASPECTS: AspectType[] = ['conjunction', 'sextile', 'square', 'trine', 'opposition', 'quincunx'];
/** The five majors, without the quincunx — used where minor aspects would be noise (e.g. pattern detection). */
export const MAJOR_ASPECTS: AspectType[] = ['conjunction', 'sextile', 'square', 'trine', 'opposition'];

const BASE_ORB: Record<AspectType, number> = {
  conjunction: 8, opposition: 8, trine: 7, square: 7, sextile: 5, quincunx: 3,
};
/** Sun/Moon involvement widens the allowed orb — the classical "luminary" exception. */
const LUMINARY_BONUS = 2;
const LUMINARIES = new Set(['SUN', 'MOON']);

function maxOrbFor(type: AspectType, bodyA: string, bodyB: string): number {
  const luminary = LUMINARIES.has(bodyA.toUpperCase()) || LUMINARIES.has(bodyB.toUpperCase());
  return BASE_ORB[type] + (luminary ? LUMINARY_BONUS : 0);
}

function mod360(x: number): number {
  return ((x % 360) + 360) % 360;
}

/** Shortest angular separation between two longitudes, 0–180. */
export function angularSeparation(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

export interface AspectHit {
  bodyA: string;
  bodyB: string;
  type: AspectType;
  /** The aspect's exact angle (e.g. 90 for a square). */
  angle: number;
  /** Actual angular separation between the two bodies, 0–180. */
  separation: number;
  /** |separation − angle|. */
  orb: number;
  maxOrb: number;
  /** 1 at exact, 0 at the orb boundary. */
  strength: number;
  /** True when the two bodies are moving toward exactness rather than away from it. */
  applying: boolean;
}

function isApplying(lonA: number, speedA: number, lonB: number, speedB: number, angle: number): boolean {
  const dt = 0.02; // a fifth of a day — enough to sample direction without a full ephemeris re-query
  const now = Math.abs(angularSeparation(lonA, lonB) - angle);
  const later = Math.abs(angularSeparation(mod360(lonA + speedA * dt), mod360(lonB + speedB * dt)) - angle);
  return later < now;
}

/**
 * The strongest (tightest-orb) aspect between two bodies, or null if none of
 * `types` falls within its allowed orb. Only one aspect type can plausibly
 * match at once for real orb tables (they don't overlap), but the loop is
 * written to pick the best rather than the first, defensively.
 */
export function findAspect(
  bodyA: string, lonA: number, speedA: number,
  bodyB: string, lonB: number, speedB: number,
  types: AspectType[] = ALL_ASPECTS,
): AspectHit | null {
  const sep = angularSeparation(lonA, lonB);
  let best: AspectHit | null = null;
  for (const type of types) {
    const angle = ASPECT_ANGLE[type];
    const orb = Math.abs(sep - angle);
    const maxOrb = maxOrbFor(type, bodyA, bodyB);
    if (orb <= maxOrb) {
      const strength = maxOrb === 0 ? 1 : 1 - orb / maxOrb;
      if (!best || strength > best.strength) {
        best = {
          bodyA, bodyB, type, angle, separation: sep, orb, maxOrb, strength,
          applying: isApplying(lonA, speedA, lonB, speedB, angle),
        };
      }
    }
  }
  return best;
}

export interface AspectBody {
  name: string;
  longitude: number;
  /** deg/day; 0 is fine for points with no meaningful speed (e.g. house cusps). */
  speed: number;
}

/** Every aspect within one set of bodies (a chart's own aspect grid), strongest first. */
export function computeAspectGrid(bodies: AspectBody[], types: AspectType[] = ALL_ASPECTS): AspectHit[] {
  const hits: AspectHit[] = [];
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const hit = findAspect(
        bodies[i].name, bodies[i].longitude, bodies[i].speed,
        bodies[j].name, bodies[j].longitude, bodies[j].speed,
        types,
      );
      if (hit) hits.push(hit);
    }
  }
  return hits.sort((a, b) => b.strength - a.strength);
}

/** Every aspect between two different sets of bodies (synastry, or transits-to-natal). */
export function computeCrossAspects(
  bodiesA: AspectBody[], bodiesB: AspectBody[], types: AspectType[] = ALL_ASPECTS,
): AspectHit[] {
  const hits: AspectHit[] = [];
  for (const a of bodiesA) {
    for (const b of bodiesB) {
      const hit = findAspect(a.name, a.longitude, a.speed, b.name, b.longitude, b.speed, types);
      if (hit) hits.push(hit);
    }
  }
  return hits.sort((x, y) => y.strength - x.strength);
}

/** "3°42'" style orb readout. */
export function formatOrb(orb: number): string {
  const d = Math.floor(orb);
  const m = Math.round((orb - d) * 60);
  return m === 60 ? `${d + 1}°00'` : `${d}°${m.toString().padStart(2, '0')}'`;
}

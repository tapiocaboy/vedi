/**
 * Varga (divisional) charts — Navamsa (D9) and Dasamsa (D10).
 *
 * D9 (Navamsa): each rashi is split into nine 3°20′ parts. Movable signs
 * count from themselves, fixed signs from the 9th, dual signs from the 5th —
 * which collapses to the single formula floor(longitude / 3°20′) mod 12.
 * The D9 chart governs marriage, dharma, and the planet's "inner" strength.
 *
 * D10 (Dasamsa): each rashi is split into ten 3° parts. Odd signs count from
 * themselves, even signs from the 9th sign. The D10 chart governs career,
 * public standing, and karma in the world.
 *
 * Vargottama: a planet in the same rashi in D1 and D9 gains special strength
 * (treated as close to own-sign quality).
 */

import { getDignity, type DignityLevel } from './planetaryAnalysis';
import { RASHIS } from './rashi';

const NAVAMSA_SPAN = 10 / 3; // 3°20′
const DASAMSA_SPAN = 3;

function mod360(x: number): number { return ((x % 360) + 360) % 360; }

/** Navamsa (D9) rashi index (0–11) for a sidereal longitude. */
export function navamsaRashi(longitude: number): number {
  return Math.floor(mod360(longitude) / NAVAMSA_SPAN) % 12;
}

/** Dasamsa (D10) rashi index (0–11) for a sidereal longitude. */
export function dasamsaRashi(longitude: number): number {
  const lon = mod360(longitude);
  const rashi = Math.floor(lon / 30);
  const division = Math.floor((lon % 30) / DASAMSA_SPAN);
  const isOddSign = rashi % 2 === 0; // Aries(0) is the 1st (odd) sign
  const start = isOddSign ? rashi : (rashi + 8) % 12;
  return (start + division) % 12;
}

export interface VargaPlanet {
  planet: string;
  longitude: number;
  d1Rashi: number;
  d1RashiName: string;
  d9Rashi: number;
  d9RashiName: string;
  d9Dignity: DignityLevel;
  d10Rashi: number;
  d10RashiName: string;
  d10Dignity: DignityLevel;
  isVargottama: boolean;
  isRetrograde: boolean;
}

export interface VargaChart {
  /** All nine grahas plus the ascendant. */
  planets: VargaPlanet[];
  /** Navamsa lagna rashi (0–11). */
  d9Ascendant: number;
  /** Dasamsa lagna rashi (0–11). */
  d10Ascendant: number;
  /** Planets occupying the same rashi in D1 and D9. */
  vargottamaPlanets: string[];
}

export interface VargaInput {
  /** Sidereal longitude per planet, keyed Sun/Moon/.../Ketu. */
  longitudes: Record<string, number>;
  /** Retrograde flags per planet. */
  retro?: Record<string, boolean>;
  /** Ascendant sidereal longitude. */
  ascendantLongitude: number;
}

const PLANET_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

export function computeVargas(input: VargaInput): VargaChart {
  const planets: VargaPlanet[] = [];

  for (const planet of PLANET_ORDER) {
    const lon = input.longitudes[planet];
    if (lon == null) continue;
    const d1 = Math.floor(mod360(lon) / 30);
    const d9 = navamsaRashi(lon);
    const d10 = dasamsaRashi(lon);
    planets.push({
      planet,
      longitude: lon,
      d1Rashi: d1,
      d1RashiName: RASHIS[d1],
      d9Rashi: d9,
      d9RashiName: RASHIS[d9],
      d9Dignity: getDignity(planet, d9),
      d10Rashi: d10,
      d10RashiName: RASHIS[d10],
      d10Dignity: getDignity(planet, d10),
      isVargottama: d1 === d9,
      isRetrograde: input.retro?.[planet] ?? false,
    });
  }

  return {
    planets,
    d9Ascendant: navamsaRashi(input.ascendantLongitude),
    d10Ascendant: dasamsaRashi(input.ascendantLongitude),
    vargottamaPlanets: planets.filter(p => p.isVargottama).map(p => p.planet),
  };
}

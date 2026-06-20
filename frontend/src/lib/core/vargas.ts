/**
 * Varga (divisional) charts.
 *
 * Each varga splits every 30° sign into N equal (or, for D30, unequal) parts and
 * maps each part to a rashi, zooming into one area of life. D9 (marriage/dharma)
 * and D10 (career) are the headline charts; the rest cover wealth, siblings,
 * property, children, parents, education, misfortunes, and overall karma.
 *
 * Formulae follow Parashara (BPHS). Vargottama: a planet in the same rashi in
 * D1 and D9 gains special strength.
 */

import { getDignity, type DignityLevel } from './planetaryAnalysis';
import { RASHIS } from './rashi';

const NAVAMSA_SPAN = 10 / 3; // 3°20′
const DASAMSA_SPAN = 3;

function mod360(x: number): number { return ((x % 360) + 360) % 360; }

const isOdd = (rashi: number) => rashi % 2 === 0; // Aries(0) is the 1st (odd) sign

/** D2 Hora (15° parts) — odd signs: Sun's hora (Leo) then Moon's (Cancer); even reversed. */
export function horaRashi(lon: number): number {
  const l = mod360(lon); const rashi = Math.floor(l / 30); const deg = l % 30;
  const firstHalf = deg < 15;
  return isOdd(rashi) ? (firstHalf ? 4 : 3) : (firstHalf ? 3 : 4); // 4=Leo, 3=Cancer
}

/** D3 Drekkana (10° parts) — same sign, then the 5th and 9th from it (trines). */
export function drekkanaRashi(lon: number): number {
  const l = mod360(lon); const rashi = Math.floor(l / 30); const div = Math.floor((l % 30) / 10);
  return (rashi + div * 4) % 12;
}

/** D4 Chaturthamsa (7.5° parts) — same sign, then the 4th, 7th, 10th (angles). */
export function chaturthamsaRashi(lon: number): number {
  const l = mod360(lon); const rashi = Math.floor(l / 30); const div = Math.floor((l % 30) / 7.5);
  return (rashi + div * 3) % 12;
}

/** D7 Saptamsa (30/7° parts) — odd signs count from the sign, even from the 7th. */
export function saptamsaRashi(lon: number): number {
  const l = mod360(lon); const rashi = Math.floor(l / 30); const div = Math.floor((l % 30) / (30 / 7));
  const start = isOdd(rashi) ? rashi : (rashi + 6) % 12;
  return (start + div) % 12;
}

/** Navamsa (D9) rashi index (0–11). */
export function navamsaRashi(longitude: number): number {
  return Math.floor(mod360(longitude) / NAVAMSA_SPAN) % 12;
}

/** Dasamsa (D10) rashi index (0–11) — odd signs from the sign, even from the 9th. */
export function dasamsaRashi(longitude: number): number {
  const lon = mod360(longitude);
  const rashi = Math.floor(lon / 30);
  const division = Math.floor((lon % 30) / DASAMSA_SPAN);
  const start = isOdd(rashi) ? rashi : (rashi + 8) % 12;
  return (start + division) % 12;
}

/** D12 Dwadasamsa (2.5° parts) — count forward from the sign itself. */
export function dwadasamsaRashi(lon: number): number {
  const l = mod360(lon); const rashi = Math.floor(l / 30); const div = Math.floor((l % 30) / 2.5);
  return (rashi + div) % 12;
}

/** D24 Chaturvimsamsa (1.25° parts) — odd signs from Leo, even from Cancer. */
export function chaturvimsamsaRashi(lon: number): number {
  const l = mod360(lon); const rashi = Math.floor(l / 30); const div = Math.floor((l % 30) / 1.25);
  const start = isOdd(rashi) ? 4 : 3; // Leo / Cancer
  return (start + div) % 12;
}

/** D30 Trimsamsa (unequal 5/5/8/7/5° parts) — different rulers for odd vs even signs. */
export function trimsamsaRashi(lon: number): number {
  const l = mod360(lon); const rashi = Math.floor(l / 30); const deg = l % 30;
  if (isOdd(rashi)) {
    if (deg < 5) return 0;   // Mars — Aries
    if (deg < 10) return 10; // Saturn — Aquarius
    if (deg < 18) return 8;  // Jupiter — Sagittarius
    if (deg < 25) return 2;  // Mercury — Gemini
    return 6;                // Venus — Libra
  }
  if (deg < 5) return 1;     // Venus — Taurus
  if (deg < 12) return 5;    // Mercury — Virgo
  if (deg < 20) return 11;   // Jupiter — Pisces
  if (deg < 25) return 9;    // Saturn — Capricorn
  return 7;                  // Mars — Scorpio
}

/** D60 Shashtiamsa (0.5° parts) — count forward from the sign itself. */
export function shashtiamsaRashi(lon: number): number {
  const l = mod360(lon); const rashi = Math.floor(l / 30); const div = Math.floor((l % 30) / 0.5);
  return (rashi + div) % 12;
}

// ─── Varga registry ──────────────────────────────────────────────────────────

export type VargaCode = 'D2' | 'D3' | 'D4' | 'D7' | 'D9' | 'D10' | 'D12' | 'D24' | 'D30' | 'D60';

export interface VargaDef {
  code: VargaCode;
  name: string;          // Sanskrit name
  significance: string;  // life area
  fn: (lon: number) => number;
}

export const VARGA_DEFS: VargaDef[] = [
  { code: 'D2',  name: 'Hora',           significance: 'Wealth & resources',   fn: horaRashi },
  { code: 'D3',  name: 'Drekkana',       significance: 'Siblings & courage',   fn: drekkanaRashi },
  { code: 'D4',  name: 'Chaturthamsa',   significance: 'Property & fortune',   fn: chaturthamsaRashi },
  { code: 'D7',  name: 'Saptamsa',       significance: 'Children & progeny',   fn: saptamsaRashi },
  { code: 'D9',  name: 'Navamsa',        significance: 'Marriage & dharma',    fn: navamsaRashi },
  { code: 'D10', name: 'Dasamsa',        significance: 'Career & status',      fn: dasamsaRashi },
  { code: 'D12', name: 'Dwadasamsa',     significance: 'Parents & ancestry',   fn: dwadasamsaRashi },
  { code: 'D24', name: 'Chaturvimsamsa', significance: 'Education & learning', fn: chaturvimsamsaRashi },
  { code: 'D30', name: 'Trimsamsa',      significance: 'Adversity & strife',   fn: trimsamsaRashi },
  { code: 'D60', name: 'Shashtiamsa',    significance: 'Past karma & overall',  fn: shashtiamsaRashi },
];

/** The vargas beyond the headline D9/D10, in display order. */
export const EXTRA_VARGAS: VargaDef[] = VARGA_DEFS.filter(v => v.code !== 'D9' && v.code !== 'D10');

export interface VargaCell { rashi: number; rashiName: string; dignity: DignityLevel; }

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
  /** Every varga's placement for this planet, keyed by code (D2…D60). */
  divisions: Record<VargaCode, VargaCell>;
}

export interface VargaChart {
  /** All nine grahas plus the ascendant. */
  planets: VargaPlanet[];
  /** Navamsa lagna rashi (0–11). */
  d9Ascendant: number;
  /** Dasamsa lagna rashi (0–11). */
  d10Ascendant: number;
  /** Ascendant (lagna) rashi for every varga, keyed by code. */
  ascendants: Record<VargaCode, number>;
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

function divisionsFor(planet: string, lon: number): Record<VargaCode, VargaCell> {
  const out = {} as Record<VargaCode, VargaCell>;
  for (const v of VARGA_DEFS) {
    const rashi = v.fn(lon);
    out[v.code] = { rashi, rashiName: RASHIS[rashi], dignity: getDignity(planet, rashi) };
  }
  return out;
}

export function computeVargas(input: VargaInput): VargaChart {
  const planets: VargaPlanet[] = [];

  for (const planet of PLANET_ORDER) {
    const lon = input.longitudes[planet];
    if (lon == null) continue;
    const d1 = Math.floor(mod360(lon) / 30);
    const divisions = divisionsFor(planet, lon);
    const d9 = divisions.D9.rashi;
    const d10 = divisions.D10.rashi;
    planets.push({
      planet,
      longitude: lon,
      d1Rashi: d1,
      d1RashiName: RASHIS[d1],
      d9Rashi: d9,
      d9RashiName: RASHIS[d9],
      d9Dignity: divisions.D9.dignity,
      d10Rashi: d10,
      d10RashiName: RASHIS[d10],
      d10Dignity: divisions.D10.dignity,
      isVargottama: d1 === d9,
      isRetrograde: input.retro?.[planet] ?? false,
      divisions,
    });
  }

  const ascendants = {} as Record<VargaCode, number>;
  for (const v of VARGA_DEFS) ascendants[v.code] = v.fn(input.ascendantLongitude);

  return {
    planets,
    d9Ascendant: ascendants.D9,
    d10Ascendant: ascendants.D10,
    ascendants,
    vargottamaPlanets: planets.filter(p => p.isVargottama).map(p => p.planet),
  };
}

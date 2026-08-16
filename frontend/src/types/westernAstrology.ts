/**
 * TypeScript types for the Western (tropical) astrology data structures.
 * Mirrors the shape of `types/astrology.ts` (the Vedic side) closely enough
 * that shared UI primitives (tables, badges) can work with either.
 */

import type { BirthData } from './astrology';
import type { AspectHit } from '../lib/core/western/aspects';
import type { WesternPattern } from '../lib/core/western/patterns';
import type { DignityLevel } from '../lib/core/western/dignity';
import type { Angularity } from '../lib/core/western/houses';

export type { AspectHit, AspectType } from '../lib/core/western/aspects';
export type { WesternPattern, WesternPatternType } from '../lib/core/western/patterns';
export type { DignityLevel } from '../lib/core/western/dignity';
export type { Angularity } from '../lib/core/western/houses';

/** A planet, or an angle (Ascendant/Midheaven) treated the same way for display/aspect purposes. */
export interface WesternPlanetPosition {
  planet: string;          // 'SUN' … 'PLUTO', or 'ASCENDANT' / 'MIDHEAVEN'
  longitude: number;       // tropical, 0–360
  latitude: number;
  signIndex: number;       // 0–11, Aries…Pisces
  sign: string;
  degreeInSign: number;
  house: number;            // 1–12, Placidus
  angularity: Angularity;
  dignity: DignityLevel;
  isRetrograde: boolean;
  speed: number;
}

export interface WesternHouseCusp {
  house: number;            // 1–12
  longitude: number;
  signIndex: number;
  sign: string;
  degreeInSign: number;
}

export interface WesternChart {
  birthData: BirthData;
  planets: WesternPlanetPosition[];   // the ten bodies, Sun…Pluto
  ascendant: WesternPlanetPosition;
  midheaven: WesternPlanetPosition;
  houses: WesternHouseCusp[];         // 12, in house order
  aspects: AspectHit[];               // the natal chart's own grid, strongest first
  patterns: WesternPattern[];
  /** Counts across the ten planets (Sun…Pluto), not the angles. */
  elementBalance: Record<'Fire' | 'Earth' | 'Air' | 'Water', number>;
  modalityBalance: Record<'Movable' | 'Fixed' | 'Dual', number>;
  generatedAt: string;
}

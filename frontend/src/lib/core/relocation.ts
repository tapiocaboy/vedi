/**
 * Relocated chart — same birth moment, re-cast for a different latitude/longitude.
 *
 * Planet positions are unchanged (the planets were where they were at the birth
 * instant). What changes is the ASCENDANT and therefore which house each planet
 * falls into. Two people born at the same UT in Delhi and Tokyo will have the
 * same Sun rashi but completely different rising signs.
 */

import { getRelocatedAscendant } from './ephemeris';
import type { BirthData } from '../../types/astrology';
import { RASHIS } from './rashi';

export type AyanamsaSystem = BirthData['ayanamsa'];

export interface RelocatedChart {
  /** Sidereal degrees of the relocated Ascendant. */
  ascendantLon: number;
  ascendantRashi: number;
  ascendantRashiName: string;
  ascendantRashiDegree: number;
  /** Whole-sign house number (1–12) per planet at the new location. */
  planetHouses: Record<string, number>;
  /** How many houses the ascendant has shifted from the natal chart (1 = no shift). */
  ascendantShift: number;
}

function houseFor(planetRashi: number, ascRashi: number): number {
  return ((planetRashi - ascRashi + 12) % 12) + 1;
}

/**
 * Re-cast planet → house assignments for a different location.
 * @param birthData natal chart data (provides the UT and the natal planet rashis are read from natalPlanetRashis)
 * @param newLat new latitude
 * @param newLon new longitude
 * @param natalPlanetRashis 0-indexed rashi for every body we want assigned (Sun…Saturn, Rahu, Ketu)
 * @param natalAscendantRashi the original natal ascendant rashi (only used to report `ascendantShift`)
 */
export async function relocateChart(
  birthData: BirthData,
  newLat: number,
  newLon: number,
  natalPlanetRashis: Record<string, number>,
  natalAscendantRashi: number,
): Promise<RelocatedChart> {
  const asc = await getRelocatedAscendant(
    birthData.date,
    birthData.timezone,
    newLat,
    newLon,
    birthData.ayanamsa,
  );

  const planetHouses: Record<string, number> = {};
  for (const [name, rashi] of Object.entries(natalPlanetRashis)) {
    planetHouses[name] = houseFor(rashi, asc.rashi);
  }

  return {
    ascendantLon: asc.longitude,
    ascendantRashi: asc.rashi,
    ascendantRashiName: RASHIS[asc.rashi],
    ascendantRashiDegree: Math.round(asc.rashiDegree * 100) / 100,
    planetHouses,
    ascendantShift: ((asc.rashi - natalAscendantRashi + 12) % 12) + 1,
  };
}

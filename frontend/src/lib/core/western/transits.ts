/**
 * Transit-to-natal — the Western "Now" tab. Western astrology has no dasha
 * tree; the standard timing technique instead is "where are the planets
 * moving right now, relative to my natal chart" — which natal house a
 * transiting planet is currently crossing, and what aspects it's currently
 * making to natal points.
 */

import { getWesternPositions } from './westernEphemeris';
import { WESTERN_BODIES } from './westernEphemeris';
import { signOf, SIGNS } from './signs';
import { houseOfLongitude } from './houses';
import { computeCrossAspects, type AspectHit, type AspectBody, ALL_ASPECTS } from './aspects';
import type { WesternChart } from '../../../types/westernAstrology';

export interface TransitPlanetInfo {
  planet: string;
  longitude: number;
  signIndex: number;
  sign: string;
  isRetrograde: boolean;
  /** Which of the natal chart's own houses this transiting planet is currently moving through. */
  natalHouse: number;
}

export interface WesternTransitSnapshot {
  asOf: string;
  transiting: TransitPlanetInfo[];
  /** bodyA = transiting planet, bodyB = natal planet/Ascendant/Midheaven. Strongest first. */
  hits: AspectHit[];
}

/**
 * Current transiting positions and their aspects to the natal chart.
 * Transiting zodiacal longitude doesn't meaningfully depend on the observer's
 * location (parallax is negligible for the outer bodies and small for the
 * inner ones), so 0,0 is passed for lat/lon — only used internally to compute
 * a "now" house system we don't use; natal house placement below uses the
 * chart's own cusps, which is the meaningful comparison.
 */
export async function getWesternTransits(chart: WesternChart, asOf: Date = new Date()): Promise<WesternTransitSnapshot> {
  const raw = await getWesternPositions(asOf.toISOString(), 0, 0, 'UTC');
  const natalCusps = chart.houses.map(h => h.longitude);

  const transiting: TransitPlanetInfo[] = WESTERN_BODIES.map(name => {
    const p = raw.planets[name];
    const signIndex = signOf(p.longitude);
    return {
      planet: name, longitude: p.longitude, signIndex, sign: SIGNS[signIndex],
      isRetrograde: p.isRetrograde, natalHouse: houseOfLongitude(p.longitude, natalCusps),
    };
  });

  const transitBodies: AspectBody[] = transiting.map(t => ({ name: t.planet, longitude: t.longitude, speed: raw.planets[t.planet].speed }));
  const natalBodies: AspectBody[] = [
    ...chart.planets.map(p => ({ name: p.planet, longitude: p.longitude, speed: p.speed })),
    { name: chart.ascendant.planet, longitude: chart.ascendant.longitude, speed: 0 },
    { name: chart.midheaven.planet, longitude: chart.midheaven.longitude, speed: 0 },
  ];

  const hits = computeCrossAspects(transitBodies, natalBodies, ALL_ASPECTS);

  return { asOf: asOf.toISOString(), transiting, hits };
}

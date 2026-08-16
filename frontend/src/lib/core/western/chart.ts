/**
 * Assembles a full `WesternChart` from raw tropical ephemeris output: signs,
 * Placidus houses, essential dignity, the natal aspect grid, and aspect
 * patterns. The orchestrator `westernChartService.ts` is a thin wrapper
 * around this plus the async ephemeris call — kept separate so this half
 * stays a pure function, easy to unit test with fixed longitudes.
 */

import type { BirthData } from '../../../types/astrology';
import type { WesternChart, WesternPlanetPosition, WesternHouseCusp } from '../../../types/westernAstrology';
import type { WesternRawChart } from './westernEphemeris';
import { WESTERN_BODIES } from './westernEphemeris';
import { SIGNS, signOf, degreeInSign, signElement, signModality } from './signs';
import { houseOfLongitude, angularityOf } from './houses';
import { essentialDignity } from './dignity';
import { computeAspectGrid, type AspectBody } from './aspects';
import { detectAllPatterns } from './patterns';

function toPlanetPosition(
  name: string, longitude: number, latitude: number, speed: number, isRetrograde: boolean, cusps: number[],
): WesternPlanetPosition {
  const signIndex = signOf(longitude);
  const house = houseOfLongitude(longitude, cusps);
  return {
    planet: name,
    longitude, latitude,
    signIndex, sign: SIGNS[signIndex],
    degreeInSign: degreeInSign(longitude),
    house,
    angularity: angularityOf(house),
    dignity: essentialDignity(titleCase(name), signIndex),
    isRetrograde,
    speed,
  };
}

function titleCase(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

export function buildWesternChart(birthData: BirthData, raw: WesternRawChart): WesternChart {
  const { planets: rawPlanets, houses: rawHouses } = raw;
  const cusps = rawHouses.cusps;

  const planets: WesternPlanetPosition[] = WESTERN_BODIES.map(name => {
    const p = rawPlanets[name];
    return toPlanetPosition(name, p.longitude, p.latitude, p.speed, p.isRetrograde, cusps);
  });

  const ascendant = toPlanetPosition('ASCENDANT', rawHouses.ascendant, 0, 0, false, cusps);
  const midheaven = toPlanetPosition('MIDHEAVEN', rawHouses.midheaven, 0, 0, false, cusps);

  const houses: WesternHouseCusp[] = cusps.map((lon, i) => ({
    house: i + 1,
    longitude: lon,
    signIndex: signOf(lon),
    sign: SIGNS[signOf(lon)],
    degreeInSign: degreeInSign(lon),
  }));

  // Aspect grid + patterns run over the ten planets plus the Ascendant/MC —
  // "Venus conjunct Ascendant" and "Mars square Midheaven" are both
  // standard, commonly-read natal aspects.
  const aspectBodies: AspectBody[] = [
    ...planets.map(p => ({ name: p.planet, longitude: p.longitude, speed: p.speed })),
    { name: ascendant.planet, longitude: ascendant.longitude, speed: 0 },
    { name: midheaven.planet, longitude: midheaven.longitude, speed: 0 },
  ];
  const aspects = computeAspectGrid(aspectBodies);

  const signByBody: Record<string, number> = {};
  for (const p of planets) signByBody[p.planet] = p.signIndex;
  const patternBodies: AspectBody[] = planets.map(p => ({ name: p.planet, longitude: p.longitude, speed: p.speed }));
  const patterns = detectAllPatterns(patternBodies, aspects, signByBody);

  const elementBalance: WesternChart['elementBalance'] = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const modalityBalance: WesternChart['modalityBalance'] = { Movable: 0, Fixed: 0, Dual: 0 };
  for (const p of planets) {
    elementBalance[signElement(p.signIndex) as keyof typeof elementBalance]++;
    modalityBalance[signModality(p.signIndex) as keyof typeof modalityBalance]++;
  }

  return {
    birthData, planets, ascendant, midheaven, houses, aspects, patterns,
    elementBalance, modalityBalance,
    generatedAt: new Date().toISOString(),
  };
}

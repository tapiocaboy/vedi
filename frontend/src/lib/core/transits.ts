/**
 * Gochara (current planetary transits) analysis.
 *
 * Compares present-moment sidereal positions to a person's natal Moon and
 * Lagna to surface the classical transit phenomena most people care about:
 * Sade Sati, Saturn's other 8th/4th positions, Jupiter's auspicious 5/9/11
 * transits, and the current Rahu/Ketu axis.
 */

import { getPlanetPositions, type PlanetPosition } from './ephemeris';
import type { BirthData } from '../../types/astrology';
import { RASHIS } from './rashi';

export type AyanamsaSystem = BirthData['ayanamsa'];

export interface PlanetTransit {
  planet: string;
  rashi: number;
  rashiName: string;
  rashiDegree: number;
  houseFromMoon: number;
  houseFromLagna: number;
  /** −2…+2 valence per classical rules (Saturn 3/6/11 = +, Saturn 1/4/8/12 from Moon = −, etc.) */
  valence: number;
  note: string | null;
  isRetrograde: boolean;
}

export interface GocharaSnapshot {
  asOf: string;                       // ISO timestamp the transit was sampled at
  natalMoonRashi: number;
  natalLagnaRashi: number;
  transits: PlanetTransit[];
  sadeSati: SadeSatiInfo;
  jupiterBlessing: { auspicious: boolean; reason: string };
  nodalShift: { rahuRashi: number; ketuRashi: number; note: string };
}

export interface SadeSatiInfo {
  active: boolean;
  phase: 'rising' | 'peak' | 'setting' | 'none';
  description: string;
}

// House offset (1-12) of `target` from `reference` rashi. Always 1-indexed.
function houseFrom(targetRashi: number, referenceRashi: number): number {
  return ((targetRashi - referenceRashi + 12) % 12) + 1;
}

// Classical transit-from-Moon valence per planet (auspicious / challenging houses).
// References: Vaidyanatha Dixita's Jatakaparijata, BPHS Ch. on Gochara.
const TRANSIT_GOOD_FROM_MOON: Record<string, number[]> = {
  SUN:     [3, 6, 10, 11],
  MOON:    [1, 3, 6, 7, 10, 11],
  MARS:    [3, 6, 11],
  MERCURY: [2, 4, 6, 8, 10, 11],
  JUPITER: [2, 5, 7, 9, 11],
  VENUS:   [1, 2, 3, 4, 5, 8, 9, 11, 12],
  SATURN:  [3, 6, 11],
};

const TRANSIT_BAD_FROM_MOON: Record<string, number[]> = {
  SUN:     [1, 2, 4, 5, 7, 8, 9, 12],
  MOON:    [2, 4, 5, 8, 9, 12],
  MARS:    [1, 2, 4, 5, 7, 8, 9, 10, 12],
  MERCURY: [1, 3, 5, 7, 9, 11, 12],
  JUPITER: [1, 3, 4, 6, 8, 10, 12],
  VENUS:   [6, 7, 10],
  SATURN:  [1, 2, 4, 5, 7, 8, 9, 10, 12],
};

function valenceFromMoon(planet: string, house: number): number {
  if ((TRANSIT_GOOD_FROM_MOON[planet] ?? []).includes(house)) return 1;
  if ((TRANSIT_BAD_FROM_MOON[planet] ?? []).includes(house)) return -1;
  return 0;
}

function noteForTransit(planet: string, houseFromMoon: number, houseFromLagna: number): string | null {
  if (planet === 'SATURN') {
    if (houseFromMoon === 12 || houseFromMoon === 1 || houseFromMoon === 2) return 'Sade Sati phase from Moon';
    if (houseFromMoon === 8) return 'Ashtama Shani — pressure on health, hidden matters';
    if (houseFromMoon === 4) return 'Kantaka Shani — stress on home, mother, vehicles';
    if (houseFromMoon === 3 || houseFromMoon === 6 || houseFromMoon === 11) return 'Favourable Saturn transit (3/6/11 from Moon)';
  }
  if (planet === 'JUPITER') {
    if ([2, 5, 7, 9, 11].includes(houseFromMoon)) return 'Auspicious Guru transit from Moon';
    if (houseFromMoon === 6 || houseFromMoon === 8 || houseFromMoon === 12) return 'Demanding Guru transit — expansion turns to lessons';
  }
  if (planet === 'RAHU' || planet === 'KETU') {
    if (houseFromMoon === 1 || houseFromMoon === 8 || houseFromMoon === 12) return 'Node on a sensitive axis from Moon — restlessness, hidden currents';
  }
  if (planet === 'MARS' && (houseFromLagna === 1 || houseFromLagna === 4 || houseFromLagna === 7 || houseFromLagna === 8)) {
    return 'Mars on a Kuja axis from Lagna — manage temper and conflicts';
  }
  return null;
}

function computeSadeSati(saturnRashi: number, moonRashi: number): SadeSatiInfo {
  const house = houseFrom(saturnRashi, moonRashi);
  if (house === 12) {
    return { active: true, phase: 'rising',
      description: `Sade Sati first phase — Saturn in ${RASHIS[saturnRashi]} (12th from natal Moon). Inner pressure, expenses, sleep changes. Last ~2.5 years.` };
  }
  if (house === 1) {
    return { active: true, phase: 'peak',
      description: `Sade Sati peak — Saturn in your natal Moon rashi (${RASHIS[saturnRashi]}). Most intense phase. Patience, discipline, simplification. ~2.5 years.` };
  }
  if (house === 2) {
    return { active: true, phase: 'setting',
      description: `Sade Sati closing phase — Saturn in ${RASHIS[saturnRashi]} (2nd from natal Moon). Wealth/family/speech tested. Final ~2.5 years.` };
  }
  return { active: false, phase: 'none', description: 'Not currently in Sade Sati.' };
}

export interface CurrentLocation {
  latitude: number;
  longitude: number;
  timezone: string;
}

/** Sample current planetary positions for Gochara analysis. */
export async function getCurrentTransits(
  ayanamsa: AyanamsaSystem,
  natalMoonRashi: number,
  natalLagnaRashi: number,
  asOf?: Date,
  here?: CurrentLocation,
): Promise<GocharaSnapshot> {
  const now = asOf ?? new Date();
  // For Gochara, lat/lon barely affect the sidereal positions of the slow
  // planets — but we still pass through whatever location was provided so the
  // ascendant of the moment is correct.
  const loc: CurrentLocation = here ?? { latitude: 0, longitude: 0, timezone: 'UTC' };
  const dateStr = now.toISOString().slice(0, 19); // "YYYY-MM-DDTHH:mm:ss"
  const positions = await getPlanetPositions(dateStr, loc.latitude, loc.longitude, loc.timezone, ayanamsa);

  const transits: PlanetTransit[] = [];
  for (const name of ['SUN', 'MOON', 'MARS', 'MERCURY', 'JUPITER', 'VENUS', 'SATURN', 'RAHU', 'KETU']) {
    const p: PlanetPosition = positions[name];
    const houseFromMoon = houseFrom(p.rashi, natalMoonRashi);
    const houseFromLagna = houseFrom(p.rashi, natalLagnaRashi);
    transits.push({
      planet: name,
      rashi: p.rashi,
      rashiName: RASHIS[p.rashi],
      rashiDegree: Math.round(p.rashiDegree * 100) / 100,
      houseFromMoon,
      houseFromLagna,
      valence: valenceFromMoon(name, houseFromMoon),
      note: noteForTransit(name, houseFromMoon, houseFromLagna),
      isRetrograde: p.isRetrograde,
    });
  }

  const saturnTransit = transits.find(t => t.planet === 'SATURN')!;
  const sadeSati = computeSadeSati(saturnTransit.rashi, natalMoonRashi);

  const jupiterTransit = transits.find(t => t.planet === 'JUPITER')!;
  const jupiterAuspicious = [2, 5, 7, 9, 11].includes(jupiterTransit.houseFromMoon);
  const jupiterBlessing = {
    auspicious: jupiterAuspicious,
    reason: jupiterAuspicious
      ? `Guru is transiting your ${jupiterTransit.houseFromMoon}th from Moon — supportive window for expansion in matters of that house.`
      : `Guru is transiting your ${jupiterTransit.houseFromMoon}th from Moon — period of learning rather than gain in that area.`,
  };

  const rahuTransit = transits.find(t => t.planet === 'RAHU')!;
  const ketuTransit = transits.find(t => t.planet === 'KETU')!;
  const nodalShift = {
    rahuRashi: rahuTransit.rashi,
    ketuRashi: ketuTransit.rashi,
    note: `Current Rahu-Ketu axis: ${RASHIS[rahuTransit.rashi]} / ${RASHIS[ketuTransit.rashi]} — the nodes shift rashi roughly every 18 months.`,
  };

  return {
    asOf: now.toISOString(),
    natalMoonRashi,
    natalLagnaRashi,
    transits,
    sadeSati,
    jupiterBlessing,
    nodalShift,
  };
}

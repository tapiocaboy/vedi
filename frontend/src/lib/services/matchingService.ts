/**
 * Matching service — runs Ashtakoot Milan + dosha checks between two birth charts.
 */

import { getPlanetPositions, type PlanetPosition } from '../core/ephemeris';
import { getNakshatra } from '../core/nakshatra';
import { computeMatch, type MatchInput, type MatchReport } from '../core/matching';
import type { BirthData } from '../../types/astrology';

function buildMatchInput(positions: Record<string, PlanetPosition>): MatchInput {
  const moon = positions['MOON'];
  const asc = positions['ASCENDANT'];
  const mars = positions['MARS'];
  const houseFrom = (planetRashi: number, refRashi: number) => ((planetRashi - refRashi + 12) % 12) + 1;
  return {
    moonRashi: moon.rashi,
    moonNakshatra: getNakshatra(moon.longitude).index,
    marsHouseFromLagna: houseFrom(mars.rashi, asc.rashi),
    marsHouseFromMoon: houseFrom(mars.rashi, moon.rashi),
  };
}

export interface MatchSummary {
  person: { rashi: number; nakshatra: number; nakshatraName: string; isManglik: boolean };
  partner: { rashi: number; nakshatra: number; nakshatraName: string; isManglik: boolean };
  report: MatchReport;
}

export async function runMatching(person: BirthData, partner: BirthData): Promise<MatchSummary> {
  const [pPos, qPos] = await Promise.all([
    getPlanetPositions(person.date, person.latitude, person.longitude, person.timezone, person.ayanamsa),
    getPlanetPositions(partner.date, partner.latitude, partner.longitude, partner.timezone, partner.ayanamsa),
  ]);

  const a = buildMatchInput(pPos);
  const b = buildMatchInput(qPos);
  const report = computeMatch(a, b);

  const moonOf = (p: typeof a) => ({
    rashi: p.moonRashi,
    nakshatra: p.moonNakshatra,
    nakshatraName: getNakshatra(((p.moonNakshatra + 0.5) * (360 / 27))).name,
    isManglik: [1, 4, 7, 8, 12].includes(p.marsHouseFromLagna) || [1, 4, 7, 8, 12].includes(p.marsHouseFromMoon),
  });

  return {
    person: moonOf(a),
    partner: moonOf(b),
    report,
  };
}

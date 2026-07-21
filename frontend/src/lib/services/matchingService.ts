/**
 * Matching service — Ashtakoot Milan + dosha checks between two birth charts,
 * plus the interpretation layer that turns the score into a usable reading.
 */

import { getPlanetPositions, type PlanetPosition } from '../core/ephemeris';
import { getNakshatra } from '../core/nakshatra';
import { computeMatch, analyseManglik, type MatchInput, type MatchReport, type ManglikDetail } from '../core/matching';
import { computeVargas } from '../core/vargas';
import { buildMatchInsights, type MatchInsights } from '../core/matchInsights';
import type { BirthData } from '../../types/astrology';

const PLANET_KEYS = ['SUN', 'MOON', 'MARS', 'MERCURY', 'JUPITER', 'VENUS', 'SATURN', 'RAHU', 'KETU'] as const;

const titleCase = (k: string) => k.charAt(0) + k.slice(1).toLowerCase();

/**
 * Ashtakoot needs only the Moon and Mars. The interpretation layer needs the
 * whole chart plus the Navamsa, so both are assembled here.
 */
function buildMatchInput(positions: Record<string, PlanetPosition>): MatchInput {
  const moon = positions['MOON'];
  const asc = positions['ASCENDANT'];
  const mars = positions['MARS'];
  const houseFrom = (planetRashi: number, refRashi: number) => ((planetRashi - refRashi + 12) % 12) + 1;

  const planetRashis: Record<string, number> = {};
  const longitudes: Record<string, number> = {};
  const retro: Record<string, boolean> = {};
  for (const key of PLANET_KEYS) {
    const p = positions[key];
    if (!p) continue;
    planetRashis[titleCase(key)] = p.rashi;
    longitudes[titleCase(key)] = p.longitude;
    retro[titleCase(key)] = p.isRetrograde;
  }

  // The Navamsa is the chart classical astrology reads a marriage through.
  const vargas = computeVargas({ longitudes, retro, ascendantLongitude: asc.longitude });
  const d9Rashis: Record<string, number> = {};
  for (const p of vargas.planets) d9Rashis[p.planet] = p.d9Rashi;

  return {
    moonRashi: moon.rashi,
    moonNakshatra: getNakshatra(moon.longitude).index,
    marsHouseFromLagna: houseFrom(mars.rashi, asc.rashi),
    marsHouseFromMoon: houseFrom(mars.rashi, moon.rashi),
    ascendantRashi: asc.rashi,
    planetRashis,
    d9Rashis,
    d9Ascendant: vargas.d9Ascendant,
  };
}

export interface MatchPerson {
  rashi: number;
  nakshatra: number;
  nakshatraName: string;
  isManglik: boolean;
  manglik: ManglikDetail;
}

export interface MatchSummary {
  person: MatchPerson;
  partner: MatchPerson;
  report: MatchReport;
  insights: MatchInsights;
}

export async function runMatching(person: BirthData, partner: BirthData): Promise<MatchSummary> {
  const [pPos, qPos] = await Promise.all([
    getPlanetPositions(person.date, person.latitude, person.longitude, person.timezone, person.ayanamsa),
    getPlanetPositions(partner.date, partner.latitude, partner.longitude, partner.timezone, partner.ayanamsa),
  ]);

  const a = buildMatchInput(pPos);
  const b = buildMatchInput(qPos);
  const report = computeMatch(a, b);

  const describe = (p: MatchInput): MatchPerson => {
    const manglik = analyseManglik(p);
    return {
      rashi: p.moonRashi,
      nakshatra: p.moonNakshatra,
      nakshatraName: getNakshatra((p.moonNakshatra + 0.5) * (360 / 27)).name,
      isManglik: manglik.isManglik,
      manglik,
    };
  };

  return {
    person: describe(a),
    partner: describe(b),
    report,
    insights: buildMatchInsights(report, a, b),
  };
}

/**
 * Matching service — assembles both charts and runs the four-layer engine.
 *
 * Layer 1 needs only the Moon; Layers 2–4 need the whole chart, the Navamsa, the
 * Trimsamsa and every longitude (Layer 4 weights contacts by orb, so whole-sign
 * positions are not enough). All of it is built here so the core modules stay
 * free of ephemeris concerns.
 */

import { getPlanetPositions, type PlanetPosition } from '../core/ephemeris';
import { getNakshatra } from '../core/nakshatra';
import { analyseManglik, type MatchInput, type ManglikDetail } from '../core/matching';
import { buildLayeredReport, type LayeredMatchReport } from '../core/matchReport';
import { computeVargas, navamsaRashi } from '../core/vargas';
import { buildMatchInsights, type MatchInsights } from '../core/matchInsights';
import type { BirthData } from '../../types/astrology';

const PLANET_KEYS = ['SUN', 'MOON', 'MARS', 'MERCURY', 'JUPITER', 'VENUS', 'SATURN', 'RAHU', 'KETU'] as const;

const titleCase = (k: string) => k.charAt(0) + k.slice(1).toLowerCase();

function buildMatchInput(positions: Record<string, PlanetPosition>): MatchInput {
  const moon = positions['MOON'];
  const asc = positions['ASCENDANT'];
  const mars = positions['MARS'];
  const houseFrom = (planetRashi: number, refRashi: number) => ((planetRashi - refRashi + 12) % 12) + 1;

  const planetRashis: Record<string, number> = {};
  const planetLongitudes: Record<string, number> = {};
  const planetRetro: Record<string, boolean> = {};
  for (const key of PLANET_KEYS) {
    const p = positions[key];
    if (!p) continue;
    planetRashis[titleCase(key)] = p.rashi;
    planetLongitudes[titleCase(key)] = p.longitude;
    planetRetro[titleCase(key)] = p.isRetrograde;
  }

  const vargas = computeVargas({
    longitudes: planetLongitudes, retro: planetRetro, ascendantLongitude: asc.longitude,
  });
  const d9Rashis: Record<string, number> = {};
  const d30Rashis: Record<string, number> = {};
  for (const p of vargas.planets) {
    d9Rashis[p.planet] = p.d9Rashi;
    d30Rashis[p.planet] = p.divisions.D30.rashi;
  }

  const moonNak = getNakshatra(moon.longitude);

  return {
    moonRashi: moon.rashi,
    moonNakshatra: moonNak.index,
    // Vashya splits Dhanu and Makara at 15°, and two of the cancellation rules
    // need the pada and the nakshatra lord — none of which is recoverable from
    // the rashi alone.
    moonDegreeInSign: moon.rashiDegree,
    moonPada: moonNak.pada,
    moonNakshatraLord: moonNak.lord,
    moonNavamsa: navamsaRashi(moon.longitude),

    marsHouseFromLagna: houseFrom(mars.rashi, asc.rashi),
    marsHouseFromMoon: houseFrom(mars.rashi, moon.rashi),

    ascendantRashi: asc.rashi,
    ascendantLongitude: asc.longitude,
    planetRashis,
    planetLongitudes,
    planetRetro,
    d9Rashis,
    d9Ascendant: vargas.d9Ascendant,
    d30Rashis,
  };
}

export interface MatchPerson {
  rashi: number;
  nakshatra: number;
  nakshatraName: string;
  pada: number;
  isManglik: boolean;
  manglik: ManglikDetail;
}

export interface MatchSummary {
  person: MatchPerson;
  partner: MatchPerson;
  report: LayeredMatchReport;
  insights: MatchInsights;
}

/**
 * `personIsFemale` sets the boy/girl roles that Varna, Vashya and Gana score
 * against, and selects Jupiter as patikaraka in Layer 3. Three of the eight
 * kootas give a different answer when the roles swap, so this is an input rather
 * than something the engine guesses.
 */
export async function runMatching(
  person: BirthData,
  partner: BirthData,
  personIsFemale = true,
): Promise<MatchSummary> {
  const [pPos, qPos] = await Promise.all([
    getPlanetPositions(person.date, person.latitude, person.longitude, person.timezone, person.ayanamsa),
    getPlanetPositions(partner.date, partner.latitude, partner.longitude, partner.timezone, partner.ayanamsa),
  ]);

  const a = buildMatchInput(pPos);
  const b = buildMatchInput(qPos);
  const report = buildLayeredReport(a, b, { aIsFemale: personIsFemale });

  const describe = (m: MatchInput): MatchPerson => {
    const manglik = analyseManglik(m);
    return {
      rashi: m.moonRashi,
      nakshatra: m.moonNakshatra,
      nakshatraName: getNakshatra((m.moonNakshatra + 0.5) * (360 / 27)).name,
      pada: m.moonPada ?? 1,
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

/**
 * Vedic planetary calculations powered by Swiss Ephemeris (WASM).
 *
 * - Sub-arcsecond accuracy (DE431-derived ephemeris bundled in WASM)
 * - True Chitrapaksha Lahiri ayanamsa (Spica-anchored, not linear extrapolation)
 * - True (osculating) node for Rahu / Ketu
 * - IAU 2006 / Vondrák precession is built into Swiss Ephemeris
 *
 * Swiss Ephemeris is dual-licensed (GPL or commercial). See node_modules/swisseph-wasm/LICENSE.
 */

import { getSwe, preloadEphemeris, mod360, jdFromLocal, type SwissEph } from './swissEph';

// Re-exported for existing callers (main.tsx preloads at startup).
export { preloadEphemeris };

export type AyanamsaSystem = 'LAHIRI' | 'KRISHNAMURTI' | 'RAMAN';

export interface PlanetPosition {
  longitude: number;
  latitude: number;
  distance: number;
  speed: number;
  rashi: number;
  rashiDegree: number;
  nakshatra: number;
  nakshatraPada: number;
  isRetrograde: boolean;
}

// SE_SIDM_* values from Swiss Ephemeris. LAHIRI here is the true Chitrapaksha
// definition (Spica anchored), not a linear extrapolation.
const SID_MODES: Record<AyanamsaSystem, number> = {
  LAHIRI: 1,
  RAMAN: 3,
  KRISHNAMURTI: 5,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const NAKSHATRA_SPAN = 360 / 27;
const PADA_SPAN = NAKSHATRA_SPAN / 4;

function decompose(siderealLon: number) {
  const l = mod360(siderealLon);
  const rashi = Math.floor(l / 30);
  const rashiDegree = l % 30;
  const nakshatra = Math.min(Math.floor(l / NAKSHATRA_SPAN), 26);
  const nakDeg = l % NAKSHATRA_SPAN;
  const nakshatraPada = Math.min(Math.floor(nakDeg / PADA_SPAN) + 1, 4);
  return { rashi, rashiDegree, nakshatra, nakshatraPada };
}

function buildPosition(
  lon: number, lat: number, dist: number, speed: number, isRetrograde: boolean,
): PlanetPosition {
  const slon = mod360(lon);
  const { rashi, rashiDegree, nakshatra, nakshatraPada } = decompose(slon);
  return { longitude: slon, latitude: lat, distance: dist, speed, rashi, rashiDegree, nakshatra, nakshatraPada, isRetrograde };
}

// ─── Main entry point ────────────────────────────────────────────────────────
export async function getPlanetPositions(
  dateStr: string,
  latitude: number,
  longitude: number,
  timezone: string,
  ayanamsa: AyanamsaSystem = 'LAHIRI',
): Promise<Record<string, PlanetPosition>> {
  const swe = await getSwe();
  swe.set_sid_mode(SID_MODES[ayanamsa], 0, 0);
  const jd = jdFromLocal(swe, dateStr, timezone);

  const flags = swe.SEFLG_SWIEPH | swe.SEFLG_SIDEREAL | swe.SEFLG_SPEED;

  const bodies: Array<[string, number]> = [
    ['SUN', swe.SE_SUN],
    ['MOON', swe.SE_MOON],
    ['MERCURY', swe.SE_MERCURY],
    ['VENUS', swe.SE_VENUS],
    ['MARS', swe.SE_MARS],
    ['JUPITER', swe.SE_JUPITER],
    ['SATURN', swe.SE_SATURN],
  ];

  const positions: Record<string, PlanetPosition> = {};

  for (const [name, body] of bodies) {
    const r = swe.calc_ut(jd, body, flags);
    positions[name] = buildPosition(r[0], r[1], r[2], r[3], r[3] < 0);
  }

  // Rahu = true (osculating) lunar node. Ketu = opposite point, classically always retrograde.
  const rahu = swe.calc_ut(jd, swe.SE_TRUE_NODE, flags);
  positions.RAHU = buildPosition(rahu[0], rahu[1], rahu[2], rahu[3], true);
  positions.KETU = buildPosition(rahu[0] + 180, -rahu[1], rahu[2], rahu[3], true);

  // Ascendant via houses_ex (Placidus); ascmc[0] is the Ascendant in sidereal coords
  // because we pass SEFLG_SIDEREAL.
  const houses = swe.houses_ex(jd, flags, latitude, longitude, 'P');
  positions.ASCENDANT = buildPosition(houses.ascmc[0], 0, 0, 0, false);

  return positions;
}

// Body name → Swiss Ephemeris id resolver (used by the time-series sampler).
const BODY_ID: Record<string, (swe: SwissEph) => number> = {
  SUN: s => s.SE_SUN, MOON: s => s.SE_MOON, MERCURY: s => s.SE_MERCURY,
  VENUS: s => s.SE_VENUS, MARS: s => s.SE_MARS, JUPITER: s => s.SE_JUPITER,
  SATURN: s => s.SE_SATURN, RAHU: s => s.SE_TRUE_NODE,
};

/**
 * Sidereal longitude of one body at many UTC instants — a lightweight sampler
 * for slow-motion analyses (e.g. Saturn's Sade Sati timeline) where calling the
 * full getPlanetPositions hundreds of times would be wasteful. `dates` are UTC.
 */
export async function getBodyLongitudeSeries(
  bodyName: keyof typeof BODY_ID,
  dates: Date[],
  ayanamsa: AyanamsaSystem = 'LAHIRI',
): Promise<number[]> {
  const swe = await getSwe();
  swe.set_sid_mode(SID_MODES[ayanamsa], 0, 0);
  const flags = swe.SEFLG_SWIEPH | swe.SEFLG_SIDEREAL | swe.SEFLG_SPEED;
  const body = BODY_ID[bodyName](swe);
  return dates.map(d => {
    const hour = d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600;
    const jd = swe.julday(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), hour);
    const r = swe.calc_ut(jd, body, flags);
    return mod360(r[0]);
  });
}

export async function getAyanamsaValue(
  dateStr: string,
  timezone: string,
  ayanamsa: AyanamsaSystem = 'LAHIRI',
): Promise<number> {
  const swe = await getSwe();
  swe.set_sid_mode(SID_MODES[ayanamsa], 0, 0);
  const jd = jdFromLocal(swe, dateStr, timezone);
  return swe.get_ayanamsa_ut(jd);
}

/**
 * Ascendant across a band of birth-time offsets.
 *
 * Used to answer "how wrong would the birth time have to be for the rising sign
 * to change". The nominal rate of one degree per four minutes is only an average:
 * the true rate varies by more than a factor of two with latitude and with which
 * sign is rising, and it is furthest from nominal at high latitudes — precisely
 * where a borderline chart most needs a real number rather than an estimate.
 * So this measures instead of extrapolating.
 */
export async function getAscendantSamples(
  dateStr: string,
  latitude: number,
  longitude: number,
  timezone: string,
  ayanamsa: AyanamsaSystem = 'LAHIRI',
  bandMinutes = 15,
  stepMinutes = 1,
): Promise<Array<{ offsetMinutes: number; longitude: number }>> {
  const swe = await getSwe();
  swe.set_sid_mode(SID_MODES[ayanamsa], 0, 0);
  const flags = swe.SEFLG_SWIEPH | swe.SEFLG_SIDEREAL | swe.SEFLG_SPEED;
  const baseJd = jdFromLocal(swe, dateStr, timezone);

  const out: Array<{ offsetMinutes: number; longitude: number }> = [];
  for (let m = -bandMinutes; m <= bandMinutes; m += stepMinutes) {
    const jd = baseJd + m / 1440;          // minutes → fraction of a day
    const houses = swe.houses_ex(jd, flags, latitude, longitude, 'P');
    out.push({ offsetMinutes: m, longitude: mod360(houses.ascmc[0]) });
  }
  return out;
}

/**
 * Relocated ascendant: re-cast the chart for a new (lat, lon) at the SAME
 * birth UT. Planet positions don't change with location, only the houses do.
 */
export async function getRelocatedAscendant(
  birthDateStr: string,
  birthTimezone: string,
  newLat: number,
  newLon: number,
  ayanamsa: AyanamsaSystem = 'LAHIRI',
): Promise<{ longitude: number; rashi: number; rashiDegree: number }> {
  const swe = await getSwe();
  swe.set_sid_mode(SID_MODES[ayanamsa], 0, 0);
  const jd = jdFromLocal(swe, birthDateStr, birthTimezone);
  const flags = swe.SEFLG_SWIEPH | swe.SEFLG_SIDEREAL | swe.SEFLG_SPEED;
  const houses = swe.houses_ex(jd, flags, newLat, newLon, 'P');
  const longitude = mod360(houses.ascmc[0]);
  return {
    longitude,
    rashi: Math.floor(longitude / 30),
    rashiDegree: longitude % 30,
  };
}

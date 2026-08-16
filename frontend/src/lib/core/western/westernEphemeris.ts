/**
 * Western (tropical) planetary calculations, powered by the same Swiss
 * Ephemeris WASM build as the Vedic path (`../ephemeris.ts`).
 *
 * The only real difference from the Vedic calculation is which flag is
 * passed to `calc_ut`/`houses_ex`: omitting `SEFLG_SIDEREAL` returns tropical
 * (equinox-referenced) longitudes instead of sidereal ones — Swiss Ephemeris
 * only subtracts the ayanamsa when that flag is set, so whatever sidereal
 * mode the Vedic path last configured on the shared `swe` instance has no
 * effect here. Ten bodies (Sun through Pluto) instead of seven-plus-nodes,
 * and full Placidus house cusps (1–12) rather than just the Ascendant point,
 * since Western house placement is cusp-based (unequal), not whole-sign.
 */

import { getSwe, jdFromLocal, mod360 } from '../swissEph';

export interface WesternRawPosition {
  longitude: number;
  latitude: number;
  distance: number;
  speed: number;
  isRetrograde: boolean;
}

export interface WesternHousesRaw {
  /** Index 0 = house 1 cusp longitude … index 11 = house 12 cusp longitude. */
  cusps: number[];
  ascendant: number;
  midheaven: number;
}

export interface WesternRawChart {
  planets: Record<string, WesternRawPosition>;
  houses: WesternHousesRaw;
}

export const WESTERN_BODIES = [
  'SUN', 'MOON', 'MERCURY', 'VENUS', 'MARS',
  'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE', 'PLUTO',
] as const;

export type WesternBody = typeof WESTERN_BODIES[number];

/** Swiss Ephemeris body id, resolved lazily against the loaded instance. */
const BODY_ID: Record<WesternBody, (swe: Awaited<ReturnType<typeof getSwe>>) => number> = {
  SUN: s => s.SE_SUN, MOON: s => s.SE_MOON, MERCURY: s => s.SE_MERCURY,
  VENUS: s => s.SE_VENUS, MARS: s => s.SE_MARS, JUPITER: s => s.SE_JUPITER,
  SATURN: s => s.SE_SATURN, URANUS: s => s.SE_URANUS, NEPTUNE: s => s.SE_NEPTUNE,
  PLUTO: s => s.SE_PLUTO,
};

/**
 * Tropical positions for Sun–Pluto plus full Placidus house cusps, for one
 * birth moment/place. `dateStr` is local civil time ("YYYY-MM-DDTHH:mm:ss"),
 * resolved to UT via `timezone` (IANA name or `Etc/GMT±N`).
 */
export async function getWesternPositions(
  dateStr: string,
  latitude: number,
  longitude: number,
  timezone: string,
): Promise<WesternRawChart> {
  const swe = await getSwe();
  const jd = jdFromLocal(swe, dateStr, timezone);
  // No SEFLG_SIDEREAL: tropical longitudes, equinox-of-date referenced.
  const flags = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED;

  const planets: Record<string, WesternRawPosition> = {};
  for (const name of WESTERN_BODIES) {
    const r = swe.calc_ut(jd, BODY_ID[name](swe), flags);
    planets[name] = { longitude: mod360(r[0]), latitude: r[1], distance: r[2], speed: r[3], isRetrograde: r[3] < 0 };
  }

  // Placidus ('P'). cusps[1..12] hold house 1..12; cusps[0] is unused by the
  // underlying swe_houses_ex convention. ascmc[0]=Ascendant, ascmc[1]=MC.
  const raw = swe.houses_ex(jd, flags, latitude, longitude, 'P');
  const cusps: number[] = [];
  for (let h = 1; h <= 12; h++) cusps.push(mod360(raw.cusps[h]));

  return {
    planets,
    houses: { cusps, ascendant: mod360(raw.ascmc[0]), midheaven: mod360(raw.ascmc[1]) },
  };
}

/**
 * Tropical longitude of one body at many UTC instants — for the "Now" tab's
 * transit sampling, mirroring `getBodyLongitudeSeries` on the Vedic side.
 */
export async function getWesternLongitudeSeries(
  bodyName: WesternBody,
  dates: Date[],
): Promise<number[]> {
  const swe = await getSwe();
  const flags = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED;
  const body = BODY_ID[bodyName](swe);
  return dates.map(d => {
    const hour = d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600;
    const jd = swe.julday(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), hour);
    const r = swe.calc_ut(jd, body, flags);
    return mod360(r[0]);
  });
}

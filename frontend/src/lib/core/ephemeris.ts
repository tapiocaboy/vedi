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

import SwissEphBase from 'swisseph-wasm';

// Swiss Ephemeris WASM + ephemeris data file + Emscripten loader. The
// swissephAssets() plugin in vite.config.ts serves these from /wasm/ in dev
// and emits them under dist/wasm/ in build. We avoid `swisseph-wasm/wasm/*`
// imports because the package's exports field blocks deep imports.
const WASM_BASE = '/wasm/';
const wasmUrl = `${WASM_BASE}swisseph.wasm`;
const dataUrl = `${WASM_BASE}swisseph.data`;
const loaderUrl = `${WASM_BASE}swisseph.js`;

// The bundled .d.ts is incomplete (missing `houses_ex` and `get_ayanamsa_ut`,
// and `houses` is mistyped). Augment the type with what we actually call.
type SwissEph = SwissEphBase & {
  SweModule: unknown;
  set_ephe_path(path: string): void;
  houses_ex(jd: number, iflag: number, lat: number, lon: number, hsys: string): { cusps: Float64Array; ascmc: Float64Array };
  get_ayanamsa_ut(jd: number): number;
};

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

// ─── WASM singleton (lazy-init, cached promise) ──────────────────────────────
let _sweInstancePromise: Promise<SwissEph> | null = null;

function getSwe(): Promise<SwissEph> {
  if (!_sweInstancePromise) {
    _sweInstancePromise = (async () => {
      // Dynamically import the Emscripten loader from /wasm/ so we can pass our
      // own locateFile (the bundled wrapper's path resolution doesn't survive
      // Vite's pre-bundling).
      const mod = await import(/* @vite-ignore */ loaderUrl);
      const factory = (mod as { default: (cfg: unknown) => Promise<{ HEAP32?: Int32Array; HEAPF64: Float64Array }> }).default;
      const SweModule = await factory({
        locateFile: (p: string) => {
          if (p.endsWith('.wasm')) return wasmUrl;
          if (p.endsWith('.data')) return dataUrl;
          return p;
        },
      });
      if (!SweModule.HEAP32) {
        SweModule.HEAP32 = new Int32Array(SweModule.HEAPF64.buffer);
      }
      const swe = new SwissEphBase() as SwissEph;
      swe.SweModule = SweModule;
      swe.set_ephe_path('sweph');
      return swe;
    })();
  }
  return _sweInstancePromise;
}

/** Preload Swiss Ephemeris WASM. Call at app startup to avoid latency on first calc. */
export function preloadEphemeris(): Promise<void> {
  return getSwe().then(() => undefined);
}

// SE_SIDM_* values from Swiss Ephemeris. LAHIRI here is the true Chitrapaksha
// definition (Spica anchored), not a linear extrapolation.
const SID_MODES: Record<AyanamsaSystem, number> = {
  LAHIRI: 1,
  RAMAN: 3,
  KRISHNAMURTI: 5,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function mod360(x: number): number {
  return ((x % 360) + 360) % 360;
}

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

/** Convert local datetime string to UTC Date using Intl.DateTimeFormat. */
function localToUTC(localDateStr: string, timezone: string): Date {
  const [datePart, timePart = '00:00:00'] = localDateStr.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const parts = timePart.replace('Z', '').split(':');
  const hour = parseInt(parts[0] || '0');
  const minute = parseInt(parts[1] || '0');
  const second = parseInt(parts[2] || '0');

  // POSIX-style Etc/GMT±X (sign is inverted: Etc/GMT+5 means UTC−5)
  const etcMatch = timezone.match(/^Etc\/GMT([+-])(\d+)$/);
  if (etcMatch) {
    const sign = etcMatch[1] === '+' ? -1 : 1;
    const offsetMin = sign * parseInt(etcMatch[2]) * 60;
    return new Date(Date.UTC(year, month - 1, day, hour, minute, second) - offsetMin * 60000);
  }
  if (timezone === 'UTC') {
    return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  }

  // Named IANA timezones: iterative convergence via Intl
  let approx = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const getLocal = (d: Date) => {
    const f = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
    const p = Object.fromEntries(f.formatToParts(d).map(x => [x.type, x.value]));
    return new Date(Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second));
  };

  for (let i = 0; i < 3; i++) {
    const localUtc = getLocal(approx);
    const target = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    const diff = target.getTime() - localUtc.getTime();
    approx = new Date(approx.getTime() + diff);
    if (Math.abs(diff) < 1000) break;
  }
  return approx;
}

function jdFromLocal(swe: SwissEph, localDateStr: string, timezone: string): number {
  const utc = localToUTC(localDateStr, timezone);
  const hour = utc.getUTCHours() + utc.getUTCMinutes() / 60 + utc.getUTCSeconds() / 3600;
  return swe.julday(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate(), hour);
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

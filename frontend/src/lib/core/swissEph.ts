/**
 * Shared Swiss Ephemeris (WASM) singleton + time-conversion helpers.
 *
 * Both the Vedic path (`ephemeris.ts`, sidereal) and the Western path
 * (`western/westernEphemeris.ts`, tropical) need the *same* WASM instance —
 * loading it twice would double the network fetch and memory footprint for no
 * benefit, since sidereal mode is a per-call flag/state, not a different
 * build. Extracted from `ephemeris.ts` unchanged; that module's public API is
 * untouched by this split.
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
export type SwissEph = SwissEphBase & {
  SweModule: unknown;
  set_ephe_path(path: string): void;
  houses_ex(jd: number, iflag: number, lat: number, lon: number, hsys: string): { cusps: Float64Array; ascmc: Float64Array };
  get_ayanamsa_ut(jd: number): number;
};

// ─── WASM singleton (lazy-init, cached promise) ──────────────────────────────
let _sweInstancePromise: Promise<SwissEph> | null = null;

export function getSwe(): Promise<SwissEph> {
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function mod360(x: number): number {
  return ((x % 360) + 360) % 360;
}

/** Convert local datetime string to UTC Date using Intl.DateTimeFormat. */
export function localToUTC(localDateStr: string, timezone: string): Date {
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

export function jdFromLocal(swe: SwissEph, localDateStr: string, timezone: string): number {
  const utc = localToUTC(localDateStr, timezone);
  const hour = utc.getUTCHours() + utc.getUTCMinutes() / 60 + utc.getUTCSeconds() / 3600;
  return swe.julday(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate(), hour);
}

/**
 * Node build of src/lib/core/swissEph.ts for the backtest.
 *
 * The browser module fetches the WASM from /wasm/ over HTTP; under Node the
 * package can load its own binaries. backtest/vite.config.ts aliases every
 * relative `swissEph` import here, so the production engine runs unmodified.
 * The time helpers are re-exported from the real module (imported by explicit
 * path, which the alias deliberately does not match).
 */
import SwissEphBase from 'swisseph-wasm';

export { mod360, localToUTC, jdFromLocal } from '../src/lib/core/swissEph.ts';
export type { SwissEph } from '../src/lib/core/swissEph.ts';

let instance: Promise<any> | null = null;

export function getSwe(): Promise<any> {
  if (!instance) {
    instance = (async () => {
      const swe = new SwissEphBase() as any;
      await swe.initSwissEph();
      return swe;
    })();
  }
  return instance;
}

export function preloadEphemeris(): Promise<void> {
  return getSwe().then(() => undefined);
}

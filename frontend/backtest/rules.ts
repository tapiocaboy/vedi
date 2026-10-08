/**
 * PRE-REGISTERED classical event-timing rules (written before any were scored).
 *
 * Nothing here was fitted to the famous-people set. House sets and weights are
 * fixed from classical Parashari practice; the backtest then reports every one,
 * hits and misses alike.
 *
 *   Event type → houses (primary / wide)
 *     M marriage : 7              / 2,7,11
 *     C child    : 5              / 2,5,9
 *     A rise     : 10,11          / 1,5,9,10,11
 *     U upheaval : 8              / 6,8,12
 *     D death*   : 2,7 (maraka)   / 2,7,8        (*validation only, never shipped)
 *
 *   Natal connection of a planet P to a house set H:
 *     +2 per house of H that P owns, +2 if P sits in H, +1 per house of H it
 *     aspects (graha drishti, whole-sign), +karaka bonus, and a node borrows
 *     half the connection of its sign-dispositor.
 *   Dasha activation = 0.30·MD + 0.45·AD + 0.25·PD  (antardasha is where events land).
 *   Trigger (Jupiter / Saturn): transiting planet sits in, or aspects, a sign
 *     that is a house of H from the Lagna. Double transit = both at once.
 *   Combo = dasha activation + 1·Jupiter trigger + 1·Saturn trigger.
 *   Gochara from the Moon (type-independent): Jupiter in 2,5,7,9,11; Saturn in
 *     3,6,11 (good) or 12,1,2,4,8 (Sade Sati / Kantaka / Ashtama, bad).
 */
import { lordedHousesFor } from '../src/lib/core/dashaStrength';
import { aspectsRashi } from '../src/lib/core/natalFoundation';
import { RASHI_LORDS } from '../src/lib/core/planetaryAnalysis';
import type { Cast, Chain } from './lib';

export type EType = 'M' | 'C' | 'A' | 'U' | 'D';
export const HOUSE_SETS: Record<EType, { primary: number[]; wide: number[] }> = {
  M: { primary: [7], wide: [2, 7, 11] },
  C: { primary: [5], wide: [2, 5, 9] },
  A: { primary: [10, 11], wide: [1, 5, 9, 10, 11] },
  U: { primary: [8], wide: [6, 8, 12] },
  D: { primary: [2, 7], wide: [2, 7, 8] },
};
const KARAKA: Record<EType, Record<string, number>> = {
  M: { Venus: 2 }, C: { Jupiter: 2 }, A: { Sun: 1, Saturn: 1 },
  U: { Saturn: 1, Rahu: 1, Ketu: 1, Mars: 1 }, D: { Saturn: 1 },
};
export const DASHA_W = { md: 0.30, ad: 0.45, pd: 0.25 };

const houseOf = (rashi: number, lagna: number) => ((rashi - lagna + 12) % 12) + 1;

/** Natal connection of planet P to house set H (see header). */
export function connection(c: Cast, planet: string, H: number[], type: EType, depth = 0): number {
  const lagna = c.lagna;
  const rashi = c.planetRashi[planet];
  let s = 0;
  if (planet !== 'Rahu' && planet !== 'Ketu') {
    s += 2 * lordedHousesFor(planet, lagna).filter(h => H.includes(h)).length;
  }
  if (H.includes(houseOf(rashi, lagna))) s += 2;
  if (planet !== 'Rahu' && planet !== 'Ketu') {
    let asp = 0;
    for (const h of H) if (aspectsRashi(planet, rashi, (lagna + h - 1) % 12)) asp++;
    s += Math.min(asp, 2);
  } else if (depth === 0) {
    const disp = RASHI_LORDS[rashi];
    if (disp && disp !== planet) s += 0.5 * connection(c, disp, H, type, 1);
  }
  s += KARAKA[type][planet] ?? 0;
  return s;
}

export interface Transit { Jupiter: number; Saturn: number }   // sidereal longitudes

/** Does the transiting planet sit in, or aspect, a sign that is a house of H? */
export function triggers(c: Cast, planet: 'Jupiter' | 'Saturn', lon: number, H: number[]): boolean {
  const sign = Math.floor(lon / 30) % 12;
  return H.some(h => {
    const target = (c.lagna + h - 1) % 12;
    return sign === target || aspectsRashi(planet, sign, target);
  });
}

const fromMoon = (c: Cast, lon: number) => ((Math.floor(lon / 30) % 12) - c.moonRashi + 12) % 12 + 1;

export function featuresFor(c: Cast, ch: Chain, tr: Transit): Record<string, number> {
  const f: Record<string, number> = {};
  const jh = fromMoon(c, tr.Jupiter), sh = fromMoon(c, tr.Saturn);
  f['gochara jupGood'] = [2, 5, 7, 9, 11].includes(jh) ? 1 : 0;
  f['gochara satGood'] = [3, 6, 11].includes(sh) ? 1 : 0;
  f['gochara satBad'] = [12, 1, 2, 4, 8].includes(sh) ? 1 : 0;
  for (const type of Object.keys(HOUSE_SETS) as EType[]) {
    for (const variant of ['primary', 'wide'] as const) {
      const H = HOUSE_SETS[type][variant];
      const md = connection(c, ch.md, H, type), ad = connection(c, ch.ad, H, type), pd = connection(c, ch.pd, H, type);
      const act = DASHA_W.md * md + DASHA_W.ad * ad + DASHA_W.pd * pd;
      const jup = triggers(c, 'Jupiter', tr.Jupiter, H) ? 1 : 0;
      const sat = triggers(c, 'Saturn', tr.Saturn, H) ? 1 : 0;
      const k = `${type}.${variant}`;
      f[`${k} dashaAct`] = act;
      f[`${k} md&ad linked`] = md >= 2 && ad >= 2 ? 1 : 0;
      f[`${k} jupTrigger`] = jup;
      f[`${k} satTrigger`] = sat;
      f[`${k} doubleTransit`] = jup && sat ? 1 : 0;
      f[`${k} combo`] = act + jup + sat;
    }
  }
  return f;
}

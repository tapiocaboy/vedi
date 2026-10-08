/**
 * Does the birth chart point to the field a person became famous in?
 *
 *   BT_DATA=people550 TZ=UTC npm run backtest -- backtest/natalProfession.ts
 *
 * Classical claims, PRE-REGISTERED before this ran (one-sided, "more often than expected"):
 *   sports      Mars in a kendra · Mars in or aspecting the 10th · 10th lord Mars · Mars in D10 lagna/10th
 *               · Mars rising or culminating (houses 12, 1, 9, 10 — the Vedic analogue of Gauquelin's "Mars effect")
 *   power       Sun in a kendra · Sun in or aspecting the 10th · 10th lord Sun · Sun in D10 lagna/10th
 *   (politics, royalty, military)   · Jupiter rising or culminating
 *   arts        Venus in a kendra · Venus in or aspecting the 10th · 10th lord Venus · Venus in D10 lagna/10th
 *   (film, music, art)              · Moon in a kendra · Jupiter rising or culminating
 *   literature  Mercury in a kendra · Mercury in or aspecting the 10th · 10th lord Mercury · Mercury in D10 lagna/10th
 *               · Moon rising or culminating
 *
 * Control. Everything above depends on the TIME of birth (through the Lagna), so
 * each person is compared with themselves born at 47 other times of the same
 * day (every 30 minutes): same place, season, era and planets-in-signs, only the
 * houses move. Expected = Σ over people of the share of those times that have
 * the feature. This cancels birth season, era, and the sample's own fame.
 *
 * Secondary: an open scan of every planet × house × group on the DISCOVERY half
 * (|z| ≥ 3 selected), tested once on CONFIRMATION.
 */
import { getPlanetPositions } from '../src/lib/core/ephemeris';
import { RASHI_LORDS } from '../src/lib/core/planetaryAnalysis';
import { aspectsRashi } from '../src/lib/core/natalFoundation';
import { dasamsaRashi } from '../src/lib/core/vargas';
import { PEOPLE, splitOf, type Split } from './lib';

const GROUP_OF: Record<string, string> = {
  sports: 'sports', politics: 'power', royalty: 'power', military: 'power',
  film: 'arts', music: 'arts', art: 'arts', literature: 'literature',
};
const GROUPS = ['sports', 'power', 'arts', 'literature'];
const P9 = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

type Feat = Record<string, number>;
function features(pos: Awaited<ReturnType<typeof getPlanetPositions>>): Feat {
  const lagna = pos.ASCENDANT.rashi;
  const house = (p: string) => ((pos[p.toUpperCase()].rashi - lagna + 12) % 12) + 1;
  const tenth = (lagna + 9) % 12;
  const d10Lagna = dasamsaRashi(pos.ASCENDANT.longitude);
  const f: Feat = {};
  for (const p of P9) {
    const h = house(p);
    for (let k = 1; k <= 12; k++) f[`${p} in ${k}`] = h === k ? 1 : 0;
    f[`${p} in kendra`] = [1, 4, 7, 10].includes(h) ? 1 : 0;
    f[`${p} rising/culminating`] = [12, 1, 9, 10].includes(h) ? 1 : 0;
    f[`${p} in/aspects 10th`] = h === 10 || (!['Rahu', 'Ketu'].includes(p) && aspectsRashi(p, pos[p.toUpperCase()].rashi, tenth)) ? 1 : 0;
    f[`10th lord ${p}`] = RASHI_LORDS[tenth] === p ? 1 : 0;
    const d10 = dasamsaRashi(pos[p.toUpperCase()].longitude);
    f[`${p} in D10 lagna/10th`] = d10 === d10Lagna || d10 === (d10Lagna + 9) % 12 ? 1 : 0;
  }
  return f;
}

const HYP: [string, string][] = [
  ['sports', 'Mars in kendra'], ['sports', 'Mars in/aspects 10th'], ['sports', '10th lord Mars'], ['sports', 'Mars in D10 lagna/10th'], ['sports', 'Mars rising/culminating'],
  ['power', 'Sun in kendra'], ['power', 'Sun in/aspects 10th'], ['power', '10th lord Sun'], ['power', 'Sun in D10 lagna/10th'], ['power', 'Jupiter rising/culminating'],
  ['arts', 'Venus in kendra'], ['arts', 'Venus in/aspects 10th'], ['arts', '10th lord Venus'], ['arts', 'Venus in D10 lagna/10th'], ['arts', 'Moon in kendra'], ['arts', 'Jupiter rising/culminating'],
  ['literature', 'Mercury in kendra'], ['literature', 'Mercury in/aspects 10th'], ['literature', '10th lord Mercury'], ['literature', 'Mercury in D10 lagna/10th'], ['literature', 'Moon rising/culminating'],
];

// O and E per (split, group, feature)
const O: Record<string, number> = {}, E: Record<string, number> = {}, V: Record<string, number> = {}, N: Record<string, number> = {};
const bump = (k: string, o: number, e: number) => { O[k] = (O[k] ?? 0) + o; E[k] = (E[k] ?? 0) + e; V[k] = (V[k] ?? 0) + e * (1 - e); N[k] = (N[k] ?? 0) + 1; };

const MIN = 60000;
for (const p of PEOPLE) {
  const g = GROUP_OF[p.profession ?? ''];
  if (!g) continue;
  const split = splitOf(p);
  const t0 = Date.parse(p.utcBirth + 'Z');
  const actual = features(await getPlanetPositions(p.utcBirth, p.lat, p.lon, 'UTC', 'LAHIRI'));
  const ctrl: Feat[] = [];
  for (let k = -24; k < 24; k++) {
    if (k === 0) continue;
    ctrl.push(features(await getPlanetPositions(new Date(t0 + k * 30 * MIN).toISOString().slice(0, 19), p.lat, p.lon, 'UTC', 'LAHIRI')));
  }
  for (const key of Object.keys(actual)) {
    const e = ctrl.reduce((s, c) => s + c[key], 0) / ctrl.length;
    for (const sp of [split, 'all'] as const) bump(`${sp}|${g}|${key}`, actual[key], e);
  }
}

const sf = (z: number) => { const t = 1 / (1 + 0.2316419 * Math.abs(z)); const d = 0.3989423 * Math.exp(-z * z / 2); const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? p : 1 - p; };
const stat = (k: string) => ({ O: O[k] ?? 0, E: E[k] ?? 0, n: N[k] ?? 0, lift: (O[k] ?? 0) / (E[k] || 1e-9), z: ((O[k] ?? 0) - (E[k] ?? 0)) / Math.sqrt(V[k] || 1e-9) });

console.log('people per group:', GROUPS.map(g => `${g} ${N[`all|${g}|Sun in 1`] ?? 0}`).join(', '));
console.log('\n=== PRE-REGISTERED (all 544 lives; same-day random-time control; Holm over 21) ===');
const pre = HYP.map(([g, f]) => {
  const s = stat(`all|${g}|${f}`);
  // the same feature in the other groups — a profession signature should be specific
  const others = GROUPS.filter(x => x !== g).map(x => stat(`all|${x}|${f}`));
  const oO = others.reduce((a, b) => a + b.O, 0), oE = others.reduce((a, b) => a + b.E, 0);
  return { g, f, ...s, p: sf(s.z), others: oO / (oE || 1e-9) };
}).sort((a, b) => a.p - b.p);
pre.forEach((h, i) => {
  const holm = Math.min(1, h.p * (pre.length - i));
  console.log(`${h.g.padEnd(10)} ${h.f.padEnd(26)} O ${String(h.O).padStart(3)} / E ${h.E.toFixed(1).padStart(5)}  lift ${h.lift.toFixed(2)}  z ${h.z.toFixed(2).padStart(5)}  p ${h.p.toFixed(3)}  Holm ${holm.toFixed(3)}   (other groups: lift ${h.others.toFixed(2)})`);
});

console.log('\n=== OPEN SCAN on discovery (every planet × house / kendra / 10th link × group), |z| ≥ 3 ===');
const keys = Object.keys(O).filter(k => k.startsWith('discovery|'));
const sel = keys.map(k => ({ k, ...stat(k) })).filter(s => Math.abs(s.z) >= 3 && s.n >= 20);
console.log(`tests: ${keys.length}; chance expectation at |z|≥3: ${(keys.length * 0.0027).toFixed(1)}; selected: ${sel.length}`);
for (const s of sel) {
  const c = stat(s.k.replace('discovery|', 'confirmation|'));
  const p = sf(Math.sign(s.z) * c.z);
  console.log(`${s.k.replace('discovery|', '').padEnd(36)} discovery lift ${s.lift.toFixed(2)} (z ${s.z.toFixed(1)})  →  confirmation lift ${c.lift.toFixed(2)} (z ${c.z.toFixed(1)}), one-sided p ${p.toFixed(3)} ${p * sel.length < 0.05 ? 'REPLICATED' : 'not replicated'}`);
}

/**
 * Score the pre-registered combination library (combos.ts) against the 550 set.
 *
 *   BT_DATA=people550 TZ=UTC npm run backtest -- backtest/comboEval.ts
 *
 * Statistic. For an event on day e, each indicator is either present or absent
 * that day. Its expected rate is the share of the SAME person's days within ±4
 * years of e on which it is present (every 3rd day). Comparing an event with its
 * own neighbourhood removes everything slow — age, era, the person's whole
 * chart, how famous they are — and leaves exactly what a timing claim asserts:
 * that this moment is more marked than the moments around it.
 *   O = events with the indicator, E = Σ expected rates, z = (O − E) / √Σp(1−p),
 *   lift = O / E. A life-wide baseline (age 18 → end) is reported alongside.
 *
 * Discovery → confirmation follows the bar fixed in combos.ts. The confirmation
 * table is printed only for indicators the discovery half selected.
 *
 * Writes backtest/data/combo_results.json (every indicator, every split) and
 * backtest/data/combo_samples.json (event + matched-baseline vectors for model.ts).
 */
import { writeFileSync } from 'fs';
import path from 'path';
import { getBodyLongitudeSeries } from '../src/lib/core/ephemeris';
import { PEOPLE, cast, splitOf, at, DAY, YEAR, mulberry32, type Split } from './lib';
import { FEATURES, TYPES, natalOf, type EType, type Sky, type ChainState } from './combos';

const STEP = 3;                    // baseline sampling, days (co-prime with 7 and the Moon's cycles)
const HALF = Math.round(4 * 365.25);
const MIN_BASE = 120;              // baseline points required (~1 year)
const SAMPLES_PER_EVENT = 40;
const TODAY = Date.UTC(2026, 9, 8, 12);
const F = FEATURES.length;

// ── global daily sky ─────────────────────────────────────────────────────────
const firstBirth = Math.min(...PEOPLE.map(p => Date.parse(p.utcBirth + 'Z')));
const T0 = Date.UTC(new Date(firstBirth).getUTCFullYear() - 1, 0, 1, 12);
const NDAYS = Math.ceil((TODAY - T0) / DAY) + 2;
const dayIdx = (ms: number) => Math.floor((ms - T0) / DAY + 1e-9);
const dates = Array.from({ length: NDAYS }, (_, i) => new Date(T0 + i * DAY));
console.error(`sky table: ${NDAYS} days from ${new Date(T0).toISOString().slice(0, 10)}…`);
const BODIES = ['SUN', 'MOON', 'MARS', 'MERCURY', 'JUPITER', 'VENUS', 'SATURN', 'RAHU'] as const;
const TABLE: Record<string, Float64Array> = {};
for (const b of BODIES) TABLE[b] = Float64Array.from(await getBodyLongitudeSeries(b, dates));
const moving = (b: string, i: number) => { const j = Math.min(i + 1, NDAYS - 1), k = Math.max(i - 1, 0); return ((TABLE[b][j] - TABLE[b][k] + 540) % 360) - 180; };
function skyAt(i: number): Sky {
  return {
    Sun: TABLE.SUN[i], Moon: TABLE.MOON[i], Mars: TABLE.MARS[i], Mercury: TABLE.MERCURY[i],
    Jupiter: TABLE.JUPITER[i], Venus: TABLE.VENUS[i], Saturn: TABLE.SATURN[i], Rahu: TABLE.RAHU[i],
    retro: { Mars: moving('MARS', i) < 0, Mercury: moving('MERCURY', i) < 0, Jupiter: moving('JUPITER', i) < 0, Venus: moving('VENUS', i) < 0, Saturn: moving('SATURN', i) < 0 },
  };
}
console.error('sky table done');

// ── accumulators ─────────────────────────────────────────────────────────────
type Acc = { O: number; E: number; V: number; El: number; Vl: number; n: number; per: Map<number, [number, number]> };
const acc: Record<string, Acc> = {};            // `${split}|${type}|${featureIndex}`
const get = (k: string) => (acc[k] ??= { O: 0, E: 0, V: 0, El: 0, Vl: 0, n: 0, per: new Map() });
const samples: { id: number; split: Split; type: EType; event: string; base: string[] }[] = [];
const eventCounts: Record<string, number> = {};

const bits = (v: Uint8Array) => Array.from(v).join('');
const rnd = mulberry32(99);
const t0 = Date.now();
let done = 0;

for (const person of PEOPLE) {
  const c = await cast(person);
  const n = natalOf(c);
  const split = splitOf(person);
  const birthDay = dayIdx(c.birth.getTime()) + 1;
  const endMs = person.death ? at(person.death).getTime() : TODAY;
  const endDay = Math.min(dayIdx(endMs), NDAYS - 2);
  if (endDay - birthDay < 365 * 2) continue;

  // pratyantardasha timeline in day units
  type Seg = { s: number; e: number; md: string; ad: string; pd: string; adIndex: number; mdS: number; mdE: number; adS: number; adE: number };
  const segs: Seg[] = [];
  const toDay = (d: Date) => (d.getTime() - T0) / DAY;
  for (const m of c.dasha.generateMahadashaTimeline(120)) {
    c.dasha.calculateAntardasha(m).forEach((a, ai) => {
      for (const p of c.dasha.calculatePratyantardasha(a)) {
        segs.push({ s: toDay(p.start), e: toDay(p.end), md: m.lord, ad: a.lord, pd: p.lord, adIndex: ai, mdS: toDay(m.start), mdE: toDay(m.end), adS: toDay(a.start), adE: toDay(a.end) });
      }
    });
  }
  let ptr = 0;
  const chainAtDay = (d: number): ChainState => {
    if (d < segs[ptr].s) ptr = 0;
    while (ptr < segs.length - 1 && segs[ptr].e <= d) ptr++;
    const g = segs[ptr];
    return { md: g.md, ad: g.ad, pd: g.pd, adIndex: g.adIndex, dMd: Math.min(d - g.mdS, g.mdE - d), dAd: Math.min(d - g.adS, g.adE - d), dPd: Math.min(d - g.s, g.e - d) };
  };
  const vec = (d: number) => {
    const ch = chainAtDay(d), s = skyAt(d), v = new Uint8Array(F);
    for (let k = 0; k < F; k++) v[k] = FEATURES[k].f(n, ch, s) ? 1 : 0;
    return v;
  };

  // baseline grid over the whole life, with per-feature prefix sums
  const gridDays: number[] = [];
  for (let d = birthDay; d <= endDay; d += STEP) gridDays.push(d);
  const G = gridDays.length;
  const prefix = new Int32Array((G + 1) * F);
  const gridVecs: Uint8Array[] = [];
  ptr = 0;
  for (let g = 0; g < G; g++) {
    const v = vec(gridDays[g]);
    gridVecs.push(v);
    const row = (g + 1) * F, prev = g * F;
    for (let k = 0; k < F; k++) prefix[row + k] = prefix[prev + k] + v[k];
  }
  const lowerIdx = (day: number) => { let lo = 0, hi = G; while (lo < hi) { const m = (lo + hi) >> 1; if (gridDays[m] < day) lo = m + 1; else hi = m; } return lo; };
  const adultFrom = lowerIdx(birthDay + Math.round(18 * 365.25));

  // events
  const evs: { type: EType; day: number }[] = [];
  for (const e of person.events) {
    if (e.posthumous || !e.date) continue;
    for (const cat of e.cats) if (cat !== 'T') evs.push({ type: cat as EType, day: dayIdx(at(e.date).getTime()) });
  }
  if (person.death && person.deathKind === 'died') evs.push({ type: 'D', day: dayIdx(at(person.death).getTime()) });

  for (const ev of evs) {
    if (ev.day <= birthDay || ev.day > endDay + 1) continue;
    const lo = lowerIdx(ev.day - HALF), hi = lowerIdx(ev.day + HALF + 1);
    const nb = hi - lo;
    if (nb < MIN_BASE) continue;
    const nLife = G - adultFrom;
    ptr = 0;
    const v = vec(ev.day);
    eventCounts[`${split}|${ev.type}`] = (eventCounts[`${split}|${ev.type}`] ?? 0) + 1;
    for (let k = 0; k < F; k++) {
      const ft = FEATURES[k].type;
      if (ft !== '*' && ft !== ev.type) continue;
      const p = (prefix[hi * F + k] - prefix[lo * F + k]) / nb;
      const pl = nLife > 0 ? (prefix[G * F + k] - prefix[adultFrom * F + k]) / nLife : p;
      const a = get(`${split}|${ev.type}|${k}`);
      a.O += v[k]; a.E += p; a.V += p * (1 - p); a.El += pl; a.Vl += pl * (1 - pl); a.n++;
      const cur = a.per.get(person.id) ?? [0, 0];
      cur[0] += v[k]; cur[1] += p; a.per.set(person.id, cur);
    }
    const base: string[] = [];
    for (let j = 0; j < SAMPLES_PER_EVENT; j++) base.push(bits(gridVecs[lo + Math.floor(rnd() * nb)]));
    samples.push({ id: person.id, split, type: ev.type, event: bits(v), base });
  }
  if (++done % 50 === 0) console.error(`  ${done}/${PEOPLE.length} people, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}

// ── statistics ───────────────────────────────────────────────────────────────
function boot(per: Map<number, [number, number]>, B = 1000, seed = 5) {
  const g = [...per.values()], r = mulberry32(seed), out: number[] = [];
  for (let b = 0; b < B; b++) { let o = 0, e = 0; for (let i = 0; i < g.length; i++) { const x = g[Math.floor(r() * g.length)]; o += x[0]; e += x[1]; } out.push(o / (e || 1e-9)); }
  out.sort((a, b) => a - b);
  return [out[Math.floor(B * 0.025)], out[Math.floor(B * 0.975)]];
}
const normSf = (z: number) => 0.5 * erfc(z / Math.SQRT2);
function erfc(x: number) { const t = 1 / (1 + 0.5 * Math.abs(x)); const y = t * Math.exp(-x * x - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))))); return x >= 0 ? y : 2 - y; }

type Row = { key: string; type: EType; group: string; split: Split; n: number; O: number; E: number; V: number; lift: number; z: number; zLife: number; liftLife: number; ci?: number[] };
const rows: Row[] = [];
for (const [k, a] of Object.entries(acc)) {
  const [split, type, fi] = k.split('|');
  const f = FEATURES[+fi];
  rows.push({
    key: f.key, type: type as EType, group: f.group, split: split as Split, n: a.n, O: a.O, E: a.E, V: a.V,
    lift: a.O / (a.E || 1e-9), z: (a.O - a.E) / Math.sqrt(a.V || 1e-9),
    zLife: (a.O - a.El) / Math.sqrt(a.Vl || 1e-9), liftLife: a.O / (a.El || 1e-9),
  });
}
const R = (split: Split, type: EType, key: string) => rows.find(r => r.split === split && r.type === type && r.key === key);
const fmt = (r?: Row) => r ? `${r.lift.toFixed(2)} (z ${r.z >= 0 ? '+' : ''}${r.z.toFixed(1)}, O ${r.O}/E ${r.E.toFixed(1)})` : '—';

console.log('\nevents scored:', JSON.stringify(eventCounts));
console.log(`indicators: ${F}; tests on discovery: ${rows.filter(r => r.split === 'discovery').length}`);

// discovery: rank and select with the pre-registered bar
const disc = rows.filter(r => r.split === 'discovery');
const selected = disc.filter(r => Math.abs(r.z) >= 3 && r.n >= 25 && (r.z < 0 || r.O >= 10));
console.log('\n=== DISCOVERY — strongest 25 by |z| (local ±4y baseline) ===');
for (const r of [...disc].sort((a, b) => Math.abs(b.z) - Math.abs(a.z)).slice(0, 25)) {
  const sel = selected.includes(r) ? ' ◀ selected' : '';
  console.log(`${r.type} ${r.key.padEnd(34)} lift ${r.lift.toFixed(2)}  z ${r.z.toFixed(2).padStart(6)}  O ${String(r.O).padStart(4)} / E ${r.E.toFixed(1).padStart(6)}  n ${r.n}  | life-baseline z ${r.zLife.toFixed(1)}${sel}`);
}
const nTests = disc.length;
const expectedFalse = nTests * 2 * normSf(3);
console.log(`\n|z| >= 3 expected by chance alone among ${nTests} tests: ${expectedFalse.toFixed(1)}; selected: ${selected.length}`);

console.log('\n=== CONFIRMATION — only what discovery selected (Holm over the selected set) ===');
const conf = selected.map(s => ({ s, c: R('confirmation', s.type, s.key)!, e: R('earlier', s.type, s.key) }))
  .map(x => ({ ...x, p: x.c ? normSf(Math.sign(x.s.z) * x.c.z) : 1 }))
  .sort((a, b) => a.p - b.p);
conf.forEach((x, i) => {
  const holm = Math.min(1, x.p * (conf.length - i));
  const ok = holm < 0.05 ? 'REPLICATED' : 'not replicated';
  console.log(`${x.s.type} ${x.s.key.padEnd(34)} discovery ${fmt(x.s)}  →  confirmation ${fmt(x.c)}  one-sided p ${x.p.toFixed(3)}, Holm ${holm.toFixed(3)}  ${ok}   [earlier-50: ${fmt(x.e)}]`);
});
if (!conf.length) console.log('(nothing cleared the discovery bar)');

// pooled view of the pre-specified convergence combinations, all splits together
console.log('\n=== Convergence and dasha+transit combinations, all 544 lives pooled (local baseline) ===');
for (const t of TYPES) for (const key of FEATURES.filter(f => f.type === t && f.group === 'combo').map(f => f.key)) {
  const pool = (['earlier', 'discovery', 'confirmation'] as Split[]).map(s => R(s, t, key)).filter(Boolean) as Row[];
  const O = pool.reduce((s, r) => s + r.O, 0), E = pool.reduce((s, r) => s + r.E, 0);
  const V = pool.reduce((s, r) => s + r.V, 0);
  console.log(`${key.padEnd(36)} O ${String(O).padStart(4)}  E ${E.toFixed(1).padStart(6)}  lift ${(O / (E || 1e-9)).toFixed(2)}  z ${((O - E) / Math.sqrt(V || 1e-9)).toFixed(2)}`);
}

// persist: per-indicator results for every split, with a pooled person-bootstrap CI
const pooled: Record<string, { O: number; E: number; n: number; lift: number; lo: number; hi: number; z: number }> = {};
for (const t of TYPES) for (const [fi, f] of FEATURES.entries()) {
  if (f.type !== '*' && f.type !== t) continue;
  const per = new Map<number, [number, number]>();
  let O = 0, E = 0, V = 0, nn = 0;
  for (const s of ['earlier', 'discovery', 'confirmation'] as Split[]) {
    const a = acc[`${s}|${t}|${fi}`]; if (!a) continue;
    O += a.O; E += a.E; V += a.V; nn += a.n;
    for (const [id, x] of a.per) per.set(id, x);
  }
  if (!nn) continue;
  const [lo, hi] = boot(per);
  pooled[`${t}|${f.key}`] = { O, E: +E.toFixed(2), n: nn, lift: +(O / (E || 1e-9)).toFixed(3), lo: +lo.toFixed(3), hi: +hi.toFixed(3), z: +((O - E) / Math.sqrt(V || 1e-9)).toFixed(2) };
}
writeFileSync(path.resolve(__dirname, 'data/combo_results.json'), JSON.stringify({
  generated: new Date().toISOString(), features: FEATURES.map(f => ({ key: f.key, type: f.type, group: f.group })),
  eventCounts, rows: rows.map(r => ({ ...r, lift: +r.lift.toFixed(3), z: +r.z.toFixed(2), zLife: +r.zLife.toFixed(2), liftLife: +r.liftLife.toFixed(3), E: +r.E.toFixed(2) })),
  selected: selected.map(s => `${s.type}|${s.key}`), pooled,
}, null, 0));
writeFileSync(path.resolve(__dirname, 'data/combo_samples.json'), JSON.stringify({ features: FEATURES.map(f => f.key), samples }));
console.error(`done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);

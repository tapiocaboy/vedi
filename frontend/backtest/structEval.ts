/**
 * Batch 2 (exploratory, labelled as such): structural dasha features.
 *  - lord enrichment: observed events in a given MD/AD lord vs expected from the
 *    person's own time spent there
 *  - separative lords (Saturn/Rahu/Ketu) vs the engine's negative tilt for them
 *  - proximity to a Mahadasha / Antardasha change (within 90 days)
 */
import { PEOPLE, cast, lifeSpan, grid, at, DAY, mulberry32, type Cast } from './lib';

type EType = 'A' | 'M' | 'C' | 'U' | 'D';
const STEP = 10;

function boundaries(c: Cast) {
  const md: number[] = [], ad: number[] = [];
  for (const m of c.dasha.generateMahadashaTimeline(120)) {
    md.push(m.start.getTime(), m.end.getTime());
    for (const a of c.dasha.calculateAntardasha(m)) ad.push(a.start.getTime(), a.end.getTime());
  }
  return { md: [...new Set(md)].sort((a, b) => a - b), ad: [...new Set(ad)].sort((a, b) => a - b) };
}
function nearest(sorted: number[], t: number): number {
  let lo = 0, hi = sorted.length - 1;
  while (lo < hi) { const m = (lo + hi) >> 1; if (sorted[m] < t) lo = m + 1; else hi = m; }
  const a = sorted[lo], b = sorted[Math.max(0, lo - 1)];
  return Math.min(Math.abs(a - t), Math.abs(b - t)) / DAY;
}

type Feat = (c: Cast, t: Date, b: ReturnType<typeof boundaries>) => number;
const lord = (lvl: 'mahadasha' | 'antardasha') => (c: Cast, t: Date) => {
  const r = c.dasha.getCurrentPeriods(t); return 'error' in r ? NaN : (r as any)[lvl].lord;
};
const SEP = new Set(['Saturn', 'Rahu', 'Ketu']);
const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
const feats: Record<string, Feat> = {};
for (const p of PLANETS) {
  feats[`MD=${p}`] = (c, t) => (lord('mahadasha')(c, t) === p ? 1 : 0) as number;
  feats[`AD=${p}`] = (c, t) => (lord('antardasha')(c, t) === p ? 1 : 0) as number;
}
feats['MD in {Sat,Rahu,Ketu}'] = (c, t) => (SEP.has(lord('mahadasha')(c, t) as any) ? 1 : 0);
feats['AD in {Sat,Rahu,Ketu}'] = (c, t) => (SEP.has(lord('antardasha')(c, t) as any) ? 1 : 0);
feats['MD or AD separative'] = (c, t) => (SEP.has(lord('mahadasha')(c, t) as any) || SEP.has(lord('antardasha')(c, t) as any) ? 1 : 0);
feats['within 90d of MD change'] = (c, t, b) => (nearest(b.md, t.getTime()) <= 90 ? 1 : 0);
feats['within 90d of AD change'] = (c, t, b) => (nearest(b.ad, t.getTime()) <= 90 ? 1 : 0);
feats['within 30d of AD change'] = (c, t, b) => (nearest(b.ad, t.getTime()) <= 30 ? 1 : 0);

// per type: feature -> per-person {obs, exp}
const acc: Record<string, Record<string, Map<number, { obs: number; exp: number }>>> = {};
for (const person of PEOPLE) {
  const c = await cast(person);
  const b = boundaries(c);
  const [from, to] = lifeSpan(person, c.birth);
  const G = grid(from, to, STEP);
  const exp: Record<string, number> = {};
  for (const [k, f] of Object.entries(feats)) exp[k] = G.reduce((s, d) => s + (f(c, d, b) || 0), 0) / G.length;
  const evs: { type: EType; when: Date }[] = [];
  for (const e of person.events) if (!e.posthumous) for (const cat of e.cats) if (cat !== 'T') evs.push({ type: cat as EType, when: at(e.date) });
  if (person.death) evs.push({ type: 'D', when: at(person.death) });
  for (const e of evs) for (const [k, f] of Object.entries(feats)) {
    const slot = ((acc[e.type] ??= {})[k] ??= new Map());
    const cur = slot.get(person.id) ?? { obs: 0, exp: 0 };
    cur.obs += f(c, e.when, b) || 0; cur.exp += exp[k];
    slot.set(person.id, cur);
  }
}

function ratio(m: Map<number, { obs: number; exp: number }>, seed = 11, B = 2000) {
  const g = [...m.values()];
  const O = g.reduce((s, x) => s + x.obs, 0), E = g.reduce((s, x) => s + x.exp, 0);
  const rnd = mulberry32(seed), bs: number[] = [];
  for (let i = 0; i < B; i++) { let o = 0, e = 0; for (let j = 0; j < g.length; j++) { const x = g[Math.floor(rnd() * g.length)]; o += x.obs; e += x.exp; } bs.push(o / (e || 1)); }
  bs.sort((a, b) => a - b);
  return { O, E, lift: O / E, lo: bs[Math.floor(B * 0.025)], hi: bs[Math.floor(B * 0.975)] };
}
for (const t of ['A', 'M', 'U', 'D', 'C'] as EType[]) {
  console.log(`\n=== ${t} events: observed / expected (1.0 = no effect) ===`);
  for (const k of Object.keys(feats)) {
    const r = ratio(acc[t][k]);
    const star = r.lo > 1 || r.hi < 1 ? ' *' : '';
    console.log(k.padEnd(26), `O=${r.O.toFixed(0).padStart(3)} E=${r.E.toFixed(1).padStart(5)}  lift ${r.lift.toFixed(2)}  [${r.lo.toFixed(2)}, ${r.hi.toFixed(2)}]${star}`);
  }
}

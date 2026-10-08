/**
 * Score the pre-registered rules (rules.ts) against the dated events.
 * Metric: mid-rank percentile of the rule's score on the event date within the
 * same person's adult life (null = 0.5). Person-level bootstrap CI; split halves
 * by odd/even person id to expose anything that is not stable.
 */
import { getBodyLongitudeSeries } from '../src/lib/core/ephemeris';
import { PEOPLE, cast, chainAt, lifeSpan, grid, at, percentile, clusterMean, type Cast } from './lib';
import { featuresFor, type EType } from './rules';

const STEP = 10;
type Row = Record<string, number>;

async function featureRows(c: Cast, dates: Date[]): Promise<(Row | null)[]> {
  const J = await getBodyLongitudeSeries('JUPITER', dates);
  const S = await getBodyLongitudeSeries('SATURN', dates);
  return dates.map((d, i) => {
    const ch = chainAt(c, d);
    return ch ? featuresFor(c, ch, { Jupiter: J[i], Saturn: S[i] }) : null;
  });
}

const store: Record<string, Map<number, number[]>> = {};      // key -> person -> percentiles
const lifts: Record<string, { obs: number; exp: number }> = {};
const push = (key: string, id: number, v: number) => { (store[key] ??= new Map()).set(id, [...(store[key].get(id) ?? []), v]); };

for (const person of PEOPLE) {
  const c = await cast(person);
  const [from, to] = lifeSpan(person, c.birth);
  const gridDates = grid(from, to, STEP);
  const evs: { type: EType; when: Date }[] = [];
  for (const e of person.events) if (!e.posthumous) for (const cat of e.cats) if (cat !== 'T') evs.push({ type: cat as EType, when: at(e.date) });
  if (person.death) evs.push({ type: 'D', when: at(person.death) });

  const base = (await featureRows(c, gridDates)).filter(Boolean) as Row[];
  if (!base.length) continue;               // not yet 18 — no adult life to compare against
  const evRows = await featureRows(c, evs.map(e => e.when));
  const keys = Object.keys(base[0]);
  const sorted: Record<string, number[]> = {};
  const frac: Record<string, number> = {};
  for (const k of keys) { sorted[k] = base.map(r => r[k]).sort((a, b) => a - b); frac[k] = base.reduce((s, r) => s + r[k], 0) / base.length; }

  evs.forEach((e, i) => {
    const r = evRows[i]; if (!r) return;
    for (const k of keys) {
      // own-type rules, plus every type's rules at every event type (specificity matrix), plus gochara
      push(`${e.type} @ ${k}`, person.id, percentile(sorted[k], r[k]));
      if (!k.includes(' dashaAct') && !k.includes(' combo')) {
        const L = (lifts[`${e.type} @ ${k}`] ??= { obs: 0, exp: 0 });
        L.obs += r[k]; L.exp += frac[k];
      }
    }
  });
}

const fmt = (x: number) => x.toFixed(3);
const types: EType[] = ['A', 'M', 'C', 'U', 'D'];
const allKeys = Object.keys(store).map(k => k.split(' @ ')[1]);
const uniq = [...new Set(allKeys)];
for (const t of types) {
  console.log(`\n=== events of type ${t} — rules of the SAME type, then gochara ===`);
  console.log('rule'.padEnd(26), 'pctile  95% CI           n   odd   even  lift');
  for (const k of uniq.filter(k => k.startsWith(t + '.') || k.startsWith('gochara'))) {
    const m = store[`${t} @ ${k}`]; if (!m) continue;
    const r = clusterMean(m);
    const half = (par: number) => { const mm = new Map([...m].filter(([id]) => id % 2 === par)); return clusterMean(mm, 3, 200).mean; };
    const L = lifts[`${t} @ ${k}`];
    console.log(k.padEnd(26), fmt(r.mean).padEnd(7), `[${fmt(r.lo)}, ${fmt(r.hi)}]`.padEnd(16), String(r.n).padEnd(4), fmt(half(1)), fmt(half(0)), L ? (L.obs / L.exp).toFixed(2) : '');
  }
}
console.log('\n=== specificity: rules of type X evaluated at events of OTHER types (dashaAct, wide) ===');
for (const ev of types) {
  const row = types.map(rt => { const m = store[`${ev} @ ${rt}.wide dashaAct`]; return m ? fmt(clusterMean(m).mean) : '  -  '; });
  console.log(`events ${ev}:`, types.map((rt, i) => `${rt}-rule ${row[i]}`).join('   '));
}

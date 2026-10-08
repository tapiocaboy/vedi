/**
 * Baseline: how well do the app's CURRENT dasha-period scores line up with the
 * dated events in the famous-people set?
 *
 * For every event we take the engine's score for the running Mahadasha /
 * Antardasha / Pratyantardasha, and ask where it sits among that same person's
 * scores across their adult life (mid-rank percentile, 0..1). If the engine had
 * no timing skill the mean percentile would be 0.5. "Good" events should sit
 * above 0.5 in the matching area, "bad" events below.
 */
import { DashaPredictionEngine } from '../src/lib/core/predictions';
import { PEOPLE, cast, chainAt, lifeSpan, grid, at, percentile, clusterMean, type Cast, type Chain } from './lib';

const engine = new DashaPredictionEngine();
const AREAS = ['career', 'wealth', 'relationships', 'health', 'general'] as const;
type Scores = Record<string, number>;

function scoreChain(c: Cast, ch: Chain): Scores {
  const p = engine.generateCompletePrediction(ch.md, ch.ad, ch.pd, undefined, c.ctx, 'en');
  const out: Scores = { overall: p.overallScore };
  for (const a of AREAS) out[a] = p.predictions[a].score;
  return out;
}

const memo = new Map<string, Scores>();
function scoreAt(c: Cast, when: Date): Scores | null {
  const ch = chainAt(c, when); if (!ch) return null;
  const k = `${c.person.id}|${ch.md}|${ch.ad}|${ch.pd}`;
  let s = memo.get(k); if (!s) { s = scoreChain(c, ch); memo.set(k, s); }
  return s;
}

// results[test] = person -> percentiles
const results: Record<string, Map<number, number[]>> = {};
const push = (key: string, id: number, v: number) => { (results[key] ??= new Map()).set(id, [...(results[key].get(id) ?? []), v]); };

for (const person of PEOPLE) {
  const c = await cast(person);
  const [from, to] = lifeSpan(person, c.birth);
  const samples = grid(from, to, 15).map(d => scoreAt(c, d)).filter(Boolean) as Scores[];
  if (!samples.length) continue;            // not yet 18 — no adult life to compare against
  const dist: Record<string, number[]> = {};
  for (const k of ['overall', ...AREAS]) dist[k] = samples.map(s => s[k]).sort((a, b) => a - b);

  const evts = person.events.filter(e => !e.posthumous);
  for (const e of evts) {
    const s = scoreAt(c, at(e.date)); if (!s) continue;
    const pc = (k: string) => percentile(dist[k], s[k]);
    for (const cat of e.cats) {
      if (cat === 'A') { push('A  career', person.id, pc('career')); push('A  overall', person.id, pc('overall')); push('A  wealth', person.id, pc('wealth')); }
      if (cat === 'M') { push('M  relationships', person.id, pc('relationships')); push('M  overall', person.id, pc('overall')); }
      if (cat === 'C') { push('C  relationships', person.id, pc('relationships')); }
      if (cat === 'U') { push('U  overall (want <.5)', person.id, pc('overall')); push('U  health (want <.5)', person.id, pc('health')); }
    }
  }
  if (person.death) {
    const s = scoreAt(c, at(person.death));
    if (s) { push('D  overall (want <.5)', person.id, percentile(dist.overall, s.overall)); push('D  health (want <.5)', person.id, percentile(dist.health, s.health)); }
  }
}

console.log('test'.padEnd(26), 'mean pctile  95% CI           n   people');
for (const [k, m] of Object.entries(results)) {
  const r = clusterMean(m);
  console.log(k.padEnd(26), r.mean.toFixed(3).padEnd(12), `[${r.lo.toFixed(3)}, ${r.hi.toFixed(3)}]`.padEnd(16), String(r.n).padEnd(4), r.people);
}

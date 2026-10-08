/**
 * Can a combination LEARNED from the data time events better than chance?
 *
 *   BT_DATA=people550 TZ=UTC npm run backtest -- backtest/model.ts
 *   (reads data/combo_samples.json written by comboEval.ts)
 *
 * This is the "fit the rules to the famous lives" approach, done so it can be
 * checked: a conditional logistic model (each event against its own 40
 * neighbourhood days, so slow person-level factors cancel) is trained on the
 * DISCOVERY half only, with the L2 penalty picked by person-grouped 5-fold
 * cross-validation inside discovery. It is then scored once on the CONFIRMATION
 * half and on the earlier 50. Two feature sets:
 *   main   every indicator of the type (≈ 100)
 *   pairs  main + every dasha-indicator × transit-indicator product of the type
 *          ("dasha promise × transit trigger" — the combinations astrologers read)
 *
 * Statistic: mid-rank percentile of the event's model score among its 40
 * baseline days (0.5 = no skill), averaged over events, person-bootstrap CI.
 * In-sample (training) percentiles are printed too, to show how much a fitted
 * combination flatters itself on the lives it was fitted to.
 */
import { readFileSync } from 'fs';
import path from 'path';
import { FEATURES, type EType } from './combos';
import { mulberry32, clusterMean } from './lib';

type Sample = { id: number; split: string; type: EType; event: string; base: string[] };
const { samples } = JSON.parse(readFileSync(path.resolve(__dirname, 'data/combo_samples.json'), 'utf-8')) as { samples: Sample[] };

type Stratum = { id: number; split: string; X: Int32Array[] };   // active columns; X[0] = event, X[1..] = baseline days

function design(t: EType, pairs: boolean) {
  const idx = FEATURES.map((f, i) => ({ f, i })).filter(({ f }) => f.type === t || f.type === '*');
  const dasha = idx.filter(({ f }) => f.group === 'dasha' || f.group === 'natal-dasha').map(x => x.i);
  const transit = idx.filter(({ f }) => f.group === 'transit' || f.group === 'moon').map(x => x.i);
  const cols: { name: string; a: number; b?: number }[] = idx.map(({ f, i }) => ({ name: f.key, a: i }));
  if (pairs) for (const a of dasha) for (const b of transit) cols.push({ name: `${FEATURES[a].key} × ${FEATURES[b].key}`, a, b });
  const row = (bits: string) => {
    const on: number[] = [];
    cols.forEach((c, k) => { if (bits[c.a] === '1' && (c.b == null || bits[c.b] === '1')) on.push(k); });
    return Int32Array.from(on);
  };
  const strata: Stratum[] = samples.filter(s => s.type === t).map(s => ({ id: s.id, split: s.split, X: [row(s.event), ...s.base.map(row)] }));
  return { cols, strata };
}

/** Conditional logit by full-batch gradient descent with L2. */
function fit(strata: Stratum[], d: number, lambda: number, iters = 300, lr = 0.5): Float64Array {
  const w = new Float64Array(d);
  const g = new Float64Array(d);
  for (let it = 0; it < iters; it++) {
    g.fill(0);
    for (const s of strata) {
      const sc = s.X.map(x => { let v = 0; for (let q = 0; q < x.length; q++) v += w[x[q]]; return v; });
      const m = Math.max(...sc);
      const ex = sc.map(v => Math.exp(v - m));
      const Z = ex.reduce((a, b) => a + b, 0);
      for (let j = 0; j < s.X.length; j++) {
        const pj = ex[j] / Z, coef = (j === 0 ? 1 : 0) - pj;
        if (coef === 0) continue;
        const x = s.X[j];
        for (let q = 0; q < x.length; q++) g[x[q]] += coef;
      }
    }
    for (let k = 0; k < d; k++) w[k] += lr * (g[k] / strata.length - lambda * w[k]);
  }
  return w;
}

function percentiles(strata: Stratum[], w: Float64Array) {
  const by = new Map<number, number[]>();
  for (const s of strata) {
    const sc = s.X.map(x => { let v = 0; for (let q = 0; q < x.length; q++) v += w[x[q]]; return v; });
    const e = sc[0], base = sc.slice(1);
    const less = base.filter(v => v < e - 1e-12).length, eq = base.filter(v => Math.abs(v - e) <= 1e-12).length;
    const p = (less + eq / 2) / base.length;
    by.set(s.id, [...(by.get(s.id) ?? []), p]);
  }
  return clusterMean(by);
}

const LAMBDAS = [0.3, 0.1, 0.03, 0.01];
const fmt = (r: { mean: number; lo: number; hi: number; n: number }) => `${r.mean.toFixed(3)} [${r.lo.toFixed(3)}, ${r.hi.toFixed(3)}] n=${r.n}`;

for (const t of ['A', 'M', 'U', 'D'] as EType[]) {
  for (const pairs of [false, true]) {
    const { cols, strata } = design(t, pairs);
    const train = strata.filter(s => s.split === 'discovery');
    const test = strata.filter(s => s.split === 'confirmation');
    const early = strata.filter(s => s.split === 'earlier');
    // person-grouped 5-fold CV on discovery to pick lambda
    const ids = [...new Set(train.map(s => s.id))];
    const r = mulberry32(17); ids.sort(() => r() - 0.5);
    const fold = new Map(ids.map((id, i) => [id, i % 5]));
    let best = LAMBDAS[0], bestScore = -1;
    for (const lam of LAMBDAS) {
      let tot = 0;
      for (let f = 0; f < 5; f++) {
        const w = fit(train.filter(s => fold.get(s.id) !== f), cols.length, lam, 120);
        tot += percentiles(train.filter(s => fold.get(s.id) === f), w).mean;
      }
      if (tot / 5 > bestScore) { bestScore = tot / 5; best = lam; }
    }
    const w = fit(train, cols.length, best);
    const top = [...w].map((v, k) => ({ v, k })).sort((a, b) => Math.abs(b.v) - Math.abs(a.v)).slice(0, 4)
      .map(({ v, k }) => `${v >= 0 ? '+' : ''}${v.toFixed(2)} ${cols[k].name}`);
    console.log(`\n${t} ${pairs ? 'main+pairs' : 'main'} (${cols.length} terms, λ=${best}, CV ${bestScore.toFixed(3)})`);
    console.log(`   in-sample (discovery) ${fmt(percentiles(train, w))}`);
    console.log(`   CONFIRMATION          ${fmt(percentiles(test, w))}`);
    console.log(`   earlier-50            ${fmt(percentiles(early, w))}`);
    console.log(`   largest weights: ${top.join(' · ')}`);
  }
}

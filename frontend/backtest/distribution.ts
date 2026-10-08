/**
 * Calibration of the engine's own scale across 50 adult lifetimes:
 *  - how the overall 1-10 rating and each area's trend label are distributed
 *  - how much the rating moves from one pratyantardasha to the next (volatility)
 */
import { DashaPredictionEngine } from '../src/lib/core/predictions';
import { PEOPLE, cast, chainAt, lifeSpan, grid } from './lib';

const engine = new DashaPredictionEngine();
const AREAS = ['career', 'wealth', 'relationships', 'health', 'general'] as const;
const memo = new Map<string, any>();
const overall: number[] = [];
const ratings: number[] = [];
const trendCount: Record<string, Record<string, number>> = {};
const intensityCount: Record<string, number> = {};
const pdStep: number[] = [], adStep: number[] = [], mdStep: number[] = [];
let samples = 0;

for (const person of PEOPLE) {
  const c = await cast(person);
  const [from, to] = lifeSpan(person, c.birth);
  let prev: { md: string; ad: string; pd: string; s: number } | null = null;
  for (const d of grid(from, to, 10)) {
    const ch = chainAt(c, d); if (!ch) continue;
    const key = `${person.id}|${ch.md}|${ch.ad}|${ch.pd}`;
    let p = memo.get(key);
    if (!p) { p = engine.generateCompletePrediction(ch.md, ch.ad, ch.pd, undefined, c.ctx, 'en'); memo.set(key, p); }
    samples++; overall.push(p.overallScore); ratings.push(p.overallRating);
    for (const a of AREAS) { const t = p.predictions[a].trend; (trendCount[a] ??= {})[t] = (trendCount[a][t] ?? 0) + 1; }
    const i = p.predictions.career.intensity; intensityCount[i] = (intensityCount[i] ?? 0) + 1;
    if (prev && (prev.md !== ch.md || prev.ad !== ch.ad || prev.pd !== ch.pd)) {
      const step = Math.abs(p.overallScore - prev.s);
      if (prev.md !== ch.md) mdStep.push(step); else if (prev.ad !== ch.ad) adStep.push(step); else pdStep.push(step);
    }
    prev = { md: ch.md, ad: ch.ad, pd: ch.pd, s: p.overallScore };
  }
}
const q = (a: number[], f: number) => [...a].sort((x, y) => x - y)[Math.floor(f * (a.length - 1))];
const mean = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;
console.log(`samples ${samples}; overall score quantiles  p5 ${q(overall, .05).toFixed(2)}  p25 ${q(overall, .25).toFixed(2)}  p50 ${q(overall, .5).toFixed(2)}  p75 ${q(overall, .75).toFixed(2)}  p95 ${q(overall, .95).toFixed(2)}  (min ${Math.min(...overall).toFixed(2)} max ${Math.max(...overall).toFixed(2)})`);
const hist: Record<string, number> = {};
for (const x of ratings) { const k = String(x); hist[k] = (hist[k] ?? 0) + 1; }
console.log('overallRating share:', Object.keys(hist).sort((a, b) => +a - +b).map(k => `${k}:${(100 * hist[k] / samples).toFixed(1)}%`).join('  '));
for (const a of AREAS) console.log(`trend ${a.padEnd(14)}`, Object.entries(trendCount[a]).map(([k, v]) => `${k} ${(100 * v / samples).toFixed(0)}%`).join('  '));
console.log('career intensity labels:', Object.entries(intensityCount).map(([k, v]) => `${k} ${(100 * v / samples).toFixed(0)}%`).join('  '));
console.log(`mean |Δ overall| on a step: pratyantar ${mean(pdStep).toFixed(2)} (n=${pdStep.length}), antar ${mean(adStep).toFixed(2)} (n=${adStep.length}), maha ${mean(mdStep).toFixed(2)} (n=${mdStep.length})`);
console.log(`share of steps that move the rounded 1-10 rating by >=1: pd ${(100 * pdStep.filter(x => x >= 0.5).length / pdStep.length).toFixed(0)}%  ad ${(100 * adStep.filter(x => x >= 0.5).length / adStep.length).toFixed(0)}%  md ${(100 * mdStep.filter(x => x >= 0.5).length / mdStep.length).toFixed(0)}%`);

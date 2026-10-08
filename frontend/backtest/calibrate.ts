/**
 * Population calibration of the engine's scores.
 *
 * Draws random charts (random date 1900-2005, place and time) and random dates
 * within each chart's adult life, runs the REAL current-period pipeline
 * (dasha chain + natal foundation + live gochara), and records the raw 1-10
 * scores. The quantile tables it prints go into src/lib/core/calibration.ts,
 * so that "very strong" / "positive" / "7 out of 10" mean the same share of
 * periods for every chart instead of whatever the raw arithmetic happens to give.
 *
 * Usage: TZ=UTC npx vite-node --config backtest/vite.config.ts backtest/calibrate.ts [charts] [datesPerChart]
 */
import { getCurrentPeriodPrediction } from '../src/lib/services/predictionService';
import { mulberry32, YEAR } from './lib';

const CHARTS = Number(process.argv[2] ?? 500);
const DATES = Number(process.argv[3] ?? 40);
const rnd = mulberry32(20261008);
const AREAS = ['career', 'wealth', 'relationships', 'health', 'general'] as const;
const raw: Record<string, number[]> = { overall: [] };
for (const a of AREAS) raw[a] = [];

const t0 = Date.now();
for (let i = 0; i < CHARTS; i++) {
  const birth = new Date(Date.UTC(1900, 0, 1) + rnd() * 106 * YEAR);
  const bd = {
    date: birth.toISOString().slice(0, 19), latitude: -35 + rnd() * 95, longitude: -120 + rnd() * 270,
    timezone: 'UTC', ayanamsa: 'LAHIRI' as const,
  };
  for (let j = 0; j < DATES; j++) {
    const when = new Date(birth.getTime() + (18 + rnd() * 62) * YEAR);
    const p = await getCurrentPeriodPrediction(bd, when, 'en');
    raw.overall.push(p.overallScore ?? p.overallRating);
    for (const a of AREAS) raw[a].push((p.predictions[a] as any).score);
  }
  if ((i + 1) % 50 === 0) console.error(`  ${i + 1}/${CHARTS} charts, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}

const PTS = Array.from({ length: 21 }, (_, k) => k * 5);       // 0,5,…,100 percentiles
const quant = (a: number[], p: number) => { const s = [...a].sort((x, y) => x - y); const idx = (p / 100) * (s.length - 1); const lo = Math.floor(idx), hi = Math.ceil(idx); return s[lo] + (s[hi] - s[lo]) * (idx - lo); };
const out: Record<string, number[]> = {};
for (const [k, v] of Object.entries(raw)) out[k] = PTS.map(p => Math.round(quant(v, p) * 100) / 100);
console.log(JSON.stringify({ samples: raw.overall.length, charts: CHARTS, percentiles: PTS, quantiles: out }, null, 1));

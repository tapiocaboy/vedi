/**
 * Population calibration of the engine's scores.
 *
 * The raw 1–10 area scores are sums of planetary base values and modifiers, and
 * their *distribution* is an accident of that arithmetic: measured over 24,000
 * periods of random charts, the median career score was 7.5 (so a fixed
 * "positive at 7" cut-off labelled career positive ~60% of the time, and the
 * 10/10 rating ~9%), while the median health score was 4.4 (so health was
 * "positive" ~2% of the time and "mixed or worse" ~68%). A label that fires that
 * often — or almost never — says little, and the health reading was needlessly
 * alarming.
 *
 * Every label and rating is therefore read from where the raw score falls among
 * all measured periods — its population percentile — so that each label means
 * the same share of periods in every area:
 *
 *   trend       positive 30% · neutral 35% · mixed 25% · negative 10%
 *   intensity   very strong 10% · strong 20% · moderate 45% · challenging 18% · very challenging 7%
 *   rating      deciles: 10/10 is the top tenth of periods, 5/10 the fifth tenth…
 *
 * Raw scores are untouched, so period-to-period comparisons still use them.
 * Regenerate the table with backtest/calibrate.ts when the scoring changes.
 */
import { PERCENTILES, SCORE_QUANTILES } from './calibrationTable';

export type CalibratedArea = keyof typeof SCORE_QUANTILES;
export type Trend = 'positive' | 'neutral' | 'mixed' | 'negative';
export type IntensityKey = 'very strong' | 'strong' | 'moderate' | 'challenging' | 'very challenging';

/** Percentile cut-offs (0–100) of the label bands. Edit here, not at call sites. */
export const TREND_CUTS = { positive: 70, neutral: 35, mixed: 10 } as const;
export const INTENSITY_CUTS = { veryStrong: 90, strong: 70, challenging: 25, veryChallenging: 7 } as const;

/**
 * Share (0–100) of measured periods whose raw score is below `score`, with ties
 * counted half — so the 10/10 ceiling, which many periods hit, sits at its
 * midpoint rather than at the bottom of the pile.
 */
export function percentileOf(area: CalibratedArea, score: number): number {
  const q = SCORE_QUANTILES[area];
  if (score < q[0]) return 0;
  if (score > q[q.length - 1]) return 100;
  // Exact matches only happen at the 1 and 10 clamps, where many periods tie.
  const ties = q.flatMap((v, i) => (v === score ? [i] : []));
  if (ties.length) return (PERCENTILES[ties[0]] + PERCENTILES[ties[ties.length - 1]]) / 2;
  const i = q.findIndex((v, k) => k < q.length - 1 && score > v && score < q[k + 1]);
  const f = (score - q[i]) / (q[i + 1] - q[i]);
  return PERCENTILES[i] + f * (PERCENTILES[i + 1] - PERCENTILES[i]);
}

export function trendFor(area: CalibratedArea, score: number): Trend {
  const p = percentileOf(area, score);
  if (p >= TREND_CUTS.positive) return 'positive';
  if (p >= TREND_CUTS.neutral) return 'neutral';
  if (p >= TREND_CUTS.mixed) return 'mixed';
  return 'negative';
}

export function intensityFor(area: CalibratedArea, score: number): IntensityKey {
  const p = percentileOf(area, score);
  if (p >= INTENSITY_CUTS.veryStrong) return 'very strong';
  if (p >= INTENSITY_CUTS.strong) return 'strong';
  if (p < INTENSITY_CUTS.veryChallenging) return 'very challenging';
  if (p < INTENSITY_CUTS.challenging) return 'challenging';
  return 'moderate';
}

/** 1–10 decile rating of the overall score: 10 = top tenth of periods. */
export function ratingFor(overallScore: number): number {
  return Math.max(1, Math.min(10, Math.ceil(percentileOf('overall', overallScore) / 10)));
}

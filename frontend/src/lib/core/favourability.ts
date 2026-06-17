/**
 * Favourability forecast.
 *
 * Samples the transits (Gochara) at the middle of each upcoming month and turns
 * them into a 0–10 favourability score relative to the person's natal Moon and
 * Lagna. Used to answer "how long until a genuinely favourable window arrives?"
 * and to drive a small month-by-month bar chart.
 */

import { getCurrentTransits, summarizeGocharaForPrediction } from './transits';
import type { AyanamsaSystem } from './transits';

export interface FavourabilityMonth {
  date: string;        // ISO — middle of the month sampled
  label: string;       // "Jul"
  score: number;       // 0..10
  favourable: boolean; // score >= FAVOURABLE_THRESHOLD
}

export interface FavourabilityForecast {
  months: FavourabilityMonth[];
  /** Index into months of the next favourable month, or null if none. */
  nextFavourableIdx: number | null;
  /** Whole months from now until that window (0 = this month). */
  monthsAway: number | null;
  /** Index of the best month if none clear the bar (fallback highlight). */
  bestIdx: number;
}

export const FAVOURABLE_THRESHOLD = 7;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Map a Gochara snapshot into a 0–10 favourability score. */
function scoreFor(scoreMod: number, avgValence: number): number {
  // summarize's scoreMod ∈ [-1.5, +1]; blend with the average transit valence.
  const combined = scoreMod + avgValence * 0.5; // roughly [-2, +1.5]
  // Neutral (0) → ~6; strong positive → 10; strong negative → 0.
  return clamp(Math.round(((combined + 1.5) / 2.5) * 10), 0, 10);
}

export async function getFavourabilityForecast(
  ayanamsa: AyanamsaSystem,
  natalMoonRashi: number,
  natalLagnaRashi: number,
  monthsAhead = 12,
  asOf?: Date,
): Promise<FavourabilityForecast> {
  const now = asOf ?? new Date();
  const months: FavourabilityMonth[] = [];

  for (let i = 0; i < monthsAhead; i++) {
    // Middle of month i, so the sample represents the month as a whole.
    const d = new Date(now.getFullYear(), now.getMonth() + i, 15, 12, 0, 0);
    const g = await getCurrentTransits(ayanamsa, natalMoonRashi, natalLagnaRashi, d);
    const { scoreMod } = summarizeGocharaForPrediction(g);
    const avgValence = g.transits.reduce((s, t) => s + t.valence, 0) / (g.transits.length || 1);
    const score = scoreFor(scoreMod, avgValence);
    months.push({
      date: d.toISOString(),
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      score,
      favourable: score >= FAVOURABLE_THRESHOLD,
    });
  }

  const nextFavourableIdx = months.findIndex(m => m.favourable);
  const bestIdx = months.reduce((best, m, i) => (m.score > months[best].score ? i : best), 0);

  return {
    months,
    nextFavourableIdx: nextFavourableIdx >= 0 ? nextFavourableIdx : null,
    monthsAway: nextFavourableIdx >= 0 ? nextFavourableIdx : null,
    bestIdx,
  };
}

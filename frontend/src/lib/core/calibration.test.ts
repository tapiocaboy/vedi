import { describe, it, expect } from 'vitest';
import {
  percentileOf, trendFor, intensityFor, ratingFor, TREND_CUTS, INTENSITY_CUTS, type CalibratedArea,
} from './calibration';
import { PERCENTILES, SCORE_QUANTILES } from './calibrationTable';

const AREAS = Object.keys(SCORE_QUANTILES) as CalibratedArea[];

describe('calibration table', () => {
  it.each(AREAS)('%s quantiles are non-decreasing and span the 1–10 scale', area => {
    const q = SCORE_QUANTILES[area];
    expect(q).toHaveLength(PERCENTILES.length);
    for (let i = 1; i < q.length; i++) expect(q[i]).toBeGreaterThanOrEqual(q[i - 1]);
    expect(q[0]).toBeGreaterThanOrEqual(1);
    expect(q[q.length - 1]).toBeLessThanOrEqual(10);
  });

  it('shows the inflation the calibration exists to remove', () => {
    // The old fixed cut-off labelled any score ≥ 7 "positive". That was the
    // 40th percentile of career (60% positive) and the ~96th of health (≈2%).
    expect(percentileOf('career', 7)).toBeLessThan(45);
    expect(percentileOf('health', 7)).toBeGreaterThan(90);
  });
});

describe('percentileOf', () => {
  it.each(AREAS)('%s is monotonic in the score', area => {
    let prev = -1;
    for (let s = 1; s <= 10; s += 0.25) {
      const p = percentileOf(area, s);
      expect(p).toBeGreaterThanOrEqual(prev);
      prev = p;
    }
  });

  it('returns the tabulated percentile at a tabulated score', () => {
    const q = SCORE_QUANTILES.career;
    expect(percentileOf('career', q[10])).toBeCloseTo(PERCENTILES[10], 5);   // the median
    expect(percentileOf('career', q[15])).toBeCloseTo(PERCENTILES[15], 5);
  });

  it('puts the 10/10 ceiling at the middle of the tied run, not at the bottom of it', () => {
    // Career: the table holds 10 from p95 to p100, so a 10 is ~97.5.
    expect(percentileOf('career', 10)).toBeCloseTo(97.5, 5);
  });

  it('clamps outside the measured range', () => {
    expect(percentileOf('overall', 0)).toBe(0);
    expect(percentileOf('overall', 11)).toBe(100);
  });
});

describe('labels follow the percentile bands', () => {
  it.each(AREAS)('%s: trend changes exactly at the configured percentiles', area => {
    const at = (p: number) => SCORE_QUANTILES[area][PERCENTILES.indexOf(p as never)];
    // Just above and below each cut. Use the table's own score at the cut percentile.
    expect(trendFor(area, at(TREND_CUTS.positive) + 0.001)).toBe('positive');
    expect(trendFor(area, at(TREND_CUTS.positive) - 0.05)).toBe('neutral');
    expect(trendFor(area, at(TREND_CUTS.neutral) - 0.05)).toBe('mixed');
    expect(trendFor(area, at(TREND_CUTS.mixed) - 0.05)).toBe('negative');
  });

  it('gives every area the same trend base rates (the point of calibrating)', () => {
    // Walk each area's own 5-percentile grid and count the labels it produces.
    for (const area of AREAS) {
      const counts = { positive: 0, neutral: 0, mixed: 0, negative: 0 };
      for (let p = 2.5; p < 100; p += 5) {
        const q = SCORE_QUANTILES[area];
        const i = Math.floor(p / 5);
        const mid = (q[i] + q[i + 1]) / 2;
        counts[trendFor(area, mid)]++;
      }
      // 20 cells: ~30% positive (6), ~35% neutral (7), ~25% mixed (5), ~10% negative (2).
      expect(counts.positive).toBeGreaterThanOrEqual(5);
      expect(counts.positive).toBeLessThanOrEqual(7);
      expect(counts.negative).toBeGreaterThanOrEqual(1);
      expect(counts.negative).toBeLessThanOrEqual(3);
    }
  });

  it('reserves "very strong" for the top tenth and "very challenging" for the bottom 7%', () => {
    const q = SCORE_QUANTILES.wealth;
    expect(intensityFor('wealth', q[PERCENTILES.indexOf(95 as never)])).toBe('very strong');
    expect(intensityFor('wealth', q[PERCENTILES.indexOf(INTENSITY_CUTS.veryStrong as never)] - 0.05)).toBe('strong');
    expect(intensityFor('wealth', q[PERCENTILES.indexOf(5 as never)])).toBe('very challenging');
  });
});

describe('ratingFor', () => {
  it('is a decile: 1 at the floor, 10 at the ceiling, monotonic between', () => {
    expect(ratingFor(1)).toBe(1);
    expect(ratingFor(10)).toBe(10);
    let prev = 0;
    for (let s = 1; s <= 10; s += 0.1) { const r = ratingFor(s); expect(r).toBeGreaterThanOrEqual(prev); prev = r; }
  });

  it('puts the median overall score at 5/10 or 6/10, not 7+', () => {
    const median = SCORE_QUANTILES.overall[PERCENTILES.indexOf(50 as never)];
    expect([5, 6]).toContain(ratingFor(median));
  });
});

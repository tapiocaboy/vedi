/**
 * Reference chart: 1992-12-14 03:58, Colombo (7.0945 N, 79.9989 E), Lahiri.
 *
 * Libra ascendant. Sidereal longitudes below come from Swiss Ephemeris for that
 * moment and are treated as fixed inputs here, so these tests exercise the
 * interpretation layer rather than the ephemeris.
 *
 * The chart is kept as a regression case because it is the one that exposed the
 * engine reading every life area as "very strong" during a period the person
 * was actually finding hard: a dignified Venus mahadasha made the rating 9/10
 * while the Saturn antardasha, the debilitated retrograde Mars in the 10th and
 * the afflicted Moon were all invisible to the score.
 */

import { describe, it, expect } from 'vitest';
import { buildChartContext } from '../services/predictionService';
import { DashaPredictionEngine } from './predictions';
import { VimshottariDasha } from './dasha';
import type { PlanetPosition } from './ephemeris';

const SIDEREAL: Record<string, [number, boolean]> = {
  SUN:       [238.422, false],
  MOON:      [110.406, false],
  MERCURY:   [218.161, false],
  VENUS:     [282.304, false],
  MARS:      [92.302,  true],
  JUPITER:   [167.783, false],
  SATURN:    [290.831, false],
  RAHU:      [237.738, true],
  KETU:      [57.738,  true],
  ASCENDANT: [206.251, false],
};

function position(lon: number, retrograde: boolean): PlanetPosition {
  return {
    longitude: lon, latitude: 0, distance: 1, speed: retrograde ? -1 : 1,
    rashi: Math.floor(lon / 30), rashiDegree: lon % 30,
    nakshatra: Math.floor(lon / (360 / 27)),
    nakshatraPada: Math.floor((lon % (360 / 27)) / (360 / 108)) + 1,
    isRetrograde: retrograde,
  };
}

const positions = Object.fromEntries(
  Object.entries(SIDEREAL).map(([k, [lon, r]]) => [k, position(lon, r)]),
) as Record<string, PlanetPosition>;

const BIRTH = new Date('1992-12-14T03:58:00+05:30');
const DURING_SATURN_ANTARDASHA = new Date('2026-07-22T12:00:00Z');

function currentChain(at: Date) {
  const calc = new VimshottariDasha(positions.MOON.longitude, BIRTH);
  const cur = calc.getCurrentPeriods(at);
  if ('error' in cur) throw new Error(cur.error);
  return cur;
}

function predictionAt(at: Date) {
  const cur = currentChain(at);
  return new DashaPredictionEngine().generateCompletePrediction(
    cur.mahadasha.lord,
    cur.antardasha.lord,
    cur.pratyantardasha?.lord,
    cur.sookshmaDasha?.lord,
    buildChartContext(positions),
    'en',
  );
}

describe('reference chart — dasha chain', () => {
  it('places the date inside Venus mahadasha / Saturn antardasha', () => {
    const cur = currentChain(DURING_SATURN_ANTARDASHA);
    expect(cur.mahadasha.lord).toBe('Venus');
    expect(cur.antardasha.lord).toBe('Saturn');
    expect(cur.mahadasha.start.getUTCFullYear()).toBe(2012);
    expect(cur.mahadasha.end.getUTCFullYear()).toBe(2032);
    expect(cur.antardasha.start.getUTCFullYear()).toBe(2025);
    expect(cur.antardasha.end.getUTCFullYear()).toBe(2028);
  });
});

describe('reference chart — natal foundation', () => {
  const foundation = predictionAt(DURING_SATURN_ANTARDASHA).natalFoundation!;
  const byArea = Object.fromEntries(foundation.map(f => [f.area, f]));

  it('is reported for every life area', () => {
    expect(Object.keys(byArea).sort()).toEqual(['career', 'health', 'relationship', 'wealth']);
  });

  it('names the debilitated Mars in the 10th among the career reasons', () => {
    expect(byArea.career.notes.some(n => n.includes('Mars') && n.includes('10th house'))).toBe(true);
  });

  it('rates wealth as weak — Rahu with the Sun in the 2nd, Jupiter in the 12th', () => {
    expect(byArea.wealth.weak).toBe(true);
    expect(byArea.wealth.score).toBeLessThan(-0.75);
  });

  it('does not rate partnership as solid — the 7th lord is debilitated', () => {
    expect(byArea.relationship.strong).toBe(false);
  });

  it('surfaces the Moon’s affliction ahead of the house bookkeeping', () => {
    const firstThree = byArea.health.notes.slice(0, 3).join(' ');
    expect(firstThree).toContain('Saturn aspects your Moon');
    expect(firstThree).toContain('shares its sign with');
  });
});

describe('reference chart — current-period reading', () => {
  const prediction = predictionAt(DURING_SATURN_ANTARDASHA);

  it('does not rate a Saturn-compressed phase as excellent', () => {
    // Previously 9/10 ("Excellent"), built from the Venus mahadasha alone.
    expect(prediction.overallRating).toBeLessThanOrEqual(6);
    expect(prediction.overallRating).toBeGreaterThanOrEqual(4);
  });

  it('stops short of calling every area positive', () => {
    const trends = ['career', 'wealth', 'relationships', 'health']
      .map(a => prediction.predictions[a].trend);
    expect(trends.every(t => t === 'positive')).toBe(false);
  });

  it('never claims "very strong" for an area whose foundation is weak', () => {
    const weak = new Set(prediction.natalFoundation!.filter(f => f.weak).map(f => f.area));
    for (const [key, area] of [['career', 'career'], ['wealth', 'wealth'], ['relationships', 'relationship'], ['health', 'health']] as const) {
      if (weak.has(area)) expect(prediction.predictions[key].intensity).not.toBe('very strong');
    }
  });

  it('names the delay tone the Saturn sub-period brings', () => {
    const general = prediction.predictions.general.details.join(' ');
    expect(general).toContain('Saturn holds the sub-period');
  });

  it('flags the tension between a dignified lord and weak footing', () => {
    const general = prediction.predictions.general.details.join(' ');
    expect(general).toContain('Note the tension');
  });
});

describe('the whole dasha chain reaches the rating', () => {
  const ctx = buildChartContext(positions);
  const engine = new DashaPredictionEngine();
  const rate = (...chain: Array<string | undefined>) =>
    engine.generateCompletePrediction(chain[0]!, chain[1], chain[2], chain[3], ctx, 'en').overallRating;

  it('changes the rating when only the antardasha changes', () => {
    // A Venus mahadasha under different sub-lords must not produce one number.
    const ratings = new Set(['Mercury', 'Saturn', 'Ketu', 'Jupiter'].map(ad => rate('Venus', ad)));
    expect(ratings.size).toBeGreaterThan(1);
  });

  it('changes the outlook when only the sookshma lord changes', () => {
    // The sookshma is the lightest-weighted level in the chain, so its effect is
    // often smaller than the rounding step of the displayed rating. Asserting on
    // the integer therefore only catches the cases that happen to straddle a
    // boundary; the unrounded score is where the property actually lives.
    const score = (...chain: Array<string | undefined>) =>
      engine.generateCompletePrediction(chain[0]!, chain[1], chain[2], chain[3], ctx, 'en').overallScore;
    const withVenus = score('Venus', 'Saturn', 'Venus', 'Venus');
    const withKetu = score('Venus', 'Saturn', 'Venus', 'Ketu');
    expect(withVenus).not.toBeCloseTo(withKetu, 3);
    // A benefic sookshma must not read worse than a separative one.
    expect(withVenus).toBeGreaterThan(withKetu);
  });
});

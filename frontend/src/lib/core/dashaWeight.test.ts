import { describe, it, expect } from 'vitest';
import { assessWeight, weightHeadline } from './dashaWeight';
import { assessPlanetStrength } from './dashaStrength';
import type { TransitHit } from './dashaTransits';

// Reference chart: 16 Sept 1986, 13:22, Kandy (Sagittarius lagna).
// Sidereal longitudes from Swiss Ephemeris, Lahiri.
const LON: Record<string, number> = {
  Sun: 149.4896, Moon: 305.4194, Mercury: 158.4523, Venus: 193.6239,
  Mars: 265.4211, Jupiter: 323.472, Saturn: 220.6675,
  Rahu: 357.4126, Ketu: 177.4126,
};
const ASC_RASHI = 8; // Dhanu / Sagittarius

const rashiOf = (l: number) => Math.floor(l / 30);
const CHART = {
  planetRashis: Object.fromEntries(Object.entries(LON).map(([k, v]) => [k, rashiOf(v)])),
  planetHouses: Object.fromEntries(
    Object.entries(LON).map(([k, v]) => [k, ((rashiOf(v) - ASC_RASHI + 12) % 12) + 1]),
  ),
  planetLongitudes: LON,
  planetRetro: {},
  ascendantRashi: ASC_RASHI,
  moonRashi: rashiOf(LON.Moon),
};

const strengthOf = (p: string) => assessPlanetStrength(p, CHART);

const WINDOW_START = new Date('2027-01-23T00:00:00Z');
const WINDOW_END = new Date('2027-02-16T00:00:00Z');

function weigh(overrides: Partial<Parameters<typeof assessWeight>[0]> = {}) {
  return assessWeight({
    mahadashaLord: 'Saturn',
    antardashaLord: 'Ketu',
    pratyantarLord: 'Venus',
    start: WINDOW_START,
    end: WINDOW_END,
    subLordStrength: null,
    transitHits: [],
    hotTargets: new Set(['Saturn', 'Ketu', 'Sun', 'Moon', 'Lagna']),
    ...overrides,
  });
}

describe('assessWeight — repetition across dasha levels', () => {
  it('weighs a doubled sub-lord above a plain one', () => {
    const plain = weigh({ pratyantarLord: 'Venus' });
    const doubled = weigh({ pratyantarLord: 'Ketu' });
    expect(doubled.weight).toBeGreaterThan(plain.weight);
    expect(doubled.factors.some(f => f.kind === 'repetition')).toBe(true);
  });

  it('weighs the mahadasha lord returning below a doubled sub-lord', () => {
    const mdReturn = weigh({ pratyantarLord: 'Saturn' });
    const doubled = weigh({ pratyantarLord: 'Ketu' });
    expect(mdReturn.factors[0].label).toBe('Mahadasha lord returns');
    expect(doubled.weight).toBeGreaterThan(mdReturn.weight);
  });

  it('treats a tripled lord as the heaviest configuration', () => {
    const tripled = weigh({ mahadashaLord: 'Ketu', antardashaLord: 'Ketu', pratyantarLord: 'Ketu' });
    expect(tripled.band).toBe('heavy');
    expect(tripled.factors[0].label).toBe('Tripled lord');
  });
});

describe('assessWeight — nodal activation', () => {
  it('flags the full axis when the partner node holds a level above', () => {
    const axis = weigh({ pratyantarLord: 'Rahu' }); // Ketu antardasha
    const nodal = axis.factors.find(f => f.kind === 'nodal');
    expect(nodal?.label).toBe('Full nodal axis');
  });

  it('scores a lone node lower than a lit axis', () => {
    const lone = weigh({ antardashaLord: 'Mercury', pratyantarLord: 'Rahu' });
    const axis = weigh({ pratyantarLord: 'Rahu' });
    const loneNodal = lone.factors.find(f => f.kind === 'nodal')!;
    const axisNodal = axis.factors.find(f => f.kind === 'nodal')!;
    expect(loneNodal.points).toBeLessThan(axisNodal.points);
  });
});

describe('assessWeight — transit reinforcement', () => {
  const hit = (date: string, target: string): TransitHit => ({
    transiting: 'Saturn',
    kind: 'conjunction',
    target,
    date,
    detail: `Transit Saturn crosses your natal ${target}`,
  });

  it('only counts hits that fall inside the window', () => {
    const inside = weigh({ transitHits: [hit('2027-02-01T00:00:00Z', 'Ketu')] });
    const outside = weigh({ transitHits: [hit('2027-06-01T00:00:00Z', 'Ketu')] });
    expect(inside.weight).toBeGreaterThan(outside.weight);
    expect(outside.factors.some(f => f.kind === 'transit')).toBe(false);
    expect(inside.transitHits).toHaveLength(1);
  });

  it('weighs a hot natal target above an incidental one', () => {
    const hot = weigh({ transitHits: [hit('2027-02-01T00:00:00Z', 'Ketu')] });
    const cold = weigh({ transitHits: [hit('2027-02-01T00:00:00Z', 'Mercury')] });
    expect(hot.weight).toBeGreaterThan(cold.weight);
  });

  it('caps the transit contribution so one busy window cannot dominate', () => {
    const many = weigh({
      transitHits: Array.from({ length: 12 }, (_, i) =>
        hit(`2027-02-0${(i % 9) + 1}T00:00:00Z`, 'Ketu'),
      ),
    });
    const transit = many.factors.find(f => f.kind === 'transit')!;
    expect(transit.points).toBeLessThanOrEqual(3);
  });
});

describe('assessWeight — tone', () => {
  it('reads a dignified benefic sub-lord as constructive', () => {
    // Mercury is exalted in this chart and rules the 7th and 10th.
    const a = weigh({ pratyantarLord: 'Mercury', subLordStrength: strengthOf('Mercury') });
    expect(a.tone).toBe('constructive');
  });

  it('reads a doubled separative sub-lord as testing', () => {
    const a = weigh({ pratyantarLord: 'Ketu', subLordStrength: strengthOf('Ketu') });
    expect(a.tone).toBe('testing');
  });

  it('never exceeds the 0–10 scale', () => {
    const a = weigh({
      mahadashaLord: 'Ketu',
      antardashaLord: 'Ketu',
      pratyantarLord: 'Ketu',
      subLordStrength: strengthOf('Ketu'),
      transitHits: Array.from({ length: 20 }, (_, i) => ({
        transiting: 'Saturn' as const,
        kind: 'conjunction' as const,
        target: 'Ketu',
        date: `2027-02-0${(i % 9) + 1}T00:00:00Z`,
        detail: 'x',
      })),
    });
    expect(a.weight).toBeLessThanOrEqual(10);
  });
});

describe('weightHeadline', () => {
  it('surfaces the highest-scoring factor', () => {
    const a = weigh({ pratyantarLord: 'Ketu', subLordStrength: strengthOf('Ketu') });
    expect(weightHeadline(a, 'Ketu')).toBe(
      [...a.factors].sort((x, y) => y.points - x.points)[0].detail,
    );
  });

  it('falls back to a plain line when nothing singles the window out', () => {
    // Venus–Sun carries no named classical combination, so with no chart, no
    // repetition and no transits there is nothing to report.
    const bare = assessWeight({
      mahadashaLord: 'Jupiter',
      antardashaLord: 'Venus',
      pratyantarLord: 'Sun',
      start: WINDOW_START,
      end: WINDOW_END,
      subLordStrength: null,
      transitHits: [],
      hotTargets: new Set(),
    });
    expect(bare.factors).toHaveLength(0);
    expect(weightHeadline(bare, 'Sun')).toContain('no layer of the chart');
  });
});

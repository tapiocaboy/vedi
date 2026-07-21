import { describe, it, expect, vi, beforeEach } from 'vitest';

// Synthetic longitude series per body, set by each test. Anything not named
// here is parked far from the natal points so it contributes no hits.
const series: Record<string, (i: number, n: number) => number> = {};

vi.mock('./ephemeris', () => ({
  getBodyLongitudeSeries: vi.fn(async (body: string, dates: Date[]) => {
    const f = series[body] ?? (() => (body === 'JUPITER' ? 45 : 90));
    return dates.map((_, i) => f(i, dates.length));
  }),
}));

const { scanWindowTransits, hitsWithin } = await import('./dashaTransits');

const DAY = 86400000;
const START = new Date('2027-01-01T00:00:00Z');
const END = new Date(START.getTime() + 100 * DAY);

beforeEach(() => {
  for (const k of Object.keys(series)) delete series[k];
});

describe('scanWindowTransits — aspects to natal points', () => {
  it('dates a direct conjunction at the crossing, not the sample boundary', async () => {
    // Saturn sweeps 170° → 190° linearly across the 100-day window.
    series.SATURN = (i, n) => 170 + (20 * i) / (n - 1);
    const hits = await scanWindowTransits(START, END, [{ name: 'Ketu', longitude: 180 }]);

    const conj = hits.filter(h => h.kind === 'conjunction');
    expect(conj).toHaveLength(1);
    expect(conj[0].transiting).toBe('Saturn');
    expect(conj[0].target).toBe('Ketu');

    const days = (new Date(conj[0].date).getTime() - START.getTime()) / DAY;
    expect(days).toBeCloseTo(50, 0);
    expect(conj[0].detail).toContain('crosses your natal Ketu');
  });

  it('finds the opposition when the natal point is half a circle away', async () => {
    series.SATURN = (i, n) => 170 + (20 * i) / (n - 1);
    const hits = await scanWindowTransits(START, END, [{ name: 'Sun', longitude: 0 }]);
    const opp = hits.filter(h => h.kind === 'opposition');
    expect(opp).toHaveLength(1);
    expect(opp[0].detail).toContain('opposes your natal Sun');
  });

  it('does not read the far side of the zodiac as a crossing', async () => {
    // Saturn stays a full 180° away from the natal point the whole window.
    series.SATURN = () => 10;
    const hits = await scanWindowTransits(START, END, [{ name: 'Moon', longitude: 190 }]);
    expect(hits.filter(h => h.kind === 'conjunction')).toHaveLength(0);
  });

  it('reports a node conjunction without duplicating it as its partner opposition', async () => {
    series.RAHU = (i, n) => 170 + (20 * i) / (n - 1);
    const hits = await scanWindowTransits(START, END, [{ name: 'Lagna', longitude: 180 }]);
    expect(hits.filter(h => h.transiting === 'Rahu' && h.kind === 'conjunction')).toHaveLength(1);
    expect(hits.filter(h => h.kind === 'opposition')).toHaveLength(0);
    // Ketu sits opposite Rahu, so it crosses the point 180° away.
    expect(hits.filter(h => h.transiting === 'Ketu' && h.kind === 'conjunction')).toHaveLength(0);
  });
});

describe('scanWindowTransits — ingresses', () => {
  it('reports the sign entered when a planet moves forward', async () => {
    series.SATURN = (i, n) => 170 + (20 * i) / (n - 1);
    const hits = await scanWindowTransits(START, END, []);
    const ingress = hits.filter(h => h.transiting === 'Saturn' && h.kind === 'ingress');
    expect(ingress).toHaveLength(1);
    expect(ingress[0].rashi).toBe(6); // Tula
    const days = (new Date(ingress[0].date).getTime() - START.getTime()) / DAY;
    expect(days).toBeCloseTo(50, 0);
  });

  it('interpolates the boundary correctly when a planet moves backward', async () => {
    // Saturn retrogrades 190° → 170°, so it re-enters the sign it came from.
    series.SATURN = (i, n) => 190 - (20 * i) / (n - 1);
    const hits = await scanWindowTransits(START, END, []);
    const ingress = hits.filter(h => h.transiting === 'Saturn' && h.kind === 'ingress');
    expect(ingress).toHaveLength(1);
    expect(ingress[0].rashi).toBe(5); // Kanya
    const days = (new Date(ingress[0].date).getTime() - START.getTime()) / DAY;
    expect(days).toBeCloseTo(50, 0);
  });

  it('handles the 0°/360° wrap without inventing an extra ingress', async () => {
    series.SATURN = (i, n) => (350 + (20 * i) / (n - 1)) % 360;
    const hits = await scanWindowTransits(START, END, []);
    const ingress = hits.filter(h => h.transiting === 'Saturn' && h.kind === 'ingress');
    expect(ingress).toHaveLength(1);
    expect(ingress[0].rashi).toBe(0); // Mesha
  });
});

describe('scanWindowTransits — stations', () => {
  it('flags a retrograde station where forward motion reverses', async () => {
    series.SATURN = (i, n) => 170 + 10 * Math.sin((Math.PI * i) / (n - 1));
    const hits = await scanWindowTransits(START, END, []);
    const stations = hits.filter(h => h.transiting === 'Saturn' && h.kind.startsWith('station'));
    expect(stations).toHaveLength(1);
    expect(stations[0].kind).toBe('station-retrograde');
    expect(stations[0].detail).toContain('turns retrograde');
  });

  it('does not station-flag the nodes, whose true motion wobbles constantly', async () => {
    series.RAHU = (i, n) => 170 + 10 * Math.sin((Math.PI * i) / (n - 1));
    const hits = await scanWindowTransits(START, END, []);
    expect(hits.filter(h => h.kind.startsWith('station'))).toHaveLength(0);
  });
});

describe('scanWindowTransits — guards', () => {
  it('returns nothing for a zero-length or inverted window', async () => {
    expect(await scanWindowTransits(END, START, [])).toEqual([]);
    expect(await scanWindowTransits(START, START, [])).toEqual([]);
  });

  it('returns hits in date order', async () => {
    series.SATURN = (i, n) => 170 + (20 * i) / (n - 1);
    const hits = await scanWindowTransits(START, END, [{ name: 'Ketu', longitude: 175 }]);
    const dates = hits.map(h => h.date);
    expect([...dates].sort()).toEqual(dates);
  });
});

describe('hitsWithin', () => {
  const hit = (date: string) => ({
    transiting: 'Saturn' as const,
    kind: 'conjunction' as const,
    date,
    detail: 'x',
  });

  it('keeps only the hits inside the window, inclusive of its edges', () => {
    const all = [hit('2026-12-31T00:00:00Z'), hit(START.toISOString()), hit('2027-02-01T00:00:00Z'), hit('2028-01-01T00:00:00Z')];
    const kept = hitsWithin(all, START, END);
    expect(kept.map(h => h.date)).toEqual([START.toISOString(), '2027-02-01T00:00:00Z']);
  });
});

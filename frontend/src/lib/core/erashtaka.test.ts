import { describe, it, expect } from 'vitest';
import { assessErashtaka, erashtakaPhase, erashtakaWindows, levelOf, type ErashtakaChart } from './erashtaka';

// Rashi indices: 0 Aries … 6 Libra … 11 Pisces.
const ARIES = 0, TAURUS = 1, CANCER = 3, LEO = 4, VIRGO = 5, LIBRA = 6, CAPRICORN = 9, PISCES = 11;

describe('erashtakaPhase', () => {
  it('maps Saturn 12/1/2/4/8 from the Moon to the phases', () => {
    expect(erashtakaPhase(PISCES, ARIES)).toBe('rising');
    expect(erashtakaPhase(ARIES, ARIES)).toBe('peak');
    expect(erashtakaPhase(TAURUS, ARIES)).toBe('setting');
    expect(erashtakaPhase(CANCER, ARIES)).toBe('kantaka');
    expect(erashtakaPhase(7, ARIES)).toBe('ashtama');
    expect(erashtakaPhase(2, ARIES)).toBeNull(); // 3rd — favourable
  });
});

describe('assessErashtaka', () => {
  it('returns null when Saturn is clear of the Moon', () => {
    expect(assessErashtaka({ saturnRashi: LEO }, { moonRashi: ARIES, lagnaRashi: ARIES })).toBeNull();
  });

  it('grades an exalted Saturn over a Libra Moon for a Taurus Lagna as mild', () => {
    const a = assessErashtaka({ saturnRashi: LIBRA }, { moonRashi: LIBRA, lagnaRashi: TAURUS })!;
    expect(a.phase).toBe('peak');
    expect(a.level).toBe('mild');
    expect(a.mitigating.some(f => /exalted/.test(f.text))).toBe(true);
    expect(a.mitigating.some(f => /yogakaraka/.test(f.text))).toBe(true);
  });

  it('grades a debilitated Saturn over an Aries Moon in a Saturn dasha as severe', () => {
    const a = assessErashtaka(
      { saturnRashi: ARIES, rahuRashi: ARIES },
      { moonRashi: ARIES, lagnaRashi: LEO, saturnBhinna: Array(12).fill(1) },
      { maha: 'Saturn', antar: 'Rahu' },
    )!;
    expect(a.level).toBe('severe');
    expect(a.scoreMod).toBeLessThan(-0.9);
    expect(a.aggravating.some(f => /debilitated/.test(f.text))).toBe(true);
    expect(a.aggravating.some(f => /running Mahadasha/.test(f.text))).toBe(true);
  });

  it('is graded per zodiac — the same Saturn sits lighter on a friendly Moon sign', () => {
    // Saturn in Virgo: peak for a Virgo Moon (Mercury, Saturn's friend),
    // rising for a Libra Moon, setting for a Leo Moon (Sun, Saturn's enemy).
    const lagna = CANCER;
    const virgo = assessErashtaka({ saturnRashi: VIRGO }, { moonRashi: VIRGO, lagnaRashi: lagna })!;
    const leo = assessErashtaka({ saturnRashi: VIRGO }, { moonRashi: LEO, lagnaRashi: lagna })!;
    expect(virgo.mitigating.some(f => /friend of Saturn/.test(f.text))).toBe(true);
    expect(leo.aggravating.some(f => /enemy of Saturn/.test(f.text))).toBe(true);
  });

  it('Jupiter aspecting the Moon relieves the pressure', () => {
    const chart: ErashtakaChart = { moonRashi: CANCER, lagnaRashi: ARIES };
    const bare = assessErashtaka({ saturnRashi: CANCER }, chart)!;
    const withJup = assessErashtaka({ saturnRashi: CANCER, jupiterRashi: CAPRICORN }, chart)!; // 7th aspect
    expect(withJup.intensity).toBeLessThan(bare.intensity);
    expect(withJup.mitigating.some(f => /Jupiter/.test(f.text))).toBe(true);
  });

  it('a benefic dasha lord eases it; a Saturn dasha for a malefic Saturn doubles it', () => {
    const chart: ErashtakaChart = { moonRashi: CANCER, lagnaRashi: LEO }; // Saturn rules 6 & 7 for Leo
    const jup = assessErashtaka({ saturnRashi: CANCER }, chart, { maha: 'Jupiter' })!; // rules 5 & 8 → mixed, no shift
    const mars = assessErashtaka({ saturnRashi: CANCER }, chart, { maha: 'Mars' })!;   // rules 4 & 9 → yogakaraka
    const sat = assessErashtaka({ saturnRashi: CANCER }, chart, { maha: 'Saturn' })!;
    expect(mars.intensity).toBeLessThan(jup.intensity);
    expect(sat.intensity).toBeGreaterThan(jup.intensity);
  });

  it('speaks Sinhala with the ඒරාෂ්ටක term', () => {
    const a = assessErashtaka({ saturnRashi: ARIES }, { moonRashi: ARIES, lagnaRashi: ARIES }, {}, {}, 'si')!;
    expect(a.name).toContain('ඒරාෂ්ටක');
    expect(a.summary).toContain('ඒරාෂ්ටක');
  });

  it('levels are monotonic in intensity', () => {
    expect([1, 4, 6, 9].map(levelOf)).toEqual(['mild', 'moderate', 'strong', 'severe']);
  });
});

describe('erashtakaWindows', () => {
  it('grades each antardasha inside the phase and calls out the hardest one', () => {
    const chart: ErashtakaChart = { moonRashi: ARIES, lagnaRashi: LEO };
    const spans = [
      { maha: 'Mercury', antar: 'Venus', start: '2020-01-01T00:00:00Z', end: '2021-01-01T00:00:00Z' },
      { maha: 'Mercury', antar: 'Saturn', start: '2021-01-01T00:00:00Z', end: '2022-06-01T00:00:00Z' },
      { maha: 'Mercury', antar: 'Moon', start: '2022-06-01T00:00:00Z', end: '2023-06-01T00:00:00Z' },
    ];
    const w = erashtakaWindows('2020-06-01T00:00:00Z', '2022-12-01T00:00:00Z', ARIES, chart, spans, () => ({}));
    expect(w).toHaveLength(3);
    expect(w[0].start).toBe('2020-06-01T00:00:00.000Z'); // clipped to the phase
    const sat = w.find(x => x.antar === 'Saturn')!;
    expect(sat.intensity).toBe(Math.max(...w.map(x => x.intensity)));
    expect(sat.verdict).toBe('hardest');
    expect(sat.drivers.length).toBeGreaterThan(0);
  });
});

describe('erashtaka translations', () => {
  const LANGS = ['si', 'ta', 'zh', 'hi', 'ja', 'ko', 'ar', 'ml'] as const;
  // A chart that trips most factor sentences at once.
  const run = (lang: 'en' | typeof LANGS[number]) => assessErashtaka(
    { saturnRashi: ARIES, jupiterRashi: LEO, rahuRashi: ARIES },
    {
      moonRashi: ARIES, lagnaRashi: LEO, saturnBhinna: Array(12).fill(1), sarva: Array(12).fill(20),
      natalRashis: { Sun: ARIES, Jupiter: LEO }, natalLongitudes: { Sun: 10, Moon: 15 },
    },
    { maha: 'Saturn', antar: 'Moon' }, { cycle: 3 }, lang,
  )!;
  const en = run('en');
  const texts = (a: ReturnType<typeof run>) =>
    [a.name, a.summary, a.levelLabel, ...a.aggravating.map(f => f.text), ...a.mitigating.map(f => f.text), ...a.context, ...a.areas.map(x => x.note)];

  it.each(LANGS)('%s has no English fallback', lang => {
    const got = texts(run(lang));
    const want = texts(en);
    expect(got).toHaveLength(want.length);
    got.forEach((t, i) => expect(t, `item ${i}`).not.toBe(want[i]));
    expect(got.join(' ')).not.toMatch(/\b(Saturn|Moon|Jupiter|pressure|phase)\b/);
  });
});

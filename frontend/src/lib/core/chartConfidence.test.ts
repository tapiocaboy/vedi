/**
 * Boundary-confidence tests, anchored on the two reference charts that motivated
 * the feature.
 */

import { describe, it, expect } from 'vitest';
import { assessAscendant, assessMoon, assessChartConfidence } from './chartConfidence';

const sign = (rashi: number, deg: number) => rashi * 30 + deg;

describe('ascendant boundary — Steve Jobs, Simha 29.06°', () => {
  const asc = assessAscendant(sign(4, 29.06));

  it('is not treated as determinate', () => {
    // 0.94° from Kanya. The reference calls this "an unresolved coin flip"
    // underneath every house-based reading.
    expect(asc.confidence).toBe('indeterminate');
    expect(asc.nearest).toBeCloseTo(0.94, 2);
  });

  it('names the sign the chart would use instead', () => {
    expect(asc.alternateRashi).toBe(5);   // Kanya
    expect(asc.note).toContain('Virgo');
  });

  it('says how few minutes of error it would take', () => {
    // The reference found the flip at +5 minutes by direct sampling.
    expect(asc.minutesToNextSign).toBeLessThanOrEqual(6);
    expect(asc.note).toMatch(/birth-time error of about \d+ minute/);
  });

  it('warns that lordship and house judgements are conditional', () => {
    expect(asc.note).toContain('lordship');
  });

  it('prefers measured samples over the nominal rate', () => {
    // Sampled: the sign flips at +5 minutes, which the nominal 0.25°/min rate
    // would have put at +4.
    const measured = assessAscendant(sign(4, 29.06), [
      { offsetMinutes: 4, longitude: sign(4, 29.87) },
      { offsetMinutes: 5, longitude: sign(5, 0.0) },
      { offsetMinutes: 8, longitude: sign(5, 0.69) },
    ]);
    expect(measured.estimated).toBe(false);
    expect(measured.minutesToNextSign).toBe(5);
    expect(measured.note).not.toContain('estimated');
  });
});

describe('ascendant boundary — charts that are determinate', () => {
  it('passes a mid-sign ascendant', () => {
    // Diana: Vrischika 25.11°, and Obama: Makara 24.73°. Both are ~5° clear.
    for (const lon of [sign(7, 25.11), sign(9, 24.73)]) {
      const a = assessAscendant(lon);
      expect(a.confidence).toBe('determinate');
      expect(a.alternateRashi).toBeNull();
      expect(a.note).toContain('determinate');
    }
  });

  it('grades in minutes of birth-time error, not degrees', () => {
    // At the nominal 0.25°/min: 0.3° ≈ 1 min, 2° ≈ 8 min, 5° ≈ 20 min.
    expect(assessAscendant(sign(0, 0.3)).confidence).toBe('indeterminate');
    expect(assessAscendant(sign(0, 2.0)).confidence).toBe('borderline');
    expect(assessAscendant(sign(0, 5.0)).confidence).toBe('determinate');
  });
});

describe('Moon nakshatra boundary', () => {
  it('flags a Moon within 0°48\' of a nakshatra boundary', () => {
    // The dasha sequence is keyed to the nakshatra, so this invalidates dates.
    const nakSpan = 360 / 27;
    const m = assessMoon(nakSpan * 5 - 0.3);
    expect(m.confidence).toBe('indeterminate');
    expect(m.note).toContain('Vimshottari');
    expect(m.note).toContain('provisional');
  });

  it('passes Jobs’ and Diana’s Moons', () => {
    // Jobs Meena 14.51° (U. Bhadrapada 4), Diana Kumbha 1.72° (Dhanishta 3).
    for (const lon of [sign(11, 14.51), sign(10, 1.72)]) {
      expect(assessMoon(lon).confidence).toBe('determinate');
    }
  });

  it('catches that Obama’s Moon sits 0.04° inside Rohini', () => {
    // Vrishabha 10.04° is 40.04° absolute, and Rohini begins at exactly 40.00°.
    // The Moon moves about 0.009°/minute, so roughly four minutes earlier puts it
    // in Krittika — which would start the whole Vimshottari sequence on Sun
    // instead of Moon. The reference's own "Moon, 9.98 years remaining" balance
    // is the same fact stated another way.
    const m = assessMoon(sign(1, 10.04));
    expect(m.nakshatra).toBe('Rohini');
    expect(m.pada).toBe(1);
    expect(m.toPrevious).toBeCloseTo(0.04, 2);
    expect(m.confidence).toBe('indeterminate');
    expect(m.note).toContain('Vimshottari');
  });

  it('detects a Moon close to a rashi boundary separately', () => {
    // Diana's Moon at Kumbha 1.72° is clear of the nakshatra boundary but only
    // 1.72° into the sign — relevant because every koota is computed from it.
    const m = assessMoon(sign(10, 0.6));
    expect(m.nearRashiBoundary).toBe(true);
  });
});

describe('whole-chart confidence', () => {
  it('takes the weaker of the two and leads with the Moon', () => {
    const nakSpan = 360 / 27;
    // Both compromised: a wrong dasha sequence invalidates every dated claim,
    // so it is reported before the lagna.
    const c = assessChartConfidence(sign(4, 29.06), nakSpan * 5 - 0.2);
    expect(c.overall).toBe('indeterminate');
    expect(c.warnings[0]).toContain('Vimshottari');
    expect(c.warnings[1]).toContain('lagna');
  });

  it('is silent when both positions are clear', () => {
    // Diana: Vrischika 25.11° rising, Moon Kumbha 1.72° mid-Dhanishta.
    const c = assessChartConfidence(sign(7, 25.11), sign(10, 1.72));
    expect(c.overall).toBe('determinate');
    expect(c.warnings).toEqual([]);
  });

  it('flags Obama’s chart on the Moon alone, the lagna being clear', () => {
    const c = assessChartConfidence(sign(9, 24.73), sign(1, 10.04));
    expect(c.ascendant.confidence).toBe('determinate');
    expect(c.moon.confidence).toBe('indeterminate');
    expect(c.overall).toBe('indeterminate');
    expect(c.warnings).toHaveLength(1);
  });
});

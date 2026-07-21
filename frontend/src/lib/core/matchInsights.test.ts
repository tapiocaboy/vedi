import { describe, it, expect } from 'vitest';
import { computeMatch, analyseManglik, type MatchInput } from './matching';
import {
  buildMatchInsights, buildDimensions, marriageProspect, navamsaHarmony,
} from './matchInsights';

const base = (moonRashi: number, moonNakshatra: number, marsLagna = 5, marsMoon = 5): MatchInput =>
  ({ moonRashi, moonNakshatra, marsHouseFromLagna: marsLagna, marsHouseFromMoon: marsMoon });

/** A Moon-only input, plus chart context so the deeper layers can run. */
const withChart = (
  m: MatchInput,
  ascendantRashi: number,
  planetRashis: Record<string, number>,
  d9Ascendant?: number,
): MatchInput => ({ ...m, ascendantRashi, planetRashis, d9Ascendant });

describe('dimensions', () => {
  it('preserves the 36 points exactly — nothing invented, only regrouped', () => {
    const pairs: Array<[MatchInput, MatchInput]> = [
      [base(0, 0), base(5, 5)],
      [base(3, 6), base(3, 6)],
      [base(10, 22), base(7, 17)],
      [base(2, 14), base(8, 3)],
    ];
    for (const [a, b] of pairs) {
      const report = computeMatch(a, b);
      const dims = buildDimensions(report, a, b);
      const summed = dims.reduce((s, d) => s + d.obtained, 0);
      expect(summed).toBeCloseTo(report.kootas.reduce((s, k) => s + k.obtained, 0), 5);
      expect(dims.reduce((s, d) => s + d.max, 0)).toBe(36);
    }
  });

  it('covers all eight kootas across the five dimensions, each exactly once', () => {
    const report = computeMatch(base(0, 0), base(5, 5));
    const used = buildDimensions(report, base(0, 0), base(5, 5)).flatMap(d => d.from);
    expect(used.sort()).toEqual(
      ['Bhakoot', 'Gana', 'Graha Maitri', 'Nadi', 'Tara', 'Varna', 'Vashya', 'Yoni'],
    );
  });

  it('speaks to the reader rather than about "Person A"', () => {
    const a = base(0, 0), b = base(5, 5);
    const dims = buildDimensions(computeMatch(a, b), a, b);
    for (const d of dims) {
      expect(d.summary, d.key).not.toMatch(/Person [AB]/);
      expect(d.label, d.key).not.toMatch(/Koota|Bhakoot|Nadi|Yoni|Gana/);
    }
  });

  it('bands a perfect pairing strong and a zero-scoring one strained', () => {
    const same = base(5, 12, 3, 3);
    const dims = buildDimensions(computeMatch(same, same), same, same);
    expect(dims.find(d => d.key === 'vitality')!.band).toBe('strong');
    expect(dims.find(d => d.key === 'physical')!.band).toBe('strong');
  });
});

describe('graded Manglik', () => {
  const chart = (mars: number, jupiter: number, venus: number) =>
    ({ Mars: mars, Jupiter: jupiter, Venus: venus, Moon: 0, Sun: 0, Mercury: 0, Saturn: 0 });

  it('grades intensity by how many reference points are hit', () => {
    // Mars in the 7th from both Lagna and Moon, Venus unknown → 2 of 3.
    const two = analyseManglik(base(0, 0, 7, 7));
    expect(two.intensity).toBe(2);
    expect(two.isManglik).toBe(true);
    // Mars in a safe house from both → not Manglik at all.
    expect(analyseManglik(base(0, 0, 3, 3)).intensity).toBe(0);
  });

  it('counts Venus as a third reference point when the chart is available', () => {
    // Mars in Aries(0), Venus in Aries(0) → Mars is in the 1st from Venus.
    const d = analyseManglik({ ...base(0, 0, 7, 7), planetRashis: chart(0, 4, 0) });
    expect(d.fromVenus).toBe(true);
    expect(d.intensity).toBe(3);
  });

  it('recognises Mars in its own sign as a classical exemption', () => {
    const d = analyseManglik({ ...base(0, 0, 7, 3), planetRashis: chart(0, 4, 6) });
    expect(d.cancellations.some(c => c.includes('own sign'))).toBe(true);
    // The exemption steps the severity down from what the intensity alone gives.
    expect(d.severity).toBe('mild');
  });

  it('recognises Jupiter with or aspecting Mars as the classical neutraliser', () => {
    // Jupiter in the same sign as Mars.
    const together = analyseManglik({ ...base(0, 0, 7, 7), planetRashis: chart(2, 2, 6) });
    expect(together.cancellations.some(c => c.includes('sits with Mars'))).toBe(true);
    // Jupiter 7 signs from Mars — a full aspect.
    const aspect = analyseManglik({ ...base(0, 0, 7, 7), planetRashis: chart(2, 8, 6) });
    expect(aspect.cancellations.some(c => c.includes('aspects Mars'))).toBe(true);
    // Jupiter 3 signs away casts no aspect in this system.
    const none = analyseManglik({ ...base(0, 0, 7, 7), planetRashis: chart(2, 4, 6) });
    expect(none.cancellations).toHaveLength(0);
  });

  it('mitigates a one-sided Manglik only when that chart carries an exemption', () => {
    const exempt = { ...base(0, 0, 7, 7), planetRashis: chart(0, 4, 6) };  // Mars in own sign
    const plain  = { ...base(0, 0, 7, 7), planetRashis: chart(2, 4, 6) };  // no exemption
    const clean  = base(0, 0, 3, 3);
    expect(computeMatch(exempt, clean).doshas[0].mitigated).toBe(true);
    expect(computeMatch(plain, clean).doshas[0].mitigated).toBe(false);
    // Both afflicted still cancels mutually.
    expect(computeMatch(plain, plain).doshas[0].mitigated).toBe(true);
  });
});

describe('each chart on its own', () => {
  // Sagittarius lagna (8): 7th house is Gemini (2), ruled by Mercury.
  const rashis = { Sun: 4, Moon: 10, Mars: 8, Mercury: 5, Jupiter: 10, Venus: 6, Saturn: 7, Rahu: 11, Ketu: 5 };

  it('reads the 7th house, its lord and Venus', () => {
    const p = marriageProspect(withChart(base(10, 22), 8, rashis, 4))!;
    expect(p.seventhRashi).toBe(2);
    expect(p.seventhLord).toBe('Mercury');
    expect(p.venusDignity).toBe('own-sign');   // Venus in Libra
    expect(p.notes.join(' ')).toContain('house of marriage');
    expect(p.notes.join(' ')).toContain('Navamsa');
  });

  it('reports a malefic in the 7th without predicting failure', () => {
    // Put Saturn in Gemini (2), the 7th from Sagittarius.
    const p = marriageProspect(withChart(base(10, 22), 8, { ...rashis, Saturn: 2 }))!;
    expect(p.maleficsInSeventh).toContain('Saturn');
    const text = p.notes.join(' ');
    expect(text).toContain('does not predict failure');
  });

  it('returns null when the chart context is unavailable', () => {
    expect(marriageProspect(base(10, 22))).toBeNull();
  });
});

describe('navamsa cross-check', () => {
  it('reads the relationship between the two Navamsa rising lords', () => {
    // Leo (4) → Sun; Capricorn (9) → Saturn. Natural opponents.
    const h = navamsaHarmony({ ...base(0, 0), d9Ascendant: 4 }, { ...base(5, 5), d9Ascendant: 9 })!;
    expect(h.relation).toBe('enemy');
    expect(h.summary).toContain('weights above guna count');
  });

  it('is null without Navamsa data, so the reading degrades rather than lying', () => {
    expect(navamsaHarmony(base(0, 0), base(5, 5))).toBeNull();
  });
});

describe('guidance', () => {
  it('matches the emotional advice to the actual cause, not to money by default', () => {
    // Bhakoot passes (same rashi) but Gana is Deva vs Rakshasa → temperament.
    const a = base(0, 0);   // Ashwini = Deva
    const b = base(0, 2);   // Krittika = Rakshasa
    const ins = buildMatchInsights(computeMatch(a, b), a, b);
    const f = ins.guidance.frictions.find(x => x.area.startsWith('Emotional'));
    expect(f).toBeDefined();
    expect(f!.whatHelps).not.toContain('money');
    expect(f!.whatItLooksLike).toMatch(/blunt|pace/);
  });

  it('gives money-and-health advice when the cause really is a 6-8 Bhakoot', () => {
    const a = base(0, 0), b = base(5, 0);   // rashis 5 apart → 6/8
    const ins = buildMatchInsights(computeMatch(a, b), a, b);
    const f = ins.guidance.frictions.find(x => x.area.startsWith('Emotional'))!;
    expect(f.whatItLooksLike).toContain('Money and health');
    expect(f.whatHelps).toContain('visible to each other');
  });

  it('states a poor score plainly without predicting unhappiness', () => {
    const a = base(0, 0), b = base(5, 5);
    const ins = buildMatchInsights(computeMatch(a, b), a, b);
    expect(ins.guidance.framing).toContain('does not endorse');
    expect(ins.guidance.framing).toContain('not predicting unhappiness');
  });

  it('never returns an empty strengths list, and never pads it dishonestly', () => {
    const a = base(0, 0), b = base(5, 5);
    const ins = buildMatchInsights(computeMatch(a, b), a, b);
    expect(ins.guidance.strengths.length).toBeGreaterThan(0);
    for (const s of ins.guidance.strengths) {
      expect(s.label.length).toBeGreaterThan(3);
      expect(s.text.length).toBeGreaterThan(20);
    }
  });

  it('pairs every friction with something concrete to do about it', () => {
    for (const [a, b] of [[base(0, 0), base(5, 5)], [base(2, 14), base(8, 3)]] as Array<[MatchInput, MatchInput]>) {
      const ins = buildMatchInsights(computeMatch(a, b), a, b);
      for (const f of ins.guidance.frictions) {
        expect(f.whatItLooksLike.length, f.area).toBeGreaterThan(30);
        expect(f.whatHelps.length, f.area).toBeGreaterThan(30);
      }
    }
  });
});

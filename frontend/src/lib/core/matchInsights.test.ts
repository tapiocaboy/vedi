import { describe, it, expect } from 'vitest';
import { computeGunaMilan, analyseManglik, type MatchInput } from './matching';
import { buildLayeredReport } from './matchReport';
import { buildMatchInsights, buildDimensions, navamsaHarmony } from './matchInsights';

const base = (moonRashi: number, moonNakshatra: number, marsLagna = 5, marsMoon = 5): MatchInput =>
  ({ moonRashi, moonNakshatra, marsHouseFromLagna: marsLagna, marsHouseFromMoon: marsMoon });

const layered = (a: MatchInput, b: MatchInput) => buildLayeredReport(a, b, { aIsFemale: false });

describe('dimensions', () => {
  it('preserves the 36 points exactly — nothing invented, only regrouped', () => {
    const pairs: Array<[MatchInput, MatchInput]> = [
      [base(0, 0), base(5, 5)],
      [base(3, 6), base(3, 6)],
      [base(10, 22), base(7, 17)],
      [base(2, 14), base(8, 3)],
    ];
    for (const [a, b] of pairs) {
      const l1 = computeGunaMilan(a, b);
      const dims = buildDimensions(l1, a, b);
      expect(dims.reduce((s, d) => s + d.obtained, 0)).toBeCloseTo(l1.total, 5);
      expect(dims.reduce((s, d) => s + d.max, 0)).toBe(36);
    }
  });

  it('covers all eight kootas across the five dimensions, each exactly once', () => {
    const a = base(0, 0), b = base(5, 5);
    const used = buildDimensions(computeGunaMilan(a, b), a, b).flatMap(d => d.from);
    expect(used.sort()).toEqual(
      ['Bhakoot', 'Gana', 'Graha Maitri', 'Nadi', 'Tara', 'Varna', 'Vashya', 'Yoni'],
    );
  });

  it('speaks to the reader rather than about "Person A"', () => {
    const a = base(0, 0), b = base(5, 5);
    for (const d of buildDimensions(computeGunaMilan(a, b), a, b)) {
      expect(d.summary, d.key).not.toMatch(/Person [AB]/);
      expect(d.label, d.key).not.toMatch(/Koota|Bhakoot|Nadi|Yoni|Gana/);
    }
  });

  it('bands a perfect pairing strong', () => {
    const same = base(5, 12, 3, 3);
    const dims = buildDimensions(computeGunaMilan(same, same), same, same);
    expect(dims.find(d => d.key === 'vitality')!.band).toBe('strong');
    expect(dims.find(d => d.key === 'physical')!.band).toBe('strong');
  });
});

describe('graded Kuja dosha', () => {
  /** Saturn is parked 6 signs from Mars so its aspect never interferes. */
  const chart = (mars: number, jupiter: number, venus: number) =>
    ({ Mars: mars, Jupiter: jupiter, Venus: venus, Moon: 0, Sun: 0, Mercury: 0, Saturn: (mars + 5) % 12 });

  it('grades intensity by how many reference points are hit', () => {
    const two = analyseManglik(base(0, 0, 7, 7));
    expect(two.intensity).toBe(2);
    expect(two.isManglik).toBe(true);
    expect(analyseManglik(base(0, 0, 3, 3)).intensity).toBe(0);
  });

  it('counts Venus as a third reference point when the chart is available', () => {
    // Mars in Mithuna, Venus in Mithuna → Mars is in the 1st from Venus.
    const d = analyseManglik({ ...base(0, 0, 7, 7), planetRashis: chart(2, 4, 2) });
    expect(d.fromVenus).toBe(true);
    expect(d.intensity).toBe(3);
  });

  it('recognises Mars in its own sign as a classical exemption', () => {
    const d = analyseManglik({ ...base(0, 0, 7, 3), planetRashis: chart(0, 4, 6) });
    expect(d.cancellations.some(c => c.includes('own sign'))).toBe(true);
    expect(d.severity).toBe('mild');
  });

  it('recognises Jupiter with or aspecting Mars as the classical neutraliser', () => {
    const together = analyseManglik({ ...base(0, 0, 7, 7), planetRashis: chart(2, 2, 6) });
    expect(together.cancellations.some(c => c.includes('sits with Mars'))).toBe(true);
    const aspect = analyseManglik({ ...base(0, 0, 7, 7), planetRashis: chart(2, 8, 6) });
    expect(aspect.cancellations.some(c => c.includes('Jupiter aspects Mars'))).toBe(true);
  });

  it('finds no cancellation when nothing reaches Mars', () => {
    // Mars in Mithuna (no dignity route), Jupiter 3 signs off (Jupiter has no
    // 3rd-house aspect), Saturn 6 signs off (Saturn has no 6th-house aspect).
    const none = analyseManglik({
      ...base(0, 0, 7, 7),
      planetRashis: { Mars: 2, Jupiter: 4, Venus: 6, Saturn: 7, Rahu: 9, Ketu: 3 },
    });
    expect(none.cancellations).toHaveLength(0);
  });

  it('mitigates a one-sided dosha only when that chart carries an exemption', () => {
    const exempt = { ...base(0, 0, 7, 7), planetRashis: chart(0, 4, 6) };
    const plain = {
      ...base(0, 0, 7, 7),
      planetRashis: { Mars: 2, Jupiter: 4, Venus: 6, Saturn: 7, Rahu: 9, Ketu: 3 },
    };
    const clean = { ...base(0, 0, 3, 3), planetRashis: { Mars: 2, Venus: 0 } };

    expect(layered(exempt, clean).layer2Doshas.netA).toBe('mitigated');
    expect(layered(plain, clean).layer2Doshas.netA).toBe('active');
    // Both afflicted still cancels mutually.
    expect(layered(plain, plain).layer2Doshas.netA).toBe('mitigated');
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
  it('leads the framing on what the koota count measures, not on a grade', () => {
    const a = base(0, 0), b = base(5, 5);
    const ins = buildMatchInsights(layered(a, b), a, b);
    expect(ins.guidance.framing).toContain('one thing');
    expect(ins.guidance.framing).toMatch(/gate of 18/);
    // No verdict language survives — the spec forbids presenting the total as quality.
    expect(ins.guidance.framing).not.toMatch(/excellent|not recommended|strong match/i);
  });

  it('matches the emotional advice to the actual cause, not to money by default', () => {
    // Bhakoot passes (4/10 axis) but Gana is Deva vs Rakshasa → temperament.
    // Different Moon signs matter here: same-sign Moons share a lord, which
    // cancels the Gana shortfall outright and leaves nothing to advise about.
    const a = base(0, 0);   // Mesha / Ashwini  = Deva
    const b = base(3, 8);   // Kataka / Ashlesha = Rakshasa
    const ins = buildMatchInsights(layered(a, b), a, b);
    const f = ins.guidance.frictions.find(x => x.area.startsWith('Emotional'));
    expect(f).toBeDefined();
    expect(f!.whatHelps).not.toContain('money');
    expect(f!.whatItLooksLike).toMatch(/blunt|pace/);
  });

  it('gives money-and-health advice when the cause really is a 6-8 Bhakoot', () => {
    // Mesha and Kanya: 6/8 axis, and Mars/Mercury are not mutual friends so no
    // cancellation applies.
    const a = base(0, 0), b = base(5, 12);
    const ins = buildMatchInsights(layered(a, b), a, b);
    const f = ins.guidance.frictions.find(x => x.area.startsWith('Emotional'))!;
    expect(f.whatItLooksLike).toContain('Money and health');
    expect(f.whatHelps).toContain('visible to each other');
  });

  it('never returns an empty strengths list, and never pads it dishonestly', () => {
    const a = base(0, 0), b = base(5, 5);
    const ins = buildMatchInsights(layered(a, b), a, b);
    expect(ins.guidance.strengths.length).toBeGreaterThan(0);
    for (const s of ins.guidance.strengths) {
      expect(s.label.length).toBeGreaterThan(3);
      expect(s.text.length).toBeGreaterThan(20);
    }
  });

  it('pairs every friction with something concrete to do about it', () => {
    for (const [a, b] of [[base(0, 0), base(5, 5)], [base(2, 14), base(8, 3)]] as Array<[MatchInput, MatchInput]>) {
      const ins = buildMatchInsights(layered(a, b), a, b);
      for (const f of ins.guidance.frictions) {
        expect(f.whatItLooksLike.length, f.area).toBeGreaterThan(30);
        expect(f.whatHelps.length, f.area).toBeGreaterThan(30);
      }
    }
  });
});

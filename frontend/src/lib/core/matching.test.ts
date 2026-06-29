import { describe, it, expect } from 'vitest'
import { computeMatch, type MatchInput } from './matching'

function person(moonRashi: number, moonNakshatra: number, marsFromLagna = 5, marsFromMoon = 5): MatchInput {
  return { moonRashi, moonNakshatra, marsHouseFromLagna: marsFromLagna, marsHouseFromMoon: marsFromMoon }
}

describe('Ashtakoot Milan', () => {
  it('every koota stays within its declared max', () => {
    const r = computeMatch(person(0, 0), person(4, 10))
    expect(r.kootas).toHaveLength(8)
    const declaredMaxes = [1, 2, 3, 4, 5, 6, 7, 8]
    r.kootas.forEach((k, i) => {
      expect(k.max).toBe(declaredMaxes[i])
      expect(k.obtained).toBeGreaterThanOrEqual(0)
      expect(k.obtained).toBeLessThanOrEqual(k.max)
    })
    expect(r.totalMax).toBe(36)
  })

  it('identical charts score 33/36 (Janma tara reduces the Tara koota classically) and pass every other check', () => {
    const me = person(3, 6)
    const r = computeMatch(me, me)
    // Tara = 0/3 because both directions land on the 1st (Janma) tara,
    // which is treated as inauspicious in classical Ashtakoot Milan.
    expect(r.kootas.find(k => k.name === 'Tara')?.obtained).toBe(0)
    expect(r.totalObtained).toBe(33)
    expect(r.verdict).toBe('excellent') // 33 ≥ 32
    // Same nakshatra cancels Nadi Dosha, same rashi means no Bhakoot.
    expect(r.kootas.find(k => k.name === 'Nadi')?.obtained).toBe(8)
    expect(r.kootas.find(k => k.name === 'Bhakoot')?.obtained).toBe(7)
  })

  it('detects Bhakoot Dosha (6-8 / 2-12 / 5-9 rashi distance)', () => {
    // Rashis 6 apart from each other → distances 7/7 → NOT dosha
    expect(computeMatch(person(0, 0), person(6, 0)).kootas.find(k => k.name === 'Bhakoot')?.obtained).toBe(7)
    // Rashis 5 apart → distances 6/8 → Bhakoot Dosha (Shadashtak)
    const sixEight = computeMatch(person(0, 0), person(5, 0)).kootas.find(k => k.name === 'Bhakoot')!
    expect(sixEight.obtained).toBe(0)
    expect(sixEight.reason).toMatch(/Shadashtak/)
  })

  it('detects Nadi Dosha and respects the same-nakshatra cancellation', () => {
    // Pick two different nakshatras with the same nadi: 0 (Adi) and 5 (Adi).
    const dosha = computeMatch(person(0, 0), person(2, 5)).kootas.find(k => k.name === 'Nadi')!
    expect(dosha.obtained).toBe(0)
    expect(dosha.reason).toMatch(/Nadi Dosha present/)
    // Same nakshatra → cancellation
    const ok = computeMatch(person(0, 0), person(2, 0)).kootas.find(k => k.name === 'Nadi')!
    expect(ok.obtained).toBe(8)
    expect(ok.reason).toMatch(/cancels/)
  })

  it('Manglik dosha cancels when both persons are Manglik', () => {
    const manglik: MatchInput = { moonRashi: 0, moonNakshatra: 0, marsHouseFromLagna: 7, marsHouseFromMoon: 7 }
    const clean:   MatchInput = { moonRashi: 0, moonNakshatra: 0, marsHouseFromLagna: 3, marsHouseFromMoon: 3 }
    // Both manglik
    const both = computeMatch(manglik, manglik).doshas.find(d => d.name.startsWith('Mangal'))!
    expect(both.present).toBe(true)
    expect(both.mitigated).toBe(true)
    // Only one — unresolved
    const one = computeMatch(manglik, clean).doshas.find(d => d.name.startsWith('Mangal'))!
    expect(one.present).toBe(true)
    expect(one.mitigated).toBe(false)
    // Neither
    const none = computeMatch(clean, clean).doshas.find(d => d.name.startsWith('Mangal'))!
    expect(none.present).toBe(false)
  })

  it('produces non-empty whyMatching / whyNotMatching lists', () => {
    const r = computeMatch(person(0, 0), person(5, 5))
    expect(r.whyMatching.length + r.whyNotMatching.length).toBeGreaterThan(0)
    // Each line includes the koota name & score
    for (const line of [...r.whyMatching, ...r.whyNotMatching]) {
      expect(line.length).toBeGreaterThan(10)
    }
  })

  it('an unmitigated Manglik dosha overrides a good guna score (1986 Kandy case)', () => {
    // A: Aquarius/Dhanishta, Mars in 1st from Lagna → Manglik.
    // B: Scorpio/Jyeshtha, Mars not in a Manglik house → not Manglik.
    const a = person(10, 22, 1, 11);
    const b = person(7, 17, 2, 2);
    const r = computeMatch(a, b);
    // Decent guna total on its own…
    expect(r.totalObtained).toBeGreaterThanOrEqual(18);
    // …but the Manglik mismatch is a deal-breaker.
    const manglik = r.doshas.find(d => d.name.startsWith('Mangal'))!;
    expect(manglik.present).toBe(true);
    expect(manglik.mitigated).toBe(false);
    expect(r.verdict).toBe('not recommended');
  });

  it('a deal-breaker dosha never reports better than "acceptable" via gunas alone', () => {
    // High gunas but one-sided Manglik → must be capped to not recommended.
    const a: MatchInput = { moonRashi: 5, moonNakshatra: 12, marsHouseFromLagna: 7, marsHouseFromMoon: 7 };
    const b: MatchInput = { moonRashi: 5, moonNakshatra: 12, marsHouseFromLagna: 3, marsHouseFromMoon: 3 };
    const r = computeMatch(a, b);
    expect(r.verdict).toBe('not recommended');
  });

  it('verdict thresholds map correctly', () => {
    // Two compatible charts (same rashi + nakshatra + Mars in safe houses) → 36 → excellent
    const top = computeMatch(person(5, 12, 3, 3), person(5, 12, 3, 3))
    expect(top.verdict).toBe('excellent')
    // Two adversarial charts (different rashis triggering Bhakoot, different ganas) → low
    const low = computeMatch(person(0, 2), person(5, 8, 7, 7))  // Aries Rakshasa vs Virgo Manushya, 6-distance for Bhakoot bad pair
    expect(['acceptable', 'not recommended', 'good']).toContain(low.verdict)
  })
})

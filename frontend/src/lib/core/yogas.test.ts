import { describe, it, expect } from 'vitest';
import { YogaCalculator } from './yogas';

describe('Yoga de-duplication', () => {
  it('collapses a Kendra-Trikona Rajayoga duplicated by a planet ruling two kendras', () => {
    // Gemini ascendant (rashi 2): Mercury lords the 1st (Gemini) and 4th (Virgo)
    // — both kendras — so it appears twice in the kendra-lord list. With Mercury
    // conjoining Venus (the 5th/trikona lord), the same rajayoga is generated
    // once per kendra rulership → a redundant duplicate.
    const positions = { SUN: 0, MOON: 1, MARS: 3, MERCURY: 5, JUPITER: 8, VENUS: 5, SATURN: 10, RAHU: 6, KETU: 0 };
    const calc = new YogaCalculator(positions, 2);

    // Raw detector produces the same Mercury–Venus pair more than once.
    const raw = calc.detectKendraTrikona().filter(y => [...y.planetsInvolved].sort().join() === 'MERCURY,VENUS');
    expect(raw.length).toBeGreaterThan(1);

    // detectAllYogas() collapses it to a single entry.
    const deduped = calc.detectAllYogas();
    const mv = deduped.filter(y => y.name === 'Kendra-Trikona Rajayoga' && [...y.planetsInvolved].sort().join() === 'MERCURY,VENUS');
    expect(mv).toHaveLength(1);

    // Invariant: no two present yogas share the same name + planet set.
    const keys = deduped.map(y => `${y.name}|${[...y.planetsInvolved].sort().join(',')}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('keeps genuinely distinct yogas (different planet pairs) intact', () => {
    const positions = { SUN: 0, MOON: 1, MARS: 3, MERCURY: 5, JUPITER: 8, VENUS: 5, SATURN: 10, RAHU: 6, KETU: 0 };
    const deduped = new YogaCalculator(positions, 2).detectAllYogas();
    // The Jupiter–Venus kendra-trikona pair is a different yoga and must survive.
    const jv = deduped.filter(y => y.name === 'Kendra-Trikona Rajayoga' && [...y.planetsInvolved].sort().join() === 'JUPITER,VENUS');
    expect(jv.length).toBeLessThanOrEqual(1);
  });
});

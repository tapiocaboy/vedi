import { describe, it, expect } from 'vitest';
import { analyzeHouse } from './houseAnalysis';

// rashi indices: 0=Aries 1=Taurus 2=Gemini 3=Cancer 4=Leo 5=Virgo
//                6=Libra 7=Scorpio 8=Sagittarius 9=Capricorn 10=Aquarius 11=Pisces

const planet = (name: string, rashiIndex: number, isRetrograde = false) =>
  ({ planet: name, rashiIndex, isRetrograde });

/**
 * The chart layer keys planets in upper case while every prose table in the
 * engines is title-cased. Each of these covers a lookup that fails silently
 * rather than loudly when the two are not reconciled.
 */
describe('planet key casing from the chart layer', () => {
  const asc = 2; // Gemini ascendant → 9th house = Aquarius, ruled by Saturn

  it('locates the house lord when the chart map is upper case', () => {
    const planets = [planet('SATURN', 9), planet('MARS', 10)];
    const map = { SATURN: 9, MARS: 10 };
    const a = analyzeHouse(9, asc, planets, map);

    expect(a.rashiLord).toBe('Saturn');
    expect(a.lordHouse).toBe(8);            // Capricorn is the 8th from Gemini
    expect(a.lordDignity).toBe('own-sign'); // Saturn in Capricorn
    expect(a.lordHouseDesc).not.toContain('house 0');
  });

  it('still works when the caller already supplies title case', () => {
    const planets = [planet('Saturn', 9)];
    const a = analyzeHouse(9, asc, planets, { Saturn: 9 });
    expect(a.lordHouse).toBe(8);
    expect(a.lordDignity).toBe('own-sign');
  });

  it('reports house 0 only when the lord genuinely is not in the chart', () => {
    const a = analyzeHouse(9, asc, [], {});
    expect(a.lordHouse).toBe(0);
  });

  it('fills the planet keyword list rather than leaving a gap in the sentence', () => {
    const a = analyzeHouse(1, 0, [planet('SATURN', 0)], { SATURN: 0 });
    const effect = a.planetEffects[0].effect;
    expect(effect).toContain('Saturn');       // not 'SATURN'
    expect(effect).not.toMatch(/brings\s{2,}/); // no empty keyword slot
    expect(effect).toContain('karma');
  });

  it('matches a named combination despite upper-case planet names', () => {
    // Jupiter + Moon in the same sign is Gaja Kesari.
    const a = analyzeHouse(1, 0, [planet('JUPITER', 0), planet('MOON', 0)], { JUPITER: 0, MOON: 0 });
    expect(a.combinationEffect).toContain('Gajakesari');
  });
});

describe('localised house display', () => {
  it('returns the theme and governed areas in the requested language', () => {
    const en = analyzeHouse(10, 0, [], {}, 'en');
    const si = analyzeHouse(10, 0, [], {}, 'si');

    expect(en.themeLabel).toBe('Career & Status');
    expect(si.themeLabel).not.toBe(en.themeLabel);
    expect(si.themeLabel.length).toBeGreaterThan(0);

    expect(en.ruleLabels).toContain('career');
    expect(si.ruleLabels).toHaveLength(en.ruleLabels.length);
    expect(si.ruleLabels[0]).not.toBe(en.ruleLabels[0]);
  });
});

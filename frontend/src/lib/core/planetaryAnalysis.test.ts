import { describe, it, expect } from 'vitest';
import {
  getDignity,
  getFunctionalNature,
  getDigBala,
  inMoolatrikona,
  getCombustion,
  getNeechaBhanga,
  assessStrength,
  analyzePlanet,
} from './planetaryAnalysis';

// rashi indices: 0=Aries 1=Taurus 2=Gemini 3=Cancer 4=Leo 5=Virgo
//                6=Libra 7=Scorpio 8=Sagittarius 9=Capricorn 10=Aquarius 11=Pisces

describe('functional nature (lordship from the Ascendant)', () => {
  it('flags Saturn as Yogakaraka for Taurus and Libra ascendants', () => {
    expect(getFunctionalNature('Saturn', 1).nature).toBe('yogakaraka'); // rules 9 & 10
    expect(getFunctionalNature('Saturn', 6).nature).toBe('yogakaraka'); // rules 4 & 5
  });

  it('flags Mars as Yogakaraka for Cancer and Leo ascendants', () => {
    expect(getFunctionalNature('Mars', 3).isYogakaraka).toBe(true); // rules 5 & 10
    expect(getFunctionalNature('Mars', 4).isYogakaraka).toBe(true); // rules 4 & 9
  });

  it('treats a lagna-lord that also rules a dusthana as benefic (Aries asc Mars rules 1 & 8)', () => {
    const f = getFunctionalNature('Mars', 0);
    expect(f.rulesHouses).toEqual([1, 8]);
    expect(f.nature).toBe('benefic');
  });

  it('gives shadow planets a neutral, rulership-free nature', () => {
    expect(getFunctionalNature('Rahu', 0).rulesHouses).toEqual([]);
    expect(getFunctionalNature('Ketu', 5).nature).toBe('neutral');
  });
});

describe('Dig Bala (directional strength)', () => {
  it('is strongest in the planet’s directional house and weakest opposite', () => {
    expect(getDigBala('Sun', 10).level).toBe('strong');
    expect(getDigBala('Sun', 4).level).toBe('weak');
    expect(getDigBala('Jupiter', 1).level).toBe('strong');
    expect(getDigBala('Jupiter', 7).level).toBe('weak');
    expect(getDigBala('Saturn', 7).level).toBe('strong');
  });

  it('returns "na" for shadow planets', () => {
    expect(getDigBala('Rahu', 10).level).toBe('na');
  });
});

describe('Moolatrikona (degree-aware)', () => {
  it('detects the root-trine degree band and rejects outside it', () => {
    expect(inMoolatrikona('Sun', 4, 10, getDignity('Sun', 4))).toBe(true);   // Leo 10°
    expect(inMoolatrikona('Sun', 4, 25, getDignity('Sun', 4))).toBe(false);  // Leo 25° → own sign
    expect(inMoolatrikona('Mars', 0, 5, getDignity('Mars', 0))).toBe(true);  // Aries 5°
    expect(inMoolatrikona('Jupiter', 8, 3, getDignity('Jupiter', 8))).toBe(true); // Sag 3°
  });
});

describe('combined strength assessment', () => {
  it('ranks an exalted Yogakaraka well above a debilitated functional malefic', () => {
    const strong = assessStrength({
      planet: 'Saturn', dignity: 'exalted', moolatrikona: false,
      dig: getDigBala('Saturn', 7), functional: getFunctionalNature('Saturn', 1), isRetrograde: false,
    });
    const weak = assessStrength({
      planet: 'Mars', dignity: 'debilitated', moolatrikona: false,
      dig: getDigBala('Mars', 4), functional: getFunctionalNature('Mars', 5), isRetrograde: false,
    });
    expect(strong.score).toBeGreaterThan(weak.score);
    expect(strong.verdict).toBe('very-strong');
  });
});

describe('combustion (Astangata)', () => {
  it('flags a planet inside the Sun’s orb and clears one outside it', () => {
    expect(getCombustion('Mercury', 100, 105, false)?.isCombust).toBe(true);  // 5° ≤ 14°
    expect(getCombustion('Mercury', 100, 120, false)?.isCombust).toBe(false); // 20° > 14°
    expect(getCombustion('Jupiter', 359, 3, false)?.isCombust).toBe(true);    // wrap-around 4° ≤ 11°
  });

  it('uses the tighter orb for retrograde Venus and never combusts the Sun/nodes', () => {
    expect(getCombustion('Venus', 100, 109, true)?.isCombust).toBe(false); // 9° > 8° retro orb
    expect(getCombustion('Venus', 100, 105, true)?.isCombust).toBe(true);  // 5° ≤ 8°
    expect(getCombustion('Sun', 100, 100, false)).toBeNull();
    expect(getCombustion('Rahu', 100, 105, false)).toBeNull();
  });
});

describe('Neecha Bhanga (cancellation of debilitation)', () => {
  it('cancels when the dispositor of the debilitation sign is in its own sign', () => {
    // Sun debilitated in Libra (6); its dispositor Venus sits in Taurus (own sign).
    const nb = getNeechaBhanga({
      planet: 'Sun', rashiIndex: 6, ascIndex: 0, isRetrograde: false,
      signByPlanet: { Sun: 6, Venus: 1, Saturn: 5, Moon: 1 },
    });
    expect(nb.applies).toBe(true);
    expect(nb.cancelled).toBe(true);
  });

  it('leaves debilitation standing when no condition is met', () => {
    const nb = getNeechaBhanga({
      planet: 'Sun', rashiIndex: 6, ascIndex: 0, isRetrograde: false,
      signByPlanet: { Sun: 6, Venus: 2, Saturn: 5, Moon: 1 },
    });
    expect(nb.applies).toBe(true);
    expect(nb.cancelled).toBe(false);
  });

  it('does not apply to a non-debilitated planet', () => {
    expect(getNeechaBhanga({
      planet: 'Sun', rashiIndex: 4, ascIndex: 0, isRetrograde: false, signByPlanet: { Sun: 4 },
    }).applies).toBe(false);
  });
});

describe('analyzePlanet integration', () => {
  it('surfaces the new factors and respects the optional degree for Moolatrikona', () => {
    // Sun in Leo (4) for an Aries (0) ascendant → 5th house, Leo 10°
    const a = analyzePlanet('Sun', 4, 0, false, 10);
    expect(a.house).toBe(5);
    expect(a.moolatrikona).toBe(true);
    expect(a.functional.nature).toBeDefined();
    expect(a.strength.score).toBeGreaterThan(0);
    // without a degree, Moolatrikona cannot be detected
    expect(analyzePlanet('Sun', 4, 0, false).moolatrikona).toBe(false);
  });
});

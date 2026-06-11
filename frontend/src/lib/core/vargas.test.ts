import { describe, it, expect } from 'vitest';
import { navamsaRashi, dasamsaRashi, computeVargas } from './vargas';

describe('navamsaRashi (D9)', () => {
  it('maps the first navamsa of Aries to Aries (movable: counts from itself)', () => {
    expect(navamsaRashi(0)).toBe(0);      // Aries 0°00′
    expect(navamsaRashi(3.2)).toBe(0);    // still 1st ninth
  });

  it('maps the last navamsa of Aries to Sagittarius', () => {
    expect(navamsaRashi(28)).toBe(8);     // Aries 28° → 9th ninth → Sagittarius
  });

  it('maps the first navamsa of Taurus to Capricorn (fixed: counts from 9th)', () => {
    expect(navamsaRashi(30)).toBe(9);
  });

  it('maps the first navamsa of Gemini to Libra (dual: counts from 5th)', () => {
    expect(navamsaRashi(60)).toBe(6);
  });

  it('wraps longitudes ≥360', () => {
    expect(navamsaRashi(360)).toBe(navamsaRashi(0));
  });
});

describe('dasamsaRashi (D10)', () => {
  it('odd signs count from themselves', () => {
    expect(dasamsaRashi(0)).toBe(0);      // Aries 0° → Aries
    expect(dasamsaRashi(29)).toBe(9);     // Aries 29° → 10th division → Capricorn
  });

  it('even signs count from the 9th sign', () => {
    expect(dasamsaRashi(30)).toBe(9);     // Taurus 0° → 9th from Taurus = Capricorn
    expect(dasamsaRashi(59)).toBe(6);     // Taurus 29° → Capricorn + 9 = Libra
  });
});

describe('computeVargas', () => {
  it('flags vargottama planets (same rashi in D1 and D9)', () => {
    // Aries 1° → D1 Aries, D9 Aries → vargottama
    const chart = computeVargas({
      longitudes: { Sun: 1, Moon: 45 }, // Moon: Taurus 15° → D9 = floor(45/3.333)=13 mod 12=1 → Taurus! also vargottama
      ascendantLongitude: 100,
    });
    const sun = chart.planets.find(p => p.planet === 'Sun')!;
    expect(sun.isVargottama).toBe(true);
    expect(chart.vargottamaPlanets).toContain('Sun');
  });

  it('computes D9 dignity (Venus in Pisces navamsa = exalted)', () => {
    // Venus at Cancer 26° (longitude 116°): D9 = floor(116/3.3333) = 34 mod 12 = 10 → Aquarius… pick a known case:
    // Venus at longitude 356° (Pisces 26°): D9 = floor(356/3.3333) = 106 mod 12 = 10 → Aquarius. Use direct:
    // We want D9 = Pisces (11). floor(L/3.3333) mod 12 === 11 → e.g. L = 11 * 3.3333 = 36.67° (Taurus 6.67°).
    const chart = computeVargas({
      longitudes: { Venus: 36.8 },
      ascendantLongitude: 0,
    });
    const venus = chart.planets.find(p => p.planet === 'Venus')!;
    expect(venus.d9Rashi).toBe(11);
    expect(venus.d9Dignity).toBe('exalted');
  });

  it('computes ascendant vargas', () => {
    const chart = computeVargas({ longitudes: {}, ascendantLongitude: 0 });
    expect(chart.d9Ascendant).toBe(0);
    expect(chart.d10Ascendant).toBe(0);
  });
});

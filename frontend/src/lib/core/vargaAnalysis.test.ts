import { describe, it, expect } from 'vitest';
import { analyzeVargaHouse } from './vargaAnalysis';
import { computeVargas } from './vargas';

// Chart fixture: Sun at Aries 1° (vargottama), Venus in Pisces navamsa (exalted)
const chart = computeVargas({
  longitudes: { Sun: 1, Venus: 36.8, Jupiter: 100 },
  ascendantLongitude: 0, // D9 lagna = Aries(0), D10 lagna = Aries(0)
});

describe('analyzeVargaHouse', () => {
  it('computes the house number from the varga lagna', () => {
    const a = analyzeVargaHouse('D9', 6, chart.d9Ascendant, chart.planets); // Libra from Aries lagna
    expect(a.houseNumber).toBe(7);
    expect(a.theme).toBe('The Spouse');
    expect(a.rashiLord).toBe('Venus');
  });

  it('flags the varga lagna', () => {
    const a = analyzeVargaHouse('D9', chart.d9Ascendant, chart.d9Ascendant, chart.planets);
    expect(a.isLagna).toBe(true);
    expect(a.houseNumber).toBe(1);
  });

  it('lists occupants with specialised, dignity-aware effects', () => {
    const sun = chart.planets.find(p => p.planet === 'Sun')!;
    const a = analyzeVargaHouse('D9', sun.d9Rashi, chart.d9Ascendant, chart.planets);
    const eff = a.planetEffects.find(e => e.planet === 'Sun')!;
    expect(eff.isVargottama).toBe(true);
    expect(eff.effect).toContain('dignity');
  });

  it('uses marriage themes for D9 and career themes for D10', () => {
    const d9 = analyzeVargaHouse('D9', (chart.d9Ascendant + 9) % 12, chart.d9Ascendant, chart.planets);
    const d10 = analyzeVargaHouse('D10', (chart.d10Ascendant + 9) % 12, chart.d10Ascendant, chart.planets);
    expect(d9.houseNumber).toBe(10);
    expect(d9.theme).toBe('Marriage in the World');
    expect(d10.theme).toBe('Karma & Status');
  });

  it('reports where the house lord sits within the same varga', () => {
    // Venus at 36.8° → D9 Pisces(11). Ask about Libra (lord Venus) in D9 from Aries lagna:
    const a = analyzeVargaHouse('D9', 6, chart.d9Ascendant, chart.planets);
    expect(a.lordHouse).toBe(12); // Pisces is 12th from Aries
  });
});

import { describe, it, expect } from 'vitest';
import { GOCHARA_PHALA, gocharaEffect, computeZodiacEffects } from './gocharaPhala';
import { valenceFromMoon } from './transits';
import type { PlanetTransit, GocharaSnapshot } from './transits';

const PLANETS = ['SUN', 'MOON', 'MARS', 'MERCURY', 'JUPITER', 'VENUS', 'SATURN', 'RAHU', 'KETU'];

function stub(transits: PlanetTransit[]): GocharaSnapshot {
  return {
    asOf: '', natalMoonRashi: 0, natalLagnaRashi: 0, transits, natalPlanets: [],
    sadeSati: { active: false, phase: 'none', description: '' },
    jupiterBlessing: { auspicious: false, reason: '' },
    nodalShift: { rahuRashi: 0, ketuRashi: 0, note: '' },
    moonPhase: { tithi: 1, tithiName: '', paksha: 'Shukla', waxing: true, illumination: 0, nakshatra: '', nakshatraIndex: 0, pada: 1 },
  };
}

const mk = (planet: string, rashi: number): PlanetTransit => ({
  planet, rashi, rashiName: '', rashiDegree: 0, longitude: rashi * 30, speed: 1,
  nakshatra: 0, nakshatraPada: 1, houseFromMoon: 1, houseFromLagna: 1,
  valence: 0, note: null, isRetrograde: false,
});

describe('GOCHARA_PHALA classical effect table', () => {
  it('covers all 9 planets with 12 non-empty effect lines each', () => {
    for (const p of PLANETS) {
      expect(GOCHARA_PHALA[p], p).toBeDefined();
      expect(GOCHARA_PHALA[p]).toHaveLength(12);
      GOCHARA_PHALA[p].forEach((text, i) => {
        expect(text.length, `${p} house ${i + 1}`).toBeGreaterThan(10);
      });
    }
  });

  it('gocharaEffect looks up by 1-indexed house and is safe out of range', () => {
    expect(gocharaEffect('SATURN', 8)).toContain('Ashtama');
    expect(gocharaEffect('SATURN', 1)).toContain('Sade Sati');
    expect(gocharaEffect('UNKNOWN', 1)).toBe('');
    expect(gocharaEffect('SUN', 0)).toBe('');
  });
});

describe('Rahu/Ketu transit valence (Shanivat Rahu, Kujavat Ketu)', () => {
  it('nodes are favourable in the upachaya 3/6/11 from the Moon', () => {
    for (const h of [3, 6, 11]) {
      expect(valenceFromMoon('RAHU', h)).toBe(1);
      expect(valenceFromMoon('KETU', h)).toBe(1);
    }
  });
  it('nodes are adverse in 1/8/12 from the Moon', () => {
    for (const h of [1, 8, 12]) {
      expect(valenceFromMoon('RAHU', h)).toBe(-1);
      expect(valenceFromMoon('KETU', h)).toBe(-1);
    }
  });
});

describe('computeZodiacEffects (per-zodiac gochara phala)', () => {
  it('produces a reading for all 12 signs with one effect per transit', () => {
    const g = stub(PLANETS.map((p, i) => mk(p, i % 12)));
    const z = computeZodiacEffects(g);
    expect(z).toHaveLength(12);
    for (const sign of z) {
      expect(sign.effects).toHaveLength(9);
      expect(['good', 'bad', 'neutral']).toContain(sign.tone);
      for (const e of sign.effects) expect(e.effect.length).toBeGreaterThan(10);
    }
  });

  it('computes the house offset per sign correctly', () => {
    // Saturn in Scorpio (7): 8th from Aries (0), 1st from Scorpio (7).
    const g = stub([mk('SATURN', 7)]);
    const z = computeZodiacEffects(g);
    expect(z[0].effects[0].house).toBe(8);
    expect(z[0].effects[0].valence).toBe(-1);
    expect(z[7].effects[0].house).toBe(1);
  });

  it('applies vedha per hypothetical Moon sign', () => {
    // For Aries as Moon sign: Jupiter in Aquarius (10) = 11th (good);
    // its vedha house is the 8th (Scorpio, 7), occupied by Saturn → obstructed.
    const g = stub([mk('JUPITER', 10), mk('SATURN', 7)]);
    const aries = computeZodiacEffects(g)[0];
    const jup = aries.effects.find(e => e.planet === 'JUPITER')!;
    expect(jup.house).toBe(11);
    expect(jup.valence).toBe(0);
    expect(jup.vedhaBy).toBe('SATURN');

    // For Taurus (1) as Moon sign Jupiter sits in the 10th — no good result to obstruct.
    const taurus = computeZodiacEffects(g)[1];
    const jupT = taurus.effects.find(e => e.planet === 'JUPITER')!;
    expect(jupT.vedhaBy).toBeUndefined();
  });

  it('weighs slow planets more heavily in the sign score', () => {
    // Saturn alone, favourable (3rd from Capricorn? use house 3): Saturn in
    // Gemini (2) is 3rd from Aries → good for Aries, 8th from Scorpio (7) → bad.
    const g = stub([mk('SATURN', 2)]);
    const z = computeZodiacEffects(g);
    expect(z[0].score).toBeGreaterThan(0);
    expect(z[0].tone).toBe('good');
    expect(z[7].score).toBeLessThan(0);
    expect(z[7].tone).toBe('bad');
  });
});

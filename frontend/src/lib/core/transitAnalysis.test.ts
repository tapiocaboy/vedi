import { describe, it, expect } from 'vitest';
import {
  aspectVirupa, gradedAspects, houseBetween, applyVedha,
  computeMoonPhase, isGandanta, annotateGrahaYuddha,
  isCombust, isStationary, transitDignity, computeTransitNatal,
  computeTaraBala, annotateBindus, computeSignAnalysis, buildTransitPredictions,
} from './transitAnalysis';
import type { PlanetTransit, NatalPlacement, GocharaSnapshot } from './transits';

function stubGochara(transits: PlanetTransit[], natalPlanets: NatalPlacement[]): GocharaSnapshot {
  return {
    asOf: '', natalMoonRashi: 0, natalLagnaRashi: 0, transits, natalPlanets,
    sadeSati: { active: false, phase: 'none', description: '' },
    jupiterBlessing: { auspicious: false, reason: '' },
    nodalShift: { rahuRashi: 0, ketuRashi: 0, note: '' },
    moonPhase: { tithi: 1, tithiName: '', paksha: 'Shukla', waxing: true, illumination: 0, nakshatra: '', nakshatraIndex: 0, pada: 1 },
  };
}
const nat = (planet: string, rashi: number, longitude: number): NatalPlacement => ({ planet, rashi, longitude, isRetrograde: false });

const mk = (planet: string, rashi: number, houseFromMoon: number, valence: number): PlanetTransit => ({
  planet, rashi, rashiName: '', rashiDegree: 0, longitude: 0, speed: 1, nakshatra: 0, nakshatraPada: 1,
  houseFromMoon, houseFromLagna: 1, valence, note: null, isRetrograde: false,
});
const mkWar = (planet: string, rashi: number, longitude: number): PlanetTransit => ({ ...mk(planet, rashi, 1, 0), longitude });

describe('Parashari graded aspects (virupa)', () => {
  it('gives every planet a full 7th aspect', () => {
    expect(aspectVirupa('SUN', 0, 6)).toBe(60);   // 7th from Aries = Libra
    expect(aspectVirupa('VENUS', 3, 9)).toBe(60);
  });

  it('applies the special full aspects', () => {
    expect(aspectVirupa('MARS', 0, 3)).toBe(60);    // 4th
    expect(aspectVirupa('MARS', 0, 7)).toBe(60);    // 8th
    expect(aspectVirupa('JUPITER', 0, 4)).toBe(60); // 5th
    expect(aspectVirupa('JUPITER', 0, 8)).toBe(60); // 9th
    expect(aspectVirupa('SATURN', 0, 2)).toBe(60);  // 3rd
    expect(aspectVirupa('SATURN', 0, 9)).toBe(60);  // 10th
  });

  it('uses graded values for ordinary planets', () => {
    expect(aspectVirupa('SUN', 0, 3)).toBe(45); // 4th  → three-quarter
    expect(aspectVirupa('SUN', 0, 7)).toBe(45); // 8th
    expect(aspectVirupa('SUN', 0, 4)).toBe(30); // 5th  → half
    expect(aspectVirupa('SUN', 0, 8)).toBe(30); // 9th
    expect(aspectVirupa('SUN', 0, 2)).toBe(15); // 3rd  → quarter
    expect(aspectVirupa('SUN', 0, 9)).toBe(15); // 10th
  });

  it('casts no aspect on the 1st/2nd/6th/11th/12th', () => {
    expect(aspectVirupa('SUN', 0, 0)).toBe(0);  // same sign
    expect(aspectVirupa('SUN', 0, 1)).toBe(0);  // 2nd
    expect(aspectVirupa('SUN', 0, 5)).toBe(0);  // 6th
    expect(aspectVirupa('SUN', 0, 10)).toBe(0); // 11th
    expect(aspectVirupa('SUN', 0, 11)).toBe(0); // 12th
  });

  it('houseBetween is 1-indexed with 1 = same sign', () => {
    expect(houseBetween(0, 0)).toBe(1);
    expect(houseBetween(0, 6)).toBe(7);
    expect(houseBetween(10, 0)).toBe(3); // wrap-around
  });

  it('gradedAspects returns 7 non-zero aspects per planet', () => {
    expect(gradedAspects('SUN', 0)).toHaveLength(7);
    expect(gradedAspects('SATURN', 5)).toHaveLength(7);
    // Saturn's 3rd & 10th should be full strength
    const sat = gradedAspects('SATURN', 0);
    expect(sat.find(a => a.offset === 3)?.virupa).toBe(60);
    expect(sat.find(a => a.offset === 10)?.virupa).toBe(60);
  });
});

describe('Gochara vedha (obstruction)', () => {
  // natal Moon = Aries (0) throughout.
  it("cancels an auspicious result when the vedha house is occupied", () => {
    // Jupiter good in 11th (vedha house 8 → rashi 7); Saturn sits in rashi 7.
    const transits = [mk('JUPITER', 10, 11, 1), mk('SATURN', 7, 8, -1)];
    applyVedha(transits, 0);
    expect(transits[0].valence).toBe(0);
    expect(transits[0].vedha?.byPlanet).toBe('SATURN');
  });

  it('respects the Sun–Saturn exemption', () => {
    // Sun good in 3rd (vedha house 9 → rashi 8); Saturn occupies it but is exempt.
    const transits = [mk('SUN', 2, 3, 1), mk('SATURN', 8, 9, -1)];
    applyVedha(transits, 0);
    expect(transits[0].valence).toBe(1);
    expect(transits[0].vedha).toBeUndefined();
  });

  it('a non-exempt planet still obstructs the Sun', () => {
    const transits = [mk('SUN', 2, 3, 1), mk('MARS', 8, 9, -1)];
    applyVedha(transits, 0);
    expect(transits[0].valence).toBe(0);
    expect(transits[0].vedha?.byPlanet).toBe('MARS');
  });

  it('leaves an auspicious result intact when no planet holds the vedha house', () => {
    const transits = [mk('JUPITER', 10, 11, 1)];
    applyVedha(transits, 0);
    expect(transits[0].valence).toBe(1);
    expect(transits[0].vedha).toBeUndefined();
  });

  it('never obstructs a non-auspicious (neutral/bad) result', () => {
    const transits = [mk('SATURN', 0, 1, -1), mk('MARS', 5, 6, 0)];
    applyVedha(transits, 0);
    expect(transits[0].valence).toBe(-1);
    expect(transits[1].valence).toBe(0);
  });
});

describe('Moon phase (tithi / paksha)', () => {
  it('new moon → tithi 1, Shukla, 0% lit', () => {
    const mp = computeMoonPhase(0, 0, 0, 1);
    expect(mp.tithi).toBe(1);
    expect(mp.paksha).toBe('Shukla');
    expect(mp.illumination).toBe(0);
    expect(mp.waxing).toBe(true);
  });
  it('full moon → Purnima, ~100% lit', () => {
    const mp = computeMoonPhase(0, 174, 0, 1); // ~tithi 15
    expect(mp.tithiName).toBe('Purnima');
    expect(mp.paksha).toBe('Shukla');
    expect(mp.illumination).toBeGreaterThanOrEqual(99);
  });
  it('opposition boundary rolls into Krishna paksha', () => {
    const mp = computeMoonPhase(0, 186, 0, 1);
    expect(mp.paksha).toBe('Krishna');
    expect(mp.tithiName).toBe('Pratipada');
  });
  it('end of cycle → Amavasya', () => {
    const mp = computeMoonPhase(0, 354, 0, 1);
    expect(mp.tithiName).toBe('Amavasya');
  });
  it('quadrature → ~50% lit', () => {
    expect(computeMoonPhase(0, 90, 0, 1).illumination).toBe(50);
  });
});

describe('Gandanta (water–fire junction)', () => {
  it('flags the last 3°20\' of water signs', () => {
    expect(isGandanta(11, 27)).toBe(true);   // Pisces
    expect(isGandanta(3, 28)).toBe(true);    // Cancer
    expect(isGandanta(11, 26)).toBe(false);
  });
  it('flags the first 3°20\' of fire signs', () => {
    expect(isGandanta(0, 3)).toBe(true);     // Aries
    expect(isGandanta(8, 1)).toBe(true);     // Sagittarius
    expect(isGandanta(0, 4)).toBe(false);
  });
  it('ignores ordinary signs/degrees', () => {
    expect(isGandanta(1, 1)).toBe(false);    // Taurus
    expect(isGandanta(5, 15)).toBe(false);   // mid-Virgo
  });
});

describe('Planetary war (graha yuddha)', () => {
  it('flags two tara grahas within 1° in the same sign', () => {
    const transits = [mkWar('MARS', 3, 100.2), mkWar('VENUS', 3, 100.9)];
    annotateGrahaYuddha(transits);
    expect(transits[0].war?.with).toBe('VENUS');
    expect(transits[1].war?.with).toBe('MARS');
  });
  it('does not flag when more than 1° apart', () => {
    const transits = [mkWar('MARS', 3, 100), mkWar('VENUS', 3, 102)];
    annotateGrahaYuddha(transits);
    expect(transits[0].war).toBeUndefined();
  });
  it('excludes the Sun and Moon (only tara grahas war)', () => {
    const transits = [mkWar('SUN', 3, 100.2), mkWar('MERCURY', 3, 100.4)];
    annotateGrahaYuddha(transits);
    expect(transits[0].war).toBeUndefined(); // Sun never wars
    expect(transits[1].war).toBeUndefined(); // no eligible partner
  });
});

describe('Combustion (asta)', () => {
  it('flags a planet within its orb of the Sun', () => {
    expect(isCombust('MERCURY', 100, 105, false)).toBe(true);  // 5° ≤ 14°
    expect(isCombust('JUPITER', 100, 115, false)).toBe(false); // 15° > 11°
  });
  it('uses the tighter retrograde orb for Mercury/Venus', () => {
    expect(isCombust('MERCURY', 100, 113, false)).toBe(true);  // 13° ≤ 14° direct
    expect(isCombust('MERCURY', 100, 113, true)).toBe(false);  // 13° > 12° retro
    expect(isCombust('VENUS', 100, 109, false)).toBe(true);    // 9° ≤ 10° direct
    expect(isCombust('VENUS', 100, 109, true)).toBe(false);    // 9° > 8° retro
  });
  it('handles wrap-around and never combusts the Sun/nodes', () => {
    expect(isCombust('SATURN', 1, 358, false)).toBe(true);     // 3° across 0°
    expect(isCombust('SUN', 100, 100, false)).toBe(false);
    expect(isCombust('RAHU', 100, 101, false)).toBe(false);
  });
});

describe('Stationary state', () => {
  it('flags slow tara grahas near a station', () => {
    expect(isStationary('SATURN', 0.005)).toBe(true);
    expect(isStationary('SATURN', 0.05)).toBe(false);
    expect(isStationary('MERCURY', 0.1)).toBe(true);
    expect(isStationary('MERCURY', 0.5)).toBe(false);
  });
  it('never flags the Sun, Moon or nodes', () => {
    expect(isStationary('SUN', 0)).toBe(false);
    expect(isStationary('MOON', 0)).toBe(false);
    expect(isStationary('RAHU', 0)).toBe(false);
  });
});

describe('Transit → Natal (bi-wheel)', () => {
  it('detects transit Saturn aspecting natal Sun (7th, full)', () => {
    // transit Saturn in Aquarius (10) → 7th from it is Leo (4), where natal Sun sits.
    const g = stubGochara([mk('SATURN', 10, 1, 0)], [nat('SUN', 4, 124)]);
    const hits = computeTransitNatal(g);
    const hit = hits.find(h => h.transit === 'SATURN' && h.natal === 'SUN');
    expect(hit).toBeDefined();
    expect(hit!.kind).toBe('aspect');
    expect(hit!.house).toBe(7);
    expect(hit!.virupa).toBe(60);
  });

  it('detects a transit→natal conjunction with its orb', () => {
    const transit = { ...mk('JUPITER', 3, 1, 0), longitude: 95 };
    const g = stubGochara([transit], [nat('MOON', 3, 100)]);
    const hit = computeTransitNatal(g).find(h => h.transit === 'JUPITER' && h.natal === 'MOON');
    expect(hit!.kind).toBe('conjunction');
    expect(hit!.orb).toBeCloseTo(5, 1);
  });

  it('returns nothing when there is no contact', () => {
    // Mars in Aries (0) does not aspect Taurus (1) — 2nd house, no drishti.
    const g = stubGochara([mk('MARS', 0, 1, 0)], [nat('VENUS', 1, 40)]);
    expect(computeTransitNatal(g)).toHaveLength(0);
  });
});

describe('Transit dignity', () => {
  it('reads exaltation, debilitation and own-sign', () => {
    expect(transitDignity('JUPITER', 3)).toBe('exalted');     // Cancer
    expect(transitDignity('MARS', 3)).toBe('debilitated');    // Cancer
    expect(transitDignity('SUN', 4)).toBe('own-sign');        // Leo
    expect(transitDignity('SUN', 0)).toBe('exalted');         // Aries
    expect(transitDignity('SATURN', 9)).toBe('own-sign');     // Capricorn
  });
});

describe('Tara Bala', () => {
  it('starts the cycle at Janma on the natal nakshatra itself', () => {
    const tb = computeTaraBala(0, 0);
    expect(tb.tara).toBe(1);
    expect(tb.name).toBe('Janma');
    expect(tb.favourable).toBe(false);
  });
  it('identifies the favourable taras (Sampat, Kshema, Sadhana, Mitra, Parama Mitra)', () => {
    expect(computeTaraBala(0, 1)).toMatchObject({ tara: 2, name: 'Sampat', favourable: true });
    expect(computeTaraBala(0, 3)).toMatchObject({ tara: 4, name: 'Kshema', favourable: true });
    expect(computeTaraBala(0, 5)).toMatchObject({ tara: 6, name: 'Sadhana', favourable: true });
    expect(computeTaraBala(0, 7)).toMatchObject({ tara: 8, name: 'Mitra', favourable: true });
    expect(computeTaraBala(0, 8)).toMatchObject({ tara: 9, name: 'Parama Mitra', favourable: true });
  });
  it('identifies the adverse taras (Vipat, Pratyak, Naidhana)', () => {
    expect(computeTaraBala(0, 2)).toMatchObject({ tara: 3, name: 'Vipat', favourable: false });
    expect(computeTaraBala(0, 4)).toMatchObject({ tara: 5, name: 'Pratyak', favourable: false });
    expect(computeTaraBala(0, 6)).toMatchObject({ tara: 7, name: 'Naidhana', favourable: false });
  });
  it('reduces past the 9th and wraps around the 27 nakshatras', () => {
    expect(computeTaraBala(0, 9).name).toBe('Janma');        // 10th → cycle restarts
    expect(computeTaraBala(25, 1).name).toBe('Kshema');      // wrap: ((1−25+27)%27)+1 = 4
  });
});

describe('Ashtakavarga bindus on transits', () => {
  // A natal chart: Sun Leo(4), Moon Taurus(1), Mars Aries(0), Mercury Virgo(5),
  // Jupiter Sagittarius(8), Venus Libra(6), Saturn Capricorn(9), Lagna Cancer(3).
  const natal: Record<string, number> = {
    SUN: 4, MOON: 1, MARS: 0, MERCURY: 5, JUPITER: 8, VENUS: 6, SATURN: 9, ASCENDANT: 3,
    RAHU: 2, KETU: 8,
  };

  it('annotates the 7 classical planets with 0–8 bindus and returns sarva (total 337)', () => {
    const transits = ['SUN', 'MOON', 'MARS', 'MERCURY', 'JUPITER', 'VENUS', 'SATURN', 'RAHU', 'KETU']
      .map((p, i) => mk(p, i % 12, 1, 0));
    const sarva = annotateBindus(transits, natal);
    expect(sarva).toBeDefined();
    expect(sarva!.reduce((a, b) => a + b, 0)).toBe(337);
    for (const t of transits) {
      if (t.planet === 'RAHU' || t.planet === 'KETU') {
        expect(t.bindus).toBeUndefined();
      } else {
        expect(t.bindus).toBeGreaterThanOrEqual(0);
        expect(t.bindus).toBeLessThanOrEqual(8);
      }
    }
  });

  it('returns undefined and annotates nothing when the natal chart is incomplete', () => {
    const transits = [mk('SATURN', 0, 1, 0)];
    const sarva = annotateBindus(transits, { SUN: 4, MOON: 1 });
    expect(sarva).toBeUndefined();
    expect(transits[0].bindus).toBeUndefined();
  });

  it('bindu support shifts the per-sign favourability score', () => {
    const base = stubGochara([mk('JUPITER', 2, 3, 0)], []);
    const low = computeSignAnalysis(base)[2].score;
    const withBindus = stubGochara([{ ...mk('JUPITER', 2, 3, 0), bindus: 8 }], []);
    const high = computeSignAnalysis(withBindus)[2].score;
    expect(high).toBeGreaterThan(low);
  });
});

describe('buildTransitPredictions plain language', () => {
  it('every prediction carries a jargon-free headline and takeaway', () => {
    const transits = [
      mk('SUN', 2, 3, 1), mk('MOON', 4, 5, -1), mk('MARS', 5, 6, 1),
      mk('MERCURY', 1, 2, 1), mk('JUPITER', 8, 9, 1), mk('VENUS', 0, 1, 1),
      mk('SATURN', 7, 8, -1), mk('RAHU', 10, 11, 1), mk('KETU', 4, 5, -1),
    ];
    const g = stubGochara(transits, []);
    g.taraBala = { tara: 2, name: 'Sampat', favourable: true, description: 'a wealth star.' };
    const preds = buildTransitPredictions(g, computeSignAnalysis(g), { mahadasha: 'SATURN' });

    expect(preds.length).toBeGreaterThan(4);
    for (const p of preds) {
      expect(p.plainTitle.length, p.id).toBeGreaterThan(5);
      expect(p.plain.length, p.id).toBeGreaterThan(20);
      // The plain takeaway must not lean on Sanskrit/astro jargon.
      for (const term of ['vedha', 'gochara', 'virupa', 'drishti', 'bindu', 'gandanta', 'paksha', 'tithi', 'nakshatra', 'lagna', 'dasha']) {
        expect(p.plain.toLowerCase(), `${p.id} plain mentions "${term}"`).not.toContain(term);
      }
    }
  });
});

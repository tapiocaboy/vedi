import { describe, it, expect } from 'vitest';
import { assessPlanetStrength, functionalNatureFor, lordedHousesFor } from './dashaStrength';

// Rashi indices: 0=Mesha(Aries), 1=Vrishabha(Taurus), 2=Mithuna(Gemini),
// 3=Karka(Cancer), 4=Simha(Leo), 5=Kanya(Virgo), 6=Tula(Libra),
// 7=Vrischika(Scorpio), 8=Dhanu(Sag), 9=Makara(Cap), 10=Kumbha(Aqu), 11=Meena(Pisces)

describe('lordedHousesFor', () => {
  it('gives Mars houses 1 and 8 for Aries lagna', () => {
    expect(lordedHousesFor('Mars', 0)).toEqual([1, 8]);
  });

  it('gives Saturn houses 9 and 10 for Taurus lagna', () => {
    expect(lordedHousesFor('Saturn', 1)).toEqual([9, 10]);
  });

  it('gives the Sun exactly one house for any lagna', () => {
    for (let asc = 0; asc < 12; asc++) {
      expect(lordedHousesFor('Sun', asc)).toHaveLength(1);
    }
  });

  it('gives Rahu/Ketu no houses', () => {
    expect(lordedHousesFor('Rahu', 0)).toEqual([]);
    expect(lordedHousesFor('Ketu', 5)).toEqual([]);
  });
});

describe('functionalNatureFor — classical yogakarakas', () => {
  it('Saturn is yogakaraka for Taurus and Libra lagnas', () => {
    expect(functionalNatureFor('Saturn', 1)).toBe('yogakaraka');
    expect(functionalNatureFor('Saturn', 6)).toBe('yogakaraka');
  });

  it('Mars is yogakaraka for Cancer and Leo lagnas', () => {
    expect(functionalNatureFor('Mars', 3)).toBe('yogakaraka');
    expect(functionalNatureFor('Mars', 4)).toBe('yogakaraka');
  });

  it('Venus is yogakaraka for Capricorn and Aquarius lagnas', () => {
    expect(functionalNatureFor('Venus', 9)).toBe('yogakaraka');
    expect(functionalNatureFor('Venus', 10)).toBe('yogakaraka');
  });

  it('Mercury is a functional malefic for Aries lagna (lords 3 & 6)', () => {
    expect(functionalNatureFor('Mercury', 0)).toBe('functional-malefic');
  });

  it('Jupiter is a functional benefic for Aries lagna (lords 9 & 12)', () => {
    expect(functionalNatureFor('Jupiter', 0)).toBe('functional-benefic');
  });

  it('Saturn is a functional malefic for Cancer lagna (lords 7 & 8)', () => {
    expect(functionalNatureFor('Saturn', 3)).toBe('functional-malefic');
  });

  it('Rahu is neutral (rules no signs)', () => {
    expect(functionalNatureFor('Rahu', 0)).toBe('neutral');
  });
});

describe('assessPlanetStrength — dignity', () => {
  it('scores exalted Jupiter in Cancer positively', () => {
    const s = assessPlanetStrength('Jupiter', {
      planetRashis: { Jupiter: 3 },
    });
    expect(s.dignity).toBe('exalted');
    expect(s.dignityMod).toBe(2);
    expect(s.total).toBeGreaterThan(0);
    expect(s.notes.some(n => n.includes('exalted'))).toBe(true);
  });

  it('scores debilitated Saturn in Aries negatively', () => {
    const s = assessPlanetStrength('Saturn', {
      planetRashis: { Saturn: 0, Mars: 5 }, // dispositor Mars not in kendra (no asc/moon given)
    });
    expect(s.dignity).toBe('debilitated');
    expect(s.neechaBhanga).toBe(false);
    expect(s.dignityMod).toBe(-2);
  });

  it('applies neecha bhanga when the dispositor is in a kendra from lagna', () => {
    // Saturn debilitated in Aries (0); dispositor Mars in Cancer (3).
    // With Aries ascendant, Mars sits in house 4 — a kendra → bhanga.
    const s = assessPlanetStrength('Saturn', {
      planetRashis: { Saturn: 0, Mars: 3 },
      ascendantRashi: 0,
    });
    expect(s.dignity).toBe('debilitated');
    expect(s.neechaBhanga).toBe(true);
    // Cancellation lifts the debilitation penalty but does not invert it —
    // "struggle first, strength later", not "strong from the start".
    expect(s.dignityMod).toBe(-0.5);
  });

  it('ignores the Moon route when the Moon is itself the dispositor', () => {
    // Mars debilitated in Cancer; its dispositor is the Moon. A body is always
    // in the 1st house from itself, so the Moon route must not fire here —
    // and with a Gemini ascendant the Moon in Cancer is in house 2, not a
    // kendra, so no bhanga applies at all.
    const s = assessPlanetStrength('Mars', {
      planetRashis: { Mars: 3, Moon: 3 },
      ascendantRashi: 2,
      moonRashi: 3,
    });
    expect(s.dignity).toBe('debilitated');
    expect(s.neechaBhanga).toBe(false);
    expect(s.dignityMod).toBe(-2);
  });
});

describe('assessPlanetStrength — combustion', () => {
  it('marks Venus combust when within 10° of the Sun', () => {
    const s = assessPlanetStrength('Venus', {
      planetRashis: { Venus: 4 },
      planetLongitudes: { Sun: 130, Venus: 135 },
      planetRetro: { Venus: false },
    });
    expect(s.isCombust).toBe(true);
    expect(s.combustMod).toBe(-1);
  });

  it('does not mark Venus combust at 20° separation', () => {
    const s = assessPlanetStrength('Venus', {
      planetRashis: { Venus: 4 },
      planetLongitudes: { Sun: 130, Venus: 150 },
    });
    expect(s.isCombust).toBe(false);
  });

  it('handles the 0°/360° wrap-around', () => {
    const s = assessPlanetStrength('Venus', {
      planetRashis: { Venus: 11 },
      planetLongitudes: { Sun: 358, Venus: 4 },
    });
    expect(s.isCombust).toBe(true);
  });

  it('never marks the Sun or nodes combust', () => {
    const sun = assessPlanetStrength('Sun', { planetRashis: { Sun: 0 }, planetLongitudes: { Sun: 10 } });
    expect(sun.isCombust).toBe(false);
    const rahu = assessPlanetStrength('Rahu', { planetRashis: { Rahu: 1 }, planetLongitudes: { Sun: 40, Rahu: 42 } });
    expect(rahu.isCombust).toBe(false);
  });
});

describe('assessPlanetStrength — composite', () => {
  it('clamps the total to ±2.5', () => {
    // Exalted yogakaraka Saturn in Libra for a Taurus lagna in house 6 → big sum
    const s = assessPlanetStrength('Saturn', {
      planetRashis: { Saturn: 6 },
      planetHouses: { Saturn: 9 },
      ascendantRashi: 1,
    });
    expect(s.total).toBeLessThanOrEqual(2.5);
    expect(s.total).toBeGreaterThanOrEqual(-2.5);
    expect(s.dignity).toBe('exalted');
    expect(s.functionalNature).toBe('yogakaraka');
  });

  it('returns neutral defaults when no chart data is given', () => {
    const s = assessPlanetStrength('Jupiter', {});
    expect(s.dignity).toBeNull();
    expect(s.total).toBe(0);
    expect(s.notes).toEqual([]);
  });

  it('adds chesta bala for natal retrogrades', () => {
    const s = assessPlanetStrength('Jupiter', {
      planetRashis: { Jupiter: 8 }, // own sign
      planetRetro: { Jupiter: true },
    });
    expect(s.isRetrograde).toBe(true);
    expect(s.retroMod).toBe(0.25);
    expect(s.notes.some(n => n.includes('retrograde'))).toBe(true);
  });
});

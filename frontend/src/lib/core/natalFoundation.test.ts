import { describe, it, expect } from 'vitest';
import { assessNatalFoundation, assessMoonCondition, aspectsRashi } from './natalFoundation';
import type { StrengthInput } from './dashaStrength';

// Rashi indices: 0=Aries … 3=Cancer, 6=Libra, 7=Scorpio, 9=Capricorn, 5=Virgo.

describe('aspectsRashi — graha drishti', () => {
  it('gives every planet the 7th aspect', () => {
    expect(aspectsRashi('Venus', 0, 6)).toBe(true);
    expect(aspectsRashi('Venus', 9, 3)).toBe(true);
  });

  it('gives Saturn the 3rd and 10th', () => {
    expect(aspectsRashi('Saturn', 9, 11)).toBe(true); // 3rd from Capricorn
    expect(aspectsRashi('Saturn', 9, 6)).toBe(true);  // 10th from Capricorn
    expect(aspectsRashi('Saturn', 9, 10)).toBe(false);
  });

  it('gives Mars the 4th and 8th, and Jupiter the 5th and 9th', () => {
    expect(aspectsRashi('Mars', 3, 6)).toBe(true);    // 4th from Cancer
    expect(aspectsRashi('Mars', 3, 10)).toBe(true);   // 8th from Cancer
    expect(aspectsRashi('Jupiter', 5, 9)).toBe(true); // 5th from Virgo
    expect(aspectsRashi('Jupiter', 5, 1)).toBe(true); // 9th from Virgo
    expect(aspectsRashi('Mercury', 5, 9)).toBe(false);
  });
});

describe('assessMoonCondition — manas', () => {
  const base: StrengthInput = {
    planetRashis: { Moon: 3, Sun: 7, Mercury: 7, Venus: 9, Mars: 3, Jupiter: 5, Saturn: 9 },
    planetLongitudes: { Moon: 110.4, Sun: 238.4 },
    ascendantRashi: 6,
    moonRashi: 3,
  };

  it('detects a malefic sharing the Moon’s sign', () => {
    const c = assessMoonCondition(base);
    expect(c.notes.some(n => n.includes('shares its sign with'))).toBe(true);
  });

  it('detects Saturn’s aspect on the Moon', () => {
    // Saturn in Capricorn aspects Cancer by the 7th.
    const c = assessMoonCondition(base);
    expect(c.notes.some(n => n.includes('Saturn aspects your Moon'))).toBe(true);
  });

  it('detects a waning Moon from the elongation, not the sign', () => {
    const c = assessMoonCondition(base);
    expect(c.notes.some(n => n.includes('waning'))).toBe(true);
    const waxing = assessMoonCondition({ ...base, planetLongitudes: { Moon: 250, Sun: 238.4 } });
    expect(waxing.notes.some(n => n.includes('waning'))).toBe(false);
  });

  it('flags an unsupported Moon only when no benefic reaches it', () => {
    // Venus in Capricorn aspects Cancer by the 7th, so this Moon is supported.
    expect(assessMoonCondition(base).notes.some(n => n.includes('No benefic'))).toBe(false);
    const alone = assessMoonCondition({
      ...base,
      planetRashis: { Moon: 3, Sun: 7, Mercury: 7, Venus: 7, Mars: 3, Jupiter: 8, Saturn: 9 },
    });
    expect(alone.notes.some(n => n.includes('No benefic'))).toBe(true);
  });

  it('returns a neutral reading when the chart is unavailable', () => {
    expect(assessMoonCondition({})).toEqual({ score: 0, notes: [], afflicted: false });
  });
});

describe('assessNatalFoundation', () => {
  it('returns null without an ascendant', () => {
    expect(assessNatalFoundation({ planetRashis: { Sun: 0 } })).toBeNull();
  });

  it('marks an area weak when its lord is debilitated', () => {
    // Aries lagna: the 7th is Libra, lord Venus debilitated in Virgo.
    const f = assessNatalFoundation({
      ascendantRashi: 0,
      planetRashis: { Venus: 5, Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Saturn: 6 },
    })!;
    expect(f.relationship.score).toBeLessThan(0);
    expect(f.relationship.notes.some(n => n.includes('under strain'))).toBe(true);
  });

  it('names an area’s strain even when the area is overall strong', () => {
    // Libra lagna, 10th (Cancer) holds an own-sign Moon and a debilitated Mars.
    // The Moon makes the house strong; the reading must still name the Mars.
    const f = assessNatalFoundation({
      ascendantRashi: 6,
      planetRashis: { Sun: 7, Moon: 3, Mars: 3, Mercury: 7, Jupiter: 5, Venus: 9, Saturn: 9, Rahu: 7, Ketu: 1 },
      planetRetro: { Mars: true, Rahu: true, Ketu: true },
    })!;
    expect(f.career.score).toBeGreaterThan(0);
    expect(f.career.notes.slice(0, 2).some(n => n.includes('Mars') && n.includes('weakened'))).toBe(true);
  });

  it('does not double-count the Moon in the health area', () => {
    const input: StrengthInput = {
      ascendantRashi: 6,
      planetRashis: { Sun: 7, Moon: 3, Mars: 3, Mercury: 7, Jupiter: 5, Venus: 9, Saturn: 9 },
    };
    const f = assessNatalFoundation(input)!;
    // The Moon appears through the manas assessment only, so its karaka note
    // ("natural significator of health") must not also be present.
    expect(f.health.notes.some(n => n.includes('Moon, the natural significator'))).toBe(false);
  });
});

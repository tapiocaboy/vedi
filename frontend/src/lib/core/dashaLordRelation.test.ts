import { describe, it, expect } from 'vitest';
import {
  naturalRelation, housesApart, mutualPlacement, judgeLordPair,
  houseOfRashi, rashiOfHouse, houseClass, aspectedHouses,
} from './dashaLordRelation';

describe('naturalRelation', () => {
  it('is read from the first planet\u2019s side, so the table\u2019s asymmetry shows', () => {
    expect(naturalRelation('Saturn', 'Mercury')).toBe('friend');
    expect(naturalRelation('Mercury', 'Saturn')).toBe('neutral');
    expect(naturalRelation('Mercury', 'Sun')).toBe('friend');
    expect(naturalRelation('Sun', 'Mercury')).toBe('neutral');
  });
  it('reports enemies', () => {
    expect(naturalRelation('Saturn', 'Sun')).toBe('enemy');
    expect(naturalRelation('Mercury', 'Moon')).toBe('enemy');
    expect(naturalRelation('Moon', 'Mercury')).toBe('friend'); // the Moon has no enemies
  });
  it('treats the same planet as a friend of itself and ignores case', () => {
    expect(naturalRelation('SATURN', 'saturn')).toBe('friend');
  });
});

describe('mutual placement', () => {
  it('counts houses inclusively from the first rashi', () => {
    expect(housesApart(0, 0)).toBe(1);
    expect(housesApart(0, 6)).toBe(7);
    expect(housesApart(7, 5)).toBe(11);
  });
  it('classifies the classical spacings', () => {
    expect(mutualPlacement(0, 0)).toBe('conjunct');
    expect(mutualPlacement(0, 6)).toBe('samasaptaka');
    expect(mutualPlacement(0, 4)).toBe('trine');
    expect(mutualPlacement(0, 8)).toBe('trine');
    expect(mutualPlacement(0, 3)).toBe('kendra');
    expect(mutualPlacement(0, 9)).toBe('kendra');
    expect(mutualPlacement(0, 5)).toBe('shadashtaka');
    expect(mutualPlacement(0, 7)).toBe('shadashtaka');
    expect(mutualPlacement(0, 1)).toBe('dwirdwadasa');
    expect(mutualPlacement(0, 11)).toBe('dwirdwadasa');
    expect(mutualPlacement(0, 2)).toBe('growth');
    expect(mutualPlacement(0, 10)).toBe('growth');
  });
});

describe('judgeLordPair', () => {
  it('Saturn in Vrischika, Mercury in Kanya (reference chart): friends, 11 apart → good', () => {
    const j = judgeLordPair('Saturn', 'Mercury', 7, 5);
    expect(j.maitri).toBe('friend');
    expect(j.distance).toBe(11);
    expect(j.placement).toBe('growth');
    expect(j.verdict).toBe('good');
  });
  it('enemies in 6/8 are bad; friends in 6/8 are mixed', () => {
    expect(judgeLordPair('Saturn', 'Sun', 0, 5).verdict).toBe('bad');
    expect(judgeLordPair('Saturn', 'Mercury', 0, 5).verdict).toBe('mixed');
  });
  it('neutral lords in trine are good', () => {
    expect(judgeLordPair('Jupiter', 'Saturn', 0, 4).verdict).toBe('good');
  });
});

describe('houses', () => {
  it('maps rashi ↔ house for an ascendant', () => {
    // Dhanu lagna (8): Vrischika (7) is the 12th, Kanya (5) the 10th.
    expect(houseOfRashi(7, 8)).toBe(12);
    expect(houseOfRashi(5, 8)).toBe(10);
    expect(rashiOfHouse(12, 8)).toBe(7);
    expect(rashiOfHouse(1, 8)).toBe(8);
  });
  it('classifies houses with dusthana and kendra taking precedence', () => {
    expect(houseClass(6)).toBe('dusthana');
    expect(houseClass(10)).toBe('kendra');
    expect(houseClass(5)).toBe('trikona');
    expect(houseClass(11)).toBe('upachaya');
    expect(houseClass(2)).toBe('other');
  });
  it('lists aspected houses including special drishti', () => {
    // Saturn in the 12th (Dhanu lagna, Saturn in Vrischika): sees 6th (7th from it),
    // 2nd (3rd from it) and 9th (10th from it).
    expect(aspectedHouses('Saturn', 7, 8)).toEqual([2, 6, 9]);
    // Mercury in the 10th: only the 4th.
    expect(aspectedHouses('Mercury', 5, 8)).toEqual([4]);
    // Jupiter in the 3rd (Kumbha): 7th, 9th from it → houses 9, 7, 11.
    expect(aspectedHouses('Jupiter', 10, 8)).toEqual([7, 9, 11]);
  });
});

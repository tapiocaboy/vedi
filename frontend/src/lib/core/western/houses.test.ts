import { describe, it, expect } from 'vitest';
import { houseOfLongitude, angularityOf, degreesIntoHouse } from './houses';

// A synthetic but non-equal cusp set (Placidus is unequal near mid latitudes) —
// house widths deliberately vary so the wrap-around and unequal-width cases
// are both exercised.
const CUSPS = [10, 45, 80, 100, 140, 175, 190, 225, 260, 280, 320, 355];

describe('houseOfLongitude', () => {
  it('places a longitude just past a cusp into that house', () => {
    expect(houseOfLongitude(15, CUSPS)).toBe(1);
    expect(houseOfLongitude(46, CUSPS)).toBe(2);
  });

  it('places a longitude exactly on a cusp into the house it starts', () => {
    expect(houseOfLongitude(80, CUSPS)).toBe(3);
  });

  it('wraps correctly from house 12 back to house 1 across 360/0', () => {
    expect(houseOfLongitude(358, CUSPS)).toBe(12);
    expect(houseOfLongitude(5, CUSPS)).toBe(12);
    expect(houseOfLongitude(9, CUSPS)).toBe(12);
    expect(houseOfLongitude(11, CUSPS)).toBe(1);
  });
});

describe('angularityOf', () => {
  it('classifies the four angular houses', () => {
    expect(angularityOf(1)).toBe('angular');
    expect(angularityOf(4)).toBe('angular');
    expect(angularityOf(7)).toBe('angular');
    expect(angularityOf(10)).toBe('angular');
  });
  it('classifies succedent and cadent', () => {
    expect(angularityOf(2)).toBe('succedent');
    expect(angularityOf(3)).toBe('cadent');
  });
});

describe('degreesIntoHouse', () => {
  it('is zero exactly on the cusp and grows from there', () => {
    expect(degreesIntoHouse(10, 1, CUSPS)).toBeCloseTo(0, 6);
    expect(degreesIntoHouse(20, 1, CUSPS)).toBeCloseTo(10, 6);
  });
});

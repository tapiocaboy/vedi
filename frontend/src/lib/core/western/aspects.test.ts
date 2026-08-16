import { describe, it, expect } from 'vitest';
import { angularSeparation, findAspect, computeAspectGrid, formatOrb } from './aspects';

describe('angularSeparation', () => {
  it('is symmetric and takes the short way around 0/360', () => {
    expect(angularSeparation(10, 350)).toBeCloseTo(20, 6);
    expect(angularSeparation(350, 10)).toBeCloseTo(20, 6);
    expect(angularSeparation(0, 180)).toBeCloseTo(180, 6);
  });
});

describe('findAspect', () => {
  it('finds an exact trine at zero orb', () => {
    const hit = findAspect('SUN', 10, 1, 'MOON', 130, 12);
    expect(hit?.type).toBe('trine');
    expect(hit?.orb).toBeCloseTo(0, 6);
    expect(hit?.strength).toBeCloseTo(1, 6);
  });

  it('widens the orb when a luminary is involved', () => {
    // 8° off square (90+8=98): within the luminary-widened 7+2=9° orb, but
    // outside the non-luminary 7° orb.
    const withSun = findAspect('SUN', 0, 1, 'SATURN', 98, 0.03);
    const withoutSun = findAspect('VENUS', 0, 1, 'SATURN', 98, 0.03);
    expect(withSun?.type).toBe('square');
    expect(withoutSun).toBeNull();
  });

  it('returns null outside every aspect\'s orb', () => {
    expect(findAspect('SUN', 0, 1, 'MOON', 40, 12)).toBeNull();
  });
});

describe('computeAspectGrid', () => {
  it('finds all pairwise aspects, strongest first', () => {
    const grid = computeAspectGrid([
      { name: 'SUN', longitude: 0, speed: 1 },
      { name: 'MOON', longitude: 0, speed: 12 },     // exact conjunction
      { name: 'MARS', longitude: 91, speed: 0.5 },    // ~square to Sun
    ]);
    expect(grid[0].type).toBe('conjunction');
    expect(grid[0].strength).toBeCloseTo(1, 6);
    expect(grid.some(h => h.type === 'square')).toBe(true);
  });
});

describe('formatOrb', () => {
  it('formats degrees and minutes', () => {
    expect(formatOrb(3.5)).toBe('3°30\'');
    expect(formatOrb(0)).toBe('0°00\'');
  });
});

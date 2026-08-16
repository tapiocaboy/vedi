import { describe, it, expect } from 'vitest';
import { computeAspectGrid, type AspectBody } from './aspects';
import {
  detectStelliums, detectGrandTrines, detectTSquares, detectGrandCrosses, detectYods, detectAllPatterns,
} from './patterns';

describe('detectStelliums', () => {
  it('flags 3+ bodies sharing a sign and ignores pairs', () => {
    const out = detectStelliums({ SUN: 4, MOON: 4, VENUS: 4, MARS: 9 });
    expect(out).toHaveLength(1);
    expect(out[0].sign).toBe(4);
    expect(out[0].bodies.sort()).toEqual(['MOON', 'SUN', 'VENUS']);
  });
});

describe('detectGrandTrines', () => {
  it('finds three mutually trine bodies', () => {
    const bodies: AspectBody[] = [
      { name: 'SUN', longitude: 0, speed: 1 },
      { name: 'MOON', longitude: 120, speed: 12 },
      { name: 'MARS', longitude: 240, speed: 0.5 },
      { name: 'SATURN', longitude: 10, speed: 0.03 }, // not part of the trine
    ];
    const grid = computeAspectGrid(bodies);
    const trines = detectGrandTrines(bodies, grid);
    expect(trines).toHaveLength(1);
    expect(trines[0].bodies.sort()).toEqual(['MARS', 'MOON', 'SUN']);
  });
});

describe('detectTSquares', () => {
  it('finds an opposition with a squared apex', () => {
    const bodies: AspectBody[] = [
      { name: 'SUN', longitude: 0, speed: 1 },
      { name: 'MOON', longitude: 180, speed: 12 },
      { name: 'MARS', longitude: 90, speed: 0.5 },
    ];
    const grid = computeAspectGrid(bodies);
    const tsq = detectTSquares(bodies, grid);
    expect(tsq).toHaveLength(1);
    expect(tsq[0].apex).toBe('MARS');
  });
});

describe('detectGrandCrosses', () => {
  it('finds two oppositions whose four bodies are mutually square', () => {
    const bodies: AspectBody[] = [
      { name: 'SUN', longitude: 0, speed: 1 },
      { name: 'MOON', longitude: 180, speed: 12 },
      { name: 'MARS', longitude: 90, speed: 0.5 },
      { name: 'VENUS', longitude: 270, speed: 1.2 },
    ];
    const grid = computeAspectGrid(bodies);
    expect(detectGrandCrosses(grid)).toHaveLength(1);
  });
});

describe('detectYods', () => {
  it('finds two sextile bodies both quincunx an apex', () => {
    const bodies: AspectBody[] = [
      { name: 'SUN', longitude: 0, speed: 1 },
      { name: 'MOON', longitude: 60, speed: 12 },
      { name: 'SATURN', longitude: 210, speed: 0.03 },
    ];
    const grid = computeAspectGrid(bodies);
    const yods = detectYods(bodies, grid);
    expect(yods).toHaveLength(1);
    expect(yods[0].apex).toBe('SATURN');
  });
});

describe('detectAllPatterns', () => {
  it('combines every detector without throwing on an empty-ish chart', () => {
    const bodies: AspectBody[] = [
      { name: 'SUN', longitude: 0, speed: 1 },
      { name: 'MOON', longitude: 45, speed: 12 },
    ];
    const grid = computeAspectGrid(bodies);
    const out = detectAllPatterns(bodies, grid, { SUN: 0, MOON: 1 });
    expect(out).toEqual([]);
  });
});

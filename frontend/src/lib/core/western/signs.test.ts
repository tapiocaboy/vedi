import { describe, it, expect } from 'vitest';
import { signElement, signModality, westernModalityLabel, SIGNS } from './signs';

describe('signElement / signModality', () => {
  it('resolves every sign to a defined element and modality', () => {
    for (let i = 0; i < 12; i++) {
      expect(signElement(i), SIGNS[i]).toBeDefined();
      expect(signModality(i), SIGNS[i]).toBeDefined();
    }
  });

  it('matches the standard tropical element/modality grid', () => {
    expect(signElement(0)).toBe('Fire');    // Aries
    expect(signModality(0)).toBe('Movable'); // Cardinal
    expect(signElement(1)).toBe('Earth');   // Taurus
    expect(signModality(1)).toBe('Fixed');
    expect(signElement(4)).toBe('Fire');    // Leo
    expect(signModality(4)).toBe('Fixed');
    expect(signElement(5)).toBe('Earth');   // Virgo
    expect(signModality(5)).toBe('Dual');   // Mutable
    expect(signElement(9)).toBe('Earth');   // Capricorn
    expect(signModality(9)).toBe('Movable');
  });
});

describe('westernModalityLabel', () => {
  it('translates the Vedic modality terms to Western ones', () => {
    expect(westernModalityLabel('Movable')).toBe('Cardinal');
    expect(westernModalityLabel('Dual')).toBe('Mutable');
    expect(westernModalityLabel('Fixed')).toBe('Fixed');
  });
});

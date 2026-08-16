import { describe, it, expect } from 'vitest';
import { essentialDignity, rulesOf } from './dignity';

describe('essentialDignity', () => {
  it('rules its own sign(s) — domicile', () => {
    expect(essentialDignity('Venus', 1)).toBe('rulership');   // Taurus
    expect(essentialDignity('Venus', 6)).toBe('rulership');   // Libra
    expect(essentialDignity('Mars', 7)).toBe('rulership');    // Scorpio (traditional co-ruler)
    expect(essentialDignity('Pluto', 7)).toBe('rulership');   // Scorpio (modern ruler)
  });

  it('exalts the seven classical bodies on their published sign', () => {
    expect(essentialDignity('Sun', 0)).toBe('exaltation');    // Aries
    expect(essentialDignity('Jupiter', 3)).toBe('exaltation'); // Cancer
    expect(essentialDignity('Saturn', 6)).toBe('exaltation');  // Libra
  });

  it('falls opposite its exaltation sign', () => {
    expect(essentialDignity('Sun', 6)).toBe('fall');           // Libra, opposite Aries
    expect(essentialDignity('Saturn', 0)).toBe('fall');        // Aries, opposite Libra
  });

  it('claims no exaltation/fall for the outer three', () => {
    expect(essentialDignity('Uranus', 3)).not.toBe('exaltation');
    expect(essentialDignity('Neptune', 9)).not.toBe('fall');
  });

  it('sits in detriment opposite a ruled sign', () => {
    expect(essentialDignity('Venus', 0)).toBe('detriment');    // Aries, opposite Taurus/Libra
    expect(essentialDignity('Mars', 6)).toBe('detriment');     // Libra, opposite Aries
  });

  it('is peregrine when none of the above apply', () => {
    expect(essentialDignity('Venus', 4)).toBe('neutral');      // Venus in Leo
  });
});

describe('rulesOf', () => {
  it('lists both signs for a two-sign ruler', () => {
    expect(rulesOf('Mercury').sort()).toEqual([2, 5]);
  });
});

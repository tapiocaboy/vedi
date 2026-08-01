/**
 * Porutham tables are pure lookups, so the tests pin the table cells that are
 * easiest to get wrong: the rajju group boundaries, the vedha trio, and the
 * inclusive star count both ways around the zodiac.
 */

import { describe, it, expect } from 'vitest';
import { computePoruthams } from './matchPorutham';

const check = (r: ReturnType<typeof computePoruthams>, key: string) =>
  r.checks.find(c => c.key === key)!;

describe('Rajju', () => {
  it('fails when both stars share a rope', () => {
    // Mrigashira (4) and Chitra (13) are both Siro.
    const r = computePoruthams(4, 13);
    expect(check(r, 'rajju').passed).toBe(false);
    expect(r.rajjuFailed).toBe(true);
    expect(check(r, 'rajju').detail.girlRajju).toBe('Siro');
  });

  it('passes on different ropes', () => {
    // Ashwini (0, Pada) and Rohini (3, Kantha).
    const r = computePoruthams(0, 3);
    expect(check(r, 'rajju').passed).toBe(true);
    expect(r.rajjuFailed).toBe(false);
  });

  it('is symmetric', () => {
    expect(computePoruthams(4, 13).rajjuFailed).toBe(computePoruthams(13, 4).rajjuFailed);
    expect(computePoruthams(0, 3).rajjuFailed).toBe(computePoruthams(3, 0).rajjuFailed);
  });

  it('covers all 27 stars with five ropes of the documented sizes', () => {
    // Pada/Kati/Nabhi/Kantha carry six stars each and Siro three — verified by
    // failing same-star pairs (same star always shares its own rope).
    for (let i = 0; i < 27; i++) {
      expect(computePoruthams(i, i).rajjuFailed).toBe(true);
    }
  });
});

describe('Vedha', () => {
  it('flags a classical pair in both directions', () => {
    // Ashwini (0) – Jyeshtha (17).
    expect(check(computePoruthams(0, 17), 'vedha').passed).toBe(false);
    expect(check(computePoruthams(17, 0), 'vedha').passed).toBe(false);
  });

  it('flags every combination inside the Mrigashira–Chitra–Dhanishta trio', () => {
    for (const [a, b] of [[4, 13], [13, 22], [4, 22]] as const) {
      expect(check(computePoruthams(a, b), 'vedha').passed).toBe(false);
      expect(check(computePoruthams(b, a), 'vedha').passed).toBe(false);
    }
  });

  it('does not flag the same star twice', () => {
    expect(check(computePoruthams(4, 4), 'vedha').passed).toBe(true);
  });

  it('does not flag an unrelated pair', () => {
    // Ashwini (0) – Bharani (1).
    expect(check(computePoruthams(0, 1), 'vedha').passed).toBe(true);
  });
});

describe('Mahendra', () => {
  it('passes on a protective count', () => {
    // Girl Ashwini (0) → boy Rohini (3): count 4.
    const r = computePoruthams(0, 3);
    expect(check(r, 'mahendra').passed).toBe(true);
    expect(check(r, 'mahendra').detail.count).toBe(4);
  });

  it('is directional: the reverse count differs', () => {
    // Rohini (3) → Ashwini (0): count 25 — also protective, so use another pair.
    // Girl Bharani (1) → boy Ashwini (0): count 27 → not protective.
    expect(check(computePoruthams(1, 0), 'mahendra').passed).toBe(false);
    // Girl Ashwini (0) → boy Bharani (1): count 2 → not protective either,
    // but the counts themselves must differ.
    expect(check(computePoruthams(1, 0), 'mahendra').detail.count)
      .not.toBe(check(computePoruthams(0, 1), 'mahendra').detail.count);
  });

  it('wraps the count around the zodiac', () => {
    // Girl Revati (26) → boy Ashwini (0): count 2.
    expect(check(computePoruthams(26, 0), 'mahendra').detail.count).toBe(2);
  });
});

describe('Stree-Deergha', () => {
  it('gives the full pass above 13', () => {
    // Girl Ashwini (0) → boy Anuradha (16): count 17.
    const c = check(computePoruthams(0, 16), 'streeDeergha');
    expect(c.passed).toBe(true);
    expect(c.partial).toBe(false);
  });

  it('gives the partial band at 9–13', () => {
    // Girl Ashwini (0) → boy Magha (9): count 10.
    const c = check(computePoruthams(0, 9), 'streeDeergha');
    expect(c.passed).toBe(true);
    expect(c.partial).toBe(true);
  });

  it('fails below 9', () => {
    // Girl Ashwini (0) → boy Rohini (3): count 4.
    const c = check(computePoruthams(0, 3), 'streeDeergha');
    expect(c.passed).toBe(false);
  });
});

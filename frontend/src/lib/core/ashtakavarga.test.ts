import { describe, it, expect } from 'vitest'
import { computeAshtakavarga, PLANETS, bindusToScoreModifier, sarvaToLabel } from './ashtakavarga'

describe('Ashtakavarga', () => {
  // Arbitrary chart — exact positions don't matter for total checks,
  // since per-planet totals are invariant under contributor placement.
  const positions = {
    Sun: 1, Moon: 8, Mars: 10, Mercury: 1,
    Jupiter: 2, Venus: 1, Saturn: 9, Lagna: 3,
  }

  it('computes the canonical per-planet bindu totals from BPHS Ch. 66', () => {
    // Each planet's total bindus across all 12 rashis is determined purely by
    // the rule table — it sums to the classical value regardless of positions.
    const expected: Record<string, number> = {
      Sun: 48, Moon: 49, Mars: 39, Mercury: 54,
      Jupiter: 56, Venus: 52, Saturn: 39,
    }
    const { bhinna } = computeAshtakavarga(positions)
    for (const p of PLANETS) {
      const total = bhinna[p].reduce((a, b) => a + b, 0)
      expect(total, `${p} total bindus`).toBe(expected[p])
    }
  })

  it('Sarvashtakavarga sums to 337 across all 12 rashis', () => {
    const { sarva } = computeAshtakavarga(positions)
    expect(sarva).toHaveLength(12)
    expect(sarva.reduce((a, b) => a + b, 0)).toBe(337)
  })

  it('every Bhinna value is between 0 and 8', () => {
    const { bhinna } = computeAshtakavarga(positions)
    for (const p of PLANETS) {
      for (const v of bhinna[p]) {
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThanOrEqual(8)
      }
    }
  })

  it('selfStrength matches the Bhinna value at the natal rashi', () => {
    const { bhinna, selfStrength } = computeAshtakavarga(positions)
    for (const p of PLANETS) {
      expect(selfStrength[p]).toBe(bhinna[p][positions[p]])
    }
  })

  it('bindu score modifier maps weak→−2, neutral→0, strong→+2', () => {
    expect(bindusToScoreModifier(0)).toBe(-2)
    expect(bindusToScoreModifier(2)).toBe(-2)
    expect(bindusToScoreModifier(3)).toBe(-1)
    expect(bindusToScoreModifier(4)).toBe(0)
    expect(bindusToScoreModifier(5)).toBe(1)
    expect(bindusToScoreModifier(8)).toBe(2)
  })

  it('Sarva label boundaries', () => {
    expect(sarvaToLabel(19)).toBe('very weak')
    expect(sarvaToLabel(24)).toBe('weak')
    expect(sarvaToLabel(28)).toBe('average')
    expect(sarvaToLabel(33)).toBe('strong')
    expect(sarvaToLabel(40)).toBe('very strong')
  })

  it('shifting all contributors by one rashi rotates Bhinna by one', () => {
    const { bhinna: a } = computeAshtakavarga(positions)
    const shifted = Object.fromEntries(
      Object.entries(positions).map(([k, v]) => [k, (v + 1) % 12])
    ) as typeof positions
    const { bhinna: b } = computeAshtakavarga(shifted)
    for (const p of PLANETS) {
      for (let i = 0; i < 12; i++) {
        expect(b[p][(i + 1) % 12]).toBe(a[p][i])
      }
    }
  })
})

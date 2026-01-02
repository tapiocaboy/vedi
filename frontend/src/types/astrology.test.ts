import { describe, it, expect } from 'vitest'
import { DASHA_COLORS, RASHIS, RASHI_ENGLISH, PLANET_SYMBOLS } from './astrology'

describe('Astrology Types', () => {
  describe('DASHA_COLORS', () => {
    it('should have colors for all 9 planets', () => {
      const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']
      
      planets.forEach(planet => {
        expect(DASHA_COLORS[planet]).toBeDefined()
        expect(typeof DASHA_COLORS[planet]).toBe('string')
      })
    })

    it('should have valid CSS class names', () => {
      Object.values(DASHA_COLORS).forEach(color => {
        expect(color).toMatch(/^bg-/)
      })
    })
  })

  describe('RASHIS', () => {
    it('should have 12 rashi names', () => {
      expect(RASHIS).toHaveLength(12)
    })

    it('should start with Mesha', () => {
      expect(RASHIS[0]).toBe('Mesha')
    })

    it('should end with Meena', () => {
      expect(RASHIS[11]).toBe('Meena')
    })

    it('should have all unique values', () => {
      const uniqueNames = new Set(RASHIS)
      expect(uniqueNames.size).toBe(12)
    })
  })

  describe('RASHI_ENGLISH', () => {
    it('should have 12 English rashi names', () => {
      expect(RASHI_ENGLISH).toHaveLength(12)
    })

    it('should start with Aries', () => {
      expect(RASHI_ENGLISH[0]).toBe('Aries')
    })

    it('should end with Pisces', () => {
      expect(RASHI_ENGLISH[11]).toBe('Pisces')
    })
  })

  describe('PLANET_SYMBOLS', () => {
    it('should have symbols for all planets', () => {
      const planets = ['SUN', 'MOON', 'MARS', 'MERCURY', 'JUPITER', 'VENUS', 'SATURN', 'RAHU', 'KETU']
      
      planets.forEach(planet => {
        expect(PLANET_SYMBOLS[planet]).toBeDefined()
      })
    })

    it('should have Sun symbol as ☉', () => {
      expect(PLANET_SYMBOLS['SUN']).toBe('☉')
    })

    it('should have Moon symbol as ☽', () => {
      expect(PLANET_SYMBOLS['MOON']).toBe('☽')
    })
  })
})

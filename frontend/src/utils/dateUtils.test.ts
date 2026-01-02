import { describe, it, expect } from 'vitest'
import { formatDate, formatYears, formatDays } from './dateUtils'

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format ISO date string correctly', () => {
      const result = formatDate('2024-01-15T10:30:00')
      expect(result).toContain('Jan')
      expect(result).toContain('15')
      expect(result).toContain('2024')
    })

    it('should handle date-only string', () => {
      const result = formatDate('2024-06-20')
      expect(result).toContain('Jun')
      expect(result).toContain('20')
      expect(result).toContain('2024')
    })
  })

  describe('formatYears', () => {
    it('should format whole years correctly', () => {
      expect(formatYears(5)).toBe('5 years')
    })

    it('should format single year correctly', () => {
      expect(formatYears(1)).toBe('1 year')
    })

    it('should format years with months', () => {
      const result = formatYears(2.5)
      expect(result).toContain('2')
    })

    it('should handle zero years', () => {
      const result = formatYears(0.5)
      expect(result).toBeTruthy()
    })
  })

  describe('formatDays', () => {
    it('should format days under a month', () => {
      const result = formatDays(15)
      expect(result).toContain('15')
      expect(result).toContain('day')
    })

    it('should format days as months when over 30', () => {
      const result = formatDays(60)
      expect(result).toContain('month')
    })

    it('should format days over 365 correctly', () => {
      const result = formatDays(400)
      // The function returns abbreviated format like "1y 1m"
      expect(result).toMatch(/\d+y/)
    })
  })
})

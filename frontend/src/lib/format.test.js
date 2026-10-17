import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatCompact,
  formatDate,
  formatKm,
  formatCount,
  toInputDate,
  parseAmount,
} from './format.js'

describe('format', () => {
  it('handles edge cases correctly', () => {
    expect(formatCurrency(0)).toBeTruthy()
    expect(formatDate('not-a-date')).toBe('not-a-date')
    expect(parseAmount('abc')).toBe(0)
    const date = new Date('2026-10-16T12:00:00Z')
    const result = toInputDate(date)
    expect(result).toBe('2026-10-16')
  })
})

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

describe('format helpers', () => {
  it('formats currency with default behavior', () => {
    expect(formatCurrency(1000)).toBeTruthy()
    expect(formatCurrency(null)).toContain('0')
    expect(formatCurrency(undefined)).toContain('0')
    expect(formatCurrency(NaN)).toContain('0')
  })

  it('formats compact currency', () => {
    expect(formatCompact(1000)).toBeTruthy()
  })

  it('formats date with valid and invalid inputs', () => {
    expect(formatDate('2026-10-16')).toContain('16')
    expect(formatDate('invalid')).toBe('invalid')
  })

  it('formats km and count', () => {
    expect(formatKm(100.234)).toContain('km')
    expect(formatCount(123.456)).toBeTruthy()
  })

  it('handles input date and parse amount', () => {
    expect(toInputDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(parseAmount('1,234.56')).toBe(1234.56)
    expect(parseAmount('')).toBe(0)
  })
})

import { describe, expect, it } from 'vitest'
import { activeRateAmount, toIso } from './utils'

describe('toIso', () => {
  it('usa toString cuando está disponible', () => {
    expect(toIso({ toString: () => '2026-01-01T00:00:00Z' })).toBe(
      '2026-01-01T00:00:00Z',
    )
  })

  it('devuelve string vacío para null/undefined', () => {
    expect(toIso(null)).toBe('')
    expect(toIso(undefined)).toBe('')
  })
})

describe('activeRateAmount', () => {
  it('devuelve 0 sin tarifas', () => {
    expect(activeRateAmount([])).toBe(0)
  })

  it('devuelve el monto numérico de la tarifa', () => {
    const rates = [{ amount: '1500', validFrom: '2000-01-01', validTo: null }]
    expect(activeRateAmount(rates)).toBe(1500)
  })
})
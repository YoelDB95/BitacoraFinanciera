import { describe, it, expect } from 'vitest'
import { TRANSACTION_TYPES, CATEGORIES, CATEGORY_INDEX, PAYMENT_METHODS, NAV_ITEMS } from './constants.js'

describe('constants', () => {
  it('defines expected transaction types', () => {
    expect(TRANSACTION_TYPES.map(t => t.value)).toEqual(['ingreso', 'gasto'])
  })

  it('builds category index correctly', () => {
    expect(CATEGORY_INDEX.salario).toBeDefined()
    expect(CATEGORY_INDEX['alimentacion']).toBeDefined()
  })

  it('has payment methods and nav items', () => {
    expect(PAYMENT_METHODS.length).toBeGreaterThan(0)
    expect(NAV_ITEMS.length).toBeGreaterThan(0)
  })
})

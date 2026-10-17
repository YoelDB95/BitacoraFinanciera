import { describe, it, expect } from 'vitest'
import {
  ROUTE_TYPES,
  ROUTE_OPTIONS,
  CITY_OPTIONS,
  COMPANIES,
  COMPANY_INDEX,
  ENVIO_FACTURACION_OPTIONS,
  generateTripId,
  normalizeRoute,
} from './work.js'

describe('work helpers', () => {
  it('has route types and options', () => {
    expect(Array.isArray(ROUTE_TYPES)).toBe(true)
    expect(ROUTE_OPTIONS.length).toBe(ROUTE_TYPES.length)
  })

  it('has cities and companies', () => {
    expect(CITY_OPTIONS.length).toBeGreaterThan(0)
    expect(COMPANIES.length).toBeGreaterThan(0)
    expect(COMPANY_INDEX[COMPANIES[0].id]).toBeDefined()
  })

  it('defines envio/facturacion options', () => {
    expect(ENVIO_FACTURACION_OPTIONS.length).toBeGreaterThan(0)
  })
})

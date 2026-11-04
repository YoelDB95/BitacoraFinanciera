import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getCompanies,
  getRates,
  getRoutesMonth,
  toRoutePayload,
} from './api.js'
import { ApiError, isApiError } from './errors.js'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('route API payload', () => {
  it('serializes mixed route and package rates per company', () => {
    expect(
      toRoutePayload({
        routeDate: '2026-10-17',
        destinationCity: 'az',
        vehicleKmStart: 1,
        vehicleKmEnd: 2,
        notes: null,
        companies: [
          {
            companyId: 'company-route',
            routingType: 'ROUTE',
            packagesReceived: 1,
            packagesUndelivered: 0,
            rateAmount: 1938,
            routeRateAmount: 1938,
            routeRateId: 'route-rate',
            routeTypeId: 'route-type',
          },
          {
            companyId: 'company-package',
            routingType: 'PACKAGE',
            packagesReceived: 1,
            packagesUndelivered: 0,
            rateAmount: 7589,
            packageAmount: 7589,
            companyRateId: 'company-rate',
          },
        ],
      }),
    ).toEqual({
      routeDate: '2026-10-17',
      destinationCity: 'az',
      vehicleKmStart: 1,
      vehicleKmEnd: 2,
      notes: null,
      companies: [
        {
          companyId: 'company-route',
          routingType: 'ROUTE',
          packagesReceived: 1,
          packagesUndelivered: 0,
          rateAmount: 1938,
          routeRateAmount: 1938,
          routeRateId: 'route-rate',
          routeTypeId: 'route-type',
        },
        {
          companyId: 'company-package',
          routingType: 'PACKAGE',
          packagesReceived: 1,
          packagesUndelivered: 0,
          rateAmount: 7589,
          packageAmount: 7589,
          companyRateId: 'company-rate',
        },
      ],
    })
  })

  it('allows a route company without a selected rate', () => {
    expect(
      toRoutePayload({
        companies: [
          {
            companyId: 'company-route',
            routingType: 'ROUTE',
            packagesReceived: 1,
          },
        ],
      }).companies[0],
    ).toEqual({
      companyId: 'company-route',
      routingType: 'ROUTE',
      packagesReceived: 1,
      packagesUndelivered: 0,
      rateAmount: null,
      routeRateAmount: null,
      routeRateId: null,
      routeTypeId: null,
    })
  })

  it('normalizes package rate ids and nested company ids', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          routingType: 'PACKAGE',
          companyRate: {
            id: 'company-rate',
            amount: '7589',
            company: { id: 'company-package' },
          },
        }),
      }),
    )

    await expect(getRates('PACKAGE')).resolves.toEqual({
      routingType: 'PACKAGE',
      rates: [
        expect.objectContaining({
          id: 'company-rate',
          companyId: 'company-package',
          amount: 7589,
        }),
      ],
    })
  })

  it('maps current-month endpoint rows for the routes page', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [
          {
            route_company_id: 'route-company-1',
            destination_city: 'Monterrey',
            route_date: '2026-10-25',
            vehicle_km_start: '100',
            coalesce: '150',
            packages_received: '12',
            packages_undelivered: '2',
            rate_amount: '500',
            legal_name: 'Empresa Demo',
            company_routing_type: 'ROUTE',
            route_type_code: 'RT-101',
            route_type_name: 'PNU',
          },
          {
            route_company_id: 'route-company-2',
            destination_city: 'Guadalupe',
            route_date: '2026-10-26',
            vehicle_km_start: '150',
            coalesce: '180',
            packages_received: '4',
            packages_undelivered: '0',
            rate_amount: '80',
            legal_name: 'Empresa Paquete',
            company_routing_type: 'PACKAGE',
            route_type_code: '',
            route_type_name: '',
          },
        ],
      }),
    )

    await expect(getRoutesMonth()).resolves.toEqual([
      {
        id: 'route-company-1',
        routeCode: 'Ruta',
        fecha: '2026-10-25',
        city: 'Monterrey',
        kmInicial: 100,
        kmFinal: 150,
        rateAmount: 500,
        empresas: [
          {
            key: 'route-company-1',
            companyId: 'Empresa Demo',
            companyName: 'Empresa Demo',
            routingType: 'ROUTE',
            routeTypeCode: 'RT-101',
            routeTypeName: 'PNU',
            paquetes: 12,
            noEntregados: 2,
          },
        ],
      },
      {
        id: 'route-company-2',
        routeCode: 'Ruta',
        fecha: '2026-10-26',
        city: 'Guadalupe',
        kmInicial: 150,
        kmFinal: 180,
        rateAmount: 80,
        empresas: [
          {
            key: 'route-company-2',
            companyId: 'Empresa Paquete',
            companyName: 'Empresa Paquete',
            routingType: 'PACKAGE',
            routeTypeCode: '',
            routeTypeName: '',
            paquetes: 4,
            noEntregados: 0,
          },
        ],
      },
    ])
  })
})

function responseHeaders(values = {}) {
  return {
    get: (name) => values[String(name).toLowerCase()] ?? '',
  }
}

function jsonResponse(body, options = {}) {
  const status = options.status ?? 200
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: options.statusText ?? '',
    headers: responseHeaders(options.headers),
    text: async () => JSON.stringify(body),
  }
}

function textResponse(body, options = {}) {
  const status = options.status ?? 500
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: options.statusText ?? '',
    headers: responseHeaders(options.headers),
    text: async () => body,
  }
}

async function captureError(promise) {
  try {
    await promise
  } catch (error) {
    return error
  }
  throw new Error('Se esperaba que la promesa fallara')
}

describe('API error normalization', () => {
  it('wraps connection failures as retryable network ApiErrors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    )

    const error = await captureError(getCompanies())

    expect(error).toBeInstanceOf(ApiError)
    expect(isApiError(error)).toBe(true)
    expect(error).toMatchObject({
      message: 'No se pudo conectar con el servidor.',
      source: 'network',
      kind: 'network',
      code: 'NETWORK_ERROR',
      method: 'GET',
      status: null,
      retryable: true,
    })
    expect(error.endpoint).toMatch(/\/api\/companies$/)
  })

  it('maps aborted requests to timeout errors', async () => {
    const abortError = new Error('The user aborted a request')
    abortError.name = 'AbortError'
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError))

    const error = await captureError(getCompanies())

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      kind: 'timeout',
      source: 'network',
      code: 'REQUEST_TIMEOUT',
      retryable: true,
    })
  })

  it('preserves status, code, details and request id from backend errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(
          {
            error: 'No se pudo guardar la empresa',
            code: 'COMPANY_SAVE_FAILED',
            details: { field: 'cuit' },
          },
          {
            status: 500,
            statusText: 'Internal Server Error',
            headers: { 'x-request-id': 'req-42' },
          },
        ),
      ),
    )

    const error = await captureError(getCompanies())

    expect(error).toMatchObject({
      message: 'No se pudo guardar la empresa',
      source: 'backend',
      kind: 'server',
      status: 500,
      statusText: 'Internal Server Error',
      code: 'COMPANY_SAVE_FAILED',
      method: 'GET',
      requestId: 'req-42',
      retryable: true,
    })
    expect(error.details).toEqual({ field: 'cuit' })
    expect(error.payload).toEqual({
      error: 'No se pudo guardar la empresa',
      code: 'COMPANY_SAVE_FAILED',
      details: { field: 'cuit' },
    })
  })

  it('replaces the generic backend message with a readable status message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({ error: 'error' }, { status: 404, statusText: 'Not Found' }),
      ),
    )

    const error = await captureError(getCompanies())

    expect(error).toMatchObject({
      message: 'No se encontró el recurso solicitado.',
      status: 404,
      retryable: false,
    })
    expect(error.payload).toEqual({ error: 'error' })
  })

  it('uses plain-text backend responses as the error message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        textResponse('Bad gateway', {
          status: 502,
          statusText: 'Bad Gateway',
        }),
      ),
    )

    const error = await captureError(getCompanies())

    expect(error).toMatchObject({
      message: 'Bad gateway',
      status: 502,
      retryable: true,
    })
    expect(error.payload).toEqual({ raw: 'Bad gateway' })
    expect(error.details).toBeNull()
  })

  it('falls back to the status message when the error body is empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(textResponse('', { status: 500 })),
    )

    const error = await captureError(getCompanies())

    expect(error.message).toBe('El servidor no pudo procesar la solicitud.')
    expect(error.payload).toBeNull()
  })

  it('returns an empty list for a 204 response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        statusText: 'No Content',
        headers: responseHeaders(),
        text: async () => '',
      }),
    )

    await expect(getCompanies()).resolves.toEqual([])
  })
})

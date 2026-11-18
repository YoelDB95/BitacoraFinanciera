import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  deleteCompanyRoute,
  deleteRoute,
  getCompanies,
  getRates,
  getRoutes,
  login,
  setUnauthorizedHandler,
  toRoutePayload,
  toUpdateRoutePayload,
  updateRoute,
} from './api.js'
import { saveSession } from './authStorage.js'
import { ApiError, isApiError } from './errors.js'

afterEach(() => {
  vi.unstubAllGlobals()
  setUnauthorizedHandler(null)
  localStorage.clear()
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
          routeTypeId: null,
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

  it('serializes a flat update payload with the selected company values', () => {
    expect(
      toUpdateRoutePayload(
        {
          routeDate: '2026-11-08',
          destinationCity: 'Azul',
          vehicleKmStart: 111000,
          vehicleKmEnd: 111111,
          notes: null,
          companies: [
            {
              companyId: 'company-route',
              routingType: 'ROUTE',
              packagesReceived: 110,
              packagesUndelivered: 3,
              rateAmount: 121000,
              routeRateAmount: 121000,
              routeRateId: 'route-rate',
              routeTypeId: 'route-type',
            },
          ],
        },
        'route-1',
        'route-company-1',
      ),
    ).toEqual({
      routeId: 'route-1',
      routeCompanyId: 'route-company-1',
      routeDate: '2026-11-08',
      destinationCity: 'Azul',
      vehicleKmStart: 111000,
      vehicleKmEnd: 111111,
      notes: null,
      companyId: 'company-route',
      packagesReceived: 110,
      packagesUndelivered: 3,
      rateAmount: 121000,
      routeRateAmount: 121000,
      routeRateId: 'route-rate',
      routeTypeId: 'route-type',
    })
  })

  it('keeps package ids and amounts in the flat update payload', () => {
    expect(
      toUpdateRoutePayload(
        {
          routeDate: '2026-11-08',
          destinationCity: 'Azul',
          vehicleKmStart: 10,
          vehicleKmEnd: null,
          companies: [
            {
              companyId: 'company-package',
              routingType: 'PACKAGE',
              packagesReceived: 4,
              packagesUndelivered: 0,
              rateAmount: 1840,
              packageAmount: 1840,
              companyRateId: 'company-rate',
            },
          ],
        },
        'route-2',
        'route-company-2',
      ),
    ).toEqual({
      routeId: 'route-2',
      routeCompanyId: 'route-company-2',
      routeDate: '2026-11-08',
      destinationCity: 'Azul',
      vehicleKmStart: 10,
      vehicleKmEnd: null,
      notes: null,
      companyId: 'company-package',
      packagesReceived: 4,
      packagesUndelivered: 0,
      rateAmount: 1840,
      companyRateAmount: 1840,
      companyRateId: 'company-rate',
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

  it('maps filtered endpoint rows for the routes page', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        {
          route_company_id: 'route-company-1',
          route_id: 'route-1',
          destination_city: 'Monterrey',
          route_date: '2026-10-25',
          notes: 'Nota de ruta',
          vehicle_km_start: '100',
          coalesce: '150',
          packages_received: '12',
          packages_undelivered: '2',
          rate_amount: '500',
          billing_amount: '450',
          legal_name: 'Empresa Demo',
          company_routing_type: 'ROUTE',
          route_type_code: 'RT-101',
          route_type_name: 'PNU',
          route_rate_id: 'route-rate-1',
          route_type_id: 'route-type-1',
        },
        {
          route_company_id: 'route-company-2',
          route_id: 'route-2',
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
          company_rate_id: 'company-rate-2',
        },
      ],
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(getRoutes({ month: '2026-10' })).resolves.toEqual([
      {
        id: 'route-company-1',
        routeId: 'route-1',
        routeCompanyId: 'route-company-1',
        routeCode: 'Ruta',
        fecha: '2026-10-25',
        city: 'Monterrey',
        notes: 'Nota de ruta',
        kmInicial: 100,
        kmFinal: 150,
        rateAmount: 500,
        billingAmount: 450,
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
            routeRateId: 'route-rate-1',
            routeTypeId: 'route-type-1',
            companyRateId: '',
          },
        ],
      },
      {
        id: 'route-company-2',
        routeId: 'route-2',
        routeCompanyId: 'route-company-2',
        routeCode: 'Ruta',
        fecha: '2026-10-26',
        city: 'Guadalupe',
        notes: '',
        kmInicial: 150,
        kmFinal: 180,
        rateAmount: 80,
        billingAmount: null,
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
            routeRateId: '',
            routeTypeId: '',
            companyRateId: 'company-rate-2',
          },
        ],
      },
    ])

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/routes?month=2026-10'),
      expect.any(Object),
    )
  })

  it('sends range filters and company to the routes endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      getRoutes({
        startDate: '2026-10-01',
        endDate: '2026-10-15',
        companyId: 'company-1',
      }),
    ).resolves.toEqual([])

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        '/api/routes?startDate=2026-10-01&endDate=2026-10-15&companyId=company-1',
      ),
      expect.any(Object),
    )
  })
})

describe('route mutations', () => {
  it('updates a route company with a PUT and the shared route payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ updated: true }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const payload = {
      routeDate: '2026-10-17',
      destinationCity: 'Monterrey',
      vehicleKmStart: 100,
      vehicleKmEnd: 150,
      notes: 'Visita',
      companies: [
        {
          companyId: 'company-1',
          routingType: 'ROUTE',
          packagesReceived: 12,
          packagesUndelivered: 2,
          rateAmount: 500,
          routeRateAmount: 500,
          routeRateId: 'route-rate-1',
          routeTypeId: 'route-type-1',
        },
      ],
    }

    await expect(
      updateRoute('route-1', 'route-company-1', payload),
    ).resolves.toEqual({ updated: true })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/routes/route-1/route-company-1'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(
          toUpdateRoutePayload(payload, 'route-1', 'route-company-1'),
        ),
      }),
    )
  })

  it('deletes a complete route', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(deleteRoute('route-1')).resolves.toBeNull()

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/routes/route-1'),
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('deletes only the selected company route', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(deleteCompanyRoute('route-company-1')).resolves.toBeNull()

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/routes/companyRoute/route-company-1'),
      expect.objectContaining({ method: 'DELETE' }),
    )
  })
})

describe('request headers', () => {
  it('does not send Content-Type on GET requests without a body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]))
    vi.stubGlobal('fetch', fetchMock)

    await getRoutes({ month: '2026-11' })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/routes?month=2026-11'),
      expect.objectContaining({
        method: 'GET',
        headers: {},
      }),
    )
  })

  it('sends Content-Type on requests with a body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ updated: true }))
    vi.stubGlobal('fetch', fetchMock)

    await updateRoute('route-1', 'route-company-1', {})

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/routes/route-1/route-company-1'),
      expect.objectContaining({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  })
})

describe('authentication API', () => {
  it('sends username and password to the login endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        token: 'jwt-1',
        user: { id: 'usr-1', username: 'yoel', name: 'Yoel' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      login({ username: 'yoel', password: 'secreto' }),
    ).resolves.toMatchObject({
      token: 'jwt-1',
      user: { username: 'yoel', name: 'Yoel' },
    })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/login'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'yoel', password: 'secreto' }),
      }),
    )
  })

  it('attaches the bearer token to authenticated requests', async () => {
    saveSession({ token: 'jwt-2', user: { username: 'yoel' } })
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]))
    vi.stubGlobal('fetch', fetchMock)

    await getCompanies()

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/companies'),
      expect.objectContaining({
        headers: { Authorization: 'Bearer jwt-2' },
      }),
    )
  })

  it('does not send the bearer token to the login endpoint', async () => {
    saveSession({ token: 'jwt-old', user: { username: 'yoel' } })
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ token: 'jwt-new', user: { username: 'yoel' } }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await login({ username: 'yoel', password: 'secreto' })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/login'),
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  })

  it('clears the session and notifies on a 401 from a protected endpoint', async () => {
    saveSession({ token: 'jwt-expired', user: { username: 'yoel' } })
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ message: 'Token expirado' }, { status: 401 })),
    )

    await expect(getCompanies()).rejects.toMatchObject({ status: 401 })

    expect(localStorage.getItem('bitacora.auth.v1')).toBeNull()
    expect(handler).toHaveBeenCalledOnce()
  })

  it('keeps the session when login returns 401', async () => {
    saveSession({ token: 'jwt-old', user: { username: 'yoel' } })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(
          { code: 'INVALID_CREDENTIALS', message: 'Credenciales incorrectas' },
          { status: 401 },
        ),
      ),
    )

    await expect(
      login({ username: 'yoel', password: 'mala' }),
    ).rejects.toMatchObject({ status: 401 })

    expect(localStorage.getItem('bitacora.auth.v1')).not.toBeNull()
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

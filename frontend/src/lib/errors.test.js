import { describe, expect, it } from 'vitest'
import {
  ApiError,
  AppError,
  formatErrorReport,
  getErrorFacts,
  getErrorHint,
  getErrorOrigin,
  getErrorPayload,
  getErrorTitle,
  isAbortError,
  isApiError,
  isRetryableError,
  kindLabel,
  normalizeError,
  statusMessage,
} from './errors.js'

describe('normalizeError', () => {
  it('keeps AppError instances untouched', () => {
    const error = new AppError('Falla del frontend', { kind: 'runtime' })
    expect(normalizeError(error)).toBe(error)
  })

  it('normalizes regular Error instances as frontend runtime errors', () => {
    const normalized = normalizeError(new TypeError('algo falló'))

    expect(normalized).toBeInstanceOf(AppError)
    expect(normalized).toMatchObject({
      name: 'TypeError',
      source: 'frontend',
      kind: 'runtime',
      message: 'algo falló',
    })
  })

  it('normalizes strings and plain objects with a message', () => {
    expect(normalizeError('  error de texto  ')).toMatchObject({
      source: 'frontend',
      kind: 'unknown',
      message: 'error de texto',
    })

    expect(normalizeError({ message: 'error de objeto' })).toMatchObject({
      source: 'frontend',
      kind: 'unknown',
      message: 'error de objeto',
    })
  })

  it('uses the fallback message for unknown values', () => {
    expect(
      normalizeError(null, { fallbackMessage: 'No pasó nada esperado' }).message,
    ).toBe('No pasó nada esperado')
  })

  it('rebuilds ApiError-like objects preserving their technical fields', () => {
    const normalized = normalizeError({
      name: 'ApiError',
      isApiError: true,
      message: 'La API falló',
      status: 409,
      statusText: 'Conflict',
      code: 'DUPLICATED',
      details: { field: 'cuit' },
      payload: { error: 'La API falló' },
      endpoint: '/api/companies',
      method: 'POST',
      requestId: 'req-9',
      retryable: false,
      timestamp: '2026-01-01T00:00:00.000Z',
    })

    expect(normalized).toBeInstanceOf(ApiError)
    expect(normalized).toMatchObject({
      source: 'backend',
      status: 409,
      statusText: 'Conflict',
      code: 'DUPLICATED',
      endpoint: '/api/companies',
      method: 'POST',
      requestId: 'req-9',
      retryable: false,
      timestamp: '2026-01-01T00:00:00.000Z',
    })
    expect(normalized.details).toEqual({ field: 'cuit' })
    expect(normalized.payload).toEqual({ error: 'La API falló' })
    expect(isApiError(normalized)).toBe(true)
  })
})

describe('error classification', () => {
  it('detects abort errors by name', () => {
    expect(isAbortError({ name: 'AbortError' })).toBe(true)
    expect(isAbortError(new Error('otra cosa'))).toBe(false)
  })

  it('classifies network, backend and frontend origins', () => {
    const network = new ApiError('Sin conexión', {
      source: 'network',
      kind: 'network',
    })
    const backend = new ApiError('Respuesta 500', { status: 500 })
    const render = normalizeError(new Error('boom'), { kind: 'render' })

    expect(getErrorOrigin(network)).toMatchObject({
      key: 'network',
      label: 'Conexión',
      icon: 'wifiOff',
    })
    expect(getErrorOrigin(backend)).toMatchObject({
      key: 'backend',
      label: 'Backend',
      icon: 'server',
    })
    expect(getErrorOrigin(render)).toMatchObject({
      key: 'frontend',
      label: 'Frontend',
      icon: 'bug',
    })
  })

  it('returns readable labels and status messages', () => {
    expect(kindLabel('validation')).toBe('Validación de datos')
    expect(kindLabel('inexistente')).toBe('Error desconocido')
    expect(statusMessage(404)).toBe('No se encontró el recurso solicitado.')
    expect(statusMessage(503)).toBe('El servicio no está disponible en este momento.')
    expect(statusMessage(418)).toBe('La solicitud falló con el código 418.')
  })
})

describe('error titles and hints', () => {
  it('describes connection and timeout failures', () => {
    const network = new ApiError('Sin conexión', {
      source: 'network',
      kind: 'network',
    })
    const timeout = new ApiError('Tiempo agotado', { kind: 'timeout' })

    expect(getErrorTitle(network)).toBe('No se pudo conectar con el servidor')
    expect(getErrorHint(network)).toContain('backend')
    expect(getErrorTitle(timeout)).toBe('La solicitud tardó demasiado')
    expect(getErrorHint(timeout)).toContain('Reintentá')
  })

  it('describes backend statuses with actionable hints', () => {
    expect(getErrorTitle(new ApiError('x', { status: 400 }))).toBe(
      'El servidor rechazó los datos',
    )
    expect(getErrorTitle(new ApiError('x', { status: 404 }))).toBe(
      'Recurso no encontrado',
    )
    expect(getErrorTitle(new ApiError('x', { status: 500 }))).toBe(
      'Error interno del servidor',
    )
    expect(getErrorHint(new ApiError('x', { status: 404 }))).toContain('endpoint')
    expect(getErrorHint(new ApiError('x', { status: 500 }))).toContain(
      'servidor',
    )
  })

  it('describes render errors as frontend failures', () => {
    const render = normalizeError(new Error('boom'), { kind: 'render' })

    expect(getErrorTitle(render)).toBe('La interfaz encontró un problema')
    expect(getErrorHint(render)).toContain('recargar')
  })
})

describe('retryability', () => {
  it('retries network, timeout, 5xx, 408 and 429 errors', () => {
    expect(
      isRetryableError(
        new ApiError('x', { source: 'network', kind: 'network' }),
      ),
    ).toBe(true)
    expect(isRetryableError(new ApiError('x', { kind: 'timeout' }))).toBe(true)
    expect(isRetryableError(new ApiError('x', { status: 500 }))).toBe(true)
    expect(isRetryableError(new ApiError('x', { status: 408 }))).toBe(true)
    expect(isRetryableError(new ApiError('x', { status: 429 }))).toBe(true)
  })

  it('does not retry client validation or not-found errors', () => {
    expect(isRetryableError(new ApiError('x', { status: 400 }))).toBe(false)
    expect(isRetryableError(new ApiError('x', { status: 404 }))).toBe(false)
  })
})

describe('error details and report', () => {
  it('collects facts for backend errors', () => {
    const error = new ApiError('No se pudo guardar', {
      kind: 'server',
      status: 500,
      statusText: 'Internal Server Error',
      code: 'DB_ERROR',
      endpoint: '/api/companies',
      method: 'POST',
      requestId: 'req-42',
      context: { action: 'create' },
      timestamp: '2026-01-01T00:00:00.000Z',
    })

    expect(getErrorFacts(error)).toEqual(
      expect.arrayContaining([
        { label: 'Origen', value: 'Backend' },
        { label: 'Categoría', value: 'Respuesta del servidor' },
        { label: 'Estado HTTP', value: '500 Internal Server Error' },
        { label: 'Código', value: 'DB_ERROR' },
        { label: 'Endpoint', value: 'POST /api/companies' },
        { label: 'ID de solicitud', value: 'req-42' },
        expect.objectContaining({ label: 'Contexto' }),
      ]),
    )
  })

  it('exposes details and payload separately', () => {
    const error = new ApiError('x', {
      details: { field: 'cuit' },
      payload: { error: 'x' },
    })

    expect(getErrorPayload(error)).toEqual([
      { label: 'Detalles', value: JSON.stringify({ field: 'cuit' }, null, 2) },
      { label: 'Respuesta', value: JSON.stringify({ error: 'x' }, null, 2) },
    ])
  })

  it('formats a copyable diagnostic report', () => {
    const error = new ApiError('No se pudo guardar', {
      status: 502,
      endpoint: '/api/routes',
      method: 'POST',
      details: { reason: 'gateway' },
    })

    const report = formatErrorReport(error, { page: 'Rutas' })

    expect(report).toContain('[Backend] Error interno del servidor')
    expect(report).toContain('Mensaje: No se pudo guardar')
    expect(report).toContain('Estado HTTP: 502')
    expect(report).toContain('Endpoint: POST /api/routes')
    expect(report).toContain('Contexto adicional:')
    expect(report).toContain('"page": "Rutas"')
    expect(report).toContain('Detalles:')
    expect(report).toContain('"reason": "gateway"')
    expect(report).toContain('Stack:')
  })
})

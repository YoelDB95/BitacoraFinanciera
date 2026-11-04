const KIND_LABELS = {
  network: 'Sin conexión',
  timeout: 'Tiempo de espera agotado',
  server: 'Respuesta del servidor',
  validation: 'Validación de datos',
  runtime: 'Error en tiempo de ejecución',
  promise: 'Promesa rechazada',
  render: 'Error de renderizado',
  unknown: 'Error desconocido',
}

const STATUS_MESSAGES = {
  400: 'La solicitud contiene datos inválidos.',
  401: 'No estás autorizado para realizar esta acción.',
  403: 'No tenés permisos para realizar esta acción.',
  404: 'No se encontró el recurso solicitado.',
  405: 'El método HTTP no está permitido para este recurso.',
  408: 'La solicitud tardó demasiado en responder.',
  409: 'La operación entra en conflicto con los datos actuales.',
  422: 'Los datos enviados no son válidos.',
  429: 'Se hicieron demasiadas solicitudes. Esperá un momento.',
  500: 'El servidor no pudo procesar la solicitud.',
  502: 'El servidor recibió una respuesta inválida de un servicio externo.',
  503: 'El servicio no está disponible en este momento.',
  504: 'El servidor no respondió a tiempo.',
}

function truncate(value, max = 4000) {
  const text = String(value ?? '')
  return text.length > max ? `${text.slice(0, max)}…` : text
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function safeStringify(value) {
  if (value == null) return ''
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export function statusMessage(status) {
  if (STATUS_MESSAGES[status]) return STATUS_MESSAGES[status]
  if (status >= 500) return 'El servidor no pudo procesar la solicitud.'
  return `La solicitud falló con el código ${status ?? 'desconocido'}.`
}

export function kindLabel(kind) {
  return KIND_LABELS[kind] ?? KIND_LABELS.unknown
}

export function isApiError(error) {
  return Boolean(error?.isApiError) || error?.name === 'ApiError'
}

export function isAbortError(error) {
  return error?.name === 'AbortError'
}

export class AppError extends Error {
  constructor(message, options = {}) {
    super(message || 'Ocurrió un error inesperado.', {
      cause: options.cause,
    })
    this.name = options.name ?? 'AppError'
    this.source = options.source ?? 'frontend'
    this.kind = options.kind ?? 'unknown'
    this.status = options.status ?? null
    this.statusText = options.statusText ?? ''
    this.code = options.code ?? ''
    this.details = options.details ?? null
    this.payload = options.payload ?? null
    this.endpoint = options.endpoint ?? ''
    this.method = options.method ?? ''
    this.requestId = options.requestId ?? ''
    this.retryable = Boolean(options.retryable)
    this.timestamp = options.timestamp ?? new Date().toISOString()
    this.context = options.context ?? null
  }
}

export class ApiError extends AppError {
  constructor(message, options = {}) {
    super(message, {
      ...options,
      name: 'ApiError',
      source: options.source ?? 'backend',
    })
    this.isApiError = true
  }
}

export function normalizeError(error, options = {}) {
  if (error instanceof AppError) return error

  if (isApiError(error)) {
    return new ApiError(error.message || statusMessage(error.status), {
      kind: error.kind ?? 'server',
      source: error.source ?? 'backend',
      status: error.status,
      statusText: error.statusText,
      code: error.code,
      details: error.details,
      payload: error.payload,
      endpoint: error.endpoint,
      method: error.method,
      requestId: error.requestId,
      retryable: error.retryable,
      timestamp: error.timestamp,
      context: options.context ?? error.context,
      cause: error,
    })
  }

  if (error instanceof Error) {
    return new AppError(error.message || options.fallbackMessage, {
      name: error.name,
      source: options.source ?? 'frontend',
      kind: options.kind ?? 'runtime',
      context: options.context,
      cause: error,
    })
  }

  if (typeof error === 'string' && error.trim()) {
    return new AppError(error.trim(), {
      source: options.source ?? 'frontend',
      kind: options.kind ?? 'unknown',
      context: options.context,
      cause: error,
    })
  }

  if (isPlainObject(error) && typeof error.message === 'string') {
    return new AppError(error.message, {
      source: options.source ?? 'frontend',
      kind: options.kind ?? 'unknown',
      context: options.context,
      cause: error,
    })
  }

  return new AppError(options.fallbackMessage ?? 'Ocurrió un error inesperado.', {
    source: options.source ?? 'frontend',
    kind: options.kind ?? 'unknown',
    context: options.context,
    cause: error,
  })
}

export function getErrorOrigin(error) {
  const normalized = normalizeError(error)

  if (normalized.source === 'network' || normalized.kind === 'network') {
    return {
      key: 'network',
      label: 'Conexión',
      icon: 'wifiOff',
      description: 'No se pudo comunicar con la API',
    }
  }

  if (normalized.source === 'backend' || isApiError(normalized)) {
    return {
      key: 'backend',
      label: 'Backend',
      icon: 'server',
      description: 'Respuesta recibida desde la API',
    }
  }

  return {
    key: 'frontend',
    label: 'Frontend',
    icon: normalized.kind === 'render' ? 'bug' : 'monitor',
    description: 'Error originado en la aplicación',
  }
}

export function getErrorTitle(error) {
  const normalized = normalizeError(error)

  if (normalized.source === 'network' || normalized.kind === 'network') {
    return 'No se pudo conectar con el servidor'
  }

  if (normalized.kind === 'timeout') {
    return 'La solicitud tardó demasiado'
  }

  if (normalized.kind === 'render') {
    return 'La interfaz encontró un problema'
  }

  if (normalized.kind === 'promise') {
    return 'Una operación asincrónica falló'
  }

  if (normalized.source === 'backend' || isApiError(normalized)) {
    switch (normalized.status) {
      case 400:
      case 422:
        return 'El servidor rechazó los datos'
      case 401:
        return 'Sesión no autorizada'
      case 403:
        return 'Acceso denegado'
      case 404:
        return 'Recurso no encontrado'
      case 409:
        return 'Conflicto con los datos actuales'
      case 429:
        return 'Demasiadas solicitudes'
      default:
        return normalized.status >= 500
          ? 'Error interno del servidor'
          : 'La solicitud no pudo completarse'
    }
  }

  return 'Ocurrió un error inesperado'
}

export function getErrorHint(error) {
  const normalized = normalizeError(error)

  if (normalized.source === 'network' || normalized.kind === 'network') {
    return 'Verificá que el backend esté en ejecución y que la URL de la API sea correcta.'
  }

  if (normalized.kind === 'timeout') {
    return 'El servidor no respondió a tiempo. Reintentá en unos segundos.'
  }

  if (normalized.kind === 'render') {
    return 'Podés reintentar la vista o recargar la aplicación. Si el problema persiste, copiá los detalles técnicos.'
  }

  if (normalized.source === 'backend' || isApiError(normalized)) {
    if (normalized.status === 400 || normalized.status === 422) {
      return 'Revisá los datos ingresados y volvé a intentarlo.'
    }
    if (normalized.status === 401 || normalized.status === 403) {
      return 'La solicitud fue rechazada por permisos. Verificá la sesión o el acceso al recurso.'
    }
    if (normalized.status === 404) {
      return 'El recurso o endpoint puede haber cambiado. Verificá la ruta de la API.'
    }
    if (normalized.status === 429) {
      return 'Esperá unos segundos antes de volver a intentarlo.'
    }
    if (normalized.status >= 500) {
      return 'El error quedó registrado en el servidor. Reintentá en unos segundos.'
    }
    return 'Revisá los datos enviados y volvé a intentarlo.'
  }

  return 'Podés reintentar la operación o recargar la aplicación.'
}

export function isRetryableError(error) {
  const normalized = normalizeError(error)
  if (normalized.retryable) return true
  if (normalized.source === 'network') return true
  if (normalized.kind === 'timeout') return true
  return normalized.status == null || normalized.status === 408 || normalized.status === 429 || normalized.status >= 500
}

export function getErrorFacts(error) {
  const normalized = normalizeError(error)
  const origin = getErrorOrigin(normalized)
  const facts = [
    { label: 'Origen', value: origin.label },
    { label: 'Categoría', value: kindLabel(normalized.kind) },
  ]

  if (normalized.status) {
    facts.push({
      label: 'Estado HTTP',
      value: `${normalized.status}${normalized.statusText ? ` ${normalized.statusText}` : ''}`,
    })
  }

  if (normalized.code) {
    facts.push({ label: 'Código', value: normalized.code })
  }

  if (normalized.endpoint) {
    facts.push({
      label: 'Endpoint',
      value: `${normalized.method ? `${normalized.method} ` : ''}${normalized.endpoint}`,
    })
  }

  if (normalized.requestId) {
    facts.push({ label: 'ID de solicitud', value: normalized.requestId })
  }

  if (normalized.timestamp) {
    const date = new Date(normalized.timestamp)
    if (!Number.isNaN(date.getTime())) {
      facts.push({ label: 'Fecha', value: date.toLocaleString('es-MX') })
    }
  }

  if (normalized.context) {
    facts.push({ label: 'Contexto', value: safeStringify(normalized.context) })
  }

  return facts
}

export function getErrorPayload(error) {
  const normalized = normalizeError(error)
  const parts = []

  if (normalized.details != null) {
    parts.push({ label: 'Detalles', value: safeStringify(normalized.details) })
  }

  if (normalized.payload != null) {
    parts.push({ label: 'Respuesta', value: safeStringify(normalized.payload) })
  }

  return parts
}

export function formatErrorReport(error, context) {
  const normalized = normalizeError(error)
  const origin = getErrorOrigin(normalized)
  const lines = [
    `[${origin.label}] ${getErrorTitle(normalized)}`,
    `Mensaje: ${normalized.message}`,
  ]

  for (const fact of getErrorFacts(normalized)) {
    lines.push(`${fact.label}: ${fact.value}`)
  }

  if (context) {
    lines.push(`Contexto adicional: ${safeStringify(context)}`)
  }

  for (const part of getErrorPayload(normalized)) {
    lines.push('', `${part.label}:`, truncate(part.value))
  }

  if (normalized.stack) {
    lines.push('', 'Stack:', truncate(normalized.stack))
  }

  return lines.join('\n')
}

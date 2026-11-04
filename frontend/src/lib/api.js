import {
  ApiError,
  isAbortError,
  statusMessage,
} from './errors.js'
import { ENVIO_FACTURACION_LABELS } from './work.js'

const API_BASE = (import.meta.env?.VITE_API_URL ?? '/api').replace(/\/+$/, '')

const GENERIC_MESSAGES = new Set(['error', 'failed', 'fail', 'unknown error'])

async function readResponseBody(response) {
  if (typeof response.text === 'function') {
    try {
      const text = await response.text()
      if (!text) return { data: null, raw: '' }
      try {
        return { data: JSON.parse(text), raw: text }
      } catch {
        return { data: null, raw: text }
      }
    } catch {
      return { data: null, raw: '' }
    }
  }

  if (typeof response.json === 'function') {
    try {
      return { data: await response.json(), raw: '' }
    } catch {
      return { data: null, raw: '' }
    }
  }

  return { data: null, raw: '' }
}

function readErrorMessage(body, status, raw = '') {
  const fallback = statusMessage(status)

  if (typeof body === 'string') {
    return GENERIC_MESSAGES.has(body.trim().toLowerCase()) ? fallback : body
  }

  if (!body || typeof body !== 'object') {
    const text = String(raw ?? '').trim()
    if (
      text &&
      text.length <= 500 &&
      !GENERIC_MESSAGES.has(text.toLowerCase()) &&
      !/^[<[{]/.test(text)
    ) {
      return text
    }
    return fallback
  }

  const candidates = [
    body.error,
    body.message,
    body.error?.message,
    body.detail,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return GENERIC_MESSAGES.has(candidate.trim().toLowerCase())
        ? fallback
        : candidate.trim()
    }
  }

  if (Array.isArray(body.errors) && body.errors.length > 0) {
    const first = body.errors[0]
    if (typeof first === 'string' && first.trim()) return first.trim()
    if (typeof first?.message === 'string' && first.message.trim()) {
      return first.message.trim()
    }
  }

  return fallback
}

function readErrorCode(body) {
  if (!body || typeof body !== 'object') return ''
  return body.code ?? body.errorCode ?? body.error_code ?? ''
}

function readErrorDetails(body) {
  if (!body || typeof body !== 'object') return null
  return body.details ?? body.errors ?? null
}

function readRequestId(response) {
  return (
    response.headers?.get?.('x-request-id') ??
    response.headers?.get?.('x-correlation-id') ??
    ''
  )
}

function makeEndpoint(path) {
  return `${API_BASE}${path}`
}

async function send(path = '', options = {}) {
  const endpoint = makeEndpoint(path)
  const method = String(options.method ?? 'GET').toUpperCase()
  let response

  try {
    response = await fetch(endpoint, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch (cause) {
    if (isAbortError(cause)) {
      throw new ApiError('La solicitud fue cancelada o tardó demasiado.', {
        source: 'network',
        kind: 'timeout',
        code: 'REQUEST_TIMEOUT',
        endpoint,
        method,
        retryable: true,
        cause,
      })
    }

    throw new ApiError('No se pudo conectar con el servidor.', {
      source: 'network',
      kind: 'network',
      code: 'NETWORK_ERROR',
      endpoint,
      method,
      retryable: true,
      cause,
    })
  }

  if (response.status === 204) return null

  const { data, raw } = await readResponseBody(response)

  if (!response.ok) {
    throw new ApiError(readErrorMessage(data, response.status, raw), {
      kind: 'server',
      source: 'backend',
      status: response.status,
      statusText: response.statusText ?? '',
      code: readErrorCode(data),
      details: readErrorDetails(data),
      payload: data ?? (raw ? { raw } : null),
      endpoint,
      method,
      requestId: readRequestId(response),
      retryable:
        response.status === 408 ||
        response.status === 429 ||
        response.status >= 500,
    })
  }

  return data
}

function request(path = '', options = {}) {
  return send(`/companies${path}`, options)
}

function normalizeRate(rate = {}, routingType = '') {
  return {
    id: rate.id ?? rate.route_rate_id ?? rate.routeRateId ?? rate.rateId ?? '',
    routeTypeId: rate.route_type_id ?? rate.routeTypeId ?? '',
    routingType: rate.routingType ?? routingType ?? '',
    code: rate.code ?? '',
    name: rate.name ?? '',
    unit: rate.unit ?? '',
    notes: rate.notes ?? '',
    companyId: rate.company_id ?? rate.companyId ?? rate.company?.id ?? '',
    amount: Number(rate.amount ?? 0),
    validFrom: rate.valid_from ?? rate.validFrom ?? null,
    validTo: rate.valid_to ?? rate.validTo ?? null,
    isSpecial: Boolean(rate.is_special ?? rate.isSpecial ?? false),
  }
}

function normalizeCompany(raw) {
  if (!raw || typeof raw !== 'object') return null

  const contacts = Array.isArray(raw.billingContacts)
    ? raw.billingContacts
    : []

  return {
    id: raw.id ?? raw._id ?? '',
    cuit: raw.cuit ?? '',
    legalName: raw.legalName ?? raw.name ?? '',
    businessName: raw.businessName ?? '',
    billingAddress: raw.billingAddress ?? '',
    billingNotes: raw.billingNotes ?? '',
    active: raw.active ?? true,
    routingType: raw.routingType ?? raw.routing_type ?? '',
    tarifa: Number(raw.tarifa ?? 0),
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
    billingContacts: contacts.map((contact) => ({
      id: contact?.id ?? '',
      name: contact?.name ?? '',
      email: contact?.email ?? '',
      notes: contact?.notes ?? '',
      isPrimary: Boolean(contact?.isPrimary),
    })),
    rates: (Array.isArray(raw.rates)
      ? raw.rates
      : Array.isArray(raw.companyRates)
        ? raw.companyRates
        : []
    ).map((rate) => normalizeRate(rate)),
  }
}

function buildContactNotes(company = {}) {
  const note = company.billingContactNotes ?? company.nota ?? ''
  const envioLabel = ENVIO_FACTURACION_LABELS[company.envioFacturacion] ?? ''
  return [note, envioLabel].filter(Boolean).join(' - ')
}

export function toApiPayload(company = {}) {
  const legalName = company.legalName ?? company.nombre ?? ''

  return {
    cuit: String(company.cuit ?? '').trim(),
    legalName,
    businessName: company.businessName ?? null,
    billingAddress:
      company.billingAddress ?? company.direccionFacturacion ?? null,
    billingContactName: company.billingContactName ?? legalName,
    billingContactEmail: company.billingContactEmail ?? company.correo ?? null,
    billingContactNotes: buildContactNotes(company) || null,
    routingType: company.routingType ?? null,
  }
}

export function fromApiCompany(raw) {
  const company = normalizeCompany(raw)
  if (!company) return null

  const primary =
    company.billingContacts.find((contact) => contact.isPrimary) ??
    company.billingContacts[0]

  return {
    id: company.id,
    nombre: company.legalName,
    cuit: company.cuit,
    correo: primary?.email ?? '',
    direccionFacturacion: company.billingAddress,
    nota: company.billingNotes || primary?.notes || '',
    envioFacturacion: '',
    tarifa: company.tarifa,
    routingType: company.routingType,
    businessName: company.businessName,
    billingContacts: company.billingContacts,
  }
}

export async function getCompanies() {
  const data = await request()
  const list = Array.isArray(data) ? data : (data?.data ?? [])
  return (Array.isArray(list) ? list : []).map(normalizeCompany).filter(Boolean)
}

export async function createCompany(company) {
  const data = await request('', {
    method: 'POST',
    body: JSON.stringify(toApiPayload(company)),
  })
  return normalizeCompany(data?.company ?? data)
}

function toUpdatePayload(data = {}) {
  const routingType = String(data.routingType ?? '').trim()

  const payload = {
    legalName: data.legalName ?? '',
    businessName: data.businessName ?? null,
    billingAddress: data.billingAddress ?? null,
    billingNotes: data.billingNotes ?? null,
    billingContactName: data.billingContactName ?? null,
    billingContactEmail: data.billingContactEmail ?? null,
    routingType: routingType || null,
  }
  if (data.billingContactNotes) {
    payload.billingContactNotes = data.billingContactNotes
  }
  return payload
}

export async function updateCompany(id, data) {
  const response = await request(`/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(toUpdatePayload(data)),
  })
  return normalizeCompany(response)
}

export async function updateCompanyRate(routingType, data) {
  const body = {
    ...data,
    routingType: routingType ?? data?.routingType ?? null,
  }
  const response = await request(`/rate/${encodeURIComponent(routingType ?? '')}`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return response
}

export async function getRates(routingType) {
  const fallback = routingType ?? 'ROUTE'
  const data = await request(`/rate/${encodeURIComponent(fallback)}`)
  const resultType = data?.routingType ?? fallback
  const rawRates = data?.companyRate ?? data?.data ?? data
  const list = Array.isArray(rawRates)
    ? rawRates
    : rawRates && typeof rawRates === 'object'
      ? [rawRates]
      : []
  return {
    routingType: resultType,
    rates: (Array.isArray(list) ? list : []).map((rate) =>
      normalizeRate(rate, resultType),
    ),
  }
}

export function toRoutePayload(route = {}) {
  const notes = String(route.notes ?? route.observaciones ?? '').trim()

  return {
    routeDate: route.routeDate ?? route.fecha ?? '',
    destinationCity: String(route.destinationCity ?? route.city ?? '').trim(),
    vehicleKmStart: Number(route.vehicleKmStart ?? route.kmInicial ?? 0) || 0,
    vehicleKmEnd:
      route.vehicleKmEnd == null && route.kmFinal == null
        ? null
        : Number(route.vehicleKmEnd ?? route.kmFinal),
    notes: notes || null,
    companies: (route.companies ?? route.empresas ?? []).map((entry) => ({
      companyId: entry.companyId ?? '',
      packagesReceived: Number(entry.packagesReceived ?? entry.paquetes ?? 0) || 0,
      packagesUndelivered:
        Number(entry.packagesUndelivered ?? entry.noEntregados ?? 0) || 0,
      routingType: entry.routingType ?? null,
      rateAmount:
        entry.rateAmount == null ? null : Number(entry.rateAmount),
      ...(entry.routingType === 'ROUTE'
        ? {
            routeRateAmount:
              entry.routeRateAmount == null
                ? null
                : Number(entry.routeRateAmount),
            routeRateId: entry.routeRateId ?? null,
            routeTypeId: entry.routeTypeId ?? null,
          }
        : {
            packageAmount:
              entry.packageAmount == null
                ? null
                : Number(entry.packageAmount),
            companyRateId: entry.companyRateId ?? null,
          }),
    })),
  }
}

export async function createRoute(route) {
  return send('/routes', {
    method: 'POST',
    body: JSON.stringify(toRoutePayload(route)),
  })
}

export async function getRoutesMonth() {
  const data = await send('/routes/month')
  const routes = Array.isArray(data) ? data : (data?.data ?? [])

  return (Array.isArray(routes) ? routes : []).map((route) => {
    const id = route.route_company_id ?? route.routeCompanyId ?? route.id
    const companyName =
      route.legal_name ?? route.legalName ?? route.companyName ?? route.name ?? ''

    return {
      id,
      routeCode: route.route_code ?? route.routeCode ?? 'Ruta',
      fecha: route.route_date ?? route.routeDate ?? '',
      city: route.destination_city ?? route.destinationCity ?? '',
      kmInicial: Number(route.vehicle_km_start ?? route.vehicleKmStart ?? 0),
      kmFinal: Number(
        route.coalesce ?? route.vehicle_km_end ?? route.vehicleKmEnd ?? 0,
      ),
      rateAmount:
        route.rate_amount == null && route.rateAmount == null
          ? null
          : Number(route.rate_amount ?? route.rateAmount),
      empresas: [
        {
          key: id,
          companyId:
            route.company_id ?? route.companyId ?? companyName,
          companyName,
          routingType:
            route.company_routing_type ?? route.companyRoutingType ?? '',
          routeTypeCode: route.route_type_code ?? route.routeTypeCode ?? '',
          routeTypeName: route.route_type_name ?? route.routeTypeName ?? '',
          paquetes: Number(
            route.packages_received ?? route.packagesReceived ?? 0,
          ),
          noEntregados: Number(
            route.packages_undelivered ?? route.packagesUndelivered ?? 0,
          ),
        },
      ],
    }
  })
}

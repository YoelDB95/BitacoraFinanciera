import { ENVIO_FACTURACION_LABELS } from './work.js'

const API_BASE = (import.meta.env?.VITE_API_URL ?? '/api').replace(/\/+$/, '')

async function request(path = '', options = {}) {
  let response

  try {
    response = await fetch(`${API_BASE}/companies${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor.')
  }

  if (!response.ok) {
    let message = `Error ${response.status}`
    try {
      const body = await response.json()
      if (body?.error) message = body.error
    } catch {
      // respuesta sin JSON: se conserva el mensaje genérico
    }
    throw new Error(message)
  }

  if (response.status === 204) return null

  try {
    return await response.json()
  } catch {
    return null
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
    ).map((rate) => ({
      routeTypeId: rate.route_type_id ?? rate.routeTypeId ?? '',
      routingType: rate.routingType ?? rate.route_type_id ?? rate.routeTypeId ?? '',
      code: rate.code ?? '',
      name: rate.name ?? '',
      routeRateId: rate.route_rate_id ?? rate.routeRateId ?? rate.rateId ?? '',
      amount: Number(rate.amount ?? 0),
      validFrom: rate.valid_from ?? rate.validFrom ?? null,
      validTo: rate.valid_to ?? rate.validTo ?? null,
    })),
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
  const payload = {
    legalName: data.legalName ?? '',
    businessName: data.businessName ?? null,
    billingAddress: data.billingAddress ?? null,
    billingNotes: data.billingNotes ?? null,
    billingContactName: data.billingContactName ?? null,
    billingContactEmail: data.billingContactEmail ?? null,
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
  const response = await request(`/rate/${encodeURIComponent(routingType ?? '')}`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response
}

export async function getRates() {
  const data = await request('/rate')
  const list = Array.isArray(data) ? data : (data?.data ?? [])
  return (Array.isArray(list) ? list : []).map((rate) => ({
    routeTypeId: rate.route_type_id ?? rate.routeTypeId ?? '',
    routingType: rate.routingType ?? rate.route_type_id ?? rate.routeTypeId ?? '',
    code: rate.code ?? '',
    name: rate.name ?? '',
    routeRateId: rate.route_rate_id ?? rate.routeRateId ?? rate.rateId ?? '',
    amount: Number(rate.amount ?? 0),
    validFrom: rate.valid_from ?? rate.validFrom ?? null,
    validTo: rate.valid_to ?? rate.validTo ?? null,
  }))
}

import { ENVIO_FACTURACION_LABELS } from './work.js'

const API_BASE = import.meta.env?.VITE_API_URL ?? 'http://localhost:3000/api'

async function request(path = '', options) {
  const response = await fetch(`${API_BASE}/companies${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    throw new Error(
      `Error ${response.status} al llamar a ${API_BASE}/companies${path}`,
    )
  }

  if (response.status === 204) return null
  return response.json()
}

function buildNotes(company) {
  if (company.nota && company.envioFacturacion) {
    return `${company.nota} - ${ENVIO_FACTURACION_LABELS[company.envioFacturacion]}`
  }

  if (company.nota) return company.nota
  if (company.envioFacturacion) return ENVIO_FACTURACION_LABELS[company.envioFacturacion]
  return ''
}

export function toApiPayload(company) {
  return {
    cuit: String(company.cuit ?? '').replace(/\D/g, ''),
    legalName: company.nombre ?? '',
    address: company.direccionFacturacion ?? '',
    billingContactName: company.nombre ?? '',
    billingContactEmail: company.correo ?? '',
    billingContactNotes: buildNotes(company),
  }
}

export async function getCompanies() {
  const data = await request()
  return Array.isArray(data) ? data : (data?.data ?? [])
}

export async function createCompany(company) {
  return request('', {
    method: 'POST',
    body: JSON.stringify(toApiPayload(company)),
  })
}

export function fromApiCompany(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id: raw.id ?? raw._id,
    nombre: raw.legalName ?? raw.name ?? '',
    cuit: raw.cuit ?? '',
    correo: raw.billingContactEmail ?? raw.email ?? '',
    direccionFacturacion: raw.address ?? '',
    nota: raw.billingContactNotes ?? '',
    envioFacturacion: '',
  }
}
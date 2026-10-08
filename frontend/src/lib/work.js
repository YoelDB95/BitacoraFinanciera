import { toInputDate } from './format.js'

function daysAgo(offset) {
  const date = new Date()
  date.setDate(date.getDate() - offset)
  return toInputDate(date)
}

export const ROUTE_OPTIONS = [
  'RT-101',
  'RT-102',
  'RT-103',
  'RT-104',
  'RT-105',
  'RT-106',
  'RT-107',
]

export const CITY_OPTIONS = [
  'Monterrey',
  'Guadalupe',
  'Saltillo',
  'Mérida',
  'Cancún',
  'Puebla',
  'Atlixco',
  'Toluca',
  'Naucalpan',
]

export const COMPANIES = [
  {
    id: 'emp-andina',
    nombre: 'Paquetería Andina',
    contacto: 'Laura Mendoza',
    telefono: '55 4123 8890',
    rfc: 'PAA230415KJ2',
    zonas: ['Norte', 'Centro'],
    color: '#6366f1',
    tarifa: 90,
  },
  {
    id: 'emp-roble',
    nombre: 'Distribuidora El Roble',
    contacto: 'Carlos Nava',
    telefono: '55 3390 1174',
    rfc: 'DER190822H45',
    zonas: ['Oriente', 'Sur'],
    color: '#22c55e',
    tarifa: 90,
  },
  {
    id: 'emp-sanmiguel',
    nombre: 'Farmacias San Miguel',
    contacto: 'Ana Duarte',
    telefono: '55 6745 2201',
    rfc: 'FSM150107PL8',
    zonas: ['Centro', 'Valle'],
    color: '#f59e0b',
    tarifa: 74,
  },
  {
    id: 'emp-tornillo',
    nombre: 'Ferretera El Tornillo',
    contacto: 'Jorge Prado',
    telefono: '55 2018 4436',
    rfc: 'FET210519MM3',
    zonas: ['Poniente'],
    color: '#a855f7',
    tarifa: 125,
  },
]

export const COMPANY_INDEX = COMPANIES.reduce((acc, company) => {
  acc[company.id] = company
  return acc
}, {})

export const ENVIO_FACTURACION_OPTIONS = [
  { value: 'correo', label: 'Correo electrónico' },
  { value: 'domicilio', label: 'Dirección de facturación' },
  { value: 'personal', label: 'Entrega personal' },
]

export const ENVIO_FACTURACION_LABELS = ENVIO_FACTURACION_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option.label
    return acc
  },
  {},
)

const ROUTE_SEED = [
  {
    d: 1,
    code: 'RT-101',
    city: 'Monterrey',
    kmInicial: 108500,
    kmFinal: 108548,
    empresas: [
      { companyId: 'emp-andina', paquetes: 34 },
      { companyId: 'emp-roble', paquetes: 12 },
    ],
  },
  {
    d: 2,
    code: 'RT-104',
    city: 'Guadalupe',
    kmInicial: 108548,
    kmFinal: 108615,
    empresas: [
      { companyId: 'emp-andina', paquetes: 28 },
      { companyId: 'emp-tornillo', paquetes: 7 },
    ],
  },
  {
    d: 3,
    code: 'RT-102',
    city: 'Mérida',
    kmInicial: 108615,
    kmFinal: 108667,
    empresas: [{ companyId: 'emp-sanmiguel', paquetes: 27, noEntregados: 1 }],
  },
  {
    d: 5,
    code: 'RT-105',
    city: 'Cancún',
    kmInicial: 108667,
    kmFinal: 108735,
    empresas: [{ companyId: 'emp-roble', paquetes: 41, noEntregados: 2 }],
  },
  {
    d: 8,
    code: 'RT-103',
    city: 'Saltillo',
    kmInicial: 108735,
    kmFinal: 108789,
    empresas: [
      { companyId: 'emp-andina', paquetes: 22 },
      { companyId: 'emp-sanmiguel', paquetes: 15 },
    ],
  },
  {
    d: 11,
    code: 'RT-106',
    city: 'Puebla',
    kmInicial: 108789,
    kmFinal: 108846,
    empresas: [{ companyId: 'emp-tornillo', paquetes: 19, noEntregados: 2 }],
  },
  {
    d: 14,
    code: 'RT-102',
    city: 'Atlixco',
    kmInicial: 108846,
    kmFinal: 108909,
    empresas: [{ companyId: 'emp-roble', paquetes: 35, noEntregados: 1 }],
  },
  {
    d: 18,
    code: 'RT-101',
    city: 'Toluca',
    kmInicial: 108909,
    kmFinal: 108973,
    empresas: [
      { companyId: 'emp-sanmiguel', paquetes: 18 },
      { companyId: 'emp-andina', paquetes: 26 },
    ],
  },
  {
    d: 22,
    code: 'RT-105',
    city: 'Naucalpan',
    kmInicial: 108973,
    kmFinal: 109021,
    empresas: [{ companyId: 'emp-tornillo', paquetes: 11, noEntregados: 1 }],
  },
  {
    d: 27,
    code: 'RT-107',
    city: 'Monterrey',
    kmInicial: 109021,
    kmFinal: 109086,
    empresas: [
      { companyId: 'emp-roble', paquetes: 39 },
      { companyId: 'emp-andina', paquetes: 17 },
    ],
  },
  {
    d: 33,
    code: 'RT-104',
    city: 'Puebla',
    kmInicial: 109086,
    kmFinal: 109139,
    empresas: [{ companyId: 'emp-sanmiguel', paquetes: 23, noEntregados: 1 }],
  },
  {
    d: 41,
    code: 'RT-103',
    city: 'Cancún',
    kmInicial: 109139,
    kmFinal: 109213,
    empresas: [
      { companyId: 'emp-tornillo', paquetes: 14 },
      { companyId: 'emp-roble', paquetes: 31 },
    ],
  },
]

const INVOICE_SEED = [
  { n: 1, d: 12, e: 'emp-roble', monto: 9650 },
  { n: 2, d: 26, e: 'emp-andina', monto: 6410 },
  { n: 3, d: 45, e: 'emp-sanmiguel', monto: 4020 },
]

export const ROUTES = ROUTE_SEED.map((item, index) => ({
  id: `ruta-${index + 1}`,
  fecha: daysAgo(item.d),
  routeCode: item.code,
  city: item.city,
  kmInicial: item.kmInicial,
  kmFinal: item.kmFinal,
  observaciones: '',
  empresas: item.empresas.map((entry, i) => ({
    key: `r-${index + 1}-${i}`,
    ...entry,
  })),
}))

export function routeKm(route) {
  const calc = Number(route.kmCalculado)
  if (Number.isFinite(calc) && calc > 0) return calc
  return Math.max(0, (Number(route.kmFinal) || 0) - (Number(route.kmInicial) || 0))
}

export const INVOICES = INVOICE_SEED.map((item) => ({
  id: `fac-${item.n}`,
  numero: `FAC-${new Date().getFullYear()}-${String(item.n).padStart(3, '0')}`,
  fecha: daysAgo(item.d),
  empresaId: item.e,
  monto: item.monto,
}))

export const RANGE_PRESETS = [
  { value: '7', label: '7 días' },
  { value: '30', label: '30 días' },
  { value: '90', label: '90 días' },
  { value: 'mes', label: 'Este mes' },
  { value: 'custom', label: 'Personalizado' },
]

export function resolvePreset(preset) {
  const now = new Date()

  if (preset === 'mes') {
    const first = new Date(now.getFullYear(), now.getMonth(), 1)
    return { from: toInputDate(first), to: toInputDate(now) }
  }

  const days = Number.parseInt(preset, 10) || 30
  return { from: daysAgo(days - 1), to: toInputDate(now) }
}

export function filterByPeriod(items, range) {
  return items.filter((item) => item.fecha >= range.from && item.fecha <= range.to)
}

export function summarize(routes, companies = COMPANIES) {
  const index = companies.reduce((acc, company) => {
    acc[company.id] = company
    return acc
  }, {})
  return routes.reduce(
    (acc, route) => {
      acc.km += routeKm(route)
      acc.rutas += 1
      for (const entry of route.empresas ?? []) {
        const company = index[entry.companyId]
        const paquetes = Number(entry.paquetes) || 0
        acc.entregados += paquetes
        acc.noEntregados += Number(entry.noEntregados) || 0
        acc.monto += paquetes * (company?.tarifa ?? 0)
      }
      return acc
    },
    { km: 0, monto: 0, entregados: 0, noEntregados: 0, rutas: 0 },
  )
}

export function summarizeByCompany(routes, companies = COMPANIES) {
  const index = companies.reduce((acc, company) => {
    acc[company.id] = company
    return acc
  }, {})
  return companies.map((company) => {
    const own = routes.filter((route) =>
      (route.empresas ?? []).some((entry) => entry.companyId === company.id),
    )
    const stats = own.reduce(
      (acc, route) => {
        acc.km += routeKm(route)
        acc.rutas += 1
        const entry = (route.empresas ?? []).find(
          (item) => item.companyId === company.id,
        )
        const paquetes = Number(entry?.paquetes) || 0
        acc.entregados += paquetes
        acc.noEntregados += Number(entry?.noEntregados) || 0
        acc.monto += paquetes * (index[company.id]?.tarifa ?? 0)
        return acc
      },
      { km: 0, monto: 0, entregados: 0, noEntregados: 0, rutas: 0 },
    )
    return { company, ...stats }
  })
}
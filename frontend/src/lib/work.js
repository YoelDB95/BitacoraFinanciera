import { toInputDate } from './format.js'

function daysAgo(offset) {
  const date = new Date()
  date.setDate(date.getDate() - offset)
  return toInputDate(date)
}

export const ROUTE_TYPES = [
  { label: 'PNU', aliases: ['pnu', 'rt-101'] },
  {
    label: 'Ruta A',
    aliases: ['a', 'ruta a', 'ruta-a', 'ruta_a', 'rt-102', 'rt-107'],
  },
  { label: 'Ruta B', aliases: ['b', 'ruta b', 'ruta-b', 'ruta_b', 'rt-103'] },
  { label: 'Ruta C', aliases: ['c', 'ruta c', 'ruta-c', 'ruta_c', 'rt-104'] },
  { label: 'Ruta D', aliases: ['d', 'ruta d', 'ruta-d', 'ruta_d', 'rt-105'] },
  { label: 'Ruta E', aliases: ['e', 'ruta e', 'ruta-e', 'ruta_e', 'rt-106'] },
]

export const ROUTE_OPTIONS = ROUTE_TYPES.map((type) => type.label)

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
  {value: 'watsapp', label: 'WhatsApp'},
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

export function routeAmount(route) {
  const billing = route?.billingAmount
  if (billing != null && Number.isFinite(Number(billing))) {
    return Number(billing)
  }

  const rate = route?.rateAmount
  if (rate != null && Number.isFinite(Number(rate))) {
    return Number(rate)
  }

  return null
}

function routeKey(route) {
  return route?.routeId || route?.id || route?.routeCompanyId
}

export function summarize(routes = [], companies = COMPANIES) {
  const index = companies.reduce((acc, company) => {
    acc[company.id] = company
    return acc
  }, {})
  const seenRoutes = new Set()
  const companyIds = new Set()

  const totals = routes.reduce(
    (acc, route) => {
      const key = routeKey(route)
      if (key && !seenRoutes.has(key)) {
        seenRoutes.add(key)
        acc.km += routeKm(route)
        acc.rutas += 1
      }

      const amount = routeAmount(route)
      const entries = route.empresas ?? []

      if (amount != null) {
        acc.monto += amount
      } else {
        for (const entry of entries) {
          const paquetes = Number(entry.paquetes) || 0
          acc.monto += paquetes * (index[entry.companyId]?.tarifa ?? 0)
        }
      }

      for (const entry of entries) {
        if (entry.companyId) companyIds.add(entry.companyId)
        acc.entregados += Number(entry.paquetes) || 0
        acc.noEntregados += Number(entry.noEntregados) || 0
      }

      return acc
    },
    { km: 0, monto: 0, entregados: 0, noEntregados: 0, rutas: 0 },
  )

  return { ...totals, empresas: companyIds.size }
}

function normalizeRouteType(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!normalized) return null

  const match = ROUTE_TYPES.find(
    (type) =>
      type.aliases.includes(normalized) ||
      type.label.toLowerCase() === normalized,
  )
  return match ? match.label : null
}

export function classifyRouteType(routeOrEntry) {
  const entry = routeOrEntry?.empresas?.[0] ?? routeOrEntry

  return (
    normalizeRouteType(entry?.routeTypeName) ??
    normalizeRouteType(entry?.routeTypeCode) ??
    normalizeRouteType(entry?.routeCode)
  )
}

export function countRoutesByType(routes = [], types = ROUTE_TYPES) {
  const counts = new Map(types.map((type) => [type.label, 0]))

  for (const route of routes) {
    const label = classifyRouteType(route)
    if (label && counts.has(label)) {
      counts.set(label, counts.get(label) + 1)
    }
  }

  return types.map((type) => ({
    label: type.label,
    total: counts.get(type.label) ?? 0,
  }))
}

export function countRoutesByTypeForCompany(
  routes = [],
  companyId,
  types = ROUTE_TYPES,
  routingType = 'PACKAGE',
) {
  const counts = new Map(types.map((type) => [type.label, 0]))
  const seenRoutes = new Set()
  const targetType = String(routingType).toUpperCase()

  // El tipo de ruta puede estar guardado en la fila de otra empresa de la
  // misma ruta (por ejemplo, la empresa ROUTE que eligió la tarifa).
  const routeTypes = new Map()
  for (const route of routes) {
    const key = routeKey(route)
    if (!key || routeTypes.has(key)) continue

    for (const entry of route.empresas ?? []) {
      const label = classifyRouteType(entry)
      if (label) {
        routeTypes.set(key, label)
        break
      }
    }
  }

  for (const route of routes) {
    const key = routeKey(route)
    if (key && seenRoutes.has(key)) continue

    const entry = (route.empresas ?? []).find(
      (item) => item.companyId === companyId,
    )
    if (!entry || String(entry.routingType).toUpperCase() !== targetType) {
      continue
    }

    const label =
      classifyRouteType(entry) ?? (key ? routeTypes.get(key) : null)
    if (!label || !counts.has(label)) continue

    if (key) seenRoutes.add(key)
    counts.set(label, counts.get(label) + 1)
  }

  return types.map((type) => ({
    label: type.label,
    total: counts.get(type.label) ?? 0,
  }))
}

export function routeCompanyCards(
  routes = [],
  companies = [],
  routingType = 'ROUTE',
) {
  const targetType = String(routingType).toUpperCase()

  return companies
    .filter(
      (company) => String(company.routingType).toUpperCase() === targetType,
    )
    .map((company) => {
      const counts = countRoutesByTypeForCompany(
        routes,
        company.id,
        ROUTE_TYPES,
        targetType,
      )
      const total = counts.reduce((sum, item) => sum + item.total, 0)

      return {
        company,
        data: counts.filter((item) => item.total > 0),
        total,
      }
    })
    .filter((row) => row.total > 0)
    .sort((a, b) =>
      (a.company.legalName ?? a.company.nombre ?? '').localeCompare(
        b.company.legalName ?? b.company.nombre ?? '',
      ),
    )
}

export function summarizeByCompany(routes = [], companies = COMPANIES) {
  const index = companies.reduce((acc, company) => {
    acc[company.id] = company
    return acc
  }, {})

  return companies.map((company) => {
    const own = routes.filter((route) =>
      (route.empresas ?? []).some((entry) => entry.companyId === company.id),
    )
    const seenRoutes = new Set()
    const stats = { km: 0, monto: 0, entregados: 0, noEntregados: 0, rutas: 0 }

    for (const route of own) {
      const key = routeKey(route)
      if (key && !seenRoutes.has(key)) {
        seenRoutes.add(key)
        stats.km += routeKm(route)
        stats.rutas += 1
      }

      const amount = routeAmount(route)
      for (const entry of route.empresas ?? []) {
        if (entry.companyId !== company.id) continue

        const paquetes = Number(entry.paquetes) || 0
        stats.entregados += paquetes
        stats.noEntregados += Number(entry.noEntregados) || 0
        stats.monto +=
          amount != null
            ? amount
            : paquetes * (index[company.id]?.tarifa ?? 0)
      }
    }

    return { company, ...stats }
  })
}
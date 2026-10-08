const STORAGE_KEY = 'bitacora.rutas.v1'

export const SEED_COMPANIES = [
  { id: 'co-1', name: 'Transportes del Norte' },
  { id: 'co-2', name: 'Logística Peninsular' },
  { id: 'co-3', name: 'Envíos Rápidos MX' },
  { id: 'co-4', name: 'Distribuidora Aurora' },
]

const SEED_ROUTES = [
  {
    id: 'rt-1',
    routeCode: 'RT-101',
    companyId: 'co-1',
    date: '2026-10-01',
    city: 'Monterrey',
    packagesDelivered: 120,
    packagesUndelivered: 4,
    rate: 850,
  },
  {
    id: 'rt-2',
    routeCode: 'RT-102',
    companyId: 'co-1',
    date: '2026-10-02',
    city: 'Guadalupe',
    packagesDelivered: 98,
    packagesUndelivered: 0,
    rate: 720,
  },
  {
    id: 'rt-3',
    routeCode: 'RT-103',
    companyId: 'co-2',
    date: '2026-10-02',
    city: 'Mérida',
    packagesDelivered: 145,
    packagesUndelivered: 7,
    rate: 1250,
  },
  {
    id: 'rt-4',
    routeCode: 'RT-104',
    companyId: 'co-3',
    date: '2026-10-03',
    city: 'Puebla',
    packagesDelivered: 76,
    packagesUndelivered: 2,
    rate: 540,
  },
  {
    id: 'rt-5',
    routeCode: 'RT-105',
    companyId: 'co-1',
    date: '2026-10-05',
    city: 'Saltillo',
    packagesDelivered: 132,
    packagesUndelivered: 5,
    rate: 910,
  },
  {
    id: 'rt-6',
    routeCode: 'RT-106',
    companyId: 'co-4',
    date: '2026-10-06',
    city: 'Toluca',
    packagesDelivered: 210,
    packagesUndelivered: 12,
    rate: 1680,
  },
  {
    id: 'rt-7',
    routeCode: 'RT-107',
    companyId: 'co-2',
    date: '2026-10-07',
    city: 'Cancún',
    packagesDelivered: 88,
    packagesUndelivered: 1,
    rate: 660,
  },
  {
    id: 'rt-8',
    routeCode: 'RT-108',
    companyId: 'co-3',
    date: '2026-10-08',
    city: 'Atlixco',
    packagesDelivered: 154,
    packagesUndelivered: 3,
    rate: 1120,
  },
  {
    id: 'rt-9',
    routeCode: 'RT-109',
    companyId: 'co-4',
    date: '2026-10-09',
    city: 'Naucalpan',
    packagesDelivered: 178,
    packagesUndelivered: 9,
    rate: 1430,
  },
]

export function loadRoutes() {
  if (typeof window === 'undefined') return SEED_ROUTES

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return SEED_ROUTES
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : SEED_ROUTES
  } catch {
    return SEED_ROUTES
  }
}

export function saveRoutes(routes) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(routes))
  } catch {
    // storage unavailable — keep state in memory only
  }
}

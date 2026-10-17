import { ROUTES } from './work.js'

const STORAGE_KEY = 'bitacora.rutas.v2'

export const SEED_ROUTES = ROUTES

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
    // almacenamiento no disponible: se conserva solo en memoria
  }
}

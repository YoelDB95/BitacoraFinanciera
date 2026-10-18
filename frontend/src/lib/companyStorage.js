const STORAGE_KEY = 'bitacora.empresas.v1'

export function loadCompanies() {
  if (typeof window === 'undefined') return []

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveCompanies(companies) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(companies))
  } catch {
    // almacenamiento no disponible: se conserva solo en memoria
  }
}

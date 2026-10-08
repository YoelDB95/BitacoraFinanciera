import { COMPANIES as SEED_COMPANIES } from './work.js'

const STORAGE_KEY = 'bitacora.empresas.v1'

export function loadCompanies() {
  if (typeof window === 'undefined') return SEED_COMPANIES

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return SEED_COMPANIES
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : SEED_COMPANIES
  } catch {
    return SEED_COMPANIES
  }
}

export function saveCompanies(companies) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(companies))
  } catch {
    // storage unavailable — keep state in memory only
  }
}
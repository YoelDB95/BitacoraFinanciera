import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadCompanies, saveCompanies } from '../lib/companyStorage.js'
import {
  createCompany as createCompanyRequest,
  getCompanies as getCompaniesRequest,
  fromApiCompany,
} from '../lib/api.js'
import { CompaniesContext } from './CompaniesContext.js'

const COMPANY_COLORS = [
  '#6366f1',
  '#22c55e',
  '#f59e0b',
  '#a855f7',
  '#ec4899',
  '#06b6d4',
  '#f97316',
  '#10b981',
]

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `emp-${crypto.randomUUID()}`
  }
  return `emp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function withDefaults(company, index) {
  return {
    id: company.id || createId(),
    nombre: company.nombre ?? '',
    cuit: company.cuit ?? '',
    correo: company.correo ?? '',
    direccionFacturacion: company.direccionFacturacion ?? '',
    nota: company.nota ?? '',
    envioFacturacion: company.envioFacturacion ?? '',
    zonas: company.zonas ?? [],
    tarifa: company.tarifa ?? 0,
    color: company.color ?? COMPANY_COLORS[index % COMPANY_COLORS.length],
  }
}

export function CompaniesProvider({ children }) {
  const [companies, setCompanies] = useState(loadCompanies)

  useEffect(() => {
    saveCompanies(companies)
  }, [companies])

  useEffect(() => {
    let active = true
    getCompaniesRequest()
      .then((list) => {
        if (!active) return
        const mapped = list
          .map(fromApiCompany)
          .filter(Boolean)
          .map(withDefaults)
        if (mapped.length > 0) setCompanies(mapped)
      })
      .catch(() => {
        // backend no disponible — se mantienen los datos locales
      })
    return () => {
      active = false
    }
  }, [])

  const addCompany = useCallback(
    async (data) => {
      const local = withDefaults(
        { id: createId(), ...data },
        companies.length,
      )
      setCompanies((current) => [local, ...current])

      try {
        const created = fromApiCompany(await createCompanyRequest(local))
        if (created) {
          const normalized = withDefaults(
            { ...local, ...created },
            companies.length,
          )
          setCompanies((current) =>
            current.map((item) => (item.id === local.id ? normalized : item)),
          )
          return normalized
        }
      } catch {
        // sin backend — queda la empresa local
      }
      return local
    },
    [companies.length],
  )

  const companyIndex = useMemo(() => {
    return companies.reduce((acc, company) => {
      acc[company.id] = company
      return acc
    }, {})
  }, [companies])

  const value = useMemo(
    () => ({
      companies,
      companyIndex,
      addCompany,
    }),
    [companies, companyIndex, addCompany],
  )

  return (
    <CompaniesContext.Provider value={value}>
      {children}
    </CompaniesContext.Provider>
  )
}
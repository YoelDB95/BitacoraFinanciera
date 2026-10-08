import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadRoutes, saveRoutes, SEED_COMPANIES } from '../lib/routeStorage.js'
import { RoutesContext } from './RoutesContext.js'

export function RoutesProvider({ children }) {
  const [routes, setRoutes] = useState(loadRoutes)

  useEffect(() => {
    saveRoutes(routes)
  }, [routes])

  const updateRoute = useCallback((id, changes) => {
    setRoutes((current) =>
      current.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    )
  }, [])

  const removeRoute = useCallback((id) => {
    setRoutes((current) => current.filter((item) => item.id !== id))
  }, [])

  const companies = useMemo(() => SEED_COMPANIES, [])

  const companyIndex = useMemo(() => {
    return companies.reduce((acc, company) => {
      acc[company.id] = company
      return acc
    }, {})
  }, [companies])

  const value = useMemo(
    () => ({
      routes,
      companies,
      companyIndex,
      updateRoute,
      removeRoute,
    }),
    [routes, companies, companyIndex, updateRoute, removeRoute],
  )

  return (
    <RoutesContext.Provider value={value}>{children}</RoutesContext.Provider>
  )
}

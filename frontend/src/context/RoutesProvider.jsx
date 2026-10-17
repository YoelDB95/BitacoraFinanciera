import { useCallback, useEffect, useState } from 'react'
import { loadRoutes, saveRoutes } from '../lib/routeStorage.js'
import { RoutesContext } from './RoutesContext.js'

function createRouteId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `rt-${crypto.randomUUID()}`
  }
  return `rt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function RoutesProvider({ children }) {
  const [routes, setRoutes] = useState(loadRoutes)

  useEffect(() => {
    saveRoutes(routes)
  }, [routes])

  const addRoute = useCallback((route) => {
    const id = route.id ?? createRouteId()
    setRoutes((current) => [{ ...route, id }, ...current])
    return id
  }, [])

  const removeRoute = useCallback((id) => {
    setRoutes((current) => current.filter((item) => item.id !== id))
  }, [])

  return (
    <RoutesContext.Provider value={{ routes, addRoute, removeRoute }}>
      {children}
    </RoutesContext.Provider>
  )
}

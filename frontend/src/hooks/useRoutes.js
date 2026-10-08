import { useContext } from 'react'
import { RoutesContext } from '../context/RoutesContext.js'

export function useRoutes() {
  const context = useContext(RoutesContext)
  if (!context) {
    throw new Error('useRoutes debe usarse dentro de <RoutesProvider>')
  }
  return context
}

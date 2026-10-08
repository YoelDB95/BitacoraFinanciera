import { useContext } from 'react'
import { CompaniesContext } from '../context/CompaniesContext.js'

export function useCompanies() {
  const context = useContext(CompaniesContext)
  if (!context) {
    throw new Error('useCompanies debe usarse dentro de <CompaniesProvider>')
  }
  return context
}
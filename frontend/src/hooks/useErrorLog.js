import { useContext } from 'react'
import { ErrorLogContext } from '../context/ErrorLogContext.js'

export function useErrorLog() {
  const context = useContext(ErrorLogContext)
  if (!context) {
    throw new Error('useErrorLog debe usarse dentro de ErrorLogProvider.')
  }
  return context
}

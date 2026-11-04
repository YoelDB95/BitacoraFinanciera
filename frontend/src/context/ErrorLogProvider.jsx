import { useCallback, useEffect, useMemo, useState } from 'react'
import { normalizeError } from '../lib/errors.js'
import { ErrorLogContext } from './ErrorLogContext.js'

const MAX_ERRORS = 25

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `err-${crypto.randomUUID()}`
  }
  return `err-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function isIgnoredError(message) {
  const text = String(message ?? '')
  return (
    text.includes('ResizeObserver loop') ||
    text.includes('AbortError: The user aborted a request')
  )
}

export function ErrorLogProvider({ children }) {
  const [errors, setErrors] = useState([])
  const [open, setOpen] = useState(false)

  const reportError = useCallback((rawError, options = {}) => {
    const normalized = normalizeError(rawError, {
      source: options.source ?? 'frontend',
      kind: options.kind ?? 'runtime',
      context: options.context,
    })

    if (isIgnoredError(normalized.message)) return

    setErrors((current) => {
      const now = Date.now()
      const duplicate = current.find(
        (item) =>
          item.error.message === normalized.message &&
          now - item.createdAt < 8000,
      )

      if (duplicate) {
        return current.map((item) =>
          item.id === duplicate.id
            ? {
                ...item,
                count: item.count + 1,
                timestamp: normalized.timestamp,
                updatedAt: now,
              }
            : item,
        )
      }

      return [
        {
          id: createId(),
          error: normalized,
          context: options.context ?? null,
          timestamp: normalized.timestamp,
          createdAt: now,
          count: 1,
        },
        ...current,
      ].slice(0, MAX_ERRORS)
    })
  }, [])

  useEffect(() => {
    const handleError = (event) => {
      if (!event.error && !event.message) return
      const context = {
        archivo: event.filename || undefined,
        linea: event.lineno || undefined,
        columna: event.colno || undefined,
      }
      reportError(event.error ?? event.message, {
        source: 'frontend',
        kind: 'runtime',
        context,
      })
    }

    const handleRejection = (event) => {
      reportError(event.reason ?? 'Promesa rechazada sin motivo.', {
        source: 'frontend',
        kind: 'promise',
        context: { motivo: 'unhandledrejection' },
      })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [reportError])

  const clearErrors = useCallback(() => setErrors([]), [])
  const removeError = useCallback(
    (id) => setErrors((current) => current.filter((item) => item.id !== id)),
    [],
  )
  const toggleOpen = useCallback(() => setOpen((value) => !value), [])
  const close = useCallback(() => setOpen(false), [])

  const value = useMemo(
    () => ({
      errors,
      open,
      setOpen,
      toggleOpen,
      close,
      reportError,
      clearErrors,
      removeError,
    }),
    [errors, open, toggleOpen, close, reportError, clearErrors, removeError],
  )

  return (
    <ErrorLogContext.Provider value={value}>
      {children}
    </ErrorLogContext.Provider>
  )
}

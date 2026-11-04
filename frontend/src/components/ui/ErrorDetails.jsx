import { useEffect, useMemo, useState } from 'react'
import Icon from './Icon.jsx'
import {
  formatErrorReport,
  getErrorFacts,
  getErrorPayload,
  normalizeError,
} from '../../lib/errors.js'

function stringify(value) {
  if (value == null) return ''
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export default function ErrorDetails({
  error,
  context,
  label = 'Ver detalles técnicos',
  defaultOpen = false,
  className = '',
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [copied, setCopied] = useState(false)
  const normalized = useMemo(() => normalizeError(error), [error])
  const facts = useMemo(() => getErrorFacts(normalized), [normalized])
  const payload = useMemo(() => getErrorPayload(normalized), [normalized])
  const contextText = useMemo(() => stringify(context), [context])

  useEffect(() => {
    if (!copied) return undefined
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  const handleCopy = async () => {
    const text = formatErrorReport(normalized, context)
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const hasContent =
    facts.length > 0 ||
    payload.length > 0 ||
    Boolean(contextText) ||
    Boolean(normalized.stack)

  if (!hasContent) return null

  return (
    <details
      className={`error-details${className ? ` ${className}` : ''}`}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="error-details__toggle">
        <Icon name="terminal" size={13} />
        <span>{label}</span>
        <Icon name="chevronDown" size={14} className="error-details__chevron" />
      </summary>

      <div className="error-details__body">
        <dl className="error-details__facts">
          {facts.map((fact) => (
            <div className="error-details__fact" key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>

        {payload.map((part) => (
          <div className="error-details__block" key={part.label}>
            <span className="error-details__block-title">{part.label}</span>
            <pre>{part.value}</pre>
          </div>
        ))}

        {contextText && (
          <div className="error-details__block">
            <span className="error-details__block-title">Contexto</span>
            <pre>{contextText}</pre>
          </div>
        )}

        {normalized.stack && (
          <div className="error-details__block">
            <span className="error-details__block-title">Stack</span>
            <pre>{normalized.stack}</pre>
          </div>
        )}

        <div className="error-details__actions">
          <button
            type="button"
            className="error-details__copy"
            onClick={handleCopy}
          >
            <Icon name={copied ? 'check' : 'copy'} size={13} />
            {copied ? 'Copiado' : 'Copiar diagnóstico'}
          </button>
        </div>
      </div>
    </details>
  )
}

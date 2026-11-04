import { useMemo } from 'react'
import Icon from './Icon.jsx'

function readMessage(value) {
  if (typeof value === 'string') return value.trim()
  if (value && typeof value.message === 'string') return value.message.trim()
  return ''
}

function collectMessages(errors) {
  if (!errors) return []

  const values = Array.isArray(errors) ? errors : Object.values(errors)
  const seen = new Set()
  const messages = []

  for (const value of values) {
    const message = readMessage(value)
    if (!message || seen.has(message)) continue
    seen.add(message)
    messages.push(message)
  }

  return messages
}

export default function FormErrors({
  errors,
  title = 'Revisá los datos del formulario',
  description,
  onDismiss,
  className = '',
}) {
  const messages = useMemo(() => collectMessages(errors), [errors])

  if (messages.length === 0) return null

  return (
    <div
      className={`error-notice error-notice--frontend form-errors${
        className ? ` ${className}` : ''
      }`}
      role="alert"
    >
      <span className="error-notice__glyph" aria-hidden="true">
        <Icon name="alert" size={17} />
      </span>

      <div className="error-notice__body">
        <div className="error-notice__heading">
          <span className="error-notice__origin error-notice__origin--frontend">
            Frontend
          </span>
          <span className="error-notice__status">Validación</span>
        </div>

        <p className="error-notice__title">{title}</p>
        {description ? (
          <p className="error-notice__message">{description}</p>
        ) : null}

        <ul className="form-errors__list">
          {messages.map((message) => (
            <li key={message} className="form-errors__item">
              <Icon name="alert" size={12} />
              <span>{message}</span>
            </li>
          ))}
        </ul>
      </div>

      {onDismiss ? (
        <button
          type="button"
          className="error-notice__close"
          onClick={onDismiss}
          aria-label="Cerrar errores de validación"
        >
          <Icon name="close" size={14} />
        </button>
      ) : null}
    </div>
  )
}

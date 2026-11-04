import { useMemo } from 'react'
import Icon from './Icon.jsx'
import ErrorDetails from './ErrorDetails.jsx'
import {
  getErrorHint,
  getErrorOrigin,
  getErrorTitle,
  normalizeError,
} from '../../lib/errors.js'

export default function ErrorNotice({
  error,
  title,
  hint,
  context,
  onRetry,
  retryLabel = 'Reintentar',
  onDismiss,
  details = true,
  compact = false,
  className = '',
}) {
  const normalized = useMemo(() => normalizeError(error), [error])
  const origin = getErrorOrigin(normalized)
  const heading = title ?? getErrorTitle(normalized)
  const hintText = hint === null ? '' : (hint ?? getErrorHint(normalized))

  if (!normalized) return null

  return (
    <div
      className={`error-notice error-notice--${origin.key}${
        compact ? ' error-notice--compact' : ''
      }${className ? ` ${className}` : ''}`}
      role="alert"
    >
      <span className="error-notice__glyph" aria-hidden="true">
        <Icon name={origin.icon} size={17} />
      </span>

      <div className="error-notice__body">
        <div className="error-notice__heading">
          <span className={`error-notice__origin error-notice__origin--${origin.key}`}>
            {origin.label}
          </span>
          {normalized.status ? (
            <span className="error-notice__status">
              HTTP {normalized.status}
            </span>
          ) : null}
          {normalized.code ? (
            <code className="error-notice__code">{normalized.code}</code>
          ) : null}
        </div>

        <p className="error-notice__title">{heading}</p>
        <p className="error-notice__message">{normalized.message}</p>

        {hintText && hintText !== normalized.message ? (
          <p className="error-notice__hint">
            <Icon name="alert" size={12} />
            <span>{hintText}</span>
          </p>
        ) : null}

        {details ? (
          <ErrorDetails error={normalized} context={context} />
        ) : null}

        {onRetry || onDismiss ? (
          <div className="error-notice__actions">
            {onRetry ? (
              <button
                type="button"
                className="error-notice__action"
                onClick={onRetry}
              >
                <Icon name="refresh" size={13} />
                {retryLabel}
              </button>
            ) : null}
            {onDismiss ? (
              <button
                type="button"
                className="error-notice__action error-notice__action--quiet"
                onClick={onDismiss}
              >
                Descartar
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {onDismiss ? (
        <button
          type="button"
          className="error-notice__close"
          onClick={onDismiss}
          aria-label="Cerrar error"
        >
          <Icon name="close" size={14} />
        </button>
      ) : null}
    </div>
  )
}

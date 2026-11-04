import { useMemo } from 'react'
import Icon from './Icon.jsx'
import ErrorDetails from './ErrorDetails.jsx'
import {
  getErrorHint,
  getErrorOrigin,
  getErrorTitle,
  normalizeError,
} from '../../lib/errors.js'

export default function ErrorState({
  error,
  title,
  description,
  hint,
  context,
  onRetry,
  retryLabel = 'Reintentar',
  action,
}) {
  const normalized = useMemo(() => normalizeError(error), [error])
  const origin = getErrorOrigin(normalized)
  const heading = title ?? getErrorTitle(normalized)
  const hintText = hint === null ? '' : (hint ?? getErrorHint(normalized))

  return (
    <div className={`card error-state error-state--${origin.key}`}>
      <div className="error-state__inner">
        <span className="error-state__art" aria-hidden="true">
          <Icon name={origin.icon} size={38} strokeWidth={1.4} />
        </span>

        <span className={`error-state__eyebrow error-state__eyebrow--${origin.key}`}>
          Error de {origin.label}
        </span>
        <h2 className="error-state__title">{heading}</h2>
        <p className="error-state__message">
          {description ?? normalized.message}
        </p>
        {hintText && hintText !== normalized.message ? (
          <p className="error-state__hint">{hintText}</p>
        ) : null}

        <ErrorDetails
          error={normalized}
          context={context}
          className="error-state__details"
        />

        {(onRetry || action) && (
          <div className="error-state__actions">
            {onRetry ? (
              <button
                type="button"
                className="button button--primary"
                onClick={onRetry}
              >
                <Icon name="refresh" size={16} />
                {retryLabel}
              </button>
            ) : null}
            {action}
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect } from 'react'
import Icon from './Icon.jsx'
import ErrorDetails from './ErrorDetails.jsx'
import { getErrorOrigin, getErrorTitle } from '../../lib/errors.js'
import { useErrorLog } from '../../hooks/useErrorLog.js'

function formatTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export default function ErrorCenter() {
  const { errors, open, toggleOpen, close, clearErrors, removeError } =
    useErrorLog()

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, close])

  if (errors.length === 0) return null

  return (
    <>
      <button
        type="button"
        className={`icon-button error-center__trigger${
          open ? ' error-center__trigger--open' : ''
        }`}
        onClick={toggleOpen}
        aria-label={`Ver registro de errores (${errors.length})`}
        aria-expanded={open}
      >
        <Icon name="bug" size={18} />
        <span className="error-center__count">
          {errors.length > 99 ? '99+' : errors.length}
        </span>
      </button>

      {open ? (
        <>
          <div
            className="error-center__backdrop"
            onClick={close}
            aria-hidden="true"
          />

          <aside
            className="error-center"
            role="dialog"
            aria-modal="true"
            aria-label="Registro de errores"
          >
            <header className="error-center__head">
              <div>
                <p className="error-center__eyebrow">Diagnóstico</p>
                <h2 className="error-center__title">Errores detectados</h2>
                <p className="error-center__desc">
                  {errors.length === 1
                    ? '1 error registrado en esta sesión.'
                    : `${errors.length} errores registrados en esta sesión.`}
                </p>
              </div>
              <button
                type="button"
                className="icon-button error-center__close"
                onClick={close}
                aria-label="Cerrar registro de errores"
              >
                <Icon name="close" size={16} />
              </button>
            </header>

            <div className="error-center__list">
              {errors.map((item) => {
                const origin = getErrorOrigin(item.error)
                return (
                  <article className="error-center__item" key={item.id}>
                    <div className="error-center__item-head">
                      <span
                        className={`error-center__origin error-center__origin--${origin.key}`}
                      >
                        {origin.label}
                      </span>
                      <time
                        className="error-center__time"
                        dateTime={item.timestamp}
                      >
                        {formatTime(item.timestamp)}
                      </time>
                      {item.count > 1 ? (
                        <span
                          className="error-center__repeat"
                          title={`Repetido ${item.count} veces`}
                        >
                          ×{item.count}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        className="error-center__remove"
                        onClick={() => removeError(item.id)}
                        aria-label="Quitar error del registro"
                      >
                        <Icon name="close" size={12} />
                      </button>
                    </div>

                    <h3 className="error-center__item-title">
                      {getErrorTitle(item.error)}
                    </h3>
                    <p className="error-center__item-message">
                      {item.error.message}
                    </p>
                    <ErrorDetails error={item.error} context={item.context} />
                  </article>
                )
              })}
            </div>

            <footer className="error-center__footer">
              <span className="error-center__footer-count">
                {errors.length === 1 ? '1 registro' : `${errors.length} registros`}
              </span>
              <button
                type="button"
                className="button button--ghost error-center__clear"
                onClick={clearErrors}
              >
                <Icon name="trash" size={14} />
                Limpiar registro
              </button>
            </footer>
          </aside>
        </>
      ) : null}
    </>
  )
}

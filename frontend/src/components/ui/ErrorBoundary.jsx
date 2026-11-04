import { Component } from 'react'
import Icon from './Icon.jsx'
import ErrorDetails from './ErrorDetails.jsx'
import { getErrorHint, normalizeError } from '../../lib/errors.js'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, componentStack: '' }
    this.handleReset = this.handleReset.bind(this)
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    this.setState({ componentStack: info?.componentStack ?? '' })
    this.props.onError?.(error, info)
  }

  handleReset() {
    this.setState({ error: null, componentStack: '' })
    this.props.onReset?.()
  }

  render() {
    const { error, componentStack } = this.state
    const { children, variant = 'screen', title, description } = this.props

    if (!error) return children

    const normalized = normalizeError(error, {
      source: 'frontend',
      kind: 'render',
    })
    const hint = getErrorHint(normalized)

    return (
      <div className={`error-boundary error-boundary--${variant}`}>
        <div className="error-boundary__panel" role="alert">
          <span className="error-boundary__art" aria-hidden="true">
            <Icon name="bug" size={34} strokeWidth={1.5} />
          </span>

          <span className="error-boundary__eyebrow">Error del frontend</span>
          <h1 className="error-boundary__title">
            {title ?? 'La interfaz encontró un problema'}
          </h1>
          <p className="error-boundary__message">
            {description ?? normalized.message}
          </p>
          <p className="error-boundary__hint">{hint}</p>

          <ErrorDetails
            error={normalized}
            context={{ componentStack }}
            label="Ver detalles del componente"
          />

          <div className="error-boundary__actions">
            <button
              type="button"
              className="button button--primary"
              onClick={this.handleReset}
            >
              <Icon name="refresh" size={16} />
              Reintentar
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => window.location.reload()}
            >
              Recargar aplicación
            </button>
          </div>
        </div>
      </div>
    )
  }
}

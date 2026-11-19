import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Icon from '../components/ui/Icon.jsx'
import ErrorNotice from '../components/ui/ErrorNotice.jsx'
import FormErrors from '../components/ui/FormErrors.jsx'
import { useAuth } from '../hooks/useAuth.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values) {
  const errors = {}
  const email = String(values.email ?? '').trim()

  if (!email) {
    errors.email = 'Ingresá tu correo electrónico.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Ingresá un correo electrónico válido.'
  }
  if (!String(values.password ?? '')) {
    errors.password = 'Ingresá tu contraseña.'
  }

  return errors
}

export default function Login() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to={from} replace />

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setError(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = validate(values)
    setErrors(nextErrors)
    setError(null)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      await login(values)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setSubmitting(false)
    }
  }

  const invalidCredentials =
    error?.status === 401 || error?.code === 'INVALID_CREDENTIALS'

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-brand">
          <span className="auth-brand__logo">
            <Icon name="wallet" size={22} />
          </span>
          <span>
            <span className="auth-brand__title">Bitácora</span>
            <span className="auth-brand__subtitle">Financiera</span>
          </span>
        </div>

        <header className="auth-header">
          <h1>Iniciá sesión</h1>
          <p>Ingresá tus credenciales para acceder a tu información.</p>
        </header>

        <FormErrors
          errors={errors}
          title="Revisá los datos del formulario"
          description="Completá los campos obligatorios para continuar."
          onDismiss={() => setErrors({})}
        />

        {error ? (
          <ErrorNotice
            error={error}
            title="No se pudo iniciar sesión"
            hint={
              invalidCredentials
                ? 'Revisá el correo y la contraseña e intentá de nuevo.'
                : undefined
            }
            details={false}
            compact
            onDismiss={() => setError(null)}
          />
        ) : null}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field__label" htmlFor="login-email">
              Correo electrónico <span>*</span>
            </label>
            <input
              id="login-email"
              name="email"
              className="input"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={values.email}
              onChange={handleChange}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'login-email-error' : undefined}
              autoFocus
            />
            {errors.email ? (
              <span id="login-email-error" className="field__error">
                <Icon name="alert" size={12} />
                {errors.email}
              </span>
            ) : null}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="login-password">
              Contraseña <span>*</span>
            </label>
            <input
              id="login-password"
              name="password"
              className="input"
              type="password"
              autoComplete="current-password"
              placeholder="Tu contraseña"
              value={values.password}
              onChange={handleChange}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
            />
            {errors.password ? (
              <span id="login-password-error" className="field__error">
                <Icon name="alert" size={12} />
                {errors.password}
              </span>
            ) : null}
          </div>

          <button
            type="submit"
            className="button button--primary button--block auth-submit"
            disabled={submitting}
          >
            <Icon name={submitting ? 'refresh' : 'check'} size={16} />
            {submitting ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <p className="auth-footer">
          ¿No tenés cuenta? <Link to="/register">Registrate</Link>
        </p>
      </div>
    </div>
  )
}

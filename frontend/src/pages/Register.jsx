import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Icon from '../components/ui/Icon.jsx'
import ErrorNotice from '../components/ui/ErrorNotice.jsx'
import FormErrors from '../components/ui/FormErrors.jsx'
import { useAuth } from '../hooks/useAuth.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

function validate(values) {
  const errors = {}
  const email = String(values.email ?? '').trim()
  const name = String(values.name ?? '').trim()
  const password = String(values.password ?? '')

  if (!email) {
    errors.email = 'Ingresá tu correo electrónico.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Ingresá un correo electrónico válido.'
  }

  if (!name) {
    errors.name = 'Ingresá tu nombre.'
  }

  if (!password) {
    errors.password = 'Ingresá tu contraseña.'
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
  }

  return errors
}

export default function Register() {
  const { isAuthenticated, register } = useAuth()
  const navigate = useNavigate()

  const [values, setValues] = useState({ email: '', name: '', password: '' })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

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
      await register(values)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setSubmitting(false)
    }
  }

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
          <h1>Creá tu cuenta</h1>
          <p>Registrate para empezar a usar tu bitácora financiera.</p>
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
            title="No se pudo crear la cuenta"
            details={false}
            compact
            onDismiss={() => setError(null)}
          />
        ) : null}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field__label" htmlFor="register-email">
              Correo electrónico <span>*</span>
            </label>
            <input
              id="register-email"
              name="email"
              className="input"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={values.email}
              onChange={handleChange}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'register-email-error' : undefined}
              autoFocus
            />
            {errors.email ? (
              <span id="register-email-error" className="field__error">
                <Icon name="alert" size={12} />
                {errors.email}
              </span>
            ) : null}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="register-name">
              Nombre <span>*</span>
            </label>
            <input
              id="register-name"
              name="name"
              className="input"
              type="text"
              autoComplete="name"
              placeholder="Tu nombre"
              value={values.name}
              onChange={handleChange}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'register-name-error' : undefined}
            />
            {errors.name ? (
              <span id="register-name-error" className="field__error">
                <Icon name="alert" size={12} />
                {errors.name}
              </span>
            ) : null}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="register-password">
              Contraseña <span>*</span>
            </label>
            <input
              id="register-password"
              name="password"
              className="input"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              value={values.password}
              onChange={handleChange}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'register-password-error' : undefined}
            />
            {errors.password ? (
              <span id="register-password-error" className="field__error">
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
            {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  )
}

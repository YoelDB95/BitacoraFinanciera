import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Icon from '../ui/Icon.jsx'
import { ENVIO_FACTURACION_OPTIONS } from '../../lib/work.js'

function formatCuit(raw) {
  const digits = String(raw).replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`
}

function isValidCuit(raw) {
  return /^\d{2}-\d{8}-\d$/.test(String(raw))
}

function isValidEmail(raw) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(raw))
}

export default function CompanyModal({ open, onClose, onCreate }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva empresa"
      description="Registra los datos fiscales y de facturación de la empresa."
      icon="building"
      footer={
        <>
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            form="company-form"
            className="button button--primary"
          >
            <Icon name="check" size={16} />
            Guardar empresa
          </button>
        </>
      }
    >
      {open && <CompanyForm onDone={onClose} onCreate={onCreate} />}
    </Modal>
  )
}

function CompanyForm({ onDone, onCreate }) {
  const [form, setForm] = useState({
    razonSocial: '',
    cuit: '',
    direccionFacturacion: '',
    nota: '',
    correo: '',
    envioFacturacion: '',
  })
  const [errors, setErrors] = useState({})

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextErrors = {}
    if (!form.razonSocial.trim()) nextErrors.razonSocial = 'Indica la razón social.'
    if (!isValidCuit(form.cuit)) nextErrors.cuit = 'Ingresa un CUIT válido (00-00000000-0).'
    if (form.correo.trim() && !isValidEmail(form.correo.trim()))
      nextErrors.correo = 'Ingresa un correo electrónico válido.'
    if (!form.envioFacturacion)
      nextErrors.envioFacturacion = 'Elige dónde enviar la facturación.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onCreate({
      nombre: form.razonSocial.trim(),
      cuit: form.cuit,
      direccionFacturacion: form.direccionFacturacion.trim(),
      nota: form.nota.trim(),
      correo: form.correo.trim(),
      envioFacturacion: form.envioFacturacion,
    })
    onDone()
  }

  return (
    <form id="company-form" onSubmit={handleSubmit} noValidate>
      <div className="modal__grid" style={{ marginBottom: 16 }}>
        <div className="field">
          <label className="field__label" htmlFor="company-name">
            Razón social <span>*</span>
          </label>
          <input
            id="company-name"
            className="input"
            value={form.razonSocial}
            onChange={(event) => update('razonSocial', event.target.value)}
            placeholder="Ej. Paquetería Andina S.A."
            aria-invalid={Boolean(errors.razonSocial)}
          />
          {errors.razonSocial && (
            <span className="field__error">
              <Icon name="alert" size={13} />
              {errors.razonSocial}
            </span>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="company-cuit">
            CUIT <span>*</span>
          </label>
          <input
            id="company-cuit"
            className="input"
            inputMode="numeric"
            value={form.cuit}
            onChange={(event) => update('cuit', formatCuit(event.target.value))}
            placeholder="00-00000000-0"
            aria-invalid={Boolean(errors.cuit)}
          />
          {errors.cuit && (
            <span className="field__error">
              <Icon name="alert" size={13} />
              {errors.cuit}
            </span>
          )}
        </div>
      </div>

      <div className="modal__grid" style={{ marginBottom: 16 }}>
        <div className="field">
          <label className="field__label" htmlFor="company-email">
            Correo electrónico
          </label>
          <input
            id="company-email"
            className="input"
            type="email"
            value={form.correo}
            onChange={(event) => update('correo', event.target.value)}
            placeholder="facturacion@empresa.com"
            aria-invalid={Boolean(errors.correo)}
          />
          {errors.correo && (
            <span className="field__error">
              <Icon name="alert" size={13} />
              {errors.correo}
            </span>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="company-shipping">
            ¿Dónde enviar la facturación? <span>*</span>
          </label>
          <select
            id="company-shipping"
            className="select"
            value={form.envioFacturacion}
            onChange={(event) => update('envioFacturacion', event.target.value)}
            aria-invalid={Boolean(errors.envioFacturacion)}
          >
            <option value="">Selecciona…</option>
            {ENVIO_FACTURACION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.envioFacturacion && (
            <span className="field__error">
              <Icon name="alert" size={13} />
              {errors.envioFacturacion}
            </span>
          )}
        </div>
      </div>

      <div className="field" style={{ marginBottom: 16 }}>
        <label className="field__label" htmlFor="company-billing-address">
          Dirección de facturación
        </label>
        <input
          id="company-billing-address"
          className="input"
          value={form.direccionFacturacion}
          onChange={(event) => update('direccionFacturacion', event.target.value)}
          placeholder="Calle, número, ciudad, código postal"
        />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="company-note">
          Nota (opcional)
        </label>
        <textarea
          id="company-note"
          className="textarea"
          rows={3}
          value={form.nota}
          onChange={(event) => update('nota', event.target.value)}
          placeholder="Ej. Laura Mendoza (finanzas), Carlos Nava (compras)"
        />
      </div>
    </form>
  )
}
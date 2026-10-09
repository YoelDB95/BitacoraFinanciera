import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Icon from '../ui/Icon.jsx'
import { toInputDate } from '../../lib/format.js'

function nextInvoiceNumber(count) {
  const year = new Date().getFullYear()
  return `FAC-${year}-${String(count + 1).padStart(3, '0')}`
}

export default function InvoiceModal({
  open,
  onClose,
  onCreate,
  invoiceCount,
  companies = [],
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva factura"
      description="Emite una factura por el trabajo realizado."
      icon="invoice"
    >
      {open && (
        <InvoiceForm
          onDone={onClose}
          onCreate={onCreate}
          invoiceCount={invoiceCount}
          companies={companies}
        />
      )}
    </Modal>
  )
}

function InvoiceForm({ onDone, onCreate, invoiceCount, companies = [] }) {
  const [form, setForm] = useState({
    fecha: toInputDate(),
    empresaId: companies[0]?.id ?? '',
    monto: '',
    concepto: 'Servicios de reparto',
  })
  const [errors, setErrors] = useState({})

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextErrors = {}
    if (!form.fecha) nextErrors.fecha = 'Selecciona una fecha.'
    if (!form.empresaId) nextErrors.empresaId = 'Elige la empresa.'
    if (Number(form.monto) <= 0)
      nextErrors.monto = 'Ingresa un monto mayor a cero.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onCreate({
      fecha: form.fecha,
      empresaId: form.empresaId,
      monto: Number(form.monto),
      concepto: form.concepto.trim(),
      numero: nextInvoiceNumber(invoiceCount),
    })
    onDone()
  }

  return (
    <form id="invoice-form" onSubmit={handleSubmit} noValidate>
      <div className="modal__grid" style={{ marginBottom: 16 }}>
        <div className="field">
          <label className="field__label" htmlFor="invoice-company">
            Empresa <span>*</span>
          </label>
          <select
            id="invoice-company"
            className="select"
            value={form.empresaId}
            onChange={(event) => update('empresaId', event.target.value)}
            aria-invalid={Boolean(errors.empresaId)}
          >
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.legalName}
              </option>
            ))}
          </select>
          {errors.empresaId && (
            <span className="field__error">
              <Icon name="alert" size={13} />
              {errors.empresaId}
            </span>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="invoice-date">
            Fecha <span>*</span>
          </label>
          <input
            id="invoice-date"
            className="input"
            type="date"
            value={form.fecha}
            onChange={(event) => update('fecha', event.target.value)}
            aria-invalid={Boolean(errors.fecha)}
          />
          {errors.fecha && (
            <span className="field__error">
              <Icon name="alert" size={13} />
              {errors.fecha}
            </span>
          )}
        </div>
      </div>

      <div className="field" style={{ marginBottom: 16 }}>
        <label className="field__label" htmlFor="invoice-amount">
          Monto a facturar <span>*</span>
        </label>
        <input
          id="invoice-amount"
          className="input"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={form.monto}
          onChange={(event) => update('monto', event.target.value)}
          placeholder="0.00"
          aria-invalid={Boolean(errors.monto)}
        />
        {errors.monto && (
          <span className="field__error">
            <Icon name="alert" size={13} />
            {errors.monto}
          </span>
        )}
      </div>

      <div className="field" style={{ marginBottom: 8 }}>
        <label className="field__label" htmlFor="invoice-concept">
          Concepto
        </label>
        <input
          id="invoice-concept"
          className="input"
          value={form.concepto}
          onChange={(event) => update('concepto', event.target.value)}
          placeholder="Servicios de reparto"
        />
      </div>

      <div className="modal__footer" style={{ margin: '4px -22px -22px' }}>
        <button type="button" className="button button--ghost" onClick={onDone}>
          Cancelar
        </button>
        <button
          type="submit"
          form="invoice-form"
          className="button button--primary"
        >
          <Icon name="check" size={16} />
          Emitir factura
        </button>
      </div>
    </form>
  )
}
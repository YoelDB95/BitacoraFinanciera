import { useMemo, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Icon from '../ui/Icon.jsx'
import { useTransactions } from '../../hooks/useTransactions.js'
import { CATEGORIES, PAYMENT_METHODS } from '../../lib/constants.js'
import { formatCurrency, parseAmount, toInputDate } from '../../lib/format.js'

function TransactionForm({ id, onDone }) {
  const { addTransaction } = useTransactions()
  const [form, setForm] = useState(() => ({
    type: 'gasto',
    description: '',
    category: '',
    amount: '',
    date: toInputDate(),
    method: 'tarjeta',
    notes: '',
  }))
  const [errors, setErrors] = useState({})

  const categories = CATEGORIES[form.type]

  const amountPreview = useMemo(() => {
    const amount = parseAmount(form.amount)
    const sign = form.type === 'ingreso' ? '+' : '−'
    return amount > 0 ? `${sign}${formatCurrency(amount)}` : formatCurrency(0)
  }, [form.amount, form.type])

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleTypeChange = (type) => {
    setForm((current) => ({
      ...current,
      type,
      category: CATEGORIES[type].some((c) => c.value === current.category)
        ? current.category
        : '',
    }))
    setErrors((current) => ({ ...current, category: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextErrors = {}
    if (!form.description.trim()) nextErrors.description = 'Describe la transacción.'
    if (parseAmount(form.amount) <= 0) nextErrors.amount = 'Ingresa un monto mayor a cero.'
    if (!form.date) nextErrors.date = 'Selecciona una fecha.'
    if (!form.category) nextErrors.category = 'Elige una categoría.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    addTransaction({
      type: form.type,
      description: form.description.trim(),
      category: form.category,
      amount: parseAmount(form.amount),
      date: form.date,
      method: form.method,
      notes: form.notes.trim(),
    })
    onDone()
  }

  return (
    <form id={id} onSubmit={handleSubmit} noValidate>
      <div className="modal__preview">
        <span className="modal__preview-label">Balance del movimiento</span>
        <span className={`modal__preview-value modal__preview-value--${form.type}`}>
          {amountPreview}
        </span>
      </div>

      <div className="field" style={{ marginBottom: 16 }}>
        <span className="field__label">Tipo de movimiento</span>
        <div className="segmented" role="group" aria-label="Tipo de movimiento">
          {['ingreso', 'gasto'].map((type) => (
            <button
              key={type}
              type="button"
              data-type={type}
              className={`segmented__option${
                form.type === type ? ' segmented__option--active' : ''
              }`}
              onClick={() => handleTypeChange(type)}
              aria-pressed={form.type === type}
            >
              <Icon name={type === 'ingreso' ? 'arrowUp' : 'arrowDown'} size={15} />
              {type === 'ingreso' ? 'Ingreso' : 'Gasto'}
            </button>
          ))}
        </div>
      </div>

      <div className="field" style={{ marginBottom: 16 }}>
        <label className="field__label" htmlFor="txn-description">
          Descripción <span>*</span>
        </label>
        <input
          id="txn-description"
          className="input"
          value={form.description}
          onChange={(event) => update('description', event.target.value)}
          placeholder="Ej. Compra semanal del súper"
          aria-invalid={Boolean(errors.description)}
        />
        {errors.description && (
          <span className="field__error">
            <Icon name="alert" size={13} />
            {errors.description}
          </span>
        )}
      </div>

      <div className="modal__grid" style={{ marginBottom: 16 }}>
        <div className="field">
          <label className="field__label" htmlFor="txn-amount">
            Monto <span>*</span>
          </label>
          <input
            id="txn-amount"
            className="input"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={form.amount}
            onChange={(event) => update('amount', event.target.value)}
            placeholder="0.00"
            aria-invalid={Boolean(errors.amount)}
          />
          {errors.amount && (
            <span className="field__error">
              <Icon name="alert" size={13} />
              {errors.amount}
            </span>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="txn-date">
            Fecha <span>*</span>
          </label>
          <input
            id="txn-date"
            className="input"
            type="date"
            value={form.date}
            onChange={(event) => update('date', event.target.value)}
            aria-invalid={Boolean(errors.date)}
          />
          {errors.date && (
            <span className="field__error">
              <Icon name="alert" size={13} />
              {errors.date}
            </span>
          )}
        </div>
      </div>

      <div className="modal__grid" style={{ marginBottom: 16 }}>
        <div className="field">
          <label className="field__label" htmlFor="txn-category">
            Categoría <span>*</span>
          </label>
          <select
            id="txn-category"
            className="select"
            value={form.category}
            onChange={(event) => update('category', event.target.value)}
            aria-invalid={Boolean(errors.category)}
          >
            <option value="">Selecciona…</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <span className="field__error">
              <Icon name="alert" size={13} />
              {errors.category}
            </span>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="txn-method">
            Método de pago
          </label>
          <select
            id="txn-method"
            className="select"
            value={form.method}
            onChange={(event) => update('method', event.target.value)}
          >
            {PAYMENT_METHODS.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="txn-notes">
          Notas{' '}
          <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>
            (opcional)
          </span>
        </label>
        <textarea
          id="txn-notes"
          className="textarea"
          value={form.notes}
          onChange={(event) => update('notes', event.target.value)}
          placeholder="Añade contexto o comprobantes…"
        />
      </div>
    </form>
  )
}

export default function TransactionModal({ open, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva transacción"
      description="Registra un movimiento de ingreso o gasto."
      footer={
        <>
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            form="transaction-form"
            className="button button--primary"
          >
            <Icon name="check" size={16} />
            Guardar transacción
          </button>
        </>
      }
    >
      {open && <TransactionForm id="transaction-form" onDone={onClose} />}
    </Modal>
  )
}

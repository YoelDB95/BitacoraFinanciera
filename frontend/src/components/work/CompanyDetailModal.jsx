import { useCallback, useEffect, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Icon from '../ui/Icon.jsx'
import { formatCurrency } from '../../lib/format.js'
import { getRates } from '../../lib/api.js'

function buildForm(company) {
  const contacts = company?.billingContacts ?? []
  const primary = contacts.find((contact) => contact.isPrimary) ?? contacts[0]

  return {
    legalName: company?.legalName ?? '',
    businessName: company?.businessName ?? '',
    billingAddress: company?.billingAddress ?? '',
    billingNotes: company?.billingNotes ?? '',
    billingContactName: primary?.name ?? '',
    billingContactEmail: primary?.email ?? '',
  }
}

function rateInputsFrom(list) {
  return Object.fromEntries(
    list.map((rate) => [
      rate.routeTypeId,
      rate.amount ? String(rate.amount) : '',
    ]),
  )
}

function rateName(rate) {
  if (rate.name) return rate.name
  if (rate.code) return `Ruta ${rate.code}`
  return 'Tarifa'
}

function rateBadge(rate) {
  if (rate.code) return rate.code
  const match = /ruta\s+([a-e])/i.exec(rate.name ?? '')
  return match ? match[1].toUpperCase() : '—'
}

export default function CompanyDetailModal({
  open,
  onClose,
  company,
  onSaveInfo,
  onSaveRate,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={company?.legalName ?? 'Empresa'}
      description="Información, edición y tarifas de la empresa."
      icon="building"
    >
      {open && company && (
        <CompanyDetailForm
          key={company.id}
          company={company}
          onClose={onClose}
          onSaveInfo={onSaveInfo}
          onSaveRate={onSaveRate}
        />
      )}
    </Modal>
  )
}

function CompanyDetailForm({ company, onClose, onSaveInfo, onSaveRate }) {
  const [form, setForm] = useState(() => buildForm(company))
  const [rates, setRates] = useState([])
  const [rateInputs, setRateInputs] = useState({})
  const [ratesStatus, setRatesStatus] = useState('loading')
  const [ratesError, setRatesError] = useState('')
  const [savingRateId, setSavingRateId] = useState('')
  const [savingInfo, setSavingInfo] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getRates()
      .then((list) => {
        if (!active) return
        setRates(list)
        setRateInputs(rateInputsFrom(list))
        setRatesStatus('ready')
      })
      .catch((err) => {
        if (!active) return
        setRatesError(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar las tarifas.',
        )
        setRatesStatus('error')
      })
    return () => {
      active = false
    }
  }, [company.id])

  const loadRates = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setRatesStatus('loading')
      setRatesError('')
    }
    try {
      const list = await getRates()
      setRates(list)
      setRateInputs(rateInputsFrom(list))
      setRatesStatus('ready')
    } catch (err) {
      setRatesError(
        err instanceof Error ? err.message : 'No se pudieron cargar las tarifas.',
      )
      setRatesStatus('error')
    }
  }, [])

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const handleSubmitInfo = async (event) => {
    event.preventDefault()
    setSavingInfo(true)
    setError('')
    try {
      await onSaveInfo(company.id, form)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo guardar la empresa.',
      )
    } finally {
      setSavingInfo(false)
    }
  }

  const handleSubmitRate = async (rate) => {
    const amount = Number.parseFloat(rateInputs[rate.routeTypeId])
    if (!Number.isFinite(amount) || amount < 0) {
      setError(`Ingresa una tarifa válida para ${rateName(rate)}.`)
      return
    }
    setSavingRateId(rate.routeTypeId)
    setError('')
    try {
      const routingType = rate.routingType || rate.routeTypeId
      await onSaveRate(routingType, {
        route_type_id: rate.routeTypeId,
        amount,
      })
      await loadRates()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo actualizar la tarifa.',
      )
    } finally {
      setSavingRateId('')
    }
  }

  return (
    <>
      <section className="company-detail__rates" aria-label="Tarifas por ruta">
        <span className="company-detail__label">
          CUIT <strong>{company.cuit || '—'}</strong>
        </span>
        <h3 className="company-detail__rates-title">Tarifas por ruta</h3>

        {ratesStatus === 'loading' ? (
          <p className="company-detail__rates-empty">Cargando tarifas…</p>
        ) : ratesStatus === 'error' ? (
          <p className="company-detail__rates-empty company-detail__rates-error">
            {ratesError}
            <button
              type="button"
              className="company-detail__retry"
              onClick={() => loadRates(true)}
            >
              Reintentar
            </button>
          </p>
        ) : rates.length === 0 ? (
          <p className="company-detail__rates-empty">
            No hay tarifas registradas todavía.
          </p>
        ) : (
          <ul className="rate-list">
            {rates.map((rate) => (
              <li
                className="rate-list__row"
                key={rate.routeTypeId || rate.routeRateId}
              >
                <span className="rate-list__badge">{rateBadge(rate)}</span>
                <span className="rate-list__name">{rateName(rate)}</span>
                <span className="rate-list__current">
                  {formatCurrency(rate.amount)}
                </span>
                <div className="rate-list__controls">
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={rateInputs[rate.routeTypeId] ?? ''}
                    onChange={(event) => {
                      setRateInputs((current) => ({
                        ...current,
                        [rate.routeTypeId]: event.target.value,
                      }))
                      setError('')
                    }}
                    placeholder="0.00"
                    aria-label={`Nueva tarifa para ${rateName(rate)}`}
                  />
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={() => handleSubmitRate(rate)}
                    disabled={savingRateId === rate.routeTypeId}
                  >
                    <Icon name="check" size={14} />
                    {savingRateId === rate.routeTypeId ? 'Guardando…' : 'Actualizar'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form id="company-info-form" onSubmit={handleSubmitInfo} noValidate>
        <div className="modal__grid" style={{ marginBottom: 16 }}>
          <div className="field">
            <label className="field__label" htmlFor="company-legal-name">
              Razón social <span>*</span>
            </label>
            <input
              id="company-legal-name"
              className="input"
              value={form.legalName}
              onChange={(event) => update('legalName', event.target.value)}
              placeholder="Ej. Paquetería Andina S.A."
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="company-business-name">
              Razón comercial
            </label>
            <input
              id="company-business-name"
              className="input"
              value={form.businessName}
              onChange={(event) => update('businessName', event.target.value)}
              placeholder="Ej. Paquetería Andina"
            />
          </div>
        </div>

        <div className="modal__grid" style={{ marginBottom: 16 }}>
          <div className="field">
            <label className="field__label" htmlFor="company-contact-name">
              Contacto de facturación
            </label>
            <input
              id="company-contact-name"
              className="input"
              value={form.billingContactName}
              onChange={(event) =>
                update('billingContactName', event.target.value)
              }
              placeholder="Ej. Laura Mendoza"
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="company-contact-email">
              Correo de facturación
            </label>
            <input
              id="company-contact-email"
              className="input"
              type="email"
              value={form.billingContactEmail}
              onChange={(event) =>
                update('billingContactEmail', event.target.value)
              }
              placeholder="facturacion@empresa.com"
            />
          </div>
        </div>

        <div className="field" style={{ marginBottom: 16 }}>
          <label className="field__label" htmlFor="company-billing-address">
            Dirección de facturación
          </label>
          <input
            id="company-billing-address"
            className="input"
            value={form.billingAddress}
            onChange={(event) => update('billingAddress', event.target.value)}
            placeholder="Calle, número, ciudad, código postal"
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="company-billing-notes">
            Notas
          </label>
          <textarea
            id="company-billing-notes"
            className="textarea"
            rows={3}
            value={form.billingNotes}
            onChange={(event) => update('billingNotes', event.target.value)}
            placeholder="Notas sobre la empresa o su facturación"
          />
        </div>
      </form>

      {error && (
        <div className="notice">
          <Icon name="alert" size={14} />
          <span>{error}</span>
        </div>
      )}

      <div className="modal__footer" style={{ margin: '4px -22px -22px' }}>
        <button type="button" className="button button--ghost" onClick={onClose}>
          Cerrar
        </button>
        <button
          type="submit"
          form="company-info-form"
          className="button button--primary"
          disabled={savingInfo}
        >
          <Icon name="check" size={16} />
          {savingInfo ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </>
  )
}
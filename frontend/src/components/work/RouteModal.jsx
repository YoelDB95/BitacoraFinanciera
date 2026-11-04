import { useEffect, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Icon from '../ui/Icon.jsx'
import ErrorNotice from '../ui/ErrorNotice.jsx'
import FormErrors from '../ui/FormErrors.jsx'
import { formatCurrency, toInputDate } from '../../lib/format.js'
import { getRates } from '../../lib/api.js'

export default function RouteModal({ open, onClose, onCreate, companies = [] }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva ruta"
      description="Registra una ruta de reparto con las empresas involucradas."
      icon="route"
    >
      {open && (
        <RouteForm onDone={onClose} onCreate={onCreate} companies={companies} />
      )}
    </Modal>
  )
}

function RouteForm({ onDone, onCreate, companies = [] }) {
  const [rates, setRates] = useState({ ROUTE: [], PACKAGE: [] })
  const [ratesStatus, setRatesStatus] = useState('loading')
  const [ratesError, setRatesError] = useState(null)
  const [ratesReload, setRatesReload] = useState(0)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    fecha: toInputDate(),
    city: '',
    kmInicial: '',
    kmFinal: '',
    observaciones: '',
  })
  const [empresas, setEmpresas] = useState([
    { key: 1, companyId: '', paquetes: '' },
  ])
  const [errors, setErrors] = useState({})

  // Vuelve a pedir las tarifas y muestra el estado de carga.
  const retryRates = () => {
    setRatesStatus('loading')
    setRatesError(null)
    setRatesReload((value) => value + 1)
  }

  useEffect(() => {
    let active = true

    async function loadRates() {
      try {
        const [routeRates, packageRates] = await Promise.all([
          getRates('ROUTE'),
          getRates('PACKAGE'),
        ])
        if (!active) return
        setRates({
          ROUTE: routeRates.rates,
          PACKAGE: packageRates.rates,
        })
        setRatesStatus('ready')
      } catch (error) {
        if (!active) return
        setRatesStatus('error')
        setRatesError(error)
      }
    }

    loadRates()

    return () => {
      active = false
    }
  }, [ratesReload])

  const kmCalculado = Math.max(
    0,
    (Number(form.kmFinal) || 0) - (Number(form.kmInicial) || 0),
  )

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const usedCompanyIds = empresas
    .map((entry) => entry.companyId)
    .filter(Boolean)

  const availableCompanies = (rowIndex) =>
    companies.filter(
      (company) =>
        company.id === empresas[rowIndex].companyId ||
        !usedCompanyIds.includes(company.id),
    )

  const getPackageRate = (companyId) =>
    rates.PACKAGE
      .filter((rate) => rate.companyId === companyId)
      .sort((a, b) => String(b.validFrom ?? '').localeCompare(String(a.validFrom ?? '')))[0]

  const updateEmpresa = (rowIndex, field, value) => {
    setEmpresas((current) =>
      current.map((entry, index) =>
        index === rowIndex
          ? {
              ...entry,
              [field]: value,
              ...(field === 'companyId' ? { routeRateId: '' } : {}),
            }
          : entry,
      ),
    )
  }

  const removeEmpresa = (rowIndex) => {
    setEmpresas((current) =>
      current.filter((_, index) => index !== rowIndex),
    )
  }

  const addEmpresa = () => {
    const nextKey = Math.max(0, ...empresas.map((entry) => entry.key)) + 1
    setEmpresas((current) => [
      ...current,
      { key: nextKey, companyId: '', paquetes: '' },
    ])
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = {}
    if (!form.fecha) nextErrors.fecha = 'Selecciona una fecha.'
    if (!form.city) nextErrors.city = 'Elige la ciudad.'
    const vehicleKmStart = Number(form.kmInicial)
    const vehicleKmEnd = form.kmFinal === '' ? null : Number(form.kmFinal)
    if (form.kmInicial === '' || !Number.isFinite(vehicleKmStart) || vehicleKmStart < 0)
      nextErrors.kmInicial = 'Ingresa un km inicial válido y no negativo.'
    if (
      vehicleKmEnd != null &&
      (!Number.isFinite(vehicleKmEnd) || vehicleKmEnd < vehicleKmStart)
    )
      nextErrors.kmFinal = 'El km final debe ser válido y no menor al km inicial.'

    const selectedCompanies = empresas.filter((entry) => entry.companyId)
    if (selectedCompanies.length === 0)
      nextErrors.companies = 'Selecciona al menos una empresa.'

    const companyRates = selectedCompanies.map((entry) => {
      const company = companies.find((item) => item.id === entry.companyId)
      const routingType = company?.routingType
      const packagesReceived = Number(entry.paquetes)
      const common = {
        companyId: entry.companyId,
        routingType,
        packagesReceived: Number.isFinite(packagesReceived) && packagesReceived >= 0
          ? packagesReceived
          : 0,
        packagesUndelivered: 0,
      }

      if (routingType === 'ROUTE') {
        const rate = rates.ROUTE.find((item) => item.id === entry.routeRateId)
        return {
          ...common,
          rateAmount: rate?.amount ?? null,
          routeRateAmount: rate?.amount ?? null,
          routeRateId: rate?.id ?? null,
          routeTypeId: rate?.routeTypeId ?? null,
        }
      }

      if (routingType === 'PACKAGE') {
        const rate = getPackageRate(entry.companyId)
        return {
          ...common,
          rateAmount: rate?.amount ?? null,
          packageAmount: rate?.amount ?? null,
          companyRateId: rate?.id ?? null,
        }
      }

      nextErrors[`rate-${entry.key}`] =
        'La empresa no tiene un tipo de tarifa válido.'
      return common
    })

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSubmitError(null)
    setSubmitting(true)

    try {
      await onCreate({
        routeDate: form.fecha,
        destinationCity: form.city,
        vehicleKmStart,
        vehicleKmEnd,
        notes: form.observaciones.trim() || null,
        companies: companyRates,
      })
      onDone()
    } catch (err) {
      setSubmitError(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form id="route-form" onSubmit={handleSubmit} noValidate>
      <FormErrors
        errors={errors}
        title="No se pudo guardar la ruta"
        description="Corregí los campos marcados para continuar."
      />
      {submitError && (
        <ErrorNotice
          error={submitError}
          title="No se pudo guardar la ruta"
          onDismiss={() => setSubmitError(null)}
        />
      )}
      {ratesError && (
        <ErrorNotice
          error={ratesError}
          title="No se pudieron cargar las tarifas"
          compact
          onRetry={retryRates}
        />
      )}
      <div className="modal__grid" style={{ marginBottom: 16 }}>
        <div className="field">
          <label className="field__label" htmlFor="route-date">
            Fecha <span>*</span>
          </label>
          <input
            id="route-date"
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
        <label className="field__label" htmlFor="route-city">
          Ciudad <span>*</span>
        </label>
        <input
          id="route-city"
          className="input"
          value={form.city}
          onChange={(event) => update('city', event.target.value)}
          placeholder="Ej. Monterrey"
          aria-invalid={Boolean(errors.city)}
        />
        {errors.city && (
          <span className="field__error">
            <Icon name="alert" size={13} />
            {errors.city}
          </span>
        )}
      </div>

      <div className="modal__grid" style={{ marginBottom: 16 }}>
        <div className="field">
          <label className="field__label" htmlFor="route-km-inicial">
            Km inicial <span>*</span>
          </label>
          <input
            id="route-km-inicial"
            className="input"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={form.kmInicial}
            onChange={(event) => update('kmInicial', event.target.value)}
            placeholder="0"
            aria-invalid={Boolean(errors.kmInicial)}
          />
          {errors.kmInicial && (
            <span className="field__error">
              <Icon name="alert" size={13} />
              {errors.kmInicial}
            </span>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="route-km-final">
            Km final
          </label>
          <input
            id="route-km-final"
            className="input"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={form.kmFinal}
            onChange={(event) => update('kmFinal', event.target.value)}
            placeholder="0"
            aria-invalid={Boolean(errors.kmFinal)}
          />
          {errors.kmFinal && (
            <span className="field__error">
              <Icon name="alert" size={13} />
              {errors.kmFinal}
            </span>
          )}
        </div>
      </div>

      <div className="field" style={{ marginBottom: 16 }}>
        <label className="field__label" htmlFor="route-km-calc">
          Kilómetros calculados
        </label>
        <input
          id="route-km-calc"
          className="input input--readonly"
          type="text"
          value={kmCalculado > 0 ? `${kmCalculado} km` : ''}
          placeholder="0 km"
          readOnly
        />
      </div>

      <div className="field" style={{ marginBottom: 16 }}>
        <span className="field__label">Empresas involucradas</span>
        <div className="route-companies">
          {empresas.map((entry, index) => (
            <div className="route-company" key={entry.key}>
              <div className="route-company__row">
                <div className="field route-company__select">
                  <select
                    className="select"
                    value={entry.companyId}
                    onChange={(event) =>
                      updateEmpresa(index, 'companyId', event.target.value)
                    }
                  >
                    <option value="">
                      {index === 0 ? 'Seleccionar empresa…' : 'Otra empresa…'}
                    </option>
                    {availableCompanies(index).map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.legalName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field route-company__packages">
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={entry.paquetes}
                    onChange={(event) =>
                      updateEmpresa(index, 'paquetes', event.target.value)
                    }
                    placeholder="Paquetes"
                  />
                </div>

                <button
                  type="button"
                  className="icon-button route-company__remove"
                  onClick={() => removeEmpresa(index)}
                  aria-label="Eliminar empresa"
                  disabled={empresas.length === 1}
                >
                  <Icon name="trash" size={15} />
                </button>
              </div>
              {entry.companyId && (
                <div className="field route-company__rate">
                  <label
                    className="field__label"
                    htmlFor={`route-rate-${entry.key}`}
                  >
                    {companies.find((company) => company.id === entry.companyId)
                      ?.routingType === 'ROUTE'
                      ? 'Tarifa de ruta'
                      : 'Tarifa de paquete'}
                  </label>
                  {companies.find((company) => company.id === entry.companyId)
                    ?.routingType === 'ROUTE' ? (
                    <select
                      id={`route-rate-${entry.key}`}
                      className="select"
                      value={entry.routeRateId ?? ''}
                      onChange={(event) =>
                        updateEmpresa(index, 'routeRateId', event.target.value)
                      }
                      disabled={ratesStatus !== 'ready'}
                    >
                      <option value="">Sin tarifa (opcional)</option>
                      {rates.ROUTE.map((rate) => (
                        <option key={rate.id} value={rate.id}>
                          {rate.name} — {formatCurrency(rate.amount)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="route-form__rate-value">
                      {ratesStatus === 'ready' && getPackageRate(entry.companyId)
                        ? formatCurrency(getPackageRate(entry.companyId).amount)
                        : ratesStatus === 'loading'
                          ? 'Cargando tarifa…'
                          : 'Sin tarifa vigente'}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}

          {errors.companies && (
            <span className="field__error">
              <Icon name="alert" size={13} />
              {errors.companies}
            </span>
          )}
          {usedCompanyIds.length < companies.length && (
            <button
              type="button"
              className="route-company__add"
              onClick={addEmpresa}
            >
              <Icon name="plus" size={14} />
              Agregar empresa
            </button>
          )}
        </div>
      </div>

      <div className="field" style={{ marginBottom: 16 }}>
        <label className="field__label" htmlFor="route-obs">
          Observaciones
        </label>
        <textarea
          id="route-obs"
          className="textarea"
          rows={3}
          value={form.observaciones}
          onChange={(event) => update('observaciones', event.target.value)}
          placeholder="Notas de la ruta (opcional)"
        />
      </div>

      <div className="modal__footer" style={{ margin: '4px -22px -22px' }}>
        <button type="button" className="button button--ghost" onClick={onDone}>
          Cancelar
        </button>
        <button
          type="submit"
          form="route-form"
          className="button button--primary"
          disabled={submitting}
        >
          <Icon name="check" size={16} />
          {submitting ? 'Guardando…' : 'Guardar ruta'}
        </button>
      </div>
    </form>
  )
}
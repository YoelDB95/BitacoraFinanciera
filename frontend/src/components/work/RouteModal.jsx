import { useEffect, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Icon from '../ui/Icon.jsx'
import ErrorNotice from '../ui/ErrorNotice.jsx'
import FormErrors from '../ui/FormErrors.jsx'
import { formatCurrency, toInputDate } from '../../lib/format.js'
import { getRates } from '../../lib/api.js'

function toText(value) {
  return value == null || value === '' ? '' : String(value)
}

function createEmpresa(route) {
  const entry = route?.empresas?.[0]
  if (!entry) {
    return {
      key: 1,
      companyId: '',
      companyName: '',
      routingType: '',
      routeTypeName: '',
      routeTypeCode: '',
      paquetes: '',
      noEntregados: '',
      routeRateId: '',
      routeTypeId: '',
      companyRateId: '',
      rateAmount: null,
      packageAmount: null,
    }
  }

  return {
    key: entry.key ?? route.id,
    companyId: entry.companyId ?? '',
    companyName: entry.companyName ?? '',
    routingType: entry.routingType ?? '',
    routeTypeName: entry.routeTypeName ?? '',
    routeTypeCode: entry.routeTypeCode ?? '',
    paquetes: toText(entry.paquetes),
    noEntregados: toText(entry.noEntregados),
    routeRateId: entry.routeRateId ?? '',
    routeTypeId: entry.routeTypeId ?? '',
    companyRateId: entry.companyRateId ?? '',
    rateAmount: entry.rateAmount ?? route.rateAmount ?? null,
    packageAmount: entry.packageAmount ?? null,
  }
}

function normalizeLabel(value) {
  return String(value ?? '').trim().toLowerCase()
}

function mostRecentRate(rates = []) {
  return [...rates].sort((a, b) =>
    String(b.validFrom ?? '').localeCompare(String(a.validFrom ?? '')),
  )[0]
}

function resolveRouteRate(rates = [], entry = {}) {
  // El id de tarifa puede repetirse entre tipos (por ejemplo, PNU comparte la
  // tarifa base de Ruta A), así que primero se busca por tipo de ruta.
  if (entry.routeTypeId) {
    const byType = rates.find((rate) => rate.routeTypeId === entry.routeTypeId)
    if (byType) return byType
  }

  const typeLabel = normalizeLabel(entry.routeTypeName || entry.routeTypeCode)
  if (typeLabel) {
    const byName = rates.filter(
      (rate) => normalizeLabel(rate.name) === typeLabel,
    )
    if (byName.length > 0) return mostRecentRate(byName)
  }

  if (entry.rateAmount != null) {
    const byAmount = rates.filter(
      (rate) => Number(rate.amount) === Number(entry.rateAmount),
    )
    const typeIds = new Set(byAmount.map((rate) => rate.routeTypeId))
    if (byAmount.length > 0 && typeIds.size === 1) {
      return mostRecentRate(byAmount)
    }
  }

  if (entry.routeRateId) {
    const byId = rates.filter((rate) => rate.id === entry.routeRateId)
    const typeIds = new Set(byId.map((rate) => rate.routeTypeId))
    if (byId.length > 0 && typeIds.size === 1) return byId[0]
  }

  return null
}

function rateSelectionValue(rate) {
  return rate?.routeTypeId || rate?.id || ''
}

function findSelectedRate(rates = [], selection) {
  if (!selection) return null
  return rates.find((rate) => rateSelectionValue(rate) === selection) ?? null
}

export default function RouteModal({
  open,
  onClose,
  onCreate,
  onUpdate,
  onDeleteRoute,
  route = null,
  companies = [],
}) {
  const editing = Boolean(route)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar ruta' : 'Nueva ruta'}
      description={
        editing
          ? 'Modifica los datos de la ruta y la empresa asociada.'
          : 'Registra una ruta de reparto con las empresas involucradas.'
      }
      icon="route"
    >
      {open && (
        <RouteForm
          key={route?.routeCompanyId ?? route?.id ?? 'new'}
          onDone={onClose}
          onCreate={onCreate}
          onUpdate={onUpdate}
          onDeleteRoute={onDeleteRoute}
          route={route}
          companies={companies}
        />
      )}
    </Modal>
  )
}

function RouteForm({
  onDone,
  onCreate,
  onUpdate,
  onDeleteRoute,
  route,
  companies = [],
}) {
  const editing = Boolean(route)
  const [rates, setRates] = useState({ ROUTE: [], PACKAGE: [] })
  const [ratesStatus, setRatesStatus] = useState('loading')
  const [ratesError, setRatesError] = useState(null)
  const [ratesReload, setRatesReload] = useState(0)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState(() => ({
    fecha: route?.fecha || toInputDate(),
    city: route?.city || '',
    kmInicial: route ? toText(route.kmInicial) : '',
    kmFinal: route ? toText(route.kmFinal) : '',
    observaciones: route?.notes ?? '',
  }))
  const [empresas, setEmpresas] = useState(() => [createEmpresa(route)])
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
              ...(field === 'companyId'
                ? {
                    companyName: '',
                    routeTypeName: '',
                    routeTypeCode: '',
                    routeRateId: '',
                    routeTypeId: '',
                    companyRateId: '',
                    rateAmount: null,
                    packageAmount: null,
                  }
                : {}),
            }
          : entry,
      ),
    )
  }

  const updateRouteRate = (rowIndex, selection) => {
    const rate = findSelectedRate(rates.ROUTE, selection)

    setEmpresas((current) =>
      current.map((entry, index) =>
        index === rowIndex
          ? {
              ...entry,
              routeRateId: rate?.id || '',
              routeTypeId: rate?.routeTypeId || '',
              routeTypeName: '',
              routeTypeCode: '',
              rateAmount: rate?.amount ?? null,
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
      {
        key: nextKey,
        companyId: '',
        companyName: '',
        routingType: '',
        routeTypeName: '',
        routeTypeCode: '',
        paquetes: '',
        noEntregados: '',
        routeRateId: '',
        routeTypeId: '',
        companyRateId: '',
        rateAmount: null,
        packageAmount: null,
      },
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
      const routingType = company?.routingType ?? entry.routingType
      const packagesReceived = Number(entry.paquetes)
      const packagesUndelivered = Number(entry.noEntregados)
      const common = {
        companyId: entry.companyId,
        routingType,
        packagesReceived: Number.isFinite(packagesReceived) && packagesReceived >= 0
          ? packagesReceived
          : 0,
        packagesUndelivered:
          Number.isFinite(packagesUndelivered) && packagesUndelivered >= 0
            ? packagesUndelivered
            : 0,
      }

      if (routingType === 'ROUTE') {
        const rate = resolveRouteRate(rates.ROUTE, entry)
        const amount = rate?.amount ?? entry.rateAmount ?? null
        return {
          ...common,
          rateAmount: amount,
          routeRateAmount: amount,
          routeRateId: rate?.id || entry.routeRateId || null,
          routeTypeId: rate?.routeTypeId || entry.routeTypeId || null,
        }
      }

      if (routingType === 'PACKAGE') {
        const rate = getPackageRate(entry.companyId)
        const amount = editing
          ? entry.rateAmount ?? rate?.amount ?? null
          : rate?.amount ?? entry.rateAmount ?? null
        return {
          ...common,
          rateAmount: amount,
          packageAmount: amount,
          companyRateId: editing
            ? entry.companyRateId || rate?.id || null
            : rate?.id ?? entry.companyRateId ?? null,
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
      const payload = {
        routeDate: form.fecha,
        destinationCity: form.city,
        vehicleKmStart,
        vehicleKmEnd,
        notes: form.observaciones.trim() || null,
        companies: companyRates,
      }

      if (editing) {
        if (!route?.routeId) {
          throw new Error('La ruta no tiene un identificador válido para editar.')
        }
        await onUpdate(
          route.routeId,
          route.routeCompanyId ?? route.id,
          payload,
        )
      } else {
        await onCreate(payload)
      }
      onDone()
    } catch (err) {
      setSubmitError(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRoute = async () => {
    if (!onDeleteRoute || !route?.routeId) return

    if (
      !window.confirm(
        '¿Eliminar la ruta completa? También se quitarán todas las empresas asociadas.',
      )
    )
      return

    setSubmitError(null)
    setDeleting(true)

    try {
      await onDeleteRoute(route)
      onDone()
    } catch (err) {
      setSubmitError(err)
    } finally {
      setDeleting(false)
    }
  }

  const busy = submitting || deleting

  return (
    <form id="route-form" onSubmit={handleSubmit} noValidate>
      <FormErrors
        errors={errors}
        title={editing ? 'No se pudieron guardar los cambios' : 'No se pudo guardar la ruta'}
        description="Corregí los campos marcados para continuar."
      />
      {submitError && (
        <ErrorNotice
          error={submitError}
          title={editing ? 'No se pudieron guardar los cambios' : 'No se pudo guardar la ruta'}
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
        <span className="field__label">
          {editing ? 'Empresa asociada' : 'Empresas involucradas'}
        </span>
        <div className="route-companies">
          {empresas.map((entry, index) => {
            const company = companies.find(
              (item) => item.id === entry.companyId,
            )
            const companyInList = Boolean(company)
            const companyRoutingType = company?.routingType ?? entry.routingType
            const packageRate = getPackageRate(entry.companyId)
            const packageAmount = editing
              ? entry.rateAmount ?? packageRate?.amount ?? null
              : packageRate?.amount ?? entry.rateAmount ?? null
            const routeRate = resolveRouteRate(rates.ROUTE, entry)
            const selectedRouteRate =
              rateSelectionValue(routeRate) ||
              entry.routeTypeId ||
              entry.routeRateId ||
              ''

            return (
              <div className="route-company" key={entry.key}>
                <div className="route-company__row">
                  <div className="field route-company__select">
                    <select
                      className="select"
                      value={entry.companyId}
                      onChange={(event) =>
                        updateEmpresa(index, 'companyId', event.target.value)
                      }
                      disabled={editing}
                      aria-label="Empresa"
                    >
                      <option value="">
                        {index === 0 ? 'Seleccionar empresa…' : 'Otra empresa…'}
                      </option>
                      {!companyInList && entry.companyId && (
                        <option value={entry.companyId}>
                          {entry.companyName || 'Empresa'}
                        </option>
                      )}
                      {availableCompanies(index).map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.legalName}
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
                      placeholder="Recibidos"
                      aria-label="Paquetes recibidos"
                    />
                  </div>

                  <div className="field route-company__packages">
                    <input
                      className="input"
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      value={entry.noEntregados}
                      onChange={(event) =>
                        updateEmpresa(index, 'noEntregados', event.target.value)
                      }
                      placeholder="No entregados"
                      aria-label="Paquetes no entregados"
                    />
                  </div>

                  <button
                    type="button"
                    className="icon-button route-company__remove"
                    onClick={() => removeEmpresa(index)}
                    aria-label="Eliminar empresa"
                    disabled={editing || empresas.length === 1}
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
                      {companyRoutingType === 'ROUTE'
                        ? 'Tarifa de ruta'
                        : 'Tarifa de paquete'}
                    </label>
                    {companyRoutingType === 'ROUTE' ? (
                      <select
                        id={`route-rate-${entry.key}`}
                        className="select"
                        value={selectedRouteRate}
                        onChange={(event) =>
                          updateRouteRate(index, event.target.value)
                        }
                        disabled={ratesStatus !== 'ready'}
                      >
                        <option value="">Sin tarifa (opcional)</option>
                        {rates.ROUTE.map((rate) => (
                          <option
                            key={rateSelectionValue(rate)}
                            value={rateSelectionValue(rate)}
                          >
                            {rate.name} — {formatCurrency(rate.amount)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="route-form__rate-value">
                        {packageAmount != null
                          ? formatCurrency(packageAmount)
                          : ratesStatus === 'loading'
                            ? 'Cargando tarifa…'
                            : 'Sin tarifa vigente'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {errors.companies && (
            <span className="field__error">
              <Icon name="alert" size={13} />
              {errors.companies}
            </span>
          )}
          {!editing && usedCompanyIds.length < companies.length && (
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
        {editing && onDeleteRoute && route?.routeId && (
          <button
            type="button"
            className="button button--danger"
            style={{ marginRight: 'auto' }}
            onClick={handleDeleteRoute}
            disabled={busy}
          >
            <Icon name="trash" size={15} />
            {deleting ? 'Eliminando…' : 'Eliminar ruta completa'}
          </button>
        )}
        <button
          type="button"
          className="button button--ghost"
          onClick={onDone}
          disabled={busy}
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="route-form"
          className="button button--primary"
          disabled={busy}
        >
          <Icon name="check" size={16} />
          {submitting
            ? 'Guardando…'
            : editing
              ? 'Guardar cambios'
              : 'Guardar ruta'}
        </button>
      </div>
    </form>
  )
}

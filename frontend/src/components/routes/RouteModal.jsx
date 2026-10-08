import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Icon from '../ui/Icon.jsx'
import { useRoutes } from '../../hooks/useRoutes.js'
import { formatCurrency, parseAmount } from '../../lib/format.js'

function RouteForm({ route, onDone }) {
  const { updateRoute, companies } = useRoutes()
  const [form, setForm] = useState(() => ({
    routeCode: route.routeCode,
    companyId: route.companyId,
    date: route.date,
    city: route.city,
    packagesDelivered: String(route.packagesDelivered),
    packagesUndelivered: String(route.packagesUndelivered),
    rate: String(route.rate),
  }))
  const [errors, setErrors] = useState({})

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextErrors = {}
    if (!form.routeCode.trim()) nextErrors.routeCode = 'Indica la identificación de la ruta.'
    if (!form.companyId) nextErrors.companyId = 'Selecciona una empresa.'
    if (!form.date) nextErrors.date = 'Selecciona una fecha.'
    if (!form.city.trim()) nextErrors.city = 'Indica la ciudad.'
    if (form.packagesDelivered === '' || Number(form.packagesDelivered) < 0)
      nextErrors.packagesDelivered = 'Ingresa los paquetes entregados.'
    if (form.packagesUndelivered === '' || Number(form.packagesUndelivered) < 0)
      nextErrors.packagesUndelivered = 'Ingresa los paquetes sin entregar.'
    if (parseAmount(form.rate) <= 0) nextErrors.rate = 'Ingresa una tarifa mayor a cero.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    updateRoute(route.id, {
      routeCode: form.routeCode.trim(),
      companyId: form.companyId,
      date: form.date,
      city: form.city.trim(),
      packagesDelivered: Number(form.packagesDelivered),
      packagesUndelivered: Number(form.packagesUndelivered),
      rate: parseAmount(form.rate),
    })
    onDone()
  }

  return (
    <form id="route-form" onSubmit={handleSubmit} noValidate>
      <div className="modal__grid" style={{ marginBottom: 16 }}>
        <div className="field">
          <label className="field__label" htmlFor="route-code">
            Identificación de la ruta <span>*</span>
          </label>
          <input
            id="route-code"
            className="input"
            value={form.routeCode}
            onChange={(event) => update('routeCode', event.target.value)}
            placeholder="Ej. RT-101"
            aria-invalid={Boolean(errors.routeCode)}
          />
          {errors.routeCode && (
            <span className="field__error">
              <Icon name="alert" size={13} />
              {errors.routeCode}
            </span>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="route-company">
            Empresa <span>*</span>
          </label>
          <select
            id="route-company"
            className="select"
            value={form.companyId}
            onChange={(event) => update('companyId', event.target.value)}
            aria-invalid={Boolean(errors.companyId)}
          >
            <option value="">Selecciona…</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          {errors.companyId && (
            <span className="field__error">
              <Icon name="alert" size={13} />
              {errors.companyId}
            </span>
          )}
        </div>
      </div>

      <div className="modal__grid" style={{ marginBottom: 16 }}>
        <div className="field">
          <label className="field__label" htmlFor="route-date">
            Fecha <span>*</span>
          </label>
          <input
            id="route-date"
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

        <div className="field">
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
      </div>

      <div className="modal__grid" style={{ marginBottom: 16 }}>
        <div className="field">
          <label className="field__label" htmlFor="route-delivered">
            Paquetes entregados <span>*</span>
          </label>
          <input
            id="route-delivered"
            className="input"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={form.packagesDelivered}
            onChange={(event) => update('packagesDelivered', event.target.value)}
            placeholder="0"
            aria-invalid={Boolean(errors.packagesDelivered)}
          />
          {errors.packagesDelivered && (
            <span className="field__error">
              <Icon name="alert" size={13} />
              {errors.packagesDelivered}
            </span>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="route-undelivered">
            Paquetes sin entregar <span>*</span>
          </label>
          <input
            id="route-undelivered"
            className="input"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={form.packagesUndelivered}
            onChange={(event) => update('packagesUndelivered', event.target.value)}
            placeholder="0"
            aria-invalid={Boolean(errors.packagesUndelivered)}
          />
          {errors.packagesUndelivered && (
            <span className="field__error">
              <Icon name="alert" size={13} />
              {errors.packagesUndelivered}
            </span>
          )}
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="route-rate">
          Tarifa <span>*</span>
        </label>
        <input
          id="route-rate"
          className="input"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={form.rate}
          onChange={(event) => update('rate', event.target.value)}
          placeholder="0.00"
          aria-invalid={Boolean(errors.rate)}
        />
        {errors.rate ? (
          <span className="field__error">
            <Icon name="alert" size={13} />
            {errors.rate}
          </span>
        ) : (
          <span className="route-form__preview">
            {formatCurrency(parseAmount(form.rate))}
          </span>
        )}
      </div>
    </form>
  )
}

export default function RouteModal({ route, onClose }) {
  return (
    <Modal
      open={Boolean(route)}
      onClose={onClose}
      title="Editar ruta"
      description="Actualiza los datos de la ruta seleccionada."
      icon="route"
      footer={
        <>
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            form="route-form"
            className="button button--primary"
          >
            <Icon name="check" size={16} />
            Guardar cambios
          </button>
        </>
      }
    >
      {route && <RouteForm key={route.id} route={route} onDone={onClose} />}
    </Modal>
  )
}

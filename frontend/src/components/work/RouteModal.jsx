import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Icon from '../ui/Icon.jsx'
import { COMPANIES, ROUTE_OPTIONS, CITY_OPTIONS } from '../../lib/work.js'
import { toInputDate } from '../../lib/format.js'

export default function RouteModal({ open, onClose, onCreate }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva ruta"
      description="Registra una ruta de reparto con las empresas involucradas."
      icon="route"
    >
      {open && <RouteForm onDone={onClose} onCreate={onCreate} />}
    </Modal>
  )
}

function RouteForm({ onDone, onCreate }) {
  const [form, setForm] = useState({
    fecha: toInputDate(),
    routeCode: '',
    city: '',
    kmInicial: '',
    kmFinal: '',
    observaciones: '',
  })
  const [empresas, setEmpresas] = useState([
    { key: 1, companyId: '', paquetes: '' },
  ])
  const [errors, setErrors] = useState({})

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
    COMPANIES.filter(
      (company) =>
        company.id === empresas[rowIndex].companyId ||
        !usedCompanyIds.includes(company.id),
    )

  const updateEmpresa = (rowIndex, field, value) => {
    setEmpresas((current) =>
      current.map((entry, index) =>
        index === rowIndex ? { ...entry, [field]: value } : entry,
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

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextErrors = {}
    if (!form.fecha) nextErrors.fecha = 'Selecciona una fecha.'
    if (!form.city) nextErrors.city = 'Elige la ciudad.'
    if (Number(form.kmInicial) < 0)
      nextErrors.kmInicial = 'El km inicial no puede ser negativo.'
    if (form.kmFinal && Number(form.kmFinal) <= Number(form.kmInicial))
      nextErrors.kmFinal = 'El km final debe ser mayor al km inicial.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onCreate({
      fecha: form.fecha,
      routeCode: form.routeCode,
      city: form.city,
      kmInicial: Number(form.kmInicial) || 0,
      kmFinal: Number(form.kmFinal) || 0,
      kmCalculado: kmCalculado,
      observaciones: form.observaciones.trim(),
      empresas: empresas
        .filter((entry) => entry.companyId)
        .map((entry) => ({
          companyId: entry.companyId,
          paquetes: Number(entry.paquetes) || 0,
        })),
    })
    onDone()
  }

  return (
    <form id="route-form" onSubmit={handleSubmit} noValidate>
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

        <div className="field">
          <label className="field__label" htmlFor="route-code">
            Identificación de la ruta
          </label>
          <select
            id="route-code"
            className="select"
            value={form.routeCode}
            onChange={(event) => update('routeCode', event.target.value)}
          >
            <option value="">Seleccionar…</option>
            {ROUTE_OPTIONS.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field" style={{ marginBottom: 16 }}>
        <label className="field__label" htmlFor="route-city">
          Ciudad <span>*</span>
        </label>
        <select
          id="route-city"
          className="select"
          value={form.city}
          onChange={(event) => update('city', event.target.value)}
          aria-invalid={Boolean(errors.city)}
        >
          <option value="">Seleccionar…</option>
          {CITY_OPTIONS.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
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
                        {company.nombre}
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
            </div>
          ))}

          {usedCompanyIds.length < COMPANIES.length && (
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
        <button type="submit" form="route-form" className="button button--primary">
          <Icon name="check" size={16} />
          Guardar ruta
        </button>
      </div>
    </form>
  )
}
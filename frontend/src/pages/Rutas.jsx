import { useCallback, useEffect, useMemo, useState } from 'react'
import Icon from '../components/ui/Icon.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorNotice from '../components/ui/ErrorNotice.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import RouteList from '../components/routes/RouteList.jsx'
import RouteModal from '../components/work/RouteModal.jsx'
import { useCompanies } from '../hooks/useCompanies.js'
import {
  createRoute,
  deleteCompanyRoute,
  deleteRoute,
  getRoutes,
  updateRoute,
} from '../lib/api.js'
import { formatCount, formatMonth, toInputMonth } from '../lib/format.js'
import { companyLabel, routeEntryLabel } from '../lib/routeDisplay.js'

function createDefaultFilters() {
  return {
    month: toInputMonth(),
    companyId: '',
  }
}

function toRequestFilters(filters) {
  return {
    month: filters.month,
    companyId: filters.companyId || undefined,
  }
}

function validateFilters(filters) {
  return filters.month ? '' : 'Selecciona un mes.'
}

function sortRoutesByDateDesc(routes = []) {
  return [...routes].sort((a, b) => {
    const dateOrder = String(b.fecha ?? '').localeCompare(String(a.fecha ?? ''))
    if (dateOrder !== 0) return dateOrder

    return String(b.routeCompanyId ?? b.id ?? '').localeCompare(
      String(a.routeCompanyId ?? a.id ?? ''),
    )
  })
}

export default function Rutas() {
  const defaultFilters = useMemo(() => createDefaultFilters(), [])
  const [draft, setDraft] = useState(defaultFilters)
  const [filters, setFilters] = useState(defaultFilters)
  const [filterError, setFilterError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRoute, setEditingRoute] = useState(null)
  const [deletingId, setDeletingId] = useState('')
  const [actionError, setActionError] = useState(null)
  const [error, setError] = useState(null)
  const [routes, setRoutes] = useState([])
  const [routesStatus, setRoutesStatus] = useState('loading')
  const { companies } = useCompanies()

  const loadRoutes = useCallback(async (activeFilters) => {
    setRoutesStatus('loading')
    try {
      setRoutes(await getRoutes(toRequestFilters(activeFilters)))
      setRoutesStatus('ready')
      setError(null)
      return true
    } catch (err) {
      setRoutesStatus('error')
      setError(err)
      return false
    }
  }, [])

  useEffect(() => {
    let active = true

    getRoutes(toRequestFilters(defaultFilters))
      .then((loadedRoutes) => {
        if (!active) return
        setRoutes(loadedRoutes)
        setRoutesStatus('ready')
        setError(null)
      })
      .catch((err) => {
        if (!active) return
        setRoutesStatus('error')
        setError(err)
      })

    return () => {
      active = false
    }
  }, [defaultFilters])

  const companyIndex = useMemo(() => {
    const index = {}
    for (const company of companies) {
      const normalized = {
        id: company.id,
        nombre: companyLabel(company),
      }
      index[company.id] = normalized
      index[companyLabel(company)] = normalized
    }
    return index
  }, [companies])

  const modalCompanies = useMemo(
    () =>
      companies.map((company) => ({
        id: company.id,
        legalName: companyLabel(company),
        routingType: company.routingType ?? '',
      })),
    [companies],
  )

  const companyOptions = useMemo(() => {
    const map = new Map()
    const knownLabels = new Set()
    const normalize = (value) => String(value ?? '').trim().toLowerCase()

    for (const company of companies) {
      const name = companyLabel(company)
      map.set(company.id, name)
      knownLabels.add(normalize(name))
    }

    for (const route of routes) {
      for (const entry of route.empresas ?? []) {
        if (map.has(entry.companyId)) continue
        const label = routeEntryLabel(entry, companyIndex)
        if (label === 'Empresa' || knownLabels.has(normalize(label))) continue
        map.set(entry.companyId, label)
        knownLabels.add(normalize(label))
      }
    }

    return [
      { value: '', label: 'Todas las empresas' },
      ...[...map].map(([value, label]) => ({ value, label })),
    ]
  }, [companies, routes, companyIndex])

  const visible = useMemo(() => {
    const filtered = routes.filter((route) => {
      if (filters.month && route.fecha.slice(0, 7) !== filters.month) {
        return false
      }

      if (
        filters.companyId &&
        !(route.empresas ?? []).some(
          (entry) =>
            entry.companyId === filters.companyId ||
            entry.companyName === companyLabel(companyIndex[filters.companyId]),
        )
      ) {
        return false
      }
      return true
    })

    return sortRoutesByDateDesc(filtered)
  }, [routes, filters, companyIndex])

  const isDefaultFilters = (value) =>
    value.month === defaultFilters.month && value.companyId === ''

  const hasFilters = !isDefaultFilters(filters)
  const hasDraft = !isDefaultFilters(draft)

  const updateDraft = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }))
    setFilterError('')
  }

  const handleSearch = (event) => {
    event.preventDefault()

    const message = validateFilters(draft)
    if (message) {
      setFilterError(message)
      return
    }

    const nextFilters = { ...draft }
    setFilterError('')
    setFilters(nextFilters)
    loadRoutes(nextFilters)
  }

  const handleClear = () => {
    const nextFilters = createDefaultFilters()
    setDraft(nextFilters)
    setFilters(nextFilters)
    setFilterError('')
    loadRoutes(nextFilters)
  }

  const handleNewRoute = async (route) => {
    await createRoute(route)
    await loadRoutes(filters)
  }

  const handleUpdateRoute = async (routeId, routeCompanyId, route) => {
    await updateRoute(routeId, routeCompanyId, route)
    await loadRoutes(filters)
  }

  const handleEditRoute = (route) => {
    setEditingRoute(route)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingRoute(null)
  }

  const handleNewRouteClick = () => {
    setEditingRoute(null)
    setModalOpen(true)
  }

  const handleDeleteCompanyRoute = async (route) => {
    const routeCompanyId = route?.routeCompanyId ?? route?.id

    if (!routeCompanyId) {
      setActionError(
        new Error('La asociación empresa-ruta no tiene un identificador válido.'),
      )
      return
    }

    const company = routeEntryLabel(route.empresas?.[0], companyIndex)

    if (
      !window.confirm(
        `¿Quitar ${company} de esta ruta? La ruta y las demás empresas no se modifican.`,
      )
    )
      return

    setActionError(null)
    setDeletingId(routeCompanyId)

    try {
      await deleteCompanyRoute(routeCompanyId)
      await loadRoutes(filters)
    } catch (err) {
      setActionError(err)
    } finally {
      setDeletingId('')
    }
  }

  const handleDeleteRoute = async (route) => {
    if (!route?.routeId) {
      throw new Error('La ruta no tiene un identificador válido para eliminar.')
    }

    await deleteRoute(route.routeId)
    await loadRoutes(filters)
  }

  const periodLabel = formatMonth(filters.month)

  const summary = [
    periodLabel,
    filters.companyId
      ? (companyOptions.find((option) => option.value === filters.companyId)
          ?.label ?? companyLabel(companyIndex[filters.companyId]))
      : 'Todas las empresas',
  ].join(' · ')

  return (
    <>
      <div className="page-head">
        <div>
          <p className="page-head__eyebrow">Bitácora</p>
          <h1 className="page-head__title">Rutas</h1>
          <p className="page-head__desc">
            {routesStatus === 'loading'
              ? 'Cargando las rutas…'
              : `${routes.length} registros de ruta para el mes seleccionado. Filtra por mes y empresa para revisar sus entregas.`}
          </p>
        </div>
        <button
          type="button"
          className="button button--primary"
          onClick={handleNewRouteClick}
        >
          <Icon name="plus" size={16} />
          Nueva ruta
        </button>
      </div>

      {error && (routesStatus !== 'error' || routes.length > 0) && (
        <ErrorNotice
          error={error}
          title="No se pudieron actualizar las rutas"
          onRetry={() => loadRoutes(filters)}
          onDismiss={() => setError(null)}
        />
      )}

      {actionError && (
        <ErrorNotice
          error={actionError}
          title="No se pudo completar la acción"
          onDismiss={() => setActionError(null)}
        />
      )}

      <form className="card filter-panel" onSubmit={handleSearch}>
        <div className="card__head">
          <span className="filter-panel__badge">
            <Icon name="search" size={16} />
          </span>
          <div>
            <h2 className="card__title">Filtrar rutas</h2>
            <p className="card__subtitle">Consulta las rutas de un mes</p>
          </div>
        </div>

        <div className="filter-panel__body">
          <div className="field">
            <label className="field__label" htmlFor="filter-month">
              Mes
            </label>
            <input
              id="filter-month"
              className="input"
              type="month"
              value={draft.month}
              onChange={(event) => updateDraft('month', event.target.value)}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="filter-company">
              Empresa
            </label>
            <select
              id="filter-company"
              className="select"
              value={draft.companyId}
              onChange={(event) =>
                updateDraft('companyId', event.target.value)
              }
            >
              {companyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="button button--primary">
            <Icon name="search" size={16} />
            Buscar
          </button>

          {(hasFilters || hasDraft) && (
            <button
              type="button"
              className="button button--ghost"
              onClick={handleClear}
            >
              <Icon name="close" size={15} />
              Limpiar
            </button>
          )}
        </div>

        {filterError && (
          <p
            className="field__error"
            role="alert"
            style={{ padding: '0 20px 16px' }}
          >
            <Icon name="alert" size={13} />
            {filterError}
          </p>
        )}
      </form>

      <div className="section-head">
        <div>
          <h2 className="section-head__title">Resultados</h2>
          <p className="section-head__desc">{summary}</p>
        </div>
        <span className="results-count">
          {formatCount(visible.length)} de {formatCount(routes.length)}
        </span>
      </div>

      {routesStatus === 'loading' && routes.length === 0 ? (
        <p className="card card__subtitle" role="status">
          Cargando rutas…
        </p>
      ) : routesStatus === 'error' && routes.length === 0 ? (
        <ErrorState
          error={error}
          title="No se pudieron cargar las rutas"
          onRetry={() => loadRoutes(filters)}
        />
      ) : visible.length > 0 ? (
        <RouteList
          routes={visible}
          companyIndex={companyIndex}
          onEdit={handleEditRoute}
          onDelete={handleDeleteCompanyRoute}
          busyId={deletingId}
        />
      ) : (
        <EmptyState
          icon={hasFilters ? 'search' : 'route'}
          title={hasFilters ? 'Sin resultados' : 'Aún no hay rutas este mes'}
          text={
            hasFilters
              ? 'No hay rutas que coincidan con el mes y la empresa seleccionados.'
              : 'Registra tus rutas para llevar el control de paquetes, tarifas y ciudades.'
          }
          action={
            hasFilters ? (
              <button
                type="button"
                className="button button--ghost"
                onClick={handleClear}
              >
                Limpiar filtros
              </button>
            ) : (
              <button
                type="button"
                className="button button--primary"
                onClick={handleNewRouteClick}
              >
                <Icon name="plus" size={16} />
                Nueva ruta
              </button>
            )
          }
        />
      )}

      <RouteModal
        open={modalOpen}
        onClose={handleCloseModal}
        onCreate={handleNewRoute}
        onUpdate={handleUpdateRoute}
        onDeleteRoute={handleDeleteRoute}
        route={editingRoute}
        companies={modalCompanies}
      />
    </>
  )
}

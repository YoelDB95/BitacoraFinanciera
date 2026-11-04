import { useCallback, useEffect, useMemo, useState } from 'react'
import Icon from '../components/ui/Icon.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ErrorNotice from '../components/ui/ErrorNotice.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import RouteList from '../components/routes/RouteList.jsx'
import RouteModal from '../components/work/RouteModal.jsx'
import { useCompanies } from '../hooks/useCompanies.js'
import { createRoute, getRoutesMonth } from '../lib/api.js'
import { formatCount, formatDate } from '../lib/format.js'
import { companyLabel, routeEntryLabel } from '../lib/routeDisplay.js'

const EMPTY_FILTERS = { date: '', companyId: '' }

export default function Rutas() {
  const [draft, setDraft] = useState(EMPTY_FILTERS)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState(null)
  const [routes, setRoutes] = useState([])
  const [routesStatus, setRoutesStatus] = useState('loading')
  const { companies } = useCompanies()

  const loadRoutes = useCallback(async () => {
    setRoutesStatus('loading')
    try {
      setRoutes(await getRoutesMonth())
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

    getRoutesMonth()
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
  }, [])

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
    for (const company of companies) {
      map.set(company.id, companyLabel(company))
    }
    for (const route of routes) {
      for (const entry of route.empresas ?? []) {
        if (map.has(entry.companyId)) continue
        const label = routeEntryLabel(entry, companyIndex)
        if (label !== 'Empresa') {
          map.set(entry.companyId, label)
        }
      }
    }
    return [
      { value: '', label: 'Todas las empresas' },
      ...[...map].map(([value, label]) => ({ value, label })),
    ]
  }, [companies, routes, companyIndex])

  const visible = useMemo(() => {
    return routes
      .filter((route) => {
        if (filters.date && route.fecha !== filters.date) return false
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
      .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0))
  }, [routes, filters, companyIndex])

  const hasFilters = filters.date !== '' || filters.companyId !== ''
  const hasDraft = draft.date !== '' || draft.companyId !== ''

  const handleSearch = (event) => {
    event.preventDefault()
    setFilters({ ...draft })
  }

  const handleClear = () => {
    setDraft(EMPTY_FILTERS)
    setFilters(EMPTY_FILTERS)
  }

  const handleNewRoute = async (route) => {
    await createRoute(route)
    await loadRoutes()
  }

  const summary = [
    filters.date ? formatDate(filters.date) : 'Este mes',
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
              ? 'Cargando las rutas del mes…'
              : `${routes.length} registros de ruta este mes. Filtra por fecha y empresa para revisar sus entregas.`}
          </p>
        </div>
        <button
          type="button"
          className="button button--primary"
          onClick={() => setModalOpen(true)}
        >
          <Icon name="plus" size={16} />
          Nueva ruta
        </button>
      </div>

      {error && (routesStatus !== 'error' || routes.length > 0) && (
        <ErrorNotice
          error={error}
          title="No se pudieron actualizar las rutas"
          onRetry={loadRoutes}
          onDismiss={() => setError(null)}
        />
      )}

      <form className="card filter-panel" onSubmit={handleSearch}>
        <div className="card__head">
          <span className="filter-panel__badge">
            <Icon name="search" size={16} />
          </span>
          <div>
            <h2 className="card__title">Filtrar rutas</h2>
            <p className="card__subtitle">Consulta por fecha y empresa</p>
          </div>
        </div>

        <div className="filter-panel__body">
          <div className="field">
            <label className="field__label" htmlFor="filter-date">
              Fecha
            </label>
            <input
              id="filter-date"
              className="input"
              type="date"
              value={draft.date}
              onChange={(event) =>
                setDraft((current) => ({ ...current, date: event.target.value }))
              }
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
                setDraft((current) => ({ ...current, companyId: event.target.value }))
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
          Cargando rutas del mes…
        </p>
      ) : routesStatus === 'error' && routes.length === 0 ? (
        <ErrorState
          error={error}
          title="No se pudieron cargar las rutas del mes"
          onRetry={loadRoutes}
        />
      ) : visible.length > 0 ? (
        <RouteList
          routes={visible}
          companyIndex={companyIndex}
        />
      ) : (
        <EmptyState
          icon={hasFilters ? 'search' : 'route'}
          title={hasFilters ? 'Sin resultados' : 'Aún no hay rutas este mes'}
          text={
            hasFilters
              ? 'No hay rutas que coincidan con la fecha y la empresa seleccionadas.'
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
                onClick={() => setModalOpen(true)}
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
        onClose={() => setModalOpen(false)}
        onCreate={handleNewRoute}
        companies={modalCompanies}
      />
    </>
  )
}

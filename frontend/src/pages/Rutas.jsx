import { useMemo, useState } from 'react'
import Icon from '../components/ui/Icon.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import RouteList from '../components/routes/RouteList.jsx'
import RouteModal from '../components/work/RouteModal.jsx'
import { useRoutes } from '../hooks/useRoutes.js'
import { useCompanies } from '../hooks/useCompanies.js'
import { createRoute } from '../lib/api.js'
import { COMPANY_INDEX } from '../lib/work.js'
import { formatCount, formatDate } from '../lib/format.js'

const EMPTY_FILTERS = { date: '', companyId: '' }

function companyLabel(company) {
  return company?.nombre ?? company?.legalName ?? company?.name ?? 'Empresa'
}

export default function Rutas() {
  const [draft, setDraft] = useState(EMPTY_FILTERS)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState('')
  const { routes, addRoute, removeRoute } = useRoutes()
  const { companies } = useCompanies()

  const companyIndex = useMemo(() => {
    const index = { ...COMPANY_INDEX }
    for (const company of companies) {
      index[company.id] = {
        id: company.id,
        nombre: companyLabel(company),
      }
    }
    return index
  }, [companies])

  const modalCompanies = useMemo(
    () => companies.map((company) => ({ id: company.id, legalName: companyLabel(company) })),
    [companies],
  )

  const companyOptions = useMemo(() => {
    const map = new Map()
    for (const company of companies) {
      map.set(company.id, companyLabel(company))
    }
    for (const route of routes) {
      for (const entry of route.empresas ?? []) {
        if (!map.has(entry.companyId) && companyIndex[entry.companyId]) {
          map.set(entry.companyId, companyLabel(companyIndex[entry.companyId]))
        }
      }
    }
    return [{ value: '', label: 'Todas las empresas' }, ...[...map].map(
      ([value, label]) => ({ value, label }),
    )]
  }, [companies, routes, companyIndex])

  const visible = useMemo(() => {
    return routes
      .filter((route) => {
        if (filters.date && route.fecha !== filters.date) return false
        if (
          filters.companyId &&
          !(route.empresas ?? []).some(
            (entry) => entry.companyId === filters.companyId,
          )
        ) {
          return false
        }
        return true
      })
      .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0))
  }, [routes, filters])

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
    try {
      await createRoute(route)
      addRoute({
        ...route,
        empresas: (route.empresas ?? []).map((entry, index) => ({
          key: `r-${Date.now()}-${index}`,
          ...entry,
        })),
      })
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la ruta.')
    }
  }

  const summary = [
    filters.date ? formatDate(filters.date) : 'Todas las fechas',
    filters.companyId
      ? companyLabel(companyIndex[filters.companyId])
      : 'Todas las empresas',
  ].join(' · ')

  return (
    <>
      <div className="page-head">
        <div>
          <p className="page-head__eyebrow">Bitácora</p>
          <h1 className="page-head__title">Rutas</h1>
          <p className="page-head__desc">
            {routes.length === 0
              ? 'Todavía no hay rutas registradas.'
              : `${routes.length} rutas registradas. Filtra por fecha y empresa para revisar sus entregas.`}
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

      {error && (
        <div className="notice">
          <Icon name="alert" size={14} />
          <span>{error}</span>
        </div>
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

      {visible.length > 0 ? (
        <RouteList
          routes={visible}
          companyIndex={companyIndex}
          onDelete={removeRoute}
        />
      ) : (
        <EmptyState
          icon={hasFilters ? 'search' : 'route'}
          title={hasFilters ? 'Sin resultados' : 'Aún no hay rutas'}
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

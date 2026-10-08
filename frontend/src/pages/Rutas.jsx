import { useMemo, useState } from 'react'
import Icon from '../components/ui/Icon.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import RouteList from '../components/routes/RouteList.jsx'
import RouteModal from '../components/routes/RouteModal.jsx'
import { useRoutes } from '../hooks/useRoutes.js'
import { formatDate } from '../lib/format.js'

const EMPTY_FILTERS = { date: '', companyId: '' }

export default function Rutas() {
  const [draft, setDraft] = useState(EMPTY_FILTERS)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [editing, setEditing] = useState(null)
  const { routes, companies, companyIndex, removeRoute } = useRoutes()

  const companyOptions = useMemo(
    () => [
      { value: '', label: 'Todas las empresas' },
      ...companies.map((company) => ({ value: company.id, label: company.name })),
    ],
    [companies],
  )

  const visible = useMemo(() => {
    return routes
      .filter((route) => {
        if (filters.date && route.date !== filters.date) return false
        if (filters.companyId && route.companyId !== filters.companyId) return false
        return true
      })
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
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

  const summary = [
    filters.date ? formatDate(filters.date) : 'Todas las fechas',
    filters.companyId
      ? companyIndex[filters.companyId]?.name ?? 'Empresa'
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
      </div>

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
          {visible.length} de {routes.length}
        </span>
      </div>

      {visible.length > 0 ? (
        <RouteList
          routes={visible}
          companyIndex={companyIndex}
          onEdit={setEditing}
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
            ) : undefined
          }
        />
      )}

      <RouteModal route={editing} onClose={() => setEditing(null)} />
    </>
  )
}

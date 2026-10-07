import { useMemo, useState } from 'react'
import Icon from '../components/ui/Icon.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import TransactionList from '../components/transactions/TransactionList.jsx'
import TransactionModal from '../components/transactions/TransactionModal.jsx'
import { useTransactions } from '../hooks/useTransactions.js'
import { CATEGORIES } from '../lib/constants.js'

const TYPE_FILTERS = [
  { value: 'todas', label: 'Todos los tipos' },
  { value: 'ingreso', label: 'Solo ingresos' },
  { value: 'gasto', label: 'Solo gastos' },
]

export default function Transactions() {
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('todas')
  const { transactions, removeTransaction } = useTransactions()

  const categoryOptions = useMemo(
    () => [
      { value: 'todas', label: 'Todas las categorías' },
      ...CATEGORIES.ingreso,
      ...CATEGORIES.gasto,
    ],
    [],
  )

  const [categoryFilter, setCategoryFilter] = useState('todas')

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()

    return transactions
      .filter((item) => {
        if (typeFilter !== 'todas' && item.type !== typeFilter) return false
        if (categoryFilter !== 'todas' && item.category !== categoryFilter)
          return false
        if (!term) return true
        return (
          item.description.toLowerCase().includes(term) ||
          item.notes.toLowerCase().includes(term)
        )
      })
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  }, [transactions, search, typeFilter, categoryFilter])

  const hasFilters =
    search.trim() !== '' || typeFilter !== 'todas' || categoryFilter !== 'todas'

  return (
    <>
      <div className="page-head">
        <div>
          <p className="page-head__eyebrow">Bitácora</p>
          <h1 className="page-head__title">Transacciones</h1>
          <p className="page-head__desc">
            {transactions.length === 0
              ? 'Todavía no registras movimientos. Crea tu primera transacción para empezar.'
              : `${transactions.length} movimientos registrados. Filtra, revisa o agrega uno nuevo.`}
          </p>
        </div>
        <button
          type="button"
          className="button button--primary"
          onClick={() => setModalOpen(true)}
        >
          <Icon name="plus" size={16} />
          Nueva transacción
        </button>
      </div>

      {transactions.length > 0 && (
        <div className="toolbar">
          <div className="search">
            <Icon name="search" size={16} className="search__icon" />
            <input
              className="input"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por concepto o nota…"
              aria-label="Buscar transacciones"
            />
            {search && (
              <button
                type="button"
                className="search__clear"
                onClick={() => setSearch('')}
                aria-label="Limpiar búsqueda"
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </div>

          <select
            className="select filter-select"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            aria-label="Filtrar por tipo"
          >
            {TYPE_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>

          <select
            className="select filter-select"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            aria-label="Filtrar por categoría"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <span className="results-count">
            {visible.length} de {transactions.length}
          </span>
        </div>
      )}

      {visible.length > 0 ? (
        <TransactionList transactions={visible} onDelete={removeTransaction} />
      ) : (
        <EmptyState
          icon={hasFilters ? 'search' : 'inbox'}
          title={hasFilters ? 'Sin resultados' : 'Aún no hay transacciones'}
          text={
            hasFilters
              ? 'Prueba con otro término de búsqueda o quita los filtros aplicados.'
              : 'Registra tus ingresos y gastos para llevar el control de tu bitácora financiera.'
          }
          action={
            hasFilters ? (
              <button
                type="button"
                className="button button--ghost"
                onClick={() => {
                  setSearch('')
                  setTypeFilter('todas')
                  setCategoryFilter('todas')
                }}
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
                Crear transacción
              </button>
            )
          }
        />
      )}

      <TransactionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}

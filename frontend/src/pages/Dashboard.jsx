import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/ui/Icon.jsx'
import TransactionModal from '../components/transactions/TransactionModal.jsx'
import { useTransactions } from '../hooks/useTransactions.js'
import { formatCurrency } from '../lib/format.js'

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false)
  const { summary, transactions } = useTransactions()
  const navigate = useNavigate()

  const lastMovements = transactions.slice(0, 4)

  return (
    <>
      <div className="page-head">
        <div>
          <p className="page-head__eyebrow">Resumen</p>
          <h1 className="page-head__title">Dashboard</h1>
          <p className="page-head__desc">
            Vista principal. Aquí irá tu panorama financiero; por ahora solo
            mostramos un glimpse de tus movimientos más recientes.
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

      <div className="stats-grid">
        <div className="stat stat--success">
          <span className="stat__label">
            <Icon name="arrowUp" size={14} />
            Ingresos
          </span>
          <p className="stat__value">{formatCurrency(summary.ingresos)}</p>
          <p className="stat__hint">{transactions.filter((t) => t.type === 'ingreso').length} movimientos</p>
        </div>

        <div className="stat stat--danger">
          <span className="stat__label">
            <Icon name="arrowDown" size={14} />
            Gastos
          </span>
          <p className="stat__value">{formatCurrency(summary.gastos)}</p>
          <p className="stat__hint">{transactions.filter((t) => t.type === 'gasto').length} movimientos</p>
        </div>

        <div className="stat stat--brand">
          <span className="stat__label">
            <Icon name="wallet" size={14} />
            Balance
          </span>
          <p className="stat__value">{formatCurrency(summary.balance)}</p>
          <p className="stat__hint">Ingresos menos gastos</p>
        </div>
      </div>

      <div className="card">
        <div className="card__head">
          <div>
            <h2 className="card__title">Últimos movimientos</h2>
            <p className="card__subtitle">Preview rápida de tu bitácora</p>
          </div>
          <button
            type="button"
            className="button button--ghost"
            style={{ marginLeft: 'auto' }}
            onClick={() => navigate('/transacciones')}
          >
            Ver todas
            <Icon name="list" size={15} />
          </button>
        </div>
        <div className="card__body">
          {lastMovements.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
              Aún no hay movimientos registrados.
            </p>
          ) : (
            <div className="card-list" style={{ display: 'flex' }}>
              {lastMovements.map((item) => {
                const isIncome = item.type === 'ingreso'
                return (
                  <div className="txn-card" key={item.id} style={{ padding: '10px 0' }}>
                    <span className={`txn__icon txn__icon--${item.type}`}>
                      <Icon name={isIncome ? 'arrowUp' : 'arrowDown'} size={16} />
                    </span>
                    <span className="txn__text">
                      <span className="txn__desc">{item.description}</span>
                    </span>
                    <span className="txn-card__right">
                      <span className={`amount amount--${item.type}`}>
                        {isIncome ? '+' : '−'}
                        {formatCurrency(item.amount)}
                      </span>
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <TransactionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}

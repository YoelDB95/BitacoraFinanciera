import Icon from '../ui/Icon.jsx'
import { CATEGORY_INDEX, PAYMENT_METHODS } from '../../lib/constants.js'
import { formatCurrency, formatDate } from '../../lib/format.js'

function TransactionRow({ transaction, onDelete }) {
  const isIncome = transaction.type === 'ingreso'
  const category = CATEGORY_INDEX[transaction.category]
  const method = PAYMENT_METHODS.find((m) => m.value === transaction.method)

  return (
    <tr>
      <td>
        <div className="txn">
          <span className={`txn__icon txn__icon--${transaction.type}`}>
            <Icon name={isIncome ? 'arrowUp' : 'arrowDown'} size={16} />
          </span>
          <span className="txn__text">
            <span className="txn__desc">{transaction.description}</span>
            <span className="txn__meta">
              <span>{category?.label ?? 'Sin categoría'}</span>
              <span className="txn__meta-sep">·</span>
              <span>{method?.label ?? transaction.method}</span>
            </span>
          </span>
        </div>
      </td>
      <td>
        <span className={`badge badge--${transaction.type}`}>
          {isIncome ? 'Ingreso' : 'Gasto'}
        </span>
      </td>
      <td>
        <span className="txn__meta">
          <Icon name="calendar" size={13} />
          {formatDate(transaction.date)}
        </span>
      </td>
      <td className="col-amount">
        <span className={`amount amount--${transaction.type}`}>
          {isIncome ? '+' : '−'}
          {formatCurrency(transaction.amount)}
        </span>
      </td>
      <td className="col-actions">
        <span className="row-actions">
          <button
            type="button"
            className="row-action row-action--danger"
            onClick={() => onDelete(transaction.id)}
            aria-label={`Eliminar ${transaction.description}`}
          >
            <Icon name="trash" size={15} />
          </button>
        </span>
      </td>
    </tr>
  )
}

function TransactionCard({ transaction, onDelete }) {
  const isIncome = transaction.type === 'ingreso'
  const category = CATEGORY_INDEX[transaction.category]

  return (
    <div className="txn-card">
      <span className={`txn__icon txn__icon--${transaction.type}`}>
        <Icon name={isIncome ? 'arrowUp' : 'arrowDown'} size={16} />
      </span>
      <span className="txn__text">
        <span className="txn__desc">{transaction.description}</span>
        <span className="txn__meta">
          <span>{category?.label ?? 'Sin categoría'}</span>
          <span className="txn__meta-sep">·</span>
          <span>{formatDate(transaction.date)}</span>
        </span>
      </span>
      <span className="txn-card__right">
        <span className={`amount amount--${transaction.type}`}>
          {isIncome ? '+' : '−'}
          {formatCurrency(transaction.amount)}
        </span>
        <span className="row-actions">
          <button
            type="button"
            className="row-action row-action--danger"
            onClick={() => onDelete(transaction.id)}
            aria-label={`Eliminar ${transaction.description}`}
          >
            <Icon name="trash" size={14} />
          </button>
        </span>
      </span>
    </div>
  )
}

export default function TransactionList({ transactions, onDelete }) {
  return (
    <div className="card">
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Tipo</th>
              <th>Fecha</th>
              <th style={{ textAlign: 'right' }}>Monto</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-list">
        {transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { loadTransactions, saveTransactions } from '../lib/storage.js'
import { TransactionsContext } from './TransactionsContext.js'

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `txn-${crypto.randomUUID()}`
  }
  return `txn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function TransactionsProvider({ children }) {
  const [transactions, setTransactions] = useState(loadTransactions)

  useEffect(() => {
    saveTransactions(transactions)
  }, [transactions])

  const addTransaction = useCallback((transaction) => {
    const entry = { ...transaction, id: createId() }
    setTransactions((current) => [entry, ...current])
    return entry
  }, [])

  const updateTransaction = useCallback((id, changes) => {
    setTransactions((current) =>
      current.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    )
  }, [])

  const removeTransaction = useCallback((id) => {
    setTransactions((current) => current.filter((item) => item.id !== id))
  }, [])

  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, item) => {
        const amount = Number(item.amount) || 0
        if (item.type === 'ingreso') acc.ingresos += amount
        else acc.gastos += amount
        return acc
      },
      { ingresos: 0, gastos: 0 },
    )
  }, [transactions])

  const value = useMemo(
    () => ({
      transactions,
      summary: { ...summary, balance: summary.ingresos - summary.gastos },
      addTransaction,
      updateTransaction,
      removeTransaction,
    }),
    [transactions, summary, addTransaction, updateTransaction, removeTransaction],
  )

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  )
}

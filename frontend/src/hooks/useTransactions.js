import { useContext } from 'react'
import { TransactionsContext } from '../context/TransactionsContext.js'

export function useTransactions() {
  const context = useContext(TransactionsContext)
  if (!context) {
    throw new Error('useTransactions debe usarse dentro de <TransactionsProvider>')
  }
  return context
}

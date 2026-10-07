const STORAGE_KEY = 'bitacora.transacciones.v1'

const SEED_TRANSACTIONS = [
  {
    id: 'txn-1',
    description: 'Nómina quincenal — adapters',
    type: 'ingreso',
    category: 'salario',
    amount: 18400,
    date: '2026-09-01',
    method: 'transferencia',
    notes: 'Depósito programado',
  },
  {
    id: 'txn-2',
    description: 'Supermercado Liverpool',
    type: 'gasto',
    category: 'alimentacion',
    amount: 1842.65,
    date: '2026-09-03',
    method: 'tarjeta',
    notes: '',
  },
  {
    id: 'txn-3',
    description: 'Renta del estudio',
    type: 'gasto',
    category: 'vivienda',
    amount: 6500,
    date: '2026-09-05',
    method: 'transferencia',
    notes: '',
  },
  {
    id: 'txn-4',
    description: 'Proyecto freelance — landing page',
    type: 'ingreso',
    category: 'freelance',
    amount: 9200,
    date: '2026-09-08',
    method: 'transferencia',
    notes: 'Factura 014',
  },
  {
    id: 'txn-5',
    description: 'Netflix Premium',
    type: 'gasto',
    category: 'suscripciones',
    amount: 229,
    date: '2026-09-10',
    method: 'tarjeta',
    notes: 'Autorenovación mensual',
  },
  {
    id: 'txn-6',
    description: 'Uber airport 248',
    type: 'gasto',
    category: 'transporte',
    amount: 486.4,
    date: '2026-09-12',
    method: 'tarjeta',
    notes: '',
  },
  {
    id: 'txn-7',
    description: 'Farmacia del Ahorro',
    type: 'gasto',
    category: 'salud',
    amount: 763.1,
    date: '2026-09-15',
    method: 'efectivo',
    notes: '',
  },
  {
    id: 'txn-8',
    description: 'Dividendos NVDA',
    type: 'ingreso',
    category: 'inversion',
    amount: 1340.9,
    date: '2026-09-18',
    method: 'transferencia',
    notes: '',
  },
  {
    id: 'txn-9',
    description: 'Cinépolis — funciones IMAX',
    type: 'gasto',
    category: 'entretenimiento',
    amount: 398,
    date: '2026-09-20',
    method: 'tarjeta',
    notes: '',
  },
  {
    id: 'txn-10',
    description: 'Venta de monitor usado',
    type: 'ingreso',
    category: 'ventas',
    amount: 2600,
    date: '2026-09-22',
    method: 'efectivo',
    notes: '',
  },
  {
    id: 'txn-11',
    description: 'Internet y móvil',
    type: 'gasto',
    category: 'vivienda',
    amount: 1149,
    date: '2026-09-24',
    method: 'domicilio',
    notes: 'Dominio Telcel',
  },
  {
    id: 'txn-12',
    description: 'Panadería La Espiga',
    type: 'gasto',
    category: 'alimentacion',
    amount: 214.5,
    date: '2026-09-26',
    method: 'efectivo',
    notes: '',
  },
]

export function loadTransactions() {
  if (typeof window === 'undefined') return SEED_TRANSACTIONS

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return SEED_TRANSACTIONS
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : SEED_TRANSACTIONS
  } catch {
    return SEED_TRANSACTIONS
  }
}

export function saveTransactions(transactions) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  } catch {
    // storage unavailable — keep state in memory only
  }
}

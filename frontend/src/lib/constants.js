export const TRANSACTION_TYPES = [
  { value: 'ingreso', label: 'Ingreso' },
  { value: 'gasto', label: 'Gasto' },
]

export const CATEGORIES = {
  ingreso: [
    { value: 'salario', label: 'Salario', icon: 'bank' },
    { value: 'freelance', label: 'Freelance', icon: 'sparkle' },
    { value: 'ventas', label: 'Ventas', icon: 'chart' },
    { value: 'inversion', label: 'Inversión', icon: 'wallet' },
    { value: 'otros-ingresos', label: 'Otros', icon: 'cash' },
  ],
  gasto: [
    { value: 'alimentacion', label: 'Alimentación', icon: 'cash' },
    { value: 'transporte', label: 'Transporte', icon: 'wallet' },
    { value: 'vivienda', label: 'Vivienda', icon: 'bank' },
    { value: 'salud', label: 'Salud', icon: 'receipt' },
    { value: 'entretenimiento', label: 'Entretenimiento', icon: 'sparkle' },
    { value: 'suscripciones', label: 'Suscripciones', icon: 'creditCard' },
    { value: 'otros-gastos', label: 'Otros', icon: 'receipt' },
  ],
}

export const CATEGORY_INDEX = Object.values(CATEGORIES)
  .flat()
  .reduce((acc, category) => {
    acc[category.value] = category
    return acc
  }, {})

export const PAYMENT_METHODS = [
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'domicilio', label: 'Domiciliado' },
]

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  {
    label: 'Trabajo',
    icon: 'briefcase',
    children: [
      { to: '/trabajo/resumen', label: 'Resumen', end: true },
      { to: '/trabajo/empresa', label: 'Empresa', icon: 'building' },
      { to: '/rutas', label: 'Rutas', icon: 'route' },
    ],
  },
  { to: '/transacciones', label: 'Transacciones', icon: 'list' },
]

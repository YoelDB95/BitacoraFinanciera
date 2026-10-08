const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
})

const compactFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const dateFormatter = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const decimalFormatter = new Intl.NumberFormat('es-MX', {
  maximumFractionDigits: 1,
})

const integerFormatter = new Intl.NumberFormat('es-MX', {
  maximumFractionDigits: 0,
})

export function formatCurrency(value) {
  return currencyFormatter.format(Number(value) || 0)
}

export function formatCompact(value) {
  return compactFormatter.format(Number(value) || 0)
}

export function formatDate(value) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return dateFormatter.format(date)
}

export function formatKm(value) {
  return `${decimalFormatter.format(Number(value) || 0)} km`
}

export function formatCount(value) {
  return integerFormatter.format(Number(value) || 0)
}

export function toInputDate(date = new Date()) {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10)
}

export function parseAmount(raw) {
  const normalized = String(raw).replace(/[^\d.-]/g, '')
  return normalized === '' ? 0 : Number.parseFloat(normalized)
}

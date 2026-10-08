import { useMemo, useState } from 'react'
import Icon from '../components/ui/Icon.jsx'
import DateRangeSelector from '../components/work/DateRangeSelector.jsx'
import CompanySummary from '../components/work/CompanySummary.jsx'
import RouteModal from '../components/work/RouteModal.jsx'
import InvoiceModal from '../components/work/InvoiceModal.jsx'
import {
  ROUTES as SEED_ROUTES,
  INVOICES as SEED_INVOICES,
  resolvePreset,
  filterByPeriod,
  summarize,
  summarizeByCompany,
} from '../lib/work.js'
import { useCompanies } from '../hooks/useCompanies.js'
import { formatCount, formatCurrency, formatDate, formatKm } from '../lib/format.js'

export default function Work() {
  const { companies } = useCompanies()
  const [range, setRange] = useState(() => ({
    ...resolvePreset('30'),
    preset: '30',
  }))
  const [routes, setRoutes] = useState(SEED_ROUTES)
  const [invoices, setInvoices] = useState(SEED_INVOICES)
  const [routeModal, setRouteModal] = useState(false)
  const [invoiceModal, setInvoiceModal] = useState(false)

  const periodRoutes = useMemo(
    () => filterByPeriod(routes, range),
    [routes, range],
  )
  const stats = useMemo(
    () => summarize(periodRoutes, companies),
    [periodRoutes, companies],
  )
  const companyRows = useMemo(
    () => summarizeByCompany(periodRoutes, companies),
    [periodRoutes, companies],
  )
  const periodInvoices = useMemo(
    () => filterByPeriod(invoices, range),
    [invoices, range],
  )

  const handleNewRoute = (route) => {
    setRoutes((current) => [
      {
        id: `ruta-${Date.now()}`,
        ...route,
      },
      ...current,
    ])
  }

  const handleNewInvoice = (invoice) => {
    setInvoices((current) => [
      {
        id: `fac-${Date.now()}`,
        ...invoice,
      },
      ...current,
    ])
  }

  const periodLabel =
    range.from && range.to
      ? `${formatDate(range.from)} — ${formatDate(range.to)}`
      : 'Sin período definido'

  return (
    <>
      <div className="page-head">
        <div>
          <p className="page-head__eyebrow">Trabajo</p>
          <h1 className="page-head__title">Resumen</h1>
          <p className="page-head__desc">
            Resumen del período seleccionado y empresas para las que trabajas.
          </p>
        </div>
        <span className="period-badge">
          <Icon name="calendar" size={14} />
          {periodLabel}
        </span>
      </div>

      {/* 1 · Cards del período */}
      <section className="stats-grid" aria-label="Resumen del período">
        <div className="stat stat--brand">
          <span className="stat__label">
            <Icon name="gauge" size={14} />
            Kilómetros recorridos
          </span>
          <p className="stat__value">{formatKm(stats.km)}</p>
          <p className="stat__hint">{formatCount(stats.rutas)} rutas en el período</p>
        </div>

        <div className="stat stat--success">
          <span className="stat__label">
            <Icon name="invoice" size={14} />
            Monto a facturar
          </span>
          <p className="stat__value">{formatCurrency(stats.monto)}</p>
          <p className="stat__hint">
            {formatCount(periodInvoices.length)} facturas emitidas
          </p>
        </div>

        <div className="stat stat--brand">
          <span className="stat__label">
            <Icon name="package" size={14} />
            Paquetes entregados
          </span>
          <p className="stat__value">{formatCount(stats.entregados)}</p>
          <p className="stat__hint">
            {formatCount(stats.noEntregados)} sin entregar
          </p>
        </div>
      </section>

      {/* 2 · Selector de fechas */}
      <section className="card work-card" aria-label="Selector de fechas">
        <div className="card__head">
          <div>
            <h2 className="card__title">Selector de fechas</h2>
            <p className="card__subtitle">
              Los indicadores y empresas se filtran por este período.
            </p>
          </div>
        </div>
        <div className="card__body">
          <DateRangeSelector value={range} onChange={setRange} />
        </div>
      </section>

      {/* 3 · Resumen de empresas */}
      <section className="work-section" aria-label="Resumen de empresas">
        <div className="work-section__head">
          <div>
            <h2 className="work-section__title">Empresas donde trabajas</h2>
            <p className="work-section__subtitle">
              Información, paquetes entregados y no entregados en el período.
            </p>
          </div>
          <span className="results-count">{formatCount(companyRows.length)} empresas</span>
        </div>
        <CompanySummary rows={companyRows} />
      </section>

      {/* 4 · Acciones */}
      <section className="work-section" aria-label="Acciones">
        <div className="work-section__head">
          <div>
            <h2 className="work-section__title">Acciones</h2>
            <p className="work-section__subtitle">
              Registra una nueva ruta o emite una factura.
            </p>
          </div>
        </div>
        <div className="action-grid">
          <button
            type="button"
            className="button button--primary action-button"
            onClick={() => setRouteModal(true)}
          >
            <span className="action-button__icon">
              <Icon name="route" size={20} />
            </span>
            <span>
              <span className="action-button__title">Nueva ruta</span>
              <span className="action-button__desc">Registrar reparto realizado</span>
            </span>
          </button>

          <button
            type="button"
            className="button button--ghost action-button action-button--ghost"
            onClick={() => setInvoiceModal(true)}
          >
            <span className="action-button__icon">
              <Icon name="invoice" size={20} />
            </span>
            <span>
              <span className="action-button__title">Nueva factura</span>
              <span className="action-button__desc">Emitir factura del servicio</span>
            </span>
          </button>
        </div>
      </section>

      <RouteModal
        open={routeModal}
        onClose={() => setRouteModal(false)}
        onCreate={handleNewRoute}
      />
      <InvoiceModal
        open={invoiceModal}
        onClose={() => setInvoiceModal(false)}
        onCreate={handleNewInvoice}
        invoiceCount={invoices.length}
      />
    </>
  )
}
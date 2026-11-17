import Icon from '../ui/Icon.jsx'
import {
  formatCount,
  formatCurrency,
  formatDate,
  formatKm,
} from '../../lib/format.js'
import { routeEntryLabel, routeTypeLabel } from '../../lib/routeDisplay.js'

function routeCompanies(route, companyIndex) {
  const entries = route.empresas ?? []
  if (entries.length === 0) return 'Sin empresa'
  return entries
    .map((entry) => routeEntryLabel(entry, companyIndex))
    .join(' · ')
}

function RouteTypeBadge({ route }) {
  const type = routeTypeLabel(route)

  if (!type) {
    return (
      <span className="txn__icon txn__icon--ruta">
        <Icon name="route" size={16} />
      </span>
    )
  }

  return (
    <span
      className="txn__icon txn__icon--ruta txn__icon--type"
      title={`Tipo de ruta: ${type}`}
      aria-label={`Tipo de ruta ${type}`}
    >
      {type}
    </span>
  )
}

function RouteActions({ route, company, onEdit, onDelete, busy }) {
  if (!onEdit && !onDelete) return null

  return (
    <span className="row-actions">
      {onEdit && (
        <button
          type="button"
          className="row-action"
          onClick={() => onEdit(route)}
          aria-label={`Editar ruta de ${company}`}
          disabled={busy}
        >
          <Icon name="edit" size={15} />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          className="row-action row-action--danger"
          onClick={() => onDelete(route)}
          aria-label={`Quitar ${company} de la ruta`}
          disabled={busy}
        >
          <Icon name="trash" size={15} />
        </button>
      )}
    </span>
  )
}

function RouteRow({ route, companyIndex, onEdit, onDelete, busy }) {
  const company = routeCompanies(route, companyIndex)
  const packages = route.empresas?.[0]

  return (
    <tr>
      <td className="routes-table__company-cell">
        <div className="txn">
          <RouteTypeBadge route={route} />
          <span className="txn__text">
            <span className="txn__desc">{company}</span>
          </span>
        </div>
      </td>
      <td className="routes-table__date">
        <span className="txn__meta">
          <Icon name="calendar" size={13} />
          {formatDate(route.fecha)}
        </span>
      </td>
      <td className="routes-table__number">{formatKm(route.kmInicial)}</td>
      <td className="routes-table__number">{formatKm(route.kmFinal)}</td>
      <td className="routes-table__number">
        <span className="routes-table__count routes-table__count--received">
          {formatCount(packages?.paquetes)}
        </span>
      </td>
      <td className="routes-table__number">
        <span className="routes-table__count routes-table__count--pending">
          {formatCount(packages?.noEntregados)}
        </span>
      </td>
      <td className="routes-table__amount">
        {route.rateAmount == null ? '—' : formatCurrency(route.rateAmount)}
      </td>
      <td>
        <span className="badge routes-table__city">{route.city || '—'}</span>
      </td>
      {(onEdit || onDelete) && (
        <td className="col-actions">
          <RouteActions
            route={route}
            company={company}
            onEdit={onEdit}
            onDelete={onDelete}
            busy={busy}
          />
        </td>
      )}
    </tr>
  )
}

function RouteCard({ route, companyIndex, onEdit, onDelete, busy }) {
  const company = routeCompanies(route, companyIndex)
  const packages = route.empresas?.[0]

  return (
    <article className="route-card">
      <header className="route-card__header">
        <RouteTypeBadge route={route} />
        <div className="route-card__heading">
          <h3 className="route-card__company">{company}</h3>
          <span className="route-card__date">
            <Icon name="calendar" size={13} />
            {formatDate(route.fecha)}
          </span>
        </div>
        <span className="badge routes-table__city">{route.city || '—'}</span>
      </header>
      <dl className="route-card__details">
        <div>
          <dt>Km inicial</dt>
          <dd>{formatKm(route.kmInicial)}</dd>
        </div>
        <div>
          <dt>Km final</dt>
          <dd>{formatKm(route.kmFinal)}</dd>
        </div>
        <div>
          <dt>Recibidos</dt>
          <dd className="routes-table__count--received">
            {formatCount(packages?.paquetes)}
          </dd>
        </div>
        <div>
          <dt>No entregados</dt>
          <dd className="routes-table__count--pending">
            {formatCount(packages?.noEntregados)}
          </dd>
        </div>
        <div>
          <dt>Tarifa</dt>
          <dd>{route.rateAmount == null ? '—' : formatCurrency(route.rateAmount)}</dd>
        </div>
      </dl>
      {(onEdit || onDelete) && (
        <div className="route-card__actions">
          <RouteActions
            route={route}
            company={company}
            onEdit={onEdit}
            onDelete={onDelete}
            busy={busy}
          />
        </div>
      )}
    </article>
  )
}

export default function RouteList({
  routes,
  companyIndex,
  onEdit,
  onDelete,
  busyId = '',
}) {
  return (
    <div className="card route-list">
      <div className="table-wrap routes-table-wrap">
        <table className="table routes-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Fecha</th>
              <th>Km inicial</th>
              <th>Km final</th>
              <th>Recibidos</th>
              <th>No entregados</th>
              <th>Tarifa</th>
              <th>Ciudad</th>
              {(onEdit || onDelete) && (
                <th style={{ textAlign: 'right' }}>Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <RouteRow
                key={route.routeCompanyId ?? route.id}
                route={route}
                companyIndex={companyIndex}
                onEdit={onEdit}
                onDelete={onDelete}
                busy={busyId === (route.routeCompanyId ?? route.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-list route-cards">
        {routes.map((route) => (
          <RouteCard
            key={route.routeCompanyId ?? route.id}
            route={route}
            companyIndex={companyIndex}
            onEdit={onEdit}
            onDelete={onDelete}
            busy={busyId === (route.routeCompanyId ?? route.id)}
          />
        ))}
      </div>
    </div>
  )
}

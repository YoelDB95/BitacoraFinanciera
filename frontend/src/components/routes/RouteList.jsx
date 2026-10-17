import Icon from '../ui/Icon.jsx'
import { routeKm } from '../../lib/work.js'
import { formatCount, formatDate, formatKm } from '../../lib/format.js'

function companyLabel(company) {
  return company?.nombre ?? company?.legalName ?? company?.name ?? 'Empresa'
}

function routeCompanies(route, companyIndex) {
  const entries = route.empresas ?? []
  if (entries.length === 0) return 'Sin empresa'
  return entries
    .map((entry) => companyLabel(companyIndex[entry.companyId]))
    .join(' · ')
}

function routePackages(route) {
  return (route.empresas ?? []).reduce(
    (total, entry) => total + (Number(entry.paquetes) || 0),
    0,
  )
}

function RouteRow({ route, companyIndex, onDelete }) {
  return (
    <tr>
      <td>
        <div className="txn">
          <span className="txn__icon txn__icon--ruta">
            <Icon name="route" size={16} />
          </span>
          <span className="txn__text">
            <span className="txn__desc">{route.routeCode}</span>
            <span className="txn__meta">{routeCompanies(route, companyIndex)}</span>
          </span>
        </div>
      </td>
      <td>
        <span className="txn__meta">
          <Icon name="calendar" size={13} />
          {formatDate(route.fecha)}
        </span>
      </td>
      <td>
        <span className="pkg pkg--delivered">{formatKm(routeKm(route))}</span>
      </td>
      <td>
        <span className="pkg pkg--delivered">{formatCount(routePackages(route))}</span>
      </td>
      <td>
        <span className="badge">{route.city}</span>
      </td>
      <td className="col-actions">
        <span className="row-actions">
          <button
            type="button"
            className="row-action row-action--danger"
            onClick={() => onDelete(route.id)}
            aria-label={`Eliminar ${route.routeCode}`}
          >
            <Icon name="trash" size={15} />
          </button>
        </span>
      </td>
    </tr>
  )
}

function RouteCard({ route, companyIndex, onDelete }) {
  return (
    <div className="txn-card">
      <span className="txn__icon txn__icon--ruta">
        <Icon name="route" size={16} />
      </span>
      <span className="txn__text">
        <span className="txn__desc">{route.routeCode}</span>
        <span className="txn__meta">
          <span>{routeCompanies(route, companyIndex)}</span>
          <span className="txn__meta-sep">·</span>
          <span>{formatDate(route.fecha)}</span>
        </span>
        <span className="txn__meta">
          <span className="pkg pkg--delivered">{formatKm(routeKm(route))}</span>
          <span className="txn__meta-sep">·</span>
          <span className="pkg pkg--delivered">
            {formatCount(routePackages(route))} paquetes
          </span>
          <span className="txn__meta-sep">·</span>
          <span>{route.city}</span>
        </span>
      </span>
      <span className="txn-card__right">
        <span className="row-actions">
          <button
            type="button"
            className="row-action row-action--danger"
            onClick={() => onDelete(route.id)}
            aria-label={`Eliminar ${route.routeCode}`}
          >
            <Icon name="trash" size={14} />
          </button>
        </span>
      </span>
    </div>
  )
}

export default function RouteList({ routes, companyIndex, onDelete }) {
  return (
    <div className="card">
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Ruta / Empresas</th>
              <th>Fecha</th>
              <th>Km</th>
              <th>Paquetes</th>
              <th>Ciudad</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <RouteRow
                key={route.id}
                route={route}
                companyIndex={companyIndex}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-list">
        {routes.map((route) => (
          <RouteCard
            key={route.id}
            route={route}
            companyIndex={companyIndex}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}

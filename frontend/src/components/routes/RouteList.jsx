import Icon from '../ui/Icon.jsx'
import { formatCount, formatCurrency, formatDate } from '../../lib/format.js'

function RouteRow({ route, company, onEdit, onDelete }) {
  return (
    <tr>
      <td>
        <div className="txn">
          <span className="txn__icon txn__icon--ruta">
            <Icon name="route" size={16} />
          </span>
          <span className="txn__text">
            <span className="txn__desc">{route.routeCode}</span>
            <span className="txn__meta">{company?.name ?? 'Sin empresa'}</span>
          </span>
        </div>
      </td>
      <td>
        <span className="txn__meta">
          <Icon name="calendar" size={13} />
          {formatDate(route.date)}
        </span>
      </td>
      <td>
        <span className="pkg pkg--delivered">{formatCount(route.packagesDelivered)}</span>
      </td>
      <td>
        <span
          className={`pkg ${
            route.packagesUndelivered > 0 ? 'pkg--pending' : 'pkg--delivered'
          }`}
        >
          {formatCount(route.packagesUndelivered)}
        </span>
      </td>
      <td className="col-amount">
        <span className="amount amount--gasto">{formatCurrency(route.rate)}</span>
      </td>
      <td>
        <span className="badge">{route.city}</span>
      </td>
      <td className="col-actions">
        <span className="row-actions">
          <button
            type="button"
            className="row-action"
            onClick={() => onEdit(route)}
            aria-label={`Editar ${route.routeCode}`}
          >
            <Icon name="edit" size={15} />
          </button>
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

function RouteCard({ route, company, onEdit, onDelete }) {
  return (
    <div className="txn-card">
      <span className="txn__icon txn__icon--ruta">
        <Icon name="route" size={16} />
      </span>
      <span className="txn__text">
        <span className="txn__desc">{route.routeCode}</span>
        <span className="txn__meta">
          <span>{company?.name ?? 'Sin empresa'}</span>
          <span className="txn__meta-sep">·</span>
          <span>{formatDate(route.date)}</span>
        </span>
        <span className="txn__meta">
          <span className="pkg pkg--delivered">
            {formatCount(route.packagesDelivered)} entregados
          </span>
          <span className="txn__meta-sep">·</span>
          <span
            className={`pkg ${
              route.packagesUndelivered > 0 ? 'pkg--pending' : 'pkg--delivered'
            }`}
          >
            {formatCount(route.packagesUndelivered)} sin entregar
          </span>
          <span className="txn__meta-sep">·</span>
          <span>{route.city}</span>
        </span>
      </span>
      <span className="txn-card__right">
        <span className="amount amount--gasto">{formatCurrency(route.rate)}</span>
        <span className="row-actions">
          <button
            type="button"
            className="row-action"
            onClick={() => onEdit(route)}
            aria-label={`Editar ${route.routeCode}`}
          >
            <Icon name="edit" size={14} />
          </button>
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

export default function RouteList({ routes, companyIndex, onEdit, onDelete }) {
  return (
    <div className="card">
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Ruta / Empresa</th>
              <th>Fecha</th>
              <th>Entregados</th>
              <th>Sin entregar</th>
              <th style={{ textAlign: 'right' }}>Tarifa</th>
              <th>Ciudad</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <RouteRow
                key={route.id}
                route={route}
                company={companyIndex[route.companyId]}
                onEdit={onEdit}
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
            company={companyIndex[route.companyId]}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}

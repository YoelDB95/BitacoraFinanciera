import Icon from '../ui/Icon.jsx'
import { formatCount } from '../../lib/format.js'

export default function RoutesChart({ data = [], total = 0 }) {
  if (total === 0) {
    return (
      <div className="empty">
        <span className="empty__art">
          <Icon name="route" size={38} strokeWidth={1.4} />
        </span>
        <h2 className="empty__title">Sin rutas en el período</h2>
        <p className="empty__text">
          Ajusta el filtro de fechas o registra rutas para ver cuántas veces se
          hizo cada una.
        </p>
      </div>
    )
  }

  const max = Math.max(...data.map((item) => item.total), 1)

  return (
    <div
      className="bar-chart"
      role="img"
      aria-label="Cantidad de rutas realizadas por tipo de ruta"
    >
      {data.map((item) => (
        <div className="bar-chart__row" key={item.label}>
          <span className="bar-chart__label">{item.label}</span>
          <div className="bar-chart__track">
            <span
              className="bar-chart__bar"
              style={{ width: `${Math.round((item.total / max) * 100)}%` }}
            />
          </div>
          <span className="bar-chart__value">{formatCount(item.total)}</span>
        </div>
      ))}
    </div>
  )
}
import Icon from '../ui/Icon.jsx'
import { formatCurrency, formatCount } from '../../lib/format.js'

const CARD_COLORS = ['#4ade80', '#60a5fa', '#fbbf24', '#c084fc', '#fb7185', '#2dd4bf']

export default function CompanySummary({ rows }) {
  if (rows.length === 0) {
    return (
      <div className="card">
        <div className="empty">
          <span className="empty__art">
            <Icon name="building" size={38} strokeWidth={1.4} />
          </span>
          <h2 className="empty__title">No hay empresas</h2>
          <p className="empty__text">
            Una vez que registres empresas, verás aquí su actividad en el período.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="company-grid">
      {rows.map((row, index) => {
        const company = row.company
        const contact = (company.billingContacts ?? [])[0]
        const total = row.entregados + row.noEntregados
        const successRate =
          total > 0 ? Math.round((row.entregados / total) * 100) : 0
        const color = CARD_COLORS[index % CARD_COLORS.length]

        return (
          <article className="company-card" key={company.id}>
            <div className="company-card__top">
              <span
                className="company-card__icon"
                style={{ '--company-color': color }}
              >
                <Icon name="building" size={18} />
              </span>
              <div className="company-card__name-wrap">
                <h3 className="company-card__name">{company.legalName}</h3>
                <p className="company-card__meta">
                  {contact?.name || 'Sin contactos'} · {formatCount(row.rutas)} rutas
                </p>
              </div>
            </div>

            <dl className="company-card__stats">
              <div>
                <dt>Entregados</dt>
                <dd className="company-card__value">{formatCount(row.entregados)}</dd>
                <dd className="company-card__hint">
                  {successRate}% de éxito
                </dd>
              </div>
              <div>
                <dt>No entregados</dt>
                <dd
                  className={`company-card__value${
                    row.noEntregados > 0 ? ' company-card__value--danger' : ''
                  }`}
                >
                  {formatCount(row.noEntregados)}
                </dd>
                <dd className="company-card__hint">
                  {total > 0 ? `${successRate}% tasa de éxito` : 'Sin actividad'}
                </dd>
              </div>
              <div>
                <dt>A facturar</dt>
                <dd className="company-card__value">{formatCurrency(row.monto)}</dd>
                <dd className="company-card__hint">en el período</dd>
              </div>
            </dl>
          </article>
        )
      })}
    </div>
  )
}
import Icon from '../ui/Icon.jsx'
import { formatCurrency, formatCount } from '../../lib/format.js'
import { useCompanies } from '../../hooks/useCompanies.js'

const COMPANY_ICON = {
  'emp-andina': 'route',
  'emp-roble': 'building',
  'emp-sanmiguel': 'package',
  'emp-tornillo': 'briefcase',
}

export default function CompanySummary({ rows }) {
  const { companies } = useCompanies()
  const byCompany = new Map(rows.map((row) => [row.company.id, row]))

  return (
    <div className="company-grid">
      {companies.map((company) => {
        const row = byCompany.get(company.id)
        const entregados = row?.entregados ?? 0
        const noEntregados = row?.noEntregados ?? 0
        const monto = row?.monto ?? 0
        const rutas = row?.rutas ?? 0
        const total = entregados + noEntregados
        const successRate = total > 0 ? Math.round((entregados / total) * 100) : 0

        return (
          <article className="company-card" key={company.id}>
            <div className="company-card__top">
              <span
                className="company-card__icon"
                style={{ '--company-color': company.color }}
              >
                <Icon name={COMPANY_ICON[company.id] ?? 'building'} size={18} />
              </span>
              <div className="company-card__name-wrap">
                <h3 className="company-card__name">{company.nombre}</h3>
                <p className="company-card__meta">
                  {company.contacto} · {rutas} rutas
                </p>
              </div>
            </div>

            <dl className="company-card__stats">
              <div>
                <dt>Entregados</dt>
                <dd className="company-card__value">{formatCount(entregados)}</dd>
                <dd className="company-card__hint">
                  {successRate}% de éxito
                </dd>
              </div>
              <div>
                <dt>No entregados</dt>
                <dd className="company-card__value company-card__value--danger">
                  {formatCount(noEntregados)}
                </dd>
                <dd className="company-card__hint">
                  {total > 0 ? `${successRate}% tasa de éxito` : 'Sin actividad'}
                </dd>
              </div>
              <div>
                <dt>A facturar</dt>
                <dd className="company-card__value">{formatCurrency(monto)}</dd>
                <dd className="company-card__hint">en el período</dd>
              </div>
            </dl>
          </article>
        )
      })}
    </div>
  )
}
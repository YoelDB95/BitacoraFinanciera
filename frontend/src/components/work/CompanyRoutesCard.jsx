import Icon from '../ui/Icon.jsx'
import RoutesChart from './RoutesChart.jsx'
import { formatCount } from '../../lib/format.js'
import { companyLabel } from '../../lib/routeDisplay.js'

const CARD_COLORS = ['#4ade80', '#60a5fa', '#fbbf24', '#c084fc', '#fb7185', '#2dd4bf']

export default function CompanyRoutesCard({ company, data = [], total = 0, index = 0 }) {
  const color = CARD_COLORS[index % CARD_COLORS.length]

  return (
    <article className="company-card company-routes-card">
      <div className="company-card__top">
        <span
          className="company-card__icon"
          style={{ '--company-color': color }}
        >
          <Icon name="route" size={18} />
        </span>
        <div className="company-card__name-wrap">
          <h3 className="company-card__name">{companyLabel(company)}</h3>
          <p className="company-card__meta">
            {formatCount(total)}{' '}
            {total === 1 ? 'ruta de reparto' : 'rutas de reparto'}
          </p>
        </div>
      </div>

      <RoutesChart data={data} total={total} />
    </article>
  )
}

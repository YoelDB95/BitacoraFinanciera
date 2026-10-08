import Icon from '../ui/Icon.jsx'

const CARD_COLORS = ['#4ade80', '#60a5fa', '#fbbf24', '#c084fc', '#fb7185', '#2dd4bf']

export default function CompanyCard({ company, index = 0 }) {
  const contacts = company.billingContacts ?? []
  const primary = contacts.find((contact) => contact.isPrimary) ?? contacts[0]
  const color = CARD_COLORS[index % CARD_COLORS.length]
  const meta = company.businessName || primary?.name || 'Sin contactos'
  const contactNames =
    contacts.map((contact) => contact.name).filter(Boolean).join(', ') || '—'
  const notes =
    company.billingNotes ||
    contacts.map((contact) => contact.notes).filter(Boolean).join(' · ') ||
    '—'

  return (
    <article className="company-card">
      <div className="company-card__top">
        <span className="company-card__icon" style={{ '--company-color': color }}>
          <Icon name="building" size={18} />
        </span>
        <div className="company-card__name-wrap">
          <h3 className="company-card__name">{company.legalName}</h3>
          <p className="company-card__meta">{meta}</p>
        </div>
      </div>

      <dl className="company-card__info">
        <div>
          <dt>CUIT</dt>
          <dd>{company.cuit || '—'}</dd>
        </div>
        <div>
          <dt>Correo</dt>
          <dd>{primary?.email || '—'}</dd>
        </div>
        <div>
          <dt>Contactos de facturación</dt>
          <dd>{contactNames}</dd>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <dt>Dirección de facturación</dt>
          <dd>{company.billingAddress || '—'}</dd>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <dt>Notas</dt>
          <dd>{notes}</dd>
        </div>
      </dl>
    </article>
  )
}
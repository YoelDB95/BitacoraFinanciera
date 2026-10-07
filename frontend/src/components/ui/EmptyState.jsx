import Icon from './Icon.jsx'

export default function EmptyState({
  icon = 'inbox',
  title,
  text,
  action,
  secondaryAction,
}) {
  return (
    <div className="card">
      <div className="empty">
        <span className="empty__art">
          <Icon name={icon} size={38} strokeWidth={1.4} />
        </span>
        <h2 className="empty__title">{title}</h2>
        <p className="empty__text">{text}</p>
        {(action || secondaryAction) && (
          <div className="empty__actions">
            {action}
            {secondaryAction}
          </div>
        )}
      </div>
    </div>
  )
}

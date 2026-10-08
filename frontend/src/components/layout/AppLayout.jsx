import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'
import { NAV_ITEMS } from '../../lib/constants.js'
import { useTransactions } from '../../hooks/useTransactions.js'
import { formatCompact } from '../../lib/format.js'

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { transactions, summary } = useTransactions()
  const { pathname } = useLocation()

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

const isMatch = (item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to)

  const current =
    NAV_ITEMS.find((item) =>
      item.children
        ? item.children.some(isMatch)
        : isMatch(item),
    ) ?? NAV_ITEMS[0]

  return (
    <div className="app-shell">
      {menuOpen && (
        <div
          className="overlay"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar${menuOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <span className="sidebar__logo">
            <Icon name="wallet" size={20} />
          </span>
          <span className="sidebar__brand-text">
            <span className="sidebar__title">Bitácora</span>
            <span className="sidebar__subtitle">Financiera</span>
          </span>
        </div>

        <p className="sidebar__section">Menú</p>
        <nav className="sidebar__nav" aria-label="Navegación principal">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <div key={item.label} className="nav-group">
                <span className="nav-group__label">
                  <span className="nav-link__icon">
                    <Icon name={item.icon} size={18} />
                  </span>
                  {item.label}
                </span>
                <div className="nav-group__list">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      end={child.end}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        `nav-link nav-link--sub${
                          isActive ? ' nav-link--active' : ''
                        }`
                      }
                    >
                      <span className="nav-link__dot" />
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `nav-link${isActive ? ' nav-link--active' : ''}`
                }
              >
                <span className="nav-link__icon">
                  <Icon name={item.icon} size={18} />
                </span>
                {item.label}
                {item.to === '/transacciones' && transactions.length > 0 && (
                  <span className="nav-link__badge">{transactions.length}</span>
                )}
              </NavLink>
            ),
          )}
        </nav>

        <div className="sidebar__footer">
          <p className="sidebar__footer-label">Balance total</p>
          <p className="sidebar__footer-value">
            {formatCompact(summary.balance)}
          </p>
          <p className="sidebar__footer-hint">
            {summary.balance >= 0 ? '▲ Positivo' : '▼ Negativo'} este periodo
          </p>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button
            type="button"
            className="icon-button menu-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={18} />
          </button>

          <span className="topbar__title">{current.label}</span>
          <span className="topbar__spacer" />

          <button type="button" className="icon-button" aria-label="Notificaciones">
            <Icon name="chart" size={18} />
          </button>
          <span className="topbar__avatar" title="Perfil">
            YR
          </span>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

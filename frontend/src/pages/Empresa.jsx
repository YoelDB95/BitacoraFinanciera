import { useCallback, useEffect, useMemo, useState } from 'react'
import Icon from '../components/ui/Icon.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import CompanyCard from '../components/work/CompanyCard.jsx'
import CompanyModal from '../components/work/CompanyModal.jsx'
import CompanyDetailModal from '../components/work/CompanyDetailModal.jsx'
import {
  getCompanies,
  createCompany,
  updateCompany,
  updateCompanyRate,
} from '../lib/api.js'
import { formatCount } from '../lib/format.js'

async function fetchCompanies() {
  const result = await getCompanies()
  return [...result].sort((a, b) => a.legalName.localeCompare(b.legalName))
}

export default function Empresa() {
  const [companies, setCompanies] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const load = useCallback(async (selectId) => {
    try {
      const list = await fetchCompanies()
      setCompanies(list)
      setError('')
      setStatus('ready')
      if (selectId) {
        setSelectedCompany(list.find((item) => item.id === selectId) ?? null)
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudieron cargar las empresas.',
      )
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchCompanies()
      .then((result) => {
        if (cancelled) return
        setCompanies(result)
        setError('')
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setError(
          err instanceof Error ? err.message : 'No se pudieron cargar las empresas.',
        )
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleCreate = useCallback(
    async (values) => {
      try {
        await createCompany(values)
        setModalOpen(false)
        await load()
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'No se pudo crear la empresa.',
        )
      }
    },
    [load],
  )

  const handleOpenDetail = useCallback((company) => {
    setSelectedCompany(company)
    setDetailOpen(true)
  }, [])

  const handleSaveInfo = useCallback(
    async (id, data) => {
      await updateCompany(id, data)
      await load(id)
    },
    [load],
  )

  const handleSaveRate = useCallback(
    async (routingType, data) => {
      await updateCompanyRate(routingType, data)
      await load(selectedCompany?.id)
    },
    [load, selectedCompany],
  )

  const companyCount = companies.length

  const body = useMemo(() => {
    if (companyCount === 0) {
      return (
        <EmptyState
          icon="building"
          title="Aún no hay empresas"
          text="Registra tu primera empresa para llevar el control de sus rutas, paquetes y facturas."
          action={
            <button
              type="button"
              className="button button--primary"
              onClick={() => setModalOpen(true)}
            >
              <Icon name="plus" size={16} />
              Nueva empresa
            </button>
          }
        />
      )
    }
    return (
      <div className="company-grid">
        {companies.map((company, index) => (
          <CompanyCard
            key={company.id}
            company={company}
            index={index}
            onClick={() => handleOpenDetail(company)}
          />
        ))}
      </div>
    )
  }, [companyCount, companies, handleOpenDetail])

  return (
    <>
      <div className="page-head">
        <div>
          <p className="page-head__eyebrow">Trabajo</p>
          <h1 className="page-head__title">Empresa</h1>
          <p className="page-head__desc">
            {status === 'loading'
              ? 'Cargando empresas…'
              : companyCount === 0
                ? 'Todavía no hay empresas registradas.'
                : `${formatCount(companyCount)} ${
                    companyCount === 1
                      ? 'empresa registrada'
                      : 'empresas registradas'
                  }. Consulta sus datos o agrega una nueva.`}
          </p>
        </div>
        <button
          type="button"
          className="button button--primary"
          onClick={() => setModalOpen(true)}
        >
          <Icon name="plus" size={16} />
          Nueva empresa
        </button>
      </div>

      <section className="work-section" aria-label="Empresas registradas">
        <div className="work-section__head">
          <div>
            <h2 className="work-section__title">Empresas registradas</h2>
            <p className="work-section__subtitle">
              Información de contacto y facturación de cada empresa.
            </p>
          </div>
          <span className="results-count">
            {status === 'loading'
              ? 'Cargando…'
              : `${formatCount(companyCount)} empresas`}
          </span>
        </div>

        {status === 'loading' ? (
          <div className="card">
            <div className="empty">
              <span className="empty__art">
                <Icon name="building" size={38} strokeWidth={1.4} />
              </span>
              <h2 className="empty__title">Cargando empresas…</h2>
            </div>
          </div>
        ) : status === 'error' && companyCount === 0 ? (
          <EmptyState
            icon="alert"
            title="No se pudieron cargar las empresas"
            text={error}
            action={
              <button
                type="button"
                className="button button--primary"
                onClick={() => load()}
              >
                <Icon name="close" size={16} />
                Reintentar
              </button>
            }
          />
        ) : (
          <>
            {error && (
              <div className="notice">
                <Icon name="alert" size={14} />
                <span>{error}</span>
              </div>
            )}
            {body}
          </>
        )}
      </section>

      <CompanyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />

      <CompanyDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        company={selectedCompany}
        onSaveInfo={handleSaveInfo}
        onSaveRate={handleSaveRate}
      />
    </>
  )
}
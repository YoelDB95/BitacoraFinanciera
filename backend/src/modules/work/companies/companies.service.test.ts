import { beforeEach, describe, expect, it, vi } from 'vitest'

const { repositoryMock, routesRepositoryMock } = vi.hoisted(() => ({
  repositoryMock: {
    createCompany: vi.fn(),
    createCompanyBillingContact: vi.fn(),
    getAllCompanies: vi.fn(),
    getPackageRates: vi.fn(),
  },
  routesRepositoryMock: { getRouteRates: vi.fn() },
}))

vi.mock('./companies.repository', () => ({ default: repositoryMock }))
vi.mock('../routes/routes.repository', () => ({ default: routesRepositoryMock }))

import companiesService from './companies.service'

describe('companies.service', () => {
  beforeEach(() => vi.clearAllMocks())

  it('getCompanies delega en el repositorio', async () => {
    repositoryMock.getAllCompanies.mockResolvedValue([{ id: '1' }])
    const result = await companiesService.getCompanies()
    expect(repositoryMock.getAllCompanies).toHaveBeenCalledOnce()
    expect(result).toEqual([{ id: '1' }])
  })

  it('getCompanyRates usa tarifas de ruta para ROUTE', async () => {
    routesRepositoryMock.getRouteRates.mockResolvedValue([{ amount: '100' }])
    const result = await companiesService.getCompanyRates('ROUTE')
    expect(routesRepositoryMock.getRouteRates).toHaveBeenCalledOnce()
    expect(repositoryMock.getPackageRates).not.toHaveBeenCalled()
    expect(result).toEqual({ routingType: 'ROUTE', companyRate: [{ amount: '100' }] })
  })

  it('getCompanyRates usa tarifas de paquete para PACKAGE', async () => {
    repositoryMock.getPackageRates.mockResolvedValue([{ amount: '200' }])
    const result = await companiesService.getCompanyRates('PACKAGE')
    expect(repositoryMock.getPackageRates).toHaveBeenCalledOnce()
    expect(routesRepositoryMock.getRouteRates).not.toHaveBeenCalled()
    expect(result).toEqual({ routingType: 'PACKAGE', companyRate: [{ amount: '200' }] })
  })

  it('createCompany crea empresa y contacto y formatea fechas', async () => {
    repositoryMock.createCompany.mockResolvedValue({
      id: 'company-1',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
      legalName: 'Acme',
    })
    repositoryMock.createCompanyBillingContact.mockResolvedValue({
      id: 'contact-1',
      companyId: 'company-1',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
    })

    const result = await companiesService.createCompany({ cuit: '1', legalName: 'Acme' })

    expect(repositoryMock.createCompany).toHaveBeenCalledWith({ cuit: '1', legalName: 'Acme' })
    expect(repositoryMock.createCompanyBillingContact).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'company-1' }),
      { cuit: '1', legalName: 'Acme' },
    )
    expect(result).toEqual({
      company: {
        id: 'company-1',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
        legalName: 'Acme',
      },
      billingContact: {
        id: 'contact-1',
        companyId: 'company-1',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
      },
    })
  })

  it('createCompany devuelve billingContact null si no se crea', async () => {
    repositoryMock.createCompany.mockResolvedValue({
      id: 'company-1',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    })
    repositoryMock.createCompanyBillingContact.mockResolvedValue(null)

    const result = await companiesService.createCompany({ cuit: '1', legalName: 'Acme' })
    expect(result.billingContact).toBeNull()
  })
})
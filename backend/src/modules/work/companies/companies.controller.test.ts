import { beforeEach, describe, expect, it, vi } from 'vitest'

const { serviceMock } = vi.hoisted(() => ({
  serviceMock: {
    getCompanies: vi.fn(),
    createCompany: vi.fn(),
    getCompanyRates: vi.fn(),
  },
}))

vi.mock('./companies.service', () => ({ default: serviceMock }))

import companiesController from './companies.controller'

const createRes = () => {
  const res: any = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}
const createReq = (overrides: any = {}) => ({ body: {}, params: {}, ...overrides })

describe('companies.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('getCompanies mapea tarifa activa y contactos', async () => {
    serviceMock.getCompanies.mockResolvedValue([
      {
        id: 'company-1',
        cuit: '20-123',
        legalName: 'Acme',
        businessName: 'Acme SA',
        billingAddress: 'Calle 1',
        billingNotes: null,
        active: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
        routingType: 'ROUTE',
        companyRates: [{ amount: '1000', validFrom: new Date('2000-01-01'), validTo: null }],
        companyBillingContacts: [
          { id: 'c1', name: 'Ana', email: 'a@a.com', notes: null, isPrimary: true },
        ],
      },
    ])
    const res = createRes()

    await companiesController.getCompanies(createReq(), res)

    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'company-1',
        tarifa: 1000,
        routingType: 'ROUTE',
        billingContacts: [
          { id: 'c1', name: 'Ana', email: 'a@a.com', notes: null, isPrimary: true },
        ],
      }),
    ])
  })

  it('getCompanies responde 500 si el service falla', async () => {
    serviceMock.getCompanies.mockRejectedValue(new Error('boom'))
    const res = createRes()

    await companiesController.getCompanies(createReq(), res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'No se pudieron obtener las empresas' })
  })

  it('createCompany valida campos obligatorios', async () => {
    const res = createRes()

    await companiesController.createCompany(createReq({ body: { cuit: '1' } }), res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(serviceMock.createCompany).not.toHaveBeenCalled()
  })

  it('createCompany crea con datos válidos', async () => {
    serviceMock.createCompany.mockResolvedValue({ company: { id: '1' } })
    const body = {
      cuit: '1',
      legalName: 'Acme',
      billingContactEmail: 'a@a.com',
      billingContactName: 'Ana',
    }
    const res = createRes()

    await companiesController.createCompany(createReq({ body }), res)

    expect(serviceMock.createCompany).toHaveBeenCalledWith(body)
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('getCompanyRates devuelve las tarifas', async () => {
    serviceMock.getCompanyRates.mockResolvedValue({ routingType: 'ROUTE', companyRate: [] })
    const res = createRes()

    await companiesController.getCompanyRates(createReq({ params: { routingType: 'ROUTE' } }), res)

    expect(serviceMock.getCompanyRates).toHaveBeenCalledWith('ROUTE')
    expect(res.json).toHaveBeenCalledWith({ routingType: 'ROUTE', companyRate: [] })
  })

  it('getCompanyRates responde 500 si el service falla', async () => {
    serviceMock.getCompanyRates.mockRejectedValue(new Error('boom'))
    const res = createRes()

    await companiesController.getCompanyRates(createReq({ params: { routingType: 'PACKAGE' } }), res)

    expect(res.status).toHaveBeenCalledWith(500)
  })
})
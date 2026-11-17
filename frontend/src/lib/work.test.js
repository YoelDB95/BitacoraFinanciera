import { describe, it, expect } from 'vitest'
import {
  ROUTE_TYPES,
  ROUTE_OPTIONS,
  CITY_OPTIONS,
  COMPANIES,
  COMPANY_INDEX,
  ENVIO_FACTURACION_OPTIONS,
  classifyRouteType,
  countRoutesByTypeForCompany,
  routeCompanyCards,
  summarize,
  summarizeByCompany,
} from './work.js'

const ROUTE_ROWS = [
  {
    id: 'rc-1',
    routeId: 'route-1',
    kmInicial: 100,
    kmFinal: 150,
    billingAmount: 500,
    rateAmount: 520,
    empresas: [
      {
        companyId: 'company-package',
        routingType: 'PACKAGE',
        routeTypeName: 'Ruta A',
        routeTypeCode: 'A',
        paquetes: 10,
        noEntregados: 1,
      },
    ],
  },
  {
    id: 'rc-1-bis',
    routeId: 'route-1',
    kmInicial: 100,
    kmFinal: 150,
    billingAmount: 300,
    rateAmount: 300,
    empresas: [
      {
        companyId: 'company-route',
        routingType: 'ROUTE',
        routeTypeName: 'PNU',
        routeTypeCode: 'PNU',
        paquetes: 5,
        noEntregados: 0,
      },
    ],
  },
  {
    id: 'rc-2',
    routeId: 'route-2',
    kmInicial: 200,
    kmFinal: 0,
    billingAmount: null,
    rateAmount: 80,
    empresas: [
      {
        companyId: 'company-package',
        routingType: 'PACKAGE',
        routeTypeName: '',
        routeTypeCode: '',
        paquetes: 4,
        noEntregados: 2,
      },
    ],
  },
  {
    id: 'rc-3',
    routeId: 'route-3',
    kmInicial: 250,
    kmFinal: 260,
    billingAmount: 120,
    rateAmount: 120,
    empresas: [
      {
        companyId: 'company-package',
        routingType: 'PACKAGE',
        routeTypeCode: 'B',
        paquetes: 6,
        noEntregados: 0,
      },
    ],
  },
  {
    id: 'rc-4',
    routeId: 'route-4',
    kmInicial: 300,
    kmFinal: 300,
    billingAmount: null,
    rateAmount: 0,
    empresas: [
      {
        companyId: 'company-quiet',
        routingType: 'PACKAGE',
        routeTypeName: '',
        paquetes: 2,
        noEntregados: 0,
      },
    ],
  },
]

const TEST_COMPANIES = [
  { id: 'company-package', legalName: 'Paquetería Sur', routingType: 'PACKAGE' },
  { id: 'company-route', legalName: 'Rutas del Norte', routingType: 'ROUTE' },
  { id: 'company-quiet', legalName: 'Sin Clasificar', routingType: 'PACKAGE' },
]

describe('work helpers', () => {
  it('has route types and options', () => {
    expect(Array.isArray(ROUTE_TYPES)).toBe(true)
    expect(ROUTE_OPTIONS.length).toBe(ROUTE_TYPES.length)
  })

  it('has cities and companies', () => {
    expect(CITY_OPTIONS.length).toBeGreaterThan(0)
    expect(COMPANIES.length).toBeGreaterThan(0)
    expect(COMPANY_INDEX[COMPANIES[0].id]).toBeDefined()
  })

  it('defines envio/facturacion options', () => {
    expect(ENVIO_FACTURACION_OPTIONS.length).toBeGreaterThan(0)
  })

  it('summarizes rows without double counting repeated routes', () => {
    const stats = summarize(ROUTE_ROWS, TEST_COMPANIES)

    expect(stats.rutas).toBe(4)
    expect(stats.km).toBe(60)
    expect(stats.monto).toBe(1000)
    expect(stats.entregados).toBe(27)
    expect(stats.noEntregados).toBe(3)
    expect(stats.empresas).toBe(3)
  })

  it('groups ROUTE routes by company using only existing types', () => {
    const cards = routeCompanyCards(ROUTE_ROWS, TEST_COMPANIES)

    expect(cards).toHaveLength(1)
    expect(cards[0].company.id).toBe('company-route')
    expect(cards[0].total).toBe(1)
    expect(cards[0].data).toEqual([{ label: 'PNU', total: 1 }])
    expect(cards[0].data.every((item) => item.total > 0)).toBe(true)
  })

  it('counts only classified ROUTE rows for a company', () => {
    const data = countRoutesByTypeForCompany(
      ROUTE_ROWS,
      'company-route',
      ROUTE_TYPES,
      'ROUTE',
    )
    const total = data.reduce((sum, item) => sum + item.total, 0)

    expect(total).toBe(1)
  })

  it('inherits the route type from another company on the same route', () => {
    const rows = [
      {
        id: 'shared-route-empty',
        routeId: 'shared-route',
        empresas: [
          {
            companyId: 'company-route',
            routingType: 'ROUTE',
            routeTypeName: '',
            routeTypeCode: '',
          },
        ],
      },
      {
        id: 'shared-route-typed',
        routeId: 'shared-route',
        empresas: [
          {
            companyId: 'company-package',
            routingType: 'PACKAGE',
            routeTypeName: 'Ruta D',
            routeTypeCode: 'D',
          },
        ],
      },
      {
        id: 'shared-unclassified',
        routeId: 'unclassified-route',
        empresas: [
          {
            companyId: 'company-route',
            routingType: 'ROUTE',
            routeTypeName: '',
            routeTypeCode: '',
          },
        ],
      },
    ]

    const data = countRoutesByTypeForCompany(
      rows,
      'company-route',
      ROUTE_TYPES,
      'ROUTE',
    )

    expect(data.find((item) => item.label === 'Ruta D').total).toBe(1)
    expect(data.reduce((sum, item) => sum + item.total, 0)).toBe(1)
  })

  it('classifies route types from name or code', () => {
    expect(classifyRouteType({ routeTypeName: 'Ruta C', routeTypeCode: 'C' })).toBe(
      'Ruta C',
    )
    expect(classifyRouteType({ routeTypeCode: 'B' })).toBe('Ruta B')
    expect(classifyRouteType({ routeTypeName: '', routeTypeCode: '' })).toBeNull()
  })

  it('summarizes activity per company with real amounts', () => {
    const rows = summarizeByCompany(ROUTE_ROWS, TEST_COMPANIES)
    const packageRow = rows.find((row) => row.company.id === 'company-package')

    expect(packageRow.entregados).toBe(20)
    expect(packageRow.noEntregados).toBe(3)
    expect(packageRow.rutas).toBe(3)
    expect(packageRow.monto).toBe(700)
  })
})

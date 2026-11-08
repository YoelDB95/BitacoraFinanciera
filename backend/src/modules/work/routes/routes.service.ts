/*
        Contiene las reglas de negocio y coordina operaciones entre entidades.
*/

import { CompanyRouteWithoutRouteID, CreateRouteInput, FilterRoutes  } from './routes.types'
import routesRepository from "./routes.repository"

const getRoutes = (filters: FilterRoutes) => {
  const hasMonth = Boolean(filters.month)
  const hasRange = Boolean(filters.startDate || filters.endDate)

  // Debe venir exactamente uno de los dos modos.
  if (!hasMonth && !hasRange) {
    throw new Error('Debe proporcionar un mes o un rango de fechas para filtrar las rutas')
  }

  if (hasMonth && hasRange) {
    throw new Error('No se puede proporcionar un mes y un rango de fechas al mismo tiempo')
  }

  // Validación del modo mes.
  if (hasMonth && !filters.month!.match(/^\d{4}-(0[1-9]|1[0-2])$/)) {
    throw new Error('El mes debe tener el formato YYYY-MM')
  }

  // Validación del modo rango.
  if (hasRange) {
    if (!filters.startDate || !filters.endDate) {
      throw new Error('Debe proporcionar startDate y endDate para filtrar por rango')
    }

    if (!filters.startDate || !filters.endDate) {
      throw new Error('El rango de fechas debe tener el formato YYYY-MM-DD')
    }

    if (filters.startDate > filters.endDate) {
      throw new Error('startDate no puede ser posterior a endDate')
    }
  }

  // implementar la busqueda de empresas por companyId si se proporciona
  return routesRepository.getRoutes(filters)
}

const createRoute = async (route: CreateRouteInput) => {
  console.log('route in service: ', route);
	
  /**
    route in service:  {
      routeDate: '2026-11-04',
      destinationCity: 'Azul',
      vehicleKmStart: 1,
      vehicleKmEnd: 2,
      notes: null,
      companies: [
        {
          companyId: 'aa51cdbd-d17b-4a84-b3ce-35fb604236a6',
          packagesReceived: 2,
          packagesUndelivered: 0,
          routingType: 'ROUTE',
          rateAmount: 121000,
          routeRateAmount: 121000,
          routeRateId: '41836834-5154-491d-af54-353c9e316289',
          routeTypeId: 'f61e9e7f-97d4-4ba8-b47a-1c26f7450312'
        },
        {
          companyId: '5ff59e50-09a4-4c10-8c15-9c4a4757bab5',
          packagesReceived: 1,
          packagesUndelivered: 0,
          routingType: 'PACKAGE',
          rateAmount: 1840,
          packageAmount: 1840,
          companyRateId: '2a97efdc-a35b-4279-9854-3ac6e48aa622'
        }
      ]
    }
  */
  
  if (
    !route.routeDate ||
    !Number.isFinite(route.vehicleKmStart) ||
    route.vehicleKmStart < 0 ||
    !route.destinationCity ||
    !route.companies ||
    route.companies.length < 1
  )
    throw new Error('Los datos de la ruta son inválidos');

  if (
    route.vehicleKmEnd != null &&
    (!Number.isFinite(route.vehicleKmEnd) ||
      route.vehicleKmEnd < route.vehicleKmStart)
  )
    throw new Error('Los kilómetros finales deben ser válidos y no menores que los iniciales');

  let { companies } = route
  
  companies.forEach(company => {
    if (company.routingType !== 'PACKAGE' && company.routingType !== 'ROUTE') 
      throw new Error('El tipo de ruta es incorrecto')
  })

  const newRoute = {
    destinationCity: route.destinationCity,
    notes: route.notes,
    routeDate: route.routeDate,
    vehicleKmEnd: route.vehicleKmEnd,
    vehicleKmStart: route.vehicleKmStart,
  }
  

  let newCompanyRoutes = []
  for (const company of companies) {
    let newCompany = {} as CompanyRouteWithoutRouteID
		if (company.routingType === 'ROUTE') {
      //armar newRoute para ROUTE
      newCompany = {
	      companyId: company.companyId,
	      packagesReceived: company.packagesReceived,
	      packagesUndelivered: company.packagesUndelivered,
	      rateAmount: company.routeRateAmount,
	      routeRateAmount: company.routeRateAmount,
	      routeRateId: company.routeRateId,
	      routeTypeId: company.routeTypeId
      }
    }
    else {
      //armar newRoute para PACKAGE
      newCompany = {
	      companyId: company.companyId,
	      packagesReceived: company.packagesReceived,
	      packagesUndelivered: company.packagesUndelivered,
	      rateAmount: company.packageAmount,
	      companyRateAmount: company.packageAmount,
        companyRateId: company.companyRateId,
      }
    }

    newCompanyRoutes.push(newCompany)
	}
  
  return routesRepository.createRouteWithCompanies(newRoute, newCompanyRoutes)
}

export default {
  getRoutes,
  createRoute
}
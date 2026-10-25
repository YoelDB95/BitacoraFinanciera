/*
        Contiene las reglas de negocio y coordina operaciones entre entidades.
*/

import { CompanyRouteWithoutRouteID, ServiceRoute,  } from './routes.types'
import routesRepository from "./routes.repository"

const getRoutes = () => {
  return routesRepository.getRoutes()
}

const createRoute = async (route: ServiceRoute) => {
	/**
	 {
      routeCode: 'Ruta A', no lo necesito
      routeId: 'ncsg', para CompanyRoute
      rateAmount: 1938, para CompanyRoute
      routeRateAmount: 1938, para CompanyRoute
      routeRateId: 'nzkvanl', para CompanyRoute
      routeTypeId: 'bjvnak', para CompanyRoute
      routeDate: '2026-10-17', para Route
      destinationCity: 'az', para Route
      vehicleKmStart: 1, para Route
      vehicleKmEnd: 2, para Route
      notes: null, para Route
      routeType: 'ROUTING',
      companies: [
        {
          companyId: 'aa51cdbd-d17b-4a84-b3ce-35fb604236a6', para CompanyRoute
          packagesReceived: 1, para CompanyRoute
          packagesUndelivered: 0 para CompanyRoute
        },
        {
          companyId: '5ff59e50-09a4-4c10-8c15-9c4a4757bab5',
          packagesReceived: 1,
          packagesUndelivered: 0,
          packageAmount: 7589, para CompanyRoute
          companyRateId: 'hsivol', para CompanyRoute
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

  if (route.routingType !== 'PACKAGE' && route.routingType !== 'ROUTE') 
    throw new Error('El tipo de ruta es incorrecto')
  
  const newRoute = {
    destinationCity: route.destinationCity,
    notes: route.notes,
    routeDate: route.routeDate,
    vehicleKmEnd: route.vehicleKmEnd,
    vehicleKmStart: route.vehicleKmStart,
  }
  
  let { companies } = route

  let newCompanyRoutes = []
  for (const company of companies) {
    let newCompany = {} as CompanyRouteWithoutRouteID
		if (route.routingType === 'ROUTE') {
      //armar newRoute para ROUTE
      newCompany = {
	      companyId: company.companyId,
	      packagesReceived: company.packagesReceived,
	      packagesUndelivered: company.packagesUndelivered,
	      rateAmount: route.routeRateAmount,
	      routeRateAmount: route.routeRateAmount,
	      routeRateId: route.routeRateId,
	      routeTypeId: route.routeTypeId
      }
    }
    else {
      //armar newRoute para PACKAGE
      newCompany = {
	      companyId: company.companyId,
	      packagesReceived: company.packagesReceived,
	      packagesUndelivered: company.packagesUndelivered,
	      rateAmount: route.routeRateAmount,
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
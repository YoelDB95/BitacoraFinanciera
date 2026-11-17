/*
        Contiene las reglas de negocio y coordina operaciones entre entidades.
*/

import { CompanyRouteWithoutRouteID, CreateRouteInput, FilterRoutes, UpdateRouteInput  } from './routes.types.js'
import routesRepository from "./routes.repository.js"

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

  console.log('Creando ruta con los siguientes datos:', route)
  
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
      newCompany = {
	      companyId: company.companyId,
	      packagesReceived: company.packagesReceived,
	      packagesUndelivered: company.packagesUndelivered,
	      rateAmount: company.packageAmount,
	      companyRateAmount: company.packageAmount,
        companyRateId: company.companyRateId,
        routeTypeId: company.routeTypeId ?? null,
      }
    }

    newCompanyRoutes.push(newCompany)
	}
  
  return routesRepository.createRouteWithCompanies(newRoute, newCompanyRoutes)
}

const modifyRoute = async (route: UpdateRouteInput) => {
  if (
    !route.routeDate ||
    !Number.isFinite(route.vehicleKmStart) ||
    route.vehicleKmStart < 0 ||
    !route.destinationCity
  )
    throw new Error('Los datos de la ruta son inválidos');

  if (
    route.vehicleKmEnd != null &&
    (!Number.isFinite(route.vehicleKmEnd) ||
      route.vehicleKmEnd < route.vehicleKmStart)
  )
    throw new Error('Los kilómetros finales deben ser válidos y no menores que los iniciales');

  if (!route.routeId || !route.routeCompanyId) {
    throw new Error('Se requiere routeId y routeCompanyId para modificar la ruta')
  }

  const { routeCompanyId, routeId, ...routeData } = route

  const updatedRoute = await routesRepository.updateRouteWithCompanies(routeId, routeCompanyId, routeData)
  return updatedRoute
}

const deleteRoute = async (routeCompanyId: string) => {
  /*if (routesRepository.routeHasInvoices(routeCompanyId)) {
    return await routesRepository.deleteRoute(routeCompanyId)
  }*/
}

const deleteCompanyRoute = async (routeCompanyId: string) => {
  return await routesRepository.deleteCompanyRoute(routeCompanyId)
}

export default {
  getRoutes,
  createRoute,
  modifyRoute,
  deleteRoute,
  deleteCompanyRoute
}
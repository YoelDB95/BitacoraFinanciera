/*
        Contiene las reglas de negocio y coordina operaciones entre entidades.
*/

import { Route } from './routes.types'
import routesRepository from "./routes.repository"
import companiesRepository from '../companies/companies.repository'
import { RoutingType } from '../companies/companies.types'

const getRoutes = () => {
  return routesRepository.getRoutes()
}

const createRoute = async (route: Route) => {
				/**
		 * {
  routeCode: 'Ruta A',
  routeDate: '2026-10-17',
  destinationCity: 'az',
  vehicleKmStart: 1,
  vehicleKmEnd: 2,
  notes: null,
  companies: [
    {
      companyId: 'aa51cdbd-d17b-4a84-b3ce-35fb604236a6',
      packagesReceived: 1,
      packagesUndelivered: 0
    },
    {
      companyId: '5ff59e50-09a4-4c10-8c15-9c4a4757bab5',
      packagesReceived: 1,
      packagesUndelivered: 0
    }
  ]
}

		 * 
		 * 
		 */
	
	let {companies, ...newRoute} = route
	if (!route.routeDate || !route.vehicleKmStart || !route.destinationCity || !route.companies || !route.routeType)
		throw new Error('Falta la fecha, los kilometros iniciales, la ciudad de destino, el tipo de ruta o la empresa')
	
  for (const company of companies) {
		if (route.routeType === 'ROUTE') {
			const routeTypeRecieved = await routesRepository.getTypeRoute(route.routeCode)
			console.log('routeTypeRecieved', routeTypeRecieved);
		}
	}
}

export default {
  getRoutes,
  createRoute
}
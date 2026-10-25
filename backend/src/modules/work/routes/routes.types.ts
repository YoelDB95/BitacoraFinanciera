export interface ServiceRoute
  extends Route,
    Omit<CompanyRoute, 'companyId' | 'routeId'> {
			routingType: 'ROUTE' | 'PACKAGE',
  		companies: {
			companyId: string,
			packagesReceived?: number | null,
			packagesUndelivered?: number | null,
			packageAmount?: number | null,
			companyRateId?: string | null
		}[]
}

export interface Route {
	destinationCity: string,
	notes?: string | null,
	routeDate: string,
	userId?: string | null,
	vehicleKmEnd?: number | null,
	vehicleKmStart: number
}

export interface CompanyRoute {
	billingAmount?: number | null,
	companyId: string,
	companyRateAmount?: number | null,
	companyRateId?: string | null,
	notes?: string | null,
	packagesReceived?: number | null,
	packagesUndelivered?: number | null,
	rateAmount?: number | null,
	routeId: string,
	routeRateAmount?: number | null,
	routeRateId?: string | null,
	routeTypeId?: string | null
}

export type CompanyRouteWithoutRouteID = Omit<CompanyRoute, 'routeId'>
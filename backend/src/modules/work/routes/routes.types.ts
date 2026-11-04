export interface ServiceRoute
  extends Route,
    Omit<CompanyRoute, 'companyId' | 'routeId'> {
  	companies: {
			routingType: 'ROUTE' | 'PACKAGE',
			companyId: string,
			packagesReceived?: number | null,
			packagesUndelivered?: number | null,
			packageAmount?: number | null,
			companyRateId?: string | null
		}[]
}

export type CreateRouteInput = {
  routeDate: string;
  destinationCity: string;
  vehicleKmStart: number;
  vehicleKmEnd?: number | null;
  notes?: string | null;
  companies: Array<{
    companyId: string;
    routingType: 'ROUTE' | 'PACKAGE';
    packagesReceived: number;
    packagesUndelivered: number;
    rateAmount: number;
    routeRateId?: string;      // requerido si routingType es ROUTE
    routeTypeId?: string;      // requerido si routingType es ROUTE
    routeRateAmount?: number;  // requerido si routingType es ROUTE
    companyRateId?: string;   // requerido si routingType es PACKAGE
    packageAmount?: number;   // requerido si routingType es PACKAGE
  }>;
};

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
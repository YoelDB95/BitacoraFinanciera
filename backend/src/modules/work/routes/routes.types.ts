import { Temporal } from "temporal-polyfill"

export interface Route {
	routeCode: string,
  routeDate: Temporal.Instant,
  destinationCity: string,
  vehicleKmStart: number,
  vehicleKmEnd: number | null,
  notes: string | null,
	routeType: 'ROUTE' | 'PACKAGE' | 	null,
  companies: [
		{
			companyId: string,
			packagesReceived: number,
			packagesUndelivered: number
		}
	]
}
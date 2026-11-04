/*
        Consulta y modifica la base de datos mediante Prisma.
*/

import { db } from "../../../prisma/db.js";
import { CompanyRouteWithoutRouteID, Route } from "./routes.types.js";

const getRouteRates = async () => {
  const runtime = db.runtime();
  const plan = db.raw.sql`
    SELECT
      route_type_id,
      name,
      amount,
      valid_from,
      is_special,
      route_rate_id
    FROM public.v_route_types_with_rates
    ORDER BY name ASC
  `
    .returnsRow({
      route_type_id: 'pg/uuid@1',
      name: 'pg/varchar@1',
      amount: 'pg/numeric@1',
      valid_from: 'pg/date-string@1',
      is_special: 'pg/bool@1',
      route_rate_id: 'pg/uuid@1'
    })
    .build();

  return await runtime.query(plan);
}

const getRoutes = () => {
 return db.orm.public.Routes.select('kilometers')
  .include('routeCompanies', (routeCompanies) =>
    routeCompanies.select('id', 'companyId', 'routeId', 'billingAmount', 'rateAmount', 'packagesReceived', 'packagesUndelivered')
  )
  .all()
}

const getRoutesMonth = async () => {
  const runtime = db.runtime();
  const plan = db.raw.sql`
    SELECT rc.id AS route_company_id, 
      destination_city, 
      route_date, 
      vehicle_km_start, 
      COALESCE(vehicle_km_end, 0) as vehicle_km_end, 
      packages_received, 
      packages_undelivered, 
      COALESCE(rate_amount,0) as rate_amount, 
      cc.legal_name AS legal_name,
      cc.routing_type::text AS company_routing_type,
      COALESCE(rt.code, '') AS route_type_code,
      COALESCE(rt.name, '') AS route_type_name
    FROM routes rr
    INNER JOIN route_companies rc ON rr.id = rc.route_id 
    INNER JOIN companies cc ON cc.id = rc.company_id
    LEFT JOIN route_types rt ON rt.id = rc.route_type_id
    WHERE rr.route_date >= DATE_TRUNC('month', CURRENT_DATE)
    AND  rr.route_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
  `
    .returnsRow({
      route_company_id: 'pg/uuid@1',
      destination_city: 'pg/varchar@1',
      route_date: 'pg/date-string@1',
      vehicle_km_start: 'pg/numeric@1',
      vehicle_km_end: 'pg/numeric@1',
      packages_received: 'pg/numeric@1',
      packages_undelivered: 'pg/numeric@1',
      rate_amount: 'pg/numeric@1',
      legal_name: 'pg/varchar@1',
      company_routing_type: 'pg/varchar@1',
      route_type_code: 'pg/varchar@1',
      route_type_name: 'pg/varchar@1'
    })
    .build();

  return await runtime.query(plan);
}

const createRouteWithCompanies = async (route: Route, companyRoute:CompanyRouteWithoutRouteID[]) => {
  console.log('routes in repository: ', route);
  console.log('companyRoute in repository: ', companyRoute);
  /**
    routes in repository:  {
      destinationCity: 'Azul',
      notes: null,
      routeDate: '2026-11-04',
      vehicleKmEnd: 2,
      vehicleKmStart: 1
    }

    companyRoute in repository:  [
      {
        companyId: 'aa51cdbd-d17b-4a84-b3ce-35fb604236a6',
        packagesReceived: 2,
        packagesUndelivered: 0,
        rateAmount: undefined,
        routeRateAmount: undefined,
        routeRateId: undefined,
        routeTypeId: undefined
      },
      {
        companyId: '5ff59e50-09a4-4c10-8c15-9c4a4757bab5',
        packagesReceived: 1,
        packagesUndelivered: 0,
        rateAmount: undefined,
        companyRateAmount: 1840,
        companyRateId: '2a97efdc-a35b-4279-9854-3ac6e48aa622'
      }
    ]
  */
  return db.transaction(async (tx) => {
    const newRoute = await tx.orm.public.Routes.create({
      destinationCity: route.destinationCity,
      notes: route.notes ?? null,
      routeDate: route.routeDate,
      userId: route.userId ?? null,
      vehicleKmEnd: route.vehicleKmEnd == null ? null : String(route.vehicleKmEnd),
      vehicleKmStart: String(route.vehicleKmStart),
    })

    const associations = []
    for (const company of companyRoute) {
      associations.push(
        await tx.orm.public.RouteCompanies.create({
          billingAmount: company.billingAmount == null ? null : String(company.billingAmount),
	        companyId: company.companyId,
	        companyRateAmount: company.companyRateAmount == null ? null : String(company.companyRateAmount),
	        companyRateId: company.companyRateId ?? null,
	        notes: company.notes ?? null,
	        packagesReceived: company.packagesReceived ?? null,
	        packagesUndelivered: company.packagesUndelivered ?? null,
	        rateAmount: company.rateAmount == null ? null : String(company.rateAmount),
	        routeId: newRoute.id,
	        routeRateAmount: company.routeRateAmount == null ? null : String(company.routeRateAmount),
	        routeRateId: company.routeRateId ?? null,
	        routeTypeId: company.routeTypeId ?? null
        })
      )
    }

    return { newRoute, associations }
  })
}

const getTypeRoute = (nameCode: string) => {
  return db.orm.public.RouteRates.select('amount')
  .include('routeType', (routeType) =>
    routeType
      .select('id')
      .where((routeType) => routeType.name.eq(nameCode))
      .where((routeType) => routeType.isActive.eq(true))
  )
  .orderBy(p => p.validFrom.desc())
  .first()
}

export default { getRouteRates, getRoutes, getTypeRoute, createRouteWithCompanies, getRoutesMonth }
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
      is_special
    FROM public.v_route_types_with_rates
    ORDER BY name ASC
  `
    .returnsRow({
      route_type_id: 'pg/uuid@1',
      name: 'pg/varchar@1',
      amount: 'pg/numeric@1',
      valid_from: 'pg/date-string@1',
      is_special: 'pg/bool@1',
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

const createRouteWithCompanies = async (route: Route, companyRoute:CompanyRouteWithoutRouteID[]) => {
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

export default { getRouteRates, getRoutes, getTypeRoute, createRouteWithCompanies }
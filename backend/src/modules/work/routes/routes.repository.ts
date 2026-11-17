/*
        Consulta y modifica la base de datos mediante Prisma.
*/

import { db } from "../../../prisma/db.js";
import { CompanyRouteWithoutRouteID, FilterRoutes, Route, UpdateRouteInput } from "./routes.types.js";

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

const getRoutes = async (filters: FilterRoutes) => {
  const runtime = db.runtime();
  let plan
  const companyId = filters.companyId ?? '';

  if (filters.month) {
    plan = db.raw.sql`
      SELECT rc.id AS route_company_id,
        rr.id AS route_id,
        rc.company_id AS company_id,
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
      WHERE rr.route_date >= TO_DATE(${filters.month} || '-01', 'YYYY-MM-DD')
      AND rr.route_date < TO_DATE(${filters.month} || '-01', 'YYYY-MM-DD') + INTERVAL '1 month'
      AND (NULLIF(${companyId}, '') IS NULL OR rc.company_id = NULLIF(${companyId}, '')::uuid)
    `
      .returnsRow({
        route_company_id: 'pg/uuid@1',
        route_id: 'pg/uuid@1',
        company_id: 'pg/uuid@1',
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
  }
  else {
    if (!filters.startDate || !filters.endDate) {
      throw new Error('Debe proporcionar startDate y endDate para filtrar las rutas');
    }

    plan = db.raw.sql`
      SELECT rc.id AS route_company_id,
        rr.id AS route_id,
        rc.company_id AS company_id,
        rr.notes,
        rc.route_rate_id,
        rc.route_type_id,
        rc.company_rate_id,
        rc.billing_amount,
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
      WHERE rr.route_date BETWEEN ${filters.startDate}::date AND ${filters.endDate}::date
      AND (NULLIF(${companyId}, '') IS NULL OR rc.company_id = NULLIF(${companyId}, '')::uuid)
    `
      .returnsRow({
        route_company_id: 'pg/uuid@1',
        route_id: 'pg/uuid@1',
        company_id: 'pg/uuid@1',
        destination_city: 'pg/varchar@1',
        route_date: 'pg/date-string@1',
        notes: 'pg/varchar@1',
        route_rate_id: 'pg/uuid@1',
        route_type_id: 'pg/uuid@1',
        company_rate_id: 'pg/uuid@1',
        billing_amount: 'pg/numeric@1',
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
  }

  return await runtime.query(plan);
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

const updateRouteWithCompanies = async (routeId: string, companyRouteID: string, companyRouteData: Partial<UpdateRouteInput>) => {
  return db.transaction(async (tx) => {
    const updatedRoute = await tx.orm.public.Routes
      .where((route) => route.id.eq(routeId))  
      .update({      
        destinationCity: companyRouteData.destinationCity,
        notes: companyRouteData.notes ?? null,
        routeDate: companyRouteData.routeDate,
        userId: companyRouteData.userId ?? null,
        vehicleKmEnd: companyRouteData.vehicleKmEnd == null ? null : String(companyRouteData.vehicleKmEnd),
        vehicleKmStart: String(companyRouteData.vehicleKmStart),
      })

    const updatedCompanyRoute = await tx.orm.public.RouteCompanies
      .where((routeCompany) => routeCompany.id.eq(companyRouteID))    
      .update({      
        billingAmount: companyRouteData.billingAmount == null ? null : String(companyRouteData.billingAmount),
        companyId: companyRouteData.companyId,
        companyRateAmount: companyRouteData.companyRateAmount == null ? null : String(companyRouteData.companyRateAmount),
        companyRateId: companyRouteData.companyRateId ?? null,
        notes: companyRouteData.notes ?? null,
        packagesReceived: companyRouteData.packagesReceived ?? null,
        packagesUndelivered: companyRouteData.packagesUndelivered ?? null,
        rateAmount: companyRouteData.rateAmount == null ? null : String(companyRouteData.rateAmount),
        routeId: companyRouteData.routeId ?? undefined,
        routeRateAmount: companyRouteData.routeRateAmount == null ? null : String(companyRouteData.routeRateAmount),
        routeRateId: companyRouteData.routeRateId ?? null,
        routeTypeId: companyRouteData.routeTypeId ?? null
    })  

    return { updatedRoute, updatedCompanyRoute }
  })
}

const deleteRoute = async (routeId: string) => {}

const deleteCompanyRoute = async (routeCompanyId: string) => {}

const routeHasInvoices = async (routeCompanyId: string) => {}

export default { getRouteRates, getRoutes, getTypeRoute, createRouteWithCompanies, updateRouteWithCompanies, deleteRoute, deleteCompanyRoute, routeHasInvoices }
/*
        Consulta y modifica la base de datos mediante Prisma.
*/

import { db } from "../../../prisma/db.js";
import { Route } from "./routes.types.js";

const getRouteRates = async () => {
  /*
   * SELECT *
FROM public.v_route_types_with_rates
ORDER BY name;
   */
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
	// const runtime = db.runtime();

  // const plan = db.sql.public.route_types
  //   .innerJoin(
  //     db.sql.public.route_rates,
  //     (f, fns) =>
  //       fns.eq(
  //         f.route_types.id,
  //         f.route_rates.route_type_id,
  //       ),
  //   )
  //   .select((f) => ({
  //     route_type_id: f.route_types.id,
  //     name: f.route_types.name,
  //     amount: f.route_rates.amount,
  //     valid_from: f.route_rates.valid_from,
  //     rate_created_at: f.route_rates.created_at,
  //   }))
  //   .where((f, fns) =>
  //     fns.and(
  //       fns.eq(f.route_types.is_active, true),
  //       fns.raw`${f.route_rates.valid_from} <= CURRENT_DATE`
  //         .returns("pg/bool@1"),
  //     ),
  //   )
  //   .orderBy("code", { direction: "asc" })
  //   .orderBy("valid_from", { direction: "desc" })
  //   .orderBy("rate_created_at", { direction: "desc" })
  //   .distinctOn("code")
  //   .build();

  // return await runtime.query(plan);
}

const getRoutes = () => {
 return db.orm.public.Routes
  .include('routeCompanies', (routeCompanies) =>
    routeCompanies.select('id', 'companyId', 'routeId', 'billingAmount', 'rateAmount', 'kilometers', 'packagesReceived', 'packagesUndelivered')
  )
  .all()
}

const createRoute = (route:Route) => {
//todo
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

export default { getRouteRates, getRoutes, createRoute, getTypeRoute }
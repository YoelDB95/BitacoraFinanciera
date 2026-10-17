/*
        Consulta y modifica la base de datos mediante Prisma.
*/

import { db } from "../../../prisma/db.js";

const getRouteRates = async () => {
	const runtime = db.runtime();

  const plan = db.sql.public.route_types
    .innerJoin(
      db.sql.public.route_rates,
      (f, fns) =>
        fns.eq(
          f.route_types.id,
          f.route_rates.route_type_id,
        ),
    )
    .select((f) => ({
      route_type_id: f.route_types.id,
      name: f.route_types.name,
      amount: f.route_rates.amount,
      valid_from: f.route_rates.valid_from,
      rate_created_at: f.route_rates.created_at,
    }))
    .where((f, fns) =>
      fns.and(
        fns.eq(f.route_types.is_active, true),
        fns.raw`${f.route_rates.valid_from} <= CURRENT_DATE`
          .returns("pg/bool@1"),
      ),
    )
    .orderBy("code", { direction: "asc" })
    .orderBy("valid_from", { direction: "desc" })
    .orderBy("rate_created_at", { direction: "desc" })
    .distinctOn("code")
    .build();

  return await runtime.query(plan);
}

export default { getRouteRates }
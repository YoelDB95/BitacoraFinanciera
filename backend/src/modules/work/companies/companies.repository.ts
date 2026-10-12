/*
        Consulta y modifica la base de datos mediante Prisma.
*/

import { db } from "../../../prisma/db.js";
import { Temporal } from '@js-temporal/polyfill';
import { Company, CreateCompanyInput } from "./companies.types.js";

const getAllCompanies = async () => {
  return await db.orm.public.Companies
    .where((company) => company.active.eq(true))
    .include('companyBillingContacts', (contacts) =>
      contacts.select('id', 'name', 'email', 'notes', 'isPrimary')
    )
    .include('companyRates', (rates) =>
      rates.select('id', 'amount', 'validFrom', 'validTo')
    )
    .all();

}

const createCompany = async (companyData: CreateCompanyInput) => {
	const newCompany = await db.orm.public.Companies.create({
    cuit: companyData.cuit,
    legalName: companyData.legalName,
    businessName: companyData.businessName ?? null,
    billingAddress: companyData.billingAddress ?? null,
    active: true,
    createdAt: Temporal.Now.instant(),
    updatedAt: Temporal.Now.instant(),
  })

	return newCompany
}

const getRates = async () => {
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

const createCompanyBillingContact = async (company: Company, body: CreateCompanyInput) => {
	const newBillingContact = await db.orm.public.CompanyBillingContacts.create({
    companyId: company.id,
    name:
      (body.billingContactName ?? company.legalName ?? '').trim() ||
      'Facturación',
    email: body.billingContactEmail,
    notes: body.billingContactNotes ?? null,
    isPrimary: true,
    createdAt: Temporal.Now.instant(),
    updatedAt: Temporal.Now.instant(),
  });

	return newBillingContact;
}

export default {getAllCompanies, getRates, createCompany, createCompanyBillingContact}
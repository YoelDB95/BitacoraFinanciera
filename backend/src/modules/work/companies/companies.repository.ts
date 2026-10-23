/*
        Consulta y modifica la base de datos mediante Prisma.
*/

import { log } from "console";
import { db } from "../../../prisma/db.js";
import { Company, CreateCompanyInput } from "./companies.types.js";
import { and } from "@prisma/orm-postgres/orm-client";

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

const getCompany = (companyId: string) => {
  return db.orm.public.Companies.select('routingType')
  .where((company) =>and(company.id.eq(companyId), company.active.eq(true)))
  .first()
}

const createCompany = async (companyData: CreateCompanyInput) => {
	const newCompany = await db.orm.public.Companies.create({
    cuit: companyData.cuit,
    legalName: companyData.legalName,
    businessName: companyData.businessName ?? null,
    billingAddress: companyData.billingAddress ?? null,
    active: true,
    routingType: companyData.routingType ?? 'ROUTE',
  })

	return newCompany
}

const getPackageRates = async () => db.orm.public.CompanyRates .select('amount', 'name', 'unit').all()

const createCompanyBillingContact = async (company: Company, body: CreateCompanyInput) => {
	const newBillingContact = await db.orm.public.CompanyBillingContacts.create({
    companyId: company.id,
    name:
      (body.billingContactName ?? company.legalName ?? '').trim() ||
      'Facturación',
    email: body.billingContactEmail ?? '',
    notes: body.billingContactNotes ?? null,
    isPrimary: true,
  });

	return newBillingContact;
}

export default { getAllCompanies, createCompany, createCompanyBillingContact, getPackageRates, getCompany }
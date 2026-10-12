
/*
        Contiene las reglas de negocio y coordina operaciones entre entidades.
*/

import companiesRepository from './companies.repository'
import { toIso } from '../../../lib/utils';
import { CreateCompanyInput } from './companies.types';

const createCompany = async (body: CreateCompanyInput) => {
  const company = await companiesRepository.createCompany(body);
  
 	let billingContact = null;
  billingContact = await companiesRepository.createCompanyBillingContact(company, body);

  return {
    company: {
      ...company,
      id: company.id.toString(),
      createdAt: toIso(company.createdAt),
      updatedAt: toIso(company.updatedAt),
    },
    billingContact: billingContact
      ? {
          ...billingContact,
          id: billingContact.id.toString(),
          companyId: billingContact.companyId.toString(),
          createdAt: toIso(billingContact.createdAt),
          updatedAt: toIso(billingContact.updatedAt),
        }
      : null,
	}
}

const getCompanies = () => companiesRepository.getAllCompanies()

const getRouteRates = () => companiesRepository.getRates()

export default {
  createCompany,
  getCompanies,
  getRouteRates,
}
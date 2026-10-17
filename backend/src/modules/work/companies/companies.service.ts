
/*
        Contiene las reglas de negocio y coordina operaciones entre entidades.
*/

import companiesRepository from './companies.repository'
import { toIso } from '../../../lib/utils';
import { CreateCompanyInput, RoutingType } from './companies.types';
import routesRepository from '../routes/routes.repository';

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

const getCompanyRates = async (routingType: RoutingType) => {
  const companyRate = routingType === 'ROUTE' ? await routesRepository.getRouteRates() : await companiesRepository.getPackageRates()
  return {
    routingType,
    companyRate
  };
}

export default {
  createCompany,
  getCompanies,
  getCompanyRates,
}
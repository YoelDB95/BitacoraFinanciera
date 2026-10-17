import companiesService from './companies.service';
import { type Request, type Response } from 'express';
import {toIso, activeRateAmount} from '../../../lib/utils'
import type { CreateCompanyInput, RoutingType } from './companies.types';


const getCompanies = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companies = await companiesService.getCompanies();

    const result = companies.map((company) => ({
      id: company.id.toString(),
      cuit: company.cuit,
      legalName: company.legalName,
      businessName: company.businessName,
      billingAddress: company.billingAddress,
      billingNotes: company.billingNotes,
      active: company.active,
      tarifa: activeRateAmount(company.companyRates),
      createdAt: toIso(company.createdAt),
      updatedAt: toIso(company.updatedAt),
      billingContacts: (company.companyBillingContacts ?? []).map((contact) => ({
        id: contact.id.toString(),
        name: contact.name,
        email: contact.email,
        notes: contact.notes,
        isPrimary: contact.isPrimary,
      })),
      routingType: company.routingType,
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'No se pudieron obtener las empresas' });
  }
}

const createCompany = async (req: Request<Record<string, string>, unknown, CreateCompanyInput>, res: Response): Promise<Response> => {
  if (!req.body?.cuit || !req.body?.legalName || !req.body?.billingContactEmail || !req.body?.billingContactName)
    return res.status(400).json({ error: 'cuit, legalName, email y nombre del contacto de facturación son obligatorios' });

  try {
    const company = await companiesService.createCompany(req.body);
    return res.status(201).json(company);
  } catch(error) {
    return res
      .status(400)
      .json({
        error:
          error instanceof Error ? error.message : 'No se pudo crear la empresa',
      }); 
  }
}

const getCompanyRates = async (req: Request, res: Response): Promise<Response> => {  
  const routingType = req.params.routingType as RoutingType
  try {
    const routeRates = await companiesService.getCompanyRates(routingType);
    return res.json(routeRates);
  } catch(error) {
    console.error(error);
    return res.status(500).json({ error: 'No se pudieron obtener las tarifas de la compania' });
  }
}

export default {
  getCompanies,
  createCompany,
  getCompanyRates,
};
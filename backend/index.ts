import express from 'express';
import "temporal-polyfill/full/global";
import { Temporal } from '@js-temporal/polyfill';
import { db } from "./src/prisma/db";

const app = express();

app.use(express.json());

function toIso(value) {
  return typeof value?.toString === 'function' ? value.toString() : value;
}

app.get('/api/companies', async (req, res) => {
  try {
    const companies = await db.orm.public.Companies
      .where((company) => company.active.eq(true))
      .include('companyBillingContacts', (contacts) =>
        contacts.select('id', 'name', 'email', 'notes', 'isPrimary')
      )
      .all();

    const result = companies.map((company) => ({
      id: company.id.toString(),
      cuit: company.cuit,
      legalName: company.legalName,
      businessName: company.businessName,
      billingAddress: company.billingAddress,
      billingNotes: company.billingNotes,
      active: company.active,
      createdAt: toIso(company.createdAt),
      updatedAt: toIso(company.updatedAt),
      billingContacts: (company.companyBillingContacts ?? []).map((contact) => ({
        id: contact.id.toString(),
        name: contact.name,
        email: contact.email,
        notes: contact.notes,
        isPrimary: contact.isPrimary,
      })),
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron obtener las empresas' });
  }
});

app.post('/api/companies', async (req, res) => {
  if (!req.body?.cuit || !req.body?.legalName)
    return res.status(400).json({ error: 'cuit y legalName son obligatorios' });

  try {
    const newCompany = await db.orm.public.Companies.create({
      cuit: req.body.cuit,
      legalName: req.body.legalName,
      businessName: req.body.businessName ?? null,
      billingAddress: req.body.billingAddress ?? null,
      active: true,
      createdAt: Temporal.Now.instant(),
      updatedAt: Temporal.Now.instant(),
    });

    let billingContact = null;
    if (req.body.billingContactEmail) {
      billingContact = await db.orm.public.CompanyBillingContacts.create({
        companyId: newCompany.id,
        name:
          (req.body.billingContactName ?? newCompany.legalName ?? '').trim() ||
          'Facturación',
        email: req.body.billingContactEmail,
        notes: req.body.billingContactNotes ?? null,
        isPrimary: true,
        createdAt: Temporal.Now.instant(),
        updatedAt: Temporal.Now.instant(),
      });
    }

    res.json({
      company: {
        ...newCompany,
        id: newCompany.id.toString(),
        createdAt: toIso(newCompany.createdAt),
        updatedAt: toIso(newCompany.updatedAt),
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
    });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({
        error:
          error instanceof Error ? error.message : 'No se pudo crear la empresa',
      });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
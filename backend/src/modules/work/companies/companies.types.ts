import { Temporal } from "temporal-polyfill";

export interface CreateCompanyInput {
  cuit: string;
  legalName: string;
  businessName?: string | null;
  billingAddress?: string | null;
  billingNotes?: string | null;
  billingContactName?: string | null;
  billingContactEmail?: string | null;
  billingContactNotes?: string | null;
}

export interface Company {
  createdAt: Temporal.Instant;
  id: string;
  updatedAt: Temporal.Instant;
  userId: string;
  active: boolean;
  billingAddress: string;
  billingNotes: string;
  businessName: string;
  cuit: string;
  legalName: string;
}
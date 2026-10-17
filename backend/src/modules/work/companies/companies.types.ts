export interface CreateCompanyInput {
  cuit: string;
  legalName: string;
  businessName?: string | null;
  billingAddress?: string | null;
  billingNotes?: string | null;
  billingContactName?: string | null;
  billingContactEmail?: string | null;
  billingContactNotes?: string | null;
  routingType?: RoutingType | null;
}

export interface Company {
  createdAt: string;
  id: string;
  updatedAt: string;
  userId: string | null;
  active: boolean;
  billingAddress: string | null;
  billingNotes: string | null;
  businessName: string | null;
  cuit: string;
  legalName: string;
  routingType: RoutingType;
}

export type RoutingType = 'ROUTE' | 'PACKAGE'
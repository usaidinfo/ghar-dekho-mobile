/**
 * POST /api/properties — aligned with `ghar-dekho-backend` `createProperty` + route validators.
 */

export type CreatePropertyStatus = 'DRAFT' | 'ACTIVE';

export interface CreatePropertyPayload {
  status: CreatePropertyStatus;
  listingType: string;
  propertyType: string;
  /** Prisma PropertyCategory */
  category: string;
  title: string;
  description: string;
  price: number;
  currency?: string;
  city: string;
  locality: string;
  state: string;
  pincode: string;
  address: string;
  latitude?: number;
  longitude?: number;
  bhk?: number | null;
  builtUpArea?: number | null;
  carpetArea?: number | null;
  floorNumber?: number | null;
  totalFloors?: number | null;
  ageOfProperty?: number | null;
  priceNegotiable?: boolean;
  isRERAApproved?: boolean;
  reraNumber?: string | null;
  hasNOC?: boolean;
  hasApprovedMaps?: boolean;
  isFeatured?: boolean;
  /** Resolved server-side to `amenityIds` via seed names */
  amenitySlugs?: string[];
}

export type CreatePropertyResponse =
  | { id: string }
  | { property: { id: string } }
  | { data?: { id: string } };

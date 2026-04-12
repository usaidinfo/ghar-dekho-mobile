/**
 * POST /api/properties — request shape aligned with list/detail fields and common Nest/Express patterns.
 * Adjust keys if your backend contract differs (see mapListPropertyFormToCreatePayload).
 */

export type CreatePropertyStatus = 'DRAFT' | 'ACTIVE' | 'PENDING';

export interface CreatePropertyPayload {
  status: CreatePropertyStatus;
  listingType: string;
  propertyType: string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  city: string;
  locality: string;
  state?: string;
  pincode?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  bhk?: number | null;
  builtUpArea?: number | null;
  carpetArea?: number | null;
  floor?: number | null;
  totalFloors?: number | null;
  ageOfProperty?: number | null;
  isPriceNegotiable?: boolean;
  isRERAApproved?: boolean;
  reraNumber?: string | null;
  /** Public image URLs (https) or server-supported URIs */
  imageUrls?: string[];
  primaryImageIndex?: number;
  amenitySlugs?: string[];
  requestFeatured?: boolean;
  nocFromSociety?: boolean;
  approvedMasterPlan?: boolean;
  /** Device file URI until upload pipeline exists */
  videoTourFileUri?: string | null;
}

/** Success body may be the new row or a minimal `{ id }` wrapper */
export type CreatePropertyResponse =
  | { id: string }
  | { property: { id: string } }
  | { data?: { id: string } };

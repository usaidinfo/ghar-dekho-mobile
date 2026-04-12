/**
 * List / edit property form model — shared by Post and future Edit flows.
 */

export type ListingIntent = 'Buy' | 'Rent' | 'PG' | 'Comm.';

export type ListingPropertyKind = 'Flat' | 'Villa' | 'Plot' | 'Office';

export type ListingBhk = '1' | '2' | '3' | '4' | '5+';

export type ListingPropertyAge = 'New Construction' | '0-1 Year' | '1-5 Years';

export type ListPropertyAmenityId = 'parking' | 'gym' | 'lift' | 'pool' | 'security' | 'backup';

export interface ListPropertyFormValues {
  listingIntent: ListingIntent;
  propertyKind: ListingPropertyKind;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  /** Filled by “Detect my location” (decimal strings) */
  latitude: string;
  longitude: string;
  bhk: ListingBhk;
  builtUpSqFt: string;
  carpetSqFt: string;
  propertyAge: ListingPropertyAge;
  floor: string;
  totalFloors: string;
  totalPrice: string;
  priceNegotiable: boolean;
  amenities: ListPropertyAmenityId[];
  photoUris: string[];
  coverIndex: number;
  /** file:// from device video picker (optional) */
  videoTourUri: string;
  reraApproved: boolean;
  reraRegistrationNumber: string;
  nocFromSociety: boolean;
  approvedMasterPlan: boolean;
  featureListing: boolean;
}

export type ListPropertyFormMode = 'create' | 'edit';

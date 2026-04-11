/** Shapes returned by `GET /api/properties/:id` (detail select) */

export interface PropertyImageItem {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  isPrimary: boolean;
  order: number;
}

export interface PropertyVideoItem {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  isPrimary: boolean;
}

export type VirtualTourType = 'THREE_SIXTY' | 'VIDEO_TOUR' | 'AR_VIEW' | 'DRONE_VIEW';

export interface VirtualTourItem {
  id: string;
  tourUrl: string;
  thumbnailUrl?: string | null;
  type: VirtualTourType;
  provider?: string | null;
}

export type EssentialType =
  | 'SCHOOL'
  | 'COLLEGE'
  | 'HOSPITAL'
  | 'CLINIC'
  | 'MARKET'
  | 'MALL'
  | 'RESTAURANT'
  | 'ATM'
  | 'BANK'
  | 'METRO_STATION'
  | 'BUS_STOP'
  | 'RAILWAY_STATION'
  | 'AIRPORT'
  | 'PHARMACY'
  | 'GYM'
  | 'PARK'
  | string;

export interface NearbyEssentialItem {
  id: string;
  type: EssentialType;
  name: string;
  distance: number;
  address?: string | null;
}

export interface PropertyAmenityJoin {
  amenity: {
    id: string;
    name: string;
    icon: string | null;
    category: string;
  };
}

export interface PropertyOwner {
  id: string;
  phone: string | null;
  email: string | null;
  profileType: string;
  profile: {
    firstName: string | null;
    lastName: string | null;
    profileImage: string | null;
    city: string | null;
  } | null;
}

export interface PropertyDetail {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  currency?: string | null;
  listingType: string;
  propertyType: string;
  bhk?: number | null;
  carpetArea?: number | null;
  builtUpArea?: number | null;
  superBuiltUpArea?: number | null;
  city: string;
  locality: string;
  address?: string | null;
  state?: string | null;
  pincode?: string | null;
  latitude: number;
  longitude: number;
  furnishing?: string | null;
  facing?: string | null;
  ageOfProperty?: number | null;
  isVerified: boolean;
  isRERAApproved?: boolean;
  reraNumber?: string | null;
  safetyScore?: number | null;
  investmentScore?: number | null;
  rentalYield?: number | null;
  localityScore?: number | null;
  aiSuggestedPrice?: number | null;
  images: PropertyImageItem[];
  videos?: PropertyVideoItem[];
  virtualTours?: VirtualTourItem[];
  amenities?: PropertyAmenityJoin[];
  nearbyEssentials?: NearbyEssentialItem[];
  owner?: PropertyOwner;
}

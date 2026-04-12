/**
 * Shapes returned by GET /api/properties, /featured, and /nearby (list / map).
 */

export interface PropertyImageDto {
  imageUrl: string;
  thumbnailUrl: string;
}

export interface PropertyListOwnerProfile {
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
}

export interface PropertyListOwner {
  id: string;
  profile: PropertyListOwnerProfile | null;
}

/** GET /api/properties — list item (PROPERTY_LIST_SELECT) */
export interface PropertyListItem {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  currency: string;
  propertyType: string;
  listingType: string;
  category: string;
  bhk: number | null;
  carpetArea: number | null;
  builtUpArea: number | null;
  city: string;
  locality: string;
  address: string;
  latitude: number;
  longitude: number;
  furnishing: string;
  isVerified: boolean;
  isFeatured: boolean;
  isBoosted: boolean;
  isOwnerListing: boolean;
  viewCount: number;
  popularityScore: number;
  postedAt: string;
  status: string;
  images: PropertyImageDto[];
  owner: PropertyListOwner;
}

/** GET /api/properties/my-listings — extends list row with owner metrics */
export interface MyListingAnalyticsDay {
  date: string;
  views: number;
  leads: number;
  messages: number;
}

export interface MyListingItem extends PropertyListItem {
  leadCount: number;
  shareCount: number;
  expiresAt: string | null;
  analytics?: MyListingAnalyticsDay[];
}

export interface HotDealApi {
  id: string;
  propertyId: string;
  discountPercent?: number | null;
  originalPrice?: number;
  dealPrice?: number;
  tagline?: string | null;
  property?: PropertyListItem;
}

export interface FeaturedPropertiesPayload {
  featured: PropertyListItem[];
  hotDeals: HotDealApi[];
}

/** GET /api/properties/nearby — partial row */
export interface NearbyPropertyApiItem {
  id: string;
  title: string;
  price: number;
  latitude: number;
  longitude: number;
  propertyType: string;
  listingType: string;
  bhk: number | null;
  isVerified: boolean;
  images: { thumbnailUrl: string }[];
}

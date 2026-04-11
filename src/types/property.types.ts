/**
 * @file property.types.ts
 * @description Domain types for GharDekho. Designed to map directly to API responses.
 */

export type PropertyCategory = 'Buy' | 'Rent' | 'Plot/Land' | 'Co-working' | 'Commercial';

export type PropertyType = '1 BHK' | '2 BHK' | '3 BHK' | '4 BHK' | 'Villa' | 'Plot' | 'PG' | 'Office' | string;

export type ProjectBadge = 'PRE-LAUNCH' | 'VERIFIED' | 'EXCLUSIVE' | 'NEW LAUNCH' | 'HOT PROJECT' | 'READY TO MOVE';

export type NeighborhoodTrend = 'Top Rated' | 'Fast Moving' | 'Upcoming' | 'Premium';

// ─── Hero Feature (Feature Poster) ────────────────────────────────────────────

export interface FeaturedHero {
  id: string;
  title: string;
  subtitle: string;
  badgeLabel: string;
  imageUrl: string;
  ctaLabel: string;
  propertyId: string; // navigate to PropertyDetail on CTA press
}

// ─── Recommended Project Card ──────────────────────────────────────────────────

export interface Project {
  id: string;
  title: string;
  locality: string;
  city: string;
  imageUrl: string;
  badge?: ProjectBadge;
  priceLabel: string;       // e.g. "₹2.4 Cr+"
  bhkConfig: string;        // e.g. "3 & 4 BHK"
}

// ─── Nearby Property ───────────────────────────────────────────────────────────

export interface NearbyProperty {
  id: string;
  title: string;
  priceLabel: string;
  imageUrl: string;
  distanceKm: number;       // e.g. 2.4 → "2.4 km away"
  isFavorited?: boolean;
}

// ─── Top Listing (compact horizontal card) ────────────────────────────────────

export interface TopListing {
  id: string;
  title: string;
  locality: string;
  city: string;
  thumbnailUrl: string;
  badge: ProjectBadge;
  priceRange: string;       // e.g. "₹78 L - 1.2 Cr"
}

// ─── Legacy types kept for future screens ─────────────────────────────────────

export interface Property {
  id: string;
  title: string;
  price: number;
  priceLabel: string;
  propertyType: PropertyType;
  category: PropertyCategory;
  locality: string;
  city: string;
  imageUrl: string;
  isVerified: boolean;
  isFeatured?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  listedAt?: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  city: string;
  imageUrl: string;
  trendLabel: NeighborhoodTrend;
  listingsCount?: number;
}

export interface RecentlyViewedProperty {
  id: string;
  title: string;
  locality: string;
  city: string;
  priceLabel: string;
  thumbnailUrl: string;
  viewedAt?: string;
}

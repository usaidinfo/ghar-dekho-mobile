import type {
  PropertyListItem,
  NearbyPropertyApiItem,
} from '../types/home.api.types';
import type {
  FeaturedHero,
  Project,
  NearbyProperty,
  TopListing,
  ProjectBadge,
  PropertyCategory,
} from '../types/property.types';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80';

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function homeCategoryToApiFilters(
  category: PropertyCategory,
): Record<string, string | undefined> {
  switch (category) { 
    case 'Buy':
      return { listingType: 'BUY' };
    case 'Rent':
      return { listingType: 'RENT' };
    case 'Plot/Land':
      return { category: 'PLOT' };
    case 'Co-working':
      return { category: 'CO_LIVING' };
    case 'Commercial':
      return { category: 'COMMERCIAL' };
    default:
      return {};
  }
}

/** Nearby endpoint supports `listingType` and `propertyType` (not `category`). */
export function homeCategoryToNearbyParams(
  category: PropertyCategory,
): { listingType?: string; propertyType?: string } {
  switch (category) {
    case 'Buy':
      return { listingType: 'BUY' };
    case 'Rent':
      return { listingType: 'RENT' };
    case 'Plot/Land':
      return { propertyType: 'PLOT' };
    case 'Co-working':
      return { propertyType: 'CO_LIVING' };
    case 'Commercial':
      return { propertyType: 'COMMERCIAL' };
    default:
      return {};
  }
}

export function formatInrPrice(price: number, listingType: string): string {
  const rentish = listingType === 'RENT' || listingType === 'PG' || listingType === 'LEASE';
  if (rentish) {
    return `₹${Math.round(price).toLocaleString('en-IN')}/mo`;
  }
  if (price >= 1e7) {
    const cr = price / 1e7;
    return cr >= 10 ? `₹${Math.round(cr)} Cr` : `₹${cr.toFixed(2)} Cr`;
  }
  if (price >= 1e5) {
    const l = price / 1e5;
    return l >= 100 ? `₹${Math.round(l)} L` : `₹${l.toFixed(2)} L`;
  }
  return `₹${Math.round(price).toLocaleString('en-IN')}`;
}

function pickListImage(p: PropertyListItem): string {
  const img = p.images?.[0];
  return img?.imageUrl || img?.thumbnailUrl || PLACEHOLDER_IMAGE;
}

function pickNearbyImage(p: NearbyPropertyApiItem): string {
  const t = p.images?.[0]?.thumbnailUrl;
  return t || PLACEHOLDER_IMAGE;
}

function projectBadgeFromProperty(p: PropertyListItem): ProjectBadge | undefined {
  if (p.isVerified) return 'VERIFIED';
  if (p.isFeatured) return 'HOT PROJECT';
  if (p.isBoosted) return 'EXCLUSIVE';
  return undefined;
}

function topListingBadge(p: PropertyListItem): ProjectBadge {
  if (p.isFeatured) return 'HOT PROJECT';
  if (p.isBoosted) return 'EXCLUSIVE';
  if (p.isVerified) return 'VERIFIED';
  return 'NEW LAUNCH';
}

function bhkLabel(p: Pick<PropertyListItem, 'bhk' | 'propertyType'>): string {
  if (p.bhk != null && p.bhk > 0) return `${p.bhk} BHK`;
  if (p.propertyType === 'PLOT') return 'Plot';
  if (p.propertyType === 'VILLA') return 'Villa';
  return p.propertyType.replace(/_/g, ' ');
}

export function propertyToFeaturedHero(p: PropertyListItem): FeaturedHero {
  const locality = p.locality || p.city;
  return {
    id: `hero-${p.id}`,
    title: p.title,
    subtitle: `${locality}, ${p.city} · ${formatInrPrice(p.price, p.listingType)}`,
    badgeLabel: p.isFeatured ? 'Featured' : p.isVerified ? 'Verified' : 'Spotlight',
    imageUrl: pickListImage(p),
    ctaLabel: 'View listing',
    propertyId: p.id,
  };
}

export function propertyToProject(p: PropertyListItem): Project {
  return {
    id: p.id,
    title: p.title,
    locality: p.locality,
    city: p.city,
    imageUrl: pickListImage(p),
    badge: projectBadgeFromProperty(p),
    priceLabel: formatInrPrice(p.price, p.listingType),
    bhkConfig: bhkLabel(p),
  };
}

export function propertyToTopListing(p: PropertyListItem): TopListing {
  const img = p.images?.[0];
  return {
    id: p.id,
    title: p.title,
    locality: p.locality,
    city: p.city,
    thumbnailUrl: img?.thumbnailUrl || img?.imageUrl || PLACEHOLDER_IMAGE,
    badge: topListingBadge(p),
    priceRange: formatInrPrice(p.price, p.listingType),
  };
}

export function nearbyApiToCard(
  p: NearbyPropertyApiItem,
  anchorLat: number,
  anchorLng: number,
): NearbyProperty {
  return {
    id: p.id,
    title: p.title,
    priceLabel: formatInrPrice(p.price, p.listingType),
    imageUrl: pickNearbyImage(p),
    distanceKm: haversineKm(anchorLat, anchorLng, p.latitude, p.longitude),
  };
}

/** Dedupe by id, preserve first occurrence order */
export function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of items) {
    if (seen.has(it.id)) continue;
    seen.add(it.id);
    out.push(it);
  }
  return out;
}

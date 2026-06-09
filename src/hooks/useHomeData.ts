import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchFeaturedProperties,
  fetchProperties,
  fetchNearbyProperties,
} from '../services/property.service';
import type { PropertyListItem } from '../types/home.api.types';
import type { FeaturedHero, Project, NearbyProperty, TopListing, PropertyCategory } from '../types/property.types';
import { PROPERTY_PLACEHOLDER_IMAGE } from '../constants/images';
import {
  dedupeById,
  homeCategoryToApiFilters,
  homeCategoryToNearbyParams,
  nearbyApiToCard,
  propertyToFeaturedHero,
  propertyToProject,
  propertyToTopListing,
} from '../utils/homePropertyMappers';

const DEFAULT_MAP_LAT = 12.9716;
const DEFAULT_MAP_LNG = 77.5946;
const DEFAULT_TOP_CITY = 'Bengaluru';

const FALLBACK_HERO: FeaturedHero = {
  id: 'fallback-hero',
  title: 'Find homes that fit your life',
  subtitle: 'Browse verified listings for sale and rent across India.',
  badgeLabel: 'Ghar Dekho',
  imageUrl: PROPERTY_PLACEHOLDER_IMAGE,
  ctaLabel: 'Explore',
  propertyId: '',
};

export interface UseHomeDataResult {
  hero: FeaturedHero;
  recommended: Project[];
  nearby: NearbyProperty[];
  topListings: TopListing[];
  topListingsCity: string;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function collectListItems(
  featured: PropertyListItem[],
  hotDealProperties: PropertyListItem[],
  feed: PropertyListItem[],
): PropertyListItem[] {
  return dedupeById([...featured, ...hotDealProperties, ...feed]);
}

/**
 * Extract a usable city name from the location label.
 * LocationSearchModal stores names like "Gomti Nagar, Lucknow, Uttar Pradesh"
 * or "Bhopal, Madhya Pradesh". We want the city part for DB filtering.
 */
function extractCity(locationName: string | null | undefined): string | undefined {
  if (!locationName) return undefined;
  const parts = locationName.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) return undefined;
  if (parts.length === 1) return parts[0];
  // "Locality, City, State" → return City
  // "City, State" → return City (first part)
  return parts.length >= 3 ? parts[1] : parts[0];
}

export function useHomeData(
  selectedCategory: PropertyCategory,
  userLat?: number | null,
  userLng?: number | null,
  locationName?: string | null,
): UseHomeDataResult {
  const lat = userLat ?? DEFAULT_MAP_LAT;
  const lng = userLng ?? DEFAULT_MAP_LNG;
  const city = useMemo(() => extractCity(locationName), [locationName]);

  const listFilters = useMemo(() => homeCategoryToApiFilters(selectedCategory), [selectedCategory]);
  const nearbyParams = useMemo(() => homeCategoryToNearbyParams(selectedCategory), [selectedCategory]);

  const [hero, setHero] = useState<FeaturedHero>(FALLBACK_HERO);
  const [recommended, setRecommended] = useState<Project[]>([]);
  const [nearby, setNearby] = useState<NearbyProperty[]>([]);
  const [topListings, setTopListings] = useState<TopListing[]>([]);
  const [topListingsCity, setTopListingsCity] = useState(DEFAULT_TOP_CITY);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (mode === 'initial') setLoading(true);
      else setRefreshing(true);
      setError(null);

      try {
        const [featuredResult, listingsResult, nearbyResult] = await Promise.allSettled([
          fetchFeaturedProperties(),
          fetchProperties({
            page: 1,
            limit: 24,
            sort: 'newest',
            ...(city ? { city } : {}),
            ...listFilters,
          }),
          fetchNearbyProperties({
            lat,
            lng,
            radius: 50,
            ...nearbyParams,
          }),
        ]);

        const featuredPayload =
          featuredResult.status === 'fulfilled'
            ? featuredResult.value
            : { featured: [] as PropertyListItem[], hotDeals: [] };

        const feed: PropertyListItem[] =
          listingsResult.status === 'fulfilled' ? listingsResult.value.data ?? [] : [];

        if (listingsResult.status === 'rejected') {
          if (__DEV__) {
            // eslint-disable-next-line no-console
            console.log('[home] listings rejected', listingsResult.reason);
          }
          setError('Could not load listings. Pull to refresh.');
        }

        const hotProps = (featuredPayload.hotDeals ?? [])
          .map((d) => d.property)
          .filter((p): p is PropertyListItem => Boolean(p));

        const merged = collectListItems(featuredPayload.featured ?? [], hotProps, feed);

        const heroSource = merged[0];
        setHero(heroSource ? propertyToFeaturedHero(heroSource) : FALLBACK_HERO);

        setRecommended(merged.slice(0, 12).map(propertyToProject));

        let nearbyRaw =
          nearbyResult.status === 'fulfilled' ? nearbyResult.value : [];

        // Fallback: if no nearby properties found, try a wider radius
        if (nearbyRaw.length === 0 && nearbyResult.status === 'fulfilled') {
          try {
            nearbyRaw = await fetchNearbyProperties({
              lat,
              lng,
              radius: 150,
              ...nearbyParams,
            });
          } catch {
            // keep empty
          }
        }

        setNearby(
          nearbyRaw
            .map((p) => nearbyApiToCard(p, lat, lng))
            .sort((a, b) => a.distanceKm - b.distanceKm)
            .slice(0, 12),
        );

        const displayCity = city ?? feed[0]?.city ?? hotProps[0]?.city ?? DEFAULT_TOP_CITY;
        setTopListingsCity(displayCity);

        try {
          const topRes = await fetchProperties({
            page: 1,
            limit: 12,
            sort: 'popular',
            city: displayCity,
            ...listFilters,
          });
          const topData = (topRes.data ?? []).map(propertyToTopListing);
          // If city-filtered top returns nothing, show unfiltered fallback
          if (topData.length === 0) {
            const fallbackTop = await fetchProperties({
              page: 1,
              limit: 12,
              sort: 'popular',
              ...listFilters,
            });
            setTopListings((fallbackTop.data ?? []).map(propertyToTopListing));
          } else {
            setTopListings(topData);
          }
        } catch {
          setTopListings(feed.slice(0, 10).map(propertyToTopListing));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
        setHero(FALLBACK_HERO);
        setRecommended([]);
        setNearby([]);
        setTopListings([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [listFilters, nearbyParams, lat, lng, city],
  );

  useEffect(() => {
    void load('initial');
  }, [load]);

  const refetch = useCallback(async () => {
    await load('refresh');
  }, [load]);

  return {
    hero,
    recommended,
    nearby,
    topListings,
    topListingsCity,
    loading,
    refreshing,
    error,
    refetch,
  };
}

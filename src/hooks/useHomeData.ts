import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchFeaturedProperties,
  fetchProperties,
  fetchNearbyProperties,
} from '../services/property.service';
import type { PropertyListItem } from '../types/home.api.types';
import type { FeaturedHero, Project, NearbyProperty, TopListing, PropertyCategory } from '../types/property.types';
import {
  dedupeById,
  homeCategoryToApiFilters,
  homeCategoryToNearbyParams,
  nearbyApiToCard,
  propertyToFeaturedHero,
  propertyToProject,
  propertyToTopListing,
} from '../utils/homePropertyMappers';

/** Bengaluru — used as map anchor when GPS is not wired yet */
const DEFAULT_MAP_LAT = 12.9716;
const DEFAULT_MAP_LNG = 77.5946;
const DEFAULT_TOP_CITY = 'Bengaluru';

const FALLBACK_HERO: FeaturedHero = {
  id: 'fallback-hero',
  title: 'Find homes that fit your life',
  subtitle: 'Browse verified listings for sale and rent across India.',
  badgeLabel: 'Ghar Dekho',
  imageUrl:
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80',
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

export function useHomeData(selectedCategory: PropertyCategory): UseHomeDataResult {
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
            ...listFilters,
          }),
          fetchNearbyProperties({
            lat: DEFAULT_MAP_LAT,
            lng: DEFAULT_MAP_LNG,
            radius: 35,
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
          setError('Could not load listings. Pull to refresh.');
        }

        const hotProps = (featuredPayload.hotDeals ?? [])
          .map((d) => d.property)
          .filter((p): p is PropertyListItem => Boolean(p));

        const merged = collectListItems(featuredPayload.featured ?? [], hotProps, feed);

        const heroSource = merged[0];
        setHero(heroSource ? propertyToFeaturedHero(heroSource) : FALLBACK_HERO);

        setRecommended(merged.slice(0, 12).map(propertyToProject));

        const nearbyRaw =
          nearbyResult.status === 'fulfilled' ? nearbyResult.value : [];
        setNearby(
          nearbyRaw
            .map((p) => nearbyApiToCard(p, DEFAULT_MAP_LAT, DEFAULT_MAP_LNG))
            .sort((a, b) => a.distanceKm - b.distanceKm)
            .slice(0, 12),
        );

        const city =
          feed[0]?.city ??
          featuredPayload.featured?.[0]?.city ??
          hotProps[0]?.city ??
          DEFAULT_TOP_CITY;
        setTopListingsCity(city);

        try {
          const topRes = await fetchProperties({
            page: 1,
            limit: 12,
            sort: 'popular',
            city,
            ...listFilters,
          });
          setTopListings((topRes.data ?? []).map(propertyToTopListing));
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
    [listFilters, nearbyParams],
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

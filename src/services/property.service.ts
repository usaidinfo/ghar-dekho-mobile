import axios from 'axios';
import { httpClient } from '../api/httpClient';
import type { ApiPaginated, ApiSuccess } from '../types/api.types';
import type { CreatePropertyPayload, CreatePropertyResponse } from '../types/create-property.api.types';
import type { PropertyDetail } from '../types/property-detail.types';
import type {
  FeaturedPropertiesPayload,
  NearbyPropertyApiItem,
  PropertyListItem,
} from '../types/home.api.types';

import { getApiErrorMessage } from './auth.service';

/** Query params aligned with GET /api/properties and /api/properties/search */
export type PropertyListParams = Record<string, string | number | undefined>;

export async function fetchProperties(params?: PropertyListParams) {
  const { data } = await httpClient.get<ApiPaginated<PropertyListItem>>('/api/properties', { params });
  return data;
}

export async function searchProperties(params: PropertyListParams & { q?: string }) {
  const { data } = await httpClient.get<ApiPaginated<PropertyListItem>>('/api/properties/search', {
    params,
  });
  return data;
}

export async function fetchFeaturedProperties(): Promise<FeaturedPropertiesPayload> {
  const { data: body } = await httpClient.get<ApiSuccess<FeaturedPropertiesPayload>>(
    '/api/properties/featured',
  );
  if (body.success && body.data) {
    return body.data;
  }
  return { featured: [], hotDeals: [] };
}

export type NearbyQueryParams = {
  lat: number;
  lng: number;
  radius?: number;
  listingType?: string;
  propertyType?: string;
};

export async function fetchNearbyProperties(
  params: NearbyQueryParams,
): Promise<NearbyPropertyApiItem[]> {
  const { data: body } = await httpClient.get<ApiSuccess<NearbyPropertyApiItem[]>>(
    '/api/properties/nearby',
    {
      params: {
        lat: params.lat,
        lng: params.lng,
        radius: params.radius ?? 25,
        ...(params.listingType && { listingType: params.listingType }),
        ...(params.propertyType && { propertyType: params.propertyType }),
      },
    },
  );
  if (body.success && Array.isArray(body.data)) {
    return body.data;
  }
  return [];
}

export async function fetchPropertyById(id: string): Promise<PropertyDetail> {
  const { data } = await httpClient.get<ApiSuccess<PropertyDetail>>(`/api/properties/${id}`);
  if (!data.data) {
    throw new Error('Failed to load property');
  }
  return data.data;
}

function readNewPropertyId(body: CreatePropertyResponse | PropertyListItem): string {
  const row = body as Record<string, unknown>;
  if (typeof row.id === 'string') {
    return row.id;
  }
  const prop = row.property as { id?: string } | undefined;
  if (prop && typeof prop.id === 'string') {
    return prop.id;
  }
  const nested = row.data as { id?: string } | undefined;
  if (nested && typeof nested.id === 'string') {
    return nested.id;
  }
  throw new Error('Server did not return a property id');
}

/**
 * Create or save a listing (JSON). Uses `status: DRAFT` vs `ACTIVE` for draft vs publish.
 * Backend route: POST /api/properties
 */
export async function createProperty(payload: CreatePropertyPayload): Promise<string> {
  try {
    const { data } = await httpClient.post<ApiSuccess<CreatePropertyResponse | PropertyListItem>>(
      '/api/properties',
      payload,
    );
    if (!data.success || !data.data) {
      throw new Error((data as { message?: string }).message || 'Could not create property');
    }
    return readNewPropertyId(data.data);
  } catch (e) {
    if (axios.isAxiosError(e)) {
      throw new Error(getApiErrorMessage(e));
    }
    throw e instanceof Error ? e : new Error('Could not create property');
  }
}

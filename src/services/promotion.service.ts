import { httpClient } from '../api/httpClient';
import type { ApiSuccess } from '../types/api.types';
import { getApiErrorMessage } from './auth.service';

export interface PromotionCredits {
  hasActiveMembership: boolean;
  boostCredits: number;
  maxBoosts: number;
  featuredSlots: number;
  maxFeatured: number;
  durations: { boostDays: number; featuredDays: number };
  planName: string | null;
}

export interface PromotionResult {
  promotion: {
    id: string;
    type: 'BOOST' | 'FEATURED';
    status: string;
    startsAt: string;
    endsAt: string | null;
  };
  property: {
    id: string;
    isBoosted: boolean;
    boostedUntil: string | null;
    isFeatured: boolean;
    featuredUntil: string | null;
  };
  boostCreditsRemaining?: number;
  featuredSlotsRemaining?: number;
}

function unwrap<T>(data: ApiSuccess<T>, fallback: string): T {
  if (!data.success || data.data == null) {
    throw new Error(data.message || fallback);
  }
  return data.data;
}

export async function fetchPromotionCredits(): Promise<PromotionCredits> {
  try {
    const { data } = await httpClient.get<ApiSuccess<PromotionCredits>>('/api/promotions/credits');
    return unwrap(data, 'Failed to load promotion credits');
  } catch (e) {
    throw new Error(getApiErrorMessage(e));
  }
}

export async function boostPropertyListing(propertyId: string): Promise<PromotionResult> {
  try {
    const { data } = await httpClient.post<ApiSuccess<PromotionResult>>(
      `/api/promotions/properties/${propertyId}/boost`,
    );
    return unwrap(data, 'Failed to boost listing');
  } catch (e) {
    throw e;
  }
}

export async function featurePropertyListing(propertyId: string): Promise<PromotionResult> {
  try {
    const { data } = await httpClient.post<ApiSuccess<PromotionResult>>(
      `/api/promotions/properties/${propertyId}/feature`,
    );
    return unwrap(data, 'Failed to feature listing');
  } catch (e) {
    throw e;
  }
}

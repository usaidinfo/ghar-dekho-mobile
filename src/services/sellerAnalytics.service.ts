import { httpClient } from '../api/httpClient';
import type { ApiSuccess } from '../types/api.types';
import { getApiErrorMessage } from './auth.service';

export type AnalyticsPeriod = '7D' | '30D' | '90D';

export interface SellerAnalyticsData {
  period: string;
  listingCount: number;
  activeListings: number;
  totals: {
    views: number;
    leads: number;
    messages: number;
    calls: number;
    saves: number;
    shares: number;
    meetings: number;
  };
  series: { date: string; views: number; leads: number; messages: number }[];
  topListings: {
    id: string;
    title: string;
    city?: string | null;
    locality?: string | null;
    status: string;
    periodStats?: {
      views: number;
      leads: number;
      messages: number;
      calls: number;
      saves: number;
    };
  }[];
}

export async function fetchMyAnalytics(period: AnalyticsPeriod = '30D'): Promise<SellerAnalyticsData> {
  try {
    const { data } = await httpClient.get<ApiSuccess<SellerAnalyticsData>>(
      '/api/properties/my-analytics',
      { params: { period } },
    );
    if (!data.success || !data.data) throw new Error(data.message || 'Failed to load analytics');
    return data.data;
  } catch (e) {
    throw new Error(getApiErrorMessage(e));
  }
}

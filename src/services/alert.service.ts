import { httpClient } from '../api/httpClient';
import type { ApiSuccess } from '../types/api.types';
import { getApiErrorMessage } from './auth.service';

export type PriceAlertType = 'BELOW' | 'ABOVE' | 'ANY_DROP';

export interface PriceAlertItem {
  id: string;
  propertyId: string;
  targetPrice: number;
  alertType: PriceAlertType;
  isActive: boolean;
  triggeredAt?: string | null;
  createdAt: string;
  property?: {
    id: string;
    title: string;
    price: number;
    city?: string | null;
    locality?: string | null;
    listingType?: string | null;
    images?: { imageUrl?: string | null; thumbnailUrl?: string | null }[];
  } | null;
}

export async function fetchPriceAlerts(): Promise<PriceAlertItem[]> {
  try {
    const { data } = await httpClient.get<ApiSuccess<PriceAlertItem[]>>('/api/alerts/price');
    if (!data.success) throw new Error(data.message || 'Failed to load alerts');
    return data.data ?? [];
  } catch (e) {
    throw new Error(getApiErrorMessage(e));
  }
}

export async function savePriceAlert(payload: {
  propertyId: string;
  targetPrice: number;
  alertType?: PriceAlertType;
}): Promise<PriceAlertItem> {
  try {
    const { data } = await httpClient.post<ApiSuccess<PriceAlertItem>>('/api/alerts/price', payload);
    if (!data.success || !data.data) throw new Error(data.message || 'Failed to save alert');
    return data.data;
  } catch (e) {
    throw new Error(getApiErrorMessage(e));
  }
}

export async function deletePriceAlert(alertId: string): Promise<void> {
  try {
    const { data } = await httpClient.delete<ApiSuccess<{ id: string }>>(`/api/alerts/price/${alertId}`);
    if (!data.success) throw new Error(data.message || 'Failed to delete alert');
  } catch (e) {
    throw new Error(getApiErrorMessage(e));
  }
}

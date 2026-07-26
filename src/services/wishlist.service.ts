import axios from 'axios';
import { httpClient } from '../api/httpClient';
import type { ApiPaginated, ApiSuccess } from '../types/api.types';
import type { WishlistRow } from '../types/wishlist.api.types';
import { getApiErrorMessage } from './auth.service';

export async function fetchWishlist(params?: { page?: number; limit?: number }) {
  const { data } = await httpClient.get<ApiPaginated<WishlistRow>>('/api/wishlist', { params });
  return data;
}

export async function addToWishlist(propertyId: string, notes?: string): Promise<void> {
  const { data } = await httpClient.post<ApiSuccess<unknown>>('/api/wishlist', {
    propertyId,
    ...(notes ? { notes } : {}),
  });
  if (!data.success) {
    throw new Error(data.message || 'Failed to save property');
  }
}

export async function removeWishlistItem(propertyId: string): Promise<void> {
  await httpClient.delete(`/api/wishlist/${propertyId}`);
}

export async function checkWishlist(propertyId: string): Promise<boolean> {
  const { data } = await httpClient.get<ApiSuccess<{ isSaved: boolean }>>(
    `/api/wishlist/check/${propertyId}`,
  );
  if (!data.success || !data.data) return false;
  return Boolean(data.data.isSaved);
}

export async function toggleWishlist(propertyId: string, currentlySaved: boolean): Promise<boolean> {
  if (currentlySaved) {
    await removeWishlistItem(propertyId);
    return false;
  }
  try {
    await addToWishlist(propertyId);
    return true;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.data?.code === 'ALREADY_EXISTS') {
      return true;
    }
    throw new Error(getApiErrorMessage(e));
  }
}

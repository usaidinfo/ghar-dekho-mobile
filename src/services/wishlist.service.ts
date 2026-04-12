import { httpClient } from '../api/httpClient';
import type { ApiPaginated } from '../types/api.types';
import type { WishlistRow } from '../types/wishlist.api.types';

export async function fetchWishlist(params?: { page?: number; limit?: number }) {
  const { data } = await httpClient.get<ApiPaginated<WishlistRow>>('/api/wishlist', { params });
  return data;
}

export async function removeWishlistItem(propertyId: string): Promise<void> {
  await httpClient.delete(`/api/wishlist/${propertyId}`);
}

import { httpClient } from '../api/httpClient';
import type { ApiSuccess } from '../types/api.types';
import type { CurrentUser } from '../types/user.types';

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const { data } = await httpClient.get<ApiSuccess<CurrentUser>>('/api/users/me');
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to load profile');
  }
  return data.data;
}

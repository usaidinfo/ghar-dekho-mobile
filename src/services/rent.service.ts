import { httpClient } from '../api/httpClient';
import type { ApiSuccess } from '../types/api.types';
import { getApiErrorMessage } from './auth.service';

export interface RentReminder {
  id: string;
  userId: string;
  propertyId?: string | null;
  tenantName?: string | null;
  amount: number;
  dueDate: number;
  message?: string | null;
  isActive: boolean;
  lastSentAt?: string | null;
  nextSendAt?: string | null;
  createdAt: string;
}

export async function fetchRentReminders(): Promise<RentReminder[]> {
  try {
    const { data } = await httpClient.get<ApiSuccess<RentReminder[]>>('/api/rent/reminders');
    if (!data.success) throw new Error(data.message || 'Failed to load reminders');
    return data.data ?? [];
  } catch (e) {
    throw new Error(getApiErrorMessage(e));
  }
}

export async function createRentReminder(payload: {
  amount: number;
  dueDate: number;
  tenantName?: string;
  propertyId?: string;
  message?: string;
}): Promise<RentReminder> {
  try {
    const { data } = await httpClient.post<ApiSuccess<RentReminder>>('/api/rent/reminders', payload);
    if (!data.success || !data.data) throw new Error(data.message || 'Failed to create reminder');
    return data.data;
  } catch (e) {
    throw new Error(getApiErrorMessage(e));
  }
}

export async function deleteRentReminder(id: string): Promise<void> {
  try {
    const { data } = await httpClient.delete<ApiSuccess<{ id: string }>>(`/api/rent/reminders/${id}`);
    if (!data.success) throw new Error(data.message || 'Failed to delete reminder');
  } catch (e) {
    throw new Error(getApiErrorMessage(e));
  }
}

export async function toggleRentReminder(id: string, isActive: boolean): Promise<RentReminder> {
  try {
    const { data } = await httpClient.patch<ApiSuccess<RentReminder>>(`/api/rent/reminders/${id}`, {
      isActive,
    });
    if (!data.success || !data.data) throw new Error(data.message || 'Failed to update reminder');
    return data.data;
  } catch (e) {
    throw new Error(getApiErrorMessage(e));
  }
}

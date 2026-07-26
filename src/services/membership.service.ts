import { httpClient } from '../api/httpClient';
import type { ApiSuccess } from '../types/api.types';
import type { MembershipAccountType, MembershipPlanTier } from '../types/membership.types';
import type { UserMembership } from '../types/user.types';

export interface ActivateDemoMembershipPayload {
  accountType: MembershipAccountType;
  planTier: MembershipPlanTier;
}

export async function fetchMembershipStatus(): Promise<UserMembership | null> {
  const { data } = await httpClient.get<ApiSuccess<UserMembership | null>>('/api/membership/status');
  if (!data.success) {
    throw new Error(data.message || 'Failed to load membership status');
  }
  return data.data ?? null;
}

export async function activateDemoMembership(
  payload: ActivateDemoMembershipPayload,
): Promise<UserMembership> {
  const { data } = await httpClient.post<ApiSuccess<UserMembership>>(
    '/api/membership/activate-demo',
    payload,
  );
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to activate membership');
  }
  return data.data;
}

export async function renewDemoMembership(): Promise<UserMembership> {
  const { data } = await httpClient.post<ApiSuccess<UserMembership>>('/api/membership/renew-demo');
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to renew membership');
  }
  return data.data;
}

export async function upgradeDemoMembership(planTier: MembershipPlanTier): Promise<UserMembership> {
  const { data } = await httpClient.post<ApiSuccess<UserMembership>>('/api/membership/upgrade-demo', {
    planTier,
  });
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to upgrade membership');
  }
  return data.data;
}

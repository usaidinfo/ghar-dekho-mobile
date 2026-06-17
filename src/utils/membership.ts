import type { CurrentUser } from '../types/user.types';
import type { LocalMembership } from '../stores/membership.store';
import { isLocalMembershipActive } from '../stores/membership.store';

/** Active subscription from backend `/api/users/me` agent profile. */
export function isMembershipActiveFromApi(user: CurrentUser | null | undefined): boolean {
  if (!user?.agentProfile) return false;
  const { subscriptionStatus, subscriptionExpiresAt } = user.agentProfile;
  if (subscriptionStatus?.toUpperCase() !== 'ACTIVE') return false;
  if (!subscriptionExpiresAt) return true;
  return new Date(subscriptionExpiresAt) > new Date();
}

/** True when backend or local demo membership is active. */
export function isMembershipActive(
  user: CurrentUser | null | undefined,
  localMembership?: LocalMembership | null,
): boolean {
  if (isMembershipActiveFromApi(user)) return true;
  return isLocalMembershipActive(localMembership);
}

/** Prefer server expiry; fall back to local demo record. */
export function resolveMembershipExpiresAt(
  user: CurrentUser | null | undefined,
  localMembership?: LocalMembership | null,
): string | null {
  if (isMembershipActiveFromApi(user)) {
    return user?.agentProfile?.subscriptionExpiresAt ?? null;
  }
  if (isLocalMembershipActive(localMembership)) {
    return localMembership?.expiresAt ?? null;
  }
  return null;
}

export function resolveMembershipPlanDays(
  user: CurrentUser | null | undefined,
  localMembership?: LocalMembership | null,
): number {
  if (isLocalMembershipActive(localMembership) && localMembership?.planDays) {
    return localMembership.planDays;
  }
  return 30;
}

export function formatMembershipExpiry(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Whole days until subscription expiry (0 if expired). */
export function getMembershipDaysRemaining(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const end = new Date(iso);
  if (Number.isNaN(end.getTime())) return null;
  const diff = end.getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** Elapsed share of the billing period (0–100), assuming a fixed plan length. */
export function getMembershipProgressPercent(
  expiresAt: string | null | undefined,
  planDays = 30,
): number {
  if (!expiresAt) return 0;
  const end = new Date(expiresAt);
  if (Number.isNaN(end.getTime())) return 0;
  const start = new Date(end);
  start.setDate(start.getDate() - planDays);
  const total = end.getTime() - start.getTime();
  if (total <= 0) return 100;
  const elapsed = Date.now() - start.getTime();
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

/** Show renew nudge when membership ends within this many days. */
export function isMembershipExpiringSoon(
  expiresAt: string | null | undefined,
  withinDays = 14,
): boolean {
  const remaining = getMembershipDaysRemaining(expiresAt);
  if (remaining === null) return false;
  return remaining > 0 && remaining <= withinDays;
}

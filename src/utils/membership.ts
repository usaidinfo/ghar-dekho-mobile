import type { CurrentUser } from '../types/user.types';
import type { AuthUser } from '../types/auth.types';
import type { LocalMembership } from '../stores/membership.store';
import { isLocalMembershipActive } from '../stores/membership.store';

type MembershipLike =
  | CurrentUser
  | AuthUser
  | {
      membership?: { status?: string; expiresAt?: string | null; planDays?: number; planName?: string } | null;
      membershipStatus?: string | null;
      membershipExpiresAt?: string | null;
      agentProfile?: {
        subscriptionStatus?: string | null;
        subscriptionExpiresAt?: string | null;
      } | null;
    }
  | null
  | undefined;

function isUserMembershipBlockActive(user: MembershipLike): boolean {
  const m = user?.membership;
  if (!m || m.status?.toUpperCase() !== 'ACTIVE') return false;
  if (!m.expiresAt) return true;
  return new Date(m.expiresAt) > new Date();
}

export function isMembershipActiveFromApi(user: MembershipLike): boolean {
  if (isUserMembershipBlockActive(user)) return true;

  const agent = user && 'agentProfile' in user ? user.agentProfile : null;
  if (agent) {
    const { subscriptionStatus, subscriptionExpiresAt } = agent;
    if (subscriptionStatus?.toUpperCase() === 'ACTIVE') {
      if (!subscriptionExpiresAt) return true;
      if (new Date(subscriptionExpiresAt) > new Date()) return true;
    }
  }

  if (user && 'membershipStatus' in user && user.membershipStatus?.toUpperCase() === 'ACTIVE') {
    const exp = 'membershipExpiresAt' in user ? user.membershipExpiresAt : null;
    if (!exp) return true;
    return new Date(exp) > new Date();
  }

  return false;
}

export function isMembershipActive(
  user: MembershipLike,
  localMembership?: LocalMembership | null,
): boolean {
  if (isMembershipActiveFromApi(user)) return true;
  return isLocalMembershipActive(localMembership);
}

export function resolveMembershipExpiresAt(
  user: MembershipLike,
  localMembership?: LocalMembership | null,
): string | null {
  if (isUserMembershipBlockActive(user)) {
    return user?.membership?.expiresAt ?? null;
  }
  if (isMembershipActiveFromApi(user)) {
    const agent = user && 'agentProfile' in user ? user.agentProfile : null;
    return (
      agent?.subscriptionExpiresAt ??
      (user && 'membershipExpiresAt' in user ? user.membershipExpiresAt ?? null : null) ??
      user?.membership?.expiresAt ??
      null
    );
  }
  if (isLocalMembershipActive(localMembership)) {
    return localMembership?.expiresAt ?? null;
  }
  return null;
}

export function resolveMembershipPlanDays(
  user: MembershipLike,
  localMembership?: LocalMembership | null,
): number {
  const m = user?.membership as { planDays?: number } | null | undefined;
  if (m?.planDays) return m.planDays;
  if (isLocalMembershipActive(localMembership) && localMembership?.planDays) {
    return localMembership.planDays;
  }
  return 30;
}

export function resolveMembershipPlanLabel(
  user: MembershipLike,
  localMembership?: LocalMembership | null,
): string | null {
  const m = user?.membership as { planName?: string } | null | undefined;
  if (m?.planName) return m.planName;
  if (localMembership?.planLabel) return localMembership.planLabel;
  return null;
}

export function formatMembershipExpiry(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function getMembershipDaysRemaining(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const end = new Date(iso);
  if (Number.isNaN(end.getTime())) return null;
  const diff = end.getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

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

export function isMembershipExpiringSoon(
  expiresAt: string | null | undefined,
  withinDays = 14,
): boolean {
  const remaining = getMembershipDaysRemaining(expiresAt);
  if (remaining === null) return false;
  return remaining > 0 && remaining <= withinDays;
}

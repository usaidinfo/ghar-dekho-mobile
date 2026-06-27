import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  MembershipAccountType,
  MembershipPlanDefinition,
  MembershipPlanTier,
} from '../types/membership.types';
import type { MembershipAccountTypeDefinition } from '../types/membership.types';

export const MEMBERSHIP_PLAN_DAYS = 30;

export interface ActivateMembershipOptions {
  planDays?: number;
  accountType: MembershipAccountType;
  planTier: MembershipPlanTier;
  priceInr: number;
  planLabel: string;
}

export interface LocalMembership {
  userId: string;
  status: 'ACTIVE';
  expiresAt: string;
  activatedAt: string;
  planDays: number;
  accountType?: MembershipAccountType;
  planTier?: MembershipPlanTier;
  priceInr?: number;
  planLabel?: string;
}

interface MembershipState {
  /** Local demo subscription until Razorpay + backend are wired. Keyed by user id. */
  byUserId: Record<string, LocalMembership>;
  hasHydrated: boolean;
  activate: (userId: string, options: ActivateMembershipOptions) => LocalMembership;
  renew: (userId: string, options: ActivateMembershipOptions) => LocalMembership;
  clearForUser: (userId: string) => void;
  getForUser: (userId: string) => LocalMembership | null;
}

function addDays(from: Date, days: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

function buildMembership(
  userId: string,
  options: ActivateMembershipOptions,
  baseDate = new Date(),
): LocalMembership {
  const planDays = options.planDays ?? 30;
  const activatedAt = baseDate.toISOString();
  const expiresAt = addDays(baseDate, planDays).toISOString();
  return {
    userId,
    status: 'ACTIVE',
    expiresAt,
    activatedAt,
    planDays,
    accountType: options.accountType,
    planTier: options.planTier,
    priceInr: options.priceInr,
    planLabel: options.planLabel,
  };
}

export function isLocalMembershipActive(record: LocalMembership | null | undefined): boolean {
  if (!record || record.status !== 'ACTIVE') return false;
  return new Date(record.expiresAt) > new Date();
}

export const useMembershipStore = create<MembershipState>()(
  persist(
    (set, get) => ({
      byUserId: {},
      hasHydrated: false,
      getForUser: userId => {
        const record = get().byUserId[userId] ?? null;
        return isLocalMembershipActive(record) ? record : null;
      },
      activate: (userId, options) => {
        const next = buildMembership(userId, options);
        set(state => ({
          byUserId: { ...state.byUserId, [userId]: next },
        }));
        return next;
      },
      renew: (userId, options) => {
        const existing = get().byUserId[userId];
        const now = new Date();
        const currentEnd =
          existing && isLocalMembershipActive(existing) ? new Date(existing.expiresAt) : now;
        const base = currentEnd > now ? currentEnd : now;
        const next = buildMembership(userId, options, base);
        set(state => ({
          byUserId: { ...state.byUserId, [userId]: next },
        }));
        return next;
      },
      clearForUser: userId =>
        set(state => {
          const next = { ...state.byUserId };
          delete next[userId];
          return { byUserId: next };
        }),
    }),
    {
      name: 'ghardekho-membership-demo',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: s => ({ byUserId: s.byUserId }),
      onRehydrateStorage: () => () => {
        useMembershipStore.setState({ hasHydrated: true });
      },
    },
  ),
);

/** Simulates Razorpay checkout delay until the real gateway is integrated. */
export function simulateMembershipPayment(ms = 1400): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export function formatPlanCheckoutLabel(
  account: MembershipAccountTypeDefinition,
  plan: MembershipPlanDefinition,
): string {
  return `${account.title} — ${plan.name}`;
}

// Re-exports for backward compatibility
export { MEMBERSHIP_ACCOUNT_TYPES, getAccountTypeDefinition } from '../constants/membershipPlans';

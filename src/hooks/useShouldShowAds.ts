/**
 * @file useShouldShowAds.ts
 * @description Single source of truth for whether ads should be shown.
 *
 * LOGIC
 * ──────
 *   shouldShowAds =
 *     globalAdsEnabled (ADS_ENABLED env flag)
 *     && user has no active paid membership     ← excludes paid members
 *     && backend did not explicitly disable ads  ← respects adsEnabled field
 *
 * PAID-USER EXCLUSION
 * ────────────────────
 * The backend sets `membership.status = "ACTIVE"` for paying subscribers
 * and sends `adsEnabled: false` in the `/api/users/me` response.
 * Both checks are applied independently — either one suppresses all ads.
 *
 * Guests (not logged in) are treated as free users and may see ads.
 *
 * This hook is cheap (reads Zustand, no network call) and safe to call
 * from any component or hook. It re-evaluates reactively on auth changes.
 */

import { useAuthStore } from '../stores/auth.store';
import { adsConfig } from '../config/ads.config';

export interface ShouldShowAdsResult {
  /** True only when all conditions for showing ads pass. */
  shouldShowAds: boolean;
  /** Breakdown useful for debugging. */
  reason: {
    globalEnabled: boolean;
    membershipInactive: boolean;
    backendAdsEnabled: boolean;
  };
}

export function useShouldShowAds(): ShouldShowAdsResult {
  const user = useAuthStore(s => s.user);

  // 1. Global kill-switch from .env
  const globalEnabled = adsConfig.globalAdsEnabled;

  // 2. Paid-member check — `membership.status` is populated from /api/users/me
  //    and persisted in the Zustand auth store across sessions.
  const membershipStatus = user?.membership?.status;
  const membershipInactive =
    !membershipStatus || membershipStatus.toUpperCase() !== 'ACTIVE';

  // 3. Backend explicit flag — false when the server decided this user
  //    should not see ads (e.g. paid plan active).
  //    Defaults to true for guests (user === null) and unannotated accounts.
  //    If either signal says paid, ads stay hidden.
  const backendAdsEnabled = user == null ? true : user.adsEnabled !== false;

  const shouldShowAds = globalEnabled && membershipInactive && backendAdsEnabled;

  return {
    shouldShowAds,
    reason: { globalEnabled, membershipInactive, backendAdsEnabled },
  };
}

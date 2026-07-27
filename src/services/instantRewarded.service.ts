/**
 * @file instantRewarded.service.ts
 * @description Module-level rewarded interstitial that survives screen unmount.
 *
 * WHY A SINGLETON
 * ────────────────
 * Screens like Profile / EditProfile call `show()` and immediately navigate
 * away. If the ad lived only inside a hook, cleanup would null it before show.
 *
 * Callers still MUST gate with `useShouldShowAds()`.
 */

import {
  RewardedInterstitialAd,
  AdEventType,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';
import { adsConfig } from '../config/ads.config';

let ad: RewardedInterstitialAd | null = null;
let loaded = false;
let removeListeners: (() => void) | null = null;
let enabled = false;

function cleanupListeners() {
  removeListeners?.();
  removeListeners = null;
}

export function setInstantRewardedEnabled(next: boolean): void {
  if (enabled === next) {
    if (next && !ad) preloadInstantRewarded();
    return;
  }
  enabled = next;
  if (!enabled) {
    cleanupListeners();
    ad = null;
    loaded = false;
    return;
  }
  preloadInstantRewarded();
}

export function preloadInstantRewarded(): void {
  if (!enabled) return;

  cleanupListeners();
  loaded = false;

  const next = RewardedInterstitialAd.createForAdRequest(
    adsConfig.adUnitIds.rewardedInterstitial,
    { requestNonPersonalizedAdsOnly: true },
  );

  const unsubLoaded = next.addAdEventListener(RewardedAdEventType.LOADED, () => {
    loaded = true;
  });
  const unsubClosed = next.addAdEventListener(AdEventType.CLOSED, () => {
    loaded = false;
    preloadInstantRewarded();
  });
  const unsubError = next.addAdEventListener(AdEventType.ERROR, () => {
    loaded = false;
    setTimeout(() => {
      if (enabled) preloadInstantRewarded();
    }, 30_000);
  });

  removeListeners = () => {
    unsubLoaded();
    unsubClosed();
    unsubError();
  };

  ad = next;
  next.load();
}

/** Fire-and-forget show. Safe after navigation; no-op for paid / disabled. */
export function showInstantRewarded(): void {
  if (!enabled || !loaded || !ad) return;
  ad.show().catch(() => undefined);
}

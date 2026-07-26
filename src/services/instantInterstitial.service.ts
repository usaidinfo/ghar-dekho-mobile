/**
 * @file instantInterstitial.service.ts
 * @description Module-level interstitial that survives screen unmount.
 *
 * WHY A SINGLETON
 * ────────────────
 * Screens like Profile / EditProfile call `show()` and immediately navigate
 * away. If the InterstitialAd lived only inside a hook, the screen's
 * useEffect cleanup would null the ad before it could display.
 *
 * Callers still MUST gate with `useShouldShowAds()` — this service never
 * loads or shows when `enabled` is false.
 */

import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { adsConfig } from '../config/ads.config';

let ad: InterstitialAd | null = null;
let loaded = false;
let removeListeners: (() => void) | null = null;
let enabled = false;

function cleanupListeners() {
  removeListeners?.();
  removeListeners = null;
}

export function setInstantInterstitialEnabled(next: boolean): void {
  if (enabled === next) {
    if (next && !ad) preloadInstantInterstitial();
    return;
  }
  enabled = next;
  if (!enabled) {
    cleanupListeners();
    ad = null;
    loaded = false;
    return;
  }
  preloadInstantInterstitial();
}

export function preloadInstantInterstitial(): void {
  if (!enabled) return;

  cleanupListeners();
  loaded = false;

  const next = InterstitialAd.createForAdRequest(adsConfig.adUnitIds.interstitial, {
    requestNonPersonalizedAdsOnly: true,
    // TODO: Replace with consent-based options when a CMP is integrated.
  });

  const unsubLoaded = next.addAdEventListener(AdEventType.LOADED, () => {
    loaded = true;
  });
  const unsubClosed = next.addAdEventListener(AdEventType.CLOSED, () => {
    loaded = false;
    preloadInstantInterstitial();
  });
  const unsubError = next.addAdEventListener(AdEventType.ERROR, () => {
    loaded = false;
    setTimeout(() => {
      if (enabled) preloadInstantInterstitial();
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
export function showInstantInterstitial(): void {
  if (!enabled || !loaded || !ad) return;
  ad.show().catch(() => undefined);
}

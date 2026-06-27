/**
 * @file useInterstitialAd.ts
 * @description Manages interstitial ad lifecycle with frequency capping.
 *
 * FREQUENCY CAPPING
 * ──────────────────
 * - Minimum 3 minutes between shows (MIN_INTERVAL_MS).
 * - Minimum 3 meaningful user actions between shows (ACTION_CAP).
 * - Both conditions must pass before an ad is eligible.
 *
 * USAGE
 * ──────
 *   const { tryShowInterstitial, trackAction } = useInterstitialAd();
 *
 *   // After a meaningful navigation event (e.g. opening property detail):
 *   trackAction();          // increments action counter
 *   tryShowInterstitial();  // shows if frequency caps pass
 *
 * PAID-USER EXCLUSION
 * ────────────────────
 * tryShowInterstitial() returns early if useShouldShowAds() is false.
 * The ad is never loaded or shown for paid members.
 *
 * SAFE PLACES TO CALL tryShowInterstitial()
 * ────────────────────────────────────────────
 * ✅ After property detail opens (post-navigation)
 * ✅ After wishlist toggle
 * ✅ After search results load
 * ❌ During login, payment, OTP, checkout, form submission
 */

import { useCallback, useEffect, useRef } from 'react';
import {
  InterstitialAd,
  AdEventType,
} from 'react-native-google-mobile-ads';

import { adsConfig } from '../config/ads.config';
import { useShouldShowAds } from './useShouldShowAds';

const MIN_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes
const ACTION_CAP = 3; // minimum meaningful actions between shows

export interface UseInterstitialAdReturn {
  /** Call after meaningful navigation / action milestones. */
  tryShowInterstitial: () => void;
  /** Increment the action counter (call at natural app events). */
  trackAction: () => void;
}

export function useInterstitialAd(): UseInterstitialAdReturn {
  const { shouldShowAds } = useShouldShowAds();

  const adRef = useRef<InterstitialAd | null>(null);
  const loadedRef = useRef(false);
  const lastShownAtRef = useRef<number>(0);
  const actionsSinceLastShowRef = useRef<number>(0);

  const createAndLoad = useCallback(() => {
    if (!shouldShowAds) return;

    const ad = InterstitialAd.createForAdRequest(adsConfig.adUnitIds.interstitial, {
      requestNonPersonalizedAdsOnly: true,
      // TODO: Replace with consent-based options when CMP is integrated.
    });

    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      loadedRef.current = true;
    });

    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      loadedRef.current = false;
      unsubLoaded();
      unsubClosed();
      // Preload the next interstitial immediately after close.
      createAndLoad();
    });

    const unsubError = ad.addAdEventListener(AdEventType.ERROR, _err => {
      loadedRef.current = false;
      unsubLoaded();
      unsubClosed();
      unsubError();
      // Retry after a delay on load error.
      setTimeout(() => createAndLoad(), 30_000);
    });

    ad.load();
    adRef.current = ad;
  }, [shouldShowAds]);

  // Load on mount (only for free users).
  useEffect(() => {
    if (shouldShowAds) {
      createAndLoad();
    }
    return () => {
      // Cleanup listeners held by the ad object.
      adRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShowAds]);

  const trackAction = useCallback(() => {
    actionsSinceLastShowRef.current += 1;
  }, []);

  const tryShowInterstitial = useCallback(() => {
    if (!shouldShowAds) return;
    if (!loadedRef.current || !adRef.current) return;

    const now = Date.now();
    const timePassed = now - lastShownAtRef.current >= MIN_INTERVAL_MS;
    const actionsPassed = actionsSinceLastShowRef.current >= ACTION_CAP;

    if (!timePassed || !actionsPassed) return;

    lastShownAtRef.current = now;
    actionsSinceLastShowRef.current = 0;
    adRef.current.show().catch(() => {
      // Show failure is non-fatal — next tryShowInterstitial will retry.
    });
  }, [shouldShowAds]);

  return { tryShowInterstitial, trackAction };
}

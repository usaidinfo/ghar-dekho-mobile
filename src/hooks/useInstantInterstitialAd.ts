/**
 * @file useInstantInterstitialAd.ts
 * @description Uncapped interstitial ad — shows every time `show()` is called.
 *
 * Unlike `useInterstitialAd` (3-minute / 3-action frequency cap, best-effort
 * placement for browsing screens), this hook has NO caps. Use it for events
 * that should reliably trigger an ad every single time they happen — e.g.
 * switching account mode in Edit Profile.
 *
 * PAID-USER EXCLUSION
 * ────────────────────
 * `show()` is a no-op when `useShouldShowAds()` is false (premium members,
 * or ads globally disabled). The ad is never loaded for those users.
 *
 * USAGE
 * ──────
 *   const { show } = useInstantInterstitialAd();
 *   // After the action completes successfully:
 *   show();
 */

import { useCallback, useEffect, useRef } from 'react';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';

import { adsConfig } from '../config/ads.config';
import { useShouldShowAds } from './useShouldShowAds';

export interface UseInstantInterstitialAdReturn {
  /** Shows the preloaded interstitial immediately (if ready). Every call attempts a show. */
  show: () => void;
}

export function useInstantInterstitialAd(): UseInstantInterstitialAdReturn {
  const { shouldShowAds } = useShouldShowAds();

  const adRef = useRef<InterstitialAd | null>(null);
  const loadedRef = useRef(false);
  const removeListenersRef = useRef<() => void>(() => {});

  const createAndLoad = useCallback(() => {
    if (!shouldShowAds) return;

    removeListenersRef.current();
    loadedRef.current = false;

    const ad = InterstitialAd.createForAdRequest(adsConfig.adUnitIds.interstitial, {
      requestNonPersonalizedAdsOnly: true,
      // TODO: Replace with consent-based options when a CMP is integrated.
    });

    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      loadedRef.current = true;
    });
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      loadedRef.current = false;
      // Preload the next one immediately so the very next `show()` call is ready.
      createAndLoad();
    });
    const unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
      loadedRef.current = false;
      setTimeout(() => createAndLoad(), 30_000);
    });

    removeListenersRef.current = () => {
      unsubLoaded();
      unsubClosed();
      unsubError();
    };

    adRef.current = ad;
    ad.load();
  }, [shouldShowAds]);

  useEffect(() => {
    if (shouldShowAds) {
      createAndLoad();
    }
    return () => {
      removeListenersRef.current();
      adRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShowAds]);

  const show = useCallback(() => {
    if (!shouldShowAds) return;
    if (!loadedRef.current || !adRef.current) return;
    adRef.current.show().catch(() => {
      // Non-fatal — the ad will simply not show this time.
    });
  }, [shouldShowAds]);

  return { show };
}

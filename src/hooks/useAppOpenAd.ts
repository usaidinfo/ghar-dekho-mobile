/**
 * @file useAppOpenAd.ts
 * @description App Open ad — shown when the app returns to foreground.
 *
 * ENABLE/DISABLE
 * ───────────────
 * Controlled by ENABLE_APP_OPEN_ADS in .env (default: false).
 * Set it to true only after manual QA on real devices — app open ads
 * are invasive and can hurt retention if shown too aggressively.
 *
 * SAFE GUARDS
 * ────────────
 * - Never shown over auth / login / OTP / checkout screens.
 * - Minimum 4 minutes between shows (MIN_INTERVAL_MS).
 * - Only for free users (useShouldShowAds check).
 * - Preloaded in background; not shown until app comes to foreground.
 *
 * HOW TO USE
 * ───────────
 * Mount this hook once at the top level (App.jsx) when it is stable.
 * It self-manages the AppState listener and ad lifecycle.
 *
 *   import { useAppOpenAd } from './src/hooks/useAppOpenAd';
 *   // Inside App() component:
 *   useAppOpenAd();
 */

import { useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  AppOpenAd,
  AdEventType,
} from 'react-native-google-mobile-ads';

import { adsConfig } from '../config/ads.config';
import { useShouldShowAds } from './useShouldShowAds';

const MIN_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes between app open ads

export function useAppOpenAd(): void {
  const { shouldShowAds } = useShouldShowAds();

  const adRef = useRef<AppOpenAd | null>(null);
  const loadedRef = useRef(false);
  const lastShownAtRef = useRef<number>(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const enabled = shouldShowAds && adsConfig.appOpenAdsEnabled;

  const createAndLoad = useCallback(() => {
    if (!enabled) return;

    const ad = AppOpenAd.createForAdRequest(adsConfig.adUnitIds.appOpen, {
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
      createAndLoad(); // preload next
    });

    const unsubError = ad.addAdEventListener(AdEventType.ERROR, _err => {
      loadedRef.current = false;
      unsubLoaded();
      unsubClosed();
      unsubError();
      setTimeout(() => createAndLoad(), 60_000);
    });

    ad.load();
    adRef.current = ad;
  }, [enabled]);

  const tryShow = useCallback(() => {
    if (!enabled) return;
    if (!loadedRef.current || !adRef.current) return;

    const now = Date.now();
    if (now - lastShownAtRef.current < MIN_INTERVAL_MS) return;

    lastShownAtRef.current = now;
    adRef.current.show().catch(() => {});
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    createAndLoad();

    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      const wasBackground =
        appStateRef.current === 'background' || appStateRef.current === 'inactive';
      const nowForeground = nextState === 'active';

      if (wasBackground && nowForeground) {
        tryShow();
      }
      appStateRef.current = nextState;
    });

    return () => {
      sub.remove();
      adRef.current = null;
    };
  }, [enabled, createAndLoad, tryShow]);
}

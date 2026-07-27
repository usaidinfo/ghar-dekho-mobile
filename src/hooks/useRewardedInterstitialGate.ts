/**
 * @file useRewardedInterstitialGate.ts
 * @description Frequency-capped rewarded interstitial (replaces classic interstitial).
 *
 * FREQUENCY CAPPING
 * ──────────────────
 * - Minimum 3 minutes between shows (MIN_INTERVAL_MS).
 * - Minimum 3 meaningful user actions between shows (ACTION_CAP).
 *
 * USAGE
 * ──────
 *   const { tryShowRewarded, trackAction } = useRewardedInterstitialGate();
 *   trackAction();
 *   tryShowRewarded();
 */

import { useCallback, useEffect, useRef } from 'react';
import {
  RewardedInterstitialAd,
  AdEventType,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';

import { adsConfig } from '../config/ads.config';
import { useShouldShowAds } from './useShouldShowAds';

const MIN_INTERVAL_MS = 3 * 60 * 1000;
const ACTION_CAP = 3;

export interface UseRewardedInterstitialGateReturn {
  tryShowRewarded: () => void;
  trackAction: () => void;
}

export function useRewardedInterstitialGate(): UseRewardedInterstitialGateReturn {
  const { shouldShowAds } = useShouldShowAds();

  const adRef = useRef<RewardedInterstitialAd | null>(null);
  const loadedRef = useRef(false);
  const lastShownAtRef = useRef(0);
  const actionsSinceLastShowRef = useRef(0);

  const createAndLoad = useCallback(() => {
    if (!shouldShowAds) return;

    const ad = RewardedInterstitialAd.createForAdRequest(
      adsConfig.adUnitIds.rewardedInterstitial,
      { requestNonPersonalizedAdsOnly: true },
    );

    const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      loadedRef.current = true;
    });

    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      loadedRef.current = false;
      unsubLoaded();
      unsubClosed();
      createAndLoad();
    });

    const unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
      loadedRef.current = false;
      unsubLoaded();
      unsubClosed();
      unsubError();
      setTimeout(() => createAndLoad(), 30_000);
    });

    ad.load();
    adRef.current = ad;
  }, [shouldShowAds]);

  useEffect(() => {
    if (shouldShowAds) {
      createAndLoad();
    }
    return () => {
      adRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShowAds]);

  const trackAction = useCallback(() => {
    actionsSinceLastShowRef.current += 1;
  }, []);

  const tryShowRewarded = useCallback(() => {
    if (!shouldShowAds) return;
    if (!loadedRef.current || !adRef.current) return;

    const now = Date.now();
    const timePassed = now - lastShownAtRef.current >= MIN_INTERVAL_MS;
    const actionsPassed = actionsSinceLastShowRef.current >= ACTION_CAP;
    if (!timePassed || !actionsPassed) return;

    lastShownAtRef.current = now;
    actionsSinceLastShowRef.current = 0;
    adRef.current.show().catch(() => undefined);
  }, [shouldShowAds]);

  return { tryShowRewarded, trackAction };
}

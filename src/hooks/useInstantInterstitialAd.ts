/**
 * @file useInstantInterstitialAd.ts
 * @description Uncapped interstitial ad — shows every time `show()` is called.
 */

import { useCallback, useEffect } from 'react';

import { useShouldShowAds } from './useShouldShowAds';
import {
  setInstantInterstitialEnabled,
  showInstantInterstitial,
} from '../services/instantInterstitial.service';

export interface UseInstantInterstitialAdReturn {
  show: () => void;
}

export function useInstantInterstitialAd(): UseInstantInterstitialAdReturn {
  const { shouldShowAds } = useShouldShowAds();

  useEffect(() => {
    setInstantInterstitialEnabled(shouldShowAds);
  }, [shouldShowAds]);

  const show = useCallback(() => {
    if (!shouldShowAds) return;
    showInstantInterstitial();
  }, [shouldShowAds]);

  return { show };
}

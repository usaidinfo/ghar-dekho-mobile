/**
 * @file useInstantRewardedAd.ts
 * @description Uncapped rewarded interstitial — shows every time `show()` is called.
 */

import { useCallback, useEffect } from 'react';

import { useShouldShowAds } from './useShouldShowAds';
import {
  setInstantRewardedEnabled,
  showInstantRewarded,
} from '../services/instantRewarded.service';

export interface UseInstantRewardedAdReturn {
  show: () => void;
}

export function useInstantRewardedAd(): UseInstantRewardedAdReturn {
  const { shouldShowAds } = useShouldShowAds();

  useEffect(() => {
    setInstantRewardedEnabled(shouldShowAds);
  }, [shouldShowAds]);

  const show = useCallback(() => {
    if (!shouldShowAds) return;
    showInstantRewarded();
  }, [shouldShowAds]);

  return { show };
}

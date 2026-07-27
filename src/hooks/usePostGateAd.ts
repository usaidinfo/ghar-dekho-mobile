/**
 * @file usePostGateAd.ts
 * @description Mandatory rewarded interstitial "ad gate" for Post Property.
 *
 * Free users must watch a rewarded interstitial through to earn the reward
 * before the form can be submitted. Paid members skip the gate.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  RewardedInterstitialAd,
  AdEventType,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';

import { adsConfig } from '../config/ads.config';
import { useShouldShowAds } from './useShouldShowAds';

export type PostGateAdStatus = 'loading' | 'ready' | 'showing' | 'watched' | 'failed';

export interface UsePostGateAdReturn {
  status: PostGateAdStatus;
  watched: boolean;
  retry: () => void;
}

export function usePostGateAd(): UsePostGateAdReturn {
  const { shouldShowAds } = useShouldShowAds();

  const [status, setStatus] = useState<PostGateAdStatus>(shouldShowAds ? 'loading' : 'watched');

  const adRef = useRef<RewardedInterstitialAd | null>(null);
  const removeListenersRef = useRef<() => void>(() => {});
  const hasShownRef = useRef(false);
  const earnedRef = useRef(false);

  const load = useCallback(() => {
    if (!shouldShowAds) {
      setStatus('watched');
      return;
    }

    removeListenersRef.current();
    hasShownRef.current = false;
    earnedRef.current = false;
    setStatus('loading');

    const ad = RewardedInterstitialAd.createForAdRequest(
      adsConfig.adUnitIds.rewardedInterstitial,
      { requestNonPersonalizedAdsOnly: true },
    );

    const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setStatus('ready');
    });
    const unsubOpened = ad.addAdEventListener(AdEventType.OPENED, () => {
      setStatus('showing');
    });
    const unsubEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      earnedRef.current = true;
    });
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setStatus(earnedRef.current ? 'watched' : 'failed');
    });
    const unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
      setStatus('failed');
    });

    removeListenersRef.current = () => {
      unsubLoaded();
      unsubOpened();
      unsubEarned();
      unsubClosed();
      unsubError();
    };

    adRef.current = ad;
    ad.load();
  }, [shouldShowAds]);

  useFocusEffect(
    useCallback(() => {
      load();
      return () => {
        removeListenersRef.current();
        adRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [load]),
  );

  useEffect(() => {
    if (status === 'ready' && adRef.current && !hasShownRef.current) {
      hasShownRef.current = true;
      adRef.current.show().catch(() => setStatus('failed'));
    }
  }, [status]);

  const retry = useCallback(() => {
    load();
  }, [load]);

  return { status, watched: status === 'watched', retry };
}

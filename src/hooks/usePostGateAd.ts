/**
 * @file usePostGateAd.ts
 * @description Mandatory interstitial "ad gate" for the Post Property screen.
 *
 * REQUIREMENT
 * ────────────
 * Every time a free user opens Create Post, a full interstitial ad must
 * load, show automatically, and be watched through to close BEFORE the
 * form can be submitted. Unlike `useInterstitialAd` (frequency-capped,
 * best-effort placement), this hook has NO caps — it is a hard gate that
 * runs on every visit to the screen.
 *
 * PAID-USER EXCLUSION
 * ────────────────────
 * Premium / paid members never see ads anywhere in the app, so the gate
 * is skipped entirely for them — `watched` starts `true` immediately.
 *
 * FAILURE HANDLING
 * ──────────────────
 * If the ad fails to load (no fill / no network), the user is not stuck
 * forever without any escape — a Retry action is exposed. This does NOT
 * bypass the gate; it only lets the user try loading the ad again.
 *
 * USAGE
 * ──────
 *   const { status, watched, retry } = usePostGateAd();
 *   // Render a blocking overlay while !watched, using `status` for copy.
 *   // Guard the actual submit handler with `if (!watched) return;`.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';

import { adsConfig } from '../config/ads.config';
import { useShouldShowAds } from './useShouldShowAds';

export type PostGateAdStatus = 'loading' | 'ready' | 'showing' | 'watched' | 'failed';

export interface UsePostGateAdReturn {
  /** Current lifecycle state — drive loading/failed copy in the UI from this. */
  status: PostGateAdStatus;
  /** True once the gate is satisfied and the form may be submitted. */
  watched: boolean;
  /** Re-attempt loading the ad after a failure. */
  retry: () => void;
}

export function usePostGateAd(): UsePostGateAdReturn {
  const { shouldShowAds } = useShouldShowAds();

  const [status, setStatus] = useState<PostGateAdStatus>(shouldShowAds ? 'loading' : 'watched');

  const adRef = useRef<InterstitialAd | null>(null);
  const removeListenersRef = useRef<() => void>(() => {});
  const hasShownRef = useRef(false);

  const load = useCallback(() => {
    if (!shouldShowAds) {
      setStatus('watched');
      return;
    }

    removeListenersRef.current();
    hasShownRef.current = false;
    setStatus('loading');

    const ad = InterstitialAd.createForAdRequest(adsConfig.adUnitIds.interstitial, {
      requestNonPersonalizedAdsOnly: true,
      // TODO: Replace with consent-based options when a CMP is integrated.
    });

    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      setStatus('ready');
    });
    const unsubOpened = ad.addAdEventListener(AdEventType.OPENED, () => {
      setStatus('showing');
    });
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      // User watched the ad through to close — unlock posting.
      setStatus('watched');
    });
    const unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
      setStatus('failed');
    });

    removeListenersRef.current = () => {
      unsubLoaded();
      unsubOpened();
      unsubClosed();
      unsubError();
    };

    adRef.current = ad;
    ad.load();
  }, [shouldShowAds]);

  // Load a fresh ad every time the screen gains focus (covers back-and-forth navigation).
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

  // Auto-show the instant it finishes loading — no extra tap required.
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

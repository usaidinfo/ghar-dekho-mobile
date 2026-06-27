/**
 * @file AppBannerAd.tsx
 * @description Reusable adaptive banner ad component.
 *
 * USAGE
 * ──────
 *   import AppBannerAd from '../../components/ads/AppBannerAd';
 *   // Place at the bottom of any scroll view or screen:
 *   <AppBannerAd />
 *
 * PAID-USER EXCLUSION
 * ────────────────────
 * Renders nothing when useShouldShowAds() returns false.
 * Paid members will never see this component render.
 *
 * ERROR SAFETY
 * ─────────────
 * onAdFailedToLoad hides the banner silently — no crash, no visible
 * error state shown to the user.
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { adsConfig } from '../../config/ads.config';
import { useShouldShowAds } from '../../hooks/useShouldShowAds';

interface AppBannerAdProps {
  /** Override the default adaptive banner size. */
  size?: BannerAdSize;
  /** Extra style applied to the outer container. */
  containerStyle?: object;
}

const AppBannerAd: React.FC<AppBannerAdProps> = ({
  size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
  containerStyle,
}) => {
  const { shouldShowAds } = useShouldShowAds();
  const [adLoaded, setAdLoaded] = useState(false);
  const [adFailed, setAdFailed] = useState(false);

  // Hard gate: paid members and globally-disabled ads return null immediately.
  if (!shouldShowAds) return null;
  // After a failed load, hide silently to avoid blank space.
  if (adFailed) return null;

  return (
    <View style={[styles.container, !adLoaded && styles.hidden, containerStyle]}>
      <BannerAd
        unitId={adsConfig.adUnitIds.banner}
        size={size}
        requestOptions={{
          // Safe default: request non-personalized ads until consent is wired.
          // TODO: Replace with proper consent-based requestOptions once a CMP
          //       (Consent Management Platform) is integrated.
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => setAdLoaded(true)}
        onAdFailedToLoad={_error => {
          // Silently hide — do not throw or log in production builds.
          setAdFailed(true);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'transparent',
  },
  hidden: {
    // Keep in tree but zero-height while ad is loading to avoid layout jump.
    height: 0,
    overflow: 'hidden',
  },
});

export default AppBannerAd;

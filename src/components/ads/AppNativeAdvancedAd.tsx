/**
 * @file AppNativeAdvancedAd.tsx
 * @description Native Advanced ad styled like a property listing card.
 *
 * Variants:
 * - feed: full-width card for vertical lists (Search / Wishlist)
 * - topListing: horizontal Top Listings swipe card
 * - nearby: horizontal Nearby swipe card
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import {
  NativeAd,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeMediaView,
} from 'react-native-google-mobile-ads';

import { adsConfig } from '../../config/ads.config';
import { useShouldShowAds } from '../../hooks/useShouldShowAds';

export type NativeAdVariant = 'feed' | 'topListing' | 'nearby';

interface AppNativeAdvancedAdProps {
  containerStyle?: object;
  /** Card layout — match the surrounding listing UI. */
  variant?: NativeAdVariant;
}

const AppNativeAdvancedAd: React.FC<AppNativeAdvancedAdProps> = ({
  containerStyle,
  variant = 'feed',
}) => {
  const { shouldShowAds } = useShouldShowAds();
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!shouldShowAds) return;

    let cancelled = false;
    let loaded: NativeAd | null = null;

    NativeAd.createForAdRequest(adsConfig.adUnitIds.native, {
      requestNonPersonalizedAdsOnly: true,
    })
      .then(ad => {
        if (cancelled) {
          ad.destroy();
          return;
        }
        loaded = ad;
        setNativeAd(ad);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      loaded?.destroy();
      setNativeAd(null);
    };
  }, [shouldShowAds]);

  if (!shouldShowAds || failed || !nativeAd) return null;

  if (variant === 'topListing') {
    return (
      <NativeAdView nativeAd={nativeAd} style={[styles.topCard, containerStyle]}>
        <NativeMediaView style={styles.topThumb} resizeMode="cover" />
        <View style={styles.topInfo}>
          <View style={styles.topBadge}>
            <Text style={styles.topBadgeText}>Sponsored</Text>
          </View>
          <NativeAsset assetType={NativeAssetType.HEADLINE}>
            <Text style={styles.topTitle} numberOfLines={1}>
              {nativeAd.headline}
            </Text>
          </NativeAsset>
          {nativeAd.body ? (
            <NativeAsset assetType={NativeAssetType.BODY}>
              <Text style={styles.topLocality} numberOfLines={1}>
                {nativeAd.body}
              </Text>
            </NativeAsset>
          ) : nativeAd.advertiser ? (
            <NativeAsset assetType={NativeAssetType.ADVERTISER}>
              <Text style={styles.topLocality} numberOfLines={1}>
                {nativeAd.advertiser}
              </Text>
            </NativeAsset>
          ) : null}
          {nativeAd.callToAction ? (
            <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
              <Text style={styles.topCta} numberOfLines={1}>
                {nativeAd.callToAction}
              </Text>
            </NativeAsset>
          ) : null}
        </View>
      </NativeAdView>
    );
  }

  if (variant === 'nearby') {
    return (
      <NativeAdView nativeAd={nativeAd} style={[styles.nearbyCard, containerStyle]}>
        <NativeMediaView style={styles.nearbyMedia} resizeMode="cover" />
        <View style={styles.nearbyInfo}>
          <Text style={styles.nearbySponsored}>Sponsored</Text>
          <NativeAsset assetType={NativeAssetType.HEADLINE}>
            <Text style={styles.nearbyTitle} numberOfLines={2}>
              {nativeAd.headline}
            </Text>
          </NativeAsset>
          {nativeAd.callToAction ? (
            <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
              <Text style={styles.nearbyCta} numberOfLines={1}>
                {nativeAd.callToAction}
              </Text>
            </NativeAsset>
          ) : null}
        </View>
      </NativeAdView>
    );
  }

  return (
    <NativeAdView nativeAd={nativeAd} style={[styles.card, containerStyle]}>
      <View style={styles.sponsoredRow}>
        <Text style={styles.sponsoredLabel}>Sponsored</Text>
        {nativeAd.advertiser ? (
          <NativeAsset assetType={NativeAssetType.ADVERTISER}>
            <Text style={styles.advertiser} numberOfLines={1}>
              {nativeAd.advertiser}
            </Text>
          </NativeAsset>
        ) : null}
      </View>

      <NativeMediaView style={styles.media} resizeMode="cover" />

      <View style={styles.body}>
        <View style={styles.headlineRow}>
          {nativeAd.icon?.url ? (
            <NativeAsset assetType={NativeAssetType.ICON}>
              <Image source={{ uri: nativeAd.icon.url }} style={styles.icon} />
            </NativeAsset>
          ) : null}
          <View style={styles.headlineCol}>
            <NativeAsset assetType={NativeAssetType.HEADLINE}>
              <Text style={styles.headline} numberOfLines={2}>
                {nativeAd.headline}
              </Text>
            </NativeAsset>
            {nativeAd.body ? (
              <NativeAsset assetType={NativeAssetType.BODY}>
                <Text style={styles.bodyText} numberOfLines={2}>
                  {nativeAd.body}
                </Text>
              </NativeAsset>
            ) : null}
          </View>
        </View>

        {nativeAd.callToAction ? (
          <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
            <View style={styles.cta}>
              <Text style={styles.ctaText}>{nativeAd.callToAction}</Text>
            </View>
          </NativeAsset>
        ) : null}
      </View>
    </NativeAdView>
  );
};

const styles = StyleSheet.create({
  // ── feed (vertical lists) ──────────────────────────────────
  card: {
    backgroundColor: '#faf9fc',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginVertical: 6,
  },
  sponsoredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  sponsoredLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D1A14E',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  advertiser: {
    flex: 1,
    fontSize: 11,
    color: '#777779',
  },
  media: {
    width: '100%',
    height: 160,
    backgroundColor: '#E8ECF0',
  },
  body: {
    padding: 12,
    gap: 10,
  },
  headlineRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E8ECF0',
  },
  headlineCol: {
    flex: 1,
    gap: 4,
  },
  headline: {
    fontSize: 15,
    fontWeight: '700',
    color: '#122A47',
  },
  bodyText: {
    fontSize: 12,
    color: '#777779',
    lineHeight: 16,
  },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: '#122A47',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  ctaText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  // ── topListing (horizontal swipe) ─────────────────────────
  topCard: {
    width: 320,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3F6',
    borderRadius: 16,
    padding: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(196,198,206,0.15)',
  },
  topThumb: {
    width: 88,
    height: 88,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E8ECF0',
  },
  topInfo: {
    flex: 1,
    gap: 3,
  },
  topBadge: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginBottom: 2,
    backgroundColor: 'rgba(209,161,78,0.2)',
  },
  topBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: '#D1A14E',
  },
  topTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#122A47',
  },
  topLocality: {
    fontSize: 11,
    color: '#777779',
  },
  topCta: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D1A14E',
    marginTop: 2,
  },

  // ── nearby (horizontal swipe) ─────────────────────────────
  nearbyCard: {
    width: 220,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(196,198,206,0.2)',
  },
  nearbyMedia: {
    width: '100%',
    height: 130,
    backgroundColor: '#E8ECF0',
  },
  nearbyInfo: {
    padding: 12,
    gap: 4,
  },
  nearbySponsored: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D1A14E',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  nearbyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#122A47',
  },
  nearbyCta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D1A14E',
    marginTop: 2,
  },
});

export default AppNativeAdvancedAd;

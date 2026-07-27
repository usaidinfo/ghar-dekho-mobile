/**
 * @file ads.config.ts
 * @description Central AdMob configuration.
 *
 * HOW IT WORKS
 * ─────────────
 * 1. Read env values from react-native-config (.env).
 * 2. Select Android or iOS ad unit IDs based on Platform.OS.
 * 3. When ADS_TEST_MODE=true (or NODE_ENV=development), swap every
 *    ID for Google's official test IDs so no real impressions are billed.
 * 4. Expose a single `adsConfig` object consumed everywhere in the app.
 *
 * WHERE TO PUT REAL IDS
 * ──────────────────────
 * In .env, set:
 *   ADS_TEST_MODE=false
 *   ADMOB_ANDROID_BANNER_ID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
 *   … (and the other platform-specific IDs)
 *
 * Never hard-code production IDs inside source files.
 *
 * MEDIATION
 * ──────────
 * To add mediation (Meta, AppLovin, etc.) later, configure it in the
 * AdMob dashboard and set ad-unit IDs to mediated ones here. No code
 * changes needed beyond updating .env.
 */

import {Platform} from 'react-native';
import Config from 'react-native-config';
import {TestIds} from 'react-native-google-mobile-ads';

function isTruthy(val: string | undefined): boolean {
  return String(val ?? '').toLowerCase() === 'true';
}

const globalAdsEnabled = isTruthy(Config.ADS_ENABLED);

// Use test IDs when ADS_TEST_MODE=true.
// In production builds you must set ADS_TEST_MODE=false in .env.
const testMode = isTruthy(Config.ADS_TEST_MODE);

const appOpenAdsEnabled = isTruthy(Config.ENABLE_APP_OPEN_ADS);

// ── Raw production IDs from .env (platform-selected) ──────────
const raw = {
  banner:
    Platform.OS === 'android'
      ? Config.ADMOB_ANDROID_BANNER_ID
      : Config.ADMOB_IOS_BANNER_ID,
  rewardedInterstitial:
    Platform.OS === 'android'
      ? Config.ADMOB_ANDROID_REWARDED_INTERSTITIAL_ID ??
        Config.ADMOB_ANDROID_REWARDED_ID
      : Config.ADMOB_IOS_REWARDED_INTERSTITIAL_ID ?? Config.ADMOB_IOS_REWARDED_ID,
  native:
    Platform.OS === 'android'
      ? Config.ADMOB_ANDROID_NATIVE_ADVANCED_ID
      : Config.ADMOB_IOS_NATIVE_ADVANCED_ID,
  appOpen:
    Platform.OS === 'android'
      ? Config.ADMOB_ANDROID_APP_OPEN_ID
      : Config.ADMOB_IOS_APP_OPEN_ID,
};

// ── Final IDs (test overrides production when testMode=true) ──
const adUnitIds = {
  banner: testMode
    ? TestIds.ADAPTIVE_BANNER
    : raw.banner ?? TestIds.ADAPTIVE_BANNER,
  /** Full-screen rewarded interstitial (replaces classic interstitial placements). */
  rewardedInterstitial: testMode
    ? TestIds.REWARDED_INTERSTITIAL
    : raw.rewardedInterstitial ?? TestIds.REWARDED_INTERSTITIAL,
  /** Native Advanced — blends into listing feeds. */
  native: testMode ? TestIds.NATIVE : raw.native ?? TestIds.NATIVE,
  appOpen: testMode ? TestIds.APP_OPEN : raw.appOpen ?? TestIds.APP_OPEN,
};

export interface AdsConfig {
  /** Global kill-switch — false means no ads anywhere. */
  globalAdsEnabled: boolean;
  /** True when using Google's test ad unit IDs. */
  testMode: boolean;
  /** Whether app-open ads are enabled via ENABLE_APP_OPEN_ADS. */
  appOpenAdsEnabled: boolean;
  adUnitIds: {
    banner: string;
    rewardedInterstitial: string;
    native: string;
    appOpen: string;
  };
}

export const adsConfig: AdsConfig = {
  globalAdsEnabled,
  testMode,
  appOpenAdsEnabled,
  adUnitIds,
};

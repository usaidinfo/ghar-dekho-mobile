import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { MD3DarkTheme, MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';

import MainNavigator from './src/navigation/MainNavigator';
import { adsConfig } from './src/config/ads.config';
// App open ads are gated behind ENABLE_APP_OPEN_ADS=true in .env.
// Import the hook here but it self-disables when the flag is false.
import { useAppOpenAd } from './src/hooks/useAppOpenAd';

/**
 * Initialize Google Mobile Ads SDK once at app startup.
 *
 * NOTE ON CONSENT
 * ────────────────
 * requestNonPersonalizedAdsOnly is set as a safe default for GDPR regions
 * until a proper CMP (Consent Management Platform) is integrated.
 * TODO: Integrate a CMP (e.g. Google UMP) and pass the consent result here.
 *
 * NOTE ON TEST MODE
 * ──────────────────
 * All ad unit IDs are automatically swapped for Google test IDs when
 * ADS_TEST_MODE=true (see src/config/ads.config.ts).
 * Real IDs are only active when ADS_TEST_MODE=false in production builds.
 */
function initializeAds() {
  if (!adsConfig.globalAdsEnabled) return;

  mobileAds()
    .initialize()
    .then(() => {
      if (__DEV__) {
        console.log('[AdMob] SDK initialized. Test mode:', adsConfig.testMode);
      }
    })
    .catch(err => {
      if (__DEV__) console.warn('[AdMob] Init failed:', err);
    });
}

function AppOpenAdManager() {
  // Self-disables when ENABLE_APP_OPEN_ADS=false or user is a paid member.
  useAppOpenAd();
  return null;
}

export default function App() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const paperTheme = isDark ? MD3DarkTheme : MD3LightTheme;

  useEffect(() => {
    initializeAds();
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <BottomSheetModalProvider>
          <PaperProvider theme={paperTheme}>
            <NavigationContainer>
              <MainNavigator />
              {/* App open ad manager — renders nothing visible */}
              <AppOpenAdManager />
            </NavigationContainer>
          </PaperProvider>
        </BottomSheetModalProvider>
        <Toast />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

import React from 'react';
import { View, ScrollView, Linking, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import ProfileDecorativeBackground from '../../components/profile/ProfileDecorativeBackground';
import ProfileGuestHeader from '../../components/profile/ProfileGuestHeader';
import ProfileGuestCard from '../../components/profile/ProfileGuestCard';
import ProfileGuestHints from '../../components/profile/ProfileGuestHints';
import ProfileSignedInHeader from '../../components/profile/signed-in/ProfileSignedInHeader';
import ProfileIdentitySection from '../../components/profile/signed-in/ProfileIdentitySection';
import ProfileStatsSection from '../../components/profile/signed-in/ProfileStatsSection';
import ProfileAgentCard from '../../components/profile/signed-in/ProfileAgentCard';
import ProfileSettingsSection from '../../components/profile/signed-in/ProfileSettingsSection';
import ProfileLogoutSection from '../../components/profile/signed-in/ProfileLogoutSection';
import ProfileScreenSkeleton from '../../components/home/skeletons/ProfileScreenSkeleton';

import { useAuthStore } from '../../stores/auth.store';
import type { BottomTabParamList, MainStackParamList } from '../../navigation/types';
import type { ProfileType } from '../../types/auth.types';
import appPackage from '../../../package.json';
import { fetchWishlist } from '../../services/wishlist.service';
import { fetchMyListings } from '../../services/property.service';
import { useInstantInterstitialAd } from '../../hooks/useInstantInterstitialAd';

type ProfileNav = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Profile'>,
  NativeStackNavigationProp<MainStackParamList>
>;

const isAgentProfile = (t: ProfileType) => t === 'AGENT' || t === 'BROKER';

/** Same horizontal inset as `HomeScreen` / home sections (`paddingHorizontal: 24`). */
const HOME_EDGE = 24;

const profileScrollStyles = StyleSheet.create({
  /** Avoid `contentContainerClassName` + `contentContainerStyle` together (RN / NativeWind quirks). */
  content: { paddingHorizontal: HOME_EDGE, flexGrow: 1 },
  contentSignedIn: { paddingHorizontal: HOME_EDGE, paddingTop: 8, flexGrow: 1 },
});

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileNav>();
  const insets = useSafeAreaInsets();
  const user = useAuthStore(s => s.user);
  const accessToken = useAuthStore(s => s.accessToken);
  const hasHydrated = useAuthStore(s => s.hasHydrated);
  const logout = useAuthStore(s => s.logout);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [wishlistCount, setWishlistCount] = React.useState<number | null>(null);
  const [listingsCount, setListingsCount] = React.useState<number | null>(null);
  const { show: showModeSwitchAd } = useInstantInterstitialAd();

  const isSignedIn = Boolean(hasHydrated && accessToken && user);

  const displayName = user?.profile
    ? [user.profile.firstName, user.profile.lastName].filter(Boolean).join(' ').trim()
    : '';
  const subtitle = user?.email || user?.phone || '';

  const openLogin = () => navigation.navigate('Login' as never);
  const openSignup = () => navigation.navigate('Signup' as never);

  const onLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  const tabBarPad = Math.max(insets.bottom, 14) + 72;

  useFocusEffect(
    React.useCallback(() => {
      if (!hasHydrated || !isSignedIn) return () => undefined;
      let cancelled = false;

      // Show placeholder while loading (—)
      setWishlistCount(null);
      setListingsCount(null);

      (async () => {
        const [wRes, lRes] = await Promise.allSettled([
          fetchWishlist({ page: 1, limit: 1 }),
          fetchMyListings({ page: 1, limit: 1 }),
        ]);

        if (cancelled) return;

        if (wRes.status === 'fulfilled') {
          setWishlistCount(wRes.value?.meta?.total ?? 0);
        } else {
          setWishlistCount(0);
        }

        if (lRes.status === 'fulfilled') {
          setListingsCount(lRes.value?.meta?.total ?? 0);
        } else {
          setListingsCount(0);
        }
      })().catch(() => {
        if (cancelled) return;
        setWishlistCount(0);
        setListingsCount(0);
      });

      return () => {
        cancelled = true;
      };
    }, [hasHydrated, isSignedIn]),
  );

  if (!hasHydrated) {
    return <ProfileScreenSkeleton />;
  }

  if (!isSignedIn || !user) {
    return (
      <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
        <View className="flex-1">
          <ProfileDecorativeBackground />
          <ScrollView
            className="flex-1"
            contentContainerStyle={[profileScrollStyles.content, { paddingBottom: tabBarPad }]}
            showsVerticalScrollIndicator={false}
          >
            <ProfileGuestHeader />
            <View className="flex-1 items-center justify-center py-4">
              <View className="w-full max-w-md">
                <ProfileGuestCard onLogin={openLogin} onSignup={openSignup} />
                <ProfileGuestHints />
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  const versionLabel = `App version ${appPackage.version} (Heritage edition)`;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <ProfileSignedInHeader
        onNotificationsPress={() => navigation.navigate('Notifications')}
        onSettingsPress={() => navigation.navigate('EditProfile')}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={[profileScrollStyles.contentSignedIn, { paddingBottom: tabBarPad }]}
        showsVerticalScrollIndicator={false}
      >
        <ProfileIdentitySection
          displayName={displayName || 'Member'}
          subtitle={subtitle}
          profileImageUri={user.profile?.profileImage}
          profileType={user.profileType}
          isEmailVerified={user.isEmailVerified}
          isPhoneVerified={user.isPhoneVerified}
        />

        <ProfileStatsSection
          wishlistCount={wishlistCount}
          listingsCount={listingsCount}
          onViewWishlist={() => navigation.navigate('Wishlist')}
          onManageListings={() => navigation.navigate('MyListings')}
        />

        {isAgentProfile(user.profileType) ? (
          <ProfileAgentCard
            agencyName="Heritage Realty"
            rating="4.8"
            reviewCountLabel="(240 reviews)"
            onAgentDashboard={() => {
              // Entering Agent mode shows an interstitial every time —
              // uncapped by design, skipped automatically for premium members.
              showModeSwitchAd();
              navigation.navigate('AgentDashboard');
            }}
          />
        ) : null}

        <ProfileSettingsSection
          onEditProfile={() => navigation.navigate('EditProfile')}
          onMessages={() => navigation.navigate('ChatInbox')}
          onMyActivity={() => navigation.navigate('History')}
          onCalculators={() => navigation.navigate('Calculators')}
          onPriceAlerts={() => navigation.navigate('PriceAlerts')}
          onSellerAnalytics={() => navigation.navigate('SellerAnalytics')}
          onRentals={() => navigation.navigate('Rentals')}
          onNotifications={() => navigation.navigate('Notifications')}
          onHelp={() => {
            Linking.openURL('mailto:support@ghardekho.com?subject=Help%20%26%20Support').catch(() => undefined);
          }}
        />

        <ProfileLogoutSection appVersionLabel={versionLabel} loggingOut={loggingOut} onLogout={onLogout} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

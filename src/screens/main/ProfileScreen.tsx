import React from 'react';
import { View, ScrollView, Linking, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
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

import { useAuthStore } from '../../stores/auth.store';
import type { BottomTabParamList, MainStackParamList } from '../../navigation/types';
import type { ProfileType } from '../../types/auth.types';
import appPackage from '../../../package.json';

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
  const logout = useAuthStore(s => s.logout);
  const [loggingOut, setLoggingOut] = React.useState(false);

  const isSignedIn = Boolean(accessToken && user);

  const displayName = user?.profile
    ? [user.profile.firstName, user.profile.lastName].filter(Boolean).join(' ').trim()
    : '';
  const subtitle = user?.email || user?.phone || '';

  const openLogin = () => navigation.navigate('Login');
  const openSignup = () => navigation.navigate('Signup');

  const onLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  const tabBarPad = Math.max(insets.bottom, 14) + 72;

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
          wishlistCount={0}
          listingsCount={0}
          onViewWishlist={() => navigation.navigate('Wishlist')}
          onManageListings={() => navigation.navigate('MyListings')}
        />

        {isAgentProfile(user.profileType) ? (
          <ProfileAgentCard
            agencyName="Heritage Realty"
            rating="4.8"
            reviewCountLabel="(240 reviews)"
            onAgentDashboard={() => navigation.navigate('PostProperty')}
          />
        ) : null}

        <ProfileSettingsSection
          onEditProfile={() => navigation.navigate('EditProfile')}
          onMessages={() => navigation.navigate('ChatInbox')}
          onMyActivity={() => navigation.navigate('History')}
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

import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from '../../components/ui/Button';
import ProfileDecorativeBackground from '../../components/profile/ProfileDecorativeBackground';
import ProfileGuestHeader from '../../components/profile/ProfileGuestHeader';
import ProfileGuestCard from '../../components/profile/ProfileGuestCard';
import ProfileGuestHints from '../../components/profile/ProfileGuestHints';
import { useAuthStore } from '../../stores/auth.store';
import type { BottomTabParamList, MainStackParamList } from '../../navigation/types';

type ProfileNav = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Profile'>,
  NativeStackNavigationProp<MainStackParamList>
>;

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

  if (!isSignedIn) {
    return (
      <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
        <View className="flex-1">
          <ProfileDecorativeBackground />
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: tabBarPad,
            }}
            showsVerticalScrollIndicator={false}
          >
            <ProfileGuestHeader />
            <View className="flex-1 items-center justify-center px-6 py-4">
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

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarPad, paddingHorizontal: 24, paddingTop: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-1 text-[28px] font-extrabold tracking-tight text-dark">Profile</Text>
        <Text className="mb-10 text-base text-neutral">Manage your account</Text>

        <View className="mb-8 rounded-3xl border border-outline bg-white p-6 shadow-sm">
          <View className="flex-row items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Icon name="account" size={36} color="#122A47" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-dark">{displayName || 'Member'}</Text>
              {subtitle ? <Text className="mt-1 text-sm text-neutral">{subtitle}</Text> : null}
              <Text className="mt-2 text-xs uppercase tracking-wider text-neutral">
                {user?.profileType?.replace('_', ' ') ?? ''}
              </Text>
            </View>
          </View>
        </View>

        <View className="gap-3">
          {loggingOut ? (
            <ActivityIndicator size="small" color="#122A47" />
          ) : (
            <Button title="Log out" variant="outline" onPress={onLogout} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

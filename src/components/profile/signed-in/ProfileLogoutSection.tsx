import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { signedInTextStyles } from './signedInTextStyles';

export interface ProfileLogoutSectionProps {
  appVersionLabel: string;
  loggingOut: boolean;
  onLogout: () => void;
}

const ProfileLogoutSection: React.FC<ProfileLogoutSectionProps> = ({
  appVersionLabel,
  loggingOut,
  onLogout,
}) => (
  <View className="mt-5 pb-4">
    <TouchableOpacity
      onPress={onLogout}
      disabled={loggingOut}
      className="flex-row items-center justify-center gap-2 rounded-3xl border border-error/25 py-4 active:bg-error/5"
      accessibilityRole="button"
      accessibilityLabel="Log out"
    >
      {loggingOut ? (
        <ActivityIndicator color="#ba1a1a" />
      ) : (
        <>
          <Icon name="logout" size={22} color="#ba1a1a" />
          <Text className="text-sm font-extrabold uppercase text-error" style={signedInTextStyles.logoutCaps}>
            Logout account
          </Text>
        </>
      )}
    </TouchableOpacity>
    <Text className="mt-6 text-center text-[11px] font-medium uppercase text-variant-fg/50" style={signedInTextStyles.versionCaps}>
      {appVersionLabel}
    </Text>
  </View>
);

export default ProfileLogoutSection;

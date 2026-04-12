import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { signedInTextStyles } from './signedInTextStyles';

export interface ProfileSettingsSectionProps {
  onEditProfile: () => void;
  onMyActivity: () => void;
  onNotifications: () => void;
  onHelp: () => void;
  showNotificationDot?: boolean;
}

interface RowProps {
  icon: string;
  label: string;
  onPress: () => void;
  showDot?: boolean;
}

const SettingsRow: React.FC<RowProps> = ({ icon, label, onPress, showDot }) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center justify-between rounded-3xl p-4 active:bg-surface-low"
    accessibilityRole="button"
  >
    <View className="flex-row items-center gap-4">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-input-alt">
        <Icon name={icon} size={20} color="#00152e" />
      </View>
      <Text className="font-bold text-primary-deep">{label}</Text>
    </View>
    <View className="flex-row items-center gap-2">
      {showDot ? <View className="h-2 w-2 rounded-full bg-secondary" /> : null}
      <Icon name="chevron-right" size={22} color="#c4c6ce" />
    </View>
  </TouchableOpacity>
);

const ProfileSettingsSection: React.FC<ProfileSettingsSectionProps> = ({
  onEditProfile,
  onMyActivity,
  onNotifications,
  onHelp,
  showNotificationDot = true,
}) => (
  <View className="mt-5">
    <Text className="mb-3 text-xs font-extrabold uppercase text-variant-fg" style={signedInTextStyles.sectionLabel}>
      Account settings
    </Text>
    <View>
      <SettingsRow icon="account-edit-outline" label="Edit profile" onPress={onEditProfile} />
      <SettingsRow icon="history" label="My activity" onPress={onMyActivity} />
      <SettingsRow
        icon="bell-ring-outline"
        label="Notifications"
        onPress={onNotifications}
        showDot={showNotificationDot}
      />
      <SettingsRow icon="lifebuoy" label="Help & support" onPress={onHelp} />
    </View>
  </View>
);

export default ProfileSettingsSection;

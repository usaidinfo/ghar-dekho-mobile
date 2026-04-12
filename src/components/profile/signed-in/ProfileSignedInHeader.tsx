import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { signedInTextStyles } from './signedInTextStyles';

/** Match `HomeScreen` header `paddingHorizontal: 24`. */
const HOME_EDGE = 24;

const styles = StyleSheet.create({
  bar: { paddingHorizontal: HOME_EDGE, paddingVertical: 12 },
});

export interface ProfileSignedInHeaderProps {
  onNotificationsPress: () => void;
  onSettingsPress: () => void;
}

const ProfileSignedInHeader: React.FC<ProfileSignedInHeaderProps> = ({
  onNotificationsPress,
  onSettingsPress,
}) => (
  <View className="z-40 w-full bg-surface" style={styles.bar}>
    <View className="w-full flex-row items-center justify-between">
      <View className="flex-row items-center gap-3">
        <Icon name="account-circle" size={28} color="#00152e" />
        <Text className="text-2xl font-bold text-primary-deep" style={signedInTextStyles.headerTitle}>
          Profile
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={onNotificationsPress}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-low"
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Icon name="bell-outline" size={22} color="#44474d" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSettingsPress}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-low"
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Icon name="cog-outline" size={22} color="#44474d" />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default ProfileSignedInHeader;

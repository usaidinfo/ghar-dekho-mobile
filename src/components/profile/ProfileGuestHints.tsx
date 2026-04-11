import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ProfileGuestHints: React.FC = () => (
  <View className="pt-4 max-w-md flex-row gap-2">
    <View className="flex-1 flex-row items-center gap-3 rounded-lg bg-surface-panel p-2">
      <Icon name="heart-outline" size={22} color="#D1A14E" />
      <Text className="flex-1 text-sm font-semibold text-variant-fg">Sync Wishlist</Text>
    </View>
    <View className="flex-1 flex-row items-center gap-3 rounded-lg bg-surface-panel p-2">
      <Icon name="message-text-outline" size={22} color="#0d9488" />
      <Text className="flex-1 text-sm font-semibold text-variant-fg">Live Chat</Text>
    </View>
  </View>
);

export default ProfileGuestHints;

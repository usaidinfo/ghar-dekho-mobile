import React from 'react';
import { View } from 'react-native';

/** Soft blobs behind profile content — uses `tailwind.config.js` colors */
const ProfileDecorativeBackground: React.FC = () => (
  <View className="absolute inset-0 overflow-hidden pointer-events-none" pointerEvents="none">
    <View className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-soft/20" />
    <View className="absolute -left-48 h-80 w-80 rounded-full bg-accent-soft/30 top-[42%]" />
  </View>
);

export default ProfileDecorativeBackground;

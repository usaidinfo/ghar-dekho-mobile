import React from 'react';
import { View, Text, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ProfileGuestHeader: React.FC = () => (
  <View className="flex-row items-center justify-between bg-surface py-4">
    <View className="flex-row items-center gap-3">
      <Icon name="account-circle" size={28} color="#00152e" />
      <Text className="font-bold text-2xl tracking-tight text-primary-deep">Profile</Text>
    </View>
    <View className="h-10 w-10 overflow-hidden rounded-full bg-surface-input-alt">
      <Image source={require('../../assets/logo/logo.png')} className="h-full w-full" resizeMode="cover" />
    </View>
  </View>
);

export default ProfileGuestHeader;

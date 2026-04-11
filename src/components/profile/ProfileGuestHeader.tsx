import React from 'react';
import { View, Text, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/** Remote logo — swap for local asset when ready */
const LOGO_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDJAkqZwPunsIaF9K6wzJ_GGpJh73UBV5uDjykKg4yP8kp2VBr2hKInh4CZtxej7_mMvZc4dgTckF81HCx4DS8_eNCvldqyx7QhnNcAXfG3NoPQjIf_ohhZLtGtiU_Y_AfwpN_66Fwmmm0jqJbn6LeFyrn9Ur4T4Vpk_b5QLST9Kv9OGwSP1JQ-3kKYwixwAH1_j14Ka4GZTWJSe9HhumnNC9h4VlcgXt5VspFgutgj9VIG9jsvMhJkj5azdPXpEhAVjDE_vjQadJfm';

const ProfileGuestHeader: React.FC = () => (
  <View className="flex-row items-center justify-between px-6 py-4 bg-surface">
    <View className="flex-row items-center gap-3">
      <Icon name="account-circle" size={28} color="#00152e" />
      <Text className="font-bold text-2xl tracking-tight text-primary-deep">Profile</Text>
    </View>
    <View className="w-10 h-10 rounded-full overflow-hidden bg-surface-input-alt">
      <Image source={require('../../assets/logo/logo.png')} className="w-full h-full" resizeMode="cover" />
 
    </View>
  </View>
);

export default ProfileGuestHeader;

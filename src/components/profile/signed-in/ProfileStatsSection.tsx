import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export interface ProfileStatsSectionProps {
  wishlistCount: number;
  listingsCount: number;
  onViewWishlist: () => void;
  onManageListings: () => void;
}

const ProfileStatsSection: React.FC<ProfileStatsSectionProps> = ({
  wishlistCount,
  listingsCount,
  onViewWishlist,
  onManageListings,
}) => (
  <View className="mt-5 flex-row gap-4">
    <View className="relative min-h-[140px] flex-1 overflow-hidden rounded-3xl bg-primary p-6">
      <View className="absolute -bottom-4 -right-4">
        <Icon name="heart" size={120} color="rgba(255,255,255,0.08)" />
      </View>
      <View>
        <Text className="text-4xl font-bold text-white">{wishlistCount}</Text>
        <Text className="mt-1 text-sm font-semibold text-white/80">Wishlist</Text>
      </View>
      <TouchableOpacity
        onPress={onViewWishlist}
        className="mt-4 self-start rounded-full bg-white/15 px-4 py-2 active:bg-white/25"
      >
        <Text className="text-xs font-bold text-white">View all</Text>
      </TouchableOpacity>
    </View>

    <View className="relative min-h-[140px] flex-1 overflow-hidden rounded-3xl bg-surface-low p-6">
      <View className="absolute -bottom-4 -right-4">
        <Icon name="domain" size={120} color="rgba(0,21,46,0.06)" />
      </View>
      <View>
        <Text className="text-4xl font-bold text-primary-deep">{listingsCount}</Text>
        <Text className="mt-1 text-sm font-semibold text-variant-fg">My listings</Text>
      </View>
      <TouchableOpacity
        onPress={onManageListings}
        className="mt-4 self-start rounded-full border border-primary/20 px-4 py-2"
      >
        <Text className="text-xs font-bold text-primary-deep">Manage</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default ProfileStatsSection;

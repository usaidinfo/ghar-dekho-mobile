import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { signedInTextStyles } from './signedInTextStyles';

/** Placeholder agency art — replace when agent branding API is available */
const AGENCY_LOGO_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCwoB7CCwIOq8dzP-ZFffhaEa8tWiwGnt4VNuI1QWceXX3cUUEunA8lb1RSxn1GTKIrgkXIoJ5IpxGXRoSkbZwyL8EBH82vNhZ2ymyWzjbPgs0ZaRDfvx2zJskZEJWrpYgVBNtcwf94bDcTg5J6VAVMI0fWr1w-Er5-83ZEcLL8t2upHgq2iWfIBMl3-nHsuSQTQkVIGTmVOTsQnzjTH_KCzBcriR01G_M45EkP-yNyC9xjVHJPKMS83dZ9zCz6wSsRCu3f6KK14avm';

export interface ProfileAgentCardProps {
  agencyName: string;
  rating: string;
  reviewCountLabel: string;
  onAgentDashboard: () => void;
}

const ProfileAgentCard: React.FC<ProfileAgentCardProps> = ({
  agencyName,
  rating,
  reviewCountLabel,
  onAgentDashboard,
}) => (
  <View className="mt-5 rounded-3xl border border-outline/30 bg-white p-1 shadow-sm">
    <View className="rounded-2xl bg-white p-6">
      <View className="flex-col gap-4">
        <View className="flex-row items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-xl bg-surface-panel p-2">
            <Image
              source={{ uri: AGENCY_LOGO_URI }}
              className="h-full w-full"
              resizeMode="contain"
            />
          </View>
          <View className="flex-1">
            <View className="flex-row flex-wrap items-center gap-2">
              <Text className="text-lg font-bold text-primary-deep">{agencyName}</Text>
              <View className="rounded-full bg-gold-container px-2 py-0.5">
                <Text className="text-[10px] font-extrabold uppercase text-primary-deep">Premium</Text>
              </View>
            </View>
            <View className="mt-1 flex-row items-center gap-1">
              <Icon name="star" size={16} color="#7d5705" />
              <Text className="text-sm font-bold text-dark">{rating}</Text>
              <Text className="ml-1 text-sm font-medium text-variant-fg">{reviewCountLabel}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={onAgentDashboard}
          className="w-full items-center justify-center rounded-full bg-primary py-3.5 shadow-lg shadow-black/20 active:opacity-90"
        >
          <Text className="text-sm font-bold text-white" style={signedInTextStyles.ctaWide}>
            Agent dashboard
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default ProfileAgentCard;

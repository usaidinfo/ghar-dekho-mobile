import React from 'react';
import { View, Text, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { ProfileType } from '../../../types/auth.types';
import { signedInTextStyles } from './signedInTextStyles';

export interface ProfileIdentitySectionProps {
  displayName: string;
  subtitle: string;
  profileImageUri?: string | null;
  profileType: ProfileType;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

const isAgentLike = (t: ProfileType) => t === 'AGENT' || t === 'BROKER';

const ProfileIdentitySection: React.FC<ProfileIdentitySectionProps> = ({
  displayName,
  subtitle,
  profileImageUri,
  profileType,
  isEmailVerified,
  isPhoneVerified,
}) => (
  <View className="items-center">
    <View className="relative">
      <View className="h-32 w-32 overflow-hidden rounded-full border-4 border-surface-panel bg-surface-input-alt">
        {profileImageUri ? (
          <Image source={{ uri: profileImageUri }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Icon name="account" size={56} color="#122A47" />
          </View>
        )}
      </View>
      {isAgentLike(profileType) ? (
        <View className="absolute bottom-1 right-1 rounded-full bg-[#7d5705] px-2.5 py-1 shadow-md">
          <Text className="text-[10px] font-bold uppercase text-white" style={signedInTextStyles.agentBadge}>
            Agent
          </Text>
        </View>
      ) : null}
    </View>

    <View className="mt-5 items-center">
      <Text className="text-center text-3xl font-extrabold text-primary-deep" style={signedInTextStyles.displayName}>
        {displayName}
      </Text>
      {subtitle ? (
        <Text className="mt-2 text-center text-base font-medium text-variant-fg">{subtitle}</Text>
      ) : null}

      <View
        className={`flex-row flex-wrap items-center justify-center gap-3 ${subtitle ? 'mt-5' : 'mt-4'}`}
      >
        <View className="flex-row items-center gap-1.5 rounded-full border border-outline/40 bg-surface-low px-3 py-1.5">
          <Icon
            name={isEmailVerified ? 'check-decagram' : 'alert-circle-outline'}
            size={18}
            color={isEmailVerified ? '#0d9488' : '#777779'}
          />
          <Text className="text-xs font-semibold uppercase text-variant-fg" style={signedInTextStyles.chip}>
            {isEmailVerified ? 'Email verified' : 'Email pending'}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5 rounded-full border border-outline/40 bg-surface-low px-3 py-1.5">
          <Icon
            name={isPhoneVerified ? 'check-decagram' : 'shield-outline'}
            size={18}
            color={isPhoneVerified ? '#0d9488' : '#777779'}
          />
          <Text className="text-xs font-semibold uppercase text-variant-fg" style={signedInTextStyles.chip}>
            {isPhoneVerified ? 'Phone verified' : 'KYC pending'}
          </Text>
        </View>
      </View>
    </View>
  </View>
);

export default ProfileIdentitySection;

import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ProfileGuestCardProps {
  onLogin: () => void;
  onSignup: () => void;
  loginLoading?: boolean;
}

/** Matches `primary-deep` + `primary` in tailwind.config.js — LinearGradient needs raw colors */
const GRADIENT_COLORS = ['#00152e', '#122A47'] as const;

const ProfileGuestCard: React.FC<ProfileGuestCardProps> = ({
  onLogin,
  onSignup,
  loginLoading,
}) => (
  <View className="rounded-2xl border border-outline/10 bg-surface-low p-8 shadow-sm items-center">
    <View className="items-center mb-8">
      <View className="relative items-center justify-center">
        <View
          className="absolute h-28 w-28 rounded-full bg-gold-container/20"
          style={{ transform: [{ scale: 1.25 }] }}
        />
        <View className="h-24 w-24 items-center justify-center rounded-full bg-surface-input">
          <Icon name="account-circle-outline" size={56} color="#00152e" />
        </View>
      </View>
    </View>

    <View className="mb-8 space-y-4 px-1">
      <Text className="text-center text-3xl font-extrabold leading-tight tracking-tight text-primary-deep">
        Unlock the full experience
      </Text>
      <Text className="px-2 text-center text-base leading-6 text-variant-fg">
        Sign in to save your favorite properties, chat with owners, and schedule visits on the go.
      </Text>
    </View>

    <View className="w-full gap-4">
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onLogin}
        disabled={loginLoading}
        style={styles.ctaShadow}
      >
        <LinearGradient
          colors={[...GRADIENT_COLORS]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="items-center justify-center rounded-full py-4"
        >
          {loginLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-lg font-bold text-white">Log In</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onSignup}
        className="w-full items-center justify-center rounded-full border-2 border-outline/30 py-4"
      >
        <Text className="text-lg font-bold text-primary-deep">Create Account</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  ctaShadow: {
    width: '100%',
    borderRadius: 9999,
    shadowColor: '#122A47',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});

export default ProfileGuestCard;

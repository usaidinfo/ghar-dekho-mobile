import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ProfileDecorativeBackground from '../../profile/ProfileDecorativeBackground';
import { SkeletonBlock, SkeletonRow, useSkeletonPulse } from './SkeletonPrimitives';

const HOME_EDGE = 24;

const ProfileScreenSkeleton: React.FC = () => {
  const insets = useSafeAreaInsets();
  const pulse = useSkeletonPulse();
  const tabBarPad = Math.max(insets.bottom, 14) + 72;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.wrap}>
        <ProfileDecorativeBackground />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.content, { paddingBottom: tabBarPad }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <SkeletonRow gap={12} style={{ marginTop: 10 }}>
            <SkeletonBlock opacity={pulse} height={54} width={54} radius={999} />
            <View style={{ flex: 1, gap: 8 }}>
              <SkeletonBlock opacity={pulse} height={14} width="56%" radius={8} />
              <SkeletonBlock opacity={pulse} height={12} width="42%" radius={8} />
            </View>
          </SkeletonRow>

          {/* Stats */}
          <View style={{ marginTop: 18, gap: 12 }}>
            <SkeletonBlock opacity={pulse} height={96} radius={18} />
            <SkeletonBlock opacity={pulse} height={96} radius={18} />
          </View>

          {/* Settings list */}
          <View style={{ marginTop: 18, gap: 12 }}>
            <SkeletonBlock opacity={pulse} height={60} radius={16} />
            <SkeletonBlock opacity={pulse} height={60} radius={16} />
            <SkeletonBlock opacity={pulse} height={60} radius={16} />
            <SkeletonBlock opacity={pulse} height={60} radius={16} />
          </View>

          {/* Logout row placeholder */}
          <View style={{ marginTop: 18 }}>
            <SkeletonBlock opacity={pulse} height={56} radius={16} />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#faf9fc' },
  wrap: { flex: 1 },
  content: { paddingHorizontal: HOME_EDGE, flexGrow: 1, paddingTop: 18 },
});

export default ProfileScreenSkeleton;


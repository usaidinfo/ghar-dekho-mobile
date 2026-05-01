import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkeletonBlock, SkeletonRow, useSkeletonPulse } from './SkeletonPrimitives';

/**
 * Home skeleton meant to replace the centered spinner.
 * Keep it lightweight and close to the actual layout spacing.
 */
const HomeScreenSkeleton: React.FC = () => {
  const insets = useSafeAreaInsets();
  const pulse = useSkeletonPulse();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
    >
      {/* Category chips */}
      <SkeletonRow gap={10} style={{ paddingHorizontal: 24 }}>
        <SkeletonBlock opacity={pulse} height={34} width={86} radius={999} />
        <SkeletonBlock opacity={pulse} height={34} width={78} radius={999} />
        <SkeletonBlock opacity={pulse} height={34} width={92} radius={999} />
        <SkeletonBlock opacity={pulse} height={34} width={84} radius={999} />
      </SkeletonRow>

      {/* Feature poster */}
      <View style={{ paddingHorizontal: 24, marginTop: 18 }}>
        <SkeletonBlock opacity={pulse} height={168} radius={22} />
      </View>

      {/* Recommended carousel header */}
      <View style={{ paddingHorizontal: 24, marginTop: 22 }}>
        <SkeletonRow gap={12}>
          <SkeletonBlock opacity={pulse} height={16} width="52%" radius={8} />
          <View style={{ flex: 1 }} />
          <SkeletonBlock opacity={pulse} height={14} width={56} radius={8} />
        </SkeletonRow>
      </View>

      {/* Recommended cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
        <SkeletonBlock opacity={pulse} height={210} width={220} radius={18} />
        <SkeletonBlock opacity={pulse} height={210} width={220} radius={18} />
        <SkeletonBlock opacity={pulse} height={210} width={220} radius={18} />
      </ScrollView>

      {/* Nearby section */}
      <View style={{ paddingHorizontal: 24, marginTop: 26 }}>
        <SkeletonRow gap={12}>
          <SkeletonBlock opacity={pulse} height={16} width="42%" radius={8} />
          <View style={{ flex: 1 }} />
          <SkeletonBlock opacity={pulse} height={14} width={56} radius={8} />
        </SkeletonRow>
      </View>
      <View style={{ paddingHorizontal: 24, marginTop: 14, gap: 12 }}>
        <SkeletonBlock opacity={pulse} height={86} radius={18} />
        <SkeletonBlock opacity={pulse} height={86} radius={18} />
      </View>

      {/* Top listings section */}
      <View style={{ paddingHorizontal: 24, marginTop: 26 }}>
        <SkeletonBlock opacity={pulse} height={16} width="48%" radius={8} />
      </View>
      <View style={{ paddingHorizontal: 24, marginTop: 14, gap: 12 }}>
        <SkeletonBlock opacity={pulse} height={76} radius={18} />
        <SkeletonBlock opacity={pulse} height={76} radius={18} />
        <SkeletonBlock opacity={pulse} height={76} radius={18} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
    gap: 10,
  },
  hList: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 14,
  },
});

export default HomeScreenSkeleton;


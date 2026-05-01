import React from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkeletonBlock, SkeletonRow, useSkeletonPulse } from './SkeletonPrimitives';

const SURFACE = '#FDFDFD';

const PropertyDetailSkeleton: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const pulse = useSkeletonPulse();

  const horizontalPad = width < 360 ? 16 : width < 400 ? 20 : 24;
  const footerPad = Math.max(insets.bottom, 12) + (width < 360 ? 108 : 118);

  const heroH = Math.min(Math.max(Math.round(height * 0.52), 300), width >= 430 ? 520 : 500);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: footerPad }}
      >
        {/* Hero */}
        <SkeletonBlock opacity={pulse} height={heroH} radius={0} style={{ width: '100%' }} />

        <View style={{ paddingHorizontal: horizontalPad, marginTop: -48, gap: 14 }}>
          {/* Core info card */}
          <SkeletonBlock opacity={pulse} height={168} radius={18} />

          {/* AI insights */}
          <SkeletonBlock opacity={pulse} height={140} radius={18} />

          {/* Amenities chips */}
          <View style={{ gap: 10 }}>
            <SkeletonBlock opacity={pulse} height={16} width="40%" radius={8} />
            <SkeletonRow gap={10}>
              <SkeletonBlock opacity={pulse} height={32} width={88} radius={999} />
              <SkeletonBlock opacity={pulse} height={32} width={104} radius={999} />
              <SkeletonBlock opacity={pulse} height={32} width={92} radius={999} />
            </SkeletonRow>
          </View>

          {/* Location/legal */}
          <SkeletonBlock opacity={pulse} height={170} radius={18} />
        </View>
      </ScrollView>

      {/* Sticky actions placeholder */}
      <View style={[styles.sticky, { paddingBottom: Math.max(insets.bottom, 10) + 14 }]}>
        <SkeletonRow gap={14}>
          <SkeletonBlock opacity={pulse} height={56} radius={16} style={{ flex: 1 }} />
          <SkeletonBlock opacity={pulse} height={56} radius={16} style={{ flex: 1.55 }} />
        </SkeletonRow>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SURFACE },
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(226, 232, 240, 0.85)',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
  },
});

export default PropertyDetailSkeleton;


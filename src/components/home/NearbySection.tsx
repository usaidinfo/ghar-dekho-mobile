/**
 * @file NearbySection.tsx
 * @description "Near Your Property" section with horizontal NearbyCard list.
 * Native Advanced ads are interleaved in the swipe list for free users.
 */

import React, { useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import NearbyCard from './NearbyCard';
import SectionHeader from './SectionHeader';
import AppNativeAdvancedAd from '../ads/AppNativeAdvancedAd';
import { withNativeAds } from '../../utils/withNativeAds';
import type { NearbyProperty } from '../../types/property.types';

interface NearbySectionProps {
  data: NearbyProperty[];
  locationName?: string | null;
  onCardPress?: (property: NearbyProperty) => void;
  onViewAll?: () => void;
}

const NearbySection: React.FC<NearbySectionProps> = ({ data, locationName, onCardPress, onViewAll }) => {
  const displayName = locationName
    ? locationName.split(',')[0]?.trim()
    : null;
  const rows = useMemo(() => withNativeAds(data, 3), [data]);

  return (
    <View style={styles.wrapper}>
      <SectionHeader
        title={displayName ? `Near ${displayName}` : 'Near Your Property'}
        subtitle={displayName ? `Properties around ${displayName}` : 'Listings in your preferred vicinity'}
        onViewAll={onViewAll}
      />
      <FlatList
        data={rows}
        keyExtractor={row => row.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 14 }}
        renderItem={({ item: row }) =>
          row.kind === 'ad' ? (
            <AppNativeAdvancedAd variant="nearby" />
          ) : (
            <NearbyCard property={row.item} onPress={() => onCardPress?.(row.item)} />
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#F5F3F6',
    paddingVertical: 24,
    marginBottom: 32,
  },
});

export default NearbySection;

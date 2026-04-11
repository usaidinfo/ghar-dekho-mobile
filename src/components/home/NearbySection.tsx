/**
 * @file NearbySection.tsx
 * @description "Near Your Property" section with horizontal NearbyCard list.
 */

import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import NearbyCard from './NearbyCard';
import SectionHeader from './SectionHeader';
import type { NearbyProperty } from '../../types/property.types';

interface NearbySectionProps {
  data: NearbyProperty[];
  onCardPress?: (property: NearbyProperty) => void;
  onViewAll?: () => void;
}

const NearbySection: React.FC<NearbySectionProps> = ({ data, onCardPress, onViewAll }) => {
  return (
    <View style={styles.wrapper}>
      <SectionHeader
        title="Near Your Property"
        subtitle="Listings in your preferred vicinity"
        onViewAll={onViewAll}
      />
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 14 }}
        renderItem={({ item }) => (
          <NearbyCard property={item} onPress={() => onCardPress?.(item)} />
        )}
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

/**
 * @file RecentlyViewedList.tsx
 * @description Section for "Recently Viewed" properties on the Home screen.
 * API Integration: Data from GET /api/users/me/recently-viewed.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import SectionHeader from './SectionHeader';
import RecentlyViewedItem from './RecentlyViewedItem';
import type { RecentlyViewedProperty } from '../../types/property.types';

interface RecentlyViewedListProps {
  data: RecentlyViewedProperty[];
  onItemPress?: (property: RecentlyViewedProperty) => void;
  onViewAll?: () => void;
}

const RecentlyViewedList: React.FC<RecentlyViewedListProps> = ({
  data,
  onItemPress,
  onViewAll,
}) => {
  return (
    <View style={styles.container}>
      <SectionHeader title="Recently Viewed" onViewAll={onViewAll} />
      <View style={styles.list}>
        {data.map((item, index) => (
          <View
            key={item.id}
            style={index < data.length - 1 ? styles.itemWithGap : undefined}
          >
            <RecentlyViewedItem
              property={item}
              onPress={() => onItemPress?.(item)}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
  },
  list: {
    paddingHorizontal: 24,
  },
  // gap-4 equivalent: 16px gap between items
  itemWithGap: {
    marginBottom: 16,
  },
});

export default RecentlyViewedList;

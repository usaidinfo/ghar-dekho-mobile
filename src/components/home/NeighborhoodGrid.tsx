/**
 * @file NeighborhoodGrid.tsx
 * @description 2-column grid of trending neighborhood cards.
 * API Integration: Pass data from GET /api/neighborhoods/trending.
 */

import React from 'react';
import { View } from 'react-native';
import NeighborhoodCard from './NeighborhoodCard';
import SectionHeader from './SectionHeader';
import type { Neighborhood } from '../../types/property.types';

interface NeighborhoodGridProps {
  data: Neighborhood[];
  onNeighborhoodPress?: (neighborhood: Neighborhood) => void;
  onViewAll?: () => void;
}

const NeighborhoodGrid: React.FC<NeighborhoodGridProps> = ({
  data,
  onNeighborhoodPress,
  onViewAll,
}) => {
  return (
    <View className="mb-10">
      <SectionHeader title="Trending Neighborhoods" onViewAll={onViewAll} />
      <View className="px-6 flex-row gap-4">
        {data.map(item => (
          <View key={item.id} style={{ flex: 1 }}>
            <NeighborhoodCard
              neighborhood={item}
              onPress={() => onNeighborhoodPress?.(item)}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

export default NeighborhoodGrid;

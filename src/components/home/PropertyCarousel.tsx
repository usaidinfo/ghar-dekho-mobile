/**
 * @file PropertyCarousel.tsx
 * @description Horizontal FlatList of PropertyCard items for the home screen.
 * API Integration: Pass the fetched `data` array from GET /api/properties/curated.
 */

import React from 'react';
import { FlatList, View } from 'react-native';
import PropertyCard from './PropertyCard';
import SectionHeader from './SectionHeader';
import type { Property } from '../../types/property.types';

interface PropertyCarouselProps {
  data: Property[];
  onViewAll?: () => void;
  onPropertyPress?: (property: Property) => void;
}

const PropertyCarousel: React.FC<PropertyCarouselProps> = ({
  data,
  onViewAll,
  onPropertyPress,
}) => {
  return (
    <View className="mb-10">
      <SectionHeader title="Curated for You" onViewAll={onViewAll} />
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 20 }}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => onPropertyPress?.(item)}
          />
        )}
      />
    </View>
  );
};

export default PropertyCarousel;

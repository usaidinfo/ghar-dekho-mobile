/**
 * @file RecentlyViewedItem.tsx
 * @description Single row for a recently viewed property.
 * Design: horizontal card with rounded pill form, circular thumbnail,
 * title/subtitle/price, and a chevron.
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { RecentlyViewedProperty } from '../../types/property.types';

interface RecentlyViewedItemProps {
  property: RecentlyViewedProperty;
  onPress?: () => void;
}

const RecentlyViewedItem: React.FC<RecentlyViewedItemProps> = ({ property, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Circular Thumbnail */}
      <Image
        source={{ uri: property.thumbnailUrl }}
        style={styles.thumbnail}
        resizeMode="cover"
      />

      {/* Details */}
      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>
        <Text style={styles.location} numberOfLines={1}>
          {property.locality}, {property.city}
        </Text>
        <Text style={styles.price}>{property.priceLabel}</Text>
      </View>

      <Icon name="chevron-right" size={22} color="rgba(18,42,71,0.35)" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9e7ea',
    // Large border radius gives a pill look without clipping inner content
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(196,198,206,0.5)',
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 16,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(209,161,78,0.35)',
    marginRight: 12,
    flexShrink: 0,
  },
  details: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1b1c1e',
    marginBottom: 2,
  },
  location: {
    fontSize: 11,
    color: '#777779',
    marginBottom: 2,
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D1A14E',
  },
});

export default RecentlyViewedItem;

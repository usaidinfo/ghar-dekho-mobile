/**
 * @file TopListingItem.tsx
 * @description Horizontal card for "Top Listings" section.
 * Thumbnail on left, badge + title + location + price on right.
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { TopListing, ProjectBadge } from '../../types/property.types';

const getBadgeColors = (badge: ProjectBadge) => {
  switch (badge) {
    case 'HOT PROJECT':  return { bg: '#A3F0EE', text: '#00504F' };
    case 'EXCLUSIVE':    return { bg: '#A3F0EE', text: '#00504F' };
    case 'NEW LAUNCH':   return { bg: '#A3F0EE', text: '#00504F' };
    default:             return { bg: '#E9E7EA', text: '#44474D' };
  }
};

interface TopListingItemProps {
  listing: TopListing;
  onPress?: () => void;
}

const TopListingItem: React.FC<TopListingItemProps> = ({ listing, onPress }) => {
  const { bg, text } = getBadgeColors(listing.badge);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <Image source={{ uri: listing.thumbnailUrl }} style={styles.thumbnail} resizeMode="cover" />
      <View style={styles.info}>
        <View style={[styles.badge, { backgroundColor: bg }]}>
          <Text style={[styles.badgeText, { color: text }]}>{listing.badge}</Text>
        </View>
        <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
        <Text style={styles.locality} numberOfLines={1}>{listing.locality}</Text>
        <Text style={styles.price}>{listing.priceRange}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 320,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3F6',
    borderRadius: 16,
    padding: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(196,198,206,0.15)',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  thumbnail: {
    width: 88,
    height: 88,
    borderRadius: 12,
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginBottom: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#122A47',
  },
  locality: {
    fontSize: 11,
    color: '#777779',
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D1A14E',
    marginTop: 2,
  },
});

export default TopListingItem;

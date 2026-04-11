/**
 * @file PropertyCard.tsx
 * @description Individual property card for the "Curated for You" carousel.
 *
 * API Integration:
 * - Favorite state will move to a wishlist Zustand store + POST /api/wishlists.
 * - `onPress` navigates to PropertyDetail with `propertyId`.
 */

import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { Property } from '../../types/property.types';

interface PropertyCardProps {
  property: Property;
  onPress?: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onPress }) => {
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onPress}
      style={styles.card}
    >
      {/* --- Image --- */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: property.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Verified Badge */}
        {property.isVerified && (
          <View style={styles.verifiedBadge}>
            <Icon name="verified" size={12} color="#ffffff" />
            <Text style={styles.verifiedText}>VERIFIED</Text>
          </View>
        )}

        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => setIsFavorited(prev => !prev)}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon
            name={isFavorited ? 'favorite' : 'favorite-border'}
            size={20}
            color={isFavorited ? '#EF4444' : '#ffffff'}
          />
        </TouchableOpacity>
      </View>

      {/* --- Content --- */}
      <View style={styles.content}>
        {/* Price + Type */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{property.priceLabel}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{property.propertyType.toUpperCase()}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <Icon name="location-on" size={14} color="#D1A14E" />
          <Text style={styles.location} numberOfLines={1}>
            {property.locality}, {property.city}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// StyleSheet is used here because FlatList card sizing requires explicit width/height.
// NativeWind className is used wherever possible in the parent components.
const styles = StyleSheet.create({
  card: {
    width: 300,
    backgroundColor: '#faf9fc',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(209,161,78,0.9)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
  favoriteButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: '#122A47',
    letterSpacing: -0.5,
  },
  typeBadge: {
    backgroundColor: 'rgba(209,161,78,0.12)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D1A14E',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1b1c1e',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  location: {
    fontSize: 12,
    color: '#777779',
    flex: 1,
  },
});

export default PropertyCard;

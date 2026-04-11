/**
 * @file NearbyCard.tsx
 * @description Compact card for "Near Your Property" section.
 */

import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NearbyProperty } from '../../types/property.types';

interface NearbyCardProps {
  property: NearbyProperty;
  onPress?: () => void;
}

const NearbyCard: React.FC<NearbyCardProps> = ({ property, onPress }) => {
  const [isFav, setIsFav] = useState(property.isFavorited ?? false);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: property.imageUrl }} style={styles.image} resizeMode="cover" />
        <TouchableOpacity
          style={styles.favBtn}
          onPress={() => setIsFav(p => !p)}
          activeOpacity={0.8}
        >
          <Icon
            name={isFav ? 'heart' : 'heart-outline'}
            size={18}
            color={isFav ? '#EF4444' : '#ffffff'}
          />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.price}>{property.priceLabel}</Text>
        <Text style={styles.title} numberOfLines={2}>{property.title}</Text>
        <Text style={styles.distance}>{property.distanceKm} km away</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 220,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  imageContainer: {
    height: 152,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: 12,
    gap: 3,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D1A14E',
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#122A47',
    lineHeight: 17,
  },
  distance: {
    fontSize: 11,
    color: '#777779',
    marginTop: 2,
  },
});

export default NearbyCard;

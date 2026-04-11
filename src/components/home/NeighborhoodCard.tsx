/**
 * @file NeighborhoodCard.tsx
 * @description Single card for a trending neighborhood with image + gradient overlay.
 */

import React from 'react';
import { Text, Image, TouchableOpacity, View, StyleSheet } from 'react-native';
import type { Neighborhood } from '../../types/property.types';

interface NeighborhoodCardProps {
  neighborhood: Neighborhood;
  onPress?: () => void;
}

const NeighborhoodCard: React.FC<NeighborhoodCardProps> = ({ neighborhood, onPress }) => {
  const isTopRated = neighborhood.trendLabel === 'Top Rated';

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <Image
        source={{ uri: neighborhood.imageUrl }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      {/* Dark gradient overlay at the bottom */}
      <View style={styles.overlay} />

      {/* Labels */}
      <View style={styles.labels}>
        <Text
          style={[
            styles.trendLabel,
            { color: isTopRated ? '#D1A14E' : '#83C5BE' },
          ]}
        >
          {neighborhood.trendLabel.toUpperCase()}
        </Text>
        <Text style={styles.name}>{neighborhood.name}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18,42,71,0.6)',
    justifyContent: 'flex-end',
  },
  labels: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 60,
    // Stronger gradient feel at base
    backgroundColor: 'rgba(18,42,71,0.55)',
  },
  trendLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
});

export default NeighborhoodCard;

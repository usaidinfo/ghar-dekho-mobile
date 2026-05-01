import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { PropertyAmenityJoin } from '../../types/property-detail.types';
import { mciForAmenityName } from './amenityIcons';

const PRIMARY = '#122A47';
const MUTED = '#64748B';
const OUTLINE = '#F1F5F9';

const FALLBACK_AMENITIES: { id: string; name: string; mci: string }[] = [
  { id: 'fb-gym', name: 'Gym', mci: 'dumbbell' },
  { id: 'fb-pool', name: 'Infinity Pool', mci: 'pool' },
  { id: 'fb-park', name: 'Parking', mci: 'parking' },
  { id: 'fb-sec', name: '24/7 Security', mci: 'shield-home' },
];

interface PropertyAmenitiesSectionProps {
  amenities: PropertyAmenityJoin[];
}

const PropertyAmenitiesSection: React.FC<PropertyAmenitiesSectionProps> = ({ amenities }) => {
  const { width } = useWindowDimensions();
  const gap = width < 360 ? 10 : 14;
  const cell = Math.min(72, (width - 48 - gap * 3) / 4);

  const rows = useMemo(() => {
    if (amenities?.length) {
      return amenities.slice(0, 8).map(row => {
        const { name, icon, category } = row.amenity;
        const mci = mciForAmenityName(name, category);
        const showEmoji = Boolean(icon && [...icon].some(ch => ch.charCodeAt(0) > 127));
        return { key: row.amenity.id, name, mci, showEmoji, emoji: icon };
      });
    }
    return FALLBACK_AMENITIES.map(f => ({
      key: f.id,
      name: f.name,
      mci: f.mci,
      showEmoji: false,
      emoji: null as string | null,
    }));
  }, [amenities]);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Elite Amenities</Text>
      <View style={[styles.grid, { gap }]}>
        {rows.map(item => (
          <View key={item.key} style={[styles.cell, { width: cell, minHeight: cell + 36 }]}>
            <View style={[styles.iconBox, { width: cell, height: cell }]}>
              {item.showEmoji && item.emoji ? (
                <Text style={styles.emoji}>{item.emoji}</Text>
              ) : (
                <Icon name={item.mci} size={Math.min(28, cell * 0.38)} color="rgba(18, 42, 71, 0.8)" />
              )}
            </View>
            <Text style={styles.cellLabel} numberOfLines={2}>
              {item.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 52,
  },
  title: {
    marginBottom: 26,
    paddingHorizontal: 4,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: PRIMARY,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
  },
  cell: {
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: OUTLINE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  emoji: {
    fontSize: 26,
  },
  cellLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: MUTED,
    textAlign: 'center',
    paddingHorizontal: 2,
    maxWidth: 88,
  },
});

export default PropertyAmenitiesSection;

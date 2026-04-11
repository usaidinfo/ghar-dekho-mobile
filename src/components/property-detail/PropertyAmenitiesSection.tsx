import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { PropertyAmenityJoin } from '../../types/property-detail.types';
import { mciForAmenityName } from './amenityIcons';

const PRIMARY = '#122A47';
const MUTED = '#4A5568';
const SURFACE = '#F1F3F5';
const OUTLINE = 'rgba(226, 232, 240, 0.5)';

const FALLBACK_AMENITIES: { id: string; name: string; mci: string }[] = [
  { id: 'fb-gym', name: 'Gym', mci: 'dumbbell' },
  { id: 'fb-park', name: 'Parking', mci: 'parking' },
  { id: 'fb-sec', name: 'Security', mci: 'shield-check' },
  { id: 'fb-pool', name: 'Pool', mci: 'pool' },
];

interface PropertyAmenitiesSectionProps {
  amenities: PropertyAmenityJoin[];
}

const PropertyAmenitiesSection: React.FC<PropertyAmenitiesSectionProps> = ({ amenities }) => {
  const rows = useMemo(() => {
    if (amenities?.length) {
      return amenities.map(row => {
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
      <Text style={styles.title}>Amenities</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollInner}
      >
        {rows.map(item => (
          <View key={item.key} style={styles.chip}>
            {item.showEmoji && item.emoji ? (
              <Text style={styles.emoji}>{item.emoji}</Text>
            ) : (
              <Icon name={item.mci} size={30} color={PRIMARY} />
            )}
            <Text style={styles.chipLabel} numberOfLines={2}>
              {item.name}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 48,
  },
  title: {
    marginBottom: 24,
    paddingHorizontal: 4,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: PRIMARY,
  },
  scrollInner: {
    flexDirection: 'row',
    gap: 20,
    paddingBottom: 8,
    paddingHorizontal: 2,
  },
  chip: {
    width: 112,
    height: 112,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: OUTLINE,
  },
  emoji: {
    fontSize: 28,
  },
  chipLabel: {
    paddingHorizontal: 4,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: MUTED,
    textAlign: 'center',
  },
});

export default PropertyAmenitiesSection;

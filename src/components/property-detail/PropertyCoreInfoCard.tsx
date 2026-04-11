import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  formatFacing,
  formatFurnishing,
  formatInrPrice,
  formatPropertyAge,
  formatSqFt,
} from '../../utils/propertyDisplay';

const PRIMARY = '#122A47';
const TEAL = '#008080';
const MUTED = '#4A5568';
const OUTLINE = '#E2E8F0';
const SURFACE_LOW = '#F8F9FA';

interface PropertyCoreInfoCardProps {
  price: number;
  title: string;
  locality: string;
  city: string;
  isVerified: boolean;
  builtUpArea?: number | null;
  carpetArea?: number | null;
  superBuiltUpArea?: number | null;
  furnishing?: string | null;
  ageOfProperty?: number | null;
  facing?: string | null;
  bhk?: number | null;
}

const StatCell: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.statCell}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue} numberOfLines={2}>
      {value}
    </Text>
  </View>
);

const PropertyCoreInfoCard: React.FC<PropertyCoreInfoCardProps> = ({
  price,
  title,
  locality,
  city,
  isVerified,
  builtUpArea,
  carpetArea,
  superBuiltUpArea,
  furnishing,
  ageOfProperty,
  facing,
  bhk,
}) => {
  const area = builtUpArea ?? superBuiltUpArea ?? carpetArea;
  const headline = title?.trim() || (bhk ? `${bhk} BHK` : 'Property');

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.price}>{formatInrPrice(price)}</Text>
          <Text style={styles.title}>{headline}</Text>
          <View style={styles.locRow}>
            <Icon name="map-marker" size={18} color={TEAL} />
            <Text style={styles.locText} numberOfLines={2}>
              {[locality, city].filter(Boolean).join(', ')}
            </Text>
          </View>
        </View>
        {isVerified ? (
          <View style={styles.verifiedPill}>
            <Icon name="check-decagram" size={14} color={TEAL} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.grid}>
        <StatCell label="Area" value={formatSqFt(area)} />
        <StatCell label="Furnishing" value={formatFurnishing(furnishing)} />
        <StatCell label="Property Age" value={formatPropertyAge(ageOfProperty)} />
        <StatCell label="Facing" value={formatFacing(facing)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: PRIMARY,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  price: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: PRIMARY,
  },
  title: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '700',
    color: PRIMARY,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  locText: {
    flex: 1,
    fontSize: 14,
    color: MUTED,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 128, 128, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 128, 128, 0.2)',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: TEAL,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
    columnGap: 16,
  },
  statCell: {
    width: '47%',
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: SURFACE_LOW,
    borderWidth: 1,
    borderColor: OUTLINE,
  },
  statLabel: {
    marginBottom: 4,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: MUTED,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY,
    textAlign: 'center',
  },
});

export default PropertyCoreInfoCard;

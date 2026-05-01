import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  formatFacing,
  formatFurnishing,
  formatInrPriceParts,
  formatPropertyAge,
  formatGaj,
  formatSqFt,
} from '../../utils/propertyDisplay';

const PRIMARY = '#122A47';
const GOLD = '#D1A14E';
const MUTED = '#64748B';
const SURFACE_CONTAINER = '#F8F9FA';
const OUTLINE = '#F1F5F9';

interface PropertyCoreInfoCardProps {
  price: number;
  title: string;
  locality: string;
  city: string;
  isVerified: boolean;
  propertyType?: string | null;
  builtUpArea?: number | null;
  carpetArea?: number | null;
  superBuiltUpArea?: number | null;
  plotArea?: number | null;
  furnishing?: string | null;
  ageOfProperty?: number | null;
  facing?: string | null;
  bhk?: number | null;
}

const StatRow: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <View style={styles.statRow}>
    <View style={styles.statIconWrap}>
      <Icon name={icon} size={26} color="rgba(18, 42, 71, 0.65)" />
    </View>
    <View style={styles.statTextCol}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  </View>
);

const PropertyCoreInfoCard: React.FC<PropertyCoreInfoCardProps> = ({
  price,
  title,
  locality,
  city,
  isVerified,
  propertyType,
  builtUpArea,
  carpetArea,
  superBuiltUpArea,
  plotArea,
  furnishing,
  ageOfProperty,
  facing,
  bhk,
}) => {
  const { width } = useWindowDimensions();
  const pad = width < 360 ? 20 : width < 420 ? 26 : 32;
  const isPlot = String(propertyType || '').toUpperCase() === 'PLOT';
  const areaSqFt = isPlot ? (plotArea ?? null) : (builtUpArea ?? superBuiltUpArea ?? carpetArea ?? null);
  const headline = title?.trim() || (bhk ? `${bhk} BHK` : 'Property');
  const priceParts = formatInrPriceParts(price);
  const builtYear =
    ageOfProperty != null && Number.isFinite(ageOfProperty) && ageOfProperty >= 0
      ? `${new Date().getFullYear() - Math.round(ageOfProperty)} (${formatPropertyAge(ageOfProperty)})`
      : formatPropertyAge(ageOfProperty);

  return (
    <View style={[styles.card, { padding: pad }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          {priceParts ? (
            <View style={styles.priceRow}>
              <Text style={styles.priceMain}>{priceParts.main}</Text>
              {priceParts.suffix ? (
                <Text style={styles.priceSuffix}>
                  {' '}
                  {priceParts.suffix}
                </Text>
              ) : null}
            </View>
          ) : (
            <Text style={styles.priceFallback}>—</Text>
          )}
          <Text style={styles.title} numberOfLines={3}>
            {headline}
          </Text>
          <View style={styles.locRow}>
            <Icon name="map-marker" size={18} color={GOLD} />
            <Text style={styles.locText} numberOfLines={2}>
              {[locality, city].filter(Boolean).join(', ')}
            </Text>
          </View>
        </View>
        {isVerified ? (
          <View style={styles.verifiedBadge}>
            <Icon name="shield-check" size={16} color={GOLD} />
            <Text style={styles.verifiedText}>Verified Listing</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.grid}>
        <StatRow
          icon="ruler-square"
          label="Total Area"
          value={isPlot ? formatGaj(areaSqFt) : formatSqFt(areaSqFt)}
        />
        <StatRow icon="sofa-outline" label="Furnishing" value={formatFurnishing(furnishing)} />
        <StatRow icon="history" label="Built Year" value={builtYear} />
        <StatRow icon="compass-outline" label="Facing" value={formatFacing(facing)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: OUTLINE,
    shadowColor: PRIMARY,
    shadowOpacity: 0.06,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
    paddingRight: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  priceMain: {
    fontSize: 36,
    fontWeight: '300',
    letterSpacing: -1,
    color: PRIMARY,
  },
  priceSuffix: {
    fontSize: 20,
    fontWeight: '600',
    color: PRIMARY,
  },
  priceFallback: {
    fontSize: 32,
    fontWeight: '300',
    color: PRIMARY,
  },
  title: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.4,
    color: PRIMARY,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  locText: {
    flex: 1,
    fontSize: 14,
    color: MUTED,
    fontWeight: '500',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: 'rgba(209, 161, 78, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(209, 161, 78, 0.22)',
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: GOLD,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 22,
    columnGap: 12,
  },
  statRow: {
    width: '47%',
    minWidth: 130,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  statIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: SURFACE_CONTAINER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTextCol: {
    flex: 1,
    minWidth: 0,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: MUTED,
  },
  statValue: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY,
  },
});

export default PropertyCoreInfoCard;

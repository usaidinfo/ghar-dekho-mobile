import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  formatFacing,
  formatFurnishing,
  formatInrPrice,
  formatPropertyAge,
  formatSqFt,
} from '../../utils/propertyDisplay';

interface StatCellProps {
  label: string;
  value: string;
}

const StatCell: React.FC<StatCellProps> = ({ label, value }) => (
  <View
    className="min-h-[96px] w-[47%] items-center justify-center rounded-full border border-outline-light bg-surface-muted px-3 py-4"
  >
    <Text className="mb-1 text-center text-[9px] font-black uppercase tracking-widest text-slate-muted">{label}</Text>
    <Text className="text-center text-sm font-bold text-primary" numberOfLines={2}>
      {value}
    </Text>
  </View>
);

interface PropertyCoreInfoCardProps {
  price: number;
  title: string;
  locality: string;
  city: string;
  isVerified: boolean;
  builtUpArea?: number | null;
  carpetArea?: number | null;
  furnishing?: string | null;
  ageOfProperty?: number | null;
  facing?: string | null;
  bhk?: number | null;
}

const PropertyCoreInfoCard: React.FC<PropertyCoreInfoCardProps> = ({
  price,
  title,
  locality,
  city,
  isVerified,
  builtUpArea,
  carpetArea,
  furnishing,
  ageOfProperty,
  facing,
  bhk,
}) => {
  const area = builtUpArea ?? carpetArea;
  const headline = title || (bhk ? `${bhk} BHK` : 'Property');

  return (
    <View className="rounded-2xl border border-outline-light/80 bg-surface-card p-8 shadow-xl shadow-primary/5">
      <View className="mb-6 flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1 pr-2">
          <Text className="text-3xl font-extrabold tracking-tight text-primary">{formatInrPrice(price)}</Text>
          <Text className="mt-1 text-2xl font-bold text-primary">{headline}</Text>
          <View className="mt-2 flex-row items-center gap-1">
            <Icon name="map-marker" size={18} color="#008080" />
            <Text className="text-sm text-slate-muted" numberOfLines={2}>
              {[locality, city].filter(Boolean).join(', ')}
            </Text>
          </View>
        </View>
        {isVerified ? (
          <View className="flex-row items-center gap-1 rounded-full border border-brand-teal/20 bg-brand-teal/10 px-3 py-1.5">
            <Icon name="check-decagram" size={14} color="#008080" />
            <Text className="text-[10px] font-black uppercase tracking-widest text-brand-teal">Verified</Text>
          </View>
        ) : null}
      </View>

      <View className="flex-row flex-wrap justify-between gap-3">
        <StatCell label="Area" value={formatSqFt(area)} />
        <StatCell label="Furnishing" value={formatFurnishing(furnishing)} />
        <StatCell label="Property Age" value={formatPropertyAge(ageOfProperty)} />
        <StatCell label="Facing" value={formatFacing(facing)} />
      </View>
    </View>
  );
};

export default PropertyCoreInfoCard;

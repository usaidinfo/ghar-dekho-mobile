import React, { useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';

export type SearchFiltersState = {
  minPrice: string;
  maxPrice: string;
  propertyType: string; // '' = any
  furnishing: string; // '' = any
};

type Option = { label: string; value: string };

const PROPERTY_TYPE_OPTIONS: Option[] = [
  { label: 'Any', value: '' },
  { label: 'Flat', value: 'FLAT' },
  { label: 'Villa', value: 'VILLA' },
  { label: 'Plot', value: 'PLOT' },
  { label: 'House', value: 'HOUSE' },
  { label: 'Office', value: 'OFFICE' },
  { label: 'Shop', value: 'SHOP' },
  { label: 'PG', value: 'PG' },
  { label: 'Co-living', value: 'CO_LIVING' },
];

const FURNISHING_OPTIONS: Option[] = [
  { label: 'Any', value: '' },
  { label: 'Unfurnished', value: 'UNFURNISHED' },
  { label: 'Semi', value: 'SEMI_FURNISHED' },
  { label: 'Fully', value: 'FULLY_FURNISHED' },
];

export interface SearchFiltersPanelProps {
  open: boolean;
  value: SearchFiltersState;
  onChange: (next: SearchFiltersState) => void;
  onApply?: () => void;
  onClear?: () => void;
  showActions?: boolean;
}

function Chip({
  label,
  selected,
  onPress,
  className,
  variant,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  className?: string;
  variant?: 'type' | 'furnishing';
}) {
  const solidSelected = variant === 'furnishing' && selected && label === 'Fully';
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      className={[
        'items-center justify-center rounded-lg border px-2 py-3',
        solidSelected
          ? 'border-secondary bg-secondary'
          : selected
            ? 'border-secondary bg-secondary/5'
            : 'border-outline-variant bg-transparent',
        className ?? '',
      ].join(' ')}
    >
      <Text
        className={[
          solidSelected ? 'text-on-secondary' : selected ? 'text-secondary' : 'text-on-surface',
          'text-xs font-extrabold',
        ].join(' ')}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.78}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function SearchFiltersPanel({
  open,
  value,
  onChange,
  onApply,
  onClear,
  showActions = true,
}: SearchFiltersPanelProps) {
  const propOptions = useMemo(() => PROPERTY_TYPE_OPTIONS, []);
  const furnishOptions = useMemo(() => FURNISHING_OPTIONS, []);

  if (!open) return null;

  return (
    <View className="gap-10">
      <View className="gap-4">
        <Text className="text-sm font-extrabold tracking-wide text-primary">Budget Range</Text>
        <View className="flex-row gap-4">
        <View className="min-w-[150px] flex-1">
          <Text className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-outline">
            Min Price (₹)
          </Text>
          <TextInput
            value={value.minPrice}
            onChangeText={t => onChange({ ...value, minPrice: t })}
            placeholder="0"
            placeholderTextColor="#74777e"
            keyboardType="number-pad"
            className="rounded-lg bg-surface-container px-3 text-sm font-semibold text-on-surface"
            style={{ paddingVertical: Platform.OS === 'ios' ? 12 : 10 }}
          />
        </View>
        <View className="min-w-[150px] flex-1">
          <Text className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-outline">
            Max Price (₹)
          </Text>
          <TextInput
            value={value.maxPrice}
            onChangeText={t => onChange({ ...value, maxPrice: t })}
            placeholder="5,00,00,000"
            placeholderTextColor="#74777e"
            keyboardType="number-pad"
            className="rounded-lg bg-surface-container px-3 text-sm font-semibold text-on-surface"
            style={{ paddingVertical: Platform.OS === 'ios' ? 12 : 10 }}
          />
        </View>
        </View>
      </View>

      <View className="gap-4">
        <Text className="text-sm font-extrabold tracking-wide text-primary">Property Type</Text>
        <View className="flex-row flex-wrap justify-between gap-y-2">
          {propOptions.map(opt => (
            <Chip
              key={opt.value || 'any'}
              label={opt.label}
              selected={value.propertyType === opt.value}
              onPress={() => onChange({ ...value, propertyType: opt.value })}
              className="w-[32%]"
              variant="type"
            />
          ))}
        </View>
      </View>

      <View className="gap-4">
        <Text className="text-sm font-extrabold tracking-wide text-primary">Furnishing</Text>
        <View className="flex-row flex-wrap justify-between gap-y-2">
          {furnishOptions.map(opt => (
            <Chip
              key={opt.value || 'any'}
              label={opt.label}
              selected={value.furnishing === opt.value}
              onPress={() => onChange({ ...value, furnishing: opt.value })}
              className="w-[48%]"
              variant="furnishing"
            />
          ))}
        </View>
      </View>

      {showActions ? (
        <View className="mt-8 flex-row gap-4">
          <TouchableOpacity
            onPress={onClear}
            activeOpacity={0.88}
            className="flex-1 rounded-full py-4"
          >
            <Text className="text-center text-sm font-extrabold text-primary">Clear All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onApply}
            activeOpacity={0.88}
            className="flex-[2] rounded-full bg-primary py-4 shadow-lg"
          >
            <Text className="text-center text-sm font-extrabold text-white">Apply Filters</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

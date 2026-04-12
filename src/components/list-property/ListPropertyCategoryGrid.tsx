import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import type { ListingPropertyKind } from '../../types/list-property-form.types';
import { LP_STACK } from './listPropertyLayout';

const ITEMS: { kind: ListingPropertyKind; icon: string; label: string }[] = [
  { kind: 'Flat', icon: 'home-city-outline', label: 'Flat' },
  { kind: 'Villa', icon: 'home-variant-outline', label: 'Villa' },
  { kind: 'Plot', icon: 'image-filter-hdr', label: 'Plot' },
  { kind: 'Office', icon: 'domain', label: 'Office' },
];

interface ListPropertyCategoryGridProps {
  value: ListingPropertyKind;
  onChange: (v: ListingPropertyKind) => void;
}

const ListPropertyCategoryGrid: React.FC<ListPropertyCategoryGridProps> = ({ value, onChange }) => (
  <View style={LP_STACK.row12}>
    {ITEMS.map(({ kind, icon, label }) => {
      const selected = value === kind;
      return (
        <TouchableOpacity
          key={kind}
          onPress={() => onChange(kind)}
          activeOpacity={0.88}
          className={`flex-1 rounded-2xl border bg-surface-card p-3 ${
            selected ? 'border-2 border-primary' : 'border border-outline-light'
          }`}
          style={LP_STACK.categoryChip}
        >
          <Icon name={icon} size={24} color={selected ? '#122A47' : '#495057'} />
          <Text
            className={`max-w-full text-center text-[9px] font-bold uppercase tracking-wide ${selected ? 'text-primary' : 'text-on-surface-muted'}`}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.82}
          >
            {label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export default ListPropertyCategoryGrid;

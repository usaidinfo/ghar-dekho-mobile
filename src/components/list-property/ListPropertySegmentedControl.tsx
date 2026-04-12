import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';

import type { ListingIntent } from '../../types/list-property-form.types';

const OPTIONS: ListingIntent[] = ['Buy', 'Rent', 'PG', 'Comm.'];

interface ListPropertySegmentedControlProps {
  value: ListingIntent;
  onChange: (v: ListingIntent) => void;
}

const ListPropertySegmentedControl: React.FC<ListPropertySegmentedControlProps> = ({ value, onChange }) => (
  <View className="flex-row rounded-full bg-surface-muted p-1">
    {OPTIONS.map(opt => {
      const selected = value === opt;
      return (
        <TouchableOpacity
          key={opt}
          onPress={() => onChange(opt)}
          activeOpacity={0.85}
          className={`min-w-0 flex-1 rounded-full py-2 ${selected ? 'bg-surface-card' : ''}`}
          style={
            selected
              ? Platform.select({
                  ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.08,
                    shadowRadius: 3,
                  },
                  android: { elevation: 2 },
                })
              : undefined
          }
        >
          <Text
            className={`text-center text-sm font-bold ${selected ? 'text-primary' : 'text-on-surface-muted'}`}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {opt}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export default ListPropertySegmentedControl;

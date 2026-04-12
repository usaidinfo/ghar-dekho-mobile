import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Controller, type Control } from 'react-hook-form';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import type { ListPropertyFormValues, ListPropertyAmenityId } from '../../types/list-property-form.types';
import ListPropertyStepSection from './ListPropertyStepSection';
import { LP_MISC, LP_STACK } from './listPropertyLayout';

const AMENITIES: { id: ListPropertyAmenityId; label: string; icon: string }[] = [
  { id: 'parking', label: 'Parking', icon: 'parking' },
  { id: 'gym', label: 'Gym', icon: 'dumbbell' },
  { id: 'lift', label: 'Lift', icon: 'elevator' },
  { id: 'pool', label: 'Pool', icon: 'pool' },
  { id: 'security', label: 'Security', icon: 'shield-check-outline' },
  { id: 'backup', label: 'Backup', icon: 'flash-outline' },
];

interface ListPropertyAmenitiesSectionProps {
  control: Control<ListPropertyFormValues>;
}

const ListPropertyAmenitiesSection: React.FC<ListPropertyAmenitiesSectionProps> = ({ control }) => (
  <ListPropertyStepSection title="Amenities">
    <Controller
      control={control}
      name="amenities"
      render={({ field: { value, onChange } }) => {
        const rows = [AMENITIES.slice(0, 2), AMENITIES.slice(2, 4), AMENITIES.slice(4, 6)];
        return (
          <View style={LP_STACK.sectionDense}>
            {rows.map((row, ri) => (
              <View key={ri} style={LP_STACK.row12}>
                {row.map(({ id, label, icon }) => {
                  const selected = value.includes(id);
                  return (
                    <TouchableOpacity
                      key={id}
                      onPress={() => {
                        if (selected) {
                          onChange(value.filter(a => a !== id));
                        } else {
                          onChange([...value, id]);
                        }
                      }}
                      activeOpacity={0.88}
                      style={[LP_STACK.amenityChip, selected ? undefined : LP_MISC.amenityUnselectedBorder]}
                      className={`rounded-2xl p-4 ${selected ? 'bg-teal-surface' : 'bg-surface-muted'}`}
                    >
                      <Icon name={icon} size={22} color={selected ? '#004D40' : '#ADB5BD'} />
                      <Text
                        className={`text-xs ${selected ? 'font-black text-on-teal-surface' : 'font-bold text-on-surface-muted'}`}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        );
      }}
    />
  </ListPropertyStepSection>
);

export default ListPropertyAmenitiesSection;

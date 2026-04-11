import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { PropertyAmenityJoin } from '../../types/property-detail.types';
import { mciForAmenityName } from './amenityIcons';

interface PropertyAmenitiesSectionProps {
  amenities: PropertyAmenityJoin[];
}

const PropertyAmenitiesSection: React.FC<PropertyAmenitiesSectionProps> = ({ amenities }) => {
  if (!amenities?.length) return null;

  return (
    <View className="mt-12">
      <Text className="mb-6 px-1 text-xl font-extrabold tracking-tight text-primary">Amenities</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-2" contentContainerStyle={{ gap: 20 }}>
        {amenities.map(row => {
          const { name, icon, category } = row.amenity;
          const mci = mciForAmenityName(name, category);
          const showEmoji = Boolean(icon && [...icon].some(ch => ch.charCodeAt(0) > 127));
          return (
            <View
              key={row.amenity.id}
              className="h-28 w-28 flex-shrink-0 items-center justify-center gap-2 rounded-full border border-outline-light/30 bg-surface-muted"
            >
              {showEmoji ? (
                <Text className="text-3xl">{icon}</Text>
              ) : (
                <Icon name={mci} size={30} color="#122A47" />
              )}
              <Text
                className="px-1 text-center text-[9px] font-black uppercase tracking-widest text-slate-muted"
                numberOfLines={2}
              >
                {name}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default PropertyAmenitiesSection;

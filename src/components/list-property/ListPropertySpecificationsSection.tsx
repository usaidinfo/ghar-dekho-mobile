import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Controller, type Control } from 'react-hook-form';

import type { ListPropertyFormValues, ListingBhk, ListingPropertyAge } from '../../types/list-property-form.types';
import ListPropertyStepSection from './ListPropertyStepSection';
import { LP_STACK } from './listPropertyLayout';

const BHK_OPTIONS: ListingBhk[] = ['1', '2', '3', '4', '5+'];
const AGE_OPTIONS: ListingPropertyAge[] = ['New Construction', '0-1 Year', '1-5 Years'];

interface ListPropertySpecificationsSectionProps {
  control: Control<ListPropertyFormValues>;
}

const fieldClass =
  'w-full rounded-full border-0 bg-surface-container-high px-6 py-4 text-sm font-bold text-primary';

const ListPropertySpecificationsSection: React.FC<ListPropertySpecificationsSectionProps> = ({ control }) => (
  <ListPropertyStepSection title="Specifications">
    <View style={LP_STACK.section}>
      <View>
        <Text className="mb-3 ml-4 text-[10px] font-extrabold uppercase tracking-widest text-brand-teal">
          BHK Selection
        </Text>
        <Controller
          control={control}
          name="bhk"
          render={({ field: { value, onChange } }) => (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="pb-1"
              contentContainerStyle={styles.bhkScroll}
            >
              {BHK_OPTIONS.map(opt => {
                const selected = value === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => onChange(opt)}
                    activeOpacity={0.85}
                    className={`rounded-full px-6 py-3 ${selected ? 'bg-primary' : 'border border-outline-light bg-surface-muted'}`}
                    style={selected ? bhkSelectedShadow : undefined}
                  >
                    <Text className={`text-sm font-bold ${selected ? 'text-on-primary' : 'text-primary'}`}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        />
      </View>

      <View style={LP_STACK.row16}>
        <View style={LP_STACK.fieldCol}>
          <Text className="ml-4 text-[10px] font-extrabold uppercase tracking-widest text-brand-teal">Built-up (Sq.ft)</Text>
          <Controller
            control={control}
            name="builtUpSqFt"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                className={fieldClass}
                placeholder="1,200"
                placeholderTextColor="#ADB5BD"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="numeric"
              />
            )}
          />
        </View>
        <View style={LP_STACK.fieldCol}>
          <Text className="ml-4 text-[10px] font-extrabold uppercase tracking-widest text-brand-teal">Carpet (Sq.ft)</Text>
          <Controller
            control={control}
            name="carpetSqFt"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                className={fieldClass}
                placeholder="950"
                placeholderTextColor="#ADB5BD"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="numeric"
              />
            )}
          />
        </View>
      </View>

      <View>
        <Text className="mb-3 ml-4 text-[10px] font-extrabold uppercase tracking-widest text-brand-teal">Property Age</Text>
        <Controller
          control={control}
          name="propertyAge"
          render={({ field: { value, onChange } }) => (
            <View style={LP_STACK.rowWrap8Pad}>
              {AGE_OPTIONS.map(opt => {
                const selected = value === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => onChange(opt)}
                    activeOpacity={0.88}
                    className={`rounded-full px-5 py-2 ${selected ? 'bg-teal-surface' : 'border border-outline-light bg-surface-muted'}`}
                  >
                    <Text
                      className={`text-xs ${selected ? 'font-extrabold text-on-teal-surface' : 'font-bold text-on-surface-muted'}`}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        />
      </View>

      <View style={LP_STACK.row16}>
        <View style={LP_STACK.fieldCol}>
          <Text className="ml-4 text-[10px] font-extrabold uppercase tracking-widest text-brand-teal">Floor</Text>
          <Controller
            control={control}
            name="floor"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                className={fieldClass}
                placeholder="5"
                placeholderTextColor="#ADB5BD"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="numeric"
              />
            )}
          />
        </View>
        <View style={LP_STACK.fieldCol}>
          <Text className="ml-4 text-[10px] font-extrabold uppercase tracking-widest text-brand-teal">Total Floors</Text>
          <Controller
            control={control}
            name="totalFloors"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                className={fieldClass}
                placeholder="12"
                placeholderTextColor="#ADB5BD"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="numeric"
              />
            )}
          />
        </View>
      </View>
    </View>
  </ListPropertyStepSection>
);

const bhkSelectedShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  android: { elevation: 4 },
});

const styles = StyleSheet.create({
  bhkScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
});

export default ListPropertySpecificationsSection;

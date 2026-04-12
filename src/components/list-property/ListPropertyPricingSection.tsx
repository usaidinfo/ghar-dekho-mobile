import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Controller, type Control, type UseFormSetValue } from 'react-hook-form';

import type { ListPropertyFormValues } from '../../types/list-property-form.types';
import { LIST_PROPERTY_AI_RANGE_LABEL } from './constants';
import ListPropertyStepSection from './ListPropertyStepSection';
import ListPropertyToggle from './ListPropertyToggle';
import { LP_COLOR, LP_STACK } from './listPropertyLayout';

interface ListPropertyPricingSectionProps {
  control: Control<ListPropertyFormValues>;
  setValue: UseFormSetValue<ListPropertyFormValues>;
}

const ListPropertyPricingSection: React.FC<ListPropertyPricingSectionProps> = ({ control, setValue }) => (
  <ListPropertyStepSection title="Pricing & AI Insight">
    <View style={LP_STACK.section}>
      <Controller
        control={control}
        name="totalPrice"
        render={({ field: { value, onChange, onBlur } }) => (
          <View className="relative justify-center">
            <View className="absolute left-6 z-10" pointerEvents="none">
              <Text className="text-2xl font-black text-brand-teal">₹</Text>
            </View>
            <TextInput
              className="w-full rounded-3xl border-0 bg-surface-muted py-6 pl-12 pr-6 text-3xl font-black text-primary"
              placeholder="Total Price"
              placeholderTextColor="#ADB5BD"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="numeric"
            />
          </View>
        )}
      />

      <View style={styles.aiCard}>
        <View style={LP_STACK.row12}>
          <Text className="text-xl">✨</Text>
          <Text className="min-w-0 flex-1 text-sm font-extrabold text-on-teal-surface">{LIST_PROPERTY_AI_RANGE_LABEL}</Text>
        </View>
        <TouchableOpacity onPress={() => setValue('totalPrice', '15000000')} activeOpacity={0.75} className="ml-8 self-start">
          <Text className="text-xs font-black uppercase tracking-widest text-brand-teal underline">Apply AI Price</Text>
        </TouchableOpacity>
      </View>

      <View style={LP_STACK.negotiateRow}>
        <View className="min-w-0 flex-1 pr-3">
          <Text className="text-sm font-extrabold text-primary">Price Negotiable</Text>
          <Text className="text-xs font-medium text-on-surface-muted">Open to reasonable offers</Text>
        </View>
        <Controller
          control={control}
          name="priceNegotiable"
          render={({ field: { value, onChange } }) => <ListPropertyToggle value={value} onValueChange={onChange} />}
        />
      </View>
    </View>
  </ListPropertyStepSection>
);

const styles = StyleSheet.create({
  aiCard: {
    gap: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: LP_COLOR.aiInsightBorder,
    backgroundColor: LP_COLOR.aiInsightBg,
    padding: 20,
  },
});

export default ListPropertyPricingSection;

import React from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Controller, useWatch, type Control } from 'react-hook-form';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import type { ListPropertyFormValues } from '../../types/list-property-form.types';
import ListPropertyStepSection from './ListPropertyStepSection';
import ListPropertyToggle from './ListPropertyToggle';
import { LP_COLOR, LP_STACK } from './listPropertyLayout';

interface ListPropertyLegalSectionProps {
  control: Control<ListPropertyFormValues>;
}

const fieldClass =
  'w-full rounded-full border-0 bg-surface-container-high px-6 py-4 text-sm font-bold text-primary';

const RoundCheckRow: React.FC<{
  checked: boolean;
  onToggle: () => void;
  label: string;
}> = ({ checked, onToggle, label }) => (
  <TouchableOpacity onPress={onToggle} activeOpacity={0.85} style={LP_STACK.row12}>
    <View
      className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
        checked ? 'border-brand-teal bg-brand-teal' : 'border-brand-teal bg-transparent'
      }`}
    >
      {checked ? <Icon name="check" size={14} color="#FFFFFF" /> : null}
    </View>
    <Text className="min-w-0 flex-1 text-sm font-bold text-on-surface-muted">{label}</Text>
  </TouchableOpacity>
);

const ListPropertyLegalSection: React.FC<ListPropertyLegalSectionProps> = ({ control }) => {
  const reraOn = useWatch({ control, name: 'reraApproved' });

  return (
    <ListPropertyStepSection title="Legal & Verification">
      <View style={LP_STACK.legalSectionPad}>
        <View style={LP_STACK.row16Between}>
          <View className="min-w-0 flex-1 pr-3">
            <Text className="text-sm font-extrabold text-primary">RERA Approved</Text>
            <Text className="text-xs font-medium text-on-surface-muted">Real Estate Regulatory Authority</Text>
          </View>
          <Controller
            control={control}
            name="reraApproved"
            render={({ field: { value, onChange } }) => <ListPropertyToggle value={value} onValueChange={onChange} />}
          />
        </View>

        {reraOn ? (
          <View>
            <Text className="mb-2 ml-4 text-[10px] font-extrabold uppercase tracking-widest text-brand-teal">
              RERA Registration Number
            </Text>
            <Controller
              control={control}
              name="reraRegistrationNumber"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  className={fieldClass}
                  placeholder="PRM/KA/RERA/1251/446/PR/123456"
                  placeholderTextColor="#ADB5BD"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          </View>
        ) : null}

        <View style={LP_STACK.checklistBlock}>
          <Controller
            control={control}
            name="nocFromSociety"
            render={({ field: { value, onChange } }) => (
              <RoundCheckRow checked={value} onToggle={() => onChange(!value)} label="Clear NOC from Society" />
            )}
          />
          <Controller
            control={control}
            name="approvedMasterPlan"
            render={({ field: { value, onChange } }) => (
              <RoundCheckRow checked={value} onToggle={() => onChange(!value)} label="Approved Master Plan" />
            )}
          />

          <View style={styles.divider} />

          <Controller
            control={control}
            name="featureListing"
            render={({ field: { value, onChange } }) => (
              <TouchableOpacity
                onPress={() => onChange(!value)}
                activeOpacity={0.88}
                style={[LP_STACK.featureRow, styles.featureCard, value ? styles.featureElevated : null]}
              >
                <View
                  className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                    value ? 'border-brand-gold bg-brand-gold' : 'border-brand-gold bg-transparent'
                  }`}
                >
                  {value ? <Icon name="check" size={16} color="#122A47" /> : null}
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="text-sm font-black text-primary">Feature this Listing</Text>
                  <Text className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-on-gold-wash">
                    3x faster leads guarantee
                  </Text>
                </View>
                <Text className="text-2xl">🔥</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </ListPropertyStepSection>
  );
};

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: LP_COLOR.divider,
    marginVertical: 8,
  },
  featureCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: LP_COLOR.goldBorder,
    backgroundColor: '#FFF8E1',
    padding: 20,
  },
  featureElevated: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
    android: { elevation: 3 },
  }),
});

export default ListPropertyLegalSection;

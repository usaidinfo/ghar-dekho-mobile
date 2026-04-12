import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Controller, type Control, type UseFormSetValue } from 'react-hook-form';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

import type { ListPropertyFormValues } from '../../types/list-property-form.types';
import { detectLocationForListing } from '../../utils/detectLocationForListing';
import ListPropertyCategoryGrid from './ListPropertyCategoryGrid';
import ListPropertySegmentedControl from './ListPropertySegmentedControl';
import ListPropertyStepSection from './ListPropertyStepSection';
import { LP_STACK } from './listPropertyLayout';

interface ListPropertyBasicLocationSectionProps {
  control: Control<ListPropertyFormValues>;
  setValue: UseFormSetValue<ListPropertyFormValues>;
}

const inputClassBase =
  'rounded-full border-0 bg-surface-container-high py-4 text-sm font-semibold text-primary';
const inputClass = `px-6 ${inputClassBase}`;
const placeholderColor = '#495057';

const ListPropertyBasicLocationSection: React.FC<ListPropertyBasicLocationSectionProps> = ({
  control,
  setValue,
}) => {
  const [detecting, setDetecting] = useState(false);

  const onDetectLocation = useCallback(async () => {
    if (detecting) {
      return;
    }
    setDetecting(true);
    try {
      const addr = await detectLocationForListing();

      setValue('locality', addr.locality, { shouldDirty: true });
      setValue('city', addr.city, { shouldDirty: true });
      setValue('state', addr.state, { shouldDirty: true });
      setValue('pincode', addr.pincode, { shouldDirty: true });
      setValue('latitude', String(addr.latitude), { shouldDirty: true });
      setValue('longitude', String(addr.longitude), { shouldDirty: true });

      Toast.show({
        type: 'success',
        text1: 'Location filled',
        text2: 'Approximate from network — please verify pincode & locality.',
      });
    } catch (e) {
      const msg =
        e && typeof e === 'object' && 'message' in e && typeof (e as { message: string }).message === 'string'
          ? (e as { message: string }).message
          : 'Could not detect location';
      Toast.show({
        type: 'error',
        text1: 'Location failed',
        text2: msg,
      });
    } finally {
      setDetecting(false);
    }
  }, [detecting, setValue]);

  return (
    <ListPropertyStepSection title="Basic Info & Location">
      <View style={LP_STACK.section}>
        <Controller
          control={control}
          name="listingIntent"
          render={({ field: { value, onChange } }) => (
            <ListPropertySegmentedControl value={value} onChange={onChange} />
          )}
        />

        <Controller
          control={control}
          name="propertyKind"
          render={({ field: { value, onChange } }) => <ListPropertyCategoryGrid value={value} onChange={onChange} />}
        />

        <View style={LP_STACK.sectionTight}>
          <Controller
            control={control}
            name="locality"
            render={({ field: { value, onChange, onBlur } }) => (
              <View className="relative justify-center">
                <TextInput
                  className={`w-full pl-6 pr-14 ${inputClassBase}`}
                  placeholder="Search locality or society"
                  placeholderTextColor={placeholderColor}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                <View className="absolute right-5 z-10" pointerEvents="none">
                  <Icon name="magnify" size={22} color="#ADB5BD" />
                </View>
              </View>
            )}
          />
          <View style={LP_STACK.row16}>
            <Controller
              control={control}
              name="city"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  className={`min-w-0 flex-1 ${inputClass}`}
                  placeholder="City"
                  placeholderTextColor={placeholderColor}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            <Controller
              control={control}
              name="state"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  className={`min-w-0 flex-1 ${inputClass}`}
                  placeholder="State"
                  placeholderTextColor={placeholderColor}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          </View>
          <Controller
            control={control}
            name="pincode"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                className={`w-full ${inputClass}`}
                placeholder="Pincode"
                placeholderTextColor={placeholderColor}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="number-pad"
              />
            )}
          />
        </View>

        <View className="h-48 overflow-hidden rounded-3xl border-2 border-dashed border-outline bg-surface-muted">
          <View className="h-full w-full items-center justify-center gap-3 px-4">
            <Icon name="map-marker-off-outline" size={40} color="#ADB5BD" />
            <Text className="text-center text-xs font-semibold text-on-surface-muted">
              Map preview — add photos in Media to show your property on the map later
            </Text>
            <TouchableOpacity
              activeOpacity={0.9}
              className="rounded-full bg-surface-card px-6 py-3"
              style={LP_STACK.row8}
              onPress={onDetectLocation}
              disabled={detecting}
            >
              {detecting ? (
                <ActivityIndicator color="#008080" size="small" />
              ) : (
                <Icon name="crosshairs-gps" size={18} color="#008080" />
              )}
              <Text className="text-sm font-extrabold text-brand-teal">
                {detecting ? 'Detecting…' : 'Detect My Location'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ListPropertyStepSection>
  );
};

export default ListPropertyBasicLocationSection;

import React from 'react';
import { View } from 'react-native';
import type { UseFormReturn } from 'react-hook-form';

import type { ListPropertyFormValues } from '../../types/list-property-form.types';
import ListPropertyAmenitiesSection from './ListPropertyAmenitiesSection';
import ListPropertyBasicLocationSection from './ListPropertyBasicLocationSection';
import ListPropertyLegalSection from './ListPropertyLegalSection';
import ListPropertyMediaSection from './ListPropertyMediaSection';
import ListPropertyPricingSection from './ListPropertyPricingSection';
import ListPropertySpecificationsSection from './ListPropertySpecificationsSection';
import { LP_STACK } from './listPropertyLayout';

export interface ListPropertyFormProps {
  form: UseFormReturn<ListPropertyFormValues>;
}

const ListPropertyForm: React.FC<ListPropertyFormProps> = ({ form }) => {
  const { control, setValue, getValues } = form;

  return (
    <View style={LP_STACK.form}>
      <ListPropertyBasicLocationSection control={control} setValue={setValue} />
      <ListPropertySpecificationsSection control={control} />
      <ListPropertyPricingSection control={control} setValue={setValue} />
      <ListPropertyAmenitiesSection control={control} />
      <ListPropertyMediaSection control={control} setValue={setValue} getValues={getValues} />
      <ListPropertyLegalSection control={control} />
    </View>
  );
};

export default ListPropertyForm;

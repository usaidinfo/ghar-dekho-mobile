import React from 'react';
import { Text, View } from 'react-native';

import { LP_CARD } from './listPropertyLayout';

interface ListPropertyStepSectionProps {
  title: string;
  children: React.ReactNode;
}

const ListPropertyStepSection: React.FC<ListPropertyStepSectionProps> = ({ title, children }) => (
  <View style={LP_CARD.section}>
    <Text className="mb-3 text-lg font-extrabold text-primary" numberOfLines={2}>
      {title}
    </Text>
    {children}
  </View>
);

export default ListPropertyStepSection;

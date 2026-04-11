/**
 * @file SectionHeader.tsx
 * @description Reusable section title row with optional subtitle and "View All" link.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onViewAll?: () => void;
  viewAllLabel?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  onViewAll,
  viewAllLabel = 'Explore all',
}) => {
  return (
    <View style={styles.row}>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {onViewAll && (
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7} style={styles.viewAll}>
          <Text style={styles.viewAllText}>{viewAllLabel}</Text>
          <Icon name="chevron-right" size={16} color="#D1A14E" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  titleBlock: { flex: 1 },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#122A47',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    color: '#777779',
    marginTop: 2,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D1A14E',
  },
});

export default SectionHeader;

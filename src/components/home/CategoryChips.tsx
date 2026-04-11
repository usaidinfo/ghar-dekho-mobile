/**
 * @file CategoryChips.tsx
 * @description Horizontally scrollable category filter pills.
 * Categories updated to match new design: Buy / Rent / Plot/Land / Co-working / Commercial.
 */

import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import type { PropertyCategory } from '../../types/property.types';

const CATEGORIES: PropertyCategory[] = ['Buy', 'Rent', 'Plot/Land', 'Co-working', 'Commercial'];

interface CategoryChipsProps {
  selected: PropertyCategory;
  onSelect: (category: PropertyCategory) => void;
}

const CategoryChips: React.FC<CategoryChipsProps> = ({ selected, onSelect }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      {CATEGORIES.map(category => {
        const isActive = category === selected;
        return (
          <TouchableOpacity
            key={category}
            onPress={() => onSelect(category)}
            activeOpacity={0.8}
            style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
          >
            <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>
              {category}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { marginBottom: 24 },
  container: { paddingHorizontal: 24, gap: 10 },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  chipActive: {
    backgroundColor: '#122A47',
  },
  chipInactive: {
    backgroundColor: '#E9E7EA',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  chipTextInactive: {
    color: '#44474D',
  },
});

export default CategoryChips;

import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { type SearchFiltersState } from './SearchFiltersPanel';

export interface SearchHeaderProps {
  queryText: string;
  onChangeQuery: (t: string) => void;
  onSubmitSearch: () => void;

  filtersOpen: boolean;
  onToggleFilters: () => void;
  activeFilterCount: number;

  filtersValue: SearchFiltersState;
  onChangeFilters: (next: SearchFiltersState) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export default function SearchHeader({
  queryText,
  onChangeQuery,
  onSubmitSearch,
  filtersOpen,
  onToggleFilters,
  activeFilterCount,
  filtersValue,
  onChangeFilters,
  onApplyFilters,
  onClearFilters,
}: SearchHeaderProps) {
  return (
    <View>
      <View className="mt-1 mb-4 flex-row items-center rounded-full bg-surface-container-highest px-3 py-1.5">
        <Icon name="magnify" size={20} color="#74777e" />
        <TextInput
          value={queryText}
          onChangeText={onChangeQuery}
          placeholder="Search locality or project..."
          placeholderTextColor="#74777e"
          className="flex-1 px-3 py-2 text-[15px] font-semibold text-primary"
          returnKeyType="search"
          onSubmitEditing={onSubmitSearch}
          clearButtonMode="while-editing"
        />
        <TouchableOpacity
          onPress={onSubmitSearch}
          activeOpacity={0.9}
          className="rounded-full bg-primary px-5 py-2 active:opacity-95"
          hitSlop={8}
        >
          <Text className="text-sm font-extrabold text-white">Go</Text>
        </TouchableOpacity>
      </View>

      <View className="mb-3 flex-row items-center justify-between px-1">
        <TouchableOpacity
          onPress={onToggleFilters}
          activeOpacity={0.88}
          className="rounded-full bg-surface-container-low px-5 py-3"
        >
          <View className="relative w-full flex-row items-center justify-center">
            <View className="absolute left-0">
              <Icon name="tune-variant" size={18} color="#00152e" />
            </View>
            <Text className="flex-1 text-center text-sm font-extrabold text-primary">Filters</Text>
            {activeFilterCount > 0 ? (
              <View className="absolute right-0 h-5 w-5 items-center justify-center rounded-full bg-secondary">
                <Text className="text-[10px] font-black text-white">{activeFilterCount}</Text>
              </View>
            ) : null}
          </View>
        </TouchableOpacity>

        {activeFilterCount > 0 ? (
          <TouchableOpacity onPress={onClearFilters} activeOpacity={0.88} className="rounded-full px-3 py-2.5">
            <Text className="text-xs font-extrabold text-on-surface-muted">Clear</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
      </View>
    </View>
  );
}

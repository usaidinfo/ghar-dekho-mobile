/**
 * @file SearchBar.tsx
 * @description Home screen search bar with filter button.
 * API Integration: Pass `value` and `onChangeText` from a search results hook.
 * The `onFilterPress` callback should open the filter bottom sheet.
 */

import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onFilterPress,
  placeholder = 'Search properties...',
}) => {
  return (
    <View className="px-6 py-6">
      <View className="flex-row items-center bg-white border border-outline rounded-full shadow-sm px-4 h-14">
        {/* Search Icon */}
        <Icon name="search" size={22} color="#c4c6ce" />

        {/* Text Input */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#777779"
          className="flex-1 text-dark text-sm font-medium mx-3"
          returnKeyType="search"
          autoCorrect={false}
        />

        {/* Filter Button */}
        <TouchableOpacity
          onPress={onFilterPress}
          activeOpacity={0.8}
          className="w-10 h-10 bg-primary rounded-full items-center justify-center"
          style={{ shadowColor: '#122A47', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}
        >
          <Icon name="tune" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SearchBar;

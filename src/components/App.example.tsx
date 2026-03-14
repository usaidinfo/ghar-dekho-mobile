import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
// NativeWind styles are automatically available via className prop
// Note: SafeAreaProvider and GestureHandlerRootView are already in App.jsx

export default function AppExample() {
  return (
    <View className="flex-1 bg-black items-center justify-center px-4">

      {/* Heading with custom heading-1 class from tailwind.config */}
      <Text className="text-heading-1 text-blue-500 mb-4 text-center">
        Welcome to React Native
      </Text>

      {/* Subtitle with custom subheading class */}
      <Text className="text-subheading text-subheading-default mb-8 text-center">
        NativeWind Template with TypeScript
      </Text>

      {/* Example button with NativeWind styling */}
      <TouchableOpacity
        className="bg-primary px-6 py-3 rounded-lg shadow-md active:opacity-75"
        onPress={() => console.log('Button pressed!')}
      >
        <Text className="text-white text-heading-4 font-semibold">
          Get Started
        </Text>
      </TouchableOpacity>

      {/* Example card with NativeWind */}
      <View className="mt-8 bg-gray-50 p-4 rounded-xl w-full max-w-sm">
        <Text className="text-heading-3 text-heading-default mb-2">
          NativeWind Features:
        </Text>
        <Text className="text-subheading text-subheading-default">
          • Tailwind CSS classes{'\n'}
          • Custom colors & typography{'\n'}
          • Responsive design{'\n'}
          • Dark mode ready
        </Text>
      </View>

    </View>
  );
}

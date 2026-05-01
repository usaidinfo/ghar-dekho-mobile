import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyVisitsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-lg font-extrabold text-primary">My Visits</Text>
        <Text className="mt-2 text-center text-sm font-medium text-on-surface-variant">
          Coming next: list of scheduled visits from /api/meetings.
        </Text>
      </View>
    </SafeAreaView>
  );
}


import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, StatusBar } from 'react-native';
import AppExample from './src/components/App.example';

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" />
          <AppExample />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
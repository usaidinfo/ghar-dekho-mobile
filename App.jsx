import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import MainNavigator from './src/navigation/MainNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <KeyboardProvider preload={false}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar barStyle="dark-content" />
          <BottomSheetModalProvider>
            <PaperProvider theme={MD3LightTheme}>
              <NavigationContainer>
                <MainNavigator />
              </NavigationContainer>
            </PaperProvider>
          </BottomSheetModalProvider>
          <Toast />
        </GestureHandlerRootView>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}

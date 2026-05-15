import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { MD3DarkTheme, MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';
import MainNavigator from './src/navigation/MainNavigator';

export default function App() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const paperTheme = isDark ? MD3DarkTheme : MD3LightTheme;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <BottomSheetModalProvider>
          <PaperProvider theme={paperTheme}>
            <NavigationContainer>
              <MainNavigator />
            </NavigationContainer>
          </PaperProvider>
        </BottomSheetModalProvider>
        <Toast />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

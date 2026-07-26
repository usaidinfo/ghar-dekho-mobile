import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthStore } from '../stores/auth.store';

import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

import BottomTabNavigator from './BottomTabNavigator';
import PropertyDetailScreen from '../screens/main/PropertyDetailScreen';
import SearchResultsScreen from '../screens/main/SearchResultsScreen';
import MyListingsScreen from '../screens/main/MyListingsScreen';
import WishlistScreen from '../screens/main/WishlistScreen';
import ChatInboxScreen from '../screens/main/ChatInboxScreen';
import ChatThreadScreen from '../screens/main/ChatThreadScreen';
import PostPropertyScreen from '../screens/main/PostPropertyScreen';
import MyVisitsScreen from '../screens/main/MyVisitsScreen';
import VisitScheduledScreen from '../screens/main/VisitScheduledScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import CalculatorsScreen from '../screens/main/CalculatorsScreen';
import PriceAlertsScreen from '../screens/main/PriceAlertsScreen';
import SellerAnalyticsScreen from '../screens/main/SellerAnalyticsScreen';
import RentalsScreen from '../screens/main/RentalsScreen';
import AgentNavigator from './AgentNavigator';

import type { MainStackParamList, AuthStackParamList } from './types';

const Placeholder: React.FC<{ label: string }> = ({ label }) => (
  <View className="flex-1 items-center justify-center bg-surface">
    <Text className="text-neutral">{label} — Coming Soon</Text>
  </View>
);

const ProjectDetailScreen = () => <Placeholder label="Project Detail" />;
const AdvisorAIScreen = () => <Placeholder label="Ghar Advisor AI" />;
const NeighborhoodDetailScreen = () => <Placeholder label="Neighborhood Detail" />;
const NotificationsScreen = () => <Placeholder label="Notifications" />;

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<MainStackParamList>();

/**
 * Auth navigator — shown when the user is NOT logged in.
 * Login is the entry point; Signup is reachable from within Login.
 */
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen
        name="Signup"
        component={SignupScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </AuthStack.Navigator>
  );
}

/**
 * App navigator — shown when the user IS logged in.
 * Always starts at Tabs (Home).
 */
function AppNavigator() {
  return (
    <AppStack.Navigator
      initialRouteName="Tabs"
      screenOptions={{ headerShown: false }}
    >
      <AppStack.Screen name="Tabs" component={BottomTabNavigator} />
      <AppStack.Screen name="PostProperty" component={PostPropertyScreen} />
      <AppStack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
      <AppStack.Screen name="MyVisits" component={MyVisitsScreen} />
      <AppStack.Screen name="VisitScheduled" component={VisitScheduledScreen} />
      <AppStack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <AppStack.Screen name="AdvisorAI" component={AdvisorAIScreen} />
      <AppStack.Screen name="SearchResults" component={SearchResultsScreen} />
      <AppStack.Screen name="MyListings" component={MyListingsScreen} />
      <AppStack.Screen name="Wishlist" component={WishlistScreen} />
      <AppStack.Screen name="Calculators" component={CalculatorsScreen} />
      <AppStack.Screen name="PriceAlerts" component={PriceAlertsScreen} />
      <AppStack.Screen name="SellerAnalytics" component={SellerAnalyticsScreen} />
      <AppStack.Screen name="Rentals" component={RentalsScreen} />
      <AppStack.Screen name="NeighborhoodDetail" component={NeighborhoodDetailScreen} />
      <AppStack.Screen name="ChatInbox" component={ChatInboxScreen} />
      <AppStack.Screen name="ChatThread" component={ChatThreadScreen} />
      <AppStack.Screen name="Notifications" component={NotificationsScreen} />
      <AppStack.Screen name="EditProfile" component={EditProfileScreen} />
      <AppStack.Screen
        name="AgentDashboard"
        component={AgentNavigator}
        options={{ animation: 'slide_from_right' }}
      />
    </AppStack.Navigator>
  );
}

/**
 * Root navigator.
 *
 * Flow:
 *  - Hydrating  → SplashScreen (branded loading)
 *  - Not logged in → AuthNavigator (Login → Signup)
 *  - Logged in  → AppNavigator  (Home + all app screens)
 *
 * React Navigation automatically transitions between stacks when
 * auth state changes — no manual navigation calls needed in screens.
 */
const MainNavigator: React.FC = () => {
  const user = useAuthStore(s => s.user);
  const hasHydrated = useAuthStore(s => s.hasHydrated);

  if (!hasHydrated) {
    return <SplashScreen />;
  }

  return user ? <AppNavigator /> : <AuthNavigator />;
};

export default MainNavigator;

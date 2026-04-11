/**
 * Main stack: bottom tabs as default (browse without login).
 * Login / Signup are stack screens so Profile and other entry points can open them.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import PropertyDetailScreen from '../screens/main/PropertyDetailScreen';
import type { MainStackParamList } from './types';

const Placeholder: React.FC<{ label: string }> = ({ label }) => (
  <View className="flex-1 items-center justify-center bg-surface">
    <Text className="text-neutral">{label} — Coming Soon</Text>
  </View>
);

const ProjectDetailScreen = () => <Placeholder label="Project Detail" />;
const AdvisorAIScreen = () => <Placeholder label="Ghar Advisor AI" />;
const SearchResultsScreen = () => <Placeholder label="Search Results" />;
const NeighborhoodDetailScreen = () => <Placeholder label="Neighborhood Detail" />;
const ChatScreen = () => <Placeholder label="Chat" />;
const NotificationsScreen = () => <Placeholder label="Notifications" />;
const EditProfileScreen = () => <Placeholder label="Edit Profile" />;

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName="Tabs"
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name="Tabs" component={BottomTabNavigator} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
    <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
    <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
    <Stack.Screen name="AdvisorAI" component={AdvisorAIScreen} />
    <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
    <Stack.Screen name="NeighborhoodDetail" component={NeighborhoodDetailScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
  </Stack.Navigator>
);

export default MainNavigator;

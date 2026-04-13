
import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import PropertyDetailScreen from '../screens/main/PropertyDetailScreen';
import SearchResultsScreen from '../screens/main/SearchResultsScreen';
import MyListingsScreen from '../screens/main/MyListingsScreen';
import WishlistScreen from '../screens/main/WishlistScreen';
import ChatInboxScreen from '../screens/main/ChatInboxScreen';
import ChatThreadScreen from '../screens/main/ChatThreadScreen';
import PostPropertyScreen from '../screens/main/PostPropertyScreen';
import type { MainStackParamList } from './types';

const Placeholder: React.FC<{ label: string }> = ({ label }) => (
  <View className="flex-1 items-center justify-center bg-surface">
    <Text className="text-neutral">{label} — Coming Soon</Text>
  </View>
);

const ProjectDetailScreen = () => <Placeholder label="Project Detail" />;
const AdvisorAIScreen = () => <Placeholder label="Ghar Advisor AI" />;
const NeighborhoodDetailScreen = () => <Placeholder label="Neighborhood Detail" />;
const NotificationsScreen = () => <Placeholder label="Notifications" />;
const EditProfileScreen = () => <Placeholder label="Edit Profile" />;

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName="Tabs"
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name="Tabs" component={BottomTabNavigator} />
    <Stack.Screen name="PostProperty" component={PostPropertyScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
    <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
    <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
    <Stack.Screen name="AdvisorAI" component={AdvisorAIScreen} />
    <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
    <Stack.Screen name="MyListings" component={MyListingsScreen} />
    <Stack.Screen name="Wishlist" component={WishlistScreen} />
    <Stack.Screen name="NeighborhoodDetail" component={NeighborhoodDetailScreen} />
    <Stack.Screen name="ChatInbox" component={ChatInboxScreen} />
    <Stack.Screen name="ChatThread" component={ChatThreadScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
  </Stack.Navigator>
);

export default MainNavigator;

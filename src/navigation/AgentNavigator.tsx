/**
 * Agent Navigator — full-screen agent dashboard mode.
 * Entered from ProfileScreen → "Agent Dashboard" button.
 * Has its own stack (for detail screens) wrapping a bottom tab navigator.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { AgentStackParamList } from './types';
import AgentTabNavigator from './AgentTabNavigator';
import AgentLeadDetailScreen from '../screens/agent/AgentLeadDetailScreen';
import AgentListingPerformanceScreen from '../screens/agent/AgentListingPerformanceScreen';
import AgentTeamScreen from '../screens/agent/AgentTeamScreen';
import AgentAgencyProfileScreen from '../screens/agent/AgentAgencyProfileScreen';

const Stack = createNativeStackNavigator<AgentStackParamList>();

const AgentNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AgentTabs" component={AgentTabNavigator} />
    <Stack.Screen
      name="AgentLeadDetail"
      component={AgentLeadDetailScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="AgentListingPerformance"
      component={AgentListingPerformanceScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="AgentTeam"
      component={AgentTeamScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen
      name="AgentAgencyProfile"
      component={AgentAgencyProfileScreen}
      options={{ animation: 'slide_from_right' }}
    />
  </Stack.Navigator>
);

export default AgentNavigator;

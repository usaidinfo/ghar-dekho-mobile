/**
 * AgentTabNavigator — 5-tab bottom bar for the Agent Dashboard.
 * Dashboard | Leads | Listings | Analytics | More
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import type { AgentTabParamList } from './types';

import AgentDashboardScreen from '../screens/agent/AgentDashboardScreen';
import AgentLeadsScreen from '../screens/agent/AgentLeadsScreen';
import AgentListingsScreen from '../screens/agent/AgentListingsScreen';
import AgentAnalyticsScreen from '../screens/agent/AgentAnalyticsScreen';
import AgentMoreScreen from '../screens/agent/AgentMoreScreen';

const NAVY = '#00152e';
const SECONDARY = '#7d5705';
const MUTED = 'rgba(68,71,77,0.55)';

interface AgentTabItem {
  name: keyof AgentTabParamList;
  icon: string;
  activeIcon: string;
  label: string;
}

const AGENT_TABS: AgentTabItem[] = [
  { name: 'AgentHome', icon: 'view-dashboard-outline', activeIcon: 'view-dashboard', label: 'Explore' },
  { name: 'AgentLeads', icon: 'inbox-outline', activeIcon: 'inbox', label: 'Leads' },
  { name: 'AgentListings', icon: 'office-building-outline', activeIcon: 'office-building', label: 'Listings' },
  { name: 'AgentAnalytics', icon: 'chart-line', activeIcon: 'chart-line', label: 'Analytics' },
  { name: 'AgentMore', icon: 'menu', activeIcon: 'menu', label: 'More' },
];

const CustomAgentTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <View style={[styles.tabBar, { paddingBottom: bottomPad }]}>
      {AGENT_TABS.map((tab, idx) => {
        const routeIdx = state.routes.findIndex(r => r.name === tab.name);
        const isFocused = routeIdx >= 0 && state.index === routeIdx;

        const onPress = () => {
          const key = state.routes[routeIdx]?.key;
          if (!key) return;
          const event = navigation.emit({
            type: 'tabPress',
            target: key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(tab.name);
          }
        };

        return (
          <TouchableOpacity
            key={`agent-tab-${idx}`}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
          >
            {isFocused ? (
              <View style={styles.activeChip}>
                <Icon name={tab.activeIcon} size={18} color="#fff" />
                <Text style={styles.activeLabel}>{tab.label}</Text>
              </View>
            ) : (
              <>
                <Icon name={tab.icon} size={22} color={MUTED} />
                <Text style={styles.inactiveLabel}>{tab.label}</Text>
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const Tab = createBottomTabNavigator<AgentTabParamList>();

const AgentTabNavigator: React.FC = () => (
  <Tab.Navigator
    tabBar={props => <CustomAgentTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="AgentHome" component={AgentDashboardScreen} />
    <Tab.Screen name="AgentLeads" component={AgentLeadsScreen} />
    <Tab.Screen name="AgentListings" component={AgentListingsScreen} />
    <Tab.Screen name="AgentAnalytics" component={AgentAnalyticsScreen} />
    <Tab.Screen name="AgentMore" component={AgentMoreScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(245,243,246,0.97)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#c4c6ce',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingHorizontal: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#1b1c1e',
        shadowOpacity: 0.07,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: -3 },
      },
      android: { elevation: 10 },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minHeight: 48,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: NAVY,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  activeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
  },
  inactiveLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: MUTED,
    letterSpacing: 0.3,
  },
});

export default AgentTabNavigator;

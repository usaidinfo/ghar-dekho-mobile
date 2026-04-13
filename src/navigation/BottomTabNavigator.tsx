/**
 * @file BottomTabNavigator.tsx
 * @description Compact bottom tabs — center Post opens stack `PostProperty` (no tab bar).
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import type { BottomTabParamList } from './types';

const NAVY = '#122A47';
const SECONDARY = '#D1A14E';
const MUTED = 'rgba(119,119,121,0.72)';

const Placeholder: React.FC<{ label: string }> = ({ label }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#faf9fc' }}>
    <Text style={{ color: '#777779', fontSize: 15 }}>{label} — Coming Soon</Text>
  </View>
);

const MembershipScreen = () => <Placeholder label="Membership" />;
const HistoryScreen = () => <Placeholder label="History" />;

type TabName = keyof BottomTabParamList;

interface TabItem {
  name: TabName;
  icon: string;
  activeIcon: string;
  label: string;
  isCenter?: boolean;
}

/** Visual order: two tabs — FAB — two tabs (Post is not a tab route). */
const TAB_ITEMS: TabItem[] = [
  { name: 'Home', icon: 'home-outline', activeIcon: 'home', label: 'HOME' },
  { name: 'Membership', icon: 'crown-outline', activeIcon: 'crown', label: 'MEMBERSHIP' },
  { name: 'Home', icon: 'plus-circle-outline', activeIcon: 'plus-circle', label: 'POST', isCenter: true },
  { name: 'History', icon: 'history', activeIcon: 'history', label: 'HISTORY' },
  { name: 'Profile', icon: 'account-outline', activeIcon: 'account', label: 'PROFILE' },
];

const ACTIVE_SIZE = 44;
const ICON_INACTIVE = 22;
const ICON_ACTIVE = 20;
const FAB_SIZE = 50;
const RING_WIDTH = 4;
const FAB_FLOAT_Y = -(FAB_SIZE / 2 - 8);

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 4);
  const stackNav = navigation.getParent();

  return (
    <View style={styles.tabBarRoot}>
      <View style={[styles.tabBar, { paddingBottom: bottomPad }]}>
        {TAB_ITEMS.map((tab, index) => {
          if (tab.isCenter) {
            return (
              <View key="post-fab" style={styles.centerWrap} pointerEvents="box-none">
                <TouchableOpacity
                  onPress={() => stackNav?.navigate('PostProperty' as never)}
                  activeOpacity={0.88}
                  style={[styles.fabHit, { transform: [{ translateY: FAB_FLOAT_Y }] }]}
                  accessibilityRole="button"
                  accessibilityLabel="Post property"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <View style={styles.fabRing}>
                    <View style={styles.fabCore}>
                      <Icon name="plus" size={28} color={NAVY} />
                    </View>
                  </View>
                </TouchableOpacity>
                <Text style={styles.fabLabel}>{tab.label}</Text>
              </View>
            );
          }

          const routeIndex = state.routes.findIndex(r => r.name === tab.name);
          const isFocused = routeIndex >= 0 && state.index === routeIndex;

          const onPress = () => {
            const key = state.routes[routeIndex]?.key;
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
              key={`${tab.name}-${index}`}
              style={styles.tabItem}
              onPress={onPress}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
            >
              {isFocused ? (
                <View style={styles.activeCircle}>
                  <Icon name={tab.activeIcon} size={ICON_ACTIVE} color="#ffffff" />
                </View>
              ) : (
                <>
                  <Icon name={tab.icon} size={ICON_INACTIVE} color={MUTED} />
                  <Text style={styles.tabLabel}>{tab.label}</Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomTabNavigator: React.FC = () => (
  <Tab.Navigator tabBar={props => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Membership" component={MembershipScreen} />
    <Tab.Screen name="History" component={HistoryScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBarRoot: {
    overflow: 'visible',
    zIndex: 100,
    elevation: 20,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(250,249,252,0.98)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C4C6CE',
    paddingTop: 2,
    paddingHorizontal: 2,
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#1b1c1e',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -2 },
      },
      android: { elevation: 8 },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 2,
    paddingTop: 2,
    minHeight: 40,
    gap: 2,
  },
  activeCircle: {
    width: ACTIVE_SIZE,
    height: ACTIVE_SIZE,
    borderRadius: 999,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  tabLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: MUTED,
    letterSpacing: 0.5,
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 0,
    overflow: 'visible',
  },
  fabHit: {
    marginBottom: 2,
    borderRadius: 999,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 14 },
    }),
  },
  fabRing: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: SECONDARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabCore: {
    width: FAB_SIZE - RING_WIDTH * 2,
    height: FAB_SIZE - RING_WIDTH * 2,
    borderRadius: (FAB_SIZE - RING_WIDTH * 2) / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: MUTED,
    letterSpacing: 0.5,
    marginTop: 0,
  },
});

export default BottomTabNavigator;

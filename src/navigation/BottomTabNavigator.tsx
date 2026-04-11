/**
 * @file BottomTabNavigator.tsx
 * @description Custom bottom tab bar for GharDekho.
 *
 * Tab structure: Home | Membership | [Post FAB] | History | Profile
 *
 * Active Home tab: filled navy circle (pill style) with white icon, no label.
 * Other tabs: outlined icon + uppercase label.
 * Post: elevated gold FAB with "POST" label below.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import type { BottomTabParamList } from './types';

// ─── Placeholder Screens ──────────────────────────────────────────────────────

const Placeholder: React.FC<{ label: string }> = ({ label }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#faf9fc' }}>
    <Text style={{ color: '#777779', fontSize: 15 }}>{label} — Coming Soon</Text>
  </View>
);

const MembershipScreen = () => <Placeholder label="Membership" />;
const PostScreen = () => <Placeholder label="Post Property" />;
const HistoryScreen = () => <Placeholder label="History" />;

// ─── Tab Config ───────────────────────────────────────────────────────────────

interface TabItem {
  name: keyof BottomTabParamList;
  icon: string;           // inactive icon name (MaterialCommunityIcons)
  activeIcon: string;     // active icon name
  label: string;
  isCenter?: boolean;
  isHome?: boolean;
}

const TAB_ITEMS: TabItem[] = [
  { name: 'Home', icon: 'home-outline', activeIcon: 'home', label: 'HOME', isHome: true },
  { name: 'Membership', icon: 'crown-outline', activeIcon: 'crown', label: 'MEMBERSHIP' },
  { name: 'Post', icon: 'plus-circle-outline', activeIcon: 'plus-circle', label: 'POST', isCenter: true },
  { name: 'History', icon: 'history', activeIcon: 'history', label: 'HISTORY' },
  { name: 'Profile', icon: 'account-outline', activeIcon: 'account', label: 'PROFILE' },
];

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 14);

  return (
    <View style={[styles.tabBar, { paddingBottom: bottomPad }]}>
      {TAB_ITEMS.map((tab, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: state.routes[index]?.key ?? '',
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(tab.name);
          }
        };

        // ── Center FAB (Post) ──
        if (tab.isCenter) {
          return (
            <View key={tab.name} style={styles.centerWrap}>
              <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.85}>
                <Icon name="plus" size={28} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.fabLabel}>{tab.label}</Text>
            </View>
          );
        }

        // ── Home Tab (filled circle when active, icon+label when inactive) ──
        if (tab.isHome) {
          return (
            <TouchableOpacity key={tab.name} style={styles.tabItem} onPress={onPress} activeOpacity={0.7}>
              {isFocused ? (
                <View style={styles.homeActivePill}>
                  <Icon name={tab.activeIcon} size={22} color="#ffffff" />
                </View>
              ) : (
                <>
                  <Icon name={tab.icon} size={22} color="rgba(119,119,121,0.7)" />
                  <Text style={styles.tabLabel}>{tab.label}</Text>
                </>
              )}
            </TouchableOpacity>
          );
        }

        // ── Regular Tab ──
        return (
          <TouchableOpacity key={tab.name} style={styles.tabItem} onPress={onPress} activeOpacity={0.7}>
            <Icon
              name={isFocused ? tab.activeIcon : tab.icon}
              size={22}
              color={isFocused ? '#122A47' : 'rgba(119,119,121,0.7)'}
            />
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── Navigator ────────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomTabNavigator: React.FC = () => (
  <Tab.Navigator
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Membership" component={MembershipScreen} />
    <Tab.Screen name="Post" component={PostScreen} />
    <Tab.Screen name="History" component={HistoryScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(250,249,252,0.92)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C4C6CE',
    paddingTop: 12,
    paddingHorizontal: 6,
    shadowColor: '#1b1c1e',
    shadowOpacity: 0.07,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -4 },
    elevation: 18,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingBottom: 2,
  },
  tabLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: 'rgba(119,119,121,0.7)',
    letterSpacing: 0.8,
  },
  tabLabelActive: {
    color: '#122A47',
  },
  // Home active: filled navy pill
  homeActivePill: {
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: '#122A47',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  // Center FAB: gold, elevated
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 999,
    backgroundColor: '#D1A14E',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -16 }],
    shadowColor: '#D1A14E',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 14,
  },
  fabLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#122A47',
    letterSpacing: 0.8,
    marginTop: -10,
  },
});

export default BottomTabNavigator;

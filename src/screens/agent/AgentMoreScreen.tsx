/**
 * AgentMoreScreen — Agency card, menu sections (Agency Ops, Growth Tools, Support),
 * Switch to Buyer Mode, and Sign Out.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { fetchAgencyProfile, fetchAgentTeam, saveAgencyProfile } from '../../services/agent.service';
import { useAuthStore } from '../../stores/auth.store';
import type { AgencyProfile } from '../../types/agent.types';
import type { AgentTabParamList, AgentStackParamList } from '../../navigation/types';
import { useInstantInterstitialAd } from '../../hooks/useInstantInterstitialAd';
import { navigateToMembership } from '../../utils/navigateToMembership';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<AgentTabParamList, 'AgentMore'>,
  NativeStackNavigationProp<AgentStackParamList>
>;

const NAVY = '#00152e';
const NAVY_CON = '#122a47';
const SECONDARY = '#7d5705';
const SEC_CON = '#fec972';
const ON_SEC_CON = '#785300';
const SURFACE = '#faf9fc';
const SURF_LOW = '#f5f3f6';
const SURF_LOWEST = '#ffffff';
const SURF_HIGH = '#e9e7ea';
const SURF_HIGHEST = '#e3e2e5';
const ON_SURFACE = '#1b1c1e';
const ON_SURF_VAR = '#44474d';
const ERROR = '#ba1a1a';
const TEAL = '#509d9b';
const TEAL_CON = '#002f2f';

const StarRow: React.FC<{ rating: number }> = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[...Array(full)].map((_, i) => (
        <Icon key={i} name="star" size={14} color={SECONDARY} />
      ))}
      {half && <Icon name="star-half-full" size={14} color={SECONDARY} />}
    </View>
  );
};

interface MenuItemProps {
  icon: string;
  label: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  isLast?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  subtitle,
  badge,
  badgeColor = TEAL_CON,
  rightElement,
  onPress,
  isLast,
}) => (
  <TouchableOpacity
    style={[styles.menuItem, !isLast && styles.menuItemBorder]}
    activeOpacity={0.75}
    onPress={onPress}
  >
    <Icon name={icon} size={22} color={ON_SURF_VAR} style={styles.menuIcon} />
    <View style={styles.menuText}>
      <Text style={styles.menuLabel}>{label}</Text>
      {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    </View>
    {badge && (
      <View style={[styles.menuBadge, { backgroundColor: badgeColor }]}>
        <Text style={[styles.menuBadgeText, { color: TEAL }]}>{badge}</Text>
      </View>
    )}
    {rightElement ?? <Icon name="chevron-right" size={18} color="#c4c6ce" />}
  </TouchableOpacity>
);

const AgentMoreScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const logout = useAuthStore(s => s.logout);
  const { show: showModeSwitchAd } = useInstantInterstitialAd();

  const [profile, setProfile] = useState<AgencyProfile | null>(null);
  const [autoFollowUp, setAutoFollowUp] = useState(true);
  const [teamCount, setTeamCount] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, team] = await Promise.all([
        fetchAgencyProfile(),
        fetchAgentTeam().catch(() => null),
      ]);
      setProfile(p);
      setAutoFollowUp(p.autoFollowUp);
      if (team) setTeamCount(team.summary.totalMembers);
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try { await logout(); } finally { setLoggingOut(false); }
        },
      },
    ]);
  };

  const tabBarH = Math.max(insets.bottom, 8) + 64;

  const goToTeam = () => {
    const parent = navigation.getParent<NativeStackNavigationProp<AgentStackParamList>>();
    parent?.navigate('AgentTeam');
  };

  const goToAgencyProfile = () => {
    const parent = navigation.getParent<NativeStackNavigationProp<AgentStackParamList>>();
    parent?.navigate('AgentAgencyProfile');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Icon name="account" size={18} color={NAVY} />
          </View>
          <Text style={styles.brandText}>GHAR DEKHO INDIA</Text>
        </View>
        <TouchableOpacity activeOpacity={0.75}>
          <Icon name="bell-outline" size={22} color={NAVY} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarH + 16 }]}
      >
        {/* Agency Card */}
        {profile && (
          <View style={styles.agencyCard}>
            {/* Tier badge */}
            <View style={styles.tierBadge}>
              <Icon name="star" size={12} color="#fff" />
              <Text style={styles.tierBadgeText}>{profile.tier}</Text>
            </View>

            <View style={styles.agencyCardInner}>
              {/* Logo */}
              <View style={styles.agencyLogoWrap}>
                <Icon name="office-building" size={32} color={ON_SURF_VAR} />
              </View>
              <View style={styles.agencyInfo}>
                <View style={styles.agencyNameRow}>
                  <Text style={styles.agencyName}>{profile.agencyName}</Text>
                  <Icon name="check-decagram" size={14} color={SECONDARY} />
                </View>
                <Text style={styles.reraId}>RERA ID: {profile.reraId}</Text>
                <View style={styles.ratingRow}>
                  <StarRow rating={profile.rating} />
                  <Text style={styles.ratingValue}>{profile.rating}</Text>
                  <Text style={styles.reviewCount}>({profile.reviewCount} reviews)</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.editBadge} onPress={goToAgencyProfile} activeOpacity={0.8}>
                <Icon name="pencil-outline" size={18} color="#b1c8ec" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Agency Operations */}
        <Text style={styles.groupLabel}>AGENCY OPERATIONS</Text>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="office-building-outline"
            label="Agency Profile"
            onPress={goToAgencyProfile}
          />
          <MenuItem
            icon="account-group-outline"
            label="Team Members"
            subtitle={
              teamCount > 0
                ? `${teamCount} Agent${teamCount === 1 ? '' : 's'} Active`
                : 'Manage your team'
            }
            onPress={goToTeam}
            isLast
          />
        </View>

        {/* Growth & Tools */}
        <Text style={styles.groupLabel}>GROWTH & TOOLS</Text>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="lightning-bolt-outline"
            label="Boost Credits"
            subtitle={`${profile?.boostCredits ?? 0} Credits Available`}
            onPress={() => {
              Alert.alert(
                'Boost credits',
                `You have ${profile?.boostCredits ?? 0} boost credit(s) this month.\n\nOpen a listing’s performance screen or My Listings to spend a credit.`,
                [
                  { text: 'OK', style: 'cancel' },
                  {
                    text: 'My Listings',
                    onPress: () => {
                      const root = navigation.getParent()?.getParent();
                      root?.navigate('MyListings' as never);
                    },
                  },
                ],
              );
            }}
          />
          <MenuItem
            icon="card-account-details-outline"
            label="Membership"
            badge={profile?.membershipLabel}
            badgeColor={TEAL_CON}
            onPress={() => navigateToMembership(navigation)}
          />
          <MenuItem
            icon="robot-outline"
            label="Auto Follow-up"
            subtitle="Smart AI Active"
            rightElement={
              <Switch
                value={autoFollowUp}
                onValueChange={async next => {
                  setAutoFollowUp(next);
                  try {
                    await saveAgencyProfile({ autoFollowUp: next });
                  } catch {
                    setAutoFollowUp(!next);
                  }
                }}
                trackColor={{ false: SURF_HIGHEST, true: TEAL_CON }}
                thumbColor={autoFollowUp ? TEAL : '#fff'}
              />
            }
            isLast
          />
        </View>

        {/* Support */}
        <Text style={styles.groupLabel}>SUPPORT</Text>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="help-circle-outline"
            label="Help Center"
            isLast
          />
        </View>

        {/* Switch to Buyer Mode */}
        <TouchableOpacity
          style={styles.switchBtn}
          activeOpacity={0.85}
          onPress={() => {
            // Switching modes shows an interstitial every time — uncapped by
            // design, skipped automatically for premium members.
            showModeSwitchAd();
            // Navigate back to the main app (buyer mode)
            const agentStack = navigation.getParent<NativeStackNavigationProp<AgentStackParamList>>();
            agentStack?.getParent()?.goBack();
          }}
        >
          <Icon name="swap-horizontal-circle-outline" size={20} color="#b1c8ec" />
          <Text style={styles.switchBtnText}>Switch to Buyer Mode</Text>
        </TouchableOpacity>
        <Text style={styles.switchNote}>
          You can toggle between your Professional and Personal portfolios at any time.
        </Text>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} activeOpacity={0.75} onPress={handleLogout}>
          <Icon name="logout" size={18} color={ERROR} />
          <Text style={styles.signOutText}>{loggingOut ? 'Signing out…' : 'Sign Out'}</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>GHAR DEKHO INDIA V4.8.2 (ELITE TIER)</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: SURFACE },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: SURF_HIGH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { fontSize: 15, fontWeight: '900', color: NAVY, letterSpacing: 1.5 },
  scroll: { paddingTop: 4 },

  agencyCard: {
    marginHorizontal: 14,
    backgroundColor: SURF_LOW,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    position: 'relative',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  tierBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: SECONDARY,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tierBadgeText: { fontSize: 9, fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: 1 },
  agencyCardInner: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  agencyLogoWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: SURF_LOWEST,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
      android: { elevation: 1 },
    }),
  },
  agencyInfo: { flex: 1 },
  agencyNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  agencyName: { fontSize: 16, fontWeight: '800', color: NAVY },
  reraId: { fontSize: 10, fontWeight: '600', color: ON_SURF_VAR, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingValue: { fontSize: 16, fontWeight: '800', color: ON_SURFACE },
  reviewCount: { fontSize: 11, color: '#74777e' },
  editBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: NAVY_CON,
    alignItems: 'center',
    justifyContent: 'center',
  },

  groupLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: ON_SURF_VAR,
    textTransform: 'uppercase',
    letterSpacing: 2,
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 4,
  },
  menuGroup: {
    marginHorizontal: 14,
    backgroundColor: SURF_LOWEST,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
      android: { elevation: 1 },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
  },
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(196,198,206,0.25)',
  },
  menuIcon: { flexShrink: 0 },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '600', color: ON_SURFACE },
  menuSubtitle: { fontSize: 11, color: '#74777e', marginTop: 2 },
  menuBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  menuBadgeText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },

  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 14,
    backgroundColor: NAVY_CON,
    borderRadius: 999,
    paddingVertical: 14,
    marginBottom: 10,
  },
  switchBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  switchNote: {
    fontSize: 11,
    color: '#74777e',
    textAlign: 'center',
    paddingHorizontal: 32,
    fontStyle: 'italic',
    lineHeight: 16,
    marginBottom: 24,
  },

  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(186,26,26,0.06)',
    marginBottom: 16,
  },
  signOutText: { fontSize: 14, fontWeight: '700', color: ERROR },
  versionText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(68,71,77,0.35)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default AgentMoreScreen;

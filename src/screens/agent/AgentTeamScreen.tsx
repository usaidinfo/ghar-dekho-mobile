/**
 * AgentTeamScreen — List of team members with permissions badges,
 * quarterly performance bento card, and Invite Agent FAB.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { fetchAgentTeam } from '../../services/agent.service';
import type { AgentTeamMember } from '../../types/agent.types';
import type { AgentStackParamList } from '../../navigation/types';
import { navigateToMembership } from '../../utils/navigateToMembership';

const NAVY = '#00152e';
const NAVY_CON = '#122a47';
const SECONDARY = '#7d5705';
const SEC_CON = '#fec972';
const ON_SEC_CON = '#785300';
const SURFACE = '#faf9fc';
const SURF_LOW = '#f5f3f6';
const SURF_HIGH = '#e9e7ea';
const SURF_HIGHEST = '#e3e2e5';
const ON_SURFACE = '#1b1c1e';
const ON_SURF_VAR = '#44474d';
const TEAL = '#509d9b';
const TEAL_CON = '#002f2f';

const PERMISSION_COLORS: Record<string, { bg: string; text: string }> = {
  ADMIN: { bg: '#d4e3ff', text: NAVY_CON },
  BILLING: { bg: TEAL_CON, text: TEAL },
  EDITOR: { bg: SURF_HIGHEST, text: ON_SURF_VAR },
  ANALYTICS: { bg: '#d4e3ff', text: NAVY_CON },
  VIEWER: { bg: SURF_HIGHEST, text: ON_SURF_VAR },
};

const TeamMemberCard: React.FC<{ member: AgentTeamMember }> = ({ member }) => (
  <View style={styles.memberCard}>
    <View style={styles.memberAvatarWrap}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberInitials}>{member.avatarInitials}</Text>
      </View>
    </View>

    <View style={styles.memberInfo}>
      <Text style={styles.memberName}>{member.name}</Text>
      <Text style={styles.memberRole}>{member.role.toUpperCase()}</Text>
    </View>

    <View style={styles.memberStats}>
      <View style={styles.statBlock}>
        <Text style={styles.statLabel}>ACTIVE LISTINGS</Text>
        <View style={styles.statValueRow}>
          <Icon name="office-building-outline" size={16} color={NAVY} />
          <Text style={styles.statValue}>{String(member.activeListings).padStart(2, '0')}</Text>
        </View>
      </View>

      <View style={styles.statBlock}>
        <Text style={styles.statLabel}>PERMISSIONS</Text>
        <View style={styles.permissionsRow}>
          {member.permissions.map(p => {
            const colors = PERMISSION_COLORS[p] ?? { bg: SURF_HIGHEST, text: ON_SURF_VAR };
            return (
              <View key={p} style={[styles.permBadge, { backgroundColor: colors.bg }]}>
                <Text style={[styles.permBadgeText, { color: colors.text }]}>
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <TouchableOpacity style={styles.moreBtn} activeOpacity={0.8}>
        <Icon name="dots-vertical" size={20} color={NAVY} />
      </TouchableOpacity>
    </View>
  </View>
);

const AgentTeamScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AgentStackParamList>>();
  const insets = useSafeAreaInsets();

  const [team, setTeam] = useState<AgentTeamMember[]>([]);
  const [totalListings, setTotalListings] = useState(0);
  const [tierLabel, setTierLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await fetchAgentTeam();
      setTeam(data.members);
      setTotalListings(data.summary.totalActiveListings);
      setTierLabel(data.summary.tierLabel);
    } catch {
      setTeam([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
            <Icon name="arrow-left" size={22} color={NAVY} />
          </TouchableOpacity>
          <Text style={styles.brandText}>GHAR DEKHO INDIA</Text>
        </View>
        <TouchableOpacity activeOpacity={0.75}>
          <Icon name="bell-outline" size={22} color={NAVY} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 80 }} color={NAVY} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 16) + 80 }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={NAVY} />
          }
        >
          {/* Title section */}
          <View style={styles.titleSection}>
            <Text style={styles.pageTitle}>Our Elite Team</Text>
            <Text style={styles.pageSub}>
              Manage your agency's professional network, track performance, and coordinate listing assignments.
            </Text>
            <View style={styles.countsRow}>
              <View style={styles.countChip}>
                <Text style={styles.countValue}>{team.length}</Text>
                <Text style={styles.countLabel}>Active Agents</Text>
              </View>
              <View style={styles.countChip}>
                <Text style={[styles.countValue, { color: SECONDARY }]}>{totalListings}</Text>
                <Text style={styles.countLabel}>Total Listings</Text>
              </View>
            </View>
          </View>

          {team.map(member => (
            <TeamMemberCard key={member.id} member={member} />
          ))}

          <View style={styles.bentoRow}>
            <View style={styles.quarterlyCard}>
              <Text style={styles.quarterlyTitle}>Team Snapshot</Text>
              <Text style={styles.quarterlyDesc}>
                {team.length} active member{team.length === 1 ? '' : 's'} managing {totalListings} listing
                {totalListings === 1 ? '' : 's'}.
              </Text>
              <View style={styles.quarterlyStats}>
                <View style={styles.quarterlyStat}>
                  <Text style={styles.quarterlyStatValue}>{team.length}</Text>
                  <Text style={styles.quarterlyStatLabel}>MEMBERS</Text>
                </View>
                <View style={styles.quarterlyStat}>
                  <Text style={styles.quarterlyStatValue}>{totalListings}</Text>
                  <Text style={styles.quarterlyStatLabel}>LISTINGS</Text>
                </View>
              </View>
            </View>

            <View style={styles.tierCard}>
              <Icon name="crown-outline" size={36} color={ON_SEC_CON} style={{ marginBottom: 8 }} />
              <Text style={styles.tierTitle}>Plan</Text>
              <Text style={styles.tierDesc}>
                {tierLabel ? `Currently on ${tierLabel}.` : 'Activate a membership to unlock team seats.'}
              </Text>
              <TouchableOpacity
                style={styles.upgradeBtn}
                activeOpacity={0.85}
                onPress={() => navigateToMembership(navigation)}
              >
                <Text style={styles.upgradeBtnText}>Upgrade Agency</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: Math.max(insets.bottom, 16) + 16 }]}
        activeOpacity={0.85}
      >
        <Icon name="account-plus-outline" size={20} color="#fff" />
        <Text style={styles.fabText}>Invite Agent</Text>
      </TouchableOpacity>
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
  backBtn: { padding: 4 },
  brandText: { fontSize: 15, fontWeight: '900', color: NAVY, letterSpacing: 1.5 },
  scroll: { paddingTop: 4 },

  titleSection: { paddingHorizontal: 20, marginBottom: 20 },
  pageTitle: { fontSize: 28, fontWeight: '900', color: NAVY, letterSpacing: -0.5, marginBottom: 6 },
  pageSub: { fontSize: 13, color: ON_SURF_VAR, lineHeight: 18, marginBottom: 14, maxWidth: '90%' },
  countsRow: { flexDirection: 'row', gap: 10 },
  countChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: SURF_LOW,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  countValue: { fontSize: 16, fontWeight: '900', color: NAVY },
  countLabel: { fontSize: 12, fontWeight: '500', color: ON_SURF_VAR },

  memberCard: {
    marginHorizontal: 14,
    backgroundColor: SURF_LOW,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
  },
  memberAvatarWrap: {},
  memberAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: SURF_HIGHEST,
    borderWidth: 2,
    borderColor: 'rgba(125,87,5,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitials: { fontSize: 20, fontWeight: '900', color: NAVY },
  memberInfo: { flex: 1, minWidth: 100 },
  memberName: { fontSize: 16, fontWeight: '800', color: ON_SURFACE, marginBottom: 2 },
  memberRole: { fontSize: 10, fontWeight: '700', color: SECONDARY, letterSpacing: 1 },
  memberStats: { flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  statBlock: { alignItems: 'flex-start', gap: 4 },
  statLabel: { fontSize: 8, fontWeight: '800', color: ON_SURF_VAR, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: { fontSize: 17, fontWeight: '900', color: NAVY },
  permissionsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  permBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  permBadgeText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  moreBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: SURF_HIGHEST,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bentoRow: { marginHorizontal: 14, flexDirection: 'row', gap: 12, marginTop: 16 },
  quarterlyCard: {
    flex: 2,
    backgroundColor: NAVY_CON,
    borderRadius: 20,
    padding: 20,
  },
  quarterlyTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 8 },
  quarterlyDesc: { fontSize: 12, color: 'rgba(177,200,236,0.8)', lineHeight: 18, marginBottom: 16 },
  quarterlyStats: { flexDirection: 'row', gap: 10 },
  quarterlyStat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
  },
  quarterlyStatValue: { fontSize: 22, fontWeight: '900', color: '#fff' },
  quarterlyStatLabel: { fontSize: 8, fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 },

  tierCard: {
    flex: 1,
    backgroundColor: SEC_CON,
    borderRadius: 20,
    padding: 18,
    justifyContent: 'space-between',
  },
  tierTitle: { fontSize: 16, fontWeight: '800', color: ON_SEC_CON, marginBottom: 6 },
  tierDesc: { fontSize: 11, color: ON_SEC_CON, lineHeight: 15, marginBottom: 14, opacity: 0.8 },
  upgradeBtn: {
    backgroundColor: SECONDARY,
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
  },
  upgradeBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  fab: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: SECONDARY,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 14,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 10 },
    }),
  },
  fabText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});

export default AgentTeamScreen;

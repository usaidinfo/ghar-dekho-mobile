/**
 * AgentDashboardScreen — Overview KPIs, sales pipeline, urgent follow-ups,
 * top-performing listings, and membership renewal strip.
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuthStore } from '../../stores/auth.store';
import { fetchAgentDashboard } from '../../services/agent.service';
import type { AgentDashboardData, AgentLead, AgentListing } from '../../types/agent.types';
import type { AgentTabParamList, AgentStackParamList } from '../../navigation/types';
import { navigateToMembership } from '../../utils/navigateToMembership';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<AgentTabParamList, 'AgentHome'>,
  NativeStackNavigationProp<AgentStackParamList>
>;

// ── Design tokens ──────────────────────────────────────────────────────────
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
const ERROR = '#ba1a1a';
const ERROR_CON = '#ffdad6';
const TEAL = '#509d9b';

// ── Sub-components ──────────────────────────────────────────────────────────

const KpiCard: React.FC<{
  label: string;
  value: string;
  sub: string;
  accent?: string;
  subColor?: string;
}> = ({ label, value, sub, accent = SURF_LOW, subColor = TEAL }) => (
  <View style={[styles.kpiCard, { backgroundColor: accent }]}>
    <Text style={styles.kpiLabel}>{label}</Text>
    <Text style={[styles.kpiValue, { color: accent === SEC_CON ? ON_SEC_CON : NAVY }]}>{value}</Text>
    <Text style={[styles.kpiSub, { color: subColor }]}>{sub}</Text>
  </View>
);

const PipelineStep: React.FC<{
  count: number;
  label: string;
  bgColor: string;
  textColor?: string;
}> = ({ count, label, bgColor, textColor = NAVY }) => (
  <View style={styles.pipelineStep}>
    <View style={[styles.pipelineBubble, { backgroundColor: bgColor }]}>
      <Text style={[styles.pipelineCount, { color: textColor }]}>{count}</Text>
    </View>
    <Text style={styles.pipelineLabel}>{label}</Text>
  </View>
);

const FollowUpCard: React.FC<{ lead: AgentLead; isOverdue?: boolean }> = ({
  lead,
  isOverdue,
}) => (
  <View style={styles.followupCard}>
    <View style={styles.followupAvatarWrap}>
      <View style={styles.followupAvatarBg}>
        <Text style={styles.followupInitials}>
          {lead.leadName
            .split(' ')
            .map(w => w[0])
            .join('')
            .slice(0, 2)}
        </Text>
      </View>
      {isOverdue && <View style={styles.urgentDot} />}
    </View>
    <View style={styles.followupInfo}>
      <Text style={styles.followupName}>{lead.leadName}</Text>
      <Text style={styles.followupProp} numberOfLines={1}>{lead.propertyTitle}</Text>
    </View>
    <View style={styles.followupActions}>
      <Text style={[styles.followupTime, { color: isOverdue ? ERROR : ON_SURF_VAR }]}>
        {isOverdue ? 'Overdue 2h' : 'Today, 3 PM'}
      </Text>
      <View style={styles.followupBtns}>
        <TouchableOpacity style={styles.followupBtnPrimary} activeOpacity={0.8}>
          <Icon name="phone" size={14} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.followupBtnSecondary} activeOpacity={0.8}>
          <Icon name="email-outline" size={14} color={NAVY} />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const TopListingCard: React.FC<{ listing: AgentListing; onCheckInsights: () => void }> = ({
  listing,
  onCheckInsights,
}) => (
  <View style={styles.topListingCard}>
    <View style={styles.topListingImgBg}>
      <View style={styles.viewsBadge}>
        <Text style={styles.viewsBadgeText}>
          {listing.views >= 1000 ? `${(listing.views / 1000).toFixed(1)}k` : listing.views} Views
        </Text>
      </View>
    </View>
    <View style={styles.topListingBody}>
      <Text style={styles.topListingTitle} numberOfLines={1}>{listing.title}</Text>
      <Text style={styles.topListingPrice}>{listing.price}</Text>
      <TouchableOpacity
        style={listing.isFeatured ? styles.boostBtn : styles.insightsBtn}
        activeOpacity={0.85}
        onPress={onCheckInsights}
      >
        <Icon
          name={listing.isFeatured ? 'lightning-bolt' : 'trending-up'}
          size={14}
          color={listing.isFeatured ? '#fff' : NAVY}
        />
        <Text style={listing.isFeatured ? styles.boostBtnText : styles.insightsBtnText}>
          {listing.isFeatured ? 'Boost Visibility' : 'Check Insights'}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ── Main screen ─────────────────────────────────────────────────────────────
const AgentDashboardScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const user = useAuthStore(s => s.user);

  const [data, setData] = useState<AgentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const d = await fetchAgentDashboard();
      setData(d);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const displayName = user?.profile
    ? [user.profile.firstName].filter(Boolean).join(' ') || 'Agent'
    : 'Agent';

  const tabBarH = Math.max(insets.bottom, 8) + 64;

  if (loading) {
    return (
      <SafeAreaView style={styles.loadWrap} edges={['top']}>
        <ActivityIndicator size="large" color={NAVY} />
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.loadWrap} edges={['top']}>
        <Text style={{ color: ON_SURF_VAR, textAlign: 'center', paddingHorizontal: 24 }}>
          Unable to load agent dashboard. Pull to retry from another tab, or check your connection.
        </Text>
        <TouchableOpacity onPress={() => load()} style={{ marginTop: 16 }} activeOpacity={0.8}>
          <Text style={{ color: NAVY, fontWeight: '700' }}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const d = data;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Icon name="account" size={20} color={NAVY} />
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.headerGreeting}>Good morning, {displayName}</Text>
              <Icon name="check-decagram" size={14} color={SECONDARY} />
            </View>
            <Text style={styles.tierLabel}>{d.tierLabel}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notifBtn} activeOpacity={0.75}>
          <Icon name="bell-outline" size={22} color={ON_SURF_VAR} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarH + 8 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={NAVY} />
        }
      >
        {/* Mode Switcher + Quick Actions */}
        <View style={styles.switcherRow}>
          <View style={styles.modeToggle}>
            <Text style={styles.modeBuyer}>Buyer Mode</Text>
            <View style={styles.modeAgentChip}>
              <Text style={styles.modeAgentText}>Agent Mode</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsRow}
          style={styles.quickActionsScroll}
        >
          {[
            { icon: 'plus-box-outline', label: 'ADD LISTING' },
            { icon: 'account-plus-outline', label: 'NEW LEAD' },
            { icon: 'calendar-today', label: 'SCHEDULE VISIT' },
            { icon: 'share-variant-outline', label: 'PORTFOLIO' },
          ].map(a => (
            <TouchableOpacity key={a.label} style={styles.quickAction} activeOpacity={0.8}>
              <View style={[styles.qaIcon, a.label === 'ADD LISTING' && styles.qaIconPrimary]}>
                <Icon name={a.icon} size={22} color={a.label === 'ADD LISTING' ? '#b1c8ec' : NAVY} />
              </View>
              <Text style={styles.qaLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          <KpiCard
            label="ACTIVE LISTINGS"
            value={String(d.kpi.activeListings)}
            sub={`▲ +${d.kpi.activeListingsChange} this month`}
            accent={SURF_LOW}
          />
          <KpiCard
            label="NEW LEADS TODAY"
            value={String(d.kpi.newLeadsToday)}
            sub={d.kpi.newLeadsPriority}
            accent={SEC_CON}
            subColor={ON_SEC_CON}
          />
          <KpiCard
            label="VISITS THIS WEEK"
            value={String(d.kpi.visitsThisWeek)}
            sub={d.kpi.visitsNote}
            accent={SURF_LOW}
            subColor={ON_SURF_VAR}
          />
          <KpiCard
            label="CONVERSION RATE"
            value={`${d.kpi.conversionRate}%`}
            sub=""
            accent={SURF_LOW}
          />
        </View>

        {/* Sales Pipeline */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sales Pipeline</Text>
          <TouchableOpacity style={styles.sectionLink} activeOpacity={0.7}>
            <Text style={styles.sectionLinkText}>Full Report</Text>
            <Icon name="arrow-right" size={14} color={SECONDARY} />
          </TouchableOpacity>
        </View>
        <View style={styles.pipelineCard}>
          <PipelineStep count={d.pipeline.new} label="New" bgColor="#d4e3ff" />
          <View style={styles.pipelineLine} />
          <PipelineStep count={d.pipeline.contacted} label="Contacted" bgColor={SURF_HIGHEST} />
          <View style={styles.pipelineLine} />
          <PipelineStep count={d.pipeline.visit} label="Visit" bgColor={SEC_CON} textColor={ON_SEC_CON} />
          <View style={styles.pipelineLine} />
          <PipelineStep count={d.pipeline.negotiation} label="Negotiation" bgColor={SURF_HIGHEST} />
          <View style={styles.pipelineLine} />
          <PipelineStep count={d.pipeline.converted} label="Converted" bgColor="#a3f0ee" textColor="#00504f" />
        </View>

        {/* Two-column: follow-ups + top listings */}
        <View style={styles.twoColRow}>
          {/* Follow-ups */}
          <View style={styles.colLeft}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Urgent Follow-ups</Text>
              <View style={styles.criticalBadge}>
                <Text style={styles.criticalText}>3 CRITICAL</Text>
              </View>
            </View>
            {d.urgentFollowUps.map((lead, i) => (
              <FollowUpCard key={lead.id} lead={lead} isOverdue={i === 0} />
            ))}
          </View>
        </View>

        {/* Top Performing */}
        <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Top Performing</Text>
        {d.topListings.map(listing => (
          <TopListingCard
            key={listing.id}
            listing={listing}
            onCheckInsights={() => {
              const parent = navigation.getParent<NativeStackNavigationProp<AgentStackParamList>>();
              parent?.navigate('AgentListingPerformance', { listingId: listing.id });
            }}
          />
        ))}

        {/* Membership strip */}
        {d.membership && (
          <View style={styles.membershipStrip}>
            <View style={styles.membershipLeft}>
              <View style={styles.membershipIcon}>
                <Icon name="crown-outline" size={22} color={ON_SEC_CON} />
              </View>
              <View>
                <Text style={styles.membershipPlan}>{d.membership.planLabel}</Text>
                <Text style={styles.membershipSub}>
                  {d.membership.daysRemaining} days remaining until renewal
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.renewBtn}
              activeOpacity={0.85}
              onPress={() => navigateToMembership(navigation)}
            >
              <Text style={styles.renewBtnText}>RENEW NOW</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: SURFACE },
  loadWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: SURFACE },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: SURFACE,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SURF_HIGH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerGreeting: { fontSize: 15, fontWeight: '800', color: ON_SURFACE, letterSpacing: -0.3 },
  tierLabel: { fontSize: 11, fontWeight: '600', color: ON_SURF_VAR, marginTop: 1 },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SURF_LOW,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { paddingTop: 4 },

  switcherRow: { paddingHorizontal: 20, marginBottom: 4 },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: SURF_LOW,
    borderRadius: 999,
    padding: 4,
    gap: 2,
  },
  modeBuyer: { paddingHorizontal: 14, paddingVertical: 6, fontSize: 12, fontWeight: '600', color: ON_SURF_VAR },
  modeAgentChip: {
    backgroundColor: NAVY,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  modeAgentText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  quickActionsScroll: { marginTop: 16 },
  quickActionsRow: { paddingHorizontal: 20, gap: 16, paddingBottom: 4 },
  quickAction: { alignItems: 'center', gap: 6, minWidth: 64 },
  qaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: SURF_HIGHEST,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qaIconPrimary: { backgroundColor: NAVY_CON },
  qaLabel: { fontSize: 9, fontWeight: '700', color: ON_SURF_VAR, letterSpacing: 0.5, textAlign: 'center' },

  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 10,
    marginTop: 20,
  },
  kpiCard: {
    width: '47%',
    borderRadius: 16,
    padding: 18,
    minHeight: 100,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  kpiLabel: { fontSize: 9, fontWeight: '800', color: ON_SURF_VAR, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  kpiValue: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  kpiSub: { fontSize: 10, fontWeight: '700', marginTop: 4 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: NAVY, paddingHorizontal: 20 },
  sectionLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sectionLinkText: { fontSize: 11, fontWeight: '700', color: SECONDARY },

  pipelineCard: {
    marginHorizontal: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  pipelineStep: { alignItems: 'center', gap: 6, flex: 1 },
  pipelineBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipelineCount: { fontSize: 15, fontWeight: '900' },
  pipelineLabel: { fontSize: 9, fontWeight: '700', color: ON_SURF_VAR, letterSpacing: 0.5, textAlign: 'center' },
  pipelineLine: { height: 1, flex: 0.3, backgroundColor: SURF_HIGH },

  twoColRow: { paddingHorizontal: 14, marginTop: 4 },
  colLeft: { flex: 1 },

  followupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: SURF_LOW,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    marginHorizontal: 6,
  },
  followupAvatarWrap: { position: 'relative' },
  followupAvatarBg: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: SURF_HIGH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followupInitials: { fontSize: 16, fontWeight: '800', color: NAVY },
  urgentDot: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: ERROR,
    borderWidth: 2,
    borderColor: SURF_LOW,
  },
  followupInfo: { flex: 1 },
  followupName: { fontSize: 14, fontWeight: '800', color: NAVY },
  followupProp: { fontSize: 11, color: ON_SURF_VAR, marginTop: 2 },
  followupActions: { alignItems: 'flex-end', gap: 4 },
  followupTime: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  followupBtns: { flexDirection: 'row', gap: 6 },
  followupBtnPrimary: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followupBtnSecondary: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: SURF_HIGHEST,
    alignItems: 'center',
    justifyContent: 'center',
  },

  topListingCard: {
    marginHorizontal: 14,
    backgroundColor: SURF_LOW,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  topListingImgBg: {
    height: 130,
    backgroundColor: SURF_HIGH,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    padding: 10,
  },
  viewsBadge: {
    backgroundColor: 'rgba(0,21,46,0.75)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  viewsBadgeText: { fontSize: 9, fontWeight: '700', color: '#fff', textTransform: 'uppercase' },
  topListingBody: { padding: 14 },
  topListingTitle: { fontSize: 14, fontWeight: '700', color: ON_SURFACE, marginBottom: 2 },
  topListingPrice: { fontSize: 12, fontWeight: '800', color: SECONDARY, marginBottom: 10 },
  boostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: NAVY,
    borderRadius: 999,
    paddingVertical: 8,
  },
  boostBtnText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  insightsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: SURF_HIGHEST,
    borderRadius: 999,
    paddingVertical: 8,
  },
  insightsBtnText: { fontSize: 11, fontWeight: '700', color: NAVY },

  membershipStrip: {
    marginHorizontal: 14,
    backgroundColor: NAVY,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  membershipLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  membershipIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SEC_CON,
    alignItems: 'center',
    justifyContent: 'center',
  },
  membershipPlan: { fontSize: 14, fontWeight: '800', color: '#fff' },
  membershipSub: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  renewBtn: {
    backgroundColor: SECONDARY,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  renewBtnText: { fontSize: 11, fontWeight: '900', color: '#fff', letterSpacing: 1 },

  criticalBadge: {
    backgroundColor: ERROR_CON,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  criticalText: { fontSize: 10, fontWeight: '700', color: ERROR },
});

export default AgentDashboardScreen;

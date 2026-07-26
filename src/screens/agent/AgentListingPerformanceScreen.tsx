/**
 * AgentListingPerformanceScreen — Per-listing KPIs, views/leads chart,
 * recent leads list, and Boost/Feature CTAs.
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
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

import { fetchAgentListingPerformance } from '../../services/agent.service';
import { boostPropertyListing, featurePropertyListing } from '../../services/promotion.service';
import { getApiErrorMessage } from '../../services/auth.service';
import { useMembershipAccess } from '../../hooks/useMembershipAccess';
import MembershipRequiredModal from '../../components/membership/MembershipRequiredModal';
import type { AgentLead, AgentListing } from '../../types/agent.types';
import type { AgentStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AgentStackParamList, 'AgentListingPerformance'>;

const { width: SCREEN_W } = Dimensions.get('window');

const NAVY = '#00152e';
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

const CHART_H = 160;

const SimpleBarChart: React.FC<{ heights?: number[] }> = ({ heights }) => {
  const bars = heights?.length
    ? heights
    : [20, 20, 20, 20, 20, 20, 20];
  return (
  <View style={chartStyles.wrap}>
    {[0, 1, 2, 3].map(i => (
      <View key={i} style={[chartStyles.gridLine, { bottom: `${(i / 3) * 100}%` as any }]} />
    ))}
    <View style={chartStyles.barsRow}>
      {bars.map((h, i) => (
        <View key={i} style={chartStyles.barWrap}>
          <View style={[chartStyles.bar, { height: (Math.max(4, h) / 100) * CHART_H }]} />
        </View>
      ))}
    </View>
    <View style={chartStyles.lineOverlay} pointerEvents="none">
      <View style={chartStyles.leadLine} />
    </View>
    <View style={chartStyles.xAxis}>
      {['1 Mar', '10 Mar', '20 Mar', '30 Mar'].map(l => (
        <Text key={l} style={chartStyles.xLabel}>{l}</Text>
      ))}
    </View>
  </View>
  );
};

const chartStyles = StyleSheet.create({
  wrap: {
    height: CHART_H + 30,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(68,71,77,0.15)',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_H,
    gap: 3,
  },
  barWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: CHART_H },
  bar: {
    width: '100%',
    backgroundColor: 'rgba(0,21,46,0.12)',
    borderRadius: 3,
  },
  lineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: CHART_H,
    overflow: 'hidden',
  },
  leadLine: {
    position: 'absolute',
    bottom: 30,
    left: '10%',
    right: '5%',
    height: 2,
    backgroundColor: SECONDARY,
    borderRadius: 1,
    transform: [{ rotate: '-8deg' }],
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  xLabel: { fontSize: 9, fontWeight: '700', color: ON_SURF_VAR, textTransform: 'uppercase' },
});

const KpiCard: React.FC<{
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
  change?: string;
  changeColor?: string;
}> = ({ icon, iconBg, iconColor, label, value, change, changeColor = SECONDARY }) => (
  <View style={styles.kpiCard}>
    <View style={styles.kpiTop}>
      <View style={[styles.kpiIconBg, { backgroundColor: iconBg }]}>
        <Icon name={icon} size={18} color={iconColor} />
      </View>
      {change && <Text style={[styles.kpiChange, { color: changeColor }]}>{change}</Text>}
    </View>
    <Text style={styles.kpiLabel}>{label}</Text>
    <Text style={styles.kpiValue}>{value}</Text>
  </View>
);

const RecentLeadRow: React.FC<{
  initials: string;
  name: string;
  subtext: string;
}> = ({ initials, name, subtext }) => (
  <View style={styles.recentLeadRow}>
    <View style={styles.recentLeadLeft}>
      <View style={styles.recentLeadAvatar}>
        <Text style={styles.recentLeadInitials}>{initials}</Text>
      </View>
      <View>
        <Text style={styles.recentLeadName}>{name}</Text>
        <Text style={styles.recentLeadSub}>{subtext}</Text>
      </View>
    </View>
    <View style={styles.recentLeadBtns}>
      <TouchableOpacity style={styles.recentLeadBtn} activeOpacity={0.8}>
        <Icon name="phone-outline" size={16} color={TEAL} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.recentLeadBtn} activeOpacity={0.8}>
        <Icon name="email-outline" size={16} color={SECONDARY} />
      </TouchableOpacity>
    </View>
  </View>
);

const AgentListingPerformanceScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AgentStackParamList>>();
  const route = useRoute<Props['route']>();
  const insets = useSafeAreaInsets();
  const {
    gateVisible,
    gateReason,
    gateMessage,
    closeGate,
    goUpgrade,
    handleApiError,
    requireMembership,
  } = useMembershipAccess();

  const [listing, setListing] = useState<AgentListing | null>(null);
  const [recentLeads, setRecentLeads] = useState<AgentLead[]>([]);
  const [chartHeights, setChartHeights] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoBusy, setPromoBusy] = useState<'idle' | 'boost' | 'feature'>('idle');

  const load = useCallback(async () => {
    try {
      const data = await fetchAgentListingPerformance(route.params.listingId);
      setListing(data.listing);
      setRecentLeads(data.recentLeads);
      const views = data.series.map(s => s.views);
      const max = Math.max(1, ...views);
      setChartHeights(
        (views.length ? views : [0]).slice(-14).map(v => Math.round((v / max) * 100)),
      );
    } catch {
      setListing(null);
    } finally {
      setLoading(false);
    }
  }, [route.params.listingId]);

  useEffect(() => { load(); }, [load]);

  const runPromote = useCallback(
    (kind: 'boost' | 'feature') => {
      if (!requireMembership('boost')) return;
      const title = kind === 'boost' ? 'Boost this listing?' : 'Feature this listing?';
      const body =
        kind === 'boost'
          ? 'Uses 1 boost credit from your plan and highlights this listing for about a week.'
          : 'Uses 1 featured slot and places this listing in featured results for about 30 days.';
      Alert.alert(title, body, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: kind === 'boost' ? 'Boost' : 'Feature',
          onPress: async () => {
            if (promoBusy !== 'idle') return;
            setPromoBusy(kind);
            try {
              if (kind === 'boost') {
                const res = await boostPropertyListing(route.params.listingId);
                Toast.show({
                  type: 'success',
                  text1: 'Listing boosted',
                  text2: `${res.boostCreditsRemaining ?? 0} boost credits left this month`,
                });
              } else {
                const res = await featurePropertyListing(route.params.listingId);
                Toast.show({
                  type: 'success',
                  text1: 'Listing featured',
                  text2: `${res.featuredSlotsRemaining ?? 0} featured slots remaining`,
                });
              }
              await load();
            } catch (e) {
              if (handleApiError(e)) return;
              Toast.show({ type: 'error', text1: getApiErrorMessage(e) });
            } finally {
              setPromoBusy('idle');
            }
          },
        },
      ]);
    },
    [requireMembership, promoBusy, route.params.listingId, load, handleApiError],
  );

  if (loading || !listing) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <ActivityIndicator style={{ marginTop: 80 }} color={NAVY} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
            <Icon name="arrow-left" size={22} color={ON_SURF_VAR} />
          </TouchableOpacity>
          <Text style={styles.brandText}>GHAR DEKHO INDIA</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity activeOpacity={0.75}>
            <Icon name="bell-outline" size={22} color={NAVY} />
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Icon name="account" size={18} color={NAVY} />
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 16) + 90 }]}
      >
        {/* Property Header */}
        <View style={styles.propHeader}>
          <View style={styles.propImgBg}>
            <Icon name="office-building" size={36} color="rgba(255,255,255,0.3)" />
          </View>
          <View style={styles.propInfo}>
            <Text style={styles.propStatusBadge}>ACTIVE LISTING</Text>
            <Text style={styles.propTitle}>{listing.title}</Text>
            <View style={styles.propLocRow}>
              <Icon name="map-marker-outline" size={14} color={ON_SURF_VAR} />
              <Text style={styles.propLoc}>{listing.location}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn} activeOpacity={0.85}>
            <Icon name="pencil-outline" size={16} color={NAVY} />
            <Text style={styles.editBtnText}>Edit Listing</Text>
          </TouchableOpacity>
        </View>

        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          <KpiCard
            icon="eye-outline"
            iconBg="rgba(125,87,5,0.1)"
            iconColor={SECONDARY}
            label="Views (7d)"
            value={listing.views.toLocaleString()}
            change={listing.viewsChange ? `+${listing.viewsChange}%` : undefined}
          />
          <KpiCard
            icon="account-group-outline"
            iconBg="rgba(80,157,155,0.1)"
            iconColor={TEAL}
            label="Total Leads"
            value={listing.leads}
            change="+5%"
            changeColor={TEAL}
          />
          <KpiCard
            icon="message-text-outline"
            iconBg="rgba(0,21,46,0.08)"
            iconColor={NAVY}
            label="Messages"
            value={listing.saves}
            change="Steady"
            changeColor={ON_SURF_VAR}
          />
          <KpiCard
            icon="calendar-check-outline"
            iconBg="rgba(254,201,114,0.2)"
            iconColor={SECONDARY}
            label="Meetings"
            value={listing.calls}
            change="+2"
          />
        </View>

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Views & Leads</Text>
              <Text style={styles.chartSub}>Performance metrics for the last 30 days</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: NAVY }]} />
                <Text style={styles.legendLabel}>Views</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: SECONDARY }]} />
                <Text style={styles.legendLabel}>Leads</Text>
              </View>
            </View>
          </View>
          <SimpleBarChart heights={chartHeights} />
        </View>

        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent Leads</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.viewAllText}>View All Leads</Text>
            </TouchableOpacity>
          </View>
          {recentLeads.length === 0 ? (
            <Text style={styles.propLoc}>No leads yet for this listing.</Text>
          ) : (
            recentLeads.slice(0, 5).map(lead => (
              <RecentLeadRow
                key={lead.id}
                initials={lead.leadName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                name={lead.leadName}
                subtext={`${lead.stage.replace(/_/g, ' ')} • ${lead.maskedPhone}`}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom CTAs */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 8) + 4 }]}>
        <TouchableOpacity
          style={[styles.boostBtn, promoBusy !== 'idle' && { opacity: 0.6 }]}
          activeOpacity={0.85}
          disabled={promoBusy !== 'idle'}
          onPress={() => runPromote('boost')}
        >
          {promoBusy === 'boost' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="rocket-launch-outline" size={18} color="#fff" />
              <Text style={styles.boostBtnText}>Boost Listing</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.featureBtn, promoBusy !== 'idle' && { opacity: 0.6 }]}
          activeOpacity={0.85}
          disabled={promoBusy !== 'idle'}
          onPress={() => runPromote('feature')}
        >
          {promoBusy === 'feature' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="star-outline" size={18} color="#fff" />
              <Text style={styles.featureBtnText}>Feature</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <MembershipRequiredModal
        visible={gateVisible}
        reason={gateReason}
        message={gateMessage}
        onClose={closeGate}
        onUpgrade={goUpgrade}
      />
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
    paddingVertical: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: { padding: 4 },
  brandText: { fontSize: 15, fontWeight: '900', color: NAVY, letterSpacing: 1.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: SURF_HIGH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {},

  propHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexWrap: 'wrap',
  },
  propImgBg: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: '#122a47',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 4 },
    }),
  },
  propInfo: { flex: 1 },
  propStatusBadge: { fontSize: 9, fontWeight: '700', color: SECONDARY, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  propTitle: { fontSize: 17, fontWeight: '800', color: NAVY, letterSpacing: -0.3 },
  propLocRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  propLoc: { fontSize: 12, color: ON_SURF_VAR },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: SURF_HIGHEST,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  editBtnText: { fontSize: 12, fontWeight: '700', color: NAVY },

  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    width: '47%',
    backgroundColor: SURF_LOW,
    borderRadius: 16,
    padding: 16,
  },
  kpiTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  kpiIconBg: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  kpiChange: { fontSize: 10, fontWeight: '700' },
  kpiLabel: { fontSize: 11, color: ON_SURF_VAR, fontWeight: '500' },
  kpiValue: { fontSize: 26, fontWeight: '900', color: NAVY, marginTop: 2 },

  chartSection: {
    marginHorizontal: 14,
    backgroundColor: SURF_LOW,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  chartTitle: { fontSize: 15, fontWeight: '800', color: NAVY },
  chartSub: { fontSize: 11, color: ON_SURF_VAR, marginTop: 2 },
  legendRow: { flexDirection: 'row', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 10, fontWeight: '500', color: ON_SURF_VAR },

  recentSection: { marginHorizontal: 14, marginBottom: 16 },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: NAVY },
  viewAllText: { fontSize: 12, fontWeight: '700', color: SECONDARY },
  recentLeadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
      android: { elevation: 1 },
    }),
  },
  recentLeadLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recentLeadAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,21,46,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentLeadInitials: { fontSize: 14, fontWeight: '800', color: NAVY },
  recentLeadName: { fontSize: 14, fontWeight: '700', color: NAVY },
  recentLeadSub: { fontSize: 11, color: ON_SURF_VAR, fontStyle: 'italic', marginTop: 2 },
  recentLeadBtns: { flexDirection: 'row', gap: 8 },
  recentLeadBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SURF_LOW,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: 'rgba(250,249,252,0.95)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#c4c6ce',
  },
  boostBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: SECONDARY,
    borderRadius: 999,
    paddingVertical: 14,
  },
  boostBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  featureBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6750A4',
    borderRadius: 999,
    paddingVertical: 14,
  },
  featureBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});

export default AgentListingPerformanceScreen;

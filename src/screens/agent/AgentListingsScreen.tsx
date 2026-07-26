
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { fetchAgentListings } from '../../services/agent.service';
import type { AgentListing } from '../../types/agent.types';
import type { AgentTabParamList, AgentStackParamList } from '../../navigation/types';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<AgentTabParamList, 'AgentListings'>,
  NativeStackNavigationProp<AgentStackParamList>
>;

type StatusTab = 'Active' | 'Draft' | 'Sold/Rented' | 'Expired';
const STATUS_TABS: StatusTab[] = ['Active', 'Draft', 'Sold/Rented', 'Expired'];

const STATUS_API: Record<StatusTab, string> = {
  Active: 'ACTIVE',
  Draft: 'DRAFT',
  'Sold/Rented': 'SOLD',
  Expired: 'EXPIRED',
};

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
const TEAL_CON = '#002f2f';

const StatCell: React.FC<{ label: string; value: string | number; accent?: string }> = ({
  label,
  value,
  accent = NAVY,
}) => (
  <View style={statStyles.cell}>
    <Text style={statStyles.label}>{label}</Text>
    <Text style={[statStyles.value, { color: accent }]}>{value}</Text>
  </View>
);

const statStyles = StyleSheet.create({
  cell: { flex: 1, alignItems: 'center' },
  label: { fontSize: 8, fontWeight: '700', color: ON_SURF_VAR, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 15, fontWeight: '900', marginTop: 2 },
});

const ListingCard: React.FC<{
  listing: AgentListing;
  onViewPerformance: () => void;
}> = ({ listing, onViewPerformance }) => (
  <View style={styles.listingCard}>
    {/* Image placeholder */}
    <View style={styles.listingImgBg}>
      <Icon name="office-building" size={40} color="rgba(255,255,255,0.25)" />
      <View style={styles.listingBadges}>
        {listing.isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
        {listing.isTopPerformer && (
          <View style={styles.topBadge}>
            <Text style={styles.topBadgeText}>Top Performer</Text>
          </View>
        )}
      </View>
    </View>

    <View style={styles.listingBody}>
      {/* Title + price */}
      <View style={styles.listingTitleRow}>
        <Text style={styles.listingTitle} numberOfLines={2}>{listing.title}</Text>
        <Text style={styles.listingPrice}>{listing.price}</Text>
      </View>
      <View style={styles.locationRow}>
        <Icon name="map-marker-outline" size={12} color={ON_SURF_VAR} />
        <Text style={styles.locationText}>{listing.location}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCell label="Views" value={listing.views >= 1000 ? `${(listing.views / 1000).toFixed(1)}k` : listing.views} />
        <StatCell label="Leads" value={listing.leads} accent={TEAL} />
        <StatCell label="Saves" value={listing.saves} />
        <StatCell label="Calls" value={listing.calls} />
      </View>

      {/* Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
          <Icon name="pencil-outline" size={16} color={NAVY} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
          <Icon name="rocket-launch-outline" size={16} color={NAVY} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
          <Icon name="share-variant-outline" size={16} color={NAVY} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnPrimary]}
          activeOpacity={0.8}
          onPress={onViewPerformance}
        >
          <Icon name="chart-line" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const AgentListingsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [listings, setListings] = useState<AgentListing[]>([]);
  const [summary, setSummary] = useState({ activeCount: 0, totalCount: 0, totalLeads: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<StatusTab>('Active');

  const load = useCallback(async (isRefresh = false, tab: StatusTab = activeTab) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await fetchAgentListings(STATUS_API[tab]);
      setListings(data.listings);
      setSummary(data.summary);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => { load(false, activeTab); }, [load, activeTab]);

  const tabBarH = Math.max(insets.bottom, 8) + 64;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brandText}>GHAR DEKHO INDIA</Text>
        <TouchableOpacity activeOpacity={0.75}>
          <Icon name="bell-outline" size={22} color={NAVY} />
        </TouchableOpacity>
      </View>

      {/* Summary bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryLeft}>
          <View style={styles.activeDot} />
          <Text style={styles.summaryText}>
            {summary.activeCount} active · {summary.totalLeads} total leads
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.85}>
          <Text style={styles.addBtnText}>Add Listing</Text>
        </TouchableOpacity>
      </View>

      {/* Title + Status tabs */}
      <View style={styles.titleSection}>
        <Text style={styles.sectionTitle}>Property Portfolio</Text>
        <Text style={styles.sectionSub}>
          Manage your inventory and monitor real-time performance.
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
          style={styles.tabsScroll}
        >
          {STATUS_TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabChip, activeTab === tab && styles.tabChipActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabChipText, activeTab === tab && styles.tabChipTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={NAVY} />
      ) : (
        <FlatList
          data={listings}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: tabBarH + 8 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true, activeTab)} tintColor={NAVY} />
          }
          renderItem={({ item }) => (
            <ListingCard
              listing={item}
              onViewPerformance={() => {
                const parent = navigation.getParent<NativeStackNavigationProp<AgentStackParamList>>();
                parent?.navigate('AgentListingPerformance', { listingId: item.id });
              }}
            />
          )}
        />
      )}
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
  brandText: { fontSize: 16, fontWeight: '900', color: NAVY, letterSpacing: 2 },
  summaryBar: {
    marginHorizontal: 14,
    backgroundColor: '#122a47',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: TEAL },
  summaryText: { fontSize: 12, fontWeight: '500', color: '#fff' },
  addBtn: {
    backgroundColor: SECONDARY,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  addBtnText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  titleSection: { paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: NAVY, letterSpacing: -0.5, marginBottom: 4 },
  sectionSub: { fontSize: 12, color: ON_SURF_VAR, lineHeight: 18, marginBottom: 14 },
  tabsScroll: {},
  tabsRow: { gap: 8 },
  tabChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: SURF_LOW,
  },
  tabChipActive: { backgroundColor: NAVY },
  tabChipText: { fontSize: 12, fontWeight: '600', color: ON_SURF_VAR },
  tabChipTextActive: { color: '#fff', fontWeight: '700' },
  listContent: { paddingHorizontal: 14, paddingTop: 4, gap: 16 },

  listingCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 },
    }),
  },
  listingImgBg: {
    height: 180,
    backgroundColor: '#122a47',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  listingBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  featuredBadge: {
    backgroundColor: TEAL_CON,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  featuredText: { fontSize: 9, fontWeight: '800', color: TEAL, textTransform: 'uppercase' },
  topBadge: {
    backgroundColor: TEAL,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  topBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', textTransform: 'uppercase' },
  listingBody: { padding: 16 },
  listingTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  listingTitle: { fontSize: 15, fontWeight: '800', color: NAVY, flex: 1, marginRight: 12 },
  listingPrice: { fontSize: 15, fontWeight: '800', color: SECONDARY },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
  locationText: { fontSize: 12, color: ON_SURF_VAR },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: SURF_LOW,
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1,
    backgroundColor: SURF_HIGHEST,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPrimary: { backgroundColor: NAVY },
});

export default AgentListingsScreen;

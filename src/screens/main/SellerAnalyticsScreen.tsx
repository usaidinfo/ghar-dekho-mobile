/**
 * SellerAnalyticsScreen — owner portfolio KPIs for last 7/30/90 days.
 */
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

import { fetchMyAnalytics, type SellerAnalyticsData } from '../../services/sellerAnalytics.service';
import type { MainStackParamList } from '../../navigation/types';

const NAVY = '#122A47';
const GOLD = '#D1A14E';
const SURFACE = '#faf9fc';
const MUTED = '#777779';
const SURF_LOW = '#f5f3f6';

type Period = '7D' | '30D' | '90D';
type Nav = NativeStackNavigationProp<MainStackParamList>;

const PERIODS: Period[] = ['7D', '30D', '90D'];

const SellerAnalyticsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [period, setPeriod] = useState<Period>('30D');
  const [data, setData] = useState<SellerAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (opts?: { refresh?: boolean }) => {
      if (opts?.refresh) setRefreshing(true);
      else setLoading(true);
      try {
        const res = await fetchMyAnalytics(period);
        setData(res);
      } catch (e) {
        Toast.show({
          type: 'error',
          text1: e instanceof Error ? e.message : 'Could not load analytics',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [period],
  );

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const series = data?.series ?? [];
  const maxViews = Math.max(1, ...series.map(s => s.views));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={22} color={NAVY} />
        </TouchableOpacity>
        <Text style={styles.title}>Seller analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.periods}>
        {PERIODS.map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.periodChip, period === p && styles.periodChipOn]}
            onPress={() => setPeriod(p)}
            activeOpacity={0.85}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextOn]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !data ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={NAVY} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void load({ refresh: true })} />
          }
        >
          <View style={styles.summaryRow}>
            <SummaryCard
              icon="home-city-outline"
              label="Listings"
              value={String(data?.listingCount ?? 0)}
              sub={`${data?.activeListings ?? 0} active`}
            />
            <SummaryCard
              icon="eye-outline"
              label="Views"
              value={(data?.totals.views ?? 0).toLocaleString('en-IN')}
            />
          </View>
          <View style={styles.summaryRow}>
            <SummaryCard
              icon="account-search-outline"
              label="Leads"
              value={(data?.totals.leads ?? 0).toLocaleString('en-IN')}
            />
            <SummaryCard
              icon="message-outline"
              label="Messages"
              value={(data?.totals.messages ?? 0).toLocaleString('en-IN')}
            />
          </View>
          <View style={styles.summaryRow}>
            <SummaryCard
              icon="phone-outline"
              label="Calls"
              value={(data?.totals.calls ?? 0).toLocaleString('en-IN')}
            />
            <SummaryCard
              icon="heart-outline"
              label="Saves"
              value={(data?.totals.saves ?? 0).toLocaleString('en-IN')}
            />
          </View>

          <Text style={styles.sectionTitle}>Views over time</Text>
          <View style={styles.chartCard}>
            {series.length === 0 ? (
              <Text style={styles.emptyChart}>No traffic in this period yet.</Text>
            ) : (
              <View style={styles.barsRow}>
                {series.map((s, i) => (
                  <View key={`${s.date}-${i}`} style={styles.barWrap}>
                    <View
                      style={[
                        styles.bar,
                        { height: Math.max(4, (s.views / maxViews) * 120) },
                      ]}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top listings</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyListings')}>
              <Text style={styles.link}>My listings</Text>
            </TouchableOpacity>
          </View>

          {(data?.topListings ?? []).length === 0 ? (
            <Text style={styles.emptyChart}>Post a property to start tracking performance.</Text>
          ) : (
            data?.topListings.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.listingRow}
                activeOpacity={0.88}
                onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.listingTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.listingMeta} numberOfLines={1}>
                    {[item.locality, item.city].filter(Boolean).join(', ') || item.status}
                  </Text>
                </View>
                <View style={styles.listingStats}>
                  <Text style={styles.listingStat}>
                    {(item.periodStats?.views ?? 0).toLocaleString('en-IN')} views
                  </Text>
                  <Text style={styles.listingStatGold}>
                    {(item.periodStats?.leads ?? 0).toLocaleString('en-IN')} leads
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const SummaryCard: React.FC<{
  icon: string;
  label: string;
  value: string;
  sub?: string;
}> = ({ icon, label, value, sub }) => (
  <View style={styles.summaryCard}>
    <Icon name={icon} size={18} color={GOLD} />
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryValue}>{value}</Text>
    {sub ? <Text style={styles.summarySub}>{sub}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SURFACE },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SURF_LOW,
  },
  title: { fontSize: 18, fontWeight: '800', color: NAVY },
  periods: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  periodChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: SURF_LOW,
  },
  periodChipOn: { backgroundColor: NAVY },
  periodText: { fontSize: 12, fontWeight: '800', color: MUTED },
  periodTextOn: { color: '#fff' },
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    gap: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e3e2e5',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 1 },
    }),
  },
  summaryLabel: { fontSize: 11, fontWeight: '700', color: MUTED, textTransform: 'uppercase' },
  summaryValue: { fontSize: 20, fontWeight: '800', color: NAVY },
  summarySub: { fontSize: 11, color: MUTED },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: NAVY, marginTop: 8 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  link: { fontSize: 13, fontWeight: '700', color: GOLD },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    minHeight: 150,
    justifyContent: 'flex-end',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e3e2e5',
  },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 3 },
  barWrap: { flex: 1, justifyContent: 'flex-end' },
  bar: { width: '100%', backgroundColor: NAVY, borderTopLeftRadius: 3, borderTopRightRadius: 3, opacity: 0.85 },
  emptyChart: { fontSize: 13, color: MUTED, textAlign: 'center', paddingVertical: 24 },
  listingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e3e2e5',
  },
  listingTitle: { fontSize: 14, fontWeight: '700', color: NAVY },
  listingMeta: { fontSize: 12, color: MUTED, marginTop: 2 },
  listingStats: { alignItems: 'flex-end', gap: 2 },
  listingStat: { fontSize: 11, fontWeight: '600', color: MUTED },
  listingStatGold: { fontSize: 12, fontWeight: '800', color: GOLD },
});

export default SellerAnalyticsScreen;

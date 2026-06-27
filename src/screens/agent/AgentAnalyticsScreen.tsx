/**
 * AgentAnalyticsScreen — Revenue potential, conversion funnel,
 * leads-over-time area chart, and insight detection.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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

type Period = '7D' | '30D' | '90D' | 'Custom';
const PERIODS: Period[] = ['7D', '30D', '90D', 'Custom'];

// Simple area chart using Views + gradient-like overlay
const AREA_POINTS = [80, 40, 60, 30, 70, 35, 20];
const CHART_H = 160;

const AreaChart: React.FC = () => (
  <View style={areaChart.container}>
    {/* Grid */}
    {[0, 1, 2, 3].map(i => (
      <View
        key={i}
        style={[areaChart.grid, { bottom: `${(i / 3) * 100}%` as any }]}
      />
    ))}
    {/* Bars as area simulation */}
    <View style={areaChart.barsRow}>
      {AREA_POINTS.map((h, i) => (
        <View key={i} style={areaChart.barWrap}>
          <View
            style={[
              areaChart.bar,
              { height: ((100 - h) / 100) * CHART_H },
              i === 4 && areaChart.barPeak,
            ]}
          />
          <View style={[areaChart.barFill, { flex: 1 }]} />
        </View>
      ))}
    </View>
    {/* X axis */}
    <View style={areaChart.xAxis}>
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
        <Text key={d} style={areaChart.xLabel}>{d}</Text>
      ))}
    </View>
  </View>
);

const areaChart = StyleSheet.create({
  container: { height: CHART_H + 28, position: 'relative', marginTop: 8 },
  grid: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_H,
    gap: 4,
  },
  barWrap: { flex: 1, height: CHART_H, justifyContent: 'flex-end' },
  bar: { width: '100%', backgroundColor: 'transparent' },
  barFill: { width: '100%', backgroundColor: `rgba(80,157,155,0.25)`, borderRadius: 2 },
  barPeak: { position: 'relative' },
  xAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  xLabel: { fontSize: 9, fontWeight: '700', color: ON_SURF_VAR, textTransform: 'uppercase' },
});

// Funnel bar
const FunnelBar: React.FC<{
  label: string;
  value: string;
  percent: number;
  color: string;
  indent?: number;
}> = ({ label, value, percent, color, indent = 0 }) => (
  <View style={[funnelStyles.wrap, { paddingLeft: indent }]}>
    <View style={funnelStyles.labelRow}>
      <Text style={funnelStyles.label}>{label}</Text>
      <Text style={funnelStyles.value}>{value}</Text>
    </View>
    <View style={funnelStyles.track}>
      <View style={[funnelStyles.fill, { width: `${percent}%`, backgroundColor: color }]} />
    </View>
  </View>
);

const funnelStyles = StyleSheet.create({
  wrap: { marginBottom: 18 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 13, fontWeight: '700', color: ON_SURF_VAR },
  value: { fontSize: 13, fontWeight: '700', color: NAVY },
  track: { height: 36, backgroundColor: SURF_HIGH, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
});

const AgentAnalyticsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('7D');
  const tabBarH = Math.max(insets.bottom, 8) + 64;

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
        {/* Title + Period selector */}
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <Text style={styles.pageTitle}>Performance Analytics</Text>
            <Text style={styles.pageSub}>
              Track your brokerage growth and conversion metrics.
            </Text>
          </View>
          <View style={styles.periodSelector}>
            {PERIODS.map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.periodChip, period === p && styles.periodChipActive]}
                onPress={() => setPeriod(p)}
                activeOpacity={0.8}
              >
                {p === 'Custom' ? (
                  <View style={styles.periodCustom}>
                    <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                      Custom
                    </Text>
                    <Icon name="calendar" size={12} color={period === p ? '#fff' : ON_SURF_VAR} />
                  </View>
                ) : (
                  <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* KPI Cards row */}
        <View style={styles.kpiRow}>
          {/* Revenue potential */}
          <View style={styles.revenueCard}>
            <Text style={styles.revenueLabel}>REVENUE POTENTIAL</Text>
            <Text style={styles.revenueValue}>₹ 4.82 Cr</Text>
            <View style={styles.revenueTrend}>
              <Icon name="trending-up" size={14} color={TEAL} />
              <Text style={styles.revenueTrendText}>+12.4% from last period</Text>
            </View>
          </View>
          {/* Conversion time */}
          <View style={styles.convCard}>
            <Text style={styles.convLabel}>AVG. CONVERSION TIME</Text>
            <Text style={styles.convValue}>18 Days</Text>
            <View style={styles.convTrend}>
              <Icon name="speedometer" size={14} color={SECONDARY} />
              <Text style={styles.convTrendText}>-2 days improvement</Text>
            </View>
          </View>
        </View>

        {/* Conversion Funnel */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sales Conversion Funnel</Text>
          <View style={styles.funnelWrap}>
            <FunnelBar label="Views" value="24.5k" percent={100} color="rgba(0,21,46,0.2)" />
            <FunnelBar label="Leads" value="1,240" percent={70} color="rgba(0,21,46,0.4)" indent={12} />
            <FunnelBar label="Visits" value="312" percent={45} color={SEC_CON} indent={24} />
            <FunnelBar label="Deals" value="48" percent={20} color={SECONDARY} indent={36} />
          </View>
        </View>

        {/* Leads Over Time Chart */}
        <View style={[styles.card, styles.chartCard]}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.cardTitle}>Leads Over Time</Text>
              <Text style={styles.chartSub}>Daily volume of high-intent property inquiries</Text>
            </View>
            <View style={styles.legendCol}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: TEAL }]} />
                <Text style={styles.legendText}>Organic</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: SECONDARY }]} />
                <Text style={styles.legendText}>Premium Ads</Text>
              </View>
            </View>
          </View>
          <AreaChart />

          {/* Insight */}
          <View style={styles.insightBox}>
            <View style={styles.insightIcon}>
              <Icon name="lightbulb-outline" size={18} color={ON_SEC_CON} />
            </View>
            <View style={styles.insightText}>
              <Text style={styles.insightTitle}>Insight Detected</Text>
              <Text style={styles.insightDesc}>
                Lead volume spikes on weekends between 11 AM and 3 PM. Suggest boosting ad spend during this window.
              </Text>
            </View>
          </View>
        </View>

        {/* Download CTA */}
        <TouchableOpacity style={styles.downloadBtn} activeOpacity={0.85}>
          <Icon name="download" size={20} color={NAVY} />
          <Text style={styles.downloadBtnText}>Download Detailed Report</Text>
        </TouchableOpacity>
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

  titleRow: { paddingHorizontal: 20, marginBottom: 20 },
  titleLeft: { marginBottom: 16 },
  pageTitle: { fontSize: 22, fontWeight: '900', color: NAVY, letterSpacing: -0.5, marginBottom: 4 },
  pageSub: { fontSize: 13, color: ON_SURF_VAR, lineHeight: 18 },

  periodSelector: {
    flexDirection: 'row',
    backgroundColor: SURF_LOW,
    borderRadius: 999,
    padding: 3,
    gap: 2,
    alignSelf: 'flex-start',
  },
  periodChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999 },
  periodChipActive: { backgroundColor: NAVY },
  periodText: { fontSize: 12, fontWeight: '700', color: ON_SURF_VAR },
  periodTextActive: { color: '#fff' },
  periodCustom: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  kpiRow: { flexDirection: 'row', paddingHorizontal: 14, gap: 10, marginBottom: 16 },
  revenueCard: {
    flex: 1,
    backgroundColor: NAVY_CON,
    borderRadius: 16,
    padding: 18,
  },
  revenueLabel: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  revenueValue: { fontSize: 24, fontWeight: '900', color: '#fff' },
  revenueTrend: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  revenueTrendText: { fontSize: 10, fontWeight: '700', color: TEAL },

  convCard: {
    flex: 1,
    backgroundColor: SURF_LOW,
    borderRadius: 16,
    padding: 18,
  },
  convLabel: { fontSize: 9, fontWeight: '800', color: ON_SURF_VAR, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  convValue: { fontSize: 24, fontWeight: '900', color: NAVY },
  convTrend: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  convTrendText: { fontSize: 10, fontWeight: '700', color: SECONDARY },

  card: {
    marginHorizontal: 14,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  chartCard: { backgroundColor: SURF_LOW },
  cardTitle: { fontSize: 16, fontWeight: '800', color: NAVY, marginBottom: 4 },
  funnelWrap: { marginTop: 16 },

  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  chartSub: { fontSize: 11, color: ON_SURF_VAR, marginTop: 2 },
  legendCol: { gap: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 10, fontWeight: '700', color: ON_SURF_VAR },

  insightBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(233,231,234,0.6)',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SEC_CON,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  insightText: { flex: 1 },
  insightTitle: { fontSize: 12, fontWeight: '800', color: NAVY, marginBottom: 3 },
  insightDesc: { fontSize: 11, color: ON_SURF_VAR, lineHeight: 16 },

  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: NAVY,
    borderRadius: 999,
    marginBottom: 8,
  },
  downloadBtnText: { fontSize: 14, fontWeight: '700', color: NAVY },
});

export default AgentAnalyticsScreen;

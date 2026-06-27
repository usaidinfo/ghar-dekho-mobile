/**
 * AgentLeadsScreen — Leads inbox with filter chips, search, and lead cards.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
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

import { fetchAgentLeads } from '../../services/agent.service';
import type { AgentLead, LeadStage } from '../../types/agent.types';
import type { AgentTabParamList, AgentStackParamList } from '../../navigation/types';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<AgentTabParamList, 'AgentLeads'>,
  NativeStackNavigationProp<AgentStackParamList>
>;

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
const ERROR = '#ba1a1a';
const TEAL = '#a3f0ee';
const TEAL_TEXT = '#00504f';

type StageFilter = 'All' | LeadStage;
const STAGE_FILTERS: { label: string; value: StageFilter }[] = [
  { label: 'All', value: 'All' },
  { label: 'New', value: 'NEW' },
  { label: 'Contacted', value: 'CONTACTED' },
  { label: 'Visit Scheduled', value: 'VISIT_SCHEDULED' },
  { label: 'Negotiation', value: 'NEGOTIATION' },
  { label: 'Converted', value: 'CONVERTED' },
  { label: 'Lost', value: 'LOST' },
];

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function stageBg(stage: LeadStage): string {
  switch (stage) {
    case 'NEW': return NAVY;
    case 'CONTACTED': return SURF_HIGHEST;
    case 'VISIT_SCHEDULED': return SEC_CON;
    case 'NEGOTIATION': return TEAL;
    case 'CONVERTED': return '#d4e3ff';
    default: return SURF_HIGHEST;
  }
}
function stageText(stage: LeadStage): string {
  switch (stage) {
    case 'NEW': return '#fff';
    case 'CONTACTED': return ON_SURF_VAR;
    case 'VISIT_SCHEDULED': return ON_SEC_CON;
    case 'NEGOTIATION': return TEAL_TEXT;
    case 'CONVERTED': return NAVY;
    default: return ON_SURF_VAR;
  }
}
function stageLabel(stage: LeadStage): string {
  return stage.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const LeadCard: React.FC<{ lead: AgentLead; onPress: () => void }> = ({ lead, onPress }) => {
  const initials = lead.leadName
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <TouchableOpacity
      style={styles.leadCard}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {/* Row 1: name + status */}
      <View style={styles.leadRow1}>
        <View style={styles.leadNameWrap}>
          <Text style={styles.leadName}>{lead.leadName}</Text>
          {lead.isUrgent && (
            <View style={styles.urgentBadge}>
              <Icon name="alert" size={10} color={ERROR} />
              <Text style={styles.urgentText}>URGENT</Text>
            </View>
          )}
        </View>
        <View style={styles.leadStatusWrap}>
          <View style={[styles.stageBadge, { backgroundColor: stageBg(lead.stage) }]}>
            <Text style={[styles.stageBadgeText, { color: stageText(lead.stage) }]}>
              {stageLabel(lead.stage)}
            </Text>
          </View>
          <Text style={styles.leadTime}>{formatRelative(lead.lastActivityAt)}</Text>
        </View>
      </View>

      <Text style={styles.maskedPhone}>{lead.maskedPhone}</Text>

      {/* Property row */}
      <View style={styles.propRow}>
        <View style={styles.propImgBg}>
          <Icon name="office-building" size={22} color={ON_SURF_VAR} />
        </View>
        <View style={styles.propInfo}>
          <Text style={styles.propTitle} numberOfLines={1}>{lead.propertyTitle}</Text>
          <Text style={styles.propLocation}>{lead.propertyLocation}</Text>
          <Text style={styles.propPrice}>{lead.propertyPrice}</Text>
        </View>
      </View>

      {/* Last note */}
      {lead.lastNote && (
        <View style={styles.noteRow}>
          <Icon name="clock-outline" size={14} color={SECONDARY} />
          <Text style={styles.noteText} numberOfLines={1}>{lead.lastNote}</Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.leadFooter}>
        <View style={styles.tagRow}>
          {lead.propertyTag && (
            <View style={styles.propTag}>
              <Text style={styles.propTagText}>{lead.propertyTag}</Text>
            </View>
          )}
          {lead.isShared && lead.sharedWith && (
            <View style={styles.sharedRow}>
              {lead.sharedWith.map(init => (
                <View key={init} style={styles.sharedAvatar}>
                  <Text style={styles.sharedAvatarText}>{init}</Text>
                </View>
              ))}
              <Text style={styles.sharedLabel}>Shared Lead</Text>
            </View>
          )}
        </View>
        <View style={styles.actionBtns}>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
            <Icon name="phone-outline" size={18} color={NAVY} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
            <Icon name="message-text-outline" size={18} color={NAVY} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const AgentLeadsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [leads, setLeads] = useState<AgentLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<StageFilter>('All');
  const [query, setQuery] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await fetchAgentLeads();
      setLeads(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = leads.filter(l => {
    const matchStage = activeFilter === 'All' || l.stage === activeFilter;
    const q = query.toLowerCase();
    const matchQuery =
      !q ||
      l.leadName.toLowerCase().includes(q) ||
      l.propertyTitle.toLowerCase().includes(q) ||
      l.maskedPhone.includes(q);
    return matchStage && matchQuery;
  });

  const tabBarH = Math.max(insets.bottom, 8) + 64;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Icon name="account" size={18} color={NAVY} />
          </View>
          <Text style={styles.headerTitle}>Leads</Text>
        </View>
        <TouchableOpacity activeOpacity={0.75}>
          <Icon name="bell-outline" size={22} color={NAVY} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Icon name="magnify" size={20} color={ON_SURF_VAR} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, property or phone..."
          placeholderTextColor="#74777e"
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity style={styles.searchFilterBtn} activeOpacity={0.85}>
          <Icon name="tune-variant" size={14} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
        style={styles.filtersScroll}
      >
        {STAGE_FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, activeFilter === f.value && styles.filterChipActive]}
            onPress={() => setActiveFilter(f.value)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, activeFilter === f.value && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={NAVY} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: tabBarH + 8 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={NAVY} />
          }
          renderItem={({ item }) => (
            <LeadCard
              lead={item}
              onPress={() => {
                const parent = navigation.getParent<NativeStackNavigationProp<AgentStackParamList>>();
                parent?.navigate('AgentLeadDetail', { leadId: item.id });
              }}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Icon name="inbox-outline" size={48} color={SURF_HIGHEST} />
              <Text style={styles.emptyText}>No leads found</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: tabBarH + 16 }]}
        activeOpacity={0.85}
      >
        <Icon name="plus" size={28} color="#fff" />
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
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: SURF_HIGH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: NAVY, letterSpacing: -0.4 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    backgroundColor: SURF_HIGHEST,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: ON_SURFACE, fontWeight: '500' },
  searchFilterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersScroll: { marginBottom: 8 },
  filtersRow: { paddingHorizontal: 16, gap: 8 },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: SURF_HIGH,
  },
  filterChipActive: { backgroundColor: NAVY },
  filterChipText: { fontSize: 13, fontWeight: '600', color: ON_SURF_VAR },
  filterChipTextActive: { color: '#fff', fontWeight: '700' },
  listContent: { paddingHorizontal: 14, paddingTop: 4 },

  leadCard: {
    backgroundColor: SURF_LOW,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  leadRow1: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  leadNameWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  leadName: { fontSize: 15, fontWeight: '800', color: ON_SURFACE },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(186,26,26,0.08)',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  urgentText: { fontSize: 9, fontWeight: '900', color: ERROR, textTransform: 'uppercase' },
  leadStatusWrap: { alignItems: 'flex-end', gap: 4 },
  stageBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  stageBadgeText: { fontSize: 10, fontWeight: '700' },
  leadTime: { fontSize: 9, fontWeight: '700', color: ON_SURF_VAR, textTransform: 'uppercase' },
  maskedPhone: { fontSize: 12, color: '#c4c6ce', fontWeight: '500', marginBottom: 12 },

  propRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 10 },
  propImgBg: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: SURF_HIGH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  propInfo: { flex: 1 },
  propTitle: { fontSize: 14, fontWeight: '700', color: NAVY, marginBottom: 2 },
  propLocation: { fontSize: 12, color: ON_SURF_VAR },
  propPrice: { fontSize: 13, fontWeight: '800', color: SECONDARY, marginTop: 3 },

  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  noteText: { fontSize: 12, color: ON_SURF_VAR, fontStyle: 'italic', flex: 1 },

  leadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(196,198,206,0.15)',
    paddingTop: 10,
  },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  propTag: {
    backgroundColor: SURF_HIGHEST,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  propTagText: { fontSize: 9, fontWeight: '700', color: ON_SURF_VAR, textTransform: 'uppercase' },
  sharedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sharedAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: SURFACE,
  },
  sharedAvatarText: { fontSize: 8, fontWeight: '700', color: '#fff' },
  sharedLabel: { fontSize: 10, color: ON_SURF_VAR, fontWeight: '500' },
  actionBtns: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SURF_HIGHEST,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { fontSize: 14, color: ON_SURF_VAR },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: SECONDARY,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 10 },
    }),
  },
});

export default AgentLeadsScreen;

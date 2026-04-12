/**
 * @file MyListingsScreen.tsx
 * @description Owner's properties from GET /api/properties/my-listings (filters, pagination).
 * Matches Stitch-style cards; uses app stack back + existing bottom tabs (no duplicate tab bar).
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { isAxiosError } from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import type { MainStackParamList } from '../../navigation/types';
import type { MyListingItem, MyListingAnalyticsDay } from '../../types/home.api.types';
import { fetchMyListings } from '../../services/property.service';
import { formatInrPrice } from '../../utils/homePropertyMappers';
import { useAuthStore } from '../../stores/auth.store';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80';
const NAVY = '#122A47';
const PRIMARY_DEEP = '#00152e';
const MUTED = '#777779';
const SURFACE = '#faf9fc';
const SECONDARY = '#D1A14E';

const STATUS_FILTERS = [
  'All',
  'ACTIVE',
  'DRAFT',
  'INACTIVE',
  'UNDER_VERIFICATION',
  'SOLD',
  'RENTED',
  'EXPIRED',
  'REJECTED',
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];

type Nav = NativeStackNavigationProp<MainStackParamList>;

function humanizeEnum(s: string): string {
  return s
    .split(/[_\s]+/)
    .filter(Boolean)
    .map(w => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

function formatRelativePosted(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Saved just now';
  if (mins < 60) return `Saved ${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Saved ${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  return `Saved ${days} day${days === 1 ? '' : 's'} ago`;
}

function expiryCaption(expiresAt: string | null, status: string): { line: string; tone: 'gold' | 'error' | 'muted' } | null {
  if (!expiresAt) return null;
  const end = new Date(expiresAt).getTime();
  const now = Date.now();
  const dayMs = 86_400_000;
  const daysLeft = Math.ceil((end - now) / dayMs);
  if (status === 'EXPIRED' || daysLeft < 0) {
    const ago = Math.abs(daysLeft);
    return { line: `Expired ${ago} day${ago === 1 ? '' : 's'} ago`, tone: 'error' };
  }
  if (daysLeft === 0) return { line: 'Expires today', tone: 'gold' };
  if (daysLeft === 1) return { line: 'Expires tomorrow', tone: 'gold' };
  return { line: `Expires in ${daysLeft} days`, tone: 'gold' };
}

function statusBadgeColors(status: string): { bg: string; fg: string } {
  switch (status) {
    case 'ACTIVE':
      return { bg: '#16a34a', fg: '#fff' };
    case 'DRAFT':
      return { bg: '#e9e7ea', fg: '#44474d' };
    case 'EXPIRED':
    case 'REJECTED':
      return { bg: '#dc2626', fg: '#fff' };
    case 'UNDER_VERIFICATION':
      return { bg: '#d97706', fg: '#fff' };
    case 'SOLD':
    case 'RENTED':
      return { bg: '#2563eb', fg: '#fff' };
    case 'INACTIVE':
      return { bg: '#94a3b8', fg: '#fff' };
    default:
      return { bg: '#64748b', fg: '#fff' };
  }
}

function pickThumb(item: MyListingItem): string {
  const img = item.images?.[0];
  return img?.thumbnailUrl || img?.imageUrl || PLACEHOLDER;
}

function analyticsBars(days: MyListingAnalyticsDay[] | undefined): number[] {
  if (!days?.length) return [];
  const chronological = [...days].reverse();
  const scores = chronological.map(d => d.views + d.leads + d.messages);
  const max = Math.max(...scores, 1);
  return scores.map(s => Math.max(4, Math.round((s / max) * 32)));
}

const MyListingsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const user = useAuthStore(s => s.user);
  const accessToken = useAuthStore(s => s.accessToken);

  const [filter, setFilter] = useState<StatusFilter>('All');
  const [items, setItems] = useState<MyListingItem[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{ hasNext: boolean; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const bottomPad = Math.max(insets.bottom, 12) + 88;

  const apiStatus = filter === 'All' ? undefined : filter;

  const loadPage = useCallback(
    async (pageNum: number, mode: 'replace' | 'append', opts?: { isRefresh?: boolean }) => {
      if (mode === 'replace') setError(null);
      if (mode === 'append') setLoadingMore(true);
      else if (opts?.isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await fetchMyListings({
          page: pageNum,
          limit: 12,
          ...(apiStatus ? { status: apiStatus } : {}),
        });
        if (!mounted.current) return;
        if (!res.success) throw new Error('Could not load listings');
        const next = res.data ?? [];
        const m = res.meta;
        setMeta({ hasNext: m.hasNext, total: m.total });
        setPage(pageNum);
        if (mode === 'append') setItems(prev => [...prev, ...next]);
        else setItems(next);
      } catch (e: unknown) {
        if (!mounted.current) return;
        if (isAxiosError(e) && e.response?.status === 401) {
          setSessionExpired(true);
          setItems([]);
        } else {
          setError(e instanceof Error ? e.message : 'Something went wrong');
          if (mode === 'replace') setItems([]);
        }
      } finally {
        if (!mounted.current) return;
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [apiStatus],
  );

  useEffect(() => {
    if (!accessToken) return;
    setSessionExpired(false);
    void loadPage(1, 'replace');
  }, [accessToken, filter, loadPage]);

  const onRefresh = useCallback(() => {
    void loadPage(1, 'replace', { isRefresh: true });
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !meta?.hasNext) return;
    void loadPage(page + 1, 'append');
  }, [loadPage, loading, loadingMore, meta?.hasNext, page]);

  const goPost = useCallback(() => {
    navigation.navigate('Tabs', { screen: 'Post' });
  }, [navigation]);

  const openProfileTab = useCallback(() => {
    navigation.navigate('Tabs', { screen: 'Profile' });
  }, [navigation]);

  const filterHeader = useMemo(
    () => (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {STATUS_FILTERS.map(s => {
          const selected = filter === s;
          return (
            <TouchableOpacity
              key={s}
              onPress={() => setFilter(s)}
              style={[styles.filterChip, selected && styles.filterChipOn]}
              activeOpacity={0.85}
            >
              <Text style={[styles.filterChipText, selected && styles.filterChipTextOn]}>
                {s === 'All' ? 'All' : s.replace(/_/g, ' ')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    ),
    [filter],
  );

  const renderCard = useCallback(
    ({ item }: { item: MyListingItem }) => {
      const loc = [item.locality, item.city].filter(Boolean).join(', ');
      const priceMain = formatInrPrice(item.price, item.listingType);
      const showStrike =
        item.originalPrice > 0 && item.originalPrice !== item.price && item.listingType === 'BUY';
      const strikeLabel = showStrike ? formatInrPrice(item.originalPrice, item.listingType) : null;
      const area = item.carpetArea ?? item.builtUpArea;
      const areaLabel = area != null ? `${Math.round(area).toLocaleString('en-IN')} sq.ft` : null;
      const badge = statusBadgeColors(item.status);
      const exp = expiryCaption(item.expiresAt, item.status);
      const bars = analyticsBars(item.analytics);
      const isDraft = item.status === 'DRAFT';
      const isExpired = item.status === 'EXPIRED';

      return (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.92}
          onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
        >
          <View style={styles.cardImageWrap}>
            <Image source={{ uri: pickThumb(item) }} style={styles.cardImage} resizeMode="cover" />
            {isExpired ? <View style={styles.cardImageDim} /> : null}
            <View style={styles.badgeRow}>
              <View style={[styles.statusPill, { backgroundColor: badge.bg }]}>
                <Text style={[styles.statusPillText, { color: badge.fg }]}>{item.status.replace(/_/g, ' ')}</Text>
              </View>
              <View style={styles.flagRow}>
                {item.isVerified ? (
                  <View style={styles.flagBubble}>
                    <Icon name="shield-check" size={14} color={SECONDARY} />
                  </View>
                ) : null}
                {item.isBoosted ? (
                  <View style={styles.flagBubble}>
                    <Icon name="rocket-launch" size={14} color={PRIMARY_DEEP} />
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.cardTitleRow}>
              <View style={styles.cardTitleBlock}>
                <Text style={[styles.cardTitle, isDraft && styles.cardTitleMuted]} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.locRow}>
                  <Icon name="map-marker" size={14} color={MUTED} />
                  <Text style={styles.locText} numberOfLines={1}>
                    {loc}
                  </Text>
                </View>
              </View>
              <View style={styles.priceCol}>
                <Text style={[styles.priceMain, isDraft && styles.cardTitleMuted]}>{priceMain}</Text>
                {strikeLabel ? <Text style={styles.priceStrike}>{strikeLabel}</Text> : null}
              </View>
            </View>

            <View style={styles.pillRow}>
              {item.bhk != null ? (
                <View style={styles.specPill}>
                  <Text style={styles.specPillText}>{item.bhk} BHK</Text>
                </View>
              ) : null}
              <View style={styles.specPill}>
                <Text style={styles.specPillText}>{humanizeEnum(item.propertyType)}</Text>
              </View>
              {item.furnishing ? (
                <View style={styles.specPill}>
                  <Text style={styles.specPillText}>{humanizeEnum(item.furnishing)}</Text>
                </View>
              ) : null}
              {areaLabel ? (
                <View style={styles.specPill}>
                  <Text style={styles.specPillText}>{areaLabel}</Text>
                </View>
              ) : null}
            </View>

            {isDraft ? (
              <View style={styles.draftFooter}>
                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
                >
                  <Text style={styles.btnPrimaryText}>Finish listing</Text>
                </TouchableOpacity>
                <Text style={styles.savedAgo}>{formatRelativePosted(item.postedAt)}</Text>
              </View>
            ) : isExpired ? (
              <View style={styles.expiredFooter}>
                <TouchableOpacity
                  style={styles.btnOutline}
                  onPress={() =>
                    Alert.alert('Renew listing', 'Renewals will be available in a future update.', [
                      { text: 'OK' },
                    ])
                  }
                >
                  <Icon name="refresh" size={16} color={SECONDARY} style={{ marginRight: 6 }} />
                  <Text style={styles.btnOutlineText}>Renew listing</Text>
                </TouchableOpacity>
                {exp?.tone === 'error' ? <Text style={styles.expiredAgo}>{exp.line}</Text> : null}
              </View>
            ) : (
              <>
                <View style={styles.statsRow}>
                  <View style={styles.statGroup}>
                    <Icon name="eye-outline" size={18} color={MUTED} />
                    <Text style={styles.statNum}>{(item.viewCount ?? 0).toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.statGroup}>
                    <Icon name="account-search-outline" size={18} color={MUTED} />
                    <Text style={styles.statNum}>{(item.leadCount ?? 0).toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.statGroup}>
                    <Icon name="share-variant-outline" size={18} color={MUTED} />
                    <Text style={styles.statNum}>{(item.shareCount ?? 0).toLocaleString('en-IN')}</Text>
                  </View>
                  {exp && exp.tone !== 'error' ? (
                    <View style={styles.expiryBlock}>
                      <Icon name="calendar" size={14} color={SECONDARY} />
                      <Text style={styles.expiryGold}>{exp.line}</Text>
                    </View>
                  ) : null}
                </View>
                {bars.length > 0 ? (
                  <View style={styles.sparkRow}>
                    {bars.map((h, i) => (
                      <View key={i} style={[styles.sparkBar, { height: h }]} />
                    ))}
                  </View>
                ) : null}
              </>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [navigation],
  );

  const profileUri = user?.profile?.profileImage;

  if (!accessToken) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn} accessibilityLabel="Back">
            <Icon name="arrow-left" size={24} color={PRIMARY_DEEP} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>My listings</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <Icon name="lock-outline" size={48} color={MUTED} />
          <Text style={styles.emptyTitle}>Sign in required</Text>
          <Text style={styles.emptySub}>Log in to view and manage your property listings.</Text>
          <TouchableOpacity style={styles.btnPrimaryWide} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.btnPrimaryText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading && items.length === 0 && !error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn} accessibilityLabel="Back">
            <Icon name="arrow-left" size={24} color={PRIMARY_DEEP} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>My listings</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={NAVY} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn} accessibilityLabel="Back">
          <Icon name="arrow-left" size={24} color={PRIMARY_DEEP} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>My listings</Text>
        <TouchableOpacity onPress={openProfileTab} style={styles.avatarBtn} accessibilityLabel="Profile">
          {profileUri ? (
            <Image source={{ uri: profileUri }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarFallback}>
              <Icon name="account" size={22} color={NAVY} />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {sessionExpired ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>Session expired. Sign in again to load your listings.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.errorLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => void loadPage(1, 'replace')}>
            <Text style={styles.btnPrimaryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={items}
        keyExtractor={i => i.id}
        renderItem={renderCard}
        ListHeaderComponent={filterHeader}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomPad }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NAVY} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.35}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator style={{ marginVertical: 16 }} color={NAVY} /> : <View style={{ height: 16 }} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <View style={styles.emptyIconCircle}>
                <Icon name="home-city-outline" size={56} color="#c4c6ce" />
              </View>
              <Text style={styles.emptyTitle}>No listings yet</Text>
              <Text style={styles.emptySub}>Add your first property to reach buyers and tenants on Ghar Dekho.</Text>
              <TouchableOpacity style={styles.btnPrimaryWide} onPress={goPost}>
                <Text style={styles.btnPrimaryText}>Post a property</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[styles.fab, { bottom: Math.max(insets.bottom, 12) + 72 }]}
        onPress={goPost}
        activeOpacity={0.9}
        accessibilityLabel="Post a property"
      >
        <Icon name="plus" size={30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SURFACE },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: SURFACE,
  },
  iconBtn: { padding: 8 },
  screenTitle: {
    flex: 1,
    marginLeft: 4,
    fontSize: 20,
    fontWeight: '600',
    color: PRIMARY_DEEP,
    letterSpacing: -0.3,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(209,161,78,0.35)',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarFallback: {
    flex: 1,
    backgroundColor: '#e9e7ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterScroll: { maxHeight: 52 },
  filterRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#f5f3f6',
  },
  filterChipOn: {
    backgroundColor: PRIMARY_DEEP,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#44474d',
  },
  filterChipTextOn: { color: '#fff' },
  listContent: { paddingHorizontal: 20, paddingTop: 0 },
  card: {
    borderRadius: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e9e7ea',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 3 },
    }),
  },
  cardImageWrap: { height: 200, width: '100%', backgroundColor: '#e2e8f0' },
  cardImage: { width: '100%', height: '100%' },
  cardImageDim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(220,38,38,0.08)' },
  badgeRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPillText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  flagRow: { flexDirection: 'row', gap: 4 },
  flagBubble: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { padding: 18 },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  cardTitleBlock: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: PRIMARY_DEEP },
  cardTitleMuted: { opacity: 0.85 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  locText: { fontSize: 13, color: MUTED, flex: 1 },
  priceCol: { alignItems: 'flex-end' },
  priceMain: { fontSize: 18, fontWeight: '900', color: PRIMARY_DEEP },
  priceStrike: { fontSize: 11, color: '#74777e', textDecorationLine: 'line-through', marginTop: 2 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  specPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#f5f3f6',
  },
  specPillText: { fontSize: 11, fontWeight: '700', color: '#44474d' },
  statsRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#e9e7ea',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  statGroup: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statNum: { fontSize: 12, fontWeight: '800', color: MUTED },
  expiryBlock: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4 },
  expiryGold: { fontSize: 10, fontWeight: '800', color: SECONDARY },
  sparkRow: {
    marginTop: 10,
    height: 36,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  sparkBar: {
    flex: 1,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    backgroundColor: PRIMARY_DEEP,
    opacity: 0.85,
    minHeight: 4,
  },
  draftFooter: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#e9e7ea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  expiredFooter: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#e9e7ea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  btnPrimary: {
    backgroundColor: PRIMARY_DEEP,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  btnPrimaryWide: {
    backgroundColor: PRIMARY_DEEP,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 999,
    marginTop: 8,
  },
  btnPrimaryText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  btnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: SECONDARY,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  btnOutlineText: { color: SECONDARY, fontSize: 12, fontWeight: '800' },
  savedAgo: { fontSize: 10, color: '#74777e', fontStyle: 'italic' },
  expiredAgo: { fontSize: 10, fontWeight: '800', color: '#dc2626' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 16 },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: '#f5f3f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: PRIMARY_DEEP, marginBottom: 8 },
  emptySub: { fontSize: 14, color: MUTED, textAlign: 'center', maxWidth: 260, marginBottom: 8 },
  errorBox: { padding: 20, alignItems: 'center' },
  errorText: { color: '#92400e', textAlign: 'center', marginBottom: 12 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fef3c7',
  },
  errorBannerText: { flex: 1, fontSize: 13, color: '#78350f', marginRight: 8 },
  errorLink: { fontSize: 13, fontWeight: '800', color: NAVY },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: SECONDARY,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 10 },
    }),
  },
});

export default MyListingsScreen;

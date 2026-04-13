/**
 * @file WishlistScreen.tsx
 * @description Saved properties from GET /api/wishlist — matches Stitch-style cards; no extra bottom tab bar.
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
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { isAxiosError } from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import type { MainStackParamList } from '../../navigation/types';
import type { WishlistRow } from '../../types/wishlist.api.types';
import { fetchWishlist, removeWishlistItem } from '../../services/wishlist.service';
import { formatInrPrice } from '../../utils/homePropertyMappers';
import { useAuthStore } from '../../stores/auth.store';
import { PROPERTY_PLACEHOLDER_IMAGE } from '../../constants/images';

const PRIMARY = '#00152e';
const MUTED = '#44474d';
const SURFACE = '#faf9fc';
const SECONDARY = '#D1A14E';
const ERROR = '#ba1a1a';
const NOTE_BG = 'rgba(255, 222, 172, 0.35)';

type Nav = NativeStackNavigationProp<MainStackParamList>;

function humanizeEnum(s: string): string {
  return s
    .split(/[_\s]+/)
    .filter(Boolean)
    .map(w => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

function formatSavedAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Saved just now';
  if (mins < 60) return `Saved ${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Saved ${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  return `Saved ${days} day${days === 1 ? '' : 's'} ago`;
}

function statusPillStyle(status: string): { bg: string; fg: string } {
  switch (status) {
    case 'ACTIVE':
      return { bg: 'rgba(0,21,46,0.88)', fg: '#fff' };
    case 'SOLD':
    case 'REJECTED':
      return { bg: ERROR, fg: '#fff' };
    case 'EXPIRED':
      return { bg: '#dc2626', fg: '#fff' };
    case 'DRAFT':
      return { bg: '#e3e2e5', fg: '#44474d' };
    case 'UNDER_VERIFICATION':
      return { bg: '#d97706', fg: '#fff' };
    default:
      return { bg: '#64748b', fg: '#fff' };
  }
}

function pickImage(p: WishlistRow['property']): string {
  const img = p.images?.[0];
  return img?.thumbnailUrl || img?.imageUrl || PROPERTY_PLACEHOLDER_IMAGE;
}

const WishlistScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const accessToken = useAuthStore(s => s.accessToken);

  const [items, setItems] = useState<WishlistRow[]>([]);
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

  const loadPage = useCallback(
    async (pageNum: number, mode: 'replace' | 'append', opts?: { isRefresh?: boolean }) => {
      if (mode === 'replace') setError(null);
      if (mode === 'append') setLoadingMore(true);
      else if (opts?.isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await fetchWishlist({ page: pageNum, limit: 12 });
        if (!mounted.current) return;
        if (!res.success) throw new Error('Could not load wishlist');
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
    [],
  );

  useEffect(() => {
    if (!accessToken) return;
    setSessionExpired(false);
    void loadPage(1, 'replace');
  }, [accessToken, loadPage]);

  const onRefresh = useCallback(() => {
    void loadPage(1, 'replace', { isRefresh: true });
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !meta?.hasNext) return;
    void loadPage(page + 1, 'append');
  }, [loadPage, loading, loadingMore, meta?.hasNext, page]);

  const confirmRemove = useCallback(
    (row: WishlistRow) => {
      Alert.alert('Remove from wishlist?', row.property.title, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeWishlistItem(row.propertyId);
              if (!mounted.current) return;
              setItems(prev => prev.filter(i => i.id !== row.id));
              setMeta(m => (m ? { ...m, total: Math.max(0, m.total - 1) } : m));
            } catch (e: unknown) {
              if (isAxiosError(e) && e.response?.status === 401) {
                setSessionExpired(true);
              } else {
                Alert.alert('Could not remove', e instanceof Error ? e.message : 'Try again.');
              }
            }
          },
        },
      ]);
    },
    [],
  );

  const onMorePress = useCallback(() => {
    Alert.alert('Wishlist', 'Sort and bulk actions will be available in a future update.', [{ text: 'OK' }]);
  }, []);

  const browseHome = useCallback(() => {
    navigation.navigate('Tabs', { screen: 'Home' });
  }, [navigation]);

  const titleText = useMemo(() => {
    if (meta == null && loading && items.length === 0) return 'Wishlist';
    return `Wishlist (${meta?.total ?? items.length})`;
  }, [meta, loading, items.length]);

  const renderSkeleton = useCallback(
    () => (
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonImg} />
        <View style={styles.skeletonLineLg} />
        <View style={styles.skeletonLineSm} />
        <View style={styles.skeletonPills}>
          <View style={styles.skeletonPill} />
          <View style={styles.skeletonPill} />
        </View>
      </View>
    ),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: WishlistRow }) => {
      const p = item.property;
      const loc = [p.locality, p.city].filter(Boolean).join(', ');
      const active = p.status === 'ACTIVE';
      const pill = statusPillStyle(p.status);
      const priceMain = formatInrPrice(p.price, p.listingType);
      const showStrike =
        p.originalPrice > 0 && p.originalPrice !== p.price && p.listingType === 'BUY';
      const strikeLabel = showStrike ? formatInrPrice(p.originalPrice, p.listingType) : null;
      const area = p.carpetArea != null ? `${Math.round(p.carpetArea).toLocaleString('en-IN')} sq.ft` : null;

      return (
        <TouchableOpacity
          style={[styles.card, !active && styles.cardMuted]}
          activeOpacity={0.92}
          onPress={() => navigation.navigate('PropertyDetail', { propertyId: p.id })}
        >
          <View style={styles.imageWrap}>
            <Image
              source={{ uri: pickImage(p) }}
              style={[styles.cardImage, !active && styles.cardImageDim]}
              resizeMode="cover"
            />
            {!active ? <View style={styles.imageOverlay} /> : null}
            <TouchableOpacity
              style={styles.heartBtn}
              onPress={() => confirmRemove(item)}
              hitSlop={12}
              accessibilityLabel="Remove from wishlist"
            >
              <Icon name="heart" size={22} color={ERROR} />
            </TouchableOpacity>
            <View
              style={[
                styles.statusPill,
                p.status === 'ACTIVE' ? styles.statusPillActive : styles.statusPillTop,
                { backgroundColor: pill.bg },
              ]}
            >
              <Text style={[styles.statusPillText, { color: pill.fg }]}>{p.status.replace(/_/g, ' ')}</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {p.title}
            </Text>
            <View style={styles.locRow}>
              <Icon name="map-marker" size={14} color={MUTED} />
              <Text style={styles.locText} numberOfLines={1}>
                {loc}
              </Text>
            </View>

            <View style={styles.pillRow}>
              <View style={styles.specPill}>
                <Text style={styles.specPillText}>{humanizeEnum(p.propertyType)}</Text>
              </View>
              {p.bhk != null ? (
                <View style={styles.specPill}>
                  <Text style={styles.specPillText}>{p.bhk} BHK</Text>
                </View>
              ) : null}
              {area ? (
                <View style={styles.specPill}>
                  <Text style={styles.specPillText}>{area}</Text>
                </View>
              ) : null}
              {p.furnishing ? (
                <View style={styles.specPillAccent}>
                  <Text style={styles.specPillAccentText}>{humanizeEnum(p.furnishing)}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceMain}>{priceMain}</Text>
              {strikeLabel ? <Text style={styles.priceStrike}>{strikeLabel}</Text> : null}
            </View>

            {item.notes ? (
              <View style={styles.noteBox}>
                <Text style={styles.noteText}>{item.notes}</Text>
              </View>
            ) : null}

            <View style={styles.footerRow}>
              <Text style={styles.savedText}>{formatSavedAgo(item.createdAt)}</Text>
              {p.isVerified ? <Icon name="shield-check" size={22} color={SECONDARY} /> : null}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation, confirmRemove],
  );

  if (!accessToken) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn} accessibilityLabel="Back">
            <Icon name="arrow-left" size={24} color={PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Wishlist</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <Icon name="lock-outline" size={48} color="#777779" />
          <Text style={styles.emptyTitle}>Sign in required</Text>
          <Text style={styles.emptySub}>Log in to view properties you have saved.</Text>
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
            <Icon name="arrow-left" size={24} color={PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Wishlist</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn} accessibilityLabel="Back">
          <Icon name="arrow-left" size={24} color={PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.screenTitle} numberOfLines={1}>
          {titleText}
        </Text>
        <TouchableOpacity onPress={onMorePress} style={styles.iconBtn} accessibilityLabel="More options">
          <Icon name="dots-vertical" size={22} color={PRIMARY} />
        </TouchableOpacity>
      </View>

      {sessionExpired ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>Session expired. Sign in again.</Text>
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
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomPad }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.35}
        ListFooterComponent={
          loadingMore ? (
            <View style={{ marginTop: 8 }}>{renderSkeleton()}</View>
          ) : (
            <View style={{ height: 16 }} />
          )
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <View style={styles.emptyIconCircle}>
                <Icon name="heart-outline" size={48} color="#c4c6ce" />
              </View>
              <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
              <Text style={styles.emptySub}>Start exploring homes and save your favorites here.</Text>
              <TouchableOpacity style={styles.btnPrimaryWide} onPress={browseHome}>
                <Text style={styles.btnPrimaryText}>Browse properties</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SURFACE },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: SURFACE,
    zIndex: 10,
  },
  iconBtn: { padding: 8 },
  screenTitle: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 22,
    fontWeight: '600',
    color: PRIMARY,
    letterSpacing: -0.3,
  },
  listContent: { paddingHorizontal: 24, paddingTop: 8, gap: 0 },
  card: {
    borderRadius: 16,
    backgroundColor: '#fff',
    marginBottom: 28,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(196,198,206,0.25)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 4 },
    }),
  },
  cardMuted: { opacity: 0.92 },
  imageWrap: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: '#e9e7ea',
    position: 'relative',
  },
  cardImage: { width: '100%', height: '100%' },
  cardImageDim: { opacity: 0.92 },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,21,46,0.18)',
  },
  heartBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 4 },
    }),
  },
  statusPill: {
    position: 'absolute',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusPillActive: {
    left: 14,
    bottom: 14,
  },
  statusPillTop: {
    left: 14,
    top: 14,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cardBody: { padding: 18 },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: PRIMARY,
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
  locText: { fontSize: 14, fontWeight: '500', color: MUTED, flex: 1 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  specPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#e9e7ea',
  },
  specPillText: { fontSize: 11, fontWeight: '700', color: '#1b1c1e' },
  specPillAccent: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#002f2f',
  },
  specPillAccentText: { fontSize: 11, fontWeight: '800', color: '#509d9b' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 12, flexWrap: 'wrap' },
  priceMain: { fontSize: 24, fontWeight: '900', color: PRIMARY },
  priceStrike: { fontSize: 14, color: MUTED, textDecorationLine: 'line-through' },
  noteBox: {
    backgroundColor: NOTE_BG,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  noteText: {
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: '600',
    color: '#785300',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(196,198,206,0.35)',
  },
  savedText: { fontSize: 11, fontWeight: '600', color: MUTED },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 16 },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 999,
    backgroundColor: '#e9e7ea',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: PRIMARY, marginBottom: 8 },
  emptySub: { fontSize: 14, color: MUTED, textAlign: 'center', maxWidth: 240, marginBottom: 16 },
  btnPrimary: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  btnPrimaryWide: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 999,
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY,
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 6 },
    }),
  },
  btnPrimaryText: { color: '#fff', fontSize: 14, fontWeight: '800' },
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
  errorLink: { fontSize: 13, fontWeight: '800', color: PRIMARY },
  skeletonCard: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(196,198,206,0.2)',
    padding: 14,
    marginBottom: 8,
  },
  skeletonImg: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#efedf0',
    marginBottom: 12,
  },
  skeletonLineLg: { height: 22, width: '66%', borderRadius: 6, backgroundColor: '#efedf0', marginBottom: 8 },
  skeletonLineSm: { height: 14, width: '50%', borderRadius: 6, backgroundColor: '#efedf0', marginBottom: 12 },
  skeletonPills: { flexDirection: 'row', gap: 8 },
  skeletonPill: { height: 30, width: 64, borderRadius: 999, backgroundColor: '#efedf0' },
});

export default WishlistScreen;

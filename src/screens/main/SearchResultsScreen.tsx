/**
 * @file SearchResultsScreen.tsx
 * @description Lists properties from GET /api/properties/search with query + category filters, pagination.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { MainStackParamList } from '../../navigation/types';
import type { PropertyCategory } from '../../types/property.types';
import type { PropertyListItem } from '../../types/home.api.types';
import { searchProperties } from '../../services/property.service';
import { homeCategoryToApiFilters, formatInrPrice } from '../../utils/homePropertyMappers';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80';
const NAVY = '#122A47';
const MUTED = '#777779';

const CATEGORY_VALUES: PropertyCategory[] = ['Buy', 'Rent', 'Plot/Land', 'Co-working', 'Commercial'];

function parseCategory(raw?: string): PropertyCategory {
  if (raw && CATEGORY_VALUES.includes(raw as PropertyCategory)) {
    return raw as PropertyCategory;
  }
  return 'Buy';
}

type Props = NativeStackScreenProps<MainStackParamList, 'SearchResults'>;
type Nav = NativeStackNavigationProp<MainStackParamList>;

const SearchResultsScreen: React.FC<Props> = () => {
  const route = useRoute<Props['route']>();
  const navigation = useNavigation<Nav>();

  const routeQuery = route.params?.query ?? '';
  const routeCategory = parseCategory(route.params?.category);

  const [queryText, setQueryText] = useState(routeQuery);
  const [items, setItems] = useState<PropertyListItem[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{ hasNext: boolean; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listMounted = useRef(true);

  useEffect(() => {
    listMounted.current = true;
    return () => {
      listMounted.current = false;
    };
  }, []);

  const filters = useMemo(() => homeCategoryToApiFilters(routeCategory), [routeCategory]);

  const fetchPage = useCallback(
    async (
      pageNum: number,
      mode: 'replace' | 'append',
      opts?: { isRefresh?: boolean; qOverride?: string },
    ) => {
      const raw = opts?.qOverride !== undefined ? opts.qOverride : queryText;
      const q = raw.trim() || undefined;
      if (mode === 'replace') setError(null);
      if (mode === 'append') {
        setLoadingMore(true);
      } else if (opts?.isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const res = await searchProperties({
          q,
          ...filters,
          page: pageNum,
          limit: 20,
          sort: 'newest',
        });
        if (!listMounted.current) return;
        if (!res.success) {
          throw new Error('Search failed');
        }
        const next = res.data ?? [];
        const m = res.meta;
        setMeta({ hasNext: m.hasNext, total: m.total });
        setPage(pageNum);
        if (mode === 'append') {
          setItems(prev => [...prev, ...next]);
        } else {
          setItems(next);
        }
      } catch (e) {
        if (!listMounted.current) return;
        setError(e instanceof Error ? e.message : 'Could not load results');
        if (mode === 'replace') setItems([]);
      } finally {
        if (!listMounted.current) return;
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [queryText, filters],
  );

  useEffect(() => {
    const q = route.params?.query ?? '';
    setQueryText(q);
    void fetchPage(1, 'replace', { qOverride: q });
    // Only react to navigation params (e.g. Home → Search), not draft `queryText` while typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchPage changes with queryText; including it refetches every keystroke
  }, [route.params?.query, route.params?.category]);

  const onRefresh = useCallback(() => {
    void fetchPage(1, 'replace', { isRefresh: true });
  }, [fetchPage]);

  const submitSearch = useCallback(() => {
    const trimmed = queryText.trim();
    navigation.setParams({ query: trimmed || undefined, category: routeCategory });
  }, [navigation, queryText, routeCategory]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !meta?.hasNext) return;
    void fetchPage(page + 1, 'append');
  }, [loading, loadingMore, meta?.hasNext, page, fetchPage]);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const renderItem = useCallback(
    ({ item }: { item: PropertyListItem }) => {
      const img = item.images?.[0]?.imageUrl || item.images?.[0]?.thumbnailUrl || PLACEHOLDER;
      const loc = [item.locality, item.city].filter(Boolean).join(', ');
      const priceLabel = formatInrPrice(item.price, item.listingType);
      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
          activeOpacity={0.88}
        >
          <Image source={{ uri: img }} style={styles.thumb} resizeMode="cover" />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.cardLoc} numberOfLines={1}>
              {loc}
            </Text>
            <Text style={styles.cardPrice}>{priceLabel}</Text>
            <Text style={styles.cardMeta}>
              {[item.bhk ? `${item.bhk} BHK` : null, item.listingType, item.propertyType]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          </View>
          <Icon name="chevron-right" size={22} color={MUTED} style={styles.chevron} />
        </TouchableOpacity>
      );
    },
    [navigation],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.searchBarWrap}>
        <Icon name="magnify" size={20} color={NAVY} style={styles.searchIcon} />
        <TextInput
          value={queryText}
          onChangeText={setQueryText}
          placeholder="Search by area, title…"
          placeholderTextColor="rgba(18,42,71,0.4)"
          style={styles.searchInput}
          returnKeyType="search"
          onSubmitEditing={submitSearch}
          clearButtonMode="while-editing"
        />
        <TouchableOpacity onPress={submitSearch} style={styles.goBtn} hitSlop={8}>
          <Text style={styles.goBtnText}>Go</Text>
        </TouchableOpacity>
      </View>
    ),
    [queryText, submitSearch],
  );

  if (loading && items.length === 0 && !error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={goBack} style={styles.iconBtn} accessibilityLabel="Back">
            <Icon name="arrow-left" size={24} color={NAVY} />
          </TouchableOpacity>
          <Text style={styles.title}>Search</Text>
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
        <TouchableOpacity onPress={goBack} style={styles.iconBtn} accessibilityLabel="Back">
          <Icon name="arrow-left" size={24} color={NAVY} />
        </TouchableOpacity>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Results</Text>
          {meta != null ? (
            <Text style={styles.subCount}>
              {meta.total} listing{meta.total === 1 ? '' : 's'} · {routeCategory}
            </Text>
          ) : null}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retry} onPress={() => void fetchPage(1, 'replace')}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NAVY} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.35}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={{ marginVertical: 16 }} color={NAVY} />
          ) : (
            <View style={{ height: 24 }} />
          )
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Icon name="home-search-outline" size={48} color={MUTED} />
              <Text style={styles.emptyTitle}>No properties found</Text>
              <Text style={styles.emptySub}>Try another keyword or category from Home.</Text>
            </View>
          ) : null
        }
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#faf9fc',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  iconBtn: {
    padding: 8,
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: NAVY,
  },
  subCount: {
    fontSize: 11,
    color: MUTED,
    marginTop: 2,
    fontWeight: '600',
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
    paddingHorizontal: 4,
    backgroundColor: '#F1F3F5',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(18,42,71,0.08)',
  },
  searchIcon: {
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    paddingHorizontal: 8,
    fontSize: 16,
    color: NAVY,
    fontWeight: '500',
  },
  goBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 6,
  },
  goBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: NAVY,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e9e7ea',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  thumb: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
  },
  cardBody: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: NAVY,
  },
  cardLoc: {
    fontSize: 12,
    color: MUTED,
    marginTop: 4,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D1A14E',
    marginTop: 6,
  },
  cardMeta: {
    fontSize: 11,
    color: MUTED,
    marginTop: 4,
    fontWeight: '600',
  },
  chevron: {
    marginLeft: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBox: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#92400e',
    textAlign: 'center',
    marginBottom: 12,
  },
  retry: {
    backgroundColor: NAVY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: NAVY,
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    color: MUTED,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SearchResultsScreen;

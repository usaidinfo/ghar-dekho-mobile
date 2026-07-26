import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import RecentlyViewedItem from '../../components/home/RecentlyViewedItem';
import SectionHeader from '../../components/home/SectionHeader';
import { fetchRecentlyViewed } from '../../services/user.service';
import { fetchWishlist } from '../../services/wishlist.service';
import { useAuthStore } from '../../stores/auth.store';
import { PROPERTY_PLACEHOLDER_IMAGE } from '../../constants/images';
import { formatInrPrice } from '../../utils/homePropertyMappers';
import type { RecentlyViewedProperty } from '../../types/property.types';
import type { BottomTabParamList, MainStackParamList } from '../../navigation/types';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'History'>,
  NativeStackNavigationProp<MainStackParamList>
>;

type HistoryFilter = 'VIEWED' | 'SAVED';

const FILTERS: { label: string; value: HistoryFilter }[] = [
  { label: 'Viewed', value: 'VIEWED' },
  { label: 'Saved', value: 'SAVED' },
];

const NAVY = '#122A47';
const SURFACE = '#faf9fc';
const SURF_HIGH = '#E9E7EA';
const ON_SURF_VAR = '#44474D';

const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const accessToken = useAuthStore(s => s.accessToken);

  const [filter, setFilter] = useState<HistoryFilter>('VIEWED');
  const [viewed, setViewed] = useState<RecentlyViewedProperty[]>([]);
  const [saved, setSaved] = useState<RecentlyViewedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const mapViewed = useCallback((rows: Awaited<ReturnType<typeof fetchRecentlyViewed>>) => {
    return rows.map(p => {
      const img = p.images?.[0];
      return {
        id: p.id,
        title: p.title,
        locality: p.locality,
        city: p.city,
        priceLabel: formatInrPrice(p.price, p.listingType || 'BUY'),
        thumbnailUrl: img?.thumbnailUrl || img?.imageUrl || PROPERTY_PLACEHOLDER_IMAGE,
        viewedAt: p.viewedAt,
      } satisfies RecentlyViewedProperty;
    });
  }, []);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!accessToken) {
        setViewed([]);
        setSaved([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      if (isRefresh) setRefreshing(true);
      try {
        const [viewedRows, wishlist] = await Promise.all([
          fetchRecentlyViewed().catch(() => []),
          fetchWishlist({ page: 1, limit: 50 }).catch(() => null),
        ]);
        setViewed(mapViewed(viewedRows));
        const savedRows = (wishlist?.data ?? []).map(row => {
          const p = row.property;
          const img = p.images?.[0];
          return {
            id: p.id,
            title: p.title,
            locality: p.locality,
            city: p.city,
            priceLabel: formatInrPrice(p.price, p.listingType),
            thumbnailUrl: img?.thumbnailUrl || img?.imageUrl || PROPERTY_PLACEHOLDER_IMAGE,
            viewedAt: row.createdAt,
          } satisfies RecentlyViewedProperty;
        });
        setSaved(savedRows);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken, mapViewed],
  );

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const items = filter === 'VIEWED' ? viewed : saved;

  const subtitle = useMemo(() => {
    if (filter === 'VIEWED') {
      return items.length
        ? `${items.length} propert${items.length === 1 ? 'y' : 'ies'} you browsed`
        : 'Properties you open will show up here';
    }
    return items.length
      ? `${items.length} saved listing${items.length === 1 ? '' : 's'}`
      : 'Heart a listing to save it here';
  }, [filter, items.length]);

  const openProperty = (id: string) => {
    navigation.navigate('PropertyDetail', { propertyId: id });
  };

  const emptyIcon = !accessToken
    ? 'lock-outline'
    : filter === 'VIEWED'
      ? 'history'
      : 'heart-outline';
  const emptyTitle = !accessToken
    ? 'Sign in to see history'
    : filter === 'VIEWED'
      ? 'No views yet'
      : 'No saved homes';
  const emptySubtitle = !accessToken
    ? 'Your recently viewed and saved homes will appear here.'
    : filter === 'VIEWED'
      ? 'Browse listings on Home — they’ll land here automatically.'
      : 'Tap the heart on a property to save it for later.';

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        {accessToken ? (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Wishlist')}
            accessibilityLabel="Open wishlist"
          >
            <Icon name="heart-outline" size={22} color={NAVY} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 22 }} />
        )}
      </View>

      {accessToken ? (
        <View style={styles.filtersWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersRow}
          >
            {FILTERS.map(f => {
              const active = filter === f.value;
              return (
                <TouchableOpacity
                  key={f.value}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setFilter(f.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {accessToken ? (
        <SectionHeader
          title={filter === 'VIEWED' ? 'Recently viewed' : 'Saved homes'}
          subtitle={subtitle}
        />
      ) : null}

      {!accessToken ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <Icon name={emptyIcon} size={36} color={ON_SURF_VAR} />
          </View>
          <Text style={styles.emptyTitle}>{emptyTitle}</Text>
          <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
          <TouchableOpacity
            style={styles.signInBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.signInText}>Go to Profile</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <ActivityIndicator style={{ marginTop: 48 }} color={NAVY} size="large" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => `${filter}-${item.id}`}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={NAVY} />
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <RecentlyViewedItem
                property={item}
                onPress={() => openProperty(item.id)}
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <Icon name={emptyIcon} size={36} color={ON_SURF_VAR} />
              </View>
              <Text style={styles.emptyTitle}>{emptyTitle}</Text>
              <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: SURFACE },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: NAVY,
    letterSpacing: -0.4,
  },
  filtersWrap: { height: 44, marginBottom: 4 },
  filtersRow: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: SURF_HIGH,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  chipActive: { backgroundColor: NAVY },
  chipText: { fontSize: 13, fontWeight: '600', color: ON_SURF_VAR },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    flexGrow: 1,
  },
  row: { marginBottom: 12 },
  emptyWrap: {
    alignItems: 'center',
    marginTop: 72,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: SURF_HIGH,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: NAVY,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: ON_SURF_VAR,
    textAlign: 'center',
    lineHeight: 18,
  },
  signInBtn: {
    marginTop: 12,
    backgroundColor: NAVY,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999,
  },
  signInText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});

export default HistoryScreen;

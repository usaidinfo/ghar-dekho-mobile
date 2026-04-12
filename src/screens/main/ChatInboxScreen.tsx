/**
 * @file ChatInboxScreen.tsx
 * @description Conversation list from GET /api/chat/sessions — Stitch-style layout; no duplicate tab bar.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { isAxiosError } from 'axios';

import type { ChatThreadParams, MainStackParamList } from '../../navigation/types';
import type { ChatSessionRow } from '../../types/chat.api.types';
import { fetchChatSessions } from '../../services/chat.service';
import { useAuthStore } from '../../stores/auth.store';
import ChatInboxHeader from '../../components/chat/ChatInboxHeader';
import ChatFilterChips, { type InboxFilter } from '../../components/chat/ChatFilterChips';
import ChatSessionCard from '../../components/chat/ChatSessionCard';

type Nav = NativeStackNavigationProp<MainStackParamList>;

function applyFilter(items: ChatSessionRow[], f: InboxFilter): ChatSessionRow[] {
  if (f === 'all') return items;
  if (f === 'unread') return items.filter(i => i.unreadCount > 0);
  if (f === 'properties') return items.filter(i => i.property != null);
  if (f === 'direct') return items.filter(i => i.property == null);
  return items;
}

const ChatInboxScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const accessToken = useAuthStore(s => s.accessToken);

  const [filter, setFilter] = useState<InboxFilter>('all');
  const [rawItems, setRawItems] = useState<ChatSessionRow[]>([]);
  const [meta, setMeta] = useState<{ total: number; hasNext: boolean } | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const bottomPad = Math.max(insets.bottom, 12) + 88;

  const load = useCallback(async (pageNum: number, mode: 'replace' | 'append', opts?: { isRefresh?: boolean }) => {
    if (mode === 'replace') setError(null);
    if (mode === 'append') setLoadingMore(true);
    else if (opts?.isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetchChatSessions({ page: pageNum, limit: 25 });
      if (!mounted.current) return;
      if (!res.success) throw new Error('Could not load messages');
      const next = res.data ?? [];
      const m = res.meta;
      setMeta({ total: m.total, hasNext: m.hasNext });
      setPage(pageNum);
      if (mode === 'append') setRawItems(prev => [...prev, ...next]);
      else setRawItems(next);
    } catch (e: unknown) {
      if (!mounted.current) return;
      if (isAxiosError(e) && e.response?.status === 401) {
        setError('Please sign in again.');
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load');
      }
      if (mode === 'replace') setRawItems([]);
    } finally {
      if (!mounted.current) return;
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    void load(1, 'replace');
  }, [accessToken, load]);

  const onRefresh = useCallback(() => {
    void load(1, 'replace', { isRefresh: true });
  }, [load]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !meta?.hasNext) return;
    void load(page + 1, 'append');
  }, [load, loading, loadingMore, meta?.hasNext, page]);

  const filtered = useMemo(() => applyFilter(rawItems, filter), [rawItems, filter]);

  const openThread = useCallback(
    (s: ChatSessionRow) => {
      const p: ChatThreadParams = {
        sessionId: s.id,
        peerName: [s.otherUser?.profile?.firstName, s.otherUser?.profile?.lastName].filter(Boolean).join(' ').trim(),
        peerImage: s.otherUser?.profile?.profileImage,
        propertyId: s.property?.id ?? null,
        propertyTitle: s.property?.title ?? null,
        propertyThumb: s.property?.images?.[0]?.thumbnailUrl ?? null,
        propertyPrice: s.property?.price ?? null,
      };
      navigation.navigate('ChatThread', p);
    },
    [navigation],
  );

  const title = useMemo(() => {
    if (meta == null && loading) return 'Messages';
    return `Messages (${meta?.total ?? rawItems.length})`;
  }, [meta, loading, rawItems.length]);

  if (!accessToken) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ChatInboxHeader title="Messages" />
        <View style={styles.center}>
          <Text style={styles.err}>Sign in to view your conversations.</Text>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.btnText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading && rawItems.length === 0 && !error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ChatInboxHeader title="Messages" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00152e" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ChatInboxHeader
        title={title}
        onSearchPress={() => Alert.alert('Search', 'Inbox search will be available in a future update.')}
        onMorePress={() => Alert.alert('Messages', 'More options coming soon.')}
      />
      <ChatFilterChips value={filter} onChange={setFilter} />
      {error ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{error}</Text>
          <TouchableOpacity onPress={() => void load(1, 'replace')}>
            <Text style={styles.link}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={({ item }) => <ChatSessionCard session={item} onPress={openThread} />}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00152e" />}
        onEndReached={filter === 'all' ? loadMore : undefined}
        onEndReachedThreshold={0.3}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={{ margin: 16 }} color="#00152e" /> : null}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyTitle}>No conversations</Text>
            <Text style={styles.emptySub}>Open a listing and tap Chat to reach an owner or agent.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#faf9fc' },
  list: { paddingHorizontal: 16, paddingTop: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  err: { fontSize: 15, color: '#44474d', textAlign: 'center', marginBottom: 16 },
  btn: { backgroundColor: '#00152e', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 999 },
  btnText: { color: '#fff', fontWeight: '800' },
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fef3c7',
  },
  bannerText: { flex: 1, color: '#78350f', fontSize: 13 },
  link: { fontWeight: '800', color: '#00152e' },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#00152e', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#44474d', textAlign: 'center', maxWidth: 280 },
});

export default ChatInboxScreen;

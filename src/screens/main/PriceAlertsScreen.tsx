/**
 * PriceAlertsScreen — list / remove buyer price drop alerts.
 */
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

import { deletePriceAlert, fetchPriceAlerts, type PriceAlertItem } from '../../services/alert.service';
import type { MainStackParamList } from '../../navigation/types';

const NAVY = '#122A47';
const SURFACE = '#faf9fc';
const MUTED = '#777779';
const GOLD = '#D1A14E';

type Nav = NativeStackNavigationProp<MainStackParamList>;

const PriceAlertsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<PriceAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (opts?: { refresh?: boolean }) => {
    if (opts?.refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await fetchPriceAlerts();
      setItems(data);
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: e instanceof Error ? e.message : 'Could not load alerts',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onDelete = (alert: PriceAlertItem) => {
    Alert.alert('Remove alert?', `Stop watching ${alert.property?.title ?? 'this property'}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePriceAlert(alert.id);
            setItems(prev => prev.filter(i => i.id !== alert.id));
            Toast.show({ type: 'success', text1: 'Alert removed' });
          } catch (e) {
            Toast.show({
              type: 'error',
              text1: e instanceof Error ? e.message : 'Could not remove',
            });
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={22} color={NAVY} />
        </TouchableOpacity>
        <Text style={styles.title}>Price alerts</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={NAVY} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void load({ refresh: true })} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="bell-outline" size={48} color="#c4c6ce" />
              <Text style={styles.emptyTitle}>No price alerts yet</Text>
              <Text style={styles.emptySub}>
                Open any property and tap “Price alert” to get notified when the price drops.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const p = item.property;
            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.propertyId })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {p?.title ?? 'Property'}
                  </Text>
                  <Text style={styles.cardMeta} numberOfLines={1}>
                    {[p?.locality, p?.city].filter(Boolean).join(', ') || '—'}
                  </Text>
                  <Text style={styles.cardTarget}>
                    Alert below ₹{Number(item.targetPrice).toLocaleString('en-IN')}
                  </Text>
                  {p?.price != null ? (
                    <Text style={styles.cardCurrent}>
                      Current ₹{Number(p.price).toLocaleString('en-IN')}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  onPress={() => onDelete(item)}
                  style={styles.deleteBtn}
                  hitSlop={8}
                >
                  <Icon name="trash-can-outline" size={20} color="#b42318" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

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
    backgroundColor: '#f5f3f6',
  },
  title: { fontSize: 18, fontWeight: '800', color: NAVY },
  list: { padding: 16, paddingBottom: 40, gap: 10 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 28, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: NAVY, marginTop: 8 },
  emptySub: { fontSize: 13, color: MUTED, textAlign: 'center', lineHeight: 18 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e3e2e5',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: NAVY },
  cardMeta: { fontSize: 12, color: MUTED, marginTop: 2 },
  cardTarget: { fontSize: 13, fontWeight: '700', color: GOLD, marginTop: 8 },
  cardCurrent: { fontSize: 12, color: MUTED, marginTop: 2 },
  deleteBtn: { padding: 8 },
});

export default PriceAlertsScreen;

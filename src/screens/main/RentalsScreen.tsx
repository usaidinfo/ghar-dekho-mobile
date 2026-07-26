/**
 * RentalsScreen — rent due-date reminders for landlords.
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
  TextInput,
  Modal,
  Pressable,
  Alert,
  Switch,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

import {
  createRentReminder,
  deleteRentReminder,
  fetchRentReminders,
  toggleRentReminder,
  type RentReminder,
} from '../../services/rent.service';

const NAVY = '#122A47';
const GOLD = '#D1A14E';
const SURFACE = '#faf9fc';
const MUTED = '#777779';
const SURF_LOW = '#f5f3f6';

const RentalsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState<RentReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [tenantName, setTenantName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('5');
  const [message, setMessage] = useState('');

  const load = useCallback(async (opts?: { refresh?: boolean }) => {
    if (opts?.refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await fetchRentReminders();
      setItems(data);
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: e instanceof Error ? e.message : 'Could not load rentals',
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

  const resetForm = () => {
    setTenantName('');
    setAmount('');
    setDueDate('5');
    setMessage('');
  };

  const onCreate = async () => {
    const amt = Number(String(amount).replace(/,/g, ''));
    const day = Number(dueDate);
    if (!Number.isFinite(amt) || amt <= 0) {
      Toast.show({ type: 'error', text1: 'Enter a valid rent amount' });
      return;
    }
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      Toast.show({ type: 'error', text1: 'Due day must be 1–31' });
      return;
    }
    setSaving(true);
    try {
      await createRentReminder({
        amount: amt,
        dueDate: day,
        tenantName: tenantName.trim() || undefined,
        message: message.trim() || undefined,
      });
      setFormOpen(false);
      resetForm();
      Toast.show({ type: 'success', text1: 'Rent reminder added' });
      void load({ refresh: true });
    } catch (e) {
      Toast.show({ type: 'error', text1: e instanceof Error ? e.message : 'Could not save' });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = (item: RentReminder) => {
    Alert.alert('Delete reminder?', `Remove reminder for ${item.tenantName || 'tenant'}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRentReminder(item.id);
            setItems(prev => prev.filter(i => i.id !== item.id));
            Toast.show({ type: 'success', text1: 'Reminder deleted' });
          } catch (e) {
            Toast.show({
              type: 'error',
              text1: e instanceof Error ? e.message : 'Could not delete',
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
        <Text style={styles.title}>Rental management</Text>
        <TouchableOpacity
          onPress={() => setFormOpen(true)}
          style={styles.addBtn}
          accessibilityLabel="Add rent reminder"
        >
          <Icon name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Track monthly rent due dates. Push delivery comes with notifications in Milestone 3.
      </Text>

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
              <Icon name="home-account" size={48} color="#c4c6ce" />
              <Text style={styles.emptyTitle}>No rent reminders</Text>
              <Text style={styles.emptySub}>
                Add a tenant rent due date so you never miss collection day.
              </Text>
              <TouchableOpacity style={styles.emptyCta} onPress={() => setFormOpen(true)}>
                <Text style={styles.emptyCtaText}>Add reminder</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, !item.isActive && styles.cardInactive]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.tenantName || 'Tenant'}</Text>
                <Text style={styles.cardAmount}>
                  ₹{Number(item.amount).toLocaleString('en-IN')} / month
                </Text>
                <Text style={styles.cardMeta}>Due on day {item.dueDate} each month</Text>
                {item.message ? (
                  <Text style={styles.cardMsg} numberOfLines={2}>
                    {item.message}
                  </Text>
                ) : null}
              </View>
              <View style={styles.cardActions}>
                <Switch
                  value={item.isActive}
                  onValueChange={async next => {
                    try {
                      const updated = await toggleRentReminder(item.id, next);
                      setItems(prev => prev.map(r => (r.id === item.id ? updated : r)));
                    } catch (e) {
                      Toast.show({
                        type: 'error',
                        text1: e instanceof Error ? e.message : 'Update failed',
                      });
                    }
                  }}
                  trackColor={{ false: '#c4c6ce', true: GOLD }}
                  thumbColor="#fff"
                />
                <TouchableOpacity onPress={() => onDelete(item)} hitSlop={8}>
                  <Icon name="trash-can-outline" size={20} color="#b42318" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={formOpen} transparent animationType="slide" onRequestClose={() => setFormOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setFormOpen(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalAvoid}
          >
            <Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
              <Text style={styles.modalTitle}>New rent reminder</Text>
              <ScrollView keyboardShouldPersistTaps="handled">
                <Field label="Tenant name" value={tenantName} onChangeText={setTenantName} placeholder="Optional" />
                <Field
                  label="Monthly rent (₹)"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="number-pad"
                  placeholder="25000"
                />
                <Field
                  label="Due day of month (1–31)"
                  value={dueDate}
                  onChangeText={setDueDate}
                  keyboardType="number-pad"
                  placeholder="5"
                />
                <Field
                  label="Note"
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Optional note"
                />
              </ScrollView>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setFormOpen(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSave}
                  onPress={() => void onCreate()}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.modalSaveText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const Field: React.FC<{
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad';
}> = ({ label, value, onChangeText, placeholder, keyboardType = 'default' }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={MUTED}
      keyboardType={keyboardType}
    />
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
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NAVY,
  },
  title: { fontSize: 18, fontWeight: '800', color: NAVY },
  subtitle: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontSize: 12,
    color: MUTED,
    lineHeight: 17,
  },
  list: { padding: 16, paddingBottom: 40, gap: 10 },
  empty: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 28, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: NAVY, marginTop: 8 },
  emptySub: { fontSize: 13, color: MUTED, textAlign: 'center', lineHeight: 18 },
  emptyCta: {
    marginTop: 12,
    backgroundColor: NAVY,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyCtaText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e3e2e5',
  },
  cardInactive: { opacity: 0.55 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: NAVY },
  cardAmount: { fontSize: 16, fontWeight: '700', color: GOLD, marginTop: 4 },
  cardMeta: { fontSize: 12, color: MUTED, marginTop: 4 },
  cardMsg: { fontSize: 12, color: MUTED, marginTop: 6 },
  cardActions: { alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(18,42,71,0.45)',
    justifyContent: 'flex-end',
  },
  modalAvoid: { width: '100%' },
  modalCard: {
    backgroundColor: SURFACE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: NAVY, marginBottom: 14 },
  field: { marginBottom: 12, gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: MUTED, textTransform: 'uppercase' },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c4c6ce',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    fontSize: 15,
    color: NAVY,
    fontWeight: '600',
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  modalCancel: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: SURF_LOW,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: { fontWeight: '700', color: MUTED },
  modalSave: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: { fontWeight: '800', color: '#fff' },
});

export default RentalsScreen;

import React from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Animated,
  Easing,
  Dimensions,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Calendar } from 'react-native-calendars';
import ScheduleVisitTimeChips from './ScheduleVisitTimeChips';
import { DEFAULT_TIME_SLOTS, combineLocalDateTimeISO, type VisitTimeSlot } from './visitTimeSlots';

const PRIMARY = '#122A47';

export interface ScheduleVisitSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (args: { dateStr: string; slot: VisitTimeSlot; notes: string }) => Promise<void>;
}

function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function ScheduleVisitSheet({ visible, onClose, onConfirm }: ScheduleVisitSheetProps) {
  const screenH = Dimensions.get('window').height;
  const sheetH = Math.min(795, Math.round(screenH * 0.86));

  const [mounted, setMounted] = React.useState(false);
  const translateY = React.useRef(new Animated.Value(sheetH)).current;

  const [selectedDate, setSelectedDate] = React.useState<string>(todayStr());
  const [selectedSlot, setSelectedSlot] = React.useState<VisitTimeSlot>(DEFAULT_TIME_SLOTS[1]!);
  const [notes, setNotes] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const minDate = todayStr();

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.setValue(sheetH);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }

    if (mounted) {
      Animated.timing(translateY, {
        toValue: sheetH,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [mounted, sheetH, translateY, visible]);

  const close = React.useCallback(() => {
    if (busy) return;
    onClose();
  }, [busy, onClose]);

  const doConfirm = async () => {
    if (!selectedDate || !selectedSlot) return;
    setBusy(true);
    try {
      await onConfirm({ dateStr: selectedDate, slot: selectedSlot, notes: notes.trim() });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const marked = React.useMemo(
    () => ({
      [selectedDate]: {
        selected: true,
        selectedColor: PRIMARY,
        selectedTextColor: '#FFFFFF',
      },
    }),
    [selectedDate],
  );

  return (
    <Modal transparent visible={mounted} animationType="none" statusBarTranslucent onRequestClose={close}>
      {/* Backdrop */}
      <Pressable
        onPress={close}
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,21,46,0.4)' }}
      />

      <KeyboardAvoidingView
        pointerEvents="box-none"
        className="absolute bottom-0 left-0 right-0"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      >
        <Animated.View
          style={{ transform: [{ translateY }], height: sheetH }}
          className="w-full rounded-t-[28px] bg-white shadow-2xl"
        >
          {/* Handle */}
          <View className="flex items-center py-4">
            <View className="h-1.5 w-12 rounded-full bg-surface-container-highest" />
          </View>

          {/* Header */}
          <View className="flex-row items-start justify-between px-8 pb-6">
            <View className="flex-1 pr-6">
              <Text className="text-2xl font-extrabold tracking-tight text-primary">Schedule Private Visit</Text>
              <Text className="mt-2 text-base font-medium text-on-surface-variant">
                Pick a date and time.
              </Text>
            </View>
            <Pressable
              onPress={close}
              className="h-10 w-10 items-center justify-center rounded-full bg-surface-container-low"
              hitSlop={10}
            >
              <Icon name="close" size={20} color={PRIMARY} />
            </Pressable>
          </View>

          {/* Content (non-scrollable) */}
          <View className="flex-1 px-8">
            <Calendar
              current={selectedDate}
              minDate={minDate}
              onDayPress={d => setSelectedDate(d.dateString)}
              markedDates={marked}
              enableSwipeMonths
              hideExtraDays
              renderArrow={dir => (
                <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-container-low">
                  <Icon name={dir === 'left' ? 'chevron-left' : 'chevron-right'} size={18} color={PRIMARY} />
                </View>
              )}
              theme={{
                calendarBackground: '#FFFFFF',
                textSectionTitleColor: 'rgba(68,71,77,0.8)',
                textSectionTitleDisabledColor: 'rgba(68,71,77,0.25)',
                dayTextColor: '#1b1c1e',
                todayTextColor: PRIMARY,
                monthTextColor: PRIMARY,
                textMonthFontWeight: '800',
                textMonthFontSize: 18,
                textDayFontWeight: '700',
                textDayFontSize: 14,
                textDayHeaderFontWeight: '800',
                textDayHeaderFontSize: 10,
                arrowColor: PRIMARY,
                selectedDayBackgroundColor: PRIMARY,
                selectedDayTextColor: '#FFFFFF',
                textDisabledColor: 'rgba(68,71,77,0.25)',
              }}
              style={{ borderRadius: 16 }}
            />

            <Text className="mt-6 text-lg font-extrabold tracking-tight text-primary">Select Time</Text>
            <View style={sheetStyles.timeChips}>
              <ScheduleVisitTimeChips
                slots={DEFAULT_TIME_SLOTS}
                selectedId={selectedSlot?.id ?? null}
                onSelect={setSelectedSlot}
              />
            </View>

            {/* <Text className="mt-8 text-lg font-extrabold tracking-tight text-primary">Notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Any message for the owner?"
              placeholderTextColor="rgba(68,71,77,0.7)"
              className="mt-4 rounded-2xl bg-surface-container-low px-6 text-[13px] font-medium text-on-surface"
              style={{ paddingVertical: 16, minHeight: 96 }}
              maxLength={200}
              multiline
            /> */}
          </View>

          {/* Action bar — match property detail / edit profile button sizing */}
          <View style={sheetStyles.actions}>
            <Pressable
              onPress={doConfirm}
              disabled={busy}
              style={({ pressed }) => [
                sheetStyles.btnPrimary,
                pressed && sheetStyles.btnPressed,
                busy && sheetStyles.btnDisabled,
              ]}
            >
              {busy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={sheetStyles.btnPrimaryText}>Confirm Visit</Text>
              )}
            </Pressable>
            <Pressable
              onPress={close}
              disabled={busy}
              style={({ pressed }) => [
                sheetStyles.btnSecondary,
                pressed && sheetStyles.btnPressed,
                busy && sheetStyles.btnDisabled,
              ]}
            >
              <Text style={sheetStyles.btnSecondaryText}>Cancel</Text>
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const sheetStyles = StyleSheet.create({
  timeChips: {
    marginTop: 14,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 12,
    paddingBottom: 28,
  },
  btnPrimary: {
    flex: 1,
    minHeight: 48,
    maxHeight: 56,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  btnSecondary: {
    flex: 1,
    minHeight: 48,
    maxHeight: 56,
    marginLeft: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: PRIMARY,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  btnSecondaryText: {
    color: PRIMARY,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  btnPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  btnDisabled: {
    opacity: 0.55,
  },
});

export { combineLocalDateTimeISO };


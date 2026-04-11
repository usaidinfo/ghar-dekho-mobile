import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PRIMARY = '#122A47';

interface PropertyDetailStickyActionsProps {
  bottomInset: number;
  onChat: () => void;
  onSchedule: () => void;
}

const PropertyDetailStickyActions: React.FC<PropertyDetailStickyActionsProps> = ({
  bottomInset,
  onChat,
  onSchedule,
}) => (
  <View
    style={[
      styles.bar,
      {
        paddingBottom: Math.max(bottomInset, 12) + 12,
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: -4 },
          },
          android: { elevation: 16 },
        }),
      },
    ]}
  >
    <View style={styles.row}>
      <Pressable
        onPress={onChat}
        style={({ pressed }) => [styles.btnOutline, pressed && styles.pressed]}
      >
        <Icon name="chat-outline" size={20} color={PRIMARY} />
        <Text style={styles.btnOutlineText}>In-App Chat</Text>
      </Pressable>
      <Pressable
        onPress={onSchedule}
        style={({ pressed }) => [styles.btnSolid, pressed && styles.pressed]}
      >
        <Icon name="calendar-month" size={20} color="#FFFFFF" />
        <Text style={styles.btnSolidText}>Schedule Visit</Text>
      </Pressable>
    </View>
  </View>
);

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(226, 232, 240, 0.6)',
    backgroundColor: 'rgba(248, 249, 250, 0.97)',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  btnOutline: {
    flex: 1,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: PRIMARY,
    backgroundColor: 'transparent',
  },
  btnSolid: {
    flex: 1.5,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  btnOutlineText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: PRIMARY,
  },
  btnSolidText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});

export default PropertyDetailStickyActions;

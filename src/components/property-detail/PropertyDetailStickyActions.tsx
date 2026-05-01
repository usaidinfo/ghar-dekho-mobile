import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform, useWindowDimensions } from 'react-native';
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
}) => {
  const { width } = useWindowDimensions();
  const padH = width < 360 ? 16 : 24;
  const gap = width < 360 ? 10 : 16;

  return (
    <View
      style={[
        styles.bar,
        {
          paddingHorizontal: padH,
          paddingBottom: Math.max(bottomInset, 10) + 14,
          gap,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOpacity: 0.06,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: -4 },
            },
            android: { elevation: 18 },
          }),
        },
      ]}
    >
      <View style={[styles.row, { gap }]}>
        <Pressable
          onPress={onChat}
          style={({ pressed }) => [styles.btnOutline, pressed && styles.pressed]}
        >
          <Icon name="chat-outline" size={20} color={PRIMARY} />
          <Text style={styles.btnOutlineText} numberOfLines={1}>
            In-App Chat
          </Text>
        </Pressable>
        <Pressable
          onPress={onSchedule}
          style={({ pressed }) => [styles.btnSolid, pressed && styles.pressed]}
        >
          <Icon name="calendar-month" size={20} color="#FFFFFF" />
          <Text style={styles.btnSolidText} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.85}>
            Schedule Private Visit
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(226, 232, 240, 0.85)',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingTop: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  btnOutline: {
    flex: 1,
    minHeight: 56,
    maxHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: PRIMARY,
    backgroundColor: '#FFFFFF',
  },
  btnSolid: {
    flex: 1.55,
    minHeight: 56,
    maxHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  btnOutlineText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: PRIMARY,
    textAlign: 'center',
  },
  btnSolidText: {
    flexShrink: 1,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});

export default PropertyDetailStickyActions;

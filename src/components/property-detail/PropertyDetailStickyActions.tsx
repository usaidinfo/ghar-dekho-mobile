import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  useWindowDimensions,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

const PRIMARY = '#122A47';
const GOLD = '#D1A14E';
const MUTED = '#777779';

interface PropertyDetailStickyActionsProps {
  bottomInset: number;
  contactLocked?: boolean;
  ownerPhone?: string | null;
  onChat: () => void;
  onSchedule: () => void;
  onUpgrade: () => void;
}

function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, '');
}

const PropertyDetailStickyActions: React.FC<PropertyDetailStickyActionsProps> = ({
  bottomInset,
  contactLocked = false,
  ownerPhone,
  onChat,
  onSchedule,
  onUpgrade,
}) => {
  const { width } = useWindowDimensions();
  const padH = width < 360 ? 16 : 24;
  const gap = width < 360 ? 10 : 16;
  const phoneDigits = ownerPhone ? digitsOnly(ownerPhone) : '';
  const canDirectContact = !contactLocked && phoneDigits.length >= 8;

  const onCall = () => {
    if (contactLocked) {
      onUpgrade();
      return;
    }
    if (!canDirectContact) {
      Toast.show({ type: 'info', text1: 'Phone number unavailable' });
      return;
    }
    Linking.openURL(`tel:${phoneDigits}`).catch(() =>
      Toast.show({ type: 'error', text1: 'Could not open dialer' }),
    );
  };

  const onWhatsApp = () => {
    if (contactLocked) {
      onUpgrade();
      return;
    }
    if (!canDirectContact) {
      Toast.show({ type: 'info', text1: 'Phone number unavailable' });
      return;
    }
    const wa = phoneDigits.startsWith('91') ? phoneDigits : `91${phoneDigits}`;
    Linking.openURL(`https://wa.me/${wa}`).catch(() =>
      Toast.show({ type: 'error', text1: 'Could not open WhatsApp' }),
    );
  };

  if (contactLocked) {
    return (
      <View
        style={[
          styles.bar,
          {
            paddingHorizontal: padH,
            paddingBottom: Math.max(bottomInset, 10) + 14,
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
        <View style={styles.lockBanner}>
          <Icon name="lock-outline" size={18} color={GOLD} />
          <Text style={styles.lockText}>
            Owner contact is locked. Upgrade to call, chat, or schedule a visit.
          </Text>
        </View>
        <Pressable
          onPress={onUpgrade}
          style={({ pressed }) => [styles.btnSolidFull, pressed && styles.pressed]}
        >
          <Icon name="crown" size={20} color="#FFFFFF" />
          <Text style={styles.btnSolidText}>Unlock with membership</Text>
        </Pressable>
      </View>
    );
  }

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
      <View style={[styles.row, { gap: 8 }]}>
        <Pressable
          onPress={onCall}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
          accessibilityLabel="Call owner"
        >
          <Icon name="phone" size={20} color={PRIMARY} />
        </Pressable>
        <Pressable
          onPress={onWhatsApp}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
          accessibilityLabel="WhatsApp owner"
        >
          <Icon name="whatsapp" size={22} color="#25D366" />
        </Pressable>
        <Pressable
          onPress={onChat}
          style={({ pressed }) => [styles.btnOutline, pressed && styles.pressed]}
        >
          <Icon name="chat-outline" size={18} color={PRIMARY} />
          <Text style={styles.btnOutlineText} numberOfLines={1}>
            Chat
          </Text>
        </Pressable>
        <Pressable
          onPress={onSchedule}
          style={({ pressed }) => [styles.btnSolid, pressed && styles.pressed]}
        >
          <Icon name="calendar-month" size={18} color="#FFFFFF" />
          <Text
            style={styles.btnSolidText}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            Visit
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
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingTop: 12,
  },
  lockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(209,161,78,0.12)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  lockText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: MUTED,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  iconBtn: {
    width: 52,
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: PRIMARY,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutline: {
    flex: 1,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: PRIMARY,
    backgroundColor: '#FFFFFF',
  },
  btnSolid: {
    flex: 1.2,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: PRIMARY,
  },
  btnSolidFull: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    backgroundColor: PRIMARY,
  },
  btnOutlineText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: PRIMARY,
  },
  btnSolidText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});

export default PropertyDetailStickyActions;

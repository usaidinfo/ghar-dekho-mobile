import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NAVY = '#122A47';
const GOLD = '#D1A14E';
const SURFACE = '#FAF9FC';
const MUTED = '#777779';

export type MembershipGateReason =
  | 'post'
  | 'contact'
  | 'boost'
  | 'limit'
  | 'generic';

const COPY: Record<
  MembershipGateReason,
  { title: string; body: string; cta: string; icon: string }
> = {
  post: {
    title: 'Membership required to post',
    body: 'Free accounts can browse homes. Upgrade to list properties, unlock owner contacts, and remove ads.',
    cta: 'View membership plans',
    icon: 'home-plus-outline',
  },
  contact: {
    title: 'Unlock owner contact',
    body: 'Call, WhatsApp, chat, and visit scheduling are available on an active membership.',
    cta: 'Unlock with membership',
    icon: 'phone-lock-outline',
  },
  boost: {
    title: 'Boost needs membership',
    body: 'Feature and boost your listings after activating a plan that includes promotions.',
    cta: 'Upgrade to boost',
    icon: 'rocket-launch-outline',
  },
  limit: {
    title: 'Listing limit reached',
    body: 'Your current plan has no more listing slots. Upgrade to add more properties.',
    cta: 'Upgrade plan',
    icon: 'chart-box-outline',
  },
  generic: {
    title: 'Membership required',
    body: 'This feature is included with an active Ghar Dekho membership.',
    cta: 'View plans',
    icon: 'crown-outline',
  },
};

export interface MembershipRequiredModalProps {
  visible: boolean;
  reason?: MembershipGateReason;
  message?: string | null;
  onClose: () => void;
  onUpgrade: () => void;
}

const MembershipRequiredModal: React.FC<MembershipRequiredModalProps> = ({
  visible,
  reason = 'generic',
  message,
  onClose,
  onUpgrade,
}) => {
  const copy = COPY[reason] ?? COPY.generic;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          <View style={styles.iconWrap}>
            <Icon name={copy.icon} size={28} color={GOLD} />
          </View>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.body}>{message?.trim() || copy.body}</Text>

          <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.88} onPress={onUpgrade}>
            <Icon name="crown" size={18} color="#fff" />
            <Text style={styles.primaryText}>{copy.cta}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.85} onPress={onClose}>
            <Text style={styles.secondaryText}>Not now</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 42, 71, 0.55)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: SURFACE,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 12 },
      },
      android: { elevation: 12 },
    }),
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(209,161,78,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: NAVY,
    textAlign: 'center',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: MUTED,
    textAlign: 'center',
    marginBottom: 22,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'stretch',
    backgroundColor: NAVY,
    borderRadius: 16,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  primaryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  secondaryBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  secondaryText: {
    color: MUTED,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MembershipRequiredModal;

import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CHAT } from './chatTheme';

export interface ChatThreadHeaderProps {
  peerName: string;
  peerImageUri?: string | null;
  isTyping: boolean;
  onBack: () => void;
}

const ChatThreadHeader: React.FC<ChatThreadHeaderProps> = ({
  peerName,
  peerImageUri,
  isTyping,
  onBack,
}) => (
  <View style={styles.bar}>
    <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12} accessibilityLabel="Back">
      <Icon name="arrow-left" size={26} color={CHAT.primary} />
    </TouchableOpacity>

    <TouchableOpacity style={styles.peer} activeOpacity={0.85}>
      <Image
        source={{
          uri: peerImageUri || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
        }}
        style={styles.avatar}
      />
      <View style={styles.titles}>
        <Text style={styles.name} numberOfLines={1}>
          {peerName}
        </Text>
        <Text style={isTyping ? styles.typing : styles.status} numberOfLines={1}>
          {isTyping ? 'typing…' : 'tap for contact info'}
        </Text>
      </View>
    </TouchableOpacity>

    <View style={styles.actions}>
      <TouchableOpacity
        onPress={() => Alert.alert('Calls', 'Voice and video calls coming soon.')}
        style={styles.actionBtn}
        hitSlop={8}
      >
        <Icon name="video-outline" size={24} color={CHAT.primary} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => Alert.alert('Calls', 'Voice calls coming soon.')}
        style={styles.actionBtn}
        hitSlop={8}
      >
        <Icon name="phone-outline" size={22} color={CHAT.primary} />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
    backgroundColor: CHAT.headerBg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: CHAT.separator,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  backBtn: { padding: 8 },
  peer: { flex: 1, flexDirection: 'row', alignItems: 'center', minWidth: 0 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: CHAT.surfaceAlt,
    marginRight: 10,
  },
  titles: { flex: 1, minWidth: 0 },
  name: { fontSize: 17, fontWeight: '700', color: CHAT.primary },
  status: { fontSize: 13, color: CHAT.muted, marginTop: 1 },
  typing: { fontSize: 13, color: CHAT.teal, marginTop: 1, fontWeight: '600' },
  actions: { flexDirection: 'row', alignItems: 'center', paddingRight: 4 },
  actionBtn: { padding: 8 },
});

export default ChatThreadHeader;

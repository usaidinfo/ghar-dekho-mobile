import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PRIMARY = '#00152e';
const TEAL = '#509d9b';

export interface ChatThreadHeaderProps {
  peerName: string;
  peerImageUri?: string | null;
  isTyping: boolean;
  onBack: () => void;
}

const ChatThreadHeader: React.FC<ChatThreadHeaderProps> = ({ peerName, peerImageUri, isTyping, onBack }) => (
  <View style={styles.glass}>
    <View style={styles.row}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={10} accessibilityLabel="Back">
        <Icon name="arrow-left" size={24} color={PRIMARY} />
      </TouchableOpacity>
      <View style={styles.peer}>
        <View style={styles.avatarWrap}>
          <Image
            source={{ uri: peerImageUri || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' }}
            style={styles.avatar}
          />
          <View style={styles.onlineDot} />
        </View>
        <View style={styles.titles}>
          <Text style={styles.name} numberOfLines={1}>
            {peerName}
          </Text>
          {isTyping ? (
            <Text style={styles.typing}>Typing…</Text>
          ) : (
            <Text style={styles.subtle}> </Text>
          )}
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => Alert.alert('Calls', 'Voice and video calls are not available yet.')}
          hitSlop={8}
        >
          <Icon name="video-outline" size={24} color={PRIMARY} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Alert.alert('Calls', 'Voice and video calls are not available yet.')}
          hitSlop={8}
        >
          <Icon name="phone-outline" size={22} color={PRIMARY} />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  glass: {
    backgroundColor: 'rgba(250,249,252,0.92)',
    paddingTop: 4,
    paddingBottom: 8,
    paddingHorizontal: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(196,198,206,0.35)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
    }),
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { padding: 4, marginRight: 4 },
  peer: { flex: 1, flexDirection: 'row', alignItems: 'center', minWidth: 0 },
  avatarWrap: { position: 'relative', marginRight: 10 },
  avatar: { width: 40, height: 40, borderRadius: 999, backgroundColor: '#e9e7ea' },
  onlineDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: TEAL,
    borderWidth: 2,
    borderColor: '#faf9fc',
  },
  titles: { flex: 1, minWidth: 0 },
  name: { fontSize: 17, fontWeight: '800', color: PRIMARY },
  typing: { fontSize: 12, fontWeight: '600', color: TEAL, marginTop: 2 },
  subtle: { fontSize: 12, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
});

export default ChatThreadHeader;

import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import type { ChatSessionRow } from '../../types/chat.api.types';
import { formatPeerName, formatSessionTime, previewLine } from '../../utils/chatDisplay';
import { formatInrPrice } from '../../utils/homePropertyMappers';
import { useAuthStore } from '../../stores/auth.store';

const PRIMARY = '#00152e';
const SECONDARY = '#7d5705';
const TEAL = '#509d9b';
const MUTED = '#44474d';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&q=80';

export interface ChatSessionCardProps {
  session: ChatSessionRow;
  onPress: (session: ChatSessionRow) => void;
}

const ChatSessionCard: React.FC<ChatSessionCardProps> = ({ session, onPress }) => {
  const me = useAuthStore(s => s.user?.id);
  const other = session.otherUser;
  const name = formatPeerName(other?.profile);
  const avatar = other?.profile?.profileImage;
  const last = session.messages?.[0];
  const timeLabel = last ? formatSessionTime(last.createdAt) : '';
  const preview = previewLine(last, me);
  const prop = session.property;
  const hasProp = Boolean(prop?.id);
  const thumb = prop?.images?.[0]?.thumbnailUrl;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(session)} activeOpacity={0.92}>
      <View style={styles.avatarCol}>
        <Image source={{ uri: avatar || PLACEHOLDER }} style={styles.avatar} />
        {hasProp && thumb ? (
          <Image source={{ uri: thumb }} style={styles.propThumb} />
        ) : null}
      </View>
      <View style={styles.mid}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.time}>{timeLabel}</Text>
        </View>
        {hasProp ? (
          <Text style={styles.propLine} numberOfLines={1}>
            {(prop?.title || 'Property').toUpperCase()} • {formatInrPrice(prop!.price, 'BUY')}
          </Text>
        ) : (
          <Text style={styles.directLine}>DIRECT CHAT</Text>
        )}
        <Text style={styles.preview} numberOfLines={1}>
          {preview || ' '}
        </Text>
      </View>
      {session.unreadCount > 0 ? (
        <View style={styles.badgeCol}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{session.unreadCount > 9 ? '9+' : session.unreadCount}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.badgeCol} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(196,198,206,0.2)',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
    }),
  },
  avatarCol: { width: 64, height: 64, position: 'relative' },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: '#e9e7ea',
    borderWidth: 2,
    borderColor: '#faf9fc',
  },
  propThumb: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#faf9fc',
    backgroundColor: '#e9e7ea',
  },
  mid: { flex: 1, minWidth: 0 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
  name: { flex: 1, fontSize: 16, fontWeight: '800', color: PRIMARY, marginRight: 8 },
  time: { fontSize: 12, fontWeight: '600', color: MUTED },
  propLine: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
    color: SECONDARY,
    marginBottom: 4,
  },
  directLine: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: TEAL,
    marginBottom: 4,
  },
  preview: { fontSize: 14, fontWeight: '500', color: MUTED },
  badgeCol: { width: 28, alignItems: 'center', justifyContent: 'center' },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: SECONDARY,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: { fontSize: 10, fontWeight: '900', color: '#fff' },
});

export default ChatSessionCard;

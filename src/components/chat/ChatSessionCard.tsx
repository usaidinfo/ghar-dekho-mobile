import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import type { ChatSessionRow } from '../../types/chat.api.types';
import { formatPeerName, formatSessionTime, previewLine } from '../../utils/chatDisplay';
import { formatInrPrice } from '../../utils/homePropertyMappers';
import { useAuthStore } from '../../stores/auth.store';
import { CHAT } from './chatTheme';

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
  const unread = session.unreadCount > 0;

  return (
    <TouchableOpacity style={styles.row} onPress={() => onPress(session)} activeOpacity={0.65}>
      <Image source={{ uri: avatar || PLACEHOLDER }} style={styles.avatar} />
      <View style={styles.body}>
        <View style={styles.top}>
          <Text style={[styles.name, unread && styles.nameUnread]} numberOfLines={1}>
            {name}
          </Text>
          <Text style={[styles.time, unread && styles.timeUnread]}>{timeLabel}</Text>
        </View>
        <View style={styles.bottom}>
          <Text
            style={[styles.preview, unread && styles.previewUnread]}
            numberOfLines={1}
          >
            {hasProp ? `🏠 ${(prop?.title || 'Property').slice(0, 28)}` : preview || 'No messages yet'}
          </Text>
          {unread ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {session.unreadCount > 99 ? '99+' : session.unreadCount}
              </Text>
            </View>
          ) : null}
        </View>
        {hasProp && prop ? (
          <Text style={styles.propHint} numberOfLines={1}>
            {formatInrPrice(prop.price, 'BUY')}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: CHAT.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: CHAT.separator,
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: CHAT.surfaceAlt,
  },
  body: { flex: 1, minWidth: 0 },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: CHAT.primary,
    marginRight: 8,
  },
  nameUnread: { fontWeight: '800' },
  time: { fontSize: 12, color: CHAT.muted },
  timeUnread: { color: CHAT.teal, fontWeight: '600' },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  preview: {
    flex: 1,
    fontSize: 14,
    color: CHAT.muted,
    fontWeight: '400',
  },
  previewUnread: {
    color: CHAT.text,
    fontWeight: '600',
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: CHAT.teal,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  propHint: {
    fontSize: 12,
    color: CHAT.gold,
    marginTop: 2,
    fontWeight: '600',
  },
});

export default ChatSessionCard;

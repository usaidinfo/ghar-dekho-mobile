import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { ChatMessage } from '../../types/chat.api.types';
import { formatMessageTime } from '../../utils/chatDisplay';

const PRIMARY = '#00152e';
const PRIMARY_END = '#122a47';
const MUTED = '#44474d';
const TEAL = '#509d9b';
const SURFACE = '#e3e2e5';

export interface ChatMessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message, isMine }) => {
  const time = formatMessageTime(message.createdAt);

  if (message.isDeleted) {
    return (
      <View style={[styles.row, styles.rowOther]}>
        <View style={styles.deletedBubble}>
          <Text style={styles.deletedText}>This message was deleted.</Text>
        </View>
      </View>
    );
  }

  if (message.messageType === 'VIDEO' && message.mediaUrl) {
    return (
      <View style={[styles.row, isMine ? styles.rowMine : styles.rowOther]}>
        <TouchableOpacity
          onPress={() => Linking.openURL(message.mediaUrl!).catch(() => undefined)}
          style={isMine ? styles.videoCardMine : styles.videoCardOther}
        >
          <Text style={isMine ? styles.textMine : styles.textOther}>▶ Video</Text>
          <Text style={[styles.linkHint, isMine && { color: 'rgba(255,255,255,0.75)' }]} numberOfLines={2}>
            Open link
          </Text>
        </TouchableOpacity>
        <Text style={[styles.time, isMine ? styles.timeMine : styles.timeOther]}>{time}</Text>
      </View>
    );
  }

  if (message.messageType === 'IMAGE' && message.mediaUrl) {
    const bubble = (
      <View style={[styles.mediaWrap, isMine ? styles.alignEnd : styles.alignStart]}>
        <Image source={{ uri: message.mediaUrl }} style={styles.mediaImg} resizeMode="cover" />
        {message.content ? (
          <View style={styles.mediaCaption}>
            <Text style={styles.mediaCaptionText}>{message.content}</Text>
          </View>
        ) : null}
        <Text style={[styles.time, isMine ? styles.timeMine : styles.timeOther]}>{time}</Text>
      </View>
    );
    return <View style={[styles.row, isMine ? styles.rowMine : styles.rowOther]}>{bubble}</View>;
  }

  if (message.messageType === 'PROPERTY_LINK') {
    return (
      <View style={[styles.row, isMine ? styles.rowMine : styles.rowOther]}>
        {isMine ? (
          <LinearGradient colors={[PRIMARY, PRIMARY_END]} style={styles.propCard}>
            <View style={styles.propIconBg}>
              <Icon name="home-city" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.propTitle} numberOfLines={2}>
                {message.content || 'Property'}
              </Text>
              <Text style={styles.propSub}>Property link</Text>
            </View>
          </LinearGradient>
        ) : (
          <View style={[styles.propCardFlat]}>
            <Icon name="home-city" size={22} color={PRIMARY} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.propTitleDark} numberOfLines={2}>
                {message.content || 'Property'}
              </Text>
              <Text style={styles.propSubDark}>Property link</Text>
            </View>
          </View>
        )}
        <View style={[styles.metaRow, isMine && styles.metaRowMine]}>
          <Text style={styles.time}>{time}</Text>
          {isMine && message.isRead ? <Icon name="check-all" size={14} color={TEAL} style={{ marginLeft: 4 }} /> : null}
        </View>
      </View>
    );
  }

  if (isMine) {
    return (
      <View style={[styles.row, styles.rowMine]}>
        <View style={{ maxWidth: '86%', alignItems: 'flex-end' }}>
          <LinearGradient colors={[PRIMARY, PRIMARY_END]} style={styles.bubbleMine}>
            <Text style={styles.textMine}>{message.content}</Text>
          </LinearGradient>
          <View style={styles.metaRowMine}>
            <Text style={styles.time}>{time}</Text>
            {message.isRead ? (
              <Icon name="check-all" size={14} color={TEAL} style={{ marginLeft: 4 }} />
            ) : null}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.row, styles.rowOther]}>
      <View style={{ maxWidth: '86%' }}>
        <View style={styles.bubbleOther}>
          <Text style={styles.textOther}>{message.content}</Text>
        </View>
        <Text style={[styles.time, styles.timeOther]}>{time}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { width: '100%', marginBottom: 14, paddingHorizontal: 22 },
  rowMine: { alignItems: 'flex-end' },
  rowOther: { alignItems: 'flex-start' },
  alignStart: { alignSelf: 'flex-start' },
  alignEnd: { alignSelf: 'flex-end' },
  bubbleMine: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  videoCardMine: {
    maxWidth: '86%',
    backgroundColor: PRIMARY_END,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  videoCardOther: {
    maxWidth: '86%',
    backgroundColor: SURFACE,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  linkHint: { fontSize: 10, color: MUTED, marginTop: 4 },
  bubbleOther: {
    backgroundColor: SURFACE,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  textMine: { color: '#fff', fontSize: 14, lineHeight: 20, fontWeight: '500' },
  textOther: { color: '#1b1c1e', fontSize: 14, lineHeight: 20, fontWeight: '500' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metaRowMine: { justifyContent: 'flex-end', alignSelf: 'flex-end' },
  time: { fontSize: 10, color: MUTED, fontWeight: '600' },
  timeMine: { alignSelf: 'flex-end' },
  timeOther: { marginLeft: 4, marginTop: 4 },
  deletedBubble: {
    borderWidth: 1,
    borderColor: 'rgba(196,198,206,0.45)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  deletedText: { fontSize: 13, fontStyle: 'italic', color: 'rgba(68,71,77,0.65)' },
  mediaWrap: { maxWidth: '86%', borderRadius: 16, overflow: 'hidden', backgroundColor: SURFACE },
  mediaImg: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#ddd' },
  mediaCaption: { padding: 10 },
  mediaCaptionText: { fontSize: 11, color: MUTED, fontWeight: '600' },
  propCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: '92%',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  propCardFlat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: '92%',
    backgroundColor: SURFACE,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  propIconBg: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  propTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  propSub: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 2, fontWeight: '600' },
  propTitleDark: { color: PRIMARY, fontSize: 14, fontWeight: '700' },
  propSubDark: { color: MUTED, fontSize: 10, marginTop: 2, fontWeight: '600' },
});

export default ChatMessageBubble;

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Modal,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { ChatMessage } from '../../types/chat.api.types';
import { formatMessageTime } from '../../utils/chatDisplay';
import { resolveMediaUrl } from '../../utils/resolveMediaUrl';
import { CHAT, CHAT_BUBBLE } from './chatTheme';

const IMAGE_HEIGHT = 200;

export interface ChatMessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  /** Visually above this message (older). */
  isFirstInGroup?: boolean;
  /** Visually below this message (newer). */
  isLastInGroup?: boolean;
}

function hasVisibleCaption(content: string | null | undefined): boolean {
  const t = content?.replace(/\s+/g, ' ').trim();
  return Boolean(t && t.length > 0);
}

function bubbleRadii(isMine: boolean, isFirst: boolean, isLast: boolean) {
  const L = CHAT_BUBBLE.radiusLg;
  const S = CHAT_BUBBLE.radiusSm;
  if (isMine) {
    return {
      borderTopLeftRadius: L,
      borderTopRightRadius: isFirst ? L : S,
      borderBottomLeftRadius: L,
      borderBottomRightRadius: isLast ? S : S,
    };
  }
  return {
    borderTopLeftRadius: isFirst ? L : S,
    borderTopRightRadius: L,
    borderBottomLeftRadius: isLast ? S : S,
    borderBottomRightRadius: L,
  };
}

const BubbleMeta: React.FC<{ time: string; isMine: boolean; isRead?: boolean; light?: boolean }> = ({
  time,
  isMine,
  isRead,
  light,
}) => (
  <View style={styles.metaRow}>
    <Text style={[styles.metaTime, light && styles.metaTimeLight]}>{time}</Text>
    {isMine && isRead ? (
      <Icon name="check-all" size={14} color={light ? '#b8e6e4' : CHAT.teal} style={styles.metaCheck} />
    ) : null}
  </View>
);

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  isMine,
  isFirstInGroup = true,
  isLastInGroup = true,
}) => {
  const { width: screenW } = useWindowDimensions();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const time = formatMessageTime(message.createdAt);
  const imageWidth = Math.min(Math.round(screenW * 0.68), 260);
  const radii = bubbleRadii(isMine, isFirstInGroup, isLastInGroup);
  const marginBottom = isLastInGroup ? CHAT_BUBBLE.blockGap : CHAT_BUBBLE.groupGap;

  const mediaUri = useMemo(() => resolveMediaUrl(message.mediaUrl), [message.mediaUrl]);

  useEffect(() => {
    setImageFailed(false);
    setImageLoading(true);
  }, [mediaUri]);

  if (message.isDeleted) {
    return (
      <View style={[styles.row, styles.rowOther, { marginBottom }]}>
        <View style={styles.deletedBubble}>
          <Text style={styles.deletedText}>This message was deleted</Text>
        </View>
      </View>
    );
  }

  if (message.messageType === 'VIDEO' && mediaUri) {
    return (
      <View style={[styles.row, isMine ? styles.rowMine : styles.rowOther, { marginBottom }]}>
        <TouchableOpacity
          onPress={() => Linking.openURL(mediaUri).catch(() => undefined)}
          style={[isMine ? styles.videoMine : styles.videoOther, radii]}
        >
          <Icon name="play-circle-outline" size={28} color={isMine ? '#fff' : CHAT.primary} />
          <Text style={isMine ? styles.textMine : styles.textOther}>Video</Text>
        </TouchableOpacity>
        {!isLastInGroup ? null : (
          <BubbleMeta time={time} isMine={isMine} isRead={message.isRead} />
        )}
      </View>
    );
  }

  if (message.messageType === 'IMAGE') {
    const showCaption = hasVisibleCaption(message.content);

    return (
      <>
        <View style={[styles.row, isMine ? styles.rowMine : styles.rowOther, { marginBottom }]}>
          <View style={[styles.mediaOuter, { width: imageWidth }, isMine ? styles.alignEnd : styles.alignStart]}>
            {mediaUri && !imageFailed ? (
              <TouchableOpacity activeOpacity={0.92} onPress={() => setPreviewOpen(true)}>
                <View style={[styles.mediaFrame, { width: imageWidth, height: IMAGE_HEIGHT }, radii]}>
                  {imageLoading ? (
                    <View style={styles.mediaLoading}>
                      <ActivityIndicator color={CHAT.primary} />
                    </View>
                  ) : null}
                  <Image
                    source={{ uri: mediaUri }}
                    style={{ width: imageWidth, height: IMAGE_HEIGHT }}
                    resizeMode="cover"
                    onLoadEnd={() => setImageLoading(false)}
                    onError={() => {
                      setImageFailed(true);
                      setImageLoading(false);
                    }}
                  />
                  <View style={styles.mediaTimeOverlay} pointerEvents="none">
                    <Text style={styles.mediaTimeText}>{time}</Text>
                    {isMine && message.isRead ? (
                      <Icon name="check-all" size={13} color="#b8e6e4" />
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              <View
                style={[
                  styles.mediaFrame,
                  styles.mediaError,
                  { width: imageWidth, height: IMAGE_HEIGHT },
                  radii,
                ]}
              >
                <Icon name="image-off-outline" size={32} color={CHAT.muted} />
                <Text style={styles.mediaErrorText}>Photo unavailable</Text>
              </View>
            )}
            {showCaption ? (
              <View style={[styles.captionBox, isMine ? styles.captionMine : styles.captionOther]}>
                <Text style={styles.captionText}>{message.content.trim()}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <Modal visible={previewOpen} transparent animationType="fade" onRequestClose={() => setPreviewOpen(false)}>
          <Pressable style={styles.previewBackdrop} onPress={() => setPreviewOpen(false)}>
            <TouchableOpacity style={styles.previewClose} onPress={() => setPreviewOpen(false)}>
              <Icon name="close" size={26} color="#fff" />
            </TouchableOpacity>
            {mediaUri ? <Image source={{ uri: mediaUri }} style={styles.previewImg} resizeMode="contain" /> : null}
          </Pressable>
        </Modal>
      </>
    );
  }

  if (message.messageType === 'PROPERTY_LINK') {
    return (
      <View style={[styles.row, isMine ? styles.rowMine : styles.rowOther, { marginBottom }]}>
        {isMine ? (
          <LinearGradient colors={[CHAT.primary, CHAT.primaryEnd]} style={[styles.propCard, radii]}>
            <Icon name="home-city" size={22} color="#fff" />
            <View style={styles.propTextCol}>
              <Text style={styles.propTitleMine} numberOfLines={2}>
                {message.content || 'Property'}
              </Text>
              <Text style={styles.propSubMine}>Tap to view listing</Text>
            </View>
            <BubbleMeta time={time} isMine isRead={message.isRead} light />
          </LinearGradient>
        ) : (
          <View style={[styles.propCardOther, radii]}>
            <Icon name="home-city" size={22} color={CHAT.primary} />
            <View style={styles.propTextCol}>
              <Text style={styles.propTitleOther} numberOfLines={2}>
                {message.content || 'Property'}
              </Text>
              <Text style={styles.propSubOther}>Property</Text>
            </View>
            <BubbleMeta time={time} isMine={false} />
          </View>
        )}
      </View>
    );
  }

  if (isMine) {
    return (
      <View style={[styles.row, styles.rowMine, { marginBottom }]}>
        <LinearGradient colors={[CHAT.primary, CHAT.primaryEnd]} style={[styles.bubbleMine, radii]}>
          <Text style={styles.textMine}>{message.content}</Text>
          <BubbleMeta time={time} isMine isRead={message.isRead} light />
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.row, styles.rowOther, { marginBottom }]}>
      <View style={[styles.bubbleOther, radii]}>
        <Text style={styles.textOther}>{message.content}</Text>
        <BubbleMeta time={time} isMine={false} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { width: '100%', paddingHorizontal: 8 },
  rowMine: { alignItems: 'flex-end' },
  rowOther: { alignItems: 'flex-start' },
  alignStart: { alignSelf: 'flex-start' },
  alignEnd: { alignSelf: 'flex-end' },
  bubbleMine: {
    maxWidth: `${CHAT_BUBBLE.maxWidthPct * 100}%`,
    paddingHorizontal: CHAT_BUBBLE.padH + 2,
    paddingTop: CHAT_BUBBLE.padV + 2,
    paddingBottom: CHAT_BUBBLE.padV,
  },
  bubbleOther: {
    maxWidth: `${CHAT_BUBBLE.maxWidthPct * 100}%`,
    backgroundColor: CHAT.bubbleIn,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CHAT.bubbleInBorder,
    paddingHorizontal: CHAT_BUBBLE.padH + 2,
    paddingTop: CHAT_BUBBLE.padV + 2,
    paddingBottom: CHAT_BUBBLE.padV,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  textMine: { color: '#fff', fontSize: 15.5, lineHeight: 21 },
  textOther: { color: CHAT.text, fontSize: 15.5, lineHeight: 21 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 3,
    gap: 3,
  },
  metaTime: { fontSize: 11, color: CHAT.muted, fontWeight: '500' },
  metaTimeLight: { color: 'rgba(255,255,255,0.72)' },
  metaCheck: { marginLeft: 1 },
  videoMine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: `${CHAT_BUBBLE.maxWidthPct * 100}%`,
    backgroundColor: CHAT.primaryEnd,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  videoOther: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: `${CHAT_BUBBLE.maxWidthPct * 100}%`,
    backgroundColor: CHAT.bubbleIn,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CHAT.bubbleInBorder,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  deletedBubble: {
    borderRadius: CHAT_BUBBLE.radiusLg,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  deletedText: { fontSize: 13, fontStyle: 'italic', color: CHAT.muted },
  mediaOuter: { borderRadius: CHAT_BUBBLE.radiusLg },
  mediaFrame: { overflow: 'hidden', backgroundColor: '#d0d4da', position: 'relative' },
  mediaLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(208,212,218,0.9)',
    zIndex: 1,
  },
  mediaTimeOverlay: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.48)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  mediaTimeText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  mediaError: { alignItems: 'center', justifyContent: 'center', gap: 6 },
  mediaErrorText: { fontSize: 12, color: CHAT.muted },
  captionBox: {
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    maxWidth: '100%',
  },
  captionMine: { backgroundColor: 'rgba(0,21,46,0.08)', alignSelf: 'flex-end' },
  captionOther: { backgroundColor: CHAT.bubbleIn, alignSelf: 'flex-start' },
  captionText: { fontSize: 14, color: CHAT.text },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.94)',
    justifyContent: 'center',
  },
  previewClose: {
    position: 'absolute',
    top: 48,
    right: 16,
    zIndex: 2,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImg: { width: '100%', height: '82%' },
  propCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    maxWidth: `${CHAT_BUBBLE.maxWidthPct * 100}%`,
    padding: 12,
  },
  propCardOther: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    maxWidth: `${CHAT_BUBBLE.maxWidthPct * 100}%`,
    backgroundColor: CHAT.bubbleIn,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CHAT.bubbleInBorder,
    padding: 12,
  },
  propTextCol: { flex: 1, minWidth: 0 },
  propTitleMine: { color: '#fff', fontSize: 14, fontWeight: '700' },
  propSubMine: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2 },
  propTitleOther: { color: CHAT.primary, fontSize: 14, fontWeight: '700' },
  propSubOther: { color: CHAT.muted, fontSize: 11, marginTop: 2 },
});

export default ChatMessageBubble;

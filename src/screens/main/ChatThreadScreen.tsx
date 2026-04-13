/**
 * @file ChatThreadScreen.tsx
 * @description Single chat: REST messages + Socket.io (join, send, typing, read). Media via REST multipart.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, type ListRenderItem } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Socket } from 'socket.io-client';
import Toast from 'react-native-toast-message';
import type { Asset } from 'react-native-image-picker';

import type { MainStackParamList } from '../../navigation/types';
import type { ChatMessage } from '../../types/chat.api.types';
import { fetchChatMessages, sendChatMessageJson, sendChatMessageMultipart } from '../../services/chat.service';
import { connectChatSocket, getChatSocket } from '../../api/chatSocket';
import { getAccessToken } from '../../api/session';
import { useAuthStore } from '../../stores/auth.store';
import { formatDayLabel } from '../../utils/chatDisplay';
import { normalizeChatImagePart } from '../../utils/chatImageUpload';

import ChatThreadHeader from '../../components/chat/ChatThreadHeader';
import ChatPropertyContextBar from '../../components/chat/ChatPropertyContextBar';
import ChatMessageBubble from '../../components/chat/ChatMessageBubble';
import ChatComposer from '../../components/chat/ChatComposer';
import ChatDaySeparator from '../../components/chat/ChatDaySeparator';
import ChatThreadSkeleton from '../../components/chat/ChatThreadSkeleton';

type Props = NativeStackScreenProps<MainStackParamList, 'ChatThread'>;

type Row = { type: 'day'; label: string; id: string } | { type: 'msg'; msg: ChatMessage; id: string };

/**
 * Build rows for an inverted FlatList (index 0 = visual bottom = newest).
 * For each calendar day: list that day's messages newest-first, then the day pill
 * so the label sits above that day's block (chronological "start" of the day).
 */
function rowsForInverted(messages: ChatMessage[]): Row[] {
  const sorted = [...messages].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const out: Row[] = [];
  let i = 0;
  while (i < sorted.length) {
    const dayLabel = formatDayLabel(sorted[i].createdAt);
    const bucket: ChatMessage[] = [];
    while (i < sorted.length && formatDayLabel(sorted[i].createdAt) === dayLabel) {
      bucket.push(sorted[i]);
      i += 1;
    }
    for (const m of bucket) {
      out.push({ type: 'msg', msg: m, id: m.id });
    }
    const oldestInDay = bucket[bucket.length - 1];
    out.push({ type: 'day', label: dayLabel, id: `day-${dayLabel}-${oldestInDay.id}` });
  }
  return out;
}

const ChatThreadScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const myId = useAuthStore(s => s.user?.id);
  const {
    sessionId,
    peerName: prefName,
    peerImage: prefImage,
    propertyId,
    propertyTitle,
    propertyThumb,
    propertyPrice,
    listingType,
  } = route.params;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const typingClear = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<FlatList<Row>>(null);
  const mounted = useRef(true);
  const lastSessionRef = useRef<string | null>(null);

  const peerName = prefName?.trim() || 'Conversation';
  const showPropertyBar = Boolean(propertyId && propertyTitle && propertyPrice != null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const mergeMessage = useCallback((msg: ChatMessage) => {
    setMessages(prev => {
      if (prev.some(m => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const loadMessages = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const res = await fetchChatMessages(sessionId, { page: 1, limit: 100 });
      if (!mounted.current) return;
      if (res.success && Array.isArray(res.data)) {
        setMessages(res.data);
      }
    } catch (e) {
      if (!opts?.silent) {
        Toast.show({ type: 'error', text1: e instanceof Error ? e.message : 'Could not load chat' });
      }
    } finally {
      if (mounted.current && !opts?.silent) setLoading(false);
    }
  }, [sessionId]);

  useFocusEffect(
    useCallback(() => {
      const isSameSession = lastSessionRef.current === sessionId;
      lastSessionRef.current = sessionId;
      void loadMessages({ silent: isSameSession });
      const sock = getChatSocket();
      if (sock?.connected) {
        sock.emit('chat:join', sessionId);
        sock.emit('chat:read', { sessionId });
      }
    }, [sessionId, loadMessages]),
  );

  useEffect(() => {
    let sock: Socket | undefined;
    try {
      const t = getAccessToken();
      if (!t) return;
      sock = connectChatSocket(t);
    } catch {
      return () => {
        if (typingClear.current) clearTimeout(typingClear.current);
      };
    }

    const onMsg = (msg: ChatMessage) => {
      if (msg.sessionId !== sessionId) return;
      mergeMessage(msg);
    };
    const onTyping = (payload: { userId: string; sessionId: string }) => {
      if (payload.sessionId !== sessionId || payload.userId === myId) return;
      setTyping(true);
      if (typingClear.current) clearTimeout(typingClear.current);
      typingClear.current = setTimeout(() => setTyping(false), 2000);
    };
    const onStop = (payload: { userId: string; sessionId: string }) => {
      if (payload.sessionId !== sessionId || payload.userId === myId) return;
      setTyping(false);
    };
    const onErr = (payload: { message?: string }) => {
      Toast.show({ type: 'error', text1: payload?.message || 'Chat error' });
    };

    const joinAndRead = () => {
      sock?.emit('chat:join', sessionId);
      sock?.emit('chat:read', { sessionId });
    };

    joinAndRead();
    sock.on('connect', joinAndRead);
    sock.on('chat:message', onMsg);
    sock.on('chat:typing', onTyping);
    sock.on('chat:stop-typing', onStop);
    sock.on('chat:error', onErr);

    return () => {
      sock?.emit('chat:leave', sessionId);
      sock?.off('connect', joinAndRead);
      sock?.off('chat:message', onMsg);
      sock?.off('chat:typing', onTyping);
      sock?.off('chat:stop-typing', onStop);
      sock?.off('chat:error', onErr);
      if (typingClear.current) clearTimeout(typingClear.current);
    };
  }, [sessionId, myId, mergeMessage]);

  const flatData = useMemo(() => rowsForInverted(messages), [messages]);

  const sendText = useCallback(
    async (text: string) => {
      const sock = getChatSocket();
      setSending(true);
      try {
        if (sock?.connected) {
          sock.emit('chat:message', { sessionId, content: text, messageType: 'TEXT' });
        } else {
          const res = await sendChatMessageJson(sessionId, { content: text, messageType: 'TEXT' });
          if (res.success && res.data) mergeMessage(res.data);
        }
      } catch (e) {
        Toast.show({ type: 'error', text1: e instanceof Error ? e.message : 'Send failed' });
      } finally {
        setSending(false);
      }
    },
    [sessionId, mergeMessage],
  );

  const sendImage = useCallback(
    async (asset: Asset) => {
      if (!asset.uri) return;
      setSending(true);
      try {
        const { uri, type, name } = normalizeChatImagePart(asset);
        const form = new FormData();
        form.append('messageType', 'IMAGE');
        form.append('content', ' ');
        form.append('media', { uri, type, name } as unknown as Blob);
        const res = await sendChatMessageMultipart(sessionId, form);
        if (res.success && res.data) mergeMessage(res.data);
      } catch (e) {
        Toast.show({ type: 'error', text1: e instanceof Error ? e.message : 'Upload failed' });
      } finally {
        setSending(false);
      }
    },
    [sessionId, mergeMessage],
  );

  const emitTyping = useCallback(() => {
    getChatSocket()?.emit('chat:typing', { sessionId });
  }, [sessionId]);

  const emitStopTyping = useCallback(() => {
    getChatSocket()?.emit('chat:stop-typing', { sessionId });
  }, [sessionId]);

  const renderItem: ListRenderItem<Row> = useCallback(
    ({ item }) => {
      if (item.type === 'day') return <ChatDaySeparator label={item.label} />;
      return <ChatMessageBubble message={item.msg} isMine={item.msg.senderId === myId} />;
    },
    [myId],
  );

  const bottomPad = Math.max(insets.bottom, 8);

  if (loading && messages.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ChatThreadHeader peerName={peerName} peerImageUri={prefImage} isTyping={false} onBack={() => navigation.goBack()} />
        <ChatThreadSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ChatThreadHeader
          peerName={peerName}
          peerImageUri={prefImage}
          isTyping={typing}
          onBack={() => navigation.goBack()}
        />
        {showPropertyBar ? (
          <ChatPropertyContextBar
            title={propertyTitle!}
            price={propertyPrice!}
            listingType={listingType}
            subtitle={null}
            thumbnailUrl={propertyThumb}
            onViewListing={() => navigation.navigate('PropertyDetail', { propertyId: propertyId! })}
          />
        ) : null}

        <FlatList
          ref={listRef}
          data={flatData}
          inverted
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: bottomPad + 8, paddingBottom: 12 }}
          onContentSizeChange={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
        />

        <ChatComposer
          onSendText={sendText}
          onSendImage={sendImage}
          onTyping={emitTyping}
          onStopTyping={emitStopTyping}
          sending={sending}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#faf9fc' },
  flex: { flex: 1 },
});

export default ChatThreadScreen;

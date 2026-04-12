import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, type Asset } from 'react-native-image-picker';

const PRIMARY = '#00152e';
const SURFACE = '#e3e2e5';

export interface ChatComposerProps {
  onSendText: (text: string) => void | Promise<void>;
  onSendImage: (asset: Asset) => void | Promise<void>;
  onTyping: () => void;
  onStopTyping: () => void;
  sending?: boolean;
}

const ChatComposer: React.FC<ChatComposerProps> = ({
  onSendText,
  onSendImage,
  onTyping,
  onStopTyping,
  sending = false,
}) => {
  const [text, setText] = useState('');
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, []);

  const bumpTyping = useCallback(() => {
    onTyping();
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      onStopTyping();
      typingTimer.current = null;
    }, 1200);
  }, [onTyping, onStopTyping]);

  const submit = useCallback(async () => {
    const t = text.trim();
    if (!t || sending) return;
    setText('');
    onStopTyping();
    await onSendText(t);
  }, [text, sending, onSendText, onStopTyping]);

  const pickImage = useCallback(() => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.85, selectionLimit: 1 },
      res => {
        const a = res.assets?.[0];
        if (a) void onSendImage(a);
      },
    );
  }, [onSendImage]);

  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.circleBtn} onPress={pickImage} accessibilityLabel="Attach photo">
        <Icon name="plus" size={26} color={PRIMARY} />
      </TouchableOpacity>
      <View style={styles.inputShell}>
        <TextInput
          style={styles.input}
          placeholder="Type your message…"
          placeholderTextColor="rgba(68,71,77,0.45)"
          value={text}
          onChangeText={v => {
            setText(v);
            if (v.trim()) bumpTyping();
            else onStopTyping();
          }}
          multiline
          maxLength={4000}
          editable={!sending}
        />
        <TouchableOpacity style={styles.inlineIcon} onPress={pickImage} hitSlop={8}>
          <Icon name="image-outline" size={22} color="#44474d" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.sendBtn, sending && styles.sendDisabled]}
        onPress={() => void submit()}
        disabled={sending || !text.trim()}
        accessibilityLabel="Send"
      >
        {sending ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Icon name="send" size={22} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    backgroundColor: 'rgba(250,249,252,0.94)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(196,198,206,0.35)',
  },
  circleBtn: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  inputShell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 999,
    paddingLeft: 16,
    paddingRight: 44,
    minHeight: 48,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: PRIMARY,
    fontWeight: '500',
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    maxHeight: 110,
  },
  inlineIcon: { position: 'absolute', right: 12, top: '30%' },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    shadowColor: PRIMARY,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sendDisabled: { opacity: 0.55 },
});

export default ChatComposer;

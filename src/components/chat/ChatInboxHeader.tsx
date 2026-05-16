import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CHAT } from './chatTheme';

export interface ChatInboxHeaderProps {
  title: string;
  onSearchPress?: () => void;
  onMorePress?: () => void;
}

const ChatInboxHeader: React.FC<ChatInboxHeaderProps> = ({ title, onSearchPress, onMorePress }) => (
  <View style={styles.wrap}>
    <Text style={styles.title}>{title}</Text>
    <View style={styles.actions}>
      <TouchableOpacity
        onPress={onSearchPress}
        style={styles.iconBtn}
        accessibilityLabel="Search messages"
        hitSlop={8}
      >
        <Icon name="magnify" size={22} color={CHAT.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onMorePress} style={styles.iconBtn} accessibilityLabel="More" hitSlop={8}>
        <Icon name="dots-vertical" size={22} color={CHAT.primary} />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    backgroundColor: CHAT.headerBg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: CHAT.separator,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 1 },
    }),
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: CHAT.primary,
    letterSpacing: -0.3,
  },
  actions: { flexDirection: 'row', gap: 4 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatInboxHeader;

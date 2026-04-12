import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PRIMARY = '#00152e';

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
        <Icon name="magnify" size={22} color={PRIMARY} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onMorePress} style={styles.iconBtn} accessibilityLabel="More" hitSlop={8}>
        <Icon name="dots-vertical" size={22} color={PRIMARY} />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: 'rgba(250,249,252,0.92)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 0 },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: PRIMARY,
    letterSpacing: -0.5,
  },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: '#e3e2e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatInboxHeader;

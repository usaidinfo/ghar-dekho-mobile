import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CHAT } from './chatTheme';

/** Subtle chat background (WhatsApp / Telegram style). */
const ChatWallpaper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.root}>{children}</View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: CHAT.wallpaper,
  },
});

export default ChatWallpaper;

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CHAT } from './chatTheme';

const ChatDaySeparator: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.wrap}>
    <View style={styles.pill}>
      <Text style={styles.text}>{label}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'center', marginVertical: 12, paddingHorizontal: 16 },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: CHAT.muted,
    letterSpacing: 0.2,
  },
});

export default ChatDaySeparator;

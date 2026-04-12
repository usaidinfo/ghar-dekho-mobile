import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChatDaySeparator: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.wrap}>
    <View style={styles.pill}>
      <Text style={styles.text}>{label}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'center', marginVertical: 10, paddingHorizontal: 22 },
  pill: {
    backgroundColor: '#e9e7ea',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  text: { fontSize: 10, fontWeight: '800', color: '#44474d', letterSpacing: 0.8, textTransform: 'uppercase' },
});

export default ChatDaySeparator;

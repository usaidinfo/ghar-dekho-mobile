import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { CHAT } from './chatTheme';

export type InboxFilter = 'all' | 'unread' | 'properties' | 'direct';

export interface ChatFilterChipsProps {
  value: InboxFilter;
  onChange: (v: InboxFilter) => void;
}

const CHIPS: { key: InboxFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'properties', label: 'Properties' },
  { key: 'direct', label: 'Direct' },
];

const ChatFilterChips: React.FC<ChatFilterChipsProps> = ({ value, onChange }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.row}
    style={styles.scroll}
  >
    {CHIPS.map(c => {
      const on = value === c.key;
      return (
        <TouchableOpacity
          key={c.key}
          onPress={() => onChange(c.key)}
          style={[styles.chip, on && styles.chipOn]}
          activeOpacity={0.85}
        >
          <Text style={[styles.chipText, on && styles.chipTextOn]}>{c.label}</Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 48,
    backgroundColor: CHAT.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: CHAT.separator,
  },
  row: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: CHAT.surfaceAlt,
  },
  chipOn: { backgroundColor: CHAT.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: CHAT.muted },
  chipTextOn: { color: '#fff' },
});

export default ChatFilterChips;

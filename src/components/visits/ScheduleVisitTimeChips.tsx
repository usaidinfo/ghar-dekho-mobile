import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { VisitTimeSlot } from './visitTimeSlots';

const PRIMARY = '#122A47';
const CHIP_GAP = 10;

interface Props {
  slots: VisitTimeSlot[];
  selectedId: string | null;
  onSelect: (slot: VisitTimeSlot) => void;
}

export default function ScheduleVisitTimeChips({ slots, selectedId, onSelect }: Props) {
  return (
    <View style={styles.wrap}>
      {slots.map(slot => {
        const selected = slot.id === selectedId;
        return (
          <View key={slot.id} style={styles.chipSlot}>
            <Pressable
              onPress={() => onSelect(slot)}
              style={({ pressed }) => [
                styles.chip,
                selected ? styles.chipSelected : styles.chipDefault,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{slot.label}</Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginRight: -CHIP_GAP,
    marginBottom: -CHIP_GAP,
  },
  chipSlot: {
    marginRight: CHIP_GAP,
    marginBottom: CHIP_GAP,
  },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  chipDefault: {
    borderColor: '#c4c6ce',
    backgroundColor: '#faf9fc',
  },
  chipSelected: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY,
  },
  chipTextSelected: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.88,
  },
});

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import type { VisitTimeSlot } from './visitTimeSlots';

interface Props {
  slots: VisitTimeSlot[];
  selectedId: string | null;
  onSelect: (slot: VisitTimeSlot) => void;
}

export default function ScheduleVisitTimeChips({ slots, selectedId, onSelect }: Props) {
  return (
    <View className="flex-row flex-wrap gap-3">
      {slots.map(slot => {
        const selected = slot.id === selectedId;
        return (
          <Pressable
            key={slot.id}
            onPress={() => onSelect(slot)}
            className={[
              // Match HTML: px-6 py-3, compact pills (NOT full-width)
              'items-center justify-center rounded-full border px-6 py-3',
              selected
                ? 'border-primary bg-primary shadow-lg shadow-primary/20'
                : 'border-outline-variant bg-surface-container-lowest',
            ].join(' ')}
          >
            <Text className={selected ? 'text-sm font-bold text-white' : 'text-sm font-semibold text-primary'}>
              {slot.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}


import React from 'react';
import { Pressable, View } from 'react-native';

interface ListPropertyToggleProps {
  value: boolean;
  onValueChange: (next: boolean) => void;
}

const TRACK_W = 48;
const THUMB = 20;
const PAD = 2;

/** Teal iOS-style switch matching list-property design (#008080 on). */
const ListPropertyToggle: React.FC<ListPropertyToggleProps> = ({ value, onValueChange }) => (
  <Pressable
    onPress={() => onValueChange(!value)}
    accessibilityRole="switch"
    accessibilityState={{ checked: value }}
    hitSlop={8}
  >
    <View
      className={`h-6 w-12 justify-center overflow-hidden rounded-full ${value ? 'bg-brand-teal' : 'bg-surface-container-highest'}`}
    >
      <View
        className="rounded-full border border-outline-light bg-white"
        style={{
          width: THUMB,
          height: THUMB,
          marginLeft: value ? TRACK_W - THUMB - PAD : PAD,
        }}
      />
    </View>
  </Pressable>
);

export default ListPropertyToggle;

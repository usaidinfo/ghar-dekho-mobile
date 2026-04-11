import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface PropertyDetailStickyActionsProps {
  bottomInset: number;
  onChat: () => void;
  onSchedule: () => void;
}

const PropertyDetailStickyActions: React.FC<PropertyDetailStickyActionsProps> = ({
  bottomInset,
  onChat,
  onSchedule,
}) => (
  <View
    className="absolute bottom-0 left-0 right-0 z-50 border-t border-outline-light/30 bg-surface-page/95 px-6 pt-5"
    style={{ paddingBottom: Math.max(bottomInset, 12) + 8 }}
  >
    <View className="flex-row gap-4">
      <Pressable
        onPress={onChat}
        className="h-16 flex-1 flex-row items-center justify-center gap-2 rounded-full border-2 border-primary bg-transparent active:opacity-90"
      >
        <Icon name="chat-outline" size={20} color="#122A47" />
        <Text className="text-[11px] font-black uppercase tracking-widest text-primary">In-App Chat</Text>
      </Pressable>
      <Pressable
        onPress={onSchedule}
        className="h-16 flex-[1.5] flex-row items-center justify-center gap-2 rounded-full bg-primary shadow-xl shadow-primary/30 active:opacity-90"
      >
        <Icon name="calendar-month" size={20} color="#ffffff" />
        <Text className="text-[11px] font-black uppercase tracking-widest text-white">Schedule Visit</Text>
      </Pressable>
    </View>
  </View>
);

export default PropertyDetailStickyActions;

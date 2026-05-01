import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SearchFiltersPanel, { type SearchFiltersState } from './SearchFiltersPanel';

export interface SearchFiltersModalProps {
  visible: boolean;
  onClose: () => void;
  value: SearchFiltersState;
  onChange: (next: SearchFiltersState) => void;
  onApply: () => void;
  onClear: () => void;
}

export default function SearchFiltersModal({
  visible,
  onClose,
  value,
  onChange,
  onApply,
  onClear,
}: SearchFiltersModalProps) {
  const ref = React.useRef<BottomSheetModal>(null);
  const snapPoints = React.useMemo(() => ['85%'], []);

  React.useEffect(() => {
    if (visible) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [visible]);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onClose}
      backdropComponent={props => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
          opacity={0.4}
          style={{ backgroundColor: '#00152e' }}
        />
      )}
      handleIndicatorStyle={{ opacity: 0 }}
      backgroundStyle={{
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      }}
    >
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-surface-container px-6 py-6">
          <View>
            <Text className="text-xl font-bold text-primary">Filters</Text>
            <Text className="mt-1 text-sm text-on-surface-variant">Refine your search</Text>
          </View>
          <Pressable
            onPress={() => ref.current?.dismiss()}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface-container-low"
            hitSlop={10}
          >
            <Icon name="close" size={20} color="#1b1c1e" />
          </Pressable>
        </View>

        {/* Content */}
        <BottomSheetScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <SearchFiltersPanel open value={value} onChange={onChange} showActions={false} />
        </BottomSheetScrollView>

        {/* Footer */}
        <View className="flex-row gap-4 border-t border-surface-container px-6 py-6">
          <Pressable
            onPress={() => {
              onClear();
              ref.current?.dismiss();
            }}
            className="flex-1 items-center justify-center rounded-full py-4 active:bg-surface-container"
          >
            <Text className="text-sm font-extrabold text-primary">Clear All</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              onApply();
              ref.current?.dismiss();
            }}
            className="flex-[2] items-center justify-center rounded-full bg-primary py-4 shadow-lg active:opacity-95"
          >
            <Text className="text-sm font-extrabold text-white">Apply Filters</Text>
          </Pressable>
        </View>
      </View>
    </BottomSheetModal>
  );
}


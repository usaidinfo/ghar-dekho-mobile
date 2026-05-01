import React from 'react';
import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { MainStackParamList } from '../../navigation/types';
import { PROPERTY_PLACEHOLDER_IMAGE } from '../../constants/images';

type Props = NativeStackScreenProps<MainStackParamList, 'VisitScheduled'>;

export default function VisitScheduledScreen({ navigation, route }: Props) {
  const p = route.params;
  const thumb = p.propertyThumb ?? PROPERTY_PLACEHOLDER_IMAGE;

  return (
    <View className="flex-1 bg-surface">
      <View className="flex-row items-center justify-between bg-surface px-6 py-4">
        <Pressable onPress={() => navigation.goBack()} className="flex-row items-center gap-2">
          <Icon name="close" size={20} color="#00152e" />
          <Text className="text-lg font-semibold tracking-tight text-primary">Private Visit</Text>
        </Pressable>
        <Text className="text-xl font-extrabold text-primary">Ghar Dekho</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24, paddingBottom: 40 }}>
        <View className="items-center">
          <View className="relative mb-10">
            <View className="absolute inset-0 rounded-full bg-secondary-fixed-dim opacity-20 blur-3xl" />
            <View className="rounded-full bg-surface-container-lowest p-8">
              <View className="rounded-full bg-secondary p-6">
                <Icon name="check-circle" size={54} color="#FFFFFF" />
              </View>
            </View>
          </View>

          <View className="mb-12 items-center">
            <Text className="text-center text-5xl font-extrabold tracking-tight text-primary">
              Visit{'\n'}Scheduled!
            </Text>
            <Text className="mt-4 max-w-[320px] text-center text-base font-medium text-on-surface-variant">
              The owner has been notified. You can find this in your Visits tab.
            </Text>
          </View>

          <View className="w-full">
            <View className="relative w-full overflow-hidden rounded-2xl">
              <Image source={{ uri: thumb }} className="h-56 w-full" resizeMode="cover" />
              {p.isVerified ? (
                <View className="absolute left-4 top-4 flex-row items-center gap-2 rounded-full bg-primary/80 px-4 py-1.5">
                  <Icon name="check-decagram" size={14} color="#FFFFFF" />
                  <Text className="text-[10px] font-black uppercase tracking-widest text-white">
                    Verified Property
                  </Text>
                </View>
              ) : null}
            </View>

            <View className="-mt-4 rounded-2xl bg-surface-container-low px-8 py-10">
              <Text className="mb-8 text-2xl font-extrabold text-primary">{p.propertyTitle}</Text>

              <View className="gap-6">
                <View className="flex-row items-center gap-4">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-container-highest">
                    <Icon name="calendar-month" size={18} color="#7d5705" />
                  </View>
                  <View>
                    <Text className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
                      Date
                    </Text>
                    <Text className="text-base font-semibold text-on-surface">{p.dateLabel}</Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-4">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-container-highest">
                    <Icon name="clock-outline" size={18} color="#7d5705" />
                  </View>
                  <View>
                    <Text className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
                      Time
                    </Text>
                    <Text className="text-base font-semibold text-on-surface">{p.timeLabel}</Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-4">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-container-highest">
                    <Icon name="map-marker" size={18} color="#7d5705" />
                  </View>
                  <View>
                    <Text className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
                      Type
                    </Text>
                    <Text className="text-base font-semibold text-on-surface">{p.typeLabel}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View className="mt-10 w-full gap-4">
            <Pressable
              onPress={() => navigation.navigate('MyVisits')}
              className="w-full rounded-2xl bg-primary px-10 py-5"
            >
              <Text className="text-center text-lg font-extrabold text-white">View My Visits</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('PropertyDetail', { propertyId: p.propertyId })}
              className="w-full rounded-2xl border-2 border-outline-variant/30 bg-transparent px-10 py-4"
            >
              <Text className="text-center text-lg font-extrabold text-on-surface">Back to Property</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}


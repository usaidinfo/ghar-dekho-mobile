import React from 'react';
import { View, Text, Pressable, Image, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NearbyEssentialItem } from '../../types/property-detail.types';
import { mciForEssential } from './essentialIcons';

const FALLBACK_MAP =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDYVMhgGmclOF3RflYgX54d8A7s05fSLKRsvg0RXIYEZxox517NWKfEClYPc2NUeQf-aHicK9Z4n3cP0JVM-sTTQ2IxiDYmo4DloDngPWG0CCNtbs1JX0k87MHhXHLDDRtcg9qNlaLH9pU5mjlgM3RjyPgJfzzTJwJEnt0O79Bye5QROmNxS4H9f9Yq5nrbv7vTcRa9snNUHif5AnJqHACtxJcMVanQUQCebHEDiUIZQIyo89ymnNMXAgGPsFTATXcv5kZQjWqQSk6Z';

interface PropertyLocationLegalSectionProps {
  latitude: number;
  longitude: number;
  isRERAApproved?: boolean;
  reraNumber?: string | null;
  nearbyEssentials?: NearbyEssentialItem[];
}

function osmStaticMapUrl(lat: number, lng: number): string {
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=15&size=600x320&maptype=mapnik`;
}

const PropertyLocationLegalSection: React.FC<PropertyLocationLegalSectionProps> = ({
  latitude,
  longitude,
  isRERAApproved,
  reraNumber,
  nearbyEssentials,
}) => {
  const mapUri =
    Number.isFinite(latitude) && Number.isFinite(longitude)
      ? osmStaticMapUrl(latitude, longitude)
      : FALLBACK_MAP;

  const openMaps = () => {
    const q = `${latitude},${longitude}`;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`);
  };

  const essentials = nearbyEssentials?.length ? nearbyEssentials : [];

  return (
    <View className="mt-12">
      <View className="mb-6 flex-row items-center justify-between px-1">
        <Text className="text-xl font-extrabold tracking-tight text-primary">Location & Legal</Text>
        <Pressable onPress={openMaps} hitSlop={8}>
          <Text className="border-b-2 border-brand-teal pb-1 text-[11px] font-black uppercase tracking-widest text-brand-teal">
            View Map
          </Text>
        </Pressable>
      </View>

      <Pressable onPress={openMaps} className="relative mb-8 h-56 w-full overflow-hidden rounded-2xl shadow-lg">
        <Image source={{ uri: mapUri }} className="h-full w-full" resizeMode="cover" style={{ opacity: 0.92 }} />
        <View className="absolute inset-0 items-center justify-center bg-black/5">
          <View className="h-14 w-14 animate-pulse items-center justify-center rounded-full bg-primary shadow-2xl">
            <Icon name="map-marker" size={32} color="#ffffff" />
          </View>
        </View>
      </Pressable>

      {isRERAApproved && reraNumber ? (
        <View className="mb-6 flex-row items-center justify-between rounded-2xl border-l-8 border-brand-teal bg-surface-muted p-6 shadow-sm">
          <View className="min-w-0 flex-1 pr-3">
            <Text className="text-base font-extrabold text-primary">RERA Approved</Text>
            <Text className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-muted">{reraNumber}</Text>
          </View>
          <Icon name="shield-check" size={36} color="#008080" />
        </View>
      ) : null}

      {essentials.length > 0 ? (
        <View className="rounded-2xl border border-outline-light/30 bg-surface-muted p-7 shadow-sm">
          <Text className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-muted">
            Nearby Essentials
          </Text>
          <View className="gap-5">
            {essentials.map(item => (
              <View key={item.id} className="flex-row items-center justify-between gap-3">
                <View className="min-w-0 flex-1 flex-row items-center gap-4">
                  <View className="rounded-full bg-primary/5 p-2">
                    <Icon name={mciForEssential(item.type)} size={22} color="#122A47" />
                  </View>
                  <Text className="min-w-0 flex-1 text-sm font-bold text-primary" numberOfLines={2}>
                    {item.name}
                  </Text>
                </View>
                <Text className="text-xs font-black text-slate-muted">{item.distance.toFixed(1)} km</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default PropertyLocationLegalSection;

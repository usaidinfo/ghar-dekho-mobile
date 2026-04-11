import React from 'react';
import { View, Image, Pressable, Text, Share, Dimensions, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { PropertyImageItem, PropertyVideoItem, VirtualTourItem } from '../../types/property-detail.types';

const HERO_H = 400;
const FALLBACK_HERO =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCG2pa1B5srphbbVLfOU6cfDrD1Brk-YQef3PpPULaMhyZAD_CYphm-iAyiq63kQfg6AutRphNQDl20znm25psjfHua3FWDfsQruZyx-HBJcnyFRp2y7ie6_4va1hztYdslgCE8PXj-zeQamUmDizBOEqWsBp14gdACxfs4kJ5Z7wRA_HvfJiWPtsy6jH29zDG4jDV6q6npeBBumsguy3MAEF95HptNwXRopKWhLQhS-5TZmIkL_3klv5w99WOPtHumGoD9oBKfLFKa';

interface PropertyHeroGalleryProps {
  images: PropertyImageItem[];
  videos?: PropertyVideoItem[];
  virtualTours?: VirtualTourItem[];
  title: string;
  topInset: number;
  onBack: () => void;
  on360?: () => void;
  onVideoTour?: () => void;
  show360Pill: boolean;
  showVideoPill: boolean;
}

const GlassPill: React.FC<{ children: React.ReactNode; onPress?: () => void }> = ({ children, onPress }) => {
  const inner = (
    <View className="h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-sm">{children}</View>
  );
  if (onPress) return <Pressable onPress={onPress}>{inner}</Pressable>;
  return inner;
};

const MediaChip: React.FC<{ icon: string; label: string; onPress?: () => void }> = ({ icon, label, onPress }) => (
  <Pressable
    onPress={onPress}
    disabled={!onPress}
    className="flex-row items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 shadow-sm"
  >
    <Icon name={icon} size={18} color="#122A47" />
    <Text className="text-[11px] font-bold uppercase tracking-wider text-primary">{label}</Text>
  </Pressable>
);

const PropertyHeroGallery: React.FC<PropertyHeroGalleryProps> = ({
  images,
  title,
  topInset,
  onBack,
  on360,
  onVideoTour,
  show360Pill,
  showVideoPill,
}) => {
  const primary =
    images.find(i => i.isPrimary)?.imageUrl || images[0]?.imageUrl || images[0]?.thumbnailUrl || FALLBACK_HERO;

  const onShare = async () => {
    try {
      await Share.share({ message: `${title}\n${primary}` });
    } catch {
      /* ignore */
    }
  };

  const w = Dimensions.get('window').width;

  return (
    <View style={{ height: HERO_H, width: w }} className="overflow-hidden bg-slate-200">
      <Image source={{ uri: primary }} className="h-full w-full" resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.45)']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View
        className="absolute left-6 right-6 flex-row items-center justify-between"
        style={{ top: topInset + 8 }}
      >
        <GlassPill onPress={onBack}>
          <Icon name="arrow-left" size={22} color="#122A47" />
        </GlassPill>
        <View className="flex-row gap-3">
          <GlassPill onPress={onShare}>
            <Icon name="share-variant" size={20} color="#122A47" />
          </GlassPill>
          <GlassPill>
            <Icon name="heart" size={22} color="#ba1a1a" />
          </GlassPill>
        </View>
      </View>

      <View className="absolute bottom-6 left-6 flex-row flex-wrap gap-2">
        {show360Pill ? <MediaChip icon="panorama-outline" label="360° Virtual View" onPress={on360} /> : null}
        {showVideoPill ? <MediaChip icon="play-circle-outline" label="Video Tour" onPress={onVideoTour} /> : null}
      </View>
    </View>
  );
};

export default PropertyHeroGallery;

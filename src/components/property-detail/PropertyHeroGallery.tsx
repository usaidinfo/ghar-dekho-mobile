import React, { useMemo } from 'react';
import {
  View,
  Image,
  Pressable,
  Text,
  Share,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { PropertyImageItem } from '../../types/property-detail.types';
import { PROPERTY_PLACEHOLDER_IMAGE } from '../../constants/images';

const GLASS = 'rgba(255, 255, 255, 0.22)';
const GLASS_BORDER = 'rgba(255, 255, 255, 0.35)';
const PILL_BG = 'rgba(255, 255, 255, 0.76)';
const PILL_BORDER = 'rgba(15, 23, 42, 0.14)';
const PILL_FG = '#122A47';
const FALLBACK_HERO = PROPERTY_PLACEHOLDER_IMAGE;

function heroHeight(screenH: number, screenW: number): number {
  const pct = Math.round(screenH * 0.52);
  const cap = screenW >= 430 ? 520 : 500;
  return Math.min(Math.max(pct, 300), cap);
}

interface PropertyHeroGalleryProps {
  images: PropertyImageItem[];
  title: string;
  topInset: number;
  onBack: () => void;
  on360?: () => void;
  onVideoTour?: () => void;
  favorited?: boolean;
  onToggleFavorite?: () => void;
  favoriteBusy?: boolean;
}

const PropertyHeroGallery: React.FC<PropertyHeroGalleryProps> = ({
  images,
  title,
  topInset,
  onBack,
  on360,
  onVideoTour,
  favorited = false,
  onToggleFavorite,
  favoriteBusy = false,
}) => {
  const { width: winW, height: winH } = useWindowDimensions();
  const h = useMemo(() => heroHeight(winH, winW), [winH, winW]);
  const horizontalPad = winW < 360 ? 16 : winW < 400 ? 20 : 24;

  const primary =
    images.find(i => i.isPrimary)?.imageUrl || images[0]?.imageUrl || images[0]?.thumbnailUrl || FALLBACK_HERO;

  const onShare = async () => {
    try {
      await Share.share({ message: `${title}\n${primary}` });
    } catch {
      /* ignore */
    }
  };

  return (
    <View style={[styles.heroWrap, { height: h }]}>
      <Image source={{ uri: primary }} style={StyleSheet.absoluteFill} resizeMode="cover" />

      <LinearGradient
        colors={['rgba(0,0,0,0.22)', 'transparent', 'transparent']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(253,253,253,0.92)', '#FDFDFD']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={[styles.topBar, { paddingTop: topInset + 8, left: horizontalPad, right: horizontalPad }]}>
        <Pressable onPress={onBack} style={styles.glassCircle} accessibilityRole="button" accessibilityLabel="Back">
          <Icon name="arrow-left" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={styles.topRight}>
          <Pressable onPress={onShare} style={styles.glassCircle} accessibilityRole="button" accessibilityLabel="Share">
            <Icon name="share-variant" size={20} color="#FFFFFF" />
          </Pressable>
          <Pressable
            onPress={onToggleFavorite}
            disabled={!onToggleFavorite || favoriteBusy}
            style={[styles.glassCircle, favoriteBusy && { opacity: 0.55 }]}
            accessibilityRole="button"
            accessibilityLabel={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Icon name={favorited ? 'heart' : 'heart-outline'} size={22} color={favorited ? '#F472B6' : '#FFFFFF'} />
          </Pressable>
        </View>
      </View>

      <View style={[styles.pillRow, { left: horizontalPad, right: horizontalPad, bottom: Math.max(56, h * 0.1) }]}>
        <Pressable
          onPress={on360}
          style={({ pressed }) => [styles.mediaPill, pressed && styles.pillPressed]}
        >
          <Icon name="panorama-sphere" size={18} color={PILL_FG} />
          <Text style={styles.mediaPillText} numberOfLines={1}>
            360° Virtual Tour
          </Text>
        </Pressable>
        <Pressable
          onPress={onVideoTour}
          style={({ pressed }) => [styles.mediaPill, pressed && styles.pillPressed]}
        >
          <Icon name="play-circle-outline" size={18} color={PILL_FG} />
          <Text style={styles.mediaPillText} numberOfLines={1}>
            Video
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroWrap: {
    width: '100%',
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  topRight: {
    flexDirection: 'row',
    gap: 12,
  },
  glassCircle: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: GLASS,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 4 },
    }),
  },
  pillRow: {
    position: 'absolute',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    zIndex: 20,
  },
  mediaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: PILL_BG,
    borderWidth: 1,
    borderColor: PILL_BORDER,
    maxWidth: '48%',
  },
  pillPressed: {
    opacity: 0.88,
  },
  mediaPillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.8,
    color: PILL_FG,
    textTransform: 'uppercase',
  },
});

export default PropertyHeroGallery;

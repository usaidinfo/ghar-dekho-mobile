import React, { useState } from 'react';
import {
  View,
  Image,
  Pressable,
  Text,
  Share,
  StyleSheet,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { PropertyImageItem } from '../../types/property-detail.types';

const HERO_H = 400;
const PRIMARY = '#122A47';
const GLASS = 'rgba(255, 255, 255, 0.88)';

const FALLBACK_HERO =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCG2pa1B5srphbbVLfOU6cfDrD1Brk-YQef3PpPULaMhyZAD_CYphm-iAyiq63kQfg6AutRphNQDl20znm25psjfHua3FWDfsQruZyx-HBJcnyFRp2y7ie6_4va1hztYdslgCE8PXj-zeQamUmDizBOEqWsBp14gdACxfs4kJ5Z7wRA_HvfJiWPtsy6jH29zDG4jDV6q6npeBBumsguy3MAEF95HptNwXRopKWhLQhS-5TZmIkL_3klv5w99WOPtHumGoD9oBKfLFKa';

interface PropertyHeroGalleryProps {
  images: PropertyImageItem[];
  title: string;
  topInset: number;
  onBack: () => void;
  on360?: () => void;
  onVideoTour?: () => void;
}

const PropertyHeroGallery: React.FC<PropertyHeroGalleryProps> = ({
  images,
  title,
  topInset,
  onBack,
  on360,
  onVideoTour,
}) => {
  const [favorited, setFavorited] = useState(false);
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
    <View style={styles.heroWrap}>
      <Image source={{ uri: primary }} style={StyleSheet.absoluteFill} resizeMode="cover" />

      <LinearGradient
        colors={['rgba(0,0,0,0.35)', 'transparent', 'transparent']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.5)']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={[styles.topBar, { paddingTop: topInset + 8 }]}>
        <Pressable onPress={onBack} style={styles.glassCircle} accessibilityRole="button">
          <Icon name="arrow-left" size={22} color={PRIMARY} />
        </Pressable>
        <View style={styles.topRight}>
          <Pressable onPress={onShare} style={styles.glassCircle} accessibilityRole="button">
            <Icon name="share-variant" size={20} color={PRIMARY} />
          </Pressable>
          <Pressable
            onPress={() => setFavorited(f => !f)}
            style={styles.glassCircle}
            accessibilityRole="button"
          >
            <Icon name={favorited ? 'heart' : 'heart-outline'} size={22} color="#DC2626" />
          </Pressable>
        </View>
      </View>

      <View style={styles.pillRow}>
        <Pressable
          onPress={on360}
          style={({ pressed }) => [styles.mediaPill, pressed && styles.pillPressed]}
        >
          <Icon name="panorama-sphere" size={18} color={PRIMARY} />
          <Text style={styles.mediaPillText}>360° Virtual View</Text>
        </Pressable>
        <Pressable
          onPress={onVideoTour}
          style={({ pressed }) => [styles.mediaPill, pressed && styles.pillPressed]}
        >
          <Icon name="play-circle-outline" size={18} color={PRIMARY} />
          <Text style={styles.mediaPillText}>Video Tour</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroWrap: {
    height: HERO_H,
    width: '100%',
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  topBar: {
    position: 'absolute',
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topRight: {
    flexDirection: 'row',
    gap: 12,
  },
  glassCircle: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: GLASS,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 3 },
    }),
  },
  pillRow: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mediaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: GLASS,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  pillPressed: {
    opacity: 0.85,
  },
  mediaPillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: PRIMARY,
    textTransform: 'uppercase',
  },
});

export default PropertyHeroGallery;

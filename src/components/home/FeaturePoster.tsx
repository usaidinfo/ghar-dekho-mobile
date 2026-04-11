/**
 * @file FeaturePoster.tsx
 * @description Large hero card — driven by featured / latest listing from GET /api/properties.
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { FeaturedHero } from '../../types/property.types';

interface FeaturePosterProps {
  hero: FeaturedHero;
  onPress?: () => void;
}

const FeaturePoster: React.FC<FeaturePosterProps> = ({ hero, onPress }) => {
  return (
    <View style={styles.container}>
      {/* Full-bleed image */}
      <Image source={{ uri: hero.imageUrl }} style={styles.image} resizeMode="cover" />

      {/* Gradient-style dark overlay */}
      <View style={styles.overlay} />

      {/* Content */}
      <View style={styles.content}>
        {/* Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{hero.badgeLabel.toUpperCase()}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={3}>
          {hero.title}
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle} numberOfLines={2}>
          {hero.subtitle}
        </Text>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.cta, !onPress && styles.ctaDisabled]}
          onPress={onPress}
          disabled={!onPress}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>{hero.ctaLabel}</Text>
          <Icon name="arrow-right" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginBottom: 32,
    height: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  // Two-layer overlay: strong dark at bottom, light in middle, transparent at top
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18,42,71,0.55)',
    // Simulate gradient: stronger overlay at bottom using a second inner overlay
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 28,
    paddingTop: 80,
    // Stronger gradient at the bottom via background
    backgroundColor: 'rgba(18,42,71,0.6)',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#D1A14E',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 32,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 19,
    marginBottom: 20,
  },
  ctaDisabled: {
    opacity: 0.45,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1A14E',
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 13,
    gap: 8,
    shadowColor: '#D1A14E',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default FeaturePoster;

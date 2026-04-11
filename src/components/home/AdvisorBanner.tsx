/**
 * @file AdvisorBanner.tsx
 * @description Ghar Advisor AI promotional banner card.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface AdvisorBannerProps {
  onPress?: () => void;
}

const AdvisorBanner: React.FC<AdvisorBannerProps> = ({ onPress }) => {
  return (
    <View className="px-6 mb-10">
      <View style={styles.card}>
        {/* Decorative Glow Blob */}
        <View style={styles.glowBlob} />

        {/* Text Content */}
        <View style={styles.textContent}>
          <Text className="text-white text-lg font-extrabold mb-1.5 tracking-tight">
            Ghar Advisor AI
          </Text>
          <Text className="text-white/60 text-[11px] leading-4 mb-5">
            Predict property price trends with 94% accuracy using our
            deep-learning engine.
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={onPress}
            activeOpacity={0.85}
          >
            <Text className="text-primary text-[11px] font-extrabold">Try Predictor</Text>
            <Icon name="arrow-forward" size={14} color="#122A47" />
          </TouchableOpacity>
        </View>

        {/* Decorative Background Icon */}
        <View style={styles.iconWrapper} pointerEvents="none">
          <Icon name="query-stats" size={80} color="#D1A14E" style={{ opacity: 0.3 }} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#122A47',
    borderRadius: 24,
    padding: 28,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#122A47',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  glowBlob: {
    position: 'absolute',
    bottom: -32,
    right: -32,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: 'rgba(0,109,119,0.25)',
  },
  textContent: {
    flex: 1,
    paddingRight: 16,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1A14E',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    gap: 6,
    shadowColor: '#D1A14E',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  iconWrapper: {
    position: 'absolute',
    right: 20,
    top: '25%',
  },
});

export default AdvisorBanner;

/**
 * @file ProjectCard.tsx
 * @description Card for Recommended Projects section.
 * Shows image with badge, title, location, price, and BHK config.
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { Project, ProjectBadge } from '../../types/property.types';

// Badge appearance varies by type
const getBadgeStyle = (badge: ProjectBadge) => {
  switch (badge) {
    case 'VERIFIED':
      return { bg: '#D1A14E', text: '#ffffff' };
    case 'PRE-LAUNCH':
      return { bg: '#E0F4F3', text: '#006D6D' };
    case 'EXCLUSIVE':
      return { bg: '#122A47', text: '#ffffff' };
    case 'NEW LAUNCH':
      return { bg: '#EFF6FF', text: '#1D4ED8' };
    case 'HOT PROJECT':
      return { bg: '#FEF3C7', text: '#92400E' };
    case 'READY TO MOVE':
      return { bg: '#DCFCE7', text: '#166534' };
    default:
      return { bg: '#E9E7EA', text: '#44474D' };
  }
};

interface ProjectCardProps {
  project: Project;
  onPress?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onPress }) => {
  const badgeStyle = project.badge ? getBadgeStyle(project.badge) : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: project.imageUrl }} style={styles.image} resizeMode="cover" />
        {badgeStyle && project.badge && (
          <View style={[styles.badge, { backgroundColor: badgeStyle.bg }]}>
            <Text style={[styles.badgeText, { color: badgeStyle.text }]}>{project.badge}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{project.title}</Text>
        <View style={styles.locationRow}>
          <Icon name="map-marker" size={13} color="#777779" />
          <Text style={styles.location} numberOfLines={1}>
            {project.locality}, {project.city}
          </Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{project.priceLabel}</Text>
          <Text style={styles.bhk}>{project.bhkConfig}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 280,
    backgroundColor: '#F5F3F6',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  imageContainer: {
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#122A47',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 12,
  },
  location: {
    fontSize: 12,
    color: '#777779',
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D1A14E',
  },
  bhk: {
    fontSize: 11,
    fontWeight: '600',
    color: '#44474D',
  },
});

export default ProjectCard;

/**
 * @file ProjectCarousel.tsx
 * @description Horizontal FlatList of ProjectCard for "Recommended Projects".
 */

import React from 'react';
import { View, FlatList } from 'react-native';
import ProjectCard from './ProjectCard';
import SectionHeader from './SectionHeader';
import type { Project } from '../../types/property.types';

interface ProjectCarouselProps {
  data: Project[];
  title?: string;
  subtitle?: string;
  onViewAll?: () => void;
  onProjectPress?: (project: Project) => void;
}

const ProjectCarousel: React.FC<ProjectCarouselProps> = ({
  data,
  title = 'Recommended for you',
  subtitle = 'Fresh listings picked from your filters',
  onViewAll,
  onProjectPress,
}) => {
  return (
    <View style={{ marginBottom: 32 }}>
      <SectionHeader title={title} subtitle={subtitle} onViewAll={onViewAll} />
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
        renderItem={({ item }) => (
          <ProjectCard project={item} onPress={() => onProjectPress?.(item)} />
        )}
      />
    </View>
  );
};

export default ProjectCarousel;

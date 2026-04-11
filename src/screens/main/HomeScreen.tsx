/**
 * @file HomeScreen.tsx
 * @description Home: categories, hero, recommended listings, nearby, top in city.
 * Data: useHomeData → GET /api/properties/featured, /properties, /nearby.
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import CategoryChips from '../../components/home/CategoryChips';
import FeaturePoster from '../../components/home/FeaturePoster';
import ProjectCarousel from '../../components/home/ProjectCarousel';
import NearbySection from '../../components/home/NearbySection';
import TopListingsSection from '../../components/home/TopListingsSection';

import { useHomeData } from '../../hooks/useHomeData';
import type { PropertyCategory, Project, NearbyProperty, TopListing } from '../../types/property.types';
import type { MainStackParamList } from '../../navigation/types';

type HomeNavProp = NativeStackNavigationProp<MainStackParamList>;

const HomeHeader: React.FC<{ onMenuPress?: () => void }> = ({ onMenuPress }) => (
  <View style={styles.header}>
    <View style={styles.logoRow}>
      <Icon name="home-city" size={24} color="#122A47" />
      <Text style={styles.logoText}>Ghar Dekho India</Text>
    </View>
    <TouchableOpacity onPress={onMenuPress} activeOpacity={0.7} style={styles.menuBtn}>
      <Icon name="menu" size={24} color="#122A47" />
    </TouchableOpacity>
  </View>
);

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavProp>();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<PropertyCategory>('Buy');

  const {
    hero,
    recommended,
    nearby,
    topListings,
    topListingsCity,
    loading,
    refreshing,
    error,
    refetch,
  } = useHomeData(selectedCategory);

  const handleListingPress = useCallback(
    (propertyId: string) => {
      if (!propertyId) return;
      navigation.navigate('PropertyDetail', { propertyId });
    },
    [navigation],
  );

  const handleProjectPress = useCallback(
    (project: Project) => handleListingPress(project.id),
    [handleListingPress],
  );

  const handleNearbyPress = useCallback(
    (property: NearbyProperty) => handleListingPress(property.id),
    [handleListingPress],
  );

  const handleTopListingPress = useCallback(
    (listing: TopListing) => handleListingPress(listing.id),
    [handleListingPress],
  );

  const goSearch = useCallback(
    () => navigation.navigate('SearchResults', { category: selectedCategory }),
    [navigation, selectedCategory],
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#faf9fc" />

      <HomeHeader />

      {loading && !refreshing ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#122A47" />
          <Text style={styles.loadingText}>Loading homes…</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor="#122A47" />
          }
        >
          {error ? (
            <View style={styles.errorBanner}>
              <Icon name="alert-circle-outline" size={20} color="#92400E" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <CategoryChips selected={selectedCategory} onSelect={setSelectedCategory} />

          <FeaturePoster
            hero={hero}
            onPress={
              hero.propertyId ? () => handleListingPress(hero.propertyId) : undefined
            }
          />

          {recommended.length > 0 ? (
            <ProjectCarousel
              data={recommended}
              onProjectPress={handleProjectPress}
              onViewAll={goSearch}
            />
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyTitle}>No listings in this category yet</Text>
              <Text style={styles.emptySub}>Try another tab or check back soon.</Text>
            </View>
          )}

          {nearby.length > 0 ? (
            <NearbySection data={nearby} onCardPress={handleNearbyPress} onViewAll={goSearch} />
          ) : null}

          {topListings.length > 0 ? (
            <TopListingsSection
              data={topListings}
              city={topListingsCity}
              onItemPress={handleTopListingPress}
            />
          ) : null}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#faf9fc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    height: 64,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#122A47',
    letterSpacing: -0.5,
  },
  menuBtn: {
    padding: 6,
    borderRadius: 999,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#777779',
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#78350F',
    fontWeight: '500',
  },
  emptySection: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#122A47',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: '#777779',
  },
});

export default HomeScreen;

/**
 * @file HomeScreen.tsx
 * @description Home: categories, hero, recommended listings, nearby, top in city.
 * Data: useHomeData → GET /api/properties/featured, /properties, /nearby.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
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

import HomeHeader from '../../components/home/HomeHeader';
import CategoryChips from '../../components/home/CategoryChips';
import FeaturePoster from '../../components/home/FeaturePoster';
import ProjectCarousel from '../../components/home/ProjectCarousel';
import NearbySection from '../../components/home/NearbySection';
import TopListingsSection from '../../components/home/TopListingsSection';
import HomeScreenSkeleton from '../../components/home/skeletons/HomeScreenSkeleton';
import LocationSearchModal from '../../components/home/LocationSearchModal';
import AppBannerAd from '../../components/ads/AppBannerAd';

import { useHomeData } from '../../hooks/useHomeData';
import { useUserLocation } from '../../hooks/useUserLocation';
import { useLocationStore } from '../../stores/location.store';
import type { PropertyCategory, Project, NearbyProperty, TopListing } from '../../types/property.types';
import type { MainStackParamList } from '../../navigation/types';

type HomeNavProp = NativeStackNavigationProp<MainStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavProp>();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<PropertyCategory>('Buy');
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  const userLat = useLocationStore(s => s.latitude);
  const userLng = useLocationStore(s => s.longitude);
  const locationName = useLocationStore(s => s.locationName);
  const locationHydrated = useLocationStore(s => s.hasHydrated);
  const setLocation = useLocationStore(s => s.setLocation);

  const { detect } = useUserLocation();
  const autoDetectDone = useRef(false);

  useEffect(() => {
    if (!locationHydrated || autoDetectDone.current) return;
    if (userLat !== null && userLng !== null) {
      autoDetectDone.current = true;
      return;
    }
    autoDetectDone.current = true;
    detect().then(loc => {
      if (loc) setLocation(loc.latitude, loc.longitude, loc.name);
    });
  }, [locationHydrated, userLat, userLng, detect, setLocation]);

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
  } = useHomeData(selectedCategory, userLat, userLng, locationName);

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

  const onSubmitHeaderSearch = useCallback(
    (query: string) => {
      navigation.navigate('SearchResults', { query, category: selectedCategory });
    },
    [navigation, selectedCategory],
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#faf9fc" />

      <HomeHeader
        onSubmitSearch={onSubmitHeaderSearch}
        onLocationPress={() => setLocationModalVisible(true)}
        locationName={locationName}
      />

      {loading && !refreshing ? (
        <HomeScreenSkeleton />
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
            <NearbySection data={nearby} locationName={locationName} onCardPress={handleNearbyPress} onViewAll={goSearch} />
          ) : null}

          {topListings.length > 0 ? (
            <TopListingsSection
              data={topListings}
              city={topListingsCity}
              onItemPress={handleTopListingPress}
            />
          ) : null}

          {/* Banner ad — only visible to free users; hidden for paid members */}
          <AppBannerAd containerStyle={styles.bannerAd} />
        </ScrollView>
      )}
      <LocationSearchModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#faf9fc',
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
  bannerAd: {
    marginTop: 8,
    marginBottom: 8,
  },
});

export default HomeScreen;

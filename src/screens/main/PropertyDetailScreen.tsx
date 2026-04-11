import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  Text,
  Pressable,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import PropertyHeroGallery from '../../components/property-detail/PropertyHeroGallery';
import PropertyCoreInfoCard from '../../components/property-detail/PropertyCoreInfoCard';
import PropertyAiInsightsCard from '../../components/property-detail/PropertyAiInsightsCard';
import PropertyAmenitiesSection from '../../components/property-detail/PropertyAmenitiesSection';
import PropertyLocationLegalSection from '../../components/property-detail/PropertyLocationLegalSection';
import PropertyDetailStickyActions from '../../components/property-detail/PropertyDetailStickyActions';
import { fetchPropertyById } from '../../services/property.service';
import type { MainStackParamList } from '../../navigation/types';
import type { PropertyDetail, VirtualTourItem } from '../../types/property-detail.types';

type Props = NativeStackScreenProps<MainStackParamList, 'PropertyDetail'>;

function normalizeDetail(raw: unknown): PropertyDetail {
  const p = raw as PropertyDetail;
  return {
    ...p,
    images: Array.isArray(p.images) ? p.images : [],
    videos: Array.isArray(p.videos) ? p.videos : [],
    virtualTours: Array.isArray(p.virtualTours) ? p.virtualTours : [],
    amenities: Array.isArray(p.amenities) ? p.amenities : [],
    nearbyEssentials: Array.isArray(p.nearbyEssentials) ? p.nearbyEssentials : [],
  };
}

const PropertyDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { propertyId } = route.params;

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPropertyById(propertyId);
      setProperty(normalizeDetail(data));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not load property';
      setError(msg);
      Toast.show({ type: 'error', text1: msg });
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    void load();
  }, [load]);

  const footerPad = Math.max(insets.bottom, 12) + 88;

  const tour360 = useMemo(
    () =>
      property?.virtualTours?.find(
        t => t.type === 'THREE_SIXTY' || t.type === 'AR_VIEW' || t.type === 'DRONE_VIEW',
      ),
    [property?.virtualTours],
  );

  const videoTourUrl = useMemo(() => {
    if (!property) return null;
    if (property.videos?.length) return property.videos[0].videoUrl;
    const vt = property.virtualTours?.find(t => t.type === 'VIDEO_TOUR');
    return vt?.tourUrl ?? null;
  }, [property]);

  const show360Pill = Boolean(tour360?.tourUrl);
  const showVideoPill = Boolean(videoTourUrl);

  const openTour = (tour: VirtualTourItem | undefined) => {
    if (!tour?.tourUrl) {
      Toast.show({ type: 'info', text1: 'No tour link available' });
      return;
    }
    Linking.openURL(tour.tourUrl).catch(() =>
      Toast.show({ type: 'error', text1: 'Could not open link' }),
    );
  };

  const openVideo = () => {
    if (!videoTourUrl) {
      Toast.show({ type: 'info', text1: 'No video tour yet' });
      return;
    }
    Linking.openURL(videoTourUrl).catch(() =>
      Toast.show({ type: 'error', text1: 'Could not open video' }),
    );
  };

  const onChat = () => {
    if (!property?.owner?.id) {
      Toast.show({ type: 'info', text1: 'Owner information unavailable' });
      return;
    }
    navigation.navigate('Chat', { userId: property.owner.id, propertyId: property.id });
  };

  const onSchedule = () => {
    Toast.show({ type: 'info', text1: 'Visit scheduling opens from chat soon' });
  };

  if (loading && !property) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface-page" edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color="#122A47" />
        <Text className="mt-4 text-slate-muted">Loading property…</Text>
      </SafeAreaView>
    );
  }

  if (error && !property) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface-page px-8" edges={['top', 'bottom']}>
        <Text className="mb-6 text-center text-base text-primary">{error}</Text>
        <Pressable onPress={() => void load()} className="rounded-full bg-primary px-8 py-3">
          <Text className="font-bold text-white">Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!property) return null;

  const p = property;

  return (
    <View className="flex-1 bg-surface-page">
      <PropertyHeroGallery
        images={p.images}
        videos={p.videos}
        virtualTours={p.virtualTours}
        title={p.title}
        topInset={insets.top}
        onBack={() => navigation.goBack()}
        on360={() => openTour(tour360)}
        onVideoTour={openVideo}
        show360Pill={show360Pill}
        showVideoPill={showVideoPill}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: footerPad }}
      >
        <View className="-mt-10 z-10 px-6">
          <PropertyCoreInfoCard
            price={p.price}
            title={p.title}
            locality={p.locality}
            city={p.city}
            isVerified={p.isVerified}
            builtUpArea={p.builtUpArea ?? p.superBuiltUpArea}
            carpetArea={p.carpetArea}
            furnishing={p.furnishing}
            ageOfProperty={p.ageOfProperty}
            facing={p.facing}
            bhk={p.bhk}
          />

          <PropertyAiInsightsCard
            locality={p.locality}
            city={p.city}
            description={p.description}
            price={p.price}
            aiSuggestedPrice={p.aiSuggestedPrice}
            safetyScore={p.safetyScore}
            investmentScore={p.investmentScore}
            rentalYield={p.rentalYield}
          />

          <PropertyAmenitiesSection amenities={p.amenities ?? []} />

          <PropertyLocationLegalSection
            latitude={p.latitude}
            longitude={p.longitude}
            isRERAApproved={p.isRERAApproved}
            reraNumber={p.reraNumber}
            nearbyEssentials={p.nearbyEssentials}
          />

          <View className="h-6" />
        </View>
      </ScrollView>

      <PropertyDetailStickyActions
        bottomInset={insets.bottom}
        onChat={onChat}
        onSchedule={onSchedule}
      />
    </View>
  );
};

export default PropertyDetailScreen;

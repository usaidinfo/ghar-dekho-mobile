import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  Text,
  Pressable,
  Linking,
  StyleSheet,
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
import { createOrGetSession } from '../../services/chat.service';
import { useAuthStore } from '../../stores/auth.store';
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
  const myId = useAuthStore(s => s.user?.id);

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

  const footerPad = Math.max(insets.bottom, 16) + 96;

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

  const openTour = (tour: VirtualTourItem | undefined) => {
    if (!tour?.tourUrl) {
      Toast.show({ type: 'info', text1: '360° tour link not added for this listing yet' });
      return;
    }
    Linking.openURL(tour.tourUrl).catch(() =>
      Toast.show({ type: 'error', text1: 'Could not open link' }),
    );
  };

  const openVideo = () => {
    if (!videoTourUrl) {
      Toast.show({ type: 'info', text1: 'Video tour not added for this listing yet' });
      return;
    }
    Linking.openURL(videoTourUrl).catch(() =>
      Toast.show({ type: 'error', text1: 'Could not open video' }),
    );
  };

  const onChat = async () => {
    if (!property?.owner?.id) {
      Toast.show({ type: 'info', text1: 'Owner information unavailable' });
      return;
    }
    if (!myId) {
      Toast.show({ type: 'info', text1: 'Please sign in to chat' });
      navigation.navigate('Login');
      return;
    }
    try {
      const res = await createOrGetSession({
        otherUserId: property.owner.id,
        propertyId: property.id,
      });
      if (!res.success || !res.data) {
        Toast.show({ type: 'error', text1: 'Could not start chat' });
        return;
      }
      const s = res.data;
      const other = s.user1Id === myId ? s.user2 : s.user1;
      const peerName = [other.profile?.firstName, other.profile?.lastName].filter(Boolean).join(' ').trim();
      const img0 = property.images?.[0];
      const thumb = img0?.thumbnailUrl || img0?.imageUrl;
      navigation.navigate('ChatThread', {
        sessionId: s.id,
        peerName: peerName || 'Chat',
        peerImage: other.profile?.profileImage,
        propertyId: property.id,
        propertyTitle: property.title,
        propertyThumb: thumb ?? null,
        propertyPrice: Number(property.price),
        listingType: property.listingType,
      });
    } catch (e) {
      Toast.show({ type: 'error', text1: e instanceof Error ? e.message : 'Could not start chat' });
    }
  };

  const onSchedule = () => {
    Toast.show({ type: 'info', text1: 'Visit scheduling opens from chat soon' });
  };

  if (loading && !property) {
    return (
      <SafeAreaView style={styles.centered} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color="#122A47" />
        <Text style={styles.loadingHint}>Loading property…</Text>
      </SafeAreaView>
    );
  }

  if (error && !property) {
    return (
      <SafeAreaView style={[styles.centered, styles.px8]} edges={['top', 'bottom']}>
        <Text style={styles.errorTitle}>{error}</Text>
        <Pressable onPress={() => void load()} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!property) return null;

  const p = property;

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: footerPad }]}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
      >
        <PropertyHeroGallery
          images={p.images}
          title={p.title}
          topInset={insets.top}
          onBack={() => navigation.goBack()}
          on360={() => openTour(tour360)}
          onVideoTour={openVideo}
        />

        <View style={[styles.overlapMain, { marginTop: OVERLAP }]}>
          <PropertyCoreInfoCard
            price={Number(p.price)}
            title={p.title}
            locality={p.locality}
            city={p.city}
            isVerified={p.isVerified}
            builtUpArea={p.builtUpArea != null ? Number(p.builtUpArea) : null}
            carpetArea={p.carpetArea != null ? Number(p.carpetArea) : null}
            superBuiltUpArea={p.superBuiltUpArea != null ? Number(p.superBuiltUpArea) : null}
            furnishing={p.furnishing}
            ageOfProperty={p.ageOfProperty != null ? Number(p.ageOfProperty) : null}
            facing={p.facing}
            bhk={p.bhk != null ? Number(p.bhk) : null}
          />

          <PropertyAiInsightsCard
            locality={p.locality}
            city={p.city}
            description={p.description}
            price={Number(p.price)}
            aiSuggestedPrice={p.aiSuggestedPrice != null ? Number(p.aiSuggestedPrice) : null}
            safetyScore={p.safetyScore != null ? Number(p.safetyScore) : null}
            investmentScore={p.investmentScore != null ? Number(p.investmentScore) : null}
            rentalYield={p.rentalYield != null ? Number(p.rentalYield) : null}
          />

          <PropertyAmenitiesSection amenities={p.amenities ?? []} />

          <PropertyLocationLegalSection
            latitude={Number(p.latitude)}
            longitude={Number(p.longitude)}
            isRERAApproved={p.isRERAApproved}
            reraNumber={p.reraNumber}
            nearbyEssentials={p.nearbyEssentials}
          />

          <View style={{ height: 24 }} />
        </View>
      </ScrollView>

      <PropertyDetailStickyActions bottomInset={insets.bottom} onChat={onChat} onSchedule={onSchedule} />
    </View>
  );
};

const OVERLAP = -40;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    flexGrow: 1,
  },
  overlapMain: {
    zIndex: 10,
    paddingHorizontal: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingHint: {
    marginTop: 16,
    fontSize: 14,
    color: '#4A5568',
  },
  px8: {
    paddingHorizontal: 32,
  },
  errorTitle: {
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 16,
    color: '#122A47',
  },
  retryBtn: {
    borderRadius: 999,
    backgroundColor: '#122A47',
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default PropertyDetailScreen;

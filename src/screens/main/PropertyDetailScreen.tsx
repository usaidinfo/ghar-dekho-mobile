import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  Text,
  Pressable,
  Linking,
  StyleSheet,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PropertyHeroGallery from '../../components/property-detail/PropertyHeroGallery';
import PropertyCoreInfoCard from '../../components/property-detail/PropertyCoreInfoCard';
import PropertyAiInsightsCard from '../../components/property-detail/PropertyAiInsightsCard';
import PropertyAmenitiesSection from '../../components/property-detail/PropertyAmenitiesSection';
import PropertyLocationLegalSection from '../../components/property-detail/PropertyLocationLegalSection';
import PropertyDetailStickyActions from '../../components/property-detail/PropertyDetailStickyActions';
import ScheduleVisitSheet, { combineLocalDateTimeISO } from '../../components/visits/ScheduleVisitSheet';
import PropertyDetailSkeleton from '../../components/home/skeletons/PropertyDetailSkeleton';
import AppBannerAd from '../../components/ads/AppBannerAd';
import { fetchPropertyById } from '../../services/property.service';
import { createOrGetSession } from '../../services/chat.service';
import { scheduleMeeting } from '../../services/meeting.service';
import { checkWishlist, toggleWishlist } from '../../services/wishlist.service';
import { savePriceAlert } from '../../services/alert.service';
import { useAuthStore } from '../../stores/auth.store';
import { getApiErrorMessage } from '../../services/auth.service';
import { useMembershipAccess } from '../../hooks/useMembershipAccess';
import { useInstantRewardedAd } from '../../hooks/useInstantRewardedAd';
import MembershipRequiredModal from '../../components/membership/MembershipRequiredModal';
import type { MainStackParamList } from '../../navigation/types';
import type { PropertyDetail, VirtualTourItem } from '../../types/property-detail.types';

type Props = NativeStackScreenProps<MainStackParamList, 'PropertyDetail'>;

const SURFACE = '#FDFDFD';
const PRIMARY = '#122A47';

function normalizeDetail(raw: unknown): PropertyDetail {
  const p = raw as PropertyDetail;
  return {
    ...p,
    images: Array.isArray(p.images) ? p.images : [],
    videos: Array.isArray(p.videos) ? p.videos : [],
    virtualTours: Array.isArray(p.virtualTours) ? p.virtualTours : [],
    amenities: Array.isArray(p.amenities) ? p.amenities : [],
    nearbyEssentials: Array.isArray(p.nearbyEssentials) ? p.nearbyEssentials : [],
    contactLocked: Boolean(p.contactLocked),
  };
}

function overlapAmount(width: number, height: number): number {
  const base = width < 360 ? -36 : width < 420 ? -44 : -52;
  return height < 640 ? Math.max(base, -32) : base;
}

const PropertyDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { propertyId } = route.params;
  const myId = useAuthStore(s => s.user?.id);
  const {
    gateVisible,
    gateReason,
    gateMessage,
    closeGate,
    goUpgrade,
    openGate,
    refreshMembership,
  } = useMembershipAccess();
  const { show: showDetailAd } = useInstantRewardedAd();
  const detailAdShownFor = useRef<string | null>(null);

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visitOpen, setVisitOpen] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);

  const horizontalPad = width < 360 ? 16 : width < 400 ? 20 : 24;
  const overlap = overlapAmount(width, height);
  const footerPad = Math.max(insets.bottom, 12) + (width < 360 ? 108 : 118);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const data = await fetchPropertyById(propertyId);
      setProperty(normalizeDetail(data));
      if (myId) {
        const saved = await checkWishlist(propertyId).catch(() => false);
        setFavorited(saved);
      } else {
        setFavorited(false);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not load property';
      if (!opts?.silent) {
        setError(msg);
        Toast.show({ type: 'error', text1: msg });
      }
    } finally {
      setLoading(false);
    }
  }, [propertyId, myId]);

  useFocusEffect(
    useCallback(() => {
      void refreshMembership();
      // Soft refresh when returning (e.g. after membership upgrade unlocks contact).
      void load({ silent: true });
    }, [refreshMembership, load]),
  );

  useEffect(() => {
    void load();
  }, [load]);

  // Free users: show interstitial once per property open (after content is ready).
  useEffect(() => {
    if (!property || loading) return;
    if (detailAdShownFor.current === propertyId) return;
    detailAdShownFor.current = propertyId;
    const t = setTimeout(() => showDetailAd(), 450);
    return () => clearTimeout(t);
  }, [property, propertyId, loading, showDetailAd]);

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
    if (property?.contactLocked) {
      openGate('contact');
      return;
    }
    if (!property?.owner?.id) {
      Toast.show({ type: 'info', text1: 'Owner information unavailable' });
      return;
    }
    if (!myId) {
      Toast.show({ type: 'info', text1: 'Please sign in to chat' });
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
    if (property?.contactLocked) {
      openGate('contact');
      return;
    }
    if (!property?.owner?.id) {
      Toast.show({ type: 'info', text1: 'Owner information unavailable' });
      return;
    }
    if (!myId) {
      Toast.show({ type: 'info', text1: 'Please sign in to schedule a visit' });
      return;
    }
    setVisitOpen(true);
  };

  const onToggleFavorite = async () => {
    if (!myId) {
      Toast.show({ type: 'info', text1: 'Please sign in to save homes' });
      return;
    }
    if (favoriteBusy) return;
    setFavoriteBusy(true);
    const prev = favorited;
    setFavorited(!prev);
    try {
      const next = await toggleWishlist(propertyId, prev);
      setFavorited(next);
      Toast.show({
        type: 'success',
        text1: next ? 'Saved to wishlist' : 'Removed from wishlist',
      });
    } catch (e) {
      setFavorited(prev);
      Toast.show({ type: 'error', text1: getApiErrorMessage(e) });
    } finally {
      setFavoriteBusy(false);
    }
  };

  const onSetPriceAlert = () => {
    if (!myId) {
      Toast.show({ type: 'info', text1: 'Please sign in to set a price alert' });
      return;
    }
    const price = Number(property?.price) || 0;
    if (price <= 0) {
      Toast.show({ type: 'info', text1: 'Price unavailable for alerts' });
      return;
    }
    const drop5 = Math.round(price * 0.95);
    const drop10 = Math.round(price * 0.9);
    Alert.alert(
      'Set price alert',
      `Current price ₹${price.toLocaleString('en-IN')}. Choose a target — we’ll watch for drops to that level.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `5% lower (₹${drop5.toLocaleString('en-IN')})`,
          onPress: () => void persistPriceAlert(drop5),
        },
        {
          text: `10% lower (₹${drop10.toLocaleString('en-IN')})`,
          onPress: () => void persistPriceAlert(drop10),
        },
      ],
    );
  };

  const persistPriceAlert = async (target: number) => {
    try {
      await savePriceAlert({
        propertyId,
        targetPrice: target,
        alertType: 'BELOW',
      });
      Toast.show({
        type: 'success',
        text1: 'Price alert saved',
        text2: `Watching for ₹${target.toLocaleString('en-IN')} or below`,
      });
    } catch (e) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(e) });
    }
  };

  if (loading && !property) {
    return <PropertyDetailSkeleton />;
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
          favorited={favorited}
          onToggleFavorite={() => void onToggleFavorite()}
          favoriteBusy={favoriteBusy}
        />

        <View style={[styles.overlapMain, { marginTop: overlap, paddingHorizontal: horizontalPad }]}>
          <PropertyCoreInfoCard
            price={Number(p.price)}
            title={p.title}
            locality={p.locality}
            city={p.city}
            isVerified={p.isVerified}
            propertyType={p.propertyType}
            builtUpArea={p.builtUpArea != null ? Number(p.builtUpArea) : null}
            carpetArea={p.carpetArea != null ? Number(p.carpetArea) : null}
            superBuiltUpArea={p.superBuiltUpArea != null ? Number(p.superBuiltUpArea) : null}
            plotArea={p.plotArea != null ? Number(p.plotArea) : null}
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

          <Pressable
            onPress={onSetPriceAlert}
            style={({ pressed }) => [styles.alertBtn, pressed && { opacity: 0.9 }]}
          >
            <Icon name="bell-ring-outline" size={18} color={PRIMARY} />
            <Text style={styles.alertBtnText}>Set price alert</Text>
          </Pressable>

          <PropertyAmenitiesSection amenities={p.amenities ?? []} />

          <PropertyLocationLegalSection
            latitude={Number(p.latitude)}
            longitude={Number(p.longitude)}
            isRERAApproved={p.isRERAApproved}
            reraNumber={p.reraNumber}
            nearbyEssentials={p.nearbyEssentials}
          />

          <AppBannerAd containerStyle={{ marginTop: 12 }} />

          <View style={{ height: width < 360 ? 16 : 24 }} />
        </View>
      </ScrollView>

      <PropertyDetailStickyActions
        bottomInset={insets.bottom}
        contactLocked={Boolean(p.contactLocked)}
        ownerPhone={p.owner?.phone}
        onChat={() => void onChat()}
        onSchedule={onSchedule}
        onUpgrade={() => openGate('contact')}
      />

      <MembershipRequiredModal
        visible={gateVisible}
        reason={gateReason}
        message={gateMessage}
        onClose={closeGate}
        onUpgrade={goUpgrade}
      />

      <ScheduleVisitSheet
        visible={visitOpen}
        onClose={() => setVisitOpen(false)}
        onConfirm={async ({ dateStr, slot, notes }) => {
          if (!property?.owner?.id) throw new Error('Owner information unavailable');
          const scheduledAt = combineLocalDateTimeISO(dateStr, slot.hours24, slot.minutes);
          await scheduleMeeting({
            propertyId: property.id,
            ownerId: property.owner.id,
            scheduledAt,
            duration: 30,
            meetingType: 'IN_PERSON',
            notes: notes || undefined,
          });

          const d = new Date(scheduledAt);
          const dateLabel = d.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          });

          const img0 = property.images?.[0];
          const thumb = img0?.thumbnailUrl || img0?.imageUrl;
          navigation.navigate('VisitScheduled', {
            propertyId: property.id,
            propertyTitle: property.title,
            propertyThumb: thumb ?? null,
            isVerified: property.isVerified,
            dateLabel,
            timeLabel: slot.label,
            typeLabel: 'In-person Visit',
          });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SURFACE,
  },
  scrollContent: {
    flexGrow: 1,
  },
  overlapMain: {
    zIndex: 10,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SURFACE,
  },
  loadingHint: {
    marginTop: 16,
    fontSize: 14,
    color: '#64748B',
  },
  px8: {
    paddingHorizontal: 32,
  },
  errorTitle: {
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 16,
    color: PRIMARY,
  },
  retryBtn: {
    borderRadius: 999,
    backgroundColor: PRIMARY,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  alertBtn: {
    marginTop: 12,
    marginBottom: 4,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  alertBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: PRIMARY,
    letterSpacing: 0.3,
  },
});

export default PropertyDetailScreen;

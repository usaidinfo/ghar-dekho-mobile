import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

import ListPropertyForm from '../../components/list-property/ListPropertyForm';
import {
  getListPropertyDefaultValues,
  mergeListPropertyDefaults,
} from '../../components/list-property/listPropertyDefaultValues';
import type { MainStackParamList } from '../../navigation/types';
import { createPropertyMultipart, uploadPropertyListingImages } from '../../services/property.service';
import { useAuthStore } from '../../stores/auth.store';
import type { ListPropertyFormValues } from '../../types/list-property-form.types';
import { mapListPropertyFormToCreatePayload, orderPhotoUrisForUpload } from '../../utils/mapListPropertyFormToCreatePayload';
import { forwardGeocode } from '../../utils/forwardGeocode';
import { usePostGateAd } from '../../hooks/usePostGateAd';
import { useMembershipAccess } from '../../hooks/useMembershipAccess';
import MembershipRequiredModal from '../../components/membership/MembershipRequiredModal';
import { getApiErrorMessage } from '../../services/auth.service';

const GLASS = 'rgba(248, 249, 250, 0.92)';

type PostNav = NativeStackNavigationProp<MainStackParamList>;

export interface PostPropertyScreenProps {
  mode?: 'create' | 'edit';
  primaryActionLabel?: string;
  initialValues?: Partial<ListPropertyFormValues>;
}

function validatePublish(values: ListPropertyFormValues): string | null {
  if (!values.city.trim()) return 'Please enter city';
  if (!values.locality.trim()) return 'Please enter locality or society';
  if (!values.state.trim()) return 'Please enter state';
  if (!values.pincode.trim()) return 'Please enter pincode';
  const lat = Number(values.latitude.trim());
  const lon = Number(values.longitude.trim());
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return 'Please set location (tap Detect my location)';
  }
  const price = Number(values.totalPrice.replace(/,/g, '').replace(/\D/g, '')) || 0;
  if (price <= 0) return 'Please enter a valid total price';
  return null;
}

function validateDraft(values: ListPropertyFormValues): string | null {
  if (!values.city.trim()) return 'Please enter city';
  if (!values.locality.trim()) return 'Please enter locality';
  if (!values.state.trim()) return 'Please enter state';
  if (!values.pincode.trim()) return 'Please enter pincode';
  return null;
}

const PostPropertyScreen: React.FC<PostPropertyScreenProps> = ({
  mode = 'create',
  primaryActionLabel,
  initialValues,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<PostNav>();
  const accessToken = useAuthStore(s => s.accessToken);
  const { status: adStatus, watched: adWatched, retry: retryAd } = usePostGateAd();
  const {
    hasActiveMembership,
    handleApiError,
    gateVisible,
    gateReason,
    gateMessage,
    closeGate,
    goUpgrade,
    refreshMembership,
  } = useMembershipAccess();

  useFocusEffect(
    useCallback(() => {
      void refreshMembership();
    }, [refreshMembership]),
  );

  const form = useForm<ListPropertyFormValues>({
    defaultValues: initialValues ? mergeListPropertyDefaults(initialValues) : getListPropertyDefaultValues(),
  });

  const [pending, setPending] = useState<'idle' | 'draft' | 'publish'>('idle');
  const busyDraft = pending === 'draft';
  const busyPublish = pending === 'publish';
  const submitting = pending !== 'idle';
  const canSubmit = hasActiveMembership && adWatched;

  React.useEffect(() => {
    if (initialValues) {
      form.reset(mergeListPropertyDefaults(initialValues));
    }
  }, [form, initialValues]);

  const title = mode === 'edit' ? 'Edit Listing' : 'List Your Property';
  const primaryLabel = !hasActiveMembership
    ? 'Upgrade to list'
    : (primaryActionLabel ?? (mode === 'edit' ? 'Save Changes' : 'Post Property Now'));

  const onBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Tabs', { screen: 'Home' });
  };

  const requireAuth = useCallback((): boolean => {
    if (!accessToken) {
      Toast.show({ type: 'info', text1: 'Sign in required', text2: 'Log in to list your property.' });
      navigation.navigate('Login' as never);
      return false;
    }
    return true;
  }, [accessToken, navigation]);

  const persistListing = useCallback(
    async (values: ListPropertyFormValues, publish: boolean) => {
      if (!requireAuth()) {
        return;
      }
      if (!hasActiveMembership) {
        goUpgrade();
        return;
      }
      if (!adWatched) {
        Toast.show({ type: 'info', text1: 'Please watch the ad to continue.' });
        return;
      }
      if (publish) {
        const err = validatePublish(values);
        if (err) {
          Toast.show({ type: 'error', text1: err });
          return;
        }
      } else {
        const derr = validateDraft(values);
        if (derr) {
          Toast.show({ type: 'error', text1: derr });
          return;
        }
      }
      setPending(publish ? 'publish' : 'draft');
      try {
        const status = publish ? 'ACTIVE' : 'DRAFT';
        const payload = mapListPropertyFormToCreatePayload(values, status);

        // If user typed address manually and did not use "Detect my location", try to geocode once.
        if (status === 'ACTIVE' && (payload.latitude == null || payload.longitude == null)) {
          const query = [values.locality, values.city, values.state, values.pincode]
            .map(s => s.trim())
            .filter(Boolean)
            .join(', ');
          const ll = await forwardGeocode(query);
          if (ll) {
            payload.latitude = ll.latitude;
            payload.longitude = ll.longitude;
            form.setValue('latitude', String(ll.latitude));
            form.setValue('longitude', String(ll.longitude));
          } else {
            throw new Error('Could not find location for this address. Please use "Detect my location".');
          }
        }

        const photoOrder = orderPhotoUrisForUpload(values.photoUris, values.coverIndex);
        // eslint-disable-next-line no-console
        console.log('POST property payload', payload);
        // eslint-disable-next-line no-console
        console.log('POST property photoOrder', photoOrder);
        const id = await createPropertyMultipart(payload, photoOrder);

        try {
          await uploadPropertyListingImages(id, photoOrder);
        } catch {
          // swallow; main create call already succeeded
        }
        if (publish) {
          Toast.show({
            type: 'success',
            text1: 'Property posted',
            text2: 'Opening your listing…',
          });
          navigation.navigate('PropertyDetail', { propertyId: id });
        } else {
          Toast.show({
            type: 'success',
            text1: 'Draft saved',
            text2: 'You can publish it anytime from your listings.',
          });
        }
      } catch (e) {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.error('[PostProperty] persist failed', e);
        }
        if (handleApiError(e)) {
          return;
        }
        Toast.show({
          type: 'error',
          text1: publish ? 'Could not post' : 'Could not save draft',
          text2: getApiErrorMessage(e),
        });
      } finally {
        setPending('idle');
      }
    },
    [
      navigation,
      requireAuth,
      hasActiveMembership,
      goUpgrade,
      handleApiError,
      form,
      adWatched,
    ],
  );

  const onSaveDraft = form.handleSubmit(values => persistListing(values, false));
  const onSubmit = form.handleSubmit(values => persistListing(values, true));

  const onPrimaryPress = () => {
    if (!hasActiveMembership) {
      goUpgrade();
      return;
    }
    void onSubmit();
  };

  const onDraftPress = () => {
    if (!hasActiveMembership) {
      Toast.show({
        type: 'info',
        text1: 'Membership needed',
        text2: 'Activate a plan to save drafts and list properties.',
      });
      return;
    }
    void onSaveDraft();
  };

  return (
    <View className="flex-1 bg-surface-page">
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={onBack}
              className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container-high"
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Icon name="arrow-left" size={22} color="#122A47" />
            </TouchableOpacity>
            <Text className="min-w-0 flex-1 text-xl font-extrabold text-primary" numberOfLines={1}>
              {title}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <ListPropertyForm form={form} />
          </ScrollView>

          <View style={[styles.footerBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            {!hasActiveMembership ? (
              <View style={styles.membershipNudge}>
                <Icon name="crown-outline" size={18} color="#D1A14E" />
                <Text style={styles.membershipNudgeText}>
                  Browse the form freely — membership is required to publish.
                </Text>
              </View>
            ) : null}

            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={onDraftPress}
                activeOpacity={0.88}
                style={[styles.draftBtn, !canSubmit && styles.btnDisabled]}
                disabled={submitting}
              >
                {busyDraft ? (
                  <ActivityIndicator color="#495057" />
                ) : (
                  <Text
                    className="text-center text-xs font-black uppercase tracking-widest text-on-surface-muted"
                    style={!canSubmit ? styles.btnDisabledText : undefined}
                  >
                    Save Draft
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={onPrimaryPress}
                style={[
                  styles.primaryBtn,
                  !hasActiveMembership && styles.upgradeBtn,
                ]}
                disabled={submitting}
              >
                {busyPublish ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <View style={styles.primaryBtnInner}>
                    {!hasActiveMembership ? (
                      <Icon name="crown" size={16} color="#FFFFFF" />
                    ) : null}
                    <Text className="text-center text-xs font-black uppercase tracking-widest text-on-primary">
                      {primaryLabel}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {!adWatched ? (
          <View style={styles.adGateOverlay} pointerEvents="auto">
            {adStatus === 'failed' ? (
              <>
                <Icon name="wifi-off" size={40} color="#fff" />
                <Text style={styles.adGateTitle}>Ad could not be loaded</Text>
                <Text style={styles.adGateSub}>
                  Check your internet connection and try again to continue.
                </Text>
                <TouchableOpacity
                  style={styles.adGateRetryBtn}
                  onPress={retryAd}
                  activeOpacity={0.88}
                >
                  <Text style={styles.adGateRetryText}>Retry</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: 14 }} onPress={onBack} activeOpacity={0.85}>
                  <Text style={[styles.adGateSub, { textDecorationLine: 'underline' }]}>Go back</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.adGateTitle}>
                  {adStatus === 'showing' ? 'Watching ad…' : 'Loading ad…'}
                </Text>
                <Text style={styles.adGateSub}>
                  Watch this short ad to continue listing your property.
                </Text>
              </>
            )}
          </View>
        ) : null}

        <MembershipRequiredModal
          visible={gateVisible}
          reason={gateReason}
          message={gateMessage}
          onClose={closeGate}
          onUpgrade={goUpgrade}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { flex: 1, minHeight: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: GLASS,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(222, 226, 230, 0.85)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 2 },
    }),
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minWidth: 0,
    paddingRight: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 20,
  },
  footerBar: {
    flexShrink: 0,
    paddingTop: 14,
    paddingHorizontal: 16,
    backgroundColor: GLASS,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(222, 226, 230, 0.9)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: -2 },
      },
      android: { elevation: 4 },
    }),
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 16,
    maxWidth: 576,
    width: '100%',
    alignSelf: 'center',
  },
  draftBtn: {
    flex: 1,
    minWidth: 0,
    minHeight: 56,
    maxHeight: 64,
    borderRadius: 16,
    backgroundColor: '#E9ECEF',
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    flex: 1,
    minWidth: 0,
    minHeight: 56,
    maxHeight: 64,
    borderRadius: 16,
    backgroundColor: '#122A47',
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  upgradeBtn: {
    backgroundColor: '#122A47',
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnDisabledText: {
    opacity: 0.85,
  },
  membershipNudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(209,161,78,0.12)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    maxWidth: 576,
    width: '100%',
    alignSelf: 'center',
  },
  membershipNudgeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: '#495057',
    fontWeight: '600',
  },
  adGateOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 21, 46, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  adGateTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
  },
  adGateSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  adGateRetryBtn: {
    marginTop: 8,
    backgroundColor: '#D1A14E',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999,
  },
  adGateRetryText: {
    color: '#00152e',
    fontWeight: '800',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default PostPropertyScreen;

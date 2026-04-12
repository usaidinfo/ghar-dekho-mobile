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
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

import ListPropertyForm from '../../components/list-property/ListPropertyForm';
import {
  getListPropertyDefaultValues,
  mergeListPropertyDefaults,
} from '../../components/list-property/listPropertyDefaultValues';
import type { BottomTabParamList, MainStackParamList } from '../../navigation/types';
import { createProperty } from '../../services/property.service';
import { useAuthStore } from '../../stores/auth.store';
import type { ListPropertyFormValues } from '../../types/list-property-form.types';
import { mapListPropertyFormToCreatePayload } from '../../utils/mapListPropertyFormToCreatePayload';

const GLASS = 'rgba(248, 249, 250, 0.92)';

type PostNav = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Post'>,
  NativeStackNavigationProp<MainStackParamList>
>;

export interface PostPropertyScreenProps {
  mode?: 'create' | 'edit';
  primaryActionLabel?: string;
  initialValues?: Partial<ListPropertyFormValues>;
}

function validatePublish(values: ListPropertyFormValues): string | null {
  if (!values.city.trim()) {
    return 'Please enter city';
  }
  if (!values.locality.trim()) {
    return 'Please enter locality or society';
  }
  const price = Number(values.totalPrice.replace(/,/g, '').replace(/\D/g, '')) || 0;
  if (price <= 0) {
    return 'Please enter a valid total price';
  }
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

  const form = useForm<ListPropertyFormValues>({
    defaultValues: initialValues ? mergeListPropertyDefaults(initialValues) : getListPropertyDefaultValues(),
  });

  const [pending, setPending] = useState<'idle' | 'draft' | 'publish'>('idle');
  const busyDraft = pending === 'draft';
  const busyPublish = pending === 'publish';
  const submitting = pending !== 'idle';

  React.useEffect(() => {
    if (initialValues) {
      form.reset(mergeListPropertyDefaults(initialValues));
    }
  }, [form, initialValues]);

  const title = mode === 'edit' ? 'Edit Listing' : 'List Your Property';
  const primaryLabel =
    primaryActionLabel ?? (mode === 'edit' ? 'Save Changes' : 'Post Property Now');

  const onBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Home');
  };

  const requireAuth = useCallback((): boolean => {
    if (!accessToken) {
      Toast.show({ type: 'info', text1: 'Sign in required', text2: 'Log in to list your property.' });
      navigation.navigate('Login');
      return false;
    }
    return true;
  }, [accessToken, navigation]);

  const persistListing = useCallback(
    async (values: ListPropertyFormValues, publish: boolean) => {
      if (!requireAuth()) {
        return;
      }
      if (publish) {
        const err = validatePublish(values);
        if (err) {
          Toast.show({ type: 'error', text1: err });
          return;
        }
      }
      setPending(publish ? 'publish' : 'draft');
      try {
        const payload = mapListPropertyFormToCreatePayload(values, publish ? 'ACTIVE' : 'DRAFT');
        const id = await createProperty(payload);
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
        Toast.show({
          type: 'error',
          text1: publish ? 'Could not post' : 'Could not save draft',
          text2: e instanceof Error ? e.message : 'Try again',
        });
      } finally {
        setPending('idle');
      }
    },
    [navigation, requireAuth],
  );

  const onSaveDraft = form.handleSubmit(values => persistListing(values, false));
  const onSubmit = form.handleSubmit(values => persistListing(values, true));

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
            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={onSaveDraft}
                activeOpacity={0.88}
                style={styles.draftBtn}
                disabled={submitting}
              >
                {busyDraft ? (
                  <ActivityIndicator color="#495057" />
                ) : (
                  <Text className="text-center text-xs font-black uppercase tracking-widest text-on-surface-muted">
                    Save Draft
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.92}
                onPress={onSubmit}
                style={styles.primaryBtnWrap}
                disabled={submitting}
              >
                <LinearGradient
                  colors={['#122A47', '#1B3E68']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientBtn}
                >
                  {busyPublish ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-center text-xs font-black uppercase tracking-widest text-on-primary">
                      {primaryLabel}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    alignItems: 'center',
    gap: 16,
    maxWidth: 576,
    width: '100%',
    alignSelf: 'center',
  },
  draftBtn: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    borderRadius: 999,
    backgroundColor: '#E9ECEF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnWrap: {
    flex: 2,
    minWidth: 0,
    borderRadius: 999,
    overflow: 'hidden',
  },
  gradientBtn: {
    minHeight: 52,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#122A47',
        shadowOpacity: 0.22,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 6 },
    }),
  },
});

export default PostPropertyScreen;

import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { TextInput as PaperInput, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMI from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import DatePicker from 'react-native-date-picker';
import { launchImageLibrary } from 'react-native-image-picker';

import type { MainStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/auth.store';
import {
  updateMyProfile,
  updateMyProfileType,
  uploadMyProfileImage,
  addMyContact,
} from '../../services/user.service';
import { getApiErrorMessage, sendOtp } from '../../services/auth.service';
import type { ProfileType } from '../../types/auth.types';
import { useInstantRewardedAd } from '../../hooks/useInstantRewardedAd';

const NAVY = '#122A47';
const GOLD = '#D1A14E';
const GLASS = 'rgba(248, 249, 250, 0.94)';

type EditProfileNav = NativeStackNavigationProp<MainStackParamList, 'EditProfile'>;

interface FormValues {
  firstName: string;
  lastName: string;
  bio: string;
  gender: '' | 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  dateOfBirth: Date | null;
  occupation: string;
  city: string;
}

const BIO_MAX = 500;

const GENDER_OPTIONS: { value: FormValues['gender']; label: string }[] = [
  { value: '', label: 'Select…' },
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

const ROLE_OPTIONS: { value: ProfileType; label: string; icon: string }[] = [
  { value: 'BUYER', label: 'Buyer', icon: 'home-search-outline' },
  { value: 'OWNER', label: 'Owner', icon: 'home-account' },
  { value: 'AGENT', label: 'Agent', icon: 'briefcase-account-outline' },
];

function formatDateDisplay(d: Date | null): string {
  if (!d) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function toISODateOnly(d: Date | null): string | null {
  if (!d) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<EditProfileNav>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const user = useAuthStore(s => s.user);
  const patchProfile = useAuthStore(s => s.patchProfile);
  const patchUser = useAuthStore(s => s.patchUser);
  const refreshCurrentUser = useAuthStore(s => s.refreshCurrentUser);

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileType, setProfileType] = useState<ProfileType>(user?.profileType ?? 'BUYER');
  const [genderOpen, setGenderOpen] = useState(false);
  const [dobOpen, setDobOpen] = useState(false);
  const { show: showModeSwitchAd } = useInstantRewardedAd();

  // Pull fresh /me on mount so rich fields (bio, gender, DOB...) are populated
  // even right after login (login response stores a lighter projection).
  useEffect(() => {
    refreshCurrentUser().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const defaultValues = useMemo<FormValues>(() => {
    const p = user?.profile;
    const dob = p?.dateOfBirth ? new Date(p.dateOfBirth) : null;
    return {
      firstName: p?.firstName ?? '',
      lastName: p?.lastName ?? '',
      bio: p?.bio ?? '',
      gender: ((p?.gender as FormValues['gender']) || '') as FormValues['gender'],
      dateOfBirth: dob && !isNaN(dob.getTime()) ? dob : null,
      occupation: p?.occupation ?? '',
      city: p?.city ?? '',
    };
  }, [user]);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({ defaultValues });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (user?.profileType) setProfileType(user.profileType);
  }, [user?.profileType]);

  const bioValue = watch('bio') || '';
  const genderValue = watch('gender');
  const dob = watch('dateOfBirth');

  const displayName = useMemo(() => {
    const fn = user?.profile?.firstName ?? '';
    const ln = user?.profile?.lastName ?? '';
    return [fn, ln].filter(Boolean).join(' ').trim() || 'New Member';
  }, [user]);

  const memberSinceLabel = useMemo(() => {
    // CurrentUser has `createdAt`; AuthUser does not — use a soft fallback.
    return 'Member';
  }, []);

  const onPickAvatar = async () => {
    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.9,
      });
      if (res.didCancel) return;
      const asset = res.assets?.[0];
      if (!asset?.uri) return;

      setUploadingImage(true);
      const out = await uploadMyProfileImage(asset);
      patchProfile({ profileImage: out.profileImage });
      Toast.show({ type: 'success', text1: 'Photo updated' });
    } catch (err) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err) });
    } finally {
      setUploadingImage(false);
    }
  };

  const onSelectRole = async (role: ProfileType) => {
    if (role === profileType) return;
    const prev = profileType;
    setProfileType(role);
    try {
      const out = await updateMyProfileType(role);
      patchUser({ profileType: out.profileType, role: out.role });
      // Every account-mode switch (Buyer/Owner/Agent) shows an interstitial —
      // uncapped by design, skipped automatically for premium members.
      showModeSwitchAd();
    } catch (err) {
      setProfileType(prev);
      Toast.show({ type: 'error', text1: getApiErrorMessage(err) });
    }
  };

  const onSubmit = handleSubmit(async values => {
    if (!values.firstName.trim()) {
      Toast.show({ type: 'error', text1: 'First name is required' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        bio: values.bio.trim() || null,
        gender: values.gender || null,
        dateOfBirth: toISODateOnly(values.dateOfBirth),
        occupation: values.occupation.trim() || null,
        city: values.city.trim() || null,
      };
      const updated = await updateMyProfile(payload);
      patchProfile({
        firstName: updated.firstName,
        lastName: updated.lastName,
        bio: updated.bio,
        gender: updated.gender,
        dateOfBirth: updated.dateOfBirth,
        occupation: updated.occupation,
        city: updated.city,
      });
      Toast.show({ type: 'success', text1: 'Profile saved' });
      navigation.goBack();
    } catch (err) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  });

  if (!user) {
    return (
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator color={NAVY} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.85}
              style={styles.backBtn}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <IconMI name="arrow-back" size={22} color={NAVY} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Edit Profile
            </Text>
          </View>
          <TouchableOpacity
            onPress={onSubmit}
            disabled={!isDirty || saving}
            activeOpacity={0.85}
            style={styles.headerSaveBtn}
          >
            <Text
              style={[
                styles.headerSaveText,
                (!isDirty || saving) && styles.headerSaveTextDisabled,
              ]}
            >
              {saving ? 'Saving…' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 12) + 120 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar block */}
          <View style={styles.avatarBlock}>
            <View style={styles.avatarRing}>
              {user.profile?.profileImage ? (
                <Image
                  source={{ uri: user.profile.profileImage }}
                  style={styles.avatarImg}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Icon name="account" size={56} color={NAVY} />
                </View>
              )}
              <TouchableOpacity
                onPress={onPickAvatar}
                activeOpacity={0.85}
                style={styles.cameraFab}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Icon name="camera" size={18} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarName}>{displayName}</Text>
            <Text style={styles.avatarSub}>{memberSinceLabel}</Text>
          </View>

          {/* Verification card (placeholder for KYC milestone) */}
          <View style={styles.verifyCard}>
            <View style={styles.verifyLeft}>
              <Icon name="shield-check-outline" size={22} color={GOLD} />
              <Text style={styles.verifyText} numberOfLines={2}>
                Verify your account to unlock premium features
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.verifyPill}
              onPress={() =>
                Toast.show({
                  type: 'info',
                  text1: 'Verification coming soon',
                  text2: 'KYC / PAN verification is on our next milestone.',
                })
              }
            >
              <Text style={styles.verifyPillText}>Verify</Text>
            </TouchableOpacity>
          </View>

          {/* Personal Information */}
          <SectionHeader>Personal Information</SectionHeader>
          <View style={styles.fieldsGroup}>
            <View style={styles.row}>
              <View style={styles.colHalf}>
                <Controller
                  control={control}
                  rules={{ required: 'First name is required' }}
                  name="firstName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <PaperInput
                      mode="outlined"
                      label="First Name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      outlineStyle={inputOutline}
                      error={Boolean(errors.firstName?.message)}
                      style={[
                        styles.input,
                        { backgroundColor: theme.colors.elevation.level2 },
                      ]}
                      textColor={theme.colors.onSurface}
                      outlineColor={theme.colors.outline}
                      activeOutlineColor={NAVY}
                    />
                  )}
                />
              </View>
              <View style={styles.colHalf}>
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <PaperInput
                      mode="outlined"
                      label="Last Name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      outlineStyle={inputOutline}
                      style={[
                        styles.input,
                        { backgroundColor: theme.colors.elevation.level2 },
                      ]}
                      textColor={theme.colors.onSurface}
                      outlineColor={theme.colors.outline}
                      activeOutlineColor={NAVY}
                    />
                  )}
                />
              </View>
            </View>

            <View style={styles.row}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setDobOpen(true)}
                style={[styles.colHalf, styles.pickerField]}
              >
                <View>
                  <Text style={styles.pickerLabel}>DATE OF BIRTH</Text>
                  <Text style={styles.pickerValue}>
                    {dob ? formatDateDisplay(dob) : 'dd/mm/yyyy'}
                  </Text>
                </View>
                <Icon name="calendar" size={20} color={NAVY} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setGenderOpen(o => !o)}
                style={[styles.colHalf, styles.pickerField]}
              >
                <View>
                  <Text style={styles.pickerLabel}>GENDER</Text>
                  <Text style={styles.pickerValue}>
                    {GENDER_OPTIONS.find(g => g.value === genderValue)?.label || 'Select'}
                  </Text>
                </View>
                <Icon
                  name={genderOpen ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color={NAVY}
                />
              </TouchableOpacity>
            </View>

            {genderOpen ? (
              <View style={styles.dropdown}>
                {GENDER_OPTIONS.filter(o => o.value).map(opt => {
                  const active = opt.value === genderValue;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      activeOpacity={0.85}
                      onPress={() => {
                        setValue('gender', opt.value, { shouldDirty: true });
                        setGenderOpen(false);
                      }}
                      style={[styles.dropdownItem, active && styles.dropdownItemActive]}
                    >
                      <Text
                        style={[
                          styles.dropdownText,
                          active && styles.dropdownTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                      {active ? <Icon name="check" size={18} color={NAVY} /> : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}

            <Controller
              control={control}
              name="occupation"
              render={({ field: { onChange, onBlur, value } }) => (
                <PaperInput
                  mode="outlined"
                  label="Occupation (optional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  outlineStyle={inputOutline}
                  left={<PaperInput.Icon icon="briefcase-outline" />}
                  style={[styles.input, { backgroundColor: theme.colors.elevation.level2 }]}
                  textColor={theme.colors.onSurface}
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={NAVY}
                />
              )}
            />

            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, onBlur, value } }) => (
                <PaperInput
                  mode="outlined"
                  label="City (optional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  outlineStyle={inputOutline}
                  left={<PaperInput.Icon icon="map-marker-outline" />}
                  style={[styles.input, { backgroundColor: theme.colors.elevation.level2 }]}
                  textColor={theme.colors.onSurface}
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={NAVY}
                />
              )}
            />
          </View>

          {/* Contact Information */}
          <SectionHeader>Contact Information</SectionHeader>
          <View style={styles.fieldsGroup}>
            <ContactField
              kind="email"
              currentValue={user.email}
              isVerified={user.isEmailVerified}
              onContactAdded={updated =>
                patchUser({
                  email: updated.email,
                  isEmailVerified: updated.isEmailVerified,
                })
              }
            />

            <ContactField
              kind="phone"
              currentValue={user.phone}
              isVerified={user.isPhoneVerified}
              onContactAdded={updated =>
                patchUser({
                  phone: updated.phone,
                  isPhoneVerified: updated.isPhoneVerified,
                })
              }
            />

            <Text style={styles.contactHelper}>
              Email and phone are used for sign-in and important updates. To change one
              that's already set, please contact support.
            </Text>
          </View>

          {/* About you */}
          <SectionHeader>About You</SectionHeader>
          <View style={styles.fieldsGroup}>
            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, onBlur, value } }) => (
                <PaperInput
                  mode="outlined"
                  label="Tell us about your property goals"
                  value={value}
                  onChangeText={t => onChange(t.slice(0, BIO_MAX))}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={4}
                  outlineStyle={[inputOutline, { borderRadius: 16 }]}
                  style={[
                    styles.input,
                    styles.bioInput,
                    { backgroundColor: theme.colors.elevation.level2 },
                  ]}
                  textColor={theme.colors.onSurface}
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={NAVY}
                />
              )}
            />
            <Text style={styles.bioCounter}>
              {bioValue.length}/{BIO_MAX}
            </Text>
          </View>

          {/* Role */}
          <SectionHeader>You Are A</SectionHeader>
          <View style={styles.roleRow}>
            {ROLE_OPTIONS.map(opt => {
              const active = opt.value === profileType;
              return (
                <TouchableOpacity
                  key={opt.value}
                  activeOpacity={0.85}
                  style={[styles.roleChip, active && styles.roleChipActive]}
                  onPress={() => onSelectRole(opt.value)}
                >
                  <Icon
                    name={opt.icon}
                    size={20}
                    color={active ? '#fff' : NAVY}
                    style={styles.roleIcon}
                  />
                  <Text style={[styles.roleText, active && styles.roleTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Delete account */}
          <View style={styles.deleteWrap}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                Toast.show({
                  type: 'info',
                  text1: 'Account deletion',
                  text2: 'Reach support@ghardekho.com to delete your account.',
                })
              }
              style={styles.deleteBtn}
            >
              <Icon name="trash-can-outline" size={18} color="#BA1A1A" />
              <Text style={styles.deleteText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Sticky action bar */}
        <View
          style={[
            styles.stickyBar,
            { paddingBottom: Math.max(insets.bottom, 12) + 12 },
          ]}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
            style={styles.cancelBtn}
            disabled={saving}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSubmit}
            activeOpacity={0.85}
            style={[styles.saveBtn, (!isDirty || saving) && styles.saveBtnDisabled]}
            disabled={!isDirty || saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

        <DatePicker
          modal
          mode="date"
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          open={dobOpen}
          date={dob ?? new Date(2000, 0, 1)}
          onConfirm={d => {
            setDobOpen(false);
            setValue('dateOfBirth', d, { shouldDirty: true });
          }}
          onCancel={() => setDobOpen(false)}
        />
      </SafeAreaView>
    </View>
  );
};

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={styles.sectionHeader}>{children}</Text>
);

interface ContactAddedPayload {
  email: string | null;
  phone: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

interface ContactFieldProps {
  kind: 'email' | 'phone';
  currentValue: string | null | undefined;
  isVerified: boolean;
  onContactAdded: (updated: ContactAddedPayload) => void;
}

/**
 * Renders one contact row (Email or Phone) with three modes:
 *  - Has value + verified  → read-only with VERIFIED pill
 *  - Has value + unverified → read-only with VERIFY hint (future: re-send OTP flow)
 *  - Missing               → inline "Add" editor: input → send OTP → enter code → save
 */
const ContactField: React.FC<ContactFieldProps> = ({
  kind,
  currentValue,
  isVerified,
  onContactAdded,
}) => {
  const theme = useTheme();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEmail = kind === 'email';
  const labelText = isEmail ? 'EMAIL ADDRESS' : 'PHONE NUMBER';
  const inputLabel = isEmail ? 'Email address' : 'Phone number';
  const iconName = isEmail ? 'email-outline' : 'phone-outline';

  const normalize = (raw: string): { email?: string; phone?: string } | null => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    if (isEmail) {
      if (!/^\S+@\S+\.\S+$/.test(trimmed)) return null;
      return { email: trimmed.toLowerCase() };
    }
    const digits = trimmed.replace(/\D/g, '');
    if (trimmed.startsWith('+') && digits.length >= 10) return { phone: trimmed };
    if (digits.length === 10) return { phone: `+91${digits}` };
    if (digits.length >= 11) return { phone: `+${digits}` };
    return null;
  };

  const reset = () => {
    setEditing(false);
    setValue('');
    setOtp('');
    setOtpSent(false);
  };

  const onSendOtp = async () => {
    const parsed = normalize(value);
    if (!parsed) {
      Toast.show({
        type: 'error',
        text1: isEmail ? 'Enter a valid email' : 'Enter a valid phone number',
      });
      return;
    }
    setSending(true);
    try {
      const res = await sendOtp({
        ...parsed,
        type: isEmail ? 'EMAIL_VERIFICATION' : 'PHONE_VERIFICATION',
      });
      setOtpSent(true);
      if (__DEV__ && res.otp) {
        Toast.show({ type: 'info', text1: `Dev OTP: ${res.otp}` });
      } else {
        Toast.show({ type: 'success', text1: 'Verification code sent' });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err) });
    } finally {
      setSending(false);
    }
  };

  const onSave = async () => {
    const parsed = normalize(value);
    if (!parsed) {
      Toast.show({ type: 'error', text1: 'Invalid contact' });
      return;
    }
    if (!otp.trim()) {
      Toast.show({ type: 'error', text1: 'Enter the verification code' });
      return;
    }
    setSaving(true);
    try {
      const updated = await addMyContact({ ...parsed, otp: otp.trim() });
      onContactAdded({
        email: updated.email,
        phone: updated.phone,
        isEmailVerified: updated.isEmailVerified,
        isPhoneVerified: updated.isPhoneVerified,
      });
      Toast.show({
        type: 'success',
        text1: isEmail ? 'Email added' : 'Phone added',
      });
      reset();
    } catch (err) {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  // Display mode (already set)
  if (currentValue) {
    return (
      <View style={styles.contactRow}>
        <Icon name={iconName} size={22} color={NAVY} />
        <View style={styles.contactBody}>
          <Text style={styles.contactLabel}>{labelText}</Text>
          <Text style={styles.contactValue} numberOfLines={1}>
            {currentValue}
          </Text>
        </View>
        {isVerified ? (
          <View style={[styles.statusPill, styles.statusPillVerified]}>
            <Icon name="check-circle" size={12} color="#0D7B5A" />
            <Text style={styles.statusPillVerifiedText}>VERIFIED</Text>
          </View>
        ) : (
          <Text style={styles.verifyAction}>VERIFY</Text>
        )}
      </View>
    );
  }

  // Missing — collapsed "Add" CTA
  if (!editing) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setEditing(true)}
        style={styles.contactRow}
      >
        <Icon name={iconName} size={22} color={NAVY} />
        <View style={styles.contactBody}>
          <Text style={styles.contactLabel}>{labelText}</Text>
          <Text style={styles.contactPlaceholder} numberOfLines={1}>
            Not added
          </Text>
        </View>
        <View style={styles.addPill}>
          <Icon name="plus" size={14} color="#fff" />
          <Text style={styles.addPillText}>ADD</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Editing — inline form
  return (
    <View style={styles.addBlock}>
      <View style={styles.addBlockHeader}>
        <Icon name={iconName} size={20} color={NAVY} />
        <Text style={styles.addBlockTitle}>
          Add your {isEmail ? 'email' : 'phone number'}
        </Text>
        <TouchableOpacity
          onPress={reset}
          activeOpacity={0.7}
          style={styles.addBlockClose}
        >
          <Icon name="close" size={18} color="#777779" />
        </TouchableOpacity>
      </View>

      <PaperInput
        mode="outlined"
        label={inputLabel}
        value={value}
        onChangeText={t => {
          setValue(t);
          if (otpSent) setOtpSent(false);
        }}
        autoCapitalize="none"
        keyboardType={isEmail ? 'email-address' : 'phone-pad'}
        outlineStyle={inputOutline}
        left={<PaperInput.Icon icon={iconName} />}
        disabled={saving}
        style={[styles.input, { backgroundColor: theme.colors.elevation.level2 }]}
        textColor={theme.colors.onSurface}
        outlineColor={theme.colors.outline}
        activeOutlineColor={NAVY}
      />

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onSendOtp}
        disabled={sending || !value.trim() || saving}
        style={[
          styles.sendOtpBtn,
          (sending || !value.trim() || saving) && styles.sendOtpBtnDisabled,
        ]}
      >
        {sending ? (
          <ActivityIndicator color={NAVY} size="small" />
        ) : (
          <>
            <Icon name="message-text-outline" size={16} color={NAVY} />
            <Text style={styles.sendOtpText}>
              {otpSent ? 'Resend Code' : 'Send Verification Code'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {otpSent ? (
        <>
          <PaperInput
            mode="outlined"
            label="Verification code"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            outlineStyle={inputOutline}
            left={<PaperInput.Icon icon="shield-check-outline" />}
            disabled={saving}
            style={[styles.input, { backgroundColor: theme.colors.elevation.level2 }]}
            textColor={theme.colors.onSurface}
            outlineColor={theme.colors.outline}
            activeOutlineColor={NAVY}
          />
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onSave}
            disabled={saving || !otp.trim()}
            style={[
              styles.confirmBtn,
              (saving || !otp.trim()) && styles.confirmBtnDisabled,
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.confirmBtnText}>
                Verify &amp; Save {isEmail ? 'Email' : 'Phone'}
              </Text>
            )}
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
};

const inputOutline = { borderRadius: 999 };

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF9FC',
  },
  flex: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF9FC',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    minWidth: 0,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#FFDEAC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flexShrink: 1,
    fontSize: 20,
    fontWeight: '800',
    color: NAVY,
    letterSpacing: -0.2,
  },
  headerSaveBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  headerSaveText: {
    fontSize: 15,
    fontWeight: '800',
    color: GOLD,
    letterSpacing: 0.2,
  },
  headerSaveTextDisabled: {
    opacity: 0.45,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // Avatar
  avatarBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarRing: {
    width: 116,
    height: 116,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: GOLD,
    padding: 3,
    backgroundColor: '#fff',
    position: 'relative',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#E9ECEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraFab: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FAF9FC',
  },
  avatarName: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '800',
    color: NAVY,
  },
  avatarSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: '#777779',
  },

  // Verification card
  verifyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(209, 161, 78, 0.12)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    gap: 12,
  },
  verifyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  verifyText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#5F4100',
    lineHeight: 18,
  },
  verifyPill: {
    backgroundColor: GOLD,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  verifyPillText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },

  // Sections
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: '#44474D',
    marginBottom: 14,
    marginTop: 8,
  },
  fieldsGroup: {
    marginBottom: 28,
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  colHalf: {
    flex: 1,
    minWidth: 0,
  },
  input: {
    fontSize: 15,
  },
  bioInput: {
    minHeight: 110,
    paddingTop: 12,
  },
  bioCounter: {
    alignSelf: 'flex-end',
    fontSize: 11,
    fontWeight: '700',
    color: '#777779',
    marginTop: 2,
  },

  // Custom picker rows (DOB + Gender)
  pickerField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F3F6',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 14,
    minHeight: 56,
    borderWidth: 1,
    borderColor: 'rgba(196, 198, 206, 0.6)',
  },
  pickerLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#777779',
    letterSpacing: 1.3,
  },
  pickerValue: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: '700',
    color: NAVY,
  },

  // Dropdown
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(196, 198, 206, 0.7)',
    overflow: 'hidden',
    marginTop: -4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(196, 198, 206, 0.6)',
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(18, 42, 71, 0.06)',
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B1C1E',
  },
  dropdownTextActive: {
    color: NAVY,
    fontWeight: '800',
  },

  // Contact rows
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#F5F3F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  contactBody: {
    flex: 1,
    minWidth: 0,
  },
  contactLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#777779',
    letterSpacing: 1.3,
  },
  contactValue: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '700',
    color: NAVY,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPillVerified: {
    backgroundColor: 'rgba(13, 123, 90, 0.12)',
  },
  statusPillVerifiedText: {
    color: '#0D7B5A',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  verifyAction: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  contactPlaceholder: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '600',
    color: '#9A9DA3',
    fontStyle: 'italic',
  },
  addPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: NAVY,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addPillText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  addBlock: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: NAVY,
    padding: 16,
    gap: 12,
  },
  addBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  addBlockTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: NAVY,
    letterSpacing: 0.2,
  },
  addBlockClose: {
    padding: 4,
  },
  sendOtpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 46,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: NAVY,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
  },
  sendOtpBtnDisabled: {
    opacity: 0.45,
  },
  sendOtpText: {
    color: NAVY,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  confirmBtn: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  contactHelper: {
    fontSize: 11,
    color: '#777779',
    paddingHorizontal: 4,
    lineHeight: 16,
  },

  // Role
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 32,
  },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(196, 198, 206, 0.9)',
    backgroundColor: '#fff',
  },
  roleChipActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  roleIcon: {},
  roleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#44474D',
    letterSpacing: 0.2,
  },
  roleTextActive: {
    color: '#fff',
  },

  // Delete
  deleteWrap: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    opacity: 0.85,
  },
  deleteText: {
    color: '#BA1A1A',
    fontSize: 13,
    fontWeight: '700',
  },

  // Sticky bar (matches PostProperty / PropertyDetail pattern)
  stickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: GLASS,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(222, 226, 230, 0.9)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: -3 },
      },
      android: { elevation: 14 },
    }),
  },
  cancelBtn: {
    flex: 1,
    minHeight: 56,
    maxHeight: 64,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: NAVY,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: NAVY,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  saveBtn: {
    flex: 1.55,
    minHeight: 56,
    maxHeight: 64,
    borderRadius: 16,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: NAVY,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  saveBtnDisabled: {
    opacity: 0.55,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
});

export default EditProfileScreen;

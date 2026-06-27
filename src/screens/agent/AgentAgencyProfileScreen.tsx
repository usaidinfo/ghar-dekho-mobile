/**
 * AgentAgencyProfileScreen — Edit agency profile form with logo upload,
 * identity fields, expertise & reach, digital presence, and profile integrity score.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { fetchAgencyProfile, saveAgencyProfile } from '../../services/agent.service';
import type { AgencyProfile } from '../../types/agent.types';
import type { AgentStackParamList } from '../../navigation/types';

const NAVY = '#00152e';
const NAVY_CON = '#122a47';
const SECONDARY = '#7d5705';
const SEC_CON = '#fec972';
const ON_SEC_CON = '#785300';
const SURFACE = '#faf9fc';
const SURF_LOW = '#f5f3f6';
const SURF_HIGH = '#e9e7ea';
const SURF_HIGHEST = '#e3e2e5';
const ON_SURFACE = '#1b1c1e';
const ON_SURF_VAR = '#44474d';
const TEAL = '#509d9b';
const TEAL_CON = '#002f2f';

const ALL_SPECS = ['Residential', 'Luxury', 'Commercial', 'Industrial'];

const FieldGroup: React.FC<{
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
}> = ({ label, value, onChangeText, multiline }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={[styles.fieldInput, multiline && styles.fieldInputMulti]}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
    />
  </View>
);

const AgentAgencyProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AgentStackParamList>>();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<AgencyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [agencyName, setAgencyName] = useState('');
  const [reraId, setReraId] = useState('');
  const [yearsExp, setYearsExp] = useState('');
  const [languages, setLanguages] = useState('');
  const [website, setWebsite] = useState('');
  const [specializations, setSpecializations] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      const p = await fetchAgencyProfile();
      setProfile(p);
      setAgencyName(p.agencyName);
      setReraId(p.reraId);
      setYearsExp(p.yearsOfExperience);
      setLanguages(p.languages);
      setWebsite(p.website);
      setSpecializations(p.specializations);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleSpec = (spec: string) => {
    setSpecializations(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec],
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAgencyProfile({
        agencyName,
        reraId,
        yearsOfExperience: yearsExp,
        languages,
        website,
        specializations,
      });
      Alert.alert('Saved', 'Agency profile updated successfully.');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <ActivityIndicator style={{ marginTop: 80 }} color={NAVY} />
      </SafeAreaView>
    );
  }

  const completeness = 85;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
            <Icon name="arrow-left" size={22} color={ON_SURF_VAR} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Agency Profile</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Icon name="account" size={18} color={NAVY} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom, 16) + 80 },
        ]}
      >
        {/* Logo Upload */}
        <View style={styles.logoSection}>
          <TouchableOpacity style={styles.logoWrap} activeOpacity={0.85}>
            <View style={styles.logoBg}>
              <Icon name="office-building-outline" size={40} color="rgba(68,71,77,0.3)" />
            </View>
            <View style={styles.updateLogoBadge}>
              <Text style={styles.updateLogoText}>UPDATE LOGO</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.logoHint}>Recommended: Square PNG or SVG (Max 2MB)</Text>
        </View>

        {/* Agency Identity */}
        <Text style={styles.sectionLabel}>AGENCY IDENTITY</Text>
        <View style={styles.formSection}>
          <FieldGroup label="AGENCY NAME" value={agencyName} onChangeText={setAgencyName} />
          <FieldGroup label="RERA NUMBER" value={reraId} onChangeText={setReraId} />
        </View>

        {/* Expertise & Reach */}
        <Text style={styles.sectionLabel}>EXPERTISE & REACH</Text>
        <View style={styles.formSection}>
          {/* Years of experience - simplified picker */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>YEARS OF EXPERIENCE</Text>
            <View style={styles.expRow}>
              {['0-5 Years', '5-10 Years', '10-15 Years', '15+ Years'].map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.expChip, yearsExp === opt && styles.expChipActive]}
                  onPress={() => setYearsExp(opt)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.expChipText, yearsExp === opt && styles.expChipTextActive]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <FieldGroup label="LANGUAGES" value={languages} onChangeText={setLanguages} />

          {/* Specialization */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>SPECIALIZATION</Text>
            <View style={styles.specsRow}>
              {ALL_SPECS.map(spec => {
                const active = specializations.includes(spec);
                return (
                  <TouchableOpacity
                    key={spec}
                    style={[styles.specChip, active && styles.specChipActive]}
                    onPress={() => toggleSpec(spec)}
                    activeOpacity={0.8}
                  >
                    {spec === 'Luxury' && active && (
                      <Icon name="star" size={12} color={TEAL} />
                    )}
                    <Text style={[styles.specChipText, active && styles.specChipTextActive]}>
                      {spec}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Digital Presence */}
        <Text style={styles.sectionLabel}>DIGITAL PRESENCE</Text>
        <View style={styles.formSection}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>WEBSITE</Text>
            <View style={styles.urlInputWrap}>
              <Icon name="web" size={18} color="rgba(68,71,77,0.4)" style={styles.urlIcon} />
              <TextInput
                style={[styles.fieldInput, styles.urlInput]}
                value={website}
                onChangeText={setWebsite}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
          </View>
        </View>

        {/* Profile Integrity Card */}
        <View style={styles.integrityCard}>
          <View style={styles.integrityContent}>
            <Text style={styles.integrityTitle}>Profile Integrity</Text>
            <Text style={styles.integrityDesc}>
              Your agency profile is {completeness}% complete. Adding a verified GST number
              increases your visibility by 40% in premium search results.
            </Text>
            <View style={styles.integrityBarTrack}>
              <View style={[styles.integrityBarFill, { width: `${completeness}%` }]} />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save CTA */}
      <View style={[styles.saveBar, { paddingBottom: Math.max(insets.bottom, 8) + 4 }]}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? 'Saving…' : 'Save Profile Changes'}
          </Text>
          {!saving && <Icon name="arrow-right" size={20} color="#fff" />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: SURFACE },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: NAVY, letterSpacing: -0.3 },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: SURF_HIGH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { paddingTop: 8 },

  logoSection: { alignItems: 'center', marginBottom: 28 },
  logoWrap: { position: 'relative', alignItems: 'center', marginBottom: 24 },
  logoBg: {
    width: 130,
    height: 130,
    borderRadius: 18,
    backgroundColor: SURF_LOW,
    borderWidth: 2,
    borderColor: 'rgba(196,198,206,0.3)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateLogoBadge: {
    position: 'absolute',
    bottom: -14,
    backgroundColor: SECONDARY,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 4 },
    }),
  },
  updateLogoText: { fontSize: 10, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  logoHint: { fontSize: 12, color: ON_SURF_VAR, opacity: 0.7, textAlign: 'center' },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: SECONDARY,
    letterSpacing: 2,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 4,
  },
  formSection: {
    marginHorizontal: 14,
    gap: 14,
    marginBottom: 24,
  },
  fieldGroup: {},
  fieldLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(68,71,77,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginLeft: 4,
  },
  fieldInput: {
    backgroundColor: SURF_LOW,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 14,
    fontWeight: '500',
    color: ON_SURFACE,
  },
  fieldInputMulti: { height: 80, textAlignVertical: 'top' },

  expRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  expChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: SURF_HIGHEST,
  },
  expChipActive: { backgroundColor: NAVY },
  expChipText: { fontSize: 12, fontWeight: '600', color: ON_SURF_VAR },
  expChipTextActive: { color: '#fff', fontWeight: '700' },

  specsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: SURF_HIGHEST,
  },
  specChipActive: { backgroundColor: TEAL_CON },
  specChipText: { fontSize: 13, fontWeight: '600', color: ON_SURF_VAR },
  specChipTextActive: { color: TEAL, fontWeight: '700' },

  urlInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: SURF_LOW, borderRadius: 14 },
  urlIcon: { paddingLeft: 16 },
  urlInput: { flex: 1, backgroundColor: 'transparent', borderRadius: 0, paddingLeft: 10 },

  integrityCard: {
    marginHorizontal: 14,
    backgroundColor: NAVY_CON,
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    overflow: 'hidden',
  },
  integrityContent: {},
  integrityTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 8 },
  integrityDesc: { fontSize: 12, color: 'rgba(177,200,236,0.7)', lineHeight: 18, marginBottom: 16 },
  integrityBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  integrityBarFill: {
    height: '100%',
    backgroundColor: SECONDARY,
    borderRadius: 999,
  },

  saveBar: {
    backgroundColor: 'rgba(250,249,252,0.95)',
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#c4c6ce',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: NAVY,
    borderRadius: 999,
    paddingVertical: 16,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
});

export default AgentAgencyProfileScreen;

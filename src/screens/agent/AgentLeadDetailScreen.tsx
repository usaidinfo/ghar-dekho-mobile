/**
 * AgentLeadDetailScreen — Full lead profile with property hero, buyer info,
 * lead progression stepper, activity timeline, intent score, and broker notes.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { fetchAgentLeadDetail } from '../../services/agent.service';
import type { AgentLead, LeadStage } from '../../types/agent.types';
import type { AgentStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AgentStackParamList, 'AgentLeadDetail'>;

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

const STAGES: { key: LeadStage; label: string; icon: string }[] = [
  { key: 'NEW', label: 'New', icon: 'circle-outline' },
  { key: 'CONTACTED', label: 'Contacted', icon: 'check' },
  { key: 'INTERESTED', label: 'Interested', icon: 'check' },
  { key: 'VISIT_SCHEDULED', label: 'Visit\nScheduled', icon: 'calendar' },
  { key: 'NEGOTIATION', label: 'Negotiation', icon: 'handshake-outline' },
  { key: 'CONVERTED', label: 'Converted', icon: 'party-popper' },
];

const STAGE_ORDER: LeadStage[] = [
  'NEW', 'CONTACTED', 'INTERESTED', 'VISIT_SCHEDULED', 'NEGOTIATION', 'CONVERTED',
];

function stageIndex(stage: LeadStage) {
  return STAGE_ORDER.indexOf(stage);
}

const ActivityItem: React.FC<{
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
  time: string;
  isLast?: boolean;
}> = ({ icon, iconBg, iconColor, title, desc, time, isLast }) => (
  <View style={activity.row}>
    <View>
      <View style={[activity.iconCircle, { backgroundColor: iconBg }]}>
        <Icon name={icon} size={18} color={iconColor} />
      </View>
      {!isLast && <View style={activity.line} />}
    </View>
    <View style={activity.body}>
      <Text style={activity.title}>{title}</Text>
      <Text style={activity.desc}>{desc}</Text>
      <Text style={activity.time}>{time}</Text>
    </View>
  </View>
);

const activity = StyleSheet.create({
  row: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    width: 1,
    flex: 1,
    backgroundColor: 'rgba(196,198,206,0.3)',
    alignSelf: 'center',
    marginTop: 4,
    minHeight: 24,
  },
  body: { flex: 1, paddingTop: 6 },
  title: { fontSize: 14, fontWeight: '700', color: NAVY, marginBottom: 3 },
  desc: { fontSize: 12, color: ON_SURF_VAR, lineHeight: 18 },
  time: { fontSize: 10, fontWeight: '700', color: '#74777e', textTransform: 'uppercase', marginTop: 4 },
});

const AgentLeadDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AgentStackParamList>>();
  const route = useRoute<Props['route']>();
  const insets = useSafeAreaInsets();

  const [lead, setLead] = useState<AgentLead | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const d = await fetchAgentLeadDetail(route.params.leadId);
      setLead(d);
    } finally {
      setLoading(false);
    }
  }, [route.params.leadId]);

  useEffect(() => { load(); }, [load]);

  if (loading || !lead) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <ActivityIndicator style={{ marginTop: 80 }} color={NAVY} />
      </SafeAreaView>
    );
  }

  const currentStageIdx = stageIndex(lead.stage);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
          <Icon name="arrow-left" size={22} color={NAVY} />
        </TouchableOpacity>
        <Text style={styles.headerBrand}>GHAR DEKHO INDIA</Text>
        <TouchableOpacity activeOpacity={0.8}>
          <Icon name="bell-outline" size={22} color={NAVY} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 16) + 80 }]}
      >
        {/* Hero — property */}
        <View style={styles.heroBg}>
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroTitle}>{lead.propertyTitle}</Text>
              <View style={styles.heroLoc}>
                <Icon name="map-marker" size={14} color={SEC_CON} />
                <Text style={styles.heroLocText}>{lead.propertyLocation}</Text>
              </View>
            </View>
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>{lead.propertyPrice}</Text>
            </View>
          </View>
        </View>

        {/* Buyer block */}
        <View style={styles.section}>
          <View style={styles.buyerRow}>
            {/* Avatar */}
            <View style={styles.buyerAvatarWrap}>
              <View style={styles.buyerAvatar}>
                <Text style={styles.buyerAvatarText}>
                  {lead.leadName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Icon name="check-decagram" size={14} color="#fff" />
              </View>
            </View>
            {/* Info */}
            <View style={{ flex: 1 }}>
              <View style={styles.buyerTopRow}>
                <View>
                  <Text style={styles.buyerName}>{lead.leadName}</Text>
                  <Text style={styles.buyerSub}>Looking for 3 BHK in Indore</Text>
                </View>
                <View style={styles.activeBadge}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeBadgeText}>ACTIVE LEAD</Text>
                </View>
              </View>
              {(lead.budgetRange || lead.timeline) && (
                <View style={styles.budgetGrid}>
                  {lead.budgetRange && (
                    <View style={styles.budgetItem}>
                      <Text style={styles.budgetLabel}>BUDGET RANGE</Text>
                      <Text style={styles.budgetValue}>{lead.budgetRange}</Text>
                    </View>
                  )}
                  {lead.timeline && (
                    <View style={styles.budgetItem}>
                      <Text style={styles.budgetLabel}>TIMELINE</Text>
                      <Text style={styles.budgetValue}>{lead.timeline}</Text>
                    </View>
                  )}
                </View>
              )}
              {lead.requirements && (
                <Text style={styles.requirements}>{lead.requirements}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Lead Progression Stepper */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lead Progression</Text>
          <View style={styles.stepperWrap}>
            {/* Progress line */}
            <View style={styles.stepperLineTrack}>
              <View
                style={[
                  styles.stepperLineFill,
                  { width: `${(currentStageIdx / (STAGES.length - 1)) * 100}%` },
                ]}
              />
            </View>
            {STAGES.map((s, i) => {
              const done = i < currentStageIdx;
              const active = i === currentStageIdx;
              return (
                <View key={s.key} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      done && styles.stepCircleDone,
                      active && styles.stepCircleActive,
                    ]}
                  >
                    {done ? (
                      <Icon name="check" size={14} color="#fff" />
                    ) : active ? (
                      <Icon name={s.icon} size={16} color={ON_SEC_CON} />
                    ) : (
                      <Icon name={s.icon} size={14} color={ON_SURF_VAR} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      active && styles.stepLabelActive,
                      !done && !active && styles.stepLabelMuted,
                    ]}
                    numberOfLines={2}
                  >
                    {s.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Activity Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity History</Text>
          <ActivityItem
            icon="eye-outline"
            iconBg={SURF_HIGHEST}
            iconColor={NAVY}
            title="Viewed property details"
            desc="The user spent 4 minutes reviewing floor plans and amenities at 10:45 AM."
            time="Oct 24, 2023"
          />
          <ActivityItem
            icon="email-outline"
            iconBg={TEAL_CON}
            iconColor={TEAL}
            title="Sent message"
            desc={`"Hi, is the South-East facing unit on the 12th floor still available for a visit this weekend?"`}
            time="Oct 25, 2023"
          />
          <ActivityItem
            icon="calendar-check-outline"
            iconBg={SEC_CON}
            iconColor={ON_SEC_CON}
            title="Visit Scheduled"
            desc="Physical site visit confirmed for Sunday morning, 11:00 AM."
            time="Today, 09:12 AM"
            isLast
          />
        </View>

        {/* Intent Score */}
        {lead.intentScore !== undefined && (
          <View style={styles.intentCard}>
            <Text style={styles.intentLabel}>LEAD INTENT SCORE</Text>
            {/* Simple circular score visual */}
            <View style={styles.intentCircleWrap}>
              <View style={styles.intentCircleBg}>
                <View
                  style={[
                    styles.intentCircleFill,
                    {
                      borderColor: SEC_CON,
                      borderTopColor: 'transparent',
                      transform: [{ rotate: `${(lead.intentScore / 100) * 360 - 90}deg` }],
                    },
                  ]}
                />
                <View style={styles.intentScoreInner}>
                  <Text style={styles.intentScore}>{lead.intentScore}%</Text>
                </View>
              </View>
            </View>
            <Text style={styles.intentDesc}>
              Based on 14 app interactions in the last 72 hours. High probability of closure.
            </Text>
          </View>
        )}

        {/* Broker Notes */}
        <View style={styles.section}>
          <View style={styles.noteHeader}>
            <Text style={styles.sectionTitle}>Broker Notes</Text>
            <TouchableOpacity activeOpacity={0.75}>
              <Icon name="pencil-outline" size={20} color={SECONDARY} />
            </TouchableOpacity>
          </View>
          {lead.lastNote && (
            <View style={styles.noteCard}>
              <View style={styles.noteAccent} />
              <Text style={styles.noteCardText}>{lead.lastNote}</Text>
            </View>
          )}
          <View style={[styles.noteCard, { marginTop: 8 }]}>
            <View style={[styles.noteAccent, { backgroundColor: '#c4c6ce' }]} />
            <Text style={styles.noteCardText}>
              Amit mentioned he would like a separate garage space if available.
            </Text>
          </View>
          <TouchableOpacity style={styles.addNoteBtn} activeOpacity={0.8}>
            <Text style={styles.addNoteBtnText}>ADD NEW NOTE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, 8) + 4 }]}>
        <View style={styles.actionBarLeft}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
            <Icon name="phone-outline" size={20} color="#b1c8ec" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: TEAL_CON }]} activeOpacity={0.8}>
            <Icon name="chat-outline" size={20} color={TEAL} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: 'rgba(37,211,102,0.1)' }]} activeOpacity={0.8}>
            <Icon name="whatsapp" size={20} color="#25D366" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.scheduleBtn} activeOpacity={0.85}>
          <Icon name="calendar-clock" size={18} color="#fff" />
          <Text style={styles.scheduleBtnText}>Schedule Visit</Text>
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
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  headerBrand: { fontSize: 14, fontWeight: '900', color: NAVY, letterSpacing: 2 },
  scroll: { paddingBottom: 100 },

  heroBg: {
    height: 220,
    backgroundColor: NAVY_CON,
    marginHorizontal: 0,
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,21,46,0.7)',
  },
  heroContent: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  heroLeft: { flex: 1 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 6, letterSpacing: -0.4 },
  heroLoc: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroLocText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  priceBadge: {
    backgroundColor: SEC_CON,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  priceText: { fontSize: 14, fontWeight: '800', color: ON_SEC_CON },

  section: {
    backgroundColor: SURF_LOW,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 14,
    marginTop: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: NAVY, marginBottom: 16 },

  buyerRow: { flexDirection: 'row', gap: 16 },
  buyerAvatarWrap: { position: 'relative' },
  buyerAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: SURF_HIGHEST,
    borderWidth: 3,
    borderColor: SURF_HIGHEST,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyerAvatarText: { fontSize: 22, fontWeight: '900', color: NAVY },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: SECONDARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: SURF_LOW,
  },
  buyerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  buyerName: { fontSize: 18, fontWeight: '800', color: NAVY },
  buyerSub: { fontSize: 12, color: ON_SURF_VAR, marginTop: 2 },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: TEAL_CON,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#87d4d2',
  },
  activeBadgeText: { fontSize: 9, fontWeight: '800', color: TEAL, textTransform: 'uppercase', letterSpacing: 1 },
  budgetGrid: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  budgetItem: {
    flex: 1,
    backgroundColor: SURF_HIGH,
    borderRadius: 12,
    padding: 12,
  },
  budgetLabel: { fontSize: 9, fontWeight: '700', color: ON_SURF_VAR, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  budgetValue: { fontSize: 14, fontWeight: '800', color: NAVY },
  requirements: { fontSize: 13, color: ON_SURF_VAR, lineHeight: 20, fontStyle: 'italic' },

  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    position: 'relative',
    paddingTop: 4,
  },
  stepperLineTrack: {
    position: 'absolute',
    top: 22,
    left: '8%',
    right: '8%',
    height: 3,
    backgroundColor: SURF_HIGHEST,
    zIndex: 0,
    borderRadius: 2,
  },
  stepperLineFill: {
    height: '100%',
    backgroundColor: SECONDARY,
    borderRadius: 2,
  },
  stepItem: { alignItems: 'center', gap: 6, flex: 1, zIndex: 1 },
  stepCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: SURF_HIGHEST,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleDone: { backgroundColor: SECONDARY },
  stepCircleActive: {
    backgroundColor: SEC_CON,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: 'rgba(254,201,114,0.3)',
  },
  stepLabel: { fontSize: 9, fontWeight: '700', color: ON_SURF_VAR, textAlign: 'center', lineHeight: 12 },
  stepLabelActive: { color: SECONDARY, fontWeight: '800' },
  stepLabelMuted: { color: 'rgba(68,71,77,0.35)' },

  intentCard: {
    backgroundColor: NAVY,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 14,
    marginTop: 16,
    alignItems: 'center',
  },
  intentLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.6)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 20 },
  intentCircleWrap: { width: 120, height: 120, marginBottom: 16 },
  intentCircleBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: 'rgba(18,42,71,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  intentCircleFill: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: SEC_CON,
  },
  intentScoreInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intentScore: { fontSize: 26, fontWeight: '900', color: '#fff' },
  intentDesc: { fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 18 },

  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: SURF_HIGHEST,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 12,
    gap: 10,
  },
  noteAccent: { width: 4, backgroundColor: SECONDARY, borderRadius: 2, flexShrink: 0 },
  noteCardText: { fontSize: 13, color: ON_SURF_VAR, flex: 1, lineHeight: 18 },
  addNoteBtn: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(196,198,206,0.3)',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addNoteBtnText: { fontSize: 11, fontWeight: '700', color: ON_SURF_VAR, letterSpacing: 1 },

  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: 'rgba(250,249,252,0.95)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#c4c6ce',
  },
  actionBarLeft: { flexDirection: 'row', gap: 10 },
  iconBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: NAVY_CON,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleBtn: {
    flex: 1,
    marginLeft: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: SECONDARY,
    borderRadius: 999,
    paddingVertical: 14,
  },
  scheduleBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});

export default AgentLeadDetailScreen;

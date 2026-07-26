/**
 * @file MembershipPlansStep.tsx
 * @description Step 2 — role-specific plan tiers (Basic / Medium / Premium).
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import type { MembershipAccountTypeDefinition, MembershipPlanDefinition, MembershipPlanTier } from '../../types/membership.types';

const PRIMARY = '#00152e';
const PRIMARY_CONTAINER = '#122A47';
const SURFACE_LOW = '#f5f3f6';
const VARIANT_FG = '#44474d';
const WHITE = '#ffffff';

const PLAN_CARD_WIDTH = 220;

const TIER_RANK: Record<MembershipPlanTier, number> = {
  BASIC: 1,
  MEDIUM: 2,
  PREMIUM: 3,
};

interface Props {
  account: MembershipAccountTypeDefinition;
  paying: boolean;
  onBack: () => void;
  onSelectPlan: (plan: MembershipPlanDefinition) => void;
  /** When set, only show tiers strictly above this one (plan upgrade mode). */
  minTierExclusive?: MembershipPlanTier | null;
  mode?: 'subscribe' | 'upgrade';
}

const MembershipPlansStep: React.FC<Props> = ({
  account,
  paying,
  onBack,
  onSelectPlan,
  minTierExclusive = null,
  mode = 'subscribe',
}) => {
  const plans = minTierExclusive
    ? account.plans.filter(p => TIER_RANK[p.tier] > TIER_RANK[minTierExclusive])
    : account.plans;

  return (
  <View style={styles.root}>
    <View style={styles.topBar}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8} hitSlop={12}>
        <Icon name="arrow-left" size={22} color={PRIMARY} />
      </TouchableOpacity>
      <Text style={styles.topTitle}>
        {mode === 'upgrade' ? 'Upgrade Your Plan' : account.plansTitle}
      </Text>
      <View style={styles.backSpacer} />
    </View>

    <View style={[styles.selectedBanner, { backgroundColor: account.accentLight }]}>
      <View style={[styles.bannerIcon, { backgroundColor: `${account.accent}22` }]}>
        <Icon name={account.icon} size={22} color={account.accent} />
      </View>
      <View style={styles.bannerText}>
        <Text style={[styles.bannerLabel, { color: account.accentDark }]}>
          {mode === 'upgrade'
            ? `Upgrading within ${account.title}`
            : `You selected: ${account.title}`}
        </Text>
        <Text style={styles.bannerSubtitle}>
          {mode === 'upgrade'
            ? 'Pick a higher tier for more listings, boosts, and features.'
            : account.plansSubtitle}
        </Text>
      </View>
    </View>

    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>
        {mode === 'upgrade' ? 'Available upgrades' : 'Select Your Plan'}
      </Text>
      <View style={[styles.validityBadge, { backgroundColor: account.accentLight }]}>
        <Text style={[styles.validityText, { color: account.accentDark }]}>30 Days Validity</Text>
      </View>
    </View>

    {plans.length === 0 ? (
      <View style={styles.emptyUpgrade}>
        <Icon name="crown" size={28} color={account.accent} />
        <Text style={styles.emptyUpgradeTitle}>You're on the top plan</Text>
        <Text style={styles.emptyUpgradeSub}>
          There is no higher tier for {account.title} right now.
        </Text>
      </View>
    ) : (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.plansRow}
      decelerationRate="fast"
      snapToInterval={PLAN_CARD_WIDTH + 14}
    >
      {plans.map(plan => (
        <View
          key={plan.tier}
          style={[
            styles.planCard,
            plan.highlighted && { borderColor: account.accent, borderWidth: 2 },
          ]}
        >
          {plan.tier === 'PREMIUM' ? (
            <View style={[styles.premiumGem, { backgroundColor: account.accentLight }]}>
              <Icon name="diamond-stone" size={16} color={account.accent} />
            </View>
          ) : null}

          <Text style={[styles.planName, { color: account.accent }]}>{plan.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceAmount}>₹{plan.priceInr}</Text>
            <Text style={styles.pricePeriod}>/ month</Text>
          </View>

          <View style={styles.featureList}>
            {plan.features.map(feature => (
              <View key={feature} style={styles.featureRow}>
                <Icon name="check-circle" size={16} color={account.accent} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.ctaBtn, { borderColor: account.accent }]}
            activeOpacity={0.9}
            disabled={paying}
            onPress={() => onSelectPlan(plan)}
          >
            {paying ? (
              <ActivityIndicator color={account.accent} size="small" />
            ) : (
              <Text style={[styles.ctaText, { color: account.accent }]}>
                {mode === 'upgrade' ? 'Upgrade' : 'Get Started'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
    )}

    <View style={[styles.paymentBanner, { backgroundColor: account.accentLight }]}>
      <Icon name="shield-lock-outline" size={20} color={account.accentDark} />
      <View style={styles.paymentTextBlock}>
        <Text style={[styles.paymentTitle, { color: account.accentDark }]}>Safe & Secure</Text>
        <Text style={styles.paymentSubtitle}>
          Your payment and data are 100% secure with us.
        </Text>
      </View>
      <View style={styles.paymentLogos}>
        {['UPI', 'VISA', 'MC'].map(label => (
          <View key={label} style={styles.paymentLogo}>
            <Text style={styles.paymentLogoText}>{label}</Text>
          </View>
        ))}
      </View>
    </View>

    <View style={styles.infoFooter}>
      <Icon name="information-outline" size={16} color={VARIANT_FG} />
      <Text style={styles.infoText}>
        {mode === 'upgrade'
          ? 'Upgrading starts a fresh 30-day period on the new plan.'
          : 'You can upgrade to a higher plan anytime from Membership.'}
      </Text>
    </View>
  </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SURFACE_LOW,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backSpacer: {
    width: 40,
  },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: PRIMARY,
  },
  selectedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    flex: 1,
  },
  bannerLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: VARIANT_FG,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: PRIMARY,
  },
  validityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  validityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  plansRow: {
    gap: 14,
    paddingBottom: 8,
    paddingRight: 4,
  },
  planCard: {
    width: PLAN_CARD_WIDTH,
    backgroundColor: SURFACE_LOW,
    borderRadius: 16,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${PRIMARY_CONTAINER}22`,
    ...Platform.select({
      ios: {
        shadowColor: '#00152e',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 3 },
    }),
  },
  premiumGem: {
    alignSelf: 'flex-end',
    padding: 6,
    borderRadius: 8,
    marginBottom: 4,
  },
  planName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  priceAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: PRIMARY,
  },
  pricePeriod: {
    fontSize: 13,
    color: VARIANT_FG,
    marginLeft: 4,
  },
  featureList: {
    gap: 10,
    marginBottom: 18,
    minHeight: 140,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  featureText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: VARIANT_FG,
  },
  ctaBtn: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
  },
  paymentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginTop: 24,
    gap: 12,
    flexWrap: 'wrap',
  },
  paymentTextBlock: {
    flex: 1,
    minWidth: 140,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  paymentSubtitle: {
    fontSize: 11,
    color: VARIANT_FG,
    marginTop: 2,
  },
  paymentLogos: {
    flexDirection: 'row',
    gap: 6,
  },
  paymentLogo: {
    backgroundColor: WHITE,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paymentLogoText: {
    fontSize: 9,
    fontWeight: '800',
    color: PRIMARY_CONTAINER,
    letterSpacing: 0.5,
  },
  infoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  infoText: {
    fontSize: 13,
    color: VARIANT_FG,
    opacity: 0.85,
  },
  emptyUpgrade: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyUpgradeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: PRIMARY,
    textAlign: 'center',
  },
  emptyUpgradeSub: {
    fontSize: 13,
    color: VARIANT_FG,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default MembershipPlansStep;

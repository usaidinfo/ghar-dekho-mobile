/**
 * @file MembershipScreen.tsx
 * @description Membership tab — upgrade pitch when inactive; status when premium is active.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

import { userService } from '../../services';
import { useAuthStore } from '../../stores/auth.store';
import {
  MEMBERSHIP_PLAN_DAYS,
  MEMBERSHIP_PLAN_PRICE_INR,
  isLocalMembershipActive,
  simulateMembershipPayment,
  useMembershipStore,
} from '../../stores/membership.store';
import type { BottomTabParamList, MainStackParamList } from '../../navigation/types';
import type { CurrentUser } from '../../types/user.types';
import {
  formatMembershipExpiry,
  getMembershipDaysRemaining,
  getMembershipProgressPercent,
  isMembershipActive,
  isMembershipActiveFromApi,
  isMembershipExpiringSoon,
  resolveMembershipExpiresAt,
  resolveMembershipPlanDays,
} from '../../utils/membership';

const PRIMARY = '#00152e';
const PRIMARY_CONTAINER = '#122A47';
const SECONDARY = '#D1A14E';
const SECONDARY_DARK = '#7d5705';
const SECONDARY_FIXED = '#ffdeac';
const SURFACE = '#faf9fc';
const SURFACE_LOW = '#f5f3f6';
const SURFACE_PANEL = '#efedf0';
const VARIANT_FG = '#44474d';
const OUTLINE = '#c4c6ce';
const TEAL_ACCENT = '#509d9b';
const WHITE = '#ffffff';
const SECONDARY_FIXED_DIM = '#f1be68';
const SECONDARY_CONTAINER = '#fec972';
const ON_SECONDARY_CONTAINER = '#785300';
const ON_PRIMARY_CONTAINER = '#7c92b4';
const DARK = '#1b1c1e';
const OUTLINE_MUTED = '#74777e';
const HOME_EDGE = 24;

const GRADIENT = ['#00152e', '#122A47'] as const;

const LIFESTYLE_IMAGE_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAI5tqr31HNdVcn6Ehu52inCz_g7yVS-cYz-yeiOoR4rRf2mRvhyjvadit7L35XKLaAEa0ptlhmVfXWWEigLgYqEcOvFx9c1H2dOcse_0NlhN853xD-Y3OEM9wuTLXoH7IvQL1gmdWgWxWLg6L1T6K1lPwkeMtA9yQ9DHjtJPHg_3AfKzqQyuzupk08eIq74YfR3F5CmTC_OvOTLbRMJzCEy-YAyHPRJCsyYQ5PpykCHQ8dm08GIYewl2IrJcUesXD1bF0owVqGAIkg';

const ACTIVE_BENEFITS = [
  'Unlimited posting',
  'Full contact unlocked',
  'Ads removed',
  'Verified badge active',
  'Boost available',
] as const;

type MembershipNav = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Membership'>,
  NativeStackNavigationProp<MainStackParamList>
>;

const HERO_BENEFITS = [
  { icon: 'home-plus', label: 'Unlimited posting' },
  { icon: 'phone', label: 'Full contact access' },
  { icon: 'check-decagram', label: 'Verified badge' },
] as const;

const COMPARISON_ROWS = [
  {
    feature: 'Browse',
    free: { type: 'text' as const, value: 'Limited' },
    premium: { type: 'check' as const },
  },
  {
    feature: 'Contact',
    free: { type: 'lock' as const },
    premium: { type: 'text' as const, value: 'Call + WhatsApp' },
  },
  {
    feature: 'Post',
    free: { type: 'text' as const, value: 'Not allowed' },
    premium: { type: 'check' as const },
  },
  {
    feature: 'Ads',
    free: { type: 'text' as const, value: 'Banner' },
    premium: { type: 'text' as const, value: 'No Ads', bold: true, uppercase: true },
  },
];

const PLAN_FEATURES = [
  'Unlimited posts',
  'No ads',
  'Verified badge',
  'Boost listings',
] as const;

const FAQ_ITEMS = [
  {
    q: 'What happens after pay?',
    a: "Your account is instantly upgraded to Premium. You'll receive a confirmation email and the \"Verified\" badge will appear on your profile. You can start posting immediately.",
  },
  {
    q: 'Can I post without membership?',
    a: 'Currently, property listing is exclusive to our Premium Members to ensure a high-quality, verified marketplace for all users.',
  },
] as const;

function ComparisonCell({
  cell,
}: {
  cell: (typeof COMPARISON_ROWS)[number]['free'];
}) {
  if (cell.type === 'check') {
    return (
      <View style={styles.cellCenter}>
        <Icon name="check-circle" size={22} color={TEAL_ACCENT} />
      </View>
    );
  }
  if (cell.type === 'lock') {
    return (
      <View style={styles.cellCenter}>
        <Icon name="lock" size={22} color="#74777e" />
      </View>
    );
  }
  return (
    <Text
      style={[
        styles.compareFreeText,
        cell.bold && styles.comparePremiumText,
        cell.bold && { color: TEAL_ACCENT },
      ]}
    >
      {cell.value}
    </Text>
  );
}

interface FaqAccordionProps {
  items: readonly { q: string; a: string }[];
}

const FaqAccordion: React.FC<FaqAccordionProps> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <View style={styles.faqList}>
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <View key={item.q} style={styles.faqCard}>
            <TouchableOpacity
              style={styles.faqHeader}
              onPress={() => setOpenIndex(open ? null : index)}
              activeOpacity={0.8}
            >
              <Text style={styles.faqQuestion}>{item.q}</Text>
              <Icon
                name="chevron-down"
                size={22}
                color={PRIMARY}
                style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
              />
            </TouchableOpacity>
            {open ? <Text style={styles.faqAnswer}>{item.a}</Text> : null}
          </View>
        );
      })}
    </View>
  );
};

interface UpgradeContentProps {
  onUpgrade: () => void;
  paying: boolean;
}

const MembershipUpgradeContent: React.FC<UpgradeContentProps> = ({ onUpgrade, paying }) => (
  <>
    <View style={styles.headerSection}>
      <Text style={styles.pageTitle}>Ghar Dekho Membership</Text>
      <Text style={styles.pageSubtitle}>Unlock full access to buy, sell, and connect</Text>
    </View>

    <LinearGradient colors={[...GRADIENT]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
      <Icon name="crown" size={120} color="rgba(255,255,255,0.1)" style={styles.heroWatermark} />
      <Text style={styles.heroTitle}>Go Premium. Post & Connect</Text>
      <View style={styles.heroBenefits}>
        {HERO_BENEFITS.map(b => (
          <View key={b.label} style={styles.heroBenefitRow}>
            <View style={styles.heroIconWrap}>
              <Icon name={b.icon} size={20} color={SECONDARY_FIXED} />
            </View>
            <Text style={styles.heroBenefitText}>{b.label}</Text>
          </View>
        ))}
      </View>
    </LinearGradient>

    <Text style={styles.sectionTitle}>What you get</Text>
    <View style={styles.compareTable}>
      <View style={styles.compareHeaderRow}>
        <Text style={[styles.compareHeaderCell, styles.compareFeatureCol]}>Feature</Text>
        <Text style={styles.compareHeaderCell}>Free</Text>
        <Text style={[styles.compareHeaderCell, styles.comparePremiumHeader]}>Premium</Text>
      </View>
      {COMPARISON_ROWS.map((row, i) => (
        <View
          key={row.feature}
          style={[styles.compareRow, i < COMPARISON_ROWS.length - 1 && styles.compareRowBorder]}
        >
          <Text style={[styles.compareFeature, styles.compareFeatureCol]}>{row.feature}</Text>
          <View style={styles.compareValueCol}>
            <ComparisonCell cell={row.free} />
          </View>
          <View style={styles.compareValueCol}>
            {row.premium.type === 'check' ? (
              <ComparisonCell cell={row.premium} />
            ) : (
              <Text
                style={[
                  styles.comparePremiumText,
                  row.premium.bold && styles.comparePremiumBold,
                  row.premium.uppercase && styles.comparePremiumUpper,
                ]}
              >
                {row.premium.value}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>

    <View style={styles.pricingCard}>
      <View style={styles.recommendedBadge}>
        <Text style={styles.recommendedText}>Recommended</Text>
      </View>
      <Text style={styles.planTitle}>Premium Membership</Text>
      <View style={styles.priceRow}>
        <Text style={styles.priceAmount}>₹999</Text>
        <Text style={styles.pricePeriod}>/ 30 days</Text>
      </View>
      <View style={styles.planFeatures}>
        {PLAN_FEATURES.map(f => (
          <View key={f} style={styles.planFeatureRow}>
            <Icon name="check" size={18} color={SECONDARY} />
            <Text style={styles.planFeatureText}>{f}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.upgradeBtn, paying && styles.upgradeBtnDisabled]}
        onPress={onUpgrade}
        activeOpacity={0.92}
        disabled={paying}
      >
        {paying ? (
          <ActivityIndicator color={WHITE} />
        ) : (
          <>
            <Text style={styles.upgradeBtnText}>Upgrade Now</Text>
            <Text style={styles.upgradeBtnSub}>via Razorpay</Text>
          </>
        )}
      </TouchableOpacity>
      <View style={styles.trustRow}>
        <View style={styles.trustItem}>
          <Icon name="shield-lock" size={14} color={VARIANT_FG} />
          <Text style={styles.trustText}>Secure payment</Text>
        </View>
        <View style={styles.trustItem}>
          <Icon name="calendar-refresh" size={14} color={VARIANT_FG} />
          <Text style={styles.trustText}>Cancel anytime</Text>
        </View>
      </View>
    </View>

    <Text style={styles.sectionTitle}>Common Questions</Text>
    <FaqAccordion items={FAQ_ITEMS} />
  </>
);

interface ActiveContentProps {
  expiresAt: string | null | undefined;
  planDays: number;
  isDemo: boolean;
  onRenew: () => void;
  onPostProperty: () => void;
  onBoostListing: () => void;
}

const MembershipActiveContent: React.FC<ActiveContentProps> = ({
  expiresAt,
  planDays,
  isDemo,
  onRenew,
  onPostProperty,
  onBoostListing,
}) => {
  const expiresLabel = formatMembershipExpiry(expiresAt);
  const daysRemaining = getMembershipDaysRemaining(expiresAt);
  const progressTarget = getMembershipProgressPercent(expiresAt, planDays);
  const showRenewBanner = isMembershipExpiringSoon(expiresAt);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: progressTarget,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progressAnim, progressTarget]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const remainingLabel =
    daysRemaining === null
      ? null
      : daysRemaining === 0
        ? 'Expired'
        : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining`;

  return (
    <View style={styles.activeContent}>
      {isDemo ? (
        <View style={styles.demoNote}>
          <Icon name="information-outline" size={16} color={SECONDARY_DARK} />
          <Text style={styles.demoNoteText}>
            Demo membership active on this device until Razorpay is connected.
          </Text>
        </View>
      ) : null}

      <LinearGradient
        colors={[...GRADIENT]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statusHero}
      >
        <View style={styles.statusHeroTop}>
          <View style={styles.activeMemberPill}>
            <Icon name="check-decagram" size={16} color={ON_SECONDARY_CONTAINER} />
            <Text style={styles.activeMemberPillText}>Active Member</Text>
          </View>
          <Icon name="crown" size={36} color={SECONDARY_FIXED} />
        </View>

        <View style={styles.statusHeroBody}>
          <Text style={styles.statusHeroTitle}>You're a Premium Member</Text>
          <Text style={styles.statusHeroSubtitle}>Enjoying exclusive real estate benefits</Text>
        </View>

        <View style={styles.statusProgressBlock}>
          <View style={styles.statusProgressLabels}>
            <Text style={styles.statusExpiresText}>
              {expiresLabel ? `Expires on: ${expiresLabel}` : 'Membership active'}
            </Text>
            {remainingLabel ? (
              <Text style={styles.statusRemainingText}>{remainingLabel}</Text>
            ) : null}
          </View>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
        </View>
      </LinearGradient>

      {showRenewBanner ? (
        <View style={styles.renewBanner}>
          <View style={styles.renewBannerLeft}>
            <View style={styles.renewIconWrap}>
              <Icon name="calendar-refresh" size={22} color={SECONDARY_DARK} />
            </View>
            <View style={styles.renewTextBlock}>
              <Text style={styles.renewTitle}>Membership expiring soon</Text>
              <Text style={styles.renewSubtitle}>Renew to avoid service disruption</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.renewBtn} onPress={onRenew} activeOpacity={0.88}>
            <Text style={styles.renewBtnText}>Renew Now</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionPrimary} onPress={onPostProperty} activeOpacity={0.9}>
          <Icon name="home-plus" size={30} color={WHITE} />
          <Text style={styles.quickActionPrimaryText}>Post a Property</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionSecondary} onPress={onBoostListing} activeOpacity={0.9}>
          <Icon name="rocket-launch" size={30} color={SECONDARY_DARK} />
          <Text style={styles.quickActionSecondaryText}>Boost a Listing</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.benefitsSection}>
        <View style={styles.benefitsSectionHeader}>
          <Text style={styles.benefitsSectionTitle}>Your Active Benefits</Text>
          <View style={styles.benefitsSectionLine} />
        </View>
        <View style={styles.benefitsList}>
          {ACTIVE_BENEFITS.map(label => (
            <View key={label} style={styles.benefitRow}>
              <View style={styles.benefitIconWrap}>
                <Icon name="check-circle" size={18} color={SECONDARY_DARK} />
              </View>
              <Text style={styles.benefitLabel}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.lifestyleCard}>
        <Image source={{ uri: LIFESTYLE_IMAGE_URI }} style={styles.lifestyleImage} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,21,46,0.85)']}
          style={styles.lifestyleOverlay}
        >
          <Text style={styles.lifestyleCaption}>Curating India's finest properties since 2024</Text>
        </LinearGradient>
      </View>
    </View>
  );
};

const MembershipScreen: React.FC = () => {
  const navigation = useNavigation<MembershipNav>();
  const insets = useSafeAreaInsets();
  const accessToken = useAuthStore(s => s.accessToken);
  const userId = useAuthStore(s => s.user?.id);
  const activateMembership = useMembershipStore(s => s.activate);
  const renewMembership = useMembershipStore(s => s.renew);
  const localRecord = useMembershipStore(s => (userId ? s.byUserId[userId] : undefined));
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const tabBarPad = Math.max(insets.bottom, 14) + 72;
  const localMembership = isLocalMembershipActive(localRecord) ? localRecord : null;

  const loadMembership = useCallback(async () => {
    if (!accessToken) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }
    if (!localMembership) setLoading(true);
    try {
      const user = await userService.fetchCurrentUser();
      setCurrentUser(user);
    } catch {
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, localMembership]);

  useFocusEffect(
    useCallback(() => {
      loadMembership();
    }, [loadMembership]),
  );

  const active = isMembershipActive(currentUser, localMembership);
  const expiresAt = resolveMembershipExpiresAt(currentUser, localMembership);
  const planDays = resolveMembershipPlanDays(currentUser, localMembership);
  const isDemoMembership = active && !isMembershipActiveFromApi(currentUser);
  const showLoading = loading && !active;

  const runCheckout = useCallback(
    async (mode: 'upgrade' | 'renew') => {
      if (!userId || paying) return;
      setPaying(true);
      try {
        await simulateMembershipPayment();
        if (mode === 'renew') {
          renewMembership(userId);
        } else {
          activateMembership(userId);
        }
        Toast.show({
          type: 'success',
          text1: mode === 'renew' ? 'Membership renewed!' : 'Welcome to Premium!',
          text2: `Premium active for ${MEMBERSHIP_PLAN_DAYS} days.`,
        });
      } finally {
        setPaying(false);
      }
    },
    [activateMembership, paying, renewMembership, userId],
  );

  const onUpgrade = () => {
    Alert.alert(
      'Upgrade to Premium',
      `Pay ₹${MEMBERSHIP_PLAN_PRICE_INR} for ${MEMBERSHIP_PLAN_DAYS} days of Premium access?\n\nThis uses demo checkout on your device until Razorpay is live.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Pay Now', onPress: () => runCheckout('upgrade') },
      ],
    );
  };

  const onRenew = () => {
    Alert.alert(
      'Renew Premium',
      `Extend your membership by ${MEMBERSHIP_PLAN_DAYS} days for ₹${MEMBERSHIP_PLAN_PRICE_INR}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Renew', onPress: () => runCheckout('renew') },
      ],
    );
  };

  const onPostProperty = () => {
    navigation.navigate('PostProperty');
  };

  const onBoostListing = () => {
    navigation.navigate('MyListings');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarPad }]}
        showsVerticalScrollIndicator={false}
      >
        {showLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={PRIMARY_CONTAINER} />
          </View>
        ) : active ? (
          <MembershipActiveContent
            expiresAt={expiresAt}
            planDays={planDays}
            isDemo={isDemoMembership}
            onRenew={onRenew}
            onPostProperty={onPostProperty}
            onBoostListing={onBoostListing}
          />
        ) : (
          <MembershipUpgradeContent onUpgrade={onUpgrade} paying={paying} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: SURFACE,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HOME_EDGE,
    paddingTop: 8,
  },
  loadingWrap: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  headerSection: {
    paddingVertical: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: PRIMARY,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 17,
    lineHeight: 26,
    color: VARIANT_FG,
    opacity: 0.8,
  },
  heroCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#00152e',
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 8 },
    }),
  },
  heroWatermark: {
    position: 'absolute',
    right: -16,
    top: -16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: WHITE,
    marginBottom: 20,
  },
  heroBenefits: {
    gap: 14,
  },
  heroBenefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroIconWrap: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 8,
    borderRadius: 999,
  },
  heroBenefitText: {
    fontSize: 15,
    fontWeight: '500',
    color: SURFACE_LOW,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 20,
  },
  compareTable: {
    backgroundColor: SURFACE_LOW,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 40,
  },
  compareHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: SURFACE_PANEL,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${OUTLINE}33`,
  },
  compareHeaderCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: VARIANT_FG,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  comparePremiumHeader: {
    color: SECONDARY_DARK,
  },
  compareFeatureCol: {
    flex: 1.2,
    textAlign: 'left',
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 14,
  },
  compareRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${OUTLINE}1a`,
  },
  compareFeature: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY,
  },
  compareValueCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareFreeText: {
    fontSize: 11,
    color: '#74777e',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  comparePremiumText: {
    fontSize: 11,
    fontWeight: '700',
    color: TEAL_ACCENT,
    textAlign: 'center',
  },
  comparePremiumBold: {
    fontWeight: '700',
  },
  comparePremiumUpper: {
    textTransform: 'uppercase',
  },
  pricingCard: {
    backgroundColor: WHITE,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: SECONDARY,
    padding: 28,
    marginBottom: 40,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: SECONDARY_DARK,
        shadowOpacity: 0.1,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 12 },
      },
      android: { elevation: 6 },
    }),
  },
  recommendedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: SECONDARY_DARK,
    paddingHorizontal: 20,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '700',
    color: WHITE,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: PRIMARY,
    marginBottom: 6,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 28,
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: SECONDARY,
  },
  pricePeriod: {
    fontSize: 15,
    fontWeight: '500',
    color: VARIANT_FG,
  },
  planFeatures: {
    gap: 14,
    marginBottom: 28,
  },
  planFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  planFeatureText: {
    fontSize: 15,
    fontWeight: '500',
    color: VARIANT_FG,
  },
  upgradeBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY,
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 4 },
    }),
  },
  upgradeBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: WHITE,
  },
  upgradeBtnSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '400',
  },
  upgradeBtnDisabled: {
    opacity: 0.85,
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
    paddingHorizontal: 4,
    opacity: 0.6,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustText: {
    fontSize: 9,
    fontWeight: '700',
    color: VARIANT_FG,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  faqList: {
    gap: 14,
    marginBottom: 16,
  },
  faqCard: {
    backgroundColor: SURFACE_LOW,
    borderRadius: 12,
    padding: 18,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: PRIMARY,
  },
  faqAnswer: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 22,
    color: VARIANT_FG,
  },
  activeContent: {
    gap: 28,
    paddingTop: 8,
    paddingBottom: 8,
  },
  demoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(255,222,172,0.45)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${SECONDARY}66`,
  },
  demoNoteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: SECONDARY_DARK,
    fontWeight: '500',
  },
  statusHero: {
    borderRadius: 12,
    padding: 28,
    overflow: 'hidden',
    gap: 22,
    ...Platform.select({
      ios: {
        shadowColor: '#00152e',
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 8 },
    }),
  },
  statusHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeMemberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: SECONDARY_CONTAINER,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  activeMemberPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: ON_SECONDARY_CONTAINER,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusHeroBody: {
    gap: 4,
  },
  statusHeroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: WHITE,
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  statusHeroSubtitle: {
    fontSize: 15,
    color: ON_PRIMARY_CONTAINER,
    opacity: 0.9,
  },
  statusProgressBlock: {
    paddingTop: 4,
    gap: 10,
  },
  statusProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  statusExpiresText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  statusRemainingText: {
    fontSize: 13,
    fontWeight: '700',
    color: WHITE,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: SECONDARY_FIXED_DIM,
    ...Platform.select({
      ios: {
        shadowColor: SECONDARY_FIXED_DIM,
        shadowOpacity: 0.4,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 0 },
      },
      android: { elevation: 2 },
    }),
  },
  renewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: SURFACE_LOW,
    borderRadius: 12,
    padding: 14,
  },
  renewBannerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  renewIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(125,87,5,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  renewTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  renewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK,
  },
  renewSubtitle: {
    fontSize: 12,
    color: OUTLINE_MUTED,
    marginTop: 2,
  },
  renewBtn: {
    backgroundColor: SECONDARY_DARK,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  renewBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: WHITE,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 14,
  },
  quickActionPrimary: {
    flex: 1,
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 22,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY,
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 4 },
    }),
  },
  quickActionPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: WHITE,
    textAlign: 'center',
  },
  quickActionSecondary: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: SECONDARY,
    paddingVertical: 22,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: SURFACE,
  },
  quickActionSecondaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: SECONDARY_DARK,
    textAlign: 'center',
  },
  benefitsSection: {
    gap: 18,
  },
  benefitsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: PRIMARY,
  },
  benefitsSectionLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: `${OUTLINE}4d`,
  },
  benefitsList: {
    gap: 10,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 12,
    backgroundColor: SURFACE,
  },
  benefitIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,222,172,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: DARK,
  },
  lifestyleCard: {
    height: 192,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 4,
  },
  lifestyleImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  lifestyleOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 22,
  },
  lifestyleCaption: {
    fontSize: 16,
    fontWeight: '700',
    color: WHITE,
    lineHeight: 22,
  },
});

export default MembershipScreen;

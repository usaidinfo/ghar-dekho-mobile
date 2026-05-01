import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { buildAiInsightCopy, investmentScoreLabel } from '../../utils/propertyDisplay';

const PRIMARY = '#122A47';
const GOLD = '#D1A14E';
const TEAL = '#2DD4BF';

interface PropertyAiInsightsCardProps {
  locality: string;
  city: string;
  description?: string | null;
  price: number;
  aiSuggestedPrice?: number | null;
  safetyScore?: number | null;
  investmentScore?: number | null;
  rentalYield?: number | null;
}

function safetyBarWidth(score: number): `${number}%` {
  const pct = Math.min(100, Math.max(8, (score / 10) * 100));
  return `${pct}%`;
}

function yieldBarWidth(yieldVal: number): `${number}%` {
  const y = yieldVal < 1 ? yieldVal * 100 : yieldVal;
  const pct = Math.min(100, Math.max(8, Math.min(y, 15) * (100 / 15)));
  return `${pct}%`;
}

const PropertyAiInsightsCard: React.FC<PropertyAiInsightsCardProps> = ({
  locality,
  city,
  description,
  price,
  aiSuggestedPrice,
  safetyScore,
  investmentScore,
  rentalYield,
}) => {
  const { width } = useWindowDimensions();
  const pad = width < 360 ? 22 : 32;
  const insight = buildAiInsightCopy({ locality, city, description, aiSuggestedPrice, price });
  const priceLabelRaw = investmentScoreLabel(investmentScore);
  const priceLabel = priceLabelRaw === '—' ? 'Fair' : priceLabelRaw;

  const safetyMain =
    safetyScore != null && Number.isFinite(safetyScore) ? safetyScore.toFixed(1) : '—';
  const showSafetyBar = safetyScore != null && Number.isFinite(safetyScore);

  const yieldNum =
    rentalYield != null && Number.isFinite(rentalYield)
      ? rentalYield < 1
        ? rentalYield * 100
        : rentalYield
      : null;
  const yieldPct = yieldNum != null ? `${yieldNum.toFixed(1)}%` : '—';
  const showYieldBar = yieldNum != null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Intelligence Report</Text>
        <Icon name="creation" size={22} color={GOLD} />
      </View>

      <LinearGradient
        colors={['#122A47', '#1A3A5F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { padding: pad }]}
      >
        <View style={[styles.blob, styles.blobGold]} pointerEvents="none" />

        <View style={styles.metricsRow}>
          <View style={styles.metricCol}>
            <Text style={styles.safetyBig}>{safetyMain}</Text>
            {showSafetyBar ? (
              <View style={styles.barTrack}>
                <View style={[styles.barFillGold, { width: safetyBarWidth(safetyScore!) }]} />
              </View>
            ) : (
              <View style={[styles.barTrack, { marginTop: 6 }]} />
            )}
            <Text style={styles.metricCaption}>Safety</Text>
          </View>

          <View style={[styles.metricCol, styles.metricBorder]}>
            <Text style={styles.priceRating}>{priceLabel}</Text>
            <Text style={[styles.metricCaption, { marginTop: 18 }]}>Pricing</Text>
          </View>

          <View style={styles.metricCol}>
            <Text style={styles.yieldText}>{yieldPct}</Text>
            {showYieldBar ? (
              <View style={styles.barTrack}>
                <View style={[styles.barFillTeal, { width: yieldBarWidth(yieldNum!) }]} />
              </View>
            ) : (
              <View style={[styles.barTrack, { marginTop: 6 }]} />
            )}
            <Text style={styles.metricCaption}>Yield</Text>
          </View>
        </View>

        <View style={styles.insightBox}>
          <Icon name="lightbulb-on-outline" size={22} color={GOLD} style={styles.insightIcon} />
          <Text style={styles.insightText}>{insight}</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 52,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: PRIMARY,
  },
  card: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 28,
    shadowColor: GOLD,
    shadowOpacity: 0.22,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
  },
  blob: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
  },
  blobGold: {
    top: -72,
    right: -72,
    backgroundColor: 'rgba(209, 161, 78, 0.12)',
  },
  metricsRow: {
    flexDirection: 'row',
    zIndex: 2,
    gap: 6,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 6,
  },
  safetyBig: {
    fontSize: 30,
    fontWeight: '700',
    color: GOLD,
    letterSpacing: -0.5,
  },
  priceRating: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  yieldText: {
    fontSize: 30,
    fontWeight: '700',
    color: TEAL,
    letterSpacing: -0.5,
  },
  barTrack: {
    marginTop: 6,
    width: '100%',
    maxWidth: 88,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  barFillGold: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: GOLD,
  },
  barFillTeal: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: TEAL,
  },
  metricCaption: {
    marginTop: 12,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  insightBox: {
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginTop: 36,
    padding: 20,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  insightIcon: {
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 21,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.82)',
  },
});

export default PropertyAiInsightsCard;

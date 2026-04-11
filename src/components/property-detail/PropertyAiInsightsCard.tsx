import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { buildAiInsightCopy, investmentScoreLabel } from '../../utils/propertyDisplay';

const PRIMARY = '#122A47';
const TEAL = '#008080';
const GOLD = '#C5A059';

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
  const insight = buildAiInsightCopy({ locality, city, description, aiSuggestedPrice, price });
  const priceLabelRaw = investmentScoreLabel(investmentScore);
  const priceLabel = priceLabelRaw === '—' ? 'Fair' : priceLabelRaw;

  const safetyMain =
    safetyScore != null && Number.isFinite(safetyScore) ? safetyScore.toFixed(1) : '—';
  const showSafetySuffix = safetyScore != null && Number.isFinite(safetyScore);

  const yieldPct =
    rentalYield != null && Number.isFinite(rentalYield)
      ? `${(rentalYield < 1 ? rentalYield * 100 : rentalYield).toFixed(1)}%`
      : '—';

  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>AI Insights</Text>
        <Icon name="creation" size={22} color={GOLD} />
      </View>

      <View style={styles.card}>
        <View style={[styles.blob, styles.blobGold]} />
        <View style={[styles.blob, styles.blobTeal]} />

        <View style={styles.metricsRow}>
          <View style={styles.metricCol}>
            <Text style={styles.safetyBig}>
              {safetyMain}
              {showSafetySuffix ? (
                <Text style={styles.safetySub}>/10</Text>
              ) : null}
            </Text>
            <Text style={styles.metricCaption}>Safety Score</Text>
          </View>
          <View style={[styles.metricCol, styles.metricBorder]}>
            <Text style={styles.priceRating}>{priceLabel}</Text>
            <Text style={styles.metricCaption}>Price Rating</Text>
          </View>
          <View style={styles.metricCol}>
            <Text style={styles.yieldText}>{yieldPct}</Text>
            <Text style={styles.metricCaption}>Rental Yield</Text>
          </View>
        </View>

        <View style={styles.insightRow}>
          <Icon name="lightbulb-on-outline" size={22} color={GOLD} />
          <Text style={styles.insightText}>{insight}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 48,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: PRIMARY,
  },
  card: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: PRIMARY,
    padding: 32,
    shadowColor: PRIMARY,
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  blob: {
    position: 'absolute',
    width: 192,
    height: 192,
    borderRadius: 999,
  },
  blobGold: {
    top: -64,
    right: -64,
    backgroundColor: 'rgba(197, 160, 89, 0.2)',
  },
  blobTeal: {
    bottom: -64,
    left: -64,
    backgroundColor: 'rgba(0, 128, 128, 0.12)',
  },
  metricsRow: {
    flexDirection: 'row',
    zIndex: 2,
    gap: 8,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  safetyBig: {
    fontSize: 30,
    fontWeight: '900',
    color: GOLD,
  },
  safetySub: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  priceRating: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  yieldText: {
    fontSize: 30,
    fontWeight: '900',
    color: TEAL,
  },
  metricCaption: {
    marginTop: 8,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  insightRow: {
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
});

export default PropertyAiInsightsCard;

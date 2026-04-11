import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { buildAiInsightCopy, investmentScoreLabel } from '../../utils/propertyDisplay';

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
  const priceLabel = investmentScoreLabel(investmentScore);
  const safety =
    safetyScore != null && Number.isFinite(safetyScore) ? safetyScore.toFixed(1) : '—';
  const yieldPct =
    rentalYield != null && Number.isFinite(rentalYield)
      ? `${(rentalYield < 1 ? rentalYield * 100 : rentalYield).toFixed(1)}%`
      : '—';

  return (
    <View className="mt-12">
      <View className="mb-5 flex-row items-center justify-between px-1">
        <Text className="text-xl font-extrabold tracking-tight text-primary">AI Insights</Text>
        <Icon name="creation" size={22} color="#C5A059" />
      </View>

      <View className="relative overflow-hidden rounded-2xl bg-primary p-8 shadow-2xl shadow-primary/20">
        <View className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-gold/20" />
        <View className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-brand-teal/10" />

        <View className="relative z-10 flex-row gap-4">
          <View className="flex-1 items-center">
            <Text className="text-3xl font-black text-brand-gold">
              {safety}
              <Text className="text-xs font-medium text-white/70">/10</Text>
            </Text>
            <Text className="mt-2 text-center text-[9px] font-black uppercase tracking-widest text-white/60">
              Safety Score
            </Text>
          </View>
          <View className="flex-1 items-center border-x border-white/10">
            <Text className="text-3xl font-black text-white">{priceLabel}</Text>
            <Text className="mt-2 text-center text-[9px] font-black uppercase tracking-widest text-white/60">
              Price Rating
            </Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-3xl font-black text-brand-teal">{yieldPct}</Text>
            <Text className="mt-2 text-center text-[9px] font-black uppercase tracking-widest text-white/60">
              Rental Yield
            </Text>
          </View>
        </View>

        <View className="relative z-10 mt-8 flex-row items-start gap-4 border-t border-white/10 pt-6">
          <Icon name="lightbulb-on-outline" size={22} color="#C5A059" />
          <Text className="flex-1 text-[13px] font-medium leading-relaxed text-white/90">{insight}</Text>
        </View>
      </View>
    </View>
  );
};

export default PropertyAiInsightsCard;

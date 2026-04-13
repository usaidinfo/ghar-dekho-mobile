import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { formatInrPrice } from '../../utils/homePropertyMappers';
import { PROPERTY_PLACEHOLDER_IMAGE } from '../../constants/images';

const PRIMARY = '#00152e';
const MUTED = '#44474d';

export interface ChatPropertyContextBarProps {
  title: string;
  price: number;
  listingType?: string | null;
  /** e.g. locality — optional second line */
  subtitle?: string | null;
  thumbnailUrl?: string | null;
  onViewListing: () => void;
}

const ChatPropertyContextBar: React.FC<ChatPropertyContextBarProps> = ({
  title,
  price,
  listingType,
  subtitle,
  thumbnailUrl,
  onViewListing,
}) => (
  <View style={styles.card}>
    <View style={styles.left}>
      <Image
        source={{
          uri: thumbnailUrl || PROPERTY_PLACEHOLDER_IMAGE,
        }}
        style={styles.thumb}
      />
      <View style={styles.textCol}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {formatInrPrice(price, listingType || 'BUY')}
          {subtitle ? ` • ${subtitle}` : ''}
        </Text>
      </View>
    </View>
    <TouchableOpacity style={styles.cta} onPress={onViewListing} activeOpacity={0.88}>
      <Text style={styles.ctaText}>View listing</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 22,
    marginBottom: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#f5f3f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  left: { flex: 1, flexDirection: 'row', alignItems: 'center', minWidth: 0, gap: 10 },
  thumb: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#e9e7ea' },
  textCol: { flex: 1, minWidth: 0 },
  title: { fontSize: 14, fontWeight: '700', color: PRIMARY },
  sub: { fontSize: 12, color: MUTED, marginTop: 2, fontWeight: '500' },
  cta: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  ctaText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
});

export default ChatPropertyContextBar;

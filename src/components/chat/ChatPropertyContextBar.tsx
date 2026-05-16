import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatInrPrice } from '../../utils/homePropertyMappers';
import { PROPERTY_PLACEHOLDER_IMAGE } from '../../constants/images';
import { CHAT } from './chatTheme';

export interface ChatPropertyContextBarProps {
  title: string;
  price: number;
  listingType?: string | null;
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
  <TouchableOpacity style={styles.card} onPress={onViewListing} activeOpacity={0.9}>
    <Image source={{ uri: thumbnailUrl || PROPERTY_PLACEHOLDER_IMAGE }} style={styles.thumb} />
    <View style={styles.textCol}>
      <Text style={styles.kicker}>Property chat</Text>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.sub} numberOfLines={1}>
        {formatInrPrice(price, listingType || 'BUY')}
        {subtitle ? ` · ${subtitle}` : ''}
      </Text>
    </View>
    <Icon name="chevron-right" size={22} color={CHAT.muted} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 10,
    marginTop: 6,
    marginBottom: 4,
    padding: 10,
    borderRadius: 12,
    backgroundColor: CHAT.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CHAT.separator,
  },
  thumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: CHAT.surfaceAlt },
  textCol: { flex: 1, minWidth: 0 },
  kicker: {
    fontSize: 10,
    fontWeight: '700',
    color: CHAT.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  title: { fontSize: 14, fontWeight: '700', color: CHAT.primary },
  sub: { fontSize: 12, color: CHAT.muted, marginTop: 2 },
});

export default ChatPropertyContextBar;

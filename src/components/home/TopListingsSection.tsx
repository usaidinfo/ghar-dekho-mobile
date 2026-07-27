/**
 * @file TopListingsSection.tsx
 * @description "Top Listings in [City]" section with horizontal scroll.
 * Native Advanced ads are interleaved in the swipe list for free users.
 */

import React, { useMemo, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TopListingItem from './TopListingItem';
import AppNativeAdvancedAd from '../ads/AppNativeAdvancedAd';
import { withNativeAds } from '../../utils/withNativeAds';
import type { TopListing } from '../../types/property.types';

interface TopListingsSectionProps {
  data: TopListing[];
  city: string;
  onItemPress?: (listing: TopListing) => void;
  onViewAll?: () => void;
}

const TopListingsSection: React.FC<TopListingsSectionProps> = ({
  data,
  city,
  onItemPress,
  onViewAll,
}) => {
  const listRef = useRef<FlatList>(null);
  const rows = useMemo(() => withNativeAds(data, 3), [data]);

  const scrollLeft = () => listRef.current?.scrollToOffset({ offset: 0, animated: true });
  const scrollRight = () => listRef.current?.scrollToEnd({ animated: true });

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{`Top Listings in ${city}`}</Text>
          <Text style={styles.subtitle}>Most searched high-demand buildings</Text>
        </View>
        <View style={styles.navArrows}>
          <TouchableOpacity style={styles.arrowBtn} onPress={scrollLeft} activeOpacity={0.8}>
            <Icon name="chevron-left" size={20} color="#122A47" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.arrowBtn} onPress={scrollRight} activeOpacity={0.8}>
            <Icon name="chevron-right" size={20} color="#122A47" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={rows}
        keyExtractor={row => row.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 14 }}
        renderItem={({ item: row }) =>
          row.kind === 'ad' ? (
            <AppNativeAdvancedAd variant="topListing" />
          ) : (
            <TopListingItem listing={row.item} onPress={() => onItemPress?.(row.item)} />
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 32 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  titleBlock: { flex: 1 },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#122A47',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    color: '#777779',
    marginTop: 2,
  },
  navArrows: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  arrowBtn: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: '#E9E7EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TopListingsSection;

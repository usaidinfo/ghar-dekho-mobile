import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import type { Property } from '../../types/property.types';
import { toggleWishlist } from '../../services/wishlist.service';
import { useAuthStore } from '../../stores/auth.store';
import { getApiErrorMessage } from '../../services/auth.service';

interface PropertyCardProps {
  property: Property;
  onPress?: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onPress }) => {
  const myId = useAuthStore(s => s.user?.id);
  const [isFavorited, setIsFavorited] = useState(false);
  const [busy, setBusy] = useState(false);

  const onToggleFav = async () => {
    if (!myId) {
      Toast.show({ type: 'info', text1: 'Please sign in to save homes' });
      return;
    }
    if (busy) return;
    setBusy(true);
    const prev = isFavorited;
    setIsFavorited(!prev);
    try {
      const next = await toggleWishlist(property.id, prev);
      setIsFavorited(next);
    } catch (e) {
      setIsFavorited(prev);
      Toast.show({ type: 'error', text1: getApiErrorMessage(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: property.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {property.isVerified && (
          <View style={styles.verifiedBadge}>
            <Icon name="verified" size={12} color="#ffffff" />
            <Text style={styles.verifiedText}>VERIFIED</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.favoriteButton, busy && { opacity: 0.6 }]}
          onPress={e => {
            e?.stopPropagation?.();
            void onToggleFav();
          }}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          disabled={busy}
        >
          <Icon
            name={isFavorited ? 'favorite' : 'favorite-border'}
            size={20}
            color={isFavorited ? '#EF4444' : '#ffffff'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{property.priceLabel}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{property.propertyType.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>

        <View style={styles.locationRow}>
          <Icon name="location-on" size={14} color="#D1A14E" />
          <Text style={styles.location} numberOfLines={1}>
            {property.locality}, {property.city}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 300,
    backgroundColor: '#faf9fc',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(209,161,78,0.9)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
  favoriteButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: '#122A47',
    letterSpacing: -0.5,
  },
  typeBadge: {
    backgroundColor: 'rgba(209,161,78,0.12)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D1A14E',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1b1c1e',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  location: {
    fontSize: 12,
    color: '#777779',
    flex: 1,
  },
});

export default PropertyCard;

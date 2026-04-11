import React, { useMemo } from 'react';
import { View, Text, Pressable, Image, Linking, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NearbyEssentialItem } from '../../types/property-detail.types';
import { mciForEssential } from './essentialIcons';

const PRIMARY = '#122A47';
const TEAL = '#008080';
const MUTED = '#4A5568';
const SURFACE = '#F1F3F5';
const OUTLINE = 'rgba(203, 213, 224, 0.45)';

const FALLBACK_MAP =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDYVMhgGmclOF3RflYgX54d8A7s05fSLKRsvg0RXIYEZxox517NWKfEClYPc2NUeQf-aHicK9Z4n3cP0JVM-sTTQ2IxiDYmo4DloDngPWG0CCNtbs1JX0k87MHhXHLDDRtcg9qNlaLH9pU5mjlgM3RjyPgJfzzTJwJEnt0O79Bye5QROmNxS4H9f9Yq5nrbv7vTcRa9snNUHif5AnJqHACtxJcMVanQUQCebHEDiUIZQIyo89ymnNMXAgGPsFTATXcv5kZQjWqQSk6Z';

const FALLBACK_ESSENTIALS: NearbyEssentialItem[] = [
  { id: 'demo-1', type: 'SCHOOL', name: 'Greenwood International School', distance: 1.2 },
  { id: 'demo-2', type: 'HOSPITAL', name: 'Manipal Hospital', distance: 2.5 },
  { id: 'demo-3', type: 'MALL', name: 'Nexus Shantiniketan Mall', distance: 0.8 },
];

interface PropertyLocationLegalSectionProps {
  latitude: number;
  longitude: number;
  isRERAApproved?: boolean;
  reraNumber?: string | null;
  nearbyEssentials?: NearbyEssentialItem[];
}

function osmStaticMapUrl(lat: number, lng: number): string {
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=15&size=600x320&maptype=mapnik`;
}

const PropertyLocationLegalSection: React.FC<PropertyLocationLegalSectionProps> = ({
  latitude,
  longitude,
  isRERAApproved,
  reraNumber,
  nearbyEssentials,
}) => {
  const mapUri = useMemo(() => {
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return osmStaticMapUrl(latitude, longitude);
    }
    return FALLBACK_MAP;
  }, [latitude, longitude]);

  const openMaps = () => {
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      const q = `${latitude},${longitude}`;
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`);
    } else {
      Linking.openURL('https://www.google.com/maps');
    }
  };

  const essentials =
    nearbyEssentials && nearbyEssentials.length > 0 ? nearbyEssentials : FALLBACK_ESSENTIALS;

  const reraLine =
    isRERAApproved && reraNumber?.trim()
      ? reraNumber.trim()
      : 'Registration details available from owner / agent';

  return (
    <View style={styles.section}>
      <View style={styles.headRow}>
        <Text style={styles.headTitle}>Location & Legal</Text>
        <Pressable onPress={openMaps} hitSlop={8}>
          <Text style={styles.mapLink}>View Map</Text>
        </Pressable>
      </View>

      <Pressable onPress={openMaps} style={styles.mapWrap}>
        <Image source={{ uri: mapUri }} style={styles.mapImage} resizeMode="cover" />
        <View style={styles.mapGrey} pointerEvents="none" />
        <View style={styles.pinWrap}>
          <View style={styles.pinCircle}>
            <Icon name="map-marker" size={32} color="#FFFFFF" />
          </View>
        </View>
      </Pressable>

      <View style={styles.reraCard}>
        <View style={styles.reraTextBlock}>
          <Text style={styles.reraTitle}>{isRERAApproved ? 'RERA Approved' : 'RERA & compliance'}</Text>
          <Text style={styles.reraSub} numberOfLines={3}>
            {reraLine}
          </Text>
        </View>
        <Icon name="shield-check" size={36} color={TEAL} />
      </View>

      <View style={styles.essentialsCard}>
        <Text style={styles.essentialsTitle}>Nearby Essentials</Text>
        <View style={styles.essentialsList}>
          {essentials.map(item => (
            <View key={item.id} style={styles.essentialRow}>
              <View style={styles.essentialLeft}>
                <View style={styles.iconBubble}>
                  <Icon name={mciForEssential(item.type)} size={22} color={PRIMARY} />
                </View>
                <Text style={styles.essentialName} numberOfLines={2}>
                  {item.name}
                </Text>
              </View>
              <Text style={styles.essentialDist}>{item.distance.toFixed(1)} km</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 48,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  headTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: PRIMARY,
  },
  mapLink: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: TEAL,
    borderBottomWidth: 2,
    borderBottomColor: TEAL,
    paddingBottom: 4,
  },
  mapWrap: {
    position: 'relative',
    width: '100%',
    height: 224,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
    backgroundColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  mapImage: {
    ...StyleSheet.absoluteFillObject,
  },
  mapGrey: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  pinWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinCircle: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  reraCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    marginBottom: 24,
    borderRadius: 24,
    backgroundColor: SURFACE,
    borderLeftWidth: 8,
    borderLeftColor: TEAL,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  reraTextBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  reraTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: PRIMARY,
  },
  reraSub: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: MUTED,
  },
  essentialsCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: OUTLINE,
    backgroundColor: SURFACE,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  essentialsTitle: {
    marginBottom: 24,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: MUTED,
  },
  essentialsList: {
    gap: 20,
  },
  essentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  essentialLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minWidth: 0,
  },
  iconBubble: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(18, 42, 71, 0.06)',
  },
  essentialName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY,
  },
  essentialDist: {
    fontSize: 12,
    fontWeight: '900',
    color: MUTED,
  },
});

export default PropertyLocationLegalSection;

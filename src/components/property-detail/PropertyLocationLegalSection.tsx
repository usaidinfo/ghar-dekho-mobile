import React, { useMemo } from 'react';
import { View, Text, Pressable, Image, Linking, StyleSheet, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NearbyEssentialItem } from '../../types/property-detail.types';
import { mciForEssential } from './essentialIcons';

const PRIMARY = '#122A47';
const GOLD = '#D1A14E';
const TEAL = '#0D9488';
const MUTED = '#64748B';
const OUTLINE = '#E2E8F0';

const FALLBACK_MAP =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDYVMhgGmclOF3RflYgX54d8A7s05fSLKRsvg0RXIYEZxox517NWKfEClYPc2NUeQf-aHicK9Z4n3cP0JVM-sTTQ2IxiDYmo4DloDngPWG0CCNtbs1JX0k87MHhXHLDDRtcg9qNlaLH9pU5mjlgM3RjyPgJfzzTJwJEnt0O79Bye5QROmNxS4H9f9Yq5nrbv7vTcRa9snNUHif5AnJqHACtxJcMVanQUQCebHEDiUIZQIyo89ymnNMXAgGPsFTATXcv5kZQjWqQSk6Z';

const FALLBACK_ESSENTIALS: NearbyEssentialItem[] = [
  { id: 'demo-1', type: 'SCHOOL', name: 'Greenwood International', distance: 1.2 },
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
  const { width } = useWindowDimensions();
  const mapH = width < 360 ? 200 : width < 400 ? 240 : 256;

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
      ? `Reg No: ${reraNumber.trim()}`
      : 'Registration details available from owner / agent';

  return (
    <View style={styles.section}>
      <View style={styles.headRow}>
        <Text style={styles.headTitle}>Location & Legal</Text>
        <Pressable onPress={openMaps} hitSlop={10}>
          <Text style={styles.mapLink}>Open Maps</Text>
        </Pressable>
      </View>

      <Pressable onPress={openMaps} style={[styles.mapWrap, { height: mapH }]}>
        <Image source={{ uri: mapUri }} style={styles.mapImage} resizeMode="cover" />
        <View style={styles.mapGrey} pointerEvents="none" />
        <View style={styles.pinWrap} pointerEvents="none">
          <View style={styles.pinHalo} />
          <View style={styles.pinCircle}>
            <Icon name="map-marker" size={28} color="#FFFFFF" />
          </View>
        </View>
      </Pressable>

      <View style={styles.reraCard}>
        <View style={styles.reraTextBlock}>
          <Text style={styles.reraTitle}>{isRERAApproved ? 'RERA Certified' : 'RERA & compliance'}</Text>
          <Text style={styles.reraSub} numberOfLines={3}>
            {reraLine}
          </Text>
        </View>
        <View style={styles.reraIconWrap}>
          <Icon name="check-decagram" size={28} color={TEAL} />
        </View>
      </View>

      <View style={styles.essentialsCard}>
        <Text style={styles.essentialsTitle}>Nearby Lifestyle Essentials</Text>
        <View style={styles.essentialsList}>
          {essentials.map(item => (
            <View key={item.id} style={styles.essentialRow}>
              <View style={styles.essentialLeft}>
                <View style={styles.iconBubble}>
                  <Icon name={mciForEssential(item.type)} size={22} color="rgba(18, 42, 71, 0.6)" />
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
    marginTop: 56,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 26,
    paddingHorizontal: 4,
  },
  headTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: PRIMARY,
    flex: 1,
    marginRight: 12,
  },
  mapLink: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: GOLD,
    borderBottomWidth: 2,
    borderBottomColor: GOLD,
    paddingBottom: 4,
  },
  mapWrap: {
    position: 'relative',
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 28,
    backgroundColor: '#e2e8f0',
    borderWidth: 1,
    borderColor: OUTLINE,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  mapImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.85,
  },
  mapGrey: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248,250,252,0.45)',
  },
  pinWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinHalo: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: 'rgba(18, 42, 71, 0.18)',
  },
  pinCircle: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
    padding: 22,
    marginBottom: 22,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: OUTLINE,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  reraTextBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  reraTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: PRIMARY,
  },
  reraSub: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: MUTED,
  },
  reraIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  essentialsCard: {
    borderRadius: 28,
    backgroundColor: 'rgba(248, 250, 252, 0.85)',
    paddingVertical: 28,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
  },
  essentialsTitle: {
    marginBottom: 26,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3.2,
    textTransform: 'uppercase',
    color: MUTED,
    textAlign: 'center',
  },
  essentialsList: {
    gap: 26,
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
    gap: 18,
    minWidth: 0,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  essentialName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY,
  },
  essentialDist: {
    fontSize: 11,
    fontWeight: '800',
    color: MUTED,
    backgroundColor: 'rgba(148, 163, 184, 0.28)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default PropertyLocationLegalSection;

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

import { useUserLocation } from '../../hooks/useUserLocation';
import { useLocationStore } from '../../stores/location.store';

interface NominatimPlace {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state_district?: string;
    state?: string;
    country?: string;
    suburb?: string;
    neighbourhood?: string;
  };
}

interface LocationSuggestion {
  id: string;
  primary: string;
  secondary: string;
  lat: number;
  lng: number;
}

async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query,
  )}&addressdetails=1&limit=8&countrycodes=in`;

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'GharDekhoMobile/1.0 (listing; support@ghardekho.com)',
    },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as NominatimPlace[];
  if (!Array.isArray(data)) return [];

  return data.map(place => {
    const a = place.address ?? {};
    const city = a.city || a.town || a.village || a.county || a.state_district || '';
    const state = a.state || '';
    const parts = place.display_name.split(', ');
    const primary = parts[0] ?? place.display_name;
    const secondary = [city, state].filter(Boolean).join(', ') || parts.slice(1, 3).join(', ');

    return {
      id: String(place.place_id),
      primary,
      secondary,
      lat: Number(place.lat),
      lng: Number(place.lon),
    };
  });
}

const NAVY = '#122A47';
const GOLD = '#D1A14E';
const SURFACE = '#FAF9FC';
const SURFACE_DIM = '#F5F3F6';
const OUTLINE = '#74777E';
const OUTLINE_VARIANT = '#C4C6CE';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const LocationSearchModal: React.FC<Props> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const setLocation = useLocationStore(s => s.setLocation);
  const { detect, loading: detectingGps } = useUserLocation();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 350);
    } else {
      setQuery('');
      setSuggestions([]);
    }
  }, [visible]);

  const onChangeText = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = text.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const results = await searchLocations(trimmed);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 400);
  }, []);

  const onSelectSuggestion = useCallback(
    (item: LocationSuggestion) => {
      Keyboard.dismiss();
      const label = item.secondary
        ? `${item.primary}, ${item.secondary}`
        : item.primary;
      setLocation(item.lat, item.lng, label);
      Toast.show({ type: 'success', text1: `Location set to ${item.primary}` });
      onClose();
    },
    [setLocation, onClose],
  );

  const onUseMyLocation = useCallback(async () => {
    Keyboard.dismiss();
    const loc = await detect();
    if (loc) {
      setLocation(loc.latitude, loc.longitude, loc.name);
      Toast.show({ type: 'success', text1: `Location set to ${loc.name}` });
      onClose();
    } else {
      Toast.show({ type: 'error', text1: 'Could not detect your location' });
    }
  }, [detect, setLocation, onClose]);

  const renderSuggestion = useCallback(
    ({ item }: { item: LocationSuggestion }) => (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.suggestionRow}
        onPress={() => onSelectSuggestion(item)}
      >
        <View style={styles.suggestionIconCircle}>
          <Icon name="map-marker" size={20} color={GOLD} />
        </View>
        <View style={styles.suggestionText}>
          <Text style={styles.suggestionPrimary} numberOfLines={1}>
            {item.primary}
          </Text>
          {item.secondary ? (
            <Text style={styles.suggestionSecondary} numberOfLines={1}>
              {item.secondary}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    ),
    [onSelectSuggestion],
  );

  const busy = detectingGps;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.dimArea}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {/* Handle bar */}
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Find Your Heritage</Text>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={styles.closeBtn}
            >
              <Icon name="close" size={22} color={NAVY} />
            </TouchableOpacity>
          </View>

          {/* Search input */}
          <View style={[styles.searchWrap, query.length > 0 && styles.searchWrapFocused]}>
            <Icon name="magnify" size={22} color={GOLD} style={styles.searchIcon} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Search neighborhood or city..."
              placeholderTextColor={OUTLINE}
              value={query}
              onChangeText={onChangeText}
              returnKeyType="search"
              autoCorrect={false}
              editable={!busy}
            />
            {query.length > 0 ? (
              <TouchableOpacity
                onPress={() => {
                  setQuery('');
                  setSuggestions([]);
                }}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="close-circle" size={18} color={OUTLINE_VARIANT} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Use My Location */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.gpsBtn}
            onPress={onUseMyLocation}
            disabled={busy}
          >
            {detectingGps ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name="crosshairs-gps" size={18} color="#fff" />
                <Text style={styles.gpsBtnText}>Use My Location</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Suggestions list */}
          {loadingSuggestions ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={NAVY} size="small" />
            </View>
          ) : suggestions.length > 0 ? (
            <>
              <Text style={styles.sectionLabel}>Suggested Collections</Text>
              <FlatList
                data={suggestions}
                keyExtractor={item => item.id}
                renderItem={renderSuggestion}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={styles.list}
              />
            </>
          ) : query.trim().length >= 2 && !loadingSuggestions ? (
            <View style={styles.emptyWrap}>
              <Icon name="map-search-outline" size={48} color={OUTLINE_VARIANT} />
              <Text style={styles.emptyText}>No locations found</Text>
              <Text style={styles.emptySubtext}>Try a different search term</Text>
            </View>
          ) : null}

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dimArea: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27,28,30,0.3)',
  },
  sheet: {
    backgroundColor: SURFACE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '60%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: -4 },
      },
      android: { elevation: 24 },
    }),
  },
  handleWrap: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: OUTLINE_VARIANT,
    opacity: 0.4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: NAVY,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: SURFACE_DIM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
    height: 56,
    borderRadius: 16,
    backgroundColor: SURFACE_DIM,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: 16,
  },
  searchWrapFocused: {
    borderColor: `${GOLD}66`,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: GOLD,
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 4 },
    }),
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: NAVY,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 24,
    marginBottom: 20,
    height: 52,
    borderRadius: 999,
    backgroundColor: NAVY,
  },
  gpsBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: OUTLINE,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginHorizontal: 26,
    marginBottom: 10,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 16,
    gap: 16,
  },
  suggestionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: SURFACE_DIM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionText: {
    flex: 1,
  },
  suggestionPrimary: {
    fontSize: 15,
    fontWeight: '700',
    color: NAVY,
  },
  suggestionSecondary: {
    fontSize: 12,
    fontWeight: '500',
    color: OUTLINE,
    marginTop: 2,
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyWrap: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: NAVY,
  },
  emptySubtext: {
    fontSize: 13,
    color: OUTLINE,
  },
});

export default LocationSearchModal;

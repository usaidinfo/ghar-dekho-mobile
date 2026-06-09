import { useCallback, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { reverseGeocode } from '../utils/reverseGeocode';

export interface DetectedLocation {
  latitude: number;
  longitude: number;
  name: string;
}

async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Location Permission',
      message: 'Ghar Dekho needs your location to show nearby properties.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

function getCurrentPosition(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 60_000 },
    );
  });
}

export function useUserLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detect = useCallback(async (): Promise<DetectedLocation | null> => {
    setLoading(true);
    setError(null);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setError('Location permission denied');
        return null;
      }

      const coords = await getCurrentPosition();

      let name = 'Your Location';
      try {
        const geo = await reverseGeocode(coords.latitude, coords.longitude);
        name =
          geo.locality !== geo.city
            ? `${geo.locality}, ${geo.city}`
            : geo.city;
      } catch {
        // keep fallback name
      }

      return { latitude: coords.latitude, longitude: coords.longitude, name };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not detect location';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { detect, loading, error };
}

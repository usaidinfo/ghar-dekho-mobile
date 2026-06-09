import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  hasHydrated: boolean;
  setLocation: (lat: number, lng: number, name: string) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    set => ({
      latitude: null,
      longitude: null,
      locationName: null,
      hasHydrated: false,
      setLocation: (lat, lng, name) =>
        set({ latitude: lat, longitude: lng, locationName: name }),
      clearLocation: () =>
        set({ latitude: null, longitude: null, locationName: null }),
    }),
    {
      name: 'ghardekho-location',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: s => ({
        latitude: s.latitude,
        longitude: s.longitude,
        locationName: s.locationName,
      }),
      onRehydrateStorage: () => () => {
        useLocationStore.setState({ hasHydrated: true });
      },
    },
  ),
);

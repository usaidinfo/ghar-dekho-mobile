import type { EssentialType } from '../../types/property-detail.types';

export function mciForEssential(type: EssentialType): string {
  const t = String(type).toUpperCase();
  const map: Record<string, string> = {
    SCHOOL: 'school-outline',
    COLLEGE: 'school',
    HOSPITAL: 'hospital-building',
    CLINIC: 'medical-bag',
    MARKET: 'storefront-outline',
    MALL: 'shopping',
    RESTAURANT: 'silverware-fork-knife',
    ATM: 'cash-multiple',
    BANK: 'bank-outline',
    METRO_STATION: 'train',
    BUS_STOP: 'bus-stop',
    RAILWAY_STATION: 'train-car',
    AIRPORT: 'airplane',
    PHARMACY: 'pill',
    GYM: 'dumbbell',
    PARK: 'tree-outline',
  };
  return map[t] || 'map-marker-outline';
}

/** Map amenity name / category → MaterialCommunityIcons name */
export function mciForAmenityName(name: string, category?: string): string {
  const n = name.toLowerCase();
  if (n.includes('gym') || n.includes('fitness')) return 'dumbbell';
  if (n.includes('parking') || (n.includes('park') && n.includes('car'))) return 'parking';
  if (n.includes('pool') || n.includes('swim')) return 'pool';
  if (n.includes('security') || n.includes('guard')) return 'shield-home';
  if (n.includes('lift') || n.includes('elevator')) return 'elevator';
  if (n.includes('club')) return 'home-group';
  if (n.includes('power') || n.includes('backup')) return 'flash';
  if (n.includes('wifi') || n.includes('internet')) return 'wifi';
  if (n.includes('garden') || n.includes('terrace')) return 'flower';
  const c = (category || '').toUpperCase();
  if (c === 'PARKING') return 'parking';
  if (c === 'SECURITY') return 'shield-check';
  if (c === 'HEALTH') return 'run';
  if (c === 'LIFESTYLE') return 'spa';
  return 'check-circle-outline';
}

export type VisitTimeSlot = { id: string; label: string; hours24: number; minutes: number };

export const DEFAULT_TIME_SLOTS: VisitTimeSlot[] = [
  { id: '09:00', label: '9:00 AM', hours24: 9, minutes: 0 },
  { id: '10:30', label: '10:30 AM', hours24: 10, minutes: 30 },
  { id: '12:00', label: '12:00 PM', hours24: 12, minutes: 0 },
  { id: '14:30', label: '2:30 PM', hours24: 14, minutes: 30 },
  { id: '17:00', label: '5:00 PM', hours24: 17, minutes: 0 },
];

export function combineLocalDateTimeISO(dateStr: string, hours24: number, minutes: number): string {
  // dateStr: YYYY-MM-DD in local tz
  const [y, m, d] = dateStr.split('-').map(n => Number(n));
  const dt = new Date(y, (m || 1) - 1, d || 1, hours24, minutes, 0, 0);
  return dt.toISOString();
}


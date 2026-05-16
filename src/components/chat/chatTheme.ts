/** Shared chat palette — matches Ghar Dekho app theme. */
export const CHAT = {
  primary: '#00152e',
  primaryEnd: '#122a47',
  teal: '#509d9b',
  gold: '#7d5705',
  goldLight: '#d1a14e',
  muted: '#667085',
  text: '#1b1c1e',
  surface: '#ffffff',
  surfaceAlt: '#f0f2f6',
  composerBg: '#f7f8fa',
  wallpaper: '#e9edf3',
  bubbleOut: '#00152e',
  bubbleIn: '#ffffff',
  bubbleInBorder: 'rgba(196,198,206,0.45)',
  headerBg: '#ffffff',
  separator: 'rgba(196,198,206,0.35)',
  inputBg: '#ffffff',
  inputBorder: 'rgba(196,198,206,0.55)',
} as const;

export const CHAT_BUBBLE = {
  radiusLg: 18,
  radiusSm: 4,
  maxWidthPct: 0.78,
  padH: 10,
  padV: 6,
  groupGap: 2,
  blockGap: 6,
} as const;

/**
 * API base URL for the Ghar Dekho backend.
 * Set API_BASE_URL in .env (react-native-config). Rebuild the native app after changing .env.
 *
 * Android (emulator or USB debugging), recommended:
 *   `adb reverse tcp:<port> tcp:<port>` then `http://127.0.0.1:<port>` (see `npm run android`).
 * Alternatives: emulator `http://10.0.2.2:<port>`; Genymotion `http://10.0.3.2:<port>`.
 * Physical phone on Wi‑Fi only: `http://<PC-LAN-IPv4>:<port>` (backend bound to 0.0.0.0).
 * iOS simulator: http://localhost:<port>
 */
import { Platform } from 'react-native';
import Config from 'react-native-config';

/** Pair with `adb reverse tcp:5000 tcp:5000` (see `npm run android`). */
const FALLBACK_ANDROID = 'http://127.0.0.1:5000';
const FALLBACK_IOS = 'http://localhost:5000';

const raw = Config.API_BASE_URL?.trim();

export const API_BASE_URL =
  raw || (Platform.OS === 'android' ? FALLBACK_ANDROID : FALLBACK_IOS);

/**
 * Socket base URL.
 *
 * Production note: do NOT host Socket.IO on Vercel serverless.
 * Deploy the backend (or at least the socket server) on a long-running host
 * (Render/Fly/Railway/VM), and set CHAT_SOCKET_URL to that origin.
 */
const rawSocket = Config.CHAT_SOCKET_URL?.trim();
export const CHAT_SOCKET_URL = rawSocket || API_BASE_URL;

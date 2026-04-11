/**
 * API base URL for the Ghar Dekho backend.
 * Set API_BASE_URL in .env (react-native-config). Rebuild native app after changing .env.
 *
 * - Android emulator: http://10.0.2.2:5000 (maps to host machine localhost)
 * - iOS simulator: http://localhost:5000
 * - Physical device: http://<your-LAN-IP>:5000
 */
import { Platform } from 'react-native';
import Config from 'react-native-config';

const FALLBACK_ANDROID = 'http://10.0.2.2:5000';
const FALLBACK_IOS = 'http://localhost:5000';

const raw = Config.API_BASE_URL?.trim();

export const API_BASE_URL =
  raw || (Platform.OS === 'android' ? FALLBACK_ANDROID : FALLBACK_IOS);

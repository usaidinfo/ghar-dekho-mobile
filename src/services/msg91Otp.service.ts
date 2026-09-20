import { OTPWidget } from '@msg91comm/sendotp-react-native';
import { httpClient } from '../api/httpClient';
import type { ApiSuccess } from '../types/api.types';

type Msg91WidgetConfig = {
  widgetId: string;
  tokenAuth: string;
  widgetName?: string | null;
  channel?: string;
};

let initPromise: Promise<boolean> | null = null;
let initialized = false;
/** MSG91 returns reqId in the `message` field on successful send/retry. */
let lastReqId: string | null = null;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function pickString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number') return String(value);
  }
  return null;
}

/** MSG91 wants digits with country code, no '+': 919876543210 */
export function toMsg91Phone(phone: string): string {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function getLastMsg91ReqId(): string | null {
  return lastReqId;
}

async function fetchWidgetConfig(): Promise<Msg91WidgetConfig> {
  const { data } = await httpClient.get<ApiSuccess<Msg91WidgetConfig>>(
    '/api/auth/msg91-widget-config',
  );
  if (!data.success || !data.data?.widgetId || !data.data?.tokenAuth) {
    throw new Error(data.message || 'MSG91 widget is not configured on the server');
  }
  return data.data;
}

export async function ensureMsg91WidgetReady(): Promise<boolean> {
  if (initialized) return true;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const config = await fetchWidgetConfig();
    await OTPWidget.initializeWidget(config.widgetId, config.tokenAuth);
    initialized = true;
    return true;
  })().catch(err => {
    initPromise = null;
    initialized = false;
    throw err;
  });

  return initPromise;
}

function extractReqId(response: unknown): string | null {
  const data = asRecord(response);
  const nested = asRecord(data.data);
  // Official MSG91 widget behavior: on success, `message` IS the reqId.
  if (String(data.type || '').toLowerCase() === 'success') {
    return (
      pickString(data, ['reqId', 'requestId', 'id', 'message']) ||
      pickString(nested, ['reqId', 'requestId', 'id', 'message'])
    );
  }
  return (
    pickString(data, ['reqId', 'requestId', 'id']) ||
    pickString(nested, ['reqId', 'requestId', 'id'])
  );
}

export async function sendWhatsAppOtp(phone: string): Promise<{ requestId: string }> {
  await ensureMsg91WidgetReady();
  const identifier = toMsg91Phone(phone);
  if (identifier.length < 12) {
    throw new Error('Enter a valid 10-digit phone number');
  }

  const response = await OTPWidget.sendOTP({ identifier });
  if (__DEV__) {
    console.log('[msg91] sendOTP response', response);
  }

  const data = asRecord(response);
  const message = pickString(data, ['message', 'error', 'msg']) || '';
  const type = String(data.type || '').toLowerCase();

  if (type === 'error' || data.success === false) {
    if (/authentication/i.test(message)) {
      throw new Error(
        'MSG91 Authentication failure: set MSG91_TOKEN_AUTH to the widget Token Auth from MSG91 dashboard (not Auth Key).',
      );
    }
    throw new Error(message || 'Failed to send WhatsApp OTP');
  }

  const requestId = extractReqId(response);
  if (!requestId) {
    throw new Error(message || 'Failed to send WhatsApp OTP (missing reqId)');
  }

  lastReqId = requestId;
  return { requestId };
}

export async function verifyWhatsAppOtp(
  otp: string,
  requestId?: string | null,
): Promise<{ accessToken: string }> {
  await ensureMsg91WidgetReady();
  if (!otp || otp.trim().length < 4) {
    throw new Error('Enter the OTP from WhatsApp');
  }

  const reqId = (requestId || lastReqId || '').trim();
  if (!reqId) {
    throw new Error('OTP session expired. Please send the WhatsApp OTP again.');
  }

  const response = await OTPWidget.verifyOTP({
    reqId,
    otp: otp.trim(),
  });
  if (__DEV__) {
    console.log('[msg91] verifyOTP response', response);
  }

  const data = asRecord(response);
  const nested = asRecord(data.data);
  const type = String(data.type || '').toLowerCase();
  const message =
    pickString(data, ['message', 'error']) ||
    pickString(nested, ['message', 'error']) ||
    '';

  if (type === 'error' || data.success === false) {
    throw new Error(message || 'Invalid WhatsApp OTP');
  }

  // MSG91 often returns the access token in `access-token` or `message`.
  const accessToken =
    pickString(data, ['access-token', 'accessToken', 'access_token', 'token']) ||
    pickString(nested, ['access-token', 'accessToken', 'access_token', 'token']) ||
    (type === 'success' ? pickString(data, ['message']) : null);

  if (!accessToken) {
    throw new Error(message || 'WhatsApp OTP verified but no access token returned');
  }

  lastReqId = null;
  return { accessToken };
}

export async function retryWhatsAppOtp(requestId?: string | null): Promise<void> {
  await ensureMsg91WidgetReady();
  const reqId = (requestId || lastReqId || '').trim();
  if (!reqId) {
    throw new Error('OTP session expired. Please send the WhatsApp OTP again.');
  }
  // 12 = WhatsApp channel per MSG91 docs
  const response = await OTPWidget.retryOTP({
    reqId,
    retryChannel: 12,
  });
  const nextId = extractReqId(response);
  if (nextId) lastReqId = nextId;
}

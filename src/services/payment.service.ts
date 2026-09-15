import axios from 'axios';
import { httpClient } from '../api/httpClient';
import type { ApiSuccess } from '../types/api.types';
import type { MembershipAccountType, MembershipPlanTier } from '../types/membership.types';
import type { UserMembership } from '../types/user.types';

export type MembershipPaymentMode = 'activate' | 'renew' | 'upgrade';

export interface CreateMembershipOrderPayload {
  mode: MembershipPaymentMode;
  accountType?: MembershipAccountType;
  planTier?: MembershipPlanTier;
}

export interface PayUCheckoutParams {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  hash: string;
  udf1: string;
  udf2: string;
  udf3: string;
  udf4: string;
  udf5: string;
  service_provider?: string;
}

export interface MembershipPaymentOrder {
  paymentId: string;
  txnid: string;
  orderId: string;
  amount: string;
  amountPaise: number;
  currency: string;
  key: string;
  keyId: string;
  hash: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  udf1: string;
  udf2: string;
  udf3: string;
  udf4: string;
  udf5: string;
  paymentUrl: string;
  /** Tokenized path to open checkout in Chrome Custom Tabs (Android). */
  launchToken?: string;
  launchPath?: string;
  provider: 'PAYU';
  environment: 'test' | 'live';
  planName: string;
  planDays: number;
  priceInr: number;
  mode: MembershipPaymentMode;
  accountType: MembershipAccountType;
  planTier: MembershipPlanTier;
  payuParams: PayUCheckoutParams;
}

export interface VerifyMembershipPaymentPayload {
  paymentId: string;
  txnid: string;
  status: string;
  hash: string;
  amount: string | number;
  mihpayid?: string;
  productinfo?: string;
  firstname?: string;
  email?: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}

function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (err.message) return err.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export async function createMembershipOrder(
  payload: CreateMembershipOrderPayload,
): Promise<MembershipPaymentOrder> {
  try {
    const { data } = await httpClient.post<ApiSuccess<MembershipPaymentOrder>>(
      '/api/payments/membership/create-order',
      payload,
    );
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to create payment order');
    }
    return data.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err, 'Failed to create payment order'));
  }
}

export async function verifyMembershipPayment(
  payload: VerifyMembershipPaymentPayload,
): Promise<UserMembership> {
  try {
    const { data } = await httpClient.post<ApiSuccess<UserMembership>>(
      '/api/payments/membership/verify',
      payload,
    );
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to verify payment');
    }
    return data.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err, 'Failed to verify payment'));
  }
}

/** CheckoutPro dynamic hash — salt stays on backend. */
export async function generatePayUHash(params: {
  hashString: string;
  postSalt?: string;
}): Promise<string> {
  try {
    const { data } = await httpClient.post<ApiSuccess<{ hash: string }>>(
      '/api/payments/payu/hash',
      {
        hashString: params.hashString,
        postSalt: params.postSalt ?? '',
      },
    );
    if (!data.success || !data.data?.hash) {
      throw new Error(data.message || 'Failed to generate PayU hash');
    }
    return data.data.hash;
  } catch (err) {
    throw new Error(apiErrorMessage(err, 'Failed to generate PayU hash'));
  }
}

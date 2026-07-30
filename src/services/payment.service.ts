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

export interface MembershipPaymentOrder {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  planName: string;
  planDays: number;
  priceInr: number;
  mode: MembershipPaymentMode;
  accountType: MembershipAccountType;
  planTier: MembershipPlanTier;
}

export interface VerifyMembershipPaymentPayload {
  paymentId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
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

import React, { useCallback, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Modal,
  NativeEventEmitter,
  NativeModules,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PayUBizSdk from 'payu-non-seam-less-react';
import { API_BASE_URL } from '../../config/env';
import * as paymentService from '../../services/payment.service';
import type {
  MembershipPaymentOrder,
  VerifyMembershipPaymentPayload,
} from '../../services/payment.service';

type PayUCheckoutModalProps = {
  visible: boolean;
  order: MembershipPaymentOrder | null;
  onSuccess: (payload: VerifyMembershipPaymentPayload) => void;
  onCancel: (reason?: string) => void;
};

type PayUSdkResponse = {
  merchantResponse?: string | Record<string, unknown>;
  payuResponse?: string | Record<string, unknown>;
};

function parseMaybeJson(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === 'object') return value as Record<string, unknown>;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  return {};
}

function pickString(obj: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined && value !== null && String(value).length) {
      return String(value);
    }
  }
  return '';
}

function toVerifyPayload(
  order: MembershipPaymentOrder,
  event: PayUSdkResponse,
): VerifyMembershipPaymentPayload | null {
  const payu = {
    ...parseMaybeJson(event.merchantResponse),
    ...parseMaybeJson(event.payuResponse),
  };

  const status = pickString(payu, ['status', 'unmappedstatus', 'result']).toLowerCase();
  const txnid = pickString(payu, ['txnid', 'transactionId', 'txid']) || order.txnid;
  const hash = pickString(payu, ['hash', 'paymentHash']);
  const amount = pickString(payu, ['amount', 'transaction_amount']) || order.amount;
  const mihpayid = pickString(payu, ['mihpayid', 'id', 'payuId']);

  if (!txnid || !amount || !status) return null;

  // Some SDK success callbacks omit reverse hash; verify endpoint needs it when present.
  // If hash missing, still send fields — backend may soft-fail remote verify using txnid.
  return {
    paymentId: order.paymentId,
    txnid,
    status: status === 'captured' || status === 'success' || status === 'completed' ? 'success' : status,
    hash: hash || order.hash,
    amount,
    mihpayid: mihpayid || undefined,
    productinfo: pickString(payu, ['productinfo']) || order.productinfo,
    firstname: pickString(payu, ['firstname']) || order.firstname,
    email: pickString(payu, ['email']) || order.email,
    udf1: pickString(payu, ['udf1']) || order.udf1,
    udf2: pickString(payu, ['udf2']) || order.udf2,
    udf3: pickString(payu, ['udf3']) || order.udf3,
    udf4: pickString(payu, ['udf4']) || order.udf4,
    udf5: pickString(payu, ['udf5']) || order.udf5,
  };
}

function buildSdkPaymentParams(order: MembershipPaymentOrder) {
  const isLive = order.environment === 'live';
  const publicBase = API_BASE_URL.replace(/\/$/, '');

  return {
    key: order.key || order.keyId,
    transactionId: order.txnid,
    amount: String(order.amount),
    productInfo: order.productinfo,
    firstName: order.firstname || 'Customer',
    email: order.email || 'customer@example.com',
    phone: order.phone || '9999999999',
    android_surl: `${publicBase}/api/payments/payu/success`,
    android_furl: `${publicBase}/api/payments/payu/failure`,
    ios_surl: `${publicBase}/api/payments/payu/success`,
    ios_furl: `${publicBase}/api/payments/payu/failure`,
    // '0' = Production, '1' = Test
    environment: isLive ? '0' : '1',
    userCredential: `${order.key || order.keyId}:${order.email || order.paymentId}`,
    additionalParam: {
      udf1: order.udf1,
      udf2: order.udf2,
      udf3: order.udf3,
      udf4: order.udf4,
      udf5: order.udf5,
    },
  };
}

export default function PayUCheckoutModal({
  visible,
  order,
  onSuccess,
  onCancel,
}: PayUCheckoutModalProps) {
  const handledRef = useRef(false);
  const openedRef = useRef(false);
  const orderRef = useRef(order);
  orderRef.current = order;

  const finishSuccess = useCallback(
    (event: PayUSdkResponse) => {
      const current = orderRef.current;
      if (!current || handledRef.current) return;
      handledRef.current = true;
      const payload = toVerifyPayload(current, event);
      if (!payload) {
        onCancel('Payment completed but response was incomplete.');
        return;
      }
      onSuccess(payload);
    },
    [onCancel, onSuccess],
  );

  const finishCancel = useCallback(
    (reason: string) => {
      if (handledRef.current) return;
      handledRef.current = true;
      onCancel(reason);
    },
    [onCancel],
  );

  // Subscribe to CheckoutPro events
  useEffect(() => {
    if (!visible) return;

    const emitter = new NativeEventEmitter(NativeModules.PayUBizSdk ?? PayUBizSdk);

    const onPaymentSuccess = emitter.addListener('onPaymentSuccess', (e: PayUSdkResponse) => {
      finishSuccess(e);
    });
    const onPaymentFailure = emitter.addListener('onPaymentFailure', (e: PayUSdkResponse) => {
      const payu = {
        ...parseMaybeJson(e?.merchantResponse),
        ...parseMaybeJson(e?.payuResponse),
      };
      const msg =
        pickString(payu, ['error_Message', 'error', 'field9', 'status']) ||
        'Payment was not successful.';
      finishCancel(msg);
    });
    const onPaymentCancel = emitter.addListener('onPaymentCancel', () => {
      finishCancel('Payment cancelled');
    });
    const onError = emitter.addListener('onError', (e: { errorMsg?: string; error_message?: string }) => {
      finishCancel(e?.errorMsg || e?.error_message || 'PayU checkout error.');
    });
    const onGenerateHash = emitter.addListener(
      'generateHash',
      async (e: { hashString?: string; hashName?: string; postSalt?: string }) => {
        try {
          const hashString = String(e?.hashString || '');
          const hashName = String(e?.hashName || '');
          const postSalt = e?.postSalt == null ? '' : String(e.postSalt);
          if (!hashString || !hashName) return;
          const hashValue = await paymentService.generatePayUHash({ hashString, postSalt });
          PayUBizSdk.hashGenerated({ [hashName]: hashValue });
        } catch (err) {
          console.warn('PayU generateHash failed:', err);
          finishCancel(err instanceof Error ? err.message : 'Failed to generate payment hash.');
        }
      },
    );

    return () => {
      onPaymentSuccess.remove();
      onPaymentFailure.remove();
      onPaymentCancel.remove();
      onError.remove();
      onGenerateHash.remove();
    };
  }, [visible, finishCancel, finishSuccess]);

  // Launch CheckoutPro when order is ready
  useEffect(() => {
    if (!visible || !order || openedRef.current) return;
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      finishCancel('PayU Checkout Pro is only supported on Android/iOS.');
      return;
    }

    openedRef.current = true;
    handledRef.current = false;

    try {
      const payUPaymentParams = buildSdkPaymentParams(order);
      const payUCheckoutProConfig = {
        primaryColor: '#c45c26',
        secondaryColor: '#111111',
        merchantName: 'Ghar Dekho',
        showExitConfirmationOnCheckoutScreen: true,
        showExitConfirmationOnPaymentScreen: true,
        cartDetails: [
          { 'Plan': order.planName },
          { 'Amount': `₹${order.amount}` },
        ],
      };

      PayUBizSdk.openCheckoutScreen({
        payUPaymentParams,
        payUCheckoutProConfig,
      });
    } catch (err) {
      console.warn('PayU openCheckoutScreen failed:', err);
      finishCancel(err instanceof Error ? err.message : 'Could not open PayU checkout.');
    }
  }, [visible, order, finishCancel]);

  useEffect(() => {
    if (!visible) {
      openedRef.current = false;
      handledRef.current = false;
    }
  }, [visible, order?.paymentId]);

  if (!visible || !order) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={() => finishCancel('Payment cancelled')}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#c45c26" />
          <Text style={styles.title}>Opening PayU checkout…</Text>
          <Text style={styles.sub}>
            Complete payment in the PayU screen. Google Pay, PhonePe and UPI open from there.
          </Text>
          <TouchableOpacity style={styles.closeBtn} onPress={() => finishCancel('Payment cancelled')} hitSlop={12}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
    gap: 10,
  },
  title: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
  },
  sub: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  closeBtn: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeText: {
    color: '#c45c26',
    fontWeight: '700',
    fontSize: 14,
  },
});

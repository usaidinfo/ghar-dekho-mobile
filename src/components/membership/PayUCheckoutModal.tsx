import React, { useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from 'react-native-webview';
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

function parseQueryParams(url: string): Record<string, string> {
  try {
    const queryIndex = url.indexOf('?');
    if (queryIndex < 0) return {};
    const params = new URLSearchParams(url.slice(queryIndex + 1));
    const out: Record<string, string> = {};
    params.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  } catch {
    return {};
  }
}

function toVerifyPayload(
  order: MembershipPaymentOrder,
  params: Record<string, string>,
): VerifyMembershipPaymentPayload | null {
  const status = String(params.status || '').toLowerCase();
  if (!params.hash || !params.txnid || !params.amount || !status) return null;
  return {
    paymentId: order.paymentId,
    txnid: params.txnid,
    status,
    hash: params.hash,
    amount: params.amount,
    mihpayid: params.mihpayid,
    productinfo: params.productinfo,
    firstname: params.firstname,
    email: params.email,
    udf1: params.udf1 || order.udf1,
    udf2: params.udf2 || order.udf2,
    udf3: params.udf3 || order.udf3,
    udf4: params.udf4 || order.udf4,
    udf5: params.udf5 || order.udf5,
  };
}

export default function PayUCheckoutModal({
  visible,
  order,
  onSuccess,
  onCancel,
}: PayUCheckoutModalProps) {
  const handledRef = useRef(false);

  const html = useMemo(() => {
    if (!order?.payuParams || !order.paymentUrl) return '';
    const params = order.payuParams;
    const inputs = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(
        ([key, value]) =>
          `<input type="hidden" name="${key}" value="${String(value)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')}" />`,
      )
      .join('\n');

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>PayU Checkout</title>
  </head>
  <body onload="document.forms[0].submit()">
    <p style="font-family: sans-serif; text-align: center; margin-top: 40px;">
      Redirecting to PayU...
    </p>
    <form action="${order.paymentUrl}" method="post">
      ${inputs}
    </form>
  </body>
</html>`;
  }, [order]);

  const finishWithParams = (params: Record<string, string>) => {
    if (!order || handledRef.current) return;
    handledRef.current = true;

    const status = String(params.status || '').toLowerCase();
    const payload = toVerifyPayload(order, params);

    if (!payload) {
      onCancel(params.error_Message || 'Payment response was incomplete.');
      return;
    }

    if (status !== 'success' && status !== 'captured') {
      onCancel(params.error_Message || params.field9 || 'Payment was not successful.');
      return;
    }

    onSuccess(payload);
  };

  const maybeHandleUrl = (url: string) => {
    if (!url) return false;
    if (url.startsWith('ghardekho://payu/callback')) {
      finishWithParams(parseQueryParams(url));
      return true;
    }
    return false;
  };

  const onNavChange = (nav: WebViewNavigation) => {
    maybeHandleUrl(nav.url);
  };

  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as Record<string, string>;
      finishWithParams(data);
    } catch {
      // ignore non-JSON messages
    }
  };

  if (!visible || !order) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={() => onCancel('Payment cancelled')}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Pay securely with PayU</Text>
          <TouchableOpacity
            onPress={() => {
              handledRef.current = true;
              onCancel('Payment cancelled');
            }}
            hitSlop={12}
          >
            <Text style={styles.close}>Close</Text>
          </TouchableOpacity>
        </View>
        {html ? (
          <WebView
            originWhitelist={['*', 'ghardekho://*']}
            source={{ html, baseUrl: order.paymentUrl }}
            onNavigationStateChange={onNavChange}
            onShouldStartLoadWithRequest={(req) => {
              if (maybeHandleUrl(req.url)) return false;
              return true;
            }}
            onMessage={onMessage}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loading}>
                <ActivityIndicator size="large" />
              </View>
            )}
          />
        ) : (
          <View style={styles.loading}>
            <Text>Missing PayU checkout details.</Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 16, fontWeight: '600', color: '#111' },
  close: { fontSize: 15, color: '#c45c26' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

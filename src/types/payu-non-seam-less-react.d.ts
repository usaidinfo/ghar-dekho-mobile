declare module 'payu-non-seam-less-react' {
  type HashMap = Record<string, string>;

  interface PayUBizSdkModule {
    openCheckoutScreen: (paymentObject: {
      payUPaymentParams: Record<string, unknown>;
      payUCheckoutProConfig?: Record<string, unknown>;
    }) => void;
    hashGenerated: (hashes: HashMap) => void;
    makeHttpRequest?: (
      url: string,
      method: string,
      body: string,
      headers: Record<string, string>,
    ) => Promise<string | Record<string, unknown>>;
  }

  const PayUBizSdk: PayUBizSdkModule;
  export default PayUBizSdk;
}

declare module 'react-native-config' {
  export interface NativeConfig {
    API_BASE_URL?: string;
    CHAT_SOCKET_URL?: string;
    RAZORPAY_KEY_ID?: string;

    // AdMob global flags
    ADS_ENABLED?: string;
    ADS_TEST_MODE?: string;
    ENABLE_APP_OPEN_ADS?: string;

    // App IDs (needed in AndroidManifest / Info.plist)
    ADMOB_ANDROID_APP_ID?: string;
    ADMOB_IOS_APP_ID?: string;

    // Android ad unit IDs
    ADMOB_ANDROID_BANNER_ID?: string;
    ADMOB_ANDROID_REWARDED_ID?: string;
    ADMOB_ANDROID_REWARDED_INTERSTITIAL_ID?: string;
    ADMOB_ANDROID_NATIVE_ADVANCED_ID?: string;
    ADMOB_ANDROID_APP_OPEN_ID?: string;

    // iOS ad unit IDs
    ADMOB_IOS_BANNER_ID?: string;
    ADMOB_IOS_REWARDED_ID?: string;
    ADMOB_IOS_REWARDED_INTERSTITIAL_ID?: string;
    ADMOB_IOS_NATIVE_ADVANCED_ID?: string;
    ADMOB_IOS_APP_OPEN_ID?: string;
  }
  const Config: NativeConfig;
  export default Config;
}

declare module 'react-native-razorpay' {
  export interface RazorpayCheckoutOptions {
    description?: string;
    image?: string;
    currency: string;
    key: string;
    amount: number | string;
    name?: string;
    order_id: string;
    prefill?: {
      email?: string;
      contact?: string;
      name?: string;
    };
    theme?: { color?: string };
    notes?: Record<string, string>;
  }

  export interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  const RazorpayCheckout: {
    open: (options: RazorpayCheckoutOptions) => Promise<RazorpaySuccessResponse>;
  };

  export default RazorpayCheckout;
}

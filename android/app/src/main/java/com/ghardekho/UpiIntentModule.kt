package com.ghardekho

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import androidx.browser.customtabs.CustomTabsIntent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * Opens UPI / PayU deep links the way Chrome does, and launches PayU Hosted
 * Checkout inside Chrome Custom Tabs (UPI app tiles work there; not in WebView).
 */
class UpiIntentModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "UpiIntent"

  @ReactMethod
  fun open(url: String, promise: Promise) {
    try {
      val activity = currentActivity
      val context = activity ?: reactContext
      val intent = buildIntent(url)
      if (activity == null) {
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      context.startActivity(intent)
      promise.resolve(true)
    } catch (e: ActivityNotFoundException) {
      try {
        val fallback = buildFallbackIntent(url)
        val activity = currentActivity
        val context = activity ?: reactContext
        if (activity == null) {
          fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(fallback)
        promise.resolve(true)
      } catch (inner: Exception) {
        promise.reject("UPI_OPEN_FAILED", inner.message, inner)
      }
    } catch (e: Exception) {
      promise.reject("UPI_OPEN_FAILED", e.message, e)
    }
  }

  /** Open PayU checkout URL in Chrome Custom Tabs so GPay/PhonePe/Paytm work. */
  @ReactMethod
  fun openCheckout(url: String, promise: Promise) {
    try {
      val activity = currentActivity
      if (activity == null) {
        // No activity — plain VIEW still better than nothing
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactContext.startActivity(intent)
        promise.resolve(true)
        return
      }

      val customTabsIntent =
          CustomTabsIntent.Builder()
              .setShowTitle(true)
              .setUrlBarHidingEnabled(true)
              .build()
      customTabsIntent.intent.addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY)
      customTabsIntent.launchUrl(activity, Uri.parse(url))
      promise.resolve(true)
    } catch (e: Exception) {
      try {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
          addCategory(Intent.CATEGORY_BROWSABLE)
          if (currentActivity == null) addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        val context = currentActivity ?: reactContext
        context.startActivity(intent)
        promise.resolve(true)
      } catch (inner: Exception) {
        promise.reject("CHECKOUT_OPEN_FAILED", inner.message, inner)
      }
    }
  }

  private fun buildIntent(url: String): Intent {
    val trimmed = url.trim()
    return if (trimmed.startsWith("intent:", ignoreCase = true)) {
      Intent.parseUri(trimmed, Intent.URI_INTENT_SCHEME).apply {
        addCategory(Intent.CATEGORY_BROWSABLE)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
    } else {
      Intent(Intent.ACTION_VIEW, Uri.parse(trimmed)).apply {
        addCategory(Intent.CATEGORY_BROWSABLE)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
    }
  }

  private fun buildFallbackIntent(url: String): Intent {
    val trimmed = url.trim()
    if (trimmed.startsWith("intent:", ignoreCase = true)) {
      val withoutPackage =
          trimmed.replace(Regex(";package=[^;]+", RegexOption.IGNORE_CASE), "")
      return try {
        Intent.parseUri(withoutPackage, Intent.URI_INTENT_SCHEME).apply {
          addCategory(Intent.CATEGORY_BROWSABLE)
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
          `package` = null
          setComponent(null)
        }
      } catch (_: Exception) {
        val schemeMatch = Regex(";scheme=([^;]+)", RegexOption.IGNORE_CASE).find(trimmed)
        val scheme = schemeMatch?.groupValues?.getOrNull(1) ?: "upi"
        val path = trimmed.removePrefix("intent:").substringBefore("#Intent")
        Intent(Intent.ACTION_VIEW, Uri.parse("$scheme:$path")).apply {
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
      }
    }
    return Intent(Intent.ACTION_VIEW, Uri.parse(trimmed)).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
  }
}

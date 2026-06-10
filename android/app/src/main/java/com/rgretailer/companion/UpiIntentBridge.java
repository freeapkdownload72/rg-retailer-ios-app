package com.rgretailer.companion;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.util.Log;
import android.webkit.JavascriptInterface;

/**
 * JavaScript-to-Native bridge that provides a backup mechanism for launching
 * UPI payment intents. When Razorpay's checkout.js runs inside an iframe,
 * shouldOverrideUrlLoading on the parent WebView may not fire. This bridge
 * is injected into the WebView via addJavascriptInterface and can be called
 * directly from JavaScript to launch UPI deep links.
 *
 * Usage from JS: window.NativeUPI.openUpiApp("upi://pay?pa=...&pn=...")
 */
public class UpiIntentBridge {
    private static final String TAG = "UpiIntentBridge";
    private final MainActivity activity;

    public UpiIntentBridge(MainActivity activity) {
        this.activity = activity;
    }

    @JavascriptInterface
    public boolean openUpiApp(String url) {
        Log.d(TAG, "openUpiApp called from JS with URL: " + url);
        try {
            Intent intent;
            if (url.startsWith("intent://")) {
                intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
            } else {
                intent = new Intent(Intent.ACTION_VIEW);
                intent.setData(Uri.parse(url));
            }
            activity.startActivity(intent);
            Log.d(TAG, "Successfully launched UPI intent");
            return true;
        } catch (ActivityNotFoundException e) {
            Log.e(TAG, "No app found to handle UPI URL: " + url, e);
            return false;
        } catch (Exception e) {
            Log.e(TAG, "Error launching UPI intent: " + url, e);
            return false;
        }
    }

    @JavascriptInterface
    public boolean isUpiAvailable() {
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setData(Uri.parse("upi://pay"));
            return intent.resolveActivity(activity.getPackageManager()) != null;
        } catch (Exception e) {
            return false;
        }
    }
}

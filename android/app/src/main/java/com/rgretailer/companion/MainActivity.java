package com.rgretailer.companion;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.util.Log;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "RGMainActivity";

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = getBridge().getWebView();

        // 1. Add the native UPI bridge — this lets JavaScript call our native code
        //    to launch UPI apps even from inside Razorpay's checkout iframe
        webView.addJavascriptInterface(new UpiIntentBridge(this), "NativeUPI");
        Log.d(TAG, "NativeUPI JavaScript bridge registered");

        // 2. Set the custom WebViewClient and WebChromeClient synchronously.
        //    Since this runs in onCreate(), it happens before the Activity state
        //    becomes STARTED or RESUMED, preventing the registerForActivityResult IllegalStateException.
        webView.setWebViewClient(new RazorpayWebViewClient(getBridge(), this));
        webView.setWebChromeClient(new RazorpayWebChromeClient(getBridge(), this));
        Log.d(TAG, "Razorpay WebViewClient and WebChromeClient set on WebView (synchronously)");

        // 3. Enable WebView settings for Razorpay checkout
        WebSettings settings = webView.getSettings();
        settings.setSupportMultipleWindows(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setDomStorageEnabled(true);
        Log.d(TAG, "WebView settings configured for Razorpay UPI Intent");
    }
}

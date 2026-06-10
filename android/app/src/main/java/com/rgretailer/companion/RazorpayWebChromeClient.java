package com.rgretailer.companion;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Message;
import android.util.Log;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebChromeClient;

public class RazorpayWebChromeClient extends BridgeWebChromeClient {
    private static final String TAG = "RazorpayWebChrome";
    private final MainActivity activity;

    public RazorpayWebChromeClient(Bridge bridge, MainActivity activity) {
        super(bridge);
        this.activity = activity;
    }

    @Override
    public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
        Log.d(TAG, "onCreateWindow called. isDialog: " + isDialog + ", isUserGesture: " + isUserGesture);

        // Create a temporary WebView to capture the URL load request
        WebView tempWebView = new WebView(activity);
        
        tempWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView tempView, WebResourceRequest request) {
                String url = request.getUrl().toString();
                Log.d(TAG, "Temp WebView shouldOverrideUrlLoading: " + url);
                if (handleUpiOrIntent(url)) {
                    return true;
                }
                return super.shouldOverrideUrlLoading(tempView, request);
            }

            @SuppressWarnings("deprecation")
            @Override
            public boolean shouldOverrideUrlLoading(WebView tempView, String url) {
                Log.d(TAG, "Temp WebView shouldOverrideUrlLoading (legacy): " + url);
                if (handleUpiOrIntent(url)) {
                    return true;
                }
                return super.shouldOverrideUrlLoading(tempView, url);
            }
        });

        WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
        transport.setWebView(tempWebView);
        resultMsg.sendToTarget();
        return true;
    }

    private boolean handleUpiOrIntent(String url) {
        if (url == null) return false;

        // 1. Handle intent:// schemes
        if (url.startsWith("intent://")) {
            Log.d(TAG, "Temp WebView intercepted intent://: " + url);
            try {
                Intent intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
                try {
                    activity.startActivity(intent);
                    return true;
                } catch (ActivityNotFoundException e) {
                    Log.w(TAG, "Temp WebView activity not found for intent:// URL, trying fallback", e);
                    // Try fallback URL
                    String fallbackUrl = intent.getStringExtra("browser_fallback_url");
                    if (fallbackUrl != null) {
                        Log.d(TAG, "Temp WebView launching fallback URL: " + fallbackUrl);
                        // Load fallback in parent webview
                        activity.getBridge().getWebView().post(() -> {
                            activity.getBridge().getWebView().loadUrl(fallbackUrl);
                        });
                        return true;
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Failed to launch intent from temp WebView", e);
            }
            return false;
        }

        // 2. Handle all other non-web custom schemes (upi://, phonepe://, tez://, etc.)
        Uri uri = Uri.parse(url);
        String scheme = uri.getScheme();
        if (scheme != null && !scheme.equals("http") && !scheme.equals("https") && 
            !scheme.equals("javascript") && !scheme.equals("about") && !scheme.equals("file")) {
            Log.d(TAG, "Temp WebView intercepted custom scheme (" + scheme + "): " + url);
            try {
                Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                activity.startActivity(intent);
                return true;
            } catch (ActivityNotFoundException e) {
                Log.e(TAG, "No app found to handle custom scheme: " + scheme, e);
                return false;
            }
        }

        return false;
    }
}

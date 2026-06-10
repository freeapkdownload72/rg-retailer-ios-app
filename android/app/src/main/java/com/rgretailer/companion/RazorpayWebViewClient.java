package com.rgretailer.companion;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.util.Log;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebViewClient;

/**
 * Custom WebViewClient that intercepts UPI deep links from Razorpay checkout
 * and launches the corresponding UPI payment app (GPay, PhonePe, Paytm, etc.)
 * via an Android Intent. Consolidates both deep link interception and JS polyfill injection.
 */
public class RazorpayWebViewClient extends BridgeWebViewClient {

    private static final String TAG = "RazorpayWebView";
    private final MainActivity activity;

    public RazorpayWebViewClient(Bridge bridge, MainActivity activity) {
        super(bridge);
        this.activity = activity;
    }

    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        String url = request.getUrl().toString();
        Log.d(TAG, "shouldOverrideUrlLoading: " + url);

        if (handleCustomScheme(url)) {
            return true;
        }

        return super.shouldOverrideUrlLoading(view, request);
    }

    @SuppressWarnings("deprecation")
    @Override
    public boolean shouldOverrideUrlLoading(WebView view, String url) {
        Log.d(TAG, "shouldOverrideUrlLoading (legacy): " + url);

        if (url != null && handleCustomScheme(url)) {
            return true;
        }

        return super.shouldOverrideUrlLoading(view, url);
    }

    @Override
    public void onPageFinished(WebView view, String url) {
        super.onPageFinished(view, url);

        // Inject the UPI intent interceptor script to catch any clicks/popups on the JS side
        String js = "(function() {" +
            "if (window.__upiInterceptorInstalled) return;" +
            "window.__upiInterceptorInstalled = true;" +
            "console.log('[RG UPI] Installing UPI intent interceptor');" +

            // Override window.open to catch upi:// URLs
            "var origOpen = window.open;" +
            "window.open = function(url, target, features) {" +
            "  if (url && (url.startsWith('upi://') || url.startsWith('intent://'))) {" +
            "    console.log('[RG UPI] Intercepted window.open UPI URL:', url);" +
            "    if (window.NativeUPI) { window.NativeUPI.openUpiApp(url); return null; }" +
            "  }" +
            "  return origOpen.call(window, url, target, features);" +
            "};" +

            // Listen for clicks on links with upi:// href
            "document.addEventListener('click', function(e) {" +
            "  var a = e.target;" +
            "  while (a && a.tagName !== 'A') a = a.parentElement;" +
            "  if (a && a.href && (a.href.startsWith('upi://') || a.href.startsWith('intent://'))) {" +
            "    console.log('[RG UPI] Intercepted link click UPI URL:', a.href);" +
            "    e.preventDefault();" +
            "    if (window.NativeUPI) { window.NativeUPI.openUpiApp(a.href); }" +
            "  }" +
            "}, true);" +

            // Also try to inject into Razorpay's iframe if it exists (same-origin only)
            "try {" +
            "  var frames = document.querySelectorAll('iframe');" +
            "  frames.forEach(function(frame) {" +
            "    try {" +
            "      var fdoc = frame.contentDocument || frame.contentWindow.document;" +
            "      if (fdoc && !fdoc.__upiInterceptorInstalled) {" +
            "        fdoc.__upiInterceptorInstalled = true;" +
            "        fdoc.addEventListener('click', function(e) {" +
            "          var a = e.target;" +
            "          while (a && a.tagName !== 'A') a = a.parentElement;" +
            "          if (a && a.href && (a.href.startsWith('upi://') || a.href.startsWith('intent://'))) {" +
            "            console.log('[RG UPI] Intercepted iframe link click:', a.href);" +
            "            e.preventDefault();" +
            "            if (window.parent.NativeUPI) { window.parent.NativeUPI.openUpiApp(a.href); }" +
            "          }" +
            "        }, true);" +
            "      }" +
            "    } catch(err) { /* cross-origin iframe, skip */ }" +
            "  });" +
            "} catch(err) {}" +

            // MutationObserver to watch for dynamically added iframes (Razorpay checkout)
            "var observer = new MutationObserver(function(mutations) {" +
            "  mutations.forEach(function(m) {" +
            "    m.addedNodes.forEach(function(node) {" +
            "      if (node.tagName === 'IFRAME') {" +
            "        console.log('[RG UPI] New iframe detected, attempting injection');" +
            "        try {" +
            "          node.addEventListener('load', function() {" +
            "            try {" +
            "              var fdoc = node.contentDocument || node.contentWindow.document;" +
            "              if (fdoc) {" +
            "                fdoc.addEventListener('click', function(e) {" +
            "                  var a = e.target;" +
            "                  while (a && a.tagName !== 'A') a = a.parentElement;" +
            "                  if (a && a.href && (a.href.startsWith('upi://') || a.href.startsWith('intent://'))) {" +
            "                    console.log('[RG UPI] Iframe click intercepted:', a.href);" +
            "                    e.preventDefault();" +
            "                    if (window.NativeUPI) { window.NativeUPI.openUpiApp(a.href); }" +
            "                  }" +
            "                }, true);" +
            "              }" +
            "            } catch(err) { /* cross-origin */ }" +
            "          });" +
            "        } catch(err) {}" +
            "      }" +
            "    });" +
            "  });" +
            "});" +
            "observer.observe(document.body, { childList: true, subtree: true });" +

            "console.log('[RG UPI] UPI intent interceptor installed successfully');" +
            "})();";

        view.evaluateJavascript(js, null);
        Log.d(TAG, "UPI interceptor JS injected into page: " + url);
    }

    /**
     * Handles upi:// and intent:// scheme URLs by launching the appropriate
     * external app via an Android Intent.
     *
     * @return true if the URL was handled, false otherwise
     */
    private boolean handleCustomScheme(String url) {
        if (url == null) return false;

        // 1. Handle intent:// scheme URLs
        if (url.startsWith("intent://")) {
            Log.d(TAG, "Intercepted intent:// URL: " + url);
            try {
                Intent intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
                try {
                    activity.startActivity(intent);
                    return true;
                } catch (ActivityNotFoundException e) {
                    Log.w(TAG, "Activity not found for intent:// URL, trying fallback", e);
                    // Try the fallback URL if specified in the intent
                    String fallbackUrl = intent.getStringExtra("browser_fallback_url");
                    if (fallbackUrl != null) {
                        Log.d(TAG, "Using fallback URL: " + fallbackUrl);
                        return false; // Let WebView load the fallback
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Failed to parse/launch intent:// URL: " + url, e);
            }
            return false;
        }

        // 2. Handle all other non-web custom schemes (upi://, phonepe://, tez://, etc.)
        Uri uri = Uri.parse(url);
        String scheme = uri.getScheme();
        if (scheme != null && !scheme.equals("http") && !scheme.equals("https") && 
            !scheme.equals("javascript") && !scheme.equals("about") && !scheme.equals("file")) {
            Log.d(TAG, "Intercepted custom scheme deep link (" + scheme + "): " + url);
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

/**
 * RG Retailer - AI Virtual Try-On Studio (Dynamic Engine Router)
 * Coordinates direct secure client-side API requests to GCP Vertex AI endpoints.
 */

import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { CapacitorHttp } from "@capacitor/core";

/**
 * Base64Url encoder utility for native ArrayBuffer/String signing compatibility.
 */
function base64UrlEncode(strOrArrayBuffer) {
  let base64 = "";
  if (typeof strOrArrayBuffer === "string") {
    base64 = window.btoa(unescape(encodeURIComponent(strOrArrayBuffer)));
  } else {
    const bytes = new Uint8Array(strOrArrayBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    base64 = window.btoa(binary);
  }
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

/**
 * Converts a public URL or data URL to raw base64 string.
 */
export async function imageToBase64(urlOrBase64) {
  if (!urlOrBase64) return "";
  if (urlOrBase64.startsWith("data:image")) {
    const commaIdx = urlOrBase64.indexOf(",");
    return commaIdx !== -1 ? urlOrBase64.substring(commaIdx + 1) : urlOrBase64;
  }

  // Helper to read a Blob as Base64 string without data prefix
  const readBlobAsBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        const commaIdx = dataUrl.indexOf(",");
        resolve(commaIdx !== -1 ? dataUrl.substring(commaIdx + 1) : dataUrl);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Helper to convert ArrayBuffer to Base64
  const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // 1. FIRST PATH: Standard Browser Fetch
  // Standard fetch is 100% clean and handles all binary formats (blobs/arraybuffers) perfectly in WebView.
  // We use this first because most image CDNs (e.g. Unsplash, Firebase Storage) serve with CORS headers.
  try {
    console.log(`Attempting standard browser fetch for try-on asset: ${urlOrBase64}`);
    const response = await fetch(urlOrBase64);
    if (response.ok) {
      const blob = await response.blob();
      const base64Data = await readBlobAsBase64(blob);
      if (base64Data && base64Data.trim().length > 100) {
        console.log("Successfully loaded uncorrupted image via standard browser fetch.");
        return base64Data;
      }
    }
  } catch (fetchError) {
    console.warn("Standard browser fetch failed (likely CORS). Falling back to native CapacitorHttp...", fetchError);
  }

  // 2. SECOND PATH: Native CapacitorHttp to bypass CORS
  // If standard fetch fails due to CORS, use CapacitorHttp.
  // We request 'blob' or 'arraybuffer' responseType to prevent the bridge from decoding binary data as UTF-8 string.
  try {
    console.log(`Downloading cross-origin try-on asset via CapacitorHttp with responseType: blob`);
    const response = await CapacitorHttp.get({
      url: urlOrBase64,
      responseType: 'blob'
    });

    if (response && response.data) {
      const data = response.data;
      
      // Handle Blob type
      if (data instanceof Blob) {
        return await readBlobAsBase64(data);
      }
      
      // Handle ArrayBuffer type
      if (data instanceof ArrayBuffer || (data.constructor && data.constructor.name === 'ArrayBuffer')) {
        return arrayBufferToBase64(data);
      }

      // Handle raw string fallbacks (older Capacitor versions)
      if (typeof data === 'string') {
        let rawData = data;
        if (rawData.startsWith("data:image")) {
          const commaIdx = rawData.indexOf(",");
          rawData = commaIdx !== -1 ? rawData.substring(commaIdx + 1) : rawData;
        }

        const isBase64Str = /^[A-Za-z0-9\+/=\s\r\n]+$/.test(rawData);
        if (isBase64Str) {
          return rawData;
        }

        // If it's a raw binary string, try to encode it (safest effort)
        console.warn("CapacitorHttp returned raw text string. Attempting encoding conversion...");
        let binary = "";
        const len = rawData.length;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(rawData.charCodeAt(i) & 0xff);
        }
        return window.btoa(binary);
      }
    }
  } catch (nativeError) {
    console.error("CapacitorHttp path failed:", nativeError);
  }

  // 3. THIRD PATH: Fallback to arraybuffer if blob didn't succeed
  try {
    console.log(`Trying fallback CapacitorHttp with responseType: arraybuffer`);
    const response = await CapacitorHttp.get({
      url: urlOrBase64,
      responseType: 'arraybuffer'
    });
    if (response && response.data) {
      const data = response.data;
      if (data instanceof ArrayBuffer || (data.constructor && data.constructor.name === 'ArrayBuffer')) {
        return arrayBufferToBase64(data);
      }
      if (data instanceof Blob) {
        return await readBlobAsBase64(data);
      }
    }
  } catch (arrBufError) {
    console.error("CapacitorHttp arraybuffer path failed:", arrBufError);
  }

  throw new Error(`Unable to load and convert the image asset: ${urlOrBase64}. Please try a different product or image.`);
}

/**
 * Trigger Google Cloud Vertex AI Virtual Try-On Model Prediction
 * Parses the service account, signs a signed assertion locally using Web Crypto, exchanges it for
 * a short-lived OAuth token, and calls the regional Vertex AI prediction endpoint.
 */
export async function runVertexTryOn({ humanImg, garmImg }) {
  console.log("Vertex AI VTO Request Initiated...");
  
  const vertexServiceAccountStr = localStorage.getItem('rg_vertex_service_account');
  const vertexProjectId = localStorage.getItem('rg_vertex_project_id') || 'rg-retailer-31026';
  const vertexRegion = localStorage.getItem('rg_vertex_region') || 'us-central1';
  
  if (!vertexServiceAccountStr || !vertexServiceAccountStr.trim()) {
    throw new Error("Google Cloud Vertex AI Service Account key is not configured in the Admin console. Please paste your GCP service account JSON key in Settings.");
  }
  
  let sa;
  try {
    sa = JSON.parse(vertexServiceAccountStr);
  } catch (e) {
    throw new Error("Invalid GCP Service Account JSON format. Please paste a valid credentials.json in Settings.");
  }
  
  const clientEmail = sa.client_email;
  const privateKeyPem = sa.private_key;
  const projectId = sa.project_id || vertexProjectId;
  
  if (!clientEmail || !privateKeyPem) {
    throw new Error("GCP Service Account JSON is missing client_email or private_key.");
  }
  
  if (!humanImg) {
    throw new Error("A human portrait or selfie photo should be uploaded.");
  }
  if (!garmImg) {
    throw new Error("A product garment image is missing. Please select a valid product with an image.");
  }
  
  // 1. Convert image parameters to base64 representation
  console.log("Converting imagery to raw base64 arrays...");
  const [personBase64, productBase64] = await Promise.all([
    imageToBase64(humanImg),
    imageToBase64(garmImg)
  ]);
  
  if (!personBase64 || personBase64.trim().length < 100) {
    throw new Error("Unable to read the uploaded portrait image data. Please try choosing/taking another photo.");
  }
  if (!productBase64 || productBase64.trim().length < 100) {
    throw new Error("Unable to download or access the product garment image. Please ensure the product has a valid, public image URL.");
  }
  
  // 2. Perform RS256 Web Crypto signature for JWT assertion
  console.log("Generating Signed OAuth JWT Assertion using browser Web Crypto...");
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  let pemContents = privateKeyPem.trim();
  if (pemContents.startsWith(pemHeader)) {
    pemContents = pemContents.substring(pemHeader.length);
  }
  if (pemContents.endsWith(pemFooter)) {
    pemContents = pemContents.substring(0, pemContents.length - pemFooter.length);
  }
  pemContents = pemContents.replace(/\s+/g, "");
  
  const binaryDerString = window.atob(pemContents);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }
  
  const key = await window.crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: { name: "SHA-256" }
    },
    false,
    ["sign"]
  );
  
  const header = {
    alg: "RS256",
    typ: "JWT"
  };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };
  
  const base64UrlHeader = base64UrlEncode(JSON.stringify(header));
  const base64UrlClaim = base64UrlEncode(JSON.stringify(claim));
  const inputToSign = `${base64UrlHeader}.${base64UrlClaim}`;
  
  const encoder = new TextEncoder();
  const signatureBuffer = await window.crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    key,
    encoder.encode(inputToSign)
  );
  
  const base64UrlSignature = base64UrlEncode(signatureBuffer);
  const jwt = `${inputToSign}.${base64UrlSignature}`;
  
  // 3. Exchange Signed Assertion for GCP Access Token
  console.log("Exchanging JWT assertion for GCP token...");
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  
  if (!tokenResponse.ok) {
    const errText = await tokenResponse.text();
    throw new Error(`GCP OAuth Token exchange request rejected: ${errText}`);
  }
  
  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;
  console.log("OAuth token request successful.");
  
  // 4. POST predict request to Vertex AI endpoints
  const vertexUrl = `https://${vertexRegion}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${vertexRegion}/publishers/google/models/virtual-try-on-001:predict`;
  console.log(`Calling Vertex AI Endpoint: ${vertexUrl}`);
  
  const payload = {
    instances: [
      {
        personImage: {
          image: {
            bytesBase64Encoded: personBase64
          }
        },
        productImages: [
          {
            image: {
              bytesBase64Encoded: productBase64
            }
          }
        ]
      }
    ],
    parameters: {
      sampleCount: 1
    }
  };
  
  const response = await fetch(vertexUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errText = await response.text();
    let cleanMsg = errText;
    try {
      const parsed = JSON.parse(errText);
      cleanMsg = parsed.error?.message || parsed.message || errText;
    } catch (e) {}
    throw new Error(`Vertex AI API error (${response.status}): ${cleanMsg}`);
  }
  
  const responseJson = await response.json();
  if (!responseJson.predictions || responseJson.predictions.length === 0) {
    throw new Error("Vertex AI Try-On service did not return any prediction images. Check logs.");
  }
  
  const pred = responseJson.predictions[0];
  const rawBase64 = typeof pred === 'string'
    ? pred
    : (pred.image?.bytesBase64Encoded || pred.bytesBase64Encoded || pred.image);
    
  if (!rawBase64) {
    throw new Error("Unable to extract output image bytes from Vertex AI response structure.");
  }
  
  return `data:image/jpeg;base64,${rawBase64}`;
}

/**
 * Entry Point Router: Directs requests to GCP Vertex AI Virtual Try-On endpoint.
 */
export async function runVitonTryOn({
  humanImg,
  garmImg,
  category = "overall",
  description = "Fashion Garment"
}) {
  console.log("Virtual Try-On routed strictly to Google Vertex AI.");
  return await runVertexTryOn({ humanImg, garmImg });
}

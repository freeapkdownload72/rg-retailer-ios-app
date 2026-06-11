import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  GoogleAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithCredential
} from "firebase/auth";
import {
  getFirestore,
  getDoc as realGetDoc,
  collection as realCollection,
  doc as realDoc,
  setDoc as realSetDoc,
  addDoc as realAddDoc,
  getDocs as realGetDocs,
  updateDoc as realUpdateDoc,
  deleteDoc as realDeleteDoc,
  onSnapshot as realOnSnapshot,
  query as realQuery,
  orderBy as realOrderBy,
  limit as realLimit,
  where as realWhere
} from "firebase/firestore";
import { Capacitor } from "@capacitor/core";

const firebaseConfig = {
  apiKey: "AIzaSyCWkcxwUjssU14v88bmSMB3gwFOSsuorQ0",
  authDomain: "rg-retailer-31026.firebaseapp.com",
  projectId: "rg-retailer-31026",
  storageBucket: "rg-retailer-31026.firebasestorage.app",
  messagingSenderId: "860972932020",
  appId: "1:860972932020:web:1950b17e2f548f614370e1"
};

// Initialize Firebase App & Firestore with graceful error catching
let app;
let db;
let isFallbackMode = false;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("Firebase App and Firestore initialized successfully inside Customer Portal.");
} catch (error) {
  console.error("Firebase/Firestore failed to initialize in B2C App. Automatically falling back to local storage:", error);
  isFallbackMode = true;
}
console.log("APP_IS_FALLBACK_MODE: " + isFallbackMode);

// Fallback Seeder Datasets for B2C Sandbox
const initialProducts = [
  {
    id: "8901072002241",
    sku: "SKU-BOTTOMJEANS-001",
    name: "Bottom Jeans",
    category: "Jeans",
    gender: "Men",
    sellingPrice: 2000,
    mrp: 2000,
    discount: 10,
    stockOnline: 50,
    stockOffline: 97,
    imageURL: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
    description: "Classic high-quality men's straight fit bottom denim jeans."
  },
  {
    id: "8901072002242",
    sku: "SKU-WHITETSHIRT-002",
    name: "Classic White T-Shirt",
    category: "Shirt",
    gender: "Men",
    sellingPrice: 999,
    mrp: 999,
    discount: 15,
    stockOnline: 30,
    stockOffline: 48,
    imageURL: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400",
    description: "Premium organic cotton classic crewneck white t-shirt."
  },
  {
    id: "8901072002243",
    sku: "SKU-COSMETICS-003",
    name: "Cosmetics Kit",
    category: "Cosmetics",
    gender: "Women",
    sellingPrice: 228.50,
    mrp: 228.50,
    discount: 0,
    stockOnline: 60,
    stockOffline: 120,
    imageURL: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400",
    description: "Premium daily essential makeup and cosmetics kit."
  },
  {
    id: "8901072002244",
    sku: "SKU-SUMMERDRESS-004",
    name: "Floral Summer Dress",
    category: "Women Wear",
    gender: "Women",
    sellingPrice: 2499,
    mrp: 2499,
    discount: 5,
    stockOnline: 20,
    stockOffline: 24,
    imageURL: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400",
    description: "A breezy, elegant floral printed summer dress for women."
  },
  {
    id: "8901072002245",
    sku: "SKU-HOODIE-005",
    name: "Cotton Hoodie",
    category: "Hoodie",
    gender: "Men",
    sellingPrice: 1800,
    mrp: 1800,
    discount: 20,
    stockOnline: 15,
    stockOffline: 35,
    imageURL: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400",
    description: "Comfy heavy-cotton fleece hoodie with front pockets."
  }
];

const initialCustomers = [
  { id: "cust_preet", name: "Amanpreet Singh", phone: "9988776655", loyaltyPoints: 826, tier: "Gold", outstandingBalance: 6273 },
  { id: "cust_aman", name: "Aman Gupta", phone: "9876543210", loyaltyPoints: 250, tier: "Silver", outstandingBalance: 0 },
  { id: "cust_aash", name: "Aashish Sharma", phone: "7282463872", loyaltyPoints: 110, tier: "Bronze", outstandingBalance: 0 }
];

const initialCoupons = [
  { id: "WELCOME10", code: "WELCOME10", name: "Welcome Discount 10%", type: "Percent", value: 10, minOrder: 0, status: "Active" },
  { id: "FESTIVE25", code: "FESTIVE25", name: "Festive Season 25%", type: "Percent", value: 25, minOrder: 1500, status: "Active" },
  { id: "FLAT100", code: "FLAT100", name: "Flat ₹100 Off", type: "Fixed", value: 100, minOrder: 500, status: "Active" }
];

const initialSettings = {
  store: {
    storeName: "RG Retailer",
    phone: "022-26451210",
    email: "info@rgretailer.com",
    address: "Linking Road, Bandra West, Mumbai",
    logoURL: ""
  },
  loyalty: {
    valuePerPoint: "0.50",
    minRedeem: "100"
  },
  legal: {
    privacyUrl: "https://rgretailer.com/privacy",
    privacyText: "1. Data Collection\nWe collect your name, phone number, and delivery addresses to configure your customer account profile and sync retail invoices.\n\n2. Security & Transmission\nAll transaction ledgers and customer data updates are transmitted securely using HTTPS/SSL encryption to our Firebase servers.\n\n3. Purge & Account Deletion\nYou can delete your account directly inside app Settings. Deletion is immediate and permanently deletes your credentials and database logs.",
    termsText: "1. Account Eligibility\nYou must utilize a valid mobile number capable of receiving One-Time Passcodes (OTP) to register and authenticate.\n\n2. Refills and Payments\nWallet balances represent store credit. Refills processed through payment gateways are strictly non-refundable and designated for in-app checkout checkout only.\n\n3. Shipping Agreements\nCurated orders placed on the storefront are fulfilled directly by the partner store. Estimated delivery times are indicative.",
    refundText: "1. Order Cancellation\nOrders can be cancelled by the user up until the order fulfillment status transitions to \"Shipped\" inside the app.\n\n2. Return Period\nEligible purchases can be returned within 7 days of delivery in their original, unused condition with labels intact.\n\n3. Refund Destination\nAll approved refunds are credited back to the customer's store wallet balance within 24 to 48 hours of inspection approval."
  }
};

// Fallback & Sync State Tracking
const activeSubscriptions = [];

function markCloudConnected() {
  // Cloud connectivity diagnostic logger
}

const getLocalStorageDataRaw = (key) => {
  const fullKey = `rg_billing_${key}`;
  const data = localStorage.getItem(fullKey);
  if (!data) return {};
  try {
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
};

const getLocalStorageCollection = (collectionName) => {
  const dataObj = getLocalStorageDataRaw(collectionName);
  return Object.entries(dataObj).map(([id, val]) => ({
    ...val,
    id: val.id || id
  }));
};

const saveLocalStorageCollection = (collectionName, dataObj) => {
  const key = `rg_billing_${collectionName}`;
  localStorage.setItem(key, JSON.stringify(dataObj));
};

const setLocalStorageDoc = (collectionName, docId, data) => {
  const collectionData = getLocalStorageDataRaw(collectionName);
  collectionData[docId] = { ...data, id: docId };
  saveLocalStorageCollection(collectionName, collectionData);
  notifyCollectionUpdate(collectionName);
};

const updateLocalStorageDoc = (collectionName, docId, data) => {
  const collectionData = getLocalStorageDataRaw(collectionName);
  if (collectionData[docId]) {
    collectionData[docId] = { ...collectionData[docId], ...data };
    saveLocalStorageCollection(collectionName, collectionData);
    notifyCollectionUpdate(collectionName);
  }
};

const addLocalStorageDoc = (collectionName, data) => {
  const collectionData = getLocalStorageDataRaw(collectionName);
  const docId = data.id || `auto_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
  collectionData[docId] = { ...data, id: docId };
  saveLocalStorageCollection(collectionName, collectionData);
  notifyCollectionUpdate(collectionName);
  return docId;
};

const deleteLocalStorageDoc = (collectionName, docId) => {
  const collectionData = getLocalStorageDataRaw(collectionName);
  delete collectionData[docId];
  saveLocalStorageCollection(collectionName, collectionData);
  notifyCollectionUpdate(collectionName);
};

function notifyCollectionUpdate(collectionName) {
  activeSubscriptions.forEach(sub => {
    if (sub.collectionName === collectionName && localListeners[sub.id]) {
      localListeners[sub.id]();
    }
  });
}

// Immediate Local Storage Seeding on Boot for Customer Portal
const seedLocalStorageIfEmpty = () => {
  const seedCollections = {
    products: initialProducts,
    customers: initialCustomers,
    coupons: initialCoupons,
    membership_plans: [
      {
        id: 'silver',
        name: 'Silver',
        monthlyPrice: 149,
        yearlyPrice: 1499,
        discountPercent: 10,
        freeDelivery: true,
        minOrderFreeDelivery: 499,
        loyaltyMultiplier: 1.5,
        features: [
          "10% discount on all orders",
          "Free delivery above Rs 499",
          "12h early access",
          "1.5x loyalty points"
        ]
      },
      {
        id: 'gold',
        name: 'Gold',
        monthlyPrice: 399,
        yearlyPrice: 3999,
        discountPercent: 15,
        freeDelivery: true,
        minOrderFreeDelivery: 0,
        loyaltyMultiplier: 2.0,
        features: [
          "15% discount on all orders",
          "Free delivery on all orders",
          "24h early access",
          "Free returns",
          "Priority support",
          "2x loyalty points"
        ]
      },
      {
        id: 'platinum',
        name: 'Platinum',
        monthlyPrice: 799,
        yearlyPrice: 7999,
        discountPercent: 25,
        freeDelivery: true,
        minOrderFreeDelivery: 0,
        loyaltyMultiplier: 3.0,
        features: [
          "25% discount on all orders",
          "Free express delivery",
          "48h early access",
          "Exclusive products",
          "Priority support",
          "3x loyalty points"
        ]
      }
    ]
  };

  Object.entries(seedCollections).forEach(([colName, dataList]) => {
    const key = `rg_billing_${colName}`;
    if (!localStorage.getItem(key)) {
      const dataObj = {};
      dataList.forEach((item) => {
        const id = item.id || item.phone;
        dataObj[id] = item;
      });
      localStorage.setItem(key, JSON.stringify(dataObj));
    }
  });

  const settingsKey = `rg_billing_settings`;
  if (!localStorage.getItem(settingsKey)) {
    localStorage.setItem(settingsKey, JSON.stringify(initialSettings));
  }
};

seedLocalStorageIfEmpty();

// Helper to recursively sanitize any data being written to Firestore to prevent crashes
function sanitizeForFirestore(val) {
  if (val === null || val === undefined) {
    return null;
  }

  if (typeof val === 'function') {
    return null;
  }

  if (Array.isArray(val)) {
    const flatArr = val.flat(Infinity);
    return flatArr.map(item => {
      if (typeof item === 'object' && item !== null) {
        return sanitizeForFirestore(item);
      }
      return item;
    }).filter(item => item !== undefined);
  }

  if (typeof val === 'object') {
    if (val instanceof Date) {
      return val;
    }

    const cleanedObj = {};
    for (const [key, value] of Object.entries(val)) {
      if (value === undefined || typeof value === 'function') continue;
      cleanedObj[key] = sanitizeForFirestore(value);
    }
    return cleanedObj;
  }

  return val;
}

// Seamless Wrapped Firestore API Export Implementation
export function collection(database, path) {
  let realRef = null;
  if (!isFallbackMode && db) {
    try {
      realRef = realCollection(db, path);
    } catch (e) {
      console.warn(`Collection init failed inside Customer App: ${path}`);
    }
  }
  return {
    type: "collection",
    path: path,
    realRef: realRef
  };
}

export function doc(database, path, docId) {
  let collPath = path;
  let id = docId;
  let realRef = null;

  if (typeof path === "object" && path.type === "collection") {
    collPath = path.path;
    id = docId;
    if (!isFallbackMode && path.realRef) {
      try {
        realRef = realDoc(path.realRef, docId);
      } catch (e) { }
    }
  } else {
    if (!isFallbackMode && db) {
      try {
        realRef = realDoc(db, path, docId);
      } catch (e) { }
    }
  }

  return {
    type: "doc",
    collectionName: collPath,
    docId: id,
    realRef: realRef
  };
}

export function query(collectionRef, ...constraints) {
  let realRef = null;
  if (!isFallbackMode && collectionRef.realRef) {
    try {
      const realConstraints = constraints.map(c => c.realConstraint || c).filter(Boolean);
      realRef = realQuery(collectionRef.realRef, ...realConstraints);
    } catch (e) { }
  }
  return {
    type: "query",
    collectionRef: collectionRef,
    collectionName: collectionRef.path,
    constraints: constraints,
    realRef: realRef
  };
}

export function where(field, op, value) {
  let realConstraint = null;
  if (!isFallbackMode) {
    try {
      realConstraint = realWhere(field, op, value);
    } catch (e) { }
  }
  return {
    type: "where",
    field,
    op,
    value,
    realConstraint
  };
}

export function orderBy(field, direction = "asc") {
  let realConstraint = null;
  if (!isFallbackMode) {
    try {
      realConstraint = realOrderBy(field, direction);
    } catch (e) { }
  }
  return {
    type: "orderBy",
    field,
    direction,
    realConstraint
  };
}

export function limit(num) {
  let realConstraint = null;
  if (!isFallbackMode) {
    try {
      realConstraint = realLimit(num);
    } catch (e) { }
  }
  return {
    type: "limit",
    value: num,
    realConstraint
  };
}

// Read wrappers
export async function getDocs(ref) {
  const collectionName = ref.type === "query" ? ref.collectionName : ref.path;

  if (ref.realRef) {
    try {
      const docsPromise = realGetDocs(ref.realRef);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 4000)
      );
      
      const snap = await Promise.race([docsPromise, timeoutPromise]);
      markCloudConnected();

      // Sync to local cache
      try {
        const dataObj = {};
        snap.forEach(doc => {
          dataObj[doc.id] = { ...doc.data(), id: doc.id };
        });
        saveLocalStorageCollection(collectionName, dataObj);
      } catch (e) { }

      return snap;
    } catch (error) {
      console.warn(`getDocs failed or timed out for ${collectionName}. Falling back to cached data:`, error);
    }
  }

  // Local storage query processing
  const data = getLocalStorageCollection(collectionName);
  let filteredData = [...data];

  if (ref.type === "query") {
    ref.constraints.forEach(c => {
      if (c.type === "where") {
        const { field, op, value } = c;
        filteredData = filteredData.filter(item => {
          const itemVal = item[field];
          if (op === "==") return itemVal === value;
          if (op === "!=") return itemVal !== value;
          if (op === ">") return itemVal > value;
          if (op === ">=") return itemVal >= value;
          if (op === "<") return itemVal < value;
          if (op === "<=") return itemVal <= value;
          return true;
        });
      }
    });

    const orderByConstraint = ref.constraints.find(c => c.type === "orderBy");
    if (orderByConstraint) {
      const { field, direction } = orderByConstraint;
      filteredData.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        if (typeof valA === "string") {
          return direction === "desc" ? valB.localeCompare(valA) : valA.localeCompare(valB);
        }
        return direction === "desc" ? valB - valA : valA - valB;
      });
    }

    const limitConstraint = ref.constraints.find(c => c.type === "limit");
    if (limitConstraint) {
      filteredData = filteredData.slice(0, limitConstraint.value);
    }
  }

  const docs = filteredData.map(item => ({
    id: item.id || item.phone || `auto_${Math.random()}`,
    data: () => item,
    exists: () => true
  }));

  return {
    empty: docs.length === 0,
    docs: docs,
    forEach: (callback) => docs.forEach(callback)
  };
}

export async function getDoc(docRef) {
  const collectionName = docRef.collectionName;
  const docId = docRef.docId;

  if (docRef.realRef) {
    try {
      const docPromise = realGetDoc(docRef.realRef);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 4000)
      );
      
      const snap = await Promise.race([docPromise, timeoutPromise]);
      markCloudConnected();

      if (snap.exists()) {
        try {
          const existingData = getLocalStorageDataRaw(collectionName);
          existingData[snap.id] = { ...snap.data(), id: snap.id };
          saveLocalStorageCollection(collectionName, existingData);
        } catch (e) { }
        return snap;
      }
    } catch (error) {
      console.warn(`getDoc failed or timed out for ${collectionName}/${docId}. Falling back to cached data:`, error);
    }
  }

  const fallbackSettings = getLocalStorageDataRaw("settings");
  const resultData = collectionName === "settings" ? fallbackSettings[docId] || fallbackSettings : getLocalStorageDataRaw(collectionName)[docId];

  return {
    id: docId,
    exists: () => !!resultData,
    data: () => resultData || {}
  };
}

// Write wrappers
// Write wrappers
export async function setDoc(docRef, data, options) {
  const collectionName = docRef.collectionName;
  const docId = docRef.docId;

  if (docRef.realRef) {
    try {
      const sanitizedData = sanitizeForFirestore(data);
      if (options) {
        await realSetDoc(docRef.realRef, sanitizedData, options);
      } else {
        await realSetDoc(docRef.realRef, sanitizedData);
      }
      setLocalStorageDoc(collectionName, docId, data);
      return;
    } catch (error) {
      console.error(`setDoc failed in Cloud for ${collectionName}/${docId}. Falling back:`, error);
    }
  }

  setLocalStorageDoc(collectionName, docId, data);
}

export async function addDoc(collectionRef, data) {
  const collectionName = collectionRef.path;

  if (collectionRef.realRef) {
    try {
      const sanitizedData = sanitizeForFirestore(data);
      const realDocRef = await realAddDoc(collectionRef.realRef, sanitizedData);
      setLocalStorageDoc(collectionName, realDocRef.id, { ...data, id: realDocRef.id });
      return {
        id: realDocRef.id,
        path: `${collectionName}/${realDocRef.id}`
      };
    } catch (error) {
      console.error(`addDoc failed in Cloud for collection ${collectionName}. Falling back:`, error);
    }
  }

  const generatedId = addLocalStorageDoc(collectionName, data);
  return {
    id: generatedId,
    path: `${collectionName}/${generatedId}`
  };
}

export async function updateDoc(docRef, data) {
  const collectionName = docRef.collectionName;
  const docId = docRef.docId;

  if (docRef.realRef) {
    try {
      const sanitizedData = sanitizeForFirestore(data);
      await realUpdateDoc(docRef.realRef, sanitizedData);
      updateLocalStorageDoc(collectionName, docId, data);
      return;
    } catch (error) {
      console.error(`updateDoc failed in Cloud for ${collectionName}/${docId}. Falling back:`, error);
    }
  }

  updateLocalStorageDoc(collectionName, docId, data);
}

export async function deleteDoc(docRef) {
  const collectionName = docRef.collectionName;
  const docId = docRef.docId;

  if (docRef.realRef) {
    try {
      await realDeleteDoc(docRef.realRef);
      deleteLocalStorageDoc(collectionName, docId);
      return;
    } catch (error) {
      console.error(`deleteDoc failed in Cloud for ${collectionName}/${docId}. Falling back:`, error);
    }
  }

  deleteLocalStorageDoc(collectionName, docId);
}

// Reactive Snapshots Listener Wrapper for Customer Portal
export function onSnapshot(ref, ...args) {
  let onNext;
  let onError;

  if (typeof args[0] === "function") {
    onNext = args[0];
    onError = args[1];
  } else if (typeof args[1] === "function") {
    onNext = args[1];
    onError = args[2];
  }

  const isDocRef = ref.type === "doc";
  const collectionName = isDocRef ? ref.collectionName : (ref.type === "query" ? ref.collectionName : ref.path);
  const subscriptionId = `sub_b2c_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const subInfo = {
    id: subscriptionId,
    ref,
    collectionName,
    onNext,
    onError,
    realUnsub: null,
    isUsingFallback: false
  };

  activeSubscriptions.push(subInfo);

  const unsubscribe = () => {
    const idx = activeSubscriptions.findIndex(s => s.id === subscriptionId);
    if (idx !== -1) activeSubscriptions.splice(idx, 1);
    if (subInfo.realUnsub) {
      try { subInfo.realUnsub(); } catch (e) { }
    }
    if (fallbackTimer) clearTimeout(fallbackTimer);
  };

  const triggerLocalFallback = () => {
    subInfo.isUsingFallback = true;
    console.warn(`onSnapshot timed out or failed to connect for ${collectionName}. Loading local cached data.`);
    if (isDocRef) {
      getDoc(ref).then(snap => {
        if (onNext) onNext(snap);
      }).catch(err => {
        if (onError) onError(err);
      });
    } else {
      getDocs(ref).then(snap => {
        if (onNext) onNext(snap);
      }).catch(err => {
        if (onError) onError(err);
      });
    }
  };

  let hasReceivedCloudSnapshot = false;
  const fallbackTimer = setTimeout(() => {
    if (!hasReceivedCloudSnapshot) {
      triggerLocalFallback();
    }
  }, 4000);

  if (ref.realRef) {
    try {
      subInfo.realUnsub = realOnSnapshot(ref.realRef,
        (snap) => {
          hasReceivedCloudSnapshot = true;
          clearTimeout(fallbackTimer);
          subInfo.isUsingFallback = false;
          markCloudConnected();

          try {
            if (isDocRef) {
              if (snap.exists()) {
                const existingData = getLocalStorageDataRaw(collectionName);
                existingData[snap.id] = { ...snap.data(), id: snap.id };
                saveLocalStorageCollection(collectionName, existingData);
              }
            } else {
              const dataObj = {};
              snap.forEach(doc => {
                dataObj[doc.id] = { ...doc.data(), id: doc.id };
              });
              saveLocalStorageCollection(collectionName, dataObj);
            }
          } catch (e) { }

          if (onNext) onNext(snap);
        },
        (error) => {
          console.error(`realOnSnapshot error for ${collectionName}. Using fallback:`, error);
          clearTimeout(fallbackTimer);
          if (!hasReceivedCloudSnapshot) {
            triggerLocalFallback();
          } else {
            if (onError) onError(error);
          }
        }
      );
    } catch (err) {
      console.warn(`Failed to initialize realOnSnapshot for ${collectionName}:`, err);
      clearTimeout(fallbackTimer);
      triggerLocalFallback();
    }
  } else {
    clearTimeout(fallbackTimer);
    triggerLocalFallback();
  }

  return unsubscribe;
}

export function getIsFallbackMode() {
  return isFallbackMode;
}

let auth;
try {
  if (app) {
    if (Capacitor.isNativePlatform()) {
      auth = initializeAuth(app, {
        persistence: indexedDBLocalPersistence
      });
      console.log("Firebase Auth initialized with IndexedDB native local persistence.");
    } else {
      auth = getAuth(app);
      console.log("Firebase Auth initialized with standard persistence.");
    }
  }
} catch (error) {
  console.error("Failed to initialize Firebase Auth in B2C Portal:", error);
}

export {
  db,
  auth,
  GoogleAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithCredential
};

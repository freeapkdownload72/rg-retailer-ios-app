import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { PushNotifications } from '@capacitor/push-notifications';
import {
  collection,
  getDocs,
  addDoc,
  getDoc,
  doc,
  query,
  where,
  onSnapshot,
  updateDoc,
  setDoc,
  auth,
  onAuthStateChanged,
  signOut
} from './firebase';
import OnboardingFlow from './components/OnboardingFlow';
import HomeFeed from './components/HomeFeed';
import ProductDetailModal from './components/ProductDetailModal';
import MembershipPaywall from './components/MembershipPaywall';
import CartCheckout from './components/CartCheckout';
import AdminConsole from './components/AdminConsole';
import MyWishlist from './components/MyWishlist';
import MyOrders from './components/MyOrders';
import MyAddresses from './components/MyAddresses';
import MyWallet from './components/MyWallet';
import MyCoupons from './components/MyCoupons';
import LoyaltyPoints from './components/LoyaltyPoints';
import ReferEarn from './components/ReferEarn';
import EditProfile from './components/EditProfile';
import Settings from './components/Settings';
import TryOnStudio from './components/TryOnStudio';
import {
  ShoppingBag,
  Heart,
  Eye,
  User,
  Search,
  Home,
  ShieldCheck,
  Sliders,
  Check,
  ChevronRight,
  Crown,
  Wallet,
  MapPin,
  Ticket,
  Gift,
  Award,
  AlertCircle,
  Info,
  RefreshCw
} from 'lucide-react';

const createInvoicePDF = (order, storeSettings) => {
  try {
    const displayId = order.orderId || order.id || '';
    const cleanId = displayId.slice(-12).toUpperCase();
    const formattedDate = order.date ? new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently';

    const storeName = storeSettings?.storeName || "RG Retailer";
    const storeAddress = storeSettings?.address || "Linking Road, Bandra West, Mumbai";
    const storeEmail = storeSettings?.email || "billing@rgretailer.com";
    const storePhone = storeSettings?.phone || "022-26451210";
    const storeGstin = storeSettings?.gstin || "27AABCRG1210R1Z2";

    // Create PDF document (A4 size: 210 x 297 mm)
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });

    // Outer border frame
    doc.setDrawColor(210, 214, 219);
    doc.setLineWidth(0.3);
    doc.rect(10, 10, 190, 277);

    // Top title stripe
    doc.setFillColor(245, 247, 250);
    doc.rect(10, 10, 190, 12, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text("TAX INVOICE / BILL OF SUPPLY", 15, 18);

    // Brand/Seller Info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(storeName.toUpperCase(), 15, 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text([
      storeName,
      storeAddress,
      `Email: ${storeEmail} | Phone: ${storePhone}`,
      `GSTIN: ${storeGstin}`
    ], 15, 38);

    // Invoice metadata
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text("Invoice details", 130, 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);

    doc.text(`Invoice No:`, 130, 38);
    doc.text(`Invoice Date:`, 130, 43);
    doc.text(`Order ID:`, 130, 48);
    doc.text(`Order Date:`, 130, 53);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`RG-${cleanId}`, 155, 38);
    doc.text(formattedDate, 155, 43);
    doc.text(cleanId, 155, 48);
    doc.text(formattedDate, 155, 53);

    // Horizontal separator line
    doc.setDrawColor(226, 232, 240);
    doc.line(10, 60, 200, 60);

    // Addresses section (Billed From vs Billed To)
    doc.setDrawColor(241, 245, 249);
    doc.setFillColor(252, 252, 252);
    doc.rect(12, 65, 186, 32, 'FD');

    // Left Column - Sold By / Shipping From
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("Sold By", 17, 71);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const soldByLines = [
      storeName,
      ...doc.splitTextToSize(storeAddress, 80)
    ];
    doc.text(soldByLines, 17, 76);

    // Right Column - Billed To / Shipped To
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("Billing & Shipping Address", 110, 71);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    const customerNameVal = order.customerName || 'Guest Customer';
    const customerPhoneVal = `Phone: ${order.phone || 'N/A'}`;
    const customerAddrText = doc.splitTextToSize(order.address || 'No address specified', 80);

    doc.text([
      customerNameVal,
      customerPhoneVal,
      ...customerAddrText
    ], 110, 76);

    // Table Header setup
    const tableY = 105;
    doc.setFillColor(248, 250, 252);
    doc.rect(12, tableY, 186, 8, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(12, tableY, 198, tableY);
    doc.line(12, tableY + 8, 198, tableY + 8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Sl.", 15, tableY + 5.5);
    doc.text("Item Description", 25, tableY + 5.5);
    doc.text("Unit Price", 130, tableY + 5.5, { align: 'right' });
    doc.text("Qty", 155, tableY + 5.5, { align: 'right' });
    doc.text("Total Amount", 195, tableY + 5.5, { align: 'right' });

    // Table Rows loop
    let currentY = tableY + 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);

    const items = order.items || [];
    items.forEach((item, index) => {
      const itemLines = doc.splitTextToSize(item.name || 'Boutique Product', 95);
      const rowHeight = Math.max(itemLines.length * 4.5, 8);

      doc.text(String(index + 1), 15, currentY + 5);

      itemLines.forEach((line, lIdx) => {
        doc.text(line, 25, currentY + 5 + (lIdx * 4.5));
      });

      doc.text(`Rs. ${item.sellingPrice}`, 130, currentY + 5, { align: 'right' });
      doc.text(String(item.qty), 155, currentY + 5, { align: 'right' });
      doc.text(`Rs. ${item.sellingPrice * item.qty}`, 195, currentY + 5, { align: 'right' });

      currentY += rowHeight;

      // Divider between rows
      doc.setDrawColor(241, 245, 249);
      doc.line(12, currentY, 198, currentY);
    });

    // Totals Calculations
    const subtotalVal = order.subtotal || order.totalAmount || 0;
    const couponDeduct = order.couponDiscount || 0;
    const memberDeduct = order.memberDiscount || 0;
    const totalVal = order.totalAmount || 0;

    // Draw Subtotals block
    let calcY = currentY + 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);

    doc.text("Subtotal:", 155, calcY, { align: 'right' });
    doc.setTextColor(15, 23, 42);
    doc.text(`Rs. ${subtotalVal}`, 195, calcY, { align: 'right' });

    if (couponDeduct > 0) {
      calcY += 5;
      doc.setTextColor(16, 185, 129); // green for discount
      doc.text("Coupon Promo Discount:", 155, calcY, { align: 'right' });
      doc.text(`-Rs. ${couponDeduct}`, 195, calcY, { align: 'right' });
    }

    if (memberDeduct > 0) {
      calcY += 5;
      doc.setTextColor(16, 185, 129);
      doc.text("Membership Discount:", 155, calcY, { align: 'right' });
      doc.text(`-Rs. ${memberDeduct}`, 195, calcY, { align: 'right' });
    }

    calcY += 5;
    doc.setTextColor(100, 116, 139);
    doc.text("Shipping Fee:", 155, calcY, { align: 'right' });
    doc.setTextColor(15, 23, 42);
    const shipFee = order.shippingFee !== undefined ? parseFloat(order.shippingFee) : 0;
    if (shipFee > 0) {
      doc.text(`Rs. ${shipFee}`, 195, calcY, { align: 'right' });
    } else {
      doc.text("Rs. 0 (FREE)", 195, calcY, { align: 'right' });
    }

    // Grand Total Box
    calcY += 4;
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.rect(130, calcY, 68, 8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text("Grand Total:", 155, calcY + 5.5, { align: 'right' });
    doc.setTextColor(234, 88, 12); // Flame orange accent
    doc.text(`Rs. ${totalVal}`, 195, calcY + 5.5, { align: 'right' });

    // Payment details info
    calcY += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Payment Mode: ${order.paymentMode || 'Prepaid'} | Payment Status: ${order.paymentStatus || 'Pending'}`, 15, calcY);

    // Declarations & Signatory footer
    const footerY = 250;
    doc.setDrawColor(226, 232, 240);
    doc.line(10, footerY, 200, footerY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text([
      "Declaration:",
      "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
      "This is a computer generated receipt. Under Indian GST law, no signature is required."
    ], 15, footerY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`For ${storeName}`, 195, footerY + 5, { align: 'right' });
    doc.text("Authorised Signatory", 195, footerY + 22, { align: 'right' });

    return doc;
  } catch (e) {
    console.error("PDF generation failed:", e);
    throw e;
  }
};

const getPdfBase64 = (docObj) => {
  const arrayBuffer = docObj.output('arraybuffer');
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const getBestCustomerProfile = async (snapDocs) => {
  if (snapDocs.length === 0) return null;
  if (snapDocs.length === 1) return { ...snapDocs[0].data(), id: snapDocs[0].id };

  // Multiple profiles found (e.g. mock seeded profile vs real authenticated profile)
  // Query subscriptions collection to see if any has an active subscription
  for (const d of snapDocs) {
    const profile = { ...d.data(), id: d.id };
    try {
      const subQ = query(collection(null, 'subscriptions'), where('customerId', '==', d.id));
      const subSnap = await getDocs(subQ);
      if (subSnap.size > 0) {
        console.log("[RG CRM] Multiple profiles. Selected profile with subscription:", d.id);
        return profile;
      }
    } catch (err) {
      console.warn("Failed checking sub for profile:", d.id, err);
    }
  }

  // Fallback 1: Prefer profile that is NOT starting with mock prefix 'cust_default'
  for (const d of snapDocs) {
    if (!d.id.startsWith('cust_default')) {
      console.log("[RG CRM] Multiple profiles. Selected non-default profile:", d.id);
      return { ...d.data(), id: d.id };
    }
  }

  // Fallback 2: Return first one
  return { ...snapDocs[0].data(), id: snapDocs[0].id };
};

function App() {
  // Custom global alert state
  const [globalAlert, setGlobalAlert] = useState({
    show: false,
    message: '',
    title: 'Notification',
    type: 'info'
  });

  // Intercept window.alert to show premium modal
  useEffect(() => {
    window.alert = (message) => {
      if (message === undefined || message === null) return;

      const cleanMessage = String(message);
      let type = 'info';
      let title = 'Notification';

      const lower = cleanMessage.toLowerCase();
      if (
        lower.includes('fail') ||
        lower.includes('error') ||
        lower.includes('invalid') ||
        lower.includes('blocked') ||
        lower.includes('limit') ||
        lower.includes('⚠️')
      ) {
        type = 'error';
        title = 'Error';
      } else if (
        lower.includes('success') ||
        lower.includes('completed') ||
        lower.includes('done') ||
        lower.includes('🎉')
      ) {
        type = 'success';
        title = 'Success';
      }

      setGlobalAlert({
        show: true,
        message: cleanMessage,
        title: title,
        type: type
      });
    };
  }, []);

  // App settings & branding state
  const [storeSettings, setStoreSettings] = useState({
    storeName: "RG Retailer",
    phone: "022-26451210",
    email: "info@rgretailer.com",
    address: "Linking Road, Bandra West, Mumbai",
    logoURL: ""
  });
  const [legalPolicies, setLegalPolicies] = useState({
    privacyUrl: "https://rgretailer.com/privacy",
    privacyText: "1. Data Collection\nWe collect your name, phone number, and delivery addresses to configure your customer account profile and sync retail invoices.\n\n2. Security & Transmission\nAll transaction ledgers and customer data updates are transmitted securely using HTTPS/SSL encryption to our Firebase servers.\n\n3. Purge & Account Deletion\nYou can delete your account directly inside app Settings. Deletion is immediate and permanently deletes your credentials and database logs.",
    termsText: "1. Account Eligibility\nYou must utilize a valid mobile number capable of receiving One-Time Passcodes (OTP) to register and authenticate.\n\n2. Refills and Payments\nWallet balances represent store credit. Refills processed through payment gateways are strictly non-refundable and designated for in-app checkout checkout only.\n\n3. Shipping Agreements\nCurated orders placed on the storefront are fulfilled directly by the partner store. Estimated delivery times are indicative.",
    refundText: "1. Order Cancellation\nOrders can be cancelled by the user up until the order fulfillment status transitions to \"Shipped\" inside the app.\n\n2. Return Period\nEligible purchases can be returned within 7 days of delivery in their original, unused condition with labels intact.\n\n3. Refund Destination\nAll approved refunds are credited back to the customer's store wallet balance within 24 to 48 hours of inspection approval."
  });
  const [loyaltyConfig, setLoyaltyConfig] = useState({
    valuePerPoint: 0.50,
    minRedeem: 100,
    pointsPer100: 10
  });

  // DB datasets
  const [rawProducts, setRawProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [stories, setStories] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [flashSales, setFlashSales] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);

  // Cart & checkout states
  const [cart, setCart] = useState([]);
  const [cartCheckoutStep, setCartCheckoutStep] = useState('bag');
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [useWalletBalance, setUseWalletBalance] = useState(false);

  // Loyalty customer sync
  const [customerPhone, setCustomerPhone] = useState('');
  const [crmCustomer, setCrmCustomer] = useState(null);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [loyaltyMessage, setLoyaltyMessage] = useState('');
  const [placedOrders, setPlacedOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recommendationRules, setRecommendationRules] = useState([]);
  const [categoryOffers, setCategoryOffers] = useState([]);
  const [recommendationSettings, setRecommendationSettings] = useState({
    strategy: 'hybrid',
    weights: {
      gender: 30,
      age: 20,
      history: 25,
      wishlist: 15,
      interest: 10
    }
  });
  const [recommendationABSettings, setRecommendationABSettings] = useState({
    enabled: false,
    splitPercent: 50,
    strategyA: 'hybrid',
    strategyB: 'collaborative',
  });
  const [recommendationBundles, setRecommendationBundles] = useState([]);

  // Checkout form details
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI'); // Default premium UPI

  // Onboarding & navigation state coordination
  const [isOnboarded, setIsOnboarded] = useState(() => {
    return localStorage.getItem('rg_onboarded') === 'true';
  });
  const [activeTab, setActiveTab] = useState('home'); // home, explore, wishlist, saved, you
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [autoOpenTryOn, setAutoOpenTryOn] = useState(false);
  const [membershipTier, setMembershipTier] = useState('Free');
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [paymentGatewayKey, setPaymentGatewayKey] = useState(localStorage.getItem('rg_payment_gateway_key') || '');
  const crmUnsubscribeRef = React.useRef(null);
  const firedNotificationsRef = React.useRef(new Set());
  const [showAdminConsole, setShowAdminConsole] = useState(true);
  const [isReturningUser, setIsReturningUser] = useState(false);

  // Pull-to-refresh states & touch event references
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = React.useRef(0);
  const isAtTopRef = React.useRef(false);

  // Firebase Auth Observer (onAuthStateChanged)
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("Firebase Auth State Changed: User Logged In:", user);

        // Retrieve phone number and email
        const userPhone = user.phoneNumber ? user.phoneNumber.replace('+91', '').trim() : '';
        const userEmail = user.email || '';

        // Attempt to find customer profile in Firestore
        let customerProfile = null;
        try {
          let q = null;
          if (userPhone) {
            q = query(collection(null, 'customers'), where('phone', '==', userPhone));
          } else if (userEmail) {
            q = query(collection(null, 'customers'), where('email', '==', userEmail));
          }

          if (q) {
            const snap = await getDocs(q);
            customerProfile = await getBestCustomerProfile(snap.docs);
          }
        } catch (err) {
          console.error("Error checking customer profile in Firestore:", err);
        }

        if (customerProfile) {
          // Returning User! Load profile automatically and skip quiz
          setIsReturningUser(true);
          const phoneClean = customerProfile.phone || userPhone;
          setCustomerPhone(phoneClean);
          setCustomerName(customerProfile.name || user.displayName || '');
          setMembershipTier(customerProfile.tier || 'Free');
          localStorage.setItem('rg_user_phone', phoneClean);
          localStorage.setItem('rg_onboarded', 'true');
          setIsOnboarded(true);
          handleCheckLoyalty(phoneClean);
        } else {
          // New User!
          setIsReturningUser(false);
          // Store auth metadata temporarily, let them go through onboarding wizard
          if (userPhone) {
            setCustomerPhone(userPhone);
            localStorage.setItem('rg_user_phone', userPhone);
          }
          if (user.displayName) {
            setCustomerName(user.displayName);
          }
        }
      } else {
        console.log("Firebase Auth State Changed: User Logged Out");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleTouchStart = (e) => {
    if (isRefreshing) return;

    // Dynamically bubble up from target element to find the nearest scroll container
    let target = e.target;
    let scrollEl = null;
    while (target && target !== document.body) {
      const style = window.getComputedStyle(target);
      const overflowY = style.overflowY || style.overflow || '';
      if ((overflowY === 'auto' || overflowY === 'scroll') && target.scrollHeight > target.clientHeight) {
        scrollEl = target;
        break;
      }
      target = target.parentElement;
    }

    isAtTopRef.current = !scrollEl || scrollEl.scrollTop === 0;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (isRefreshing || !isAtTopRef.current) return;
    const currentY = e.touches[0].clientY;
    const diffY = currentY - touchStartY.current;

    if (diffY > 0) {
      const distance = Math.min(80, diffY * 0.4);
      setPullDistance(distance);
      if (diffY > 10 && e.cancelable) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = () => {
    if (isRefreshing) return;
    if (pullDistance > 55) {
      triggerDataSync();
    }
    setPullDistance(0);
  };

  const triggerDataSync = async () => {
    setIsRefreshing(true);
    console.log("Pull-to-refresh: Starting boutique data synchronisation...");

    try {
      const keysRef = doc(null, 'settings', 'api_keys');
      const keysSnap = await getDoc(keysRef);
      if (keysSnap.exists()) {
        const data = keysSnap.data();
        console.log("Pull-to-refresh: Loaded API keys. Merchant Key ID:", data.paymentGateway);
        if (data.paymentGateway) {
          setPaymentGatewayKey(data.paymentGateway);
          localStorage.setItem('rg_payment_gateway_key', data.paymentGateway.trim());
        }
        if (data.paymentGatewaySecret) {
          localStorage.setItem('rg_payment_gateway_secret', data.paymentGatewaySecret.trim());
        }
        if (data.tryonUrl) localStorage.setItem('rg_tryon_url', data.tryonUrl.trim());
        if (data.tryonKey) localStorage.setItem('rg_tryon_key', data.tryonKey.trim());
        localStorage.setItem('rg_tryon_engine', data.tryonEngine || 'vertex');
        localStorage.setItem('rg_vertex_project_id', data.vertexProjectId || '');
        localStorage.setItem('rg_vertex_region', data.vertexRegion || 'us-central1');
        localStorage.setItem('rg_vertex_service_account', data.vertexServiceAccount || '');
      }

      const savedPhone = localStorage.getItem('rg_user_phone');
      if (savedPhone) {
        console.log("Pull-to-refresh: Refreshing customer CRM profile for:", savedPhone);
        handleCheckLoyalty(savedPhone);
      }

      const prodSnap = await getDocs(collection(null, 'products'));
      const list = [];
      prodSnap.forEach(d => {
        list.push({ ...d.data(), id: d.id });
      });
      if (list.length > 0) {
        setRawProducts(list);
      }

      const plansSnap = await getDocs(collection(null, 'membership_plans'));
      const plansList = [];
      plansSnap.forEach(d => {
        plansList.push({ ...d.data(), id: d.id });
      });
      if (plansList.length > 0) {
        setMembershipPlans(plansList);
      }

      console.log("Pull-to-refresh: Boutique database successfully synchronized!");
    } catch (err) {
      console.error("Pull-to-refresh sync failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Profile navigation views & dynamic user states
  const [profileSubView, setProfileSubView] = useState('dashboard');
  const [wishlist, setWishlist] = useState(() => {
    return JSON.parse(localStorage.getItem('rg_wishlist') || '[]');
  });
  const [savedAddresses, setSavedAddresses] = useState([
    {
      id: 'addr_default',
      name: 'Manisha Rawat (Home)',
      phone: '7425987654',
      detail: 'Flat 402, Royal Residency, Linking Road, Bandra West, Mumbai, Maharashtra - 400050',
      isDefault: true
    }
  ]);
  const [walletBalance, setWalletBalance] = useState(250.00);
  const [walletTransactions, setWalletTransactions] = useState([
    {
      id: 'tx_welcome',
      amount: 250.00,
      type: 'Deposit',
      description: 'Welcome Sign Up Bonus Balance',
      date: new Date().toISOString().split('T')[0]
    }
  ]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(120);
  const [loyaltyTransactions, setLoyaltyTransactions] = useState([]);
  const [referralsCount, setReferralsCount] = useState(0);

  // System UI status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessId, setOrderSuccessId] = useState(null);
  const [welcomeToast, setWelcomeToast] = useState('');

  // Responsive mobile viewpoint/native capacitor mode detector
  const [isMobileMode, setIsMobileMode] = useState(false);

  // Dynamic promotions matching & markdowns applying
  const getProductDiscountedPrice = (product, discountRules) => {
    if (!product) return 0;
    const basePrice = parseFloat(product.sellingPrice || 0);
    const todayStr = new Date().toISOString().split('T')[0];

    const activeDiscounts = discountRules.filter(d => {
      if (d.isActive === false) return false;
      if (d.startDate && d.startDate > todayStr) return false;
      if (d.endDate && d.endDate < todayStr) return false;

      if (d.appliesTo === 'All') return true;
      if (d.appliesTo === 'Collection' && d.targetCollection && product.category) {
        return String(product.category).trim().toUpperCase() === String(d.targetCollection).trim().toUpperCase();
      }
      if (d.appliesTo === 'Product' && d.targetProductId) {
        return String(product.id) === String(d.targetProductId);
      }
      return false;
    });

    if (activeDiscounts.length === 0) {
      return basePrice;
    }

    let maxDiscountAmount = 0;
    activeDiscounts.forEach(d => {
      let currentDiscount = 0;
      if (d.type === 'Percent') {
        currentDiscount = basePrice * (parseFloat(d.value || 0) / 100);
      } else if (d.type === 'Fixed') {
        currentDiscount = parseFloat(d.value || 0);
      }
      if (currentDiscount > maxDiscountAmount) {
        maxDiscountAmount = currentDiscount;
      }
    });

    const finalPrice = Math.max(basePrice - maxDiscountAmount, 0);
    return Math.round(finalPrice);
  };

  const products = React.useMemo(() => {
    return rawProducts.map(p => {
      const price = getProductDiscountedPrice(p, discounts);
      return {
        ...p,
        originalSellingPrice: p.sellingPrice,
        sellingPrice: price
      };
    });
  }, [rawProducts, discounts]);

  const activeCoupons = React.useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return availableCoupons.filter(c => {
      const isActive = c.isActive !== false;
      const isStarted = !c.startDate || c.startDate <= todayStr;
      const isNotExpired = !c.endDate || c.endDate >= todayStr;
      return isActive && isStarted && isNotExpired;
    });
  }, [availableCoupons]);

  const formattedLoyaltyTransactions = React.useMemo(() => {
    return loyaltyTransactions.map(tx => ({
      id: tx.id,
      description: tx.description || (tx.type === 'earn' ? 'Points earned' : 'Points redeemed'),
      points: tx.amount,
      date: tx.timestamp ? new Date(tx.timestamp).toISOString().split('T')[0] : 'Just now',
      type: tx.type === 'earn' ? 'Earned' : 'Redeemed'
    }));
  }, [loyaltyTransactions]);

  // Keep cart items pricing synchronized with active markdown rules in real-time
  useEffect(() => {
    if (cart.length === 0 || products.length === 0) return;
    setCart(prevCart => {
      let changed = false;
      const updated = [];
      prevCart.forEach(item => {
        const prod = products.find(p => String(p.id) === String(item.id));
        if (prod) {
          if (item.sellingPrice !== prod.sellingPrice) {
            changed = true;
            updated.push({ ...item, sellingPrice: prod.sellingPrice });
          } else {
            updated.push(item);
          }
        } else {
          // Product was deleted from catalog, remove it from cart
          changed = true;
        }
      });
      return changed ? updated : prevCart;
    });
  }, [products]);

  // Handle subscription purchase/upgrades from storefront and sync to Firestore
  const handleUpgradeSubscription = async (tier, cycle = 'monthly') => {
    if (!customerPhone.trim() || customerPhone.length < 10) {
      alert("Please complete onboarding or enter your phone number under Profile tab to subscribe!");
      setActiveTab('you');
      return;
    }

    setIsSubmitting(true);
    try {
      const today = new Date();
      const end = new Date();
      if (cycle === 'monthly') {
        end.setMonth(today.getMonth() + 1);
      } else {
        end.setFullYear(today.getFullYear() + 1);
      }

      const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };

      const startDateStr = formatDate(today);
      const endDateStr = formatDate(end);

      // Defensively compute defaults
      let price = 0;
      const tLower = tier.toLowerCase();
      if (tLower === 'silver') price = cycle === 'monthly' ? 149 : 1490;
      else if (tLower === 'gold') price = cycle === 'monthly' ? 399 : 3990;
      else if (tLower === 'platinum') price = cycle === 'monthly' ? 799 : 7990;

      // Query database configuration
      try {
        const planDoc = await getDoc(doc(null, 'membership_plans', tLower));
        if (planDoc && planDoc.exists()) {
          const pData = planDoc.data();
          price = cycle === 'monthly' ? parseFloat(pData.monthlyPrice || price) : parseFloat(pData.yearlyPrice || price);
        }
      } catch (err) {
        console.warn("Could not load plan price from DB, using defaults:", err);
      }

      let finalCustomerId = crmCustomer ? crmCustomer.id : `cust_${Date.now()}`;
      let finalCustomerName = customerName.trim() || crmCustomer?.name || 'B2C Customer';

      // 1. Create or update subscription record in 'subscriptions' collection
      let subId = null;
      try {
        const q = query(collection(null, 'subscriptions'), where('customerId', '==', finalCustomerId));
        const snap = await getDocs(q);
        snap.forEach(d => {
          subId = d.id;
        });
      } catch (err) {
        console.warn("Error checking existing subscription:", err);
      }

      const subData = {
        customerId: finalCustomerId,
        customerName: finalCustomerName,
        planName: tier,
        status: 'Active',
        billingCycle: cycle,
        price: parseFloat(price),
        autoRenew: true,
        startDate: startDateStr,
        endDate: endDateStr,
        nextBillingDate: endDateStr
      };

      // 1. Create or update subscription record in 'subscriptions' collection
      if (price > 0 && paymentGatewayKey) {
        if (!window.Razorpay) {
          alert("Payment gateway SDK is loading. Please wait a few seconds and try again.");
          setIsSubmitting(false);
          return;
        }

        let razorpaySubscriptionId = null;

        try {
          const keyId = paymentGatewayKey;
          const keySecret = localStorage.getItem('rg_payment_gateway_secret') || '';

          if (keySecret) {
            const authHeader = 'Basic ' + btoa(keyId.trim() + ':' + keySecret.trim());

            // 1. Get or Create Plan in Razorpay
            let razorpayPlanId = cycle === 'monthly' ? planDoc.data()?.razorpayPlanId_monthly : planDoc.data()?.razorpayPlanId_yearly;

            if (!razorpayPlanId) {
              console.log("Creating Razorpay Plan...");
              const planRes = await fetch("https://api.razorpay.com/v1/plans", {
                method: "POST",
                headers: {
                  "Authorization": authHeader,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  period: cycle === 'monthly' ? "monthly" : "yearly",
                  interval: 1,
                  item: {
                    name: `${tier} ${cycle === 'monthly' ? 'Monthly' : 'Yearly'} Plan`,
                    amount: Math.round(price * 100),
                    currency: "INR",
                    description: `RG Premium ${tier} ${cycle === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`
                  }
                })
              });

              if (planRes.ok) {
                const planData = await planRes.json();
                razorpayPlanId = planData.id;

                // Save plan ID to Firestore to reuse
                const planRef = doc(null, 'membership_plans', tLower);
                if (cycle === 'monthly') {
                  await updateDoc(planRef, { razorpayPlanId_monthly: razorpayPlanId });
                } else {
                  await updateDoc(planRef, { razorpayPlanId_yearly: razorpayPlanId });
                }
                console.log("Created and saved Razorpay Plan ID:", razorpayPlanId);
              } else {
                const errText = await planRes.text();
                console.warn("Failed to create Razorpay Plan via API:", errText);
              }
            }

            // 2. Create Subscription in Razorpay
            if (razorpayPlanId) {
              console.log("Creating Razorpay Subscription...");
              const subRes = await fetch("https://api.razorpay.com/v1/subscriptions", {
                method: "POST",
                headers: {
                  "Authorization": authHeader,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  plan_id: razorpayPlanId,
                  total_count: cycle === 'monthly' ? 120 : 10,
                  quantity: 1,
                  customer_notify: 1
                })
              });

              if (subRes.ok) {
                const subResponseData = await subRes.json();
                razorpaySubscriptionId = subResponseData.id;
                console.log("Created Razorpay Subscription ID:", razorpaySubscriptionId);
              } else {
                const errText = await subRes.text();
                console.warn("Failed to create Razorpay Subscription via API:", errText);
              }
            }
          }
        } catch (subErr) {
          console.error("Error setting up Razorpay Subscription API:", subErr);
        }

        const options = {
          key: paymentGatewayKey,
          name: storeSettings.storeName || "RG Retailer",
          description: `RG Premium ${tier} Subscription`,
          image: storeSettings.logoURL || "https://images.unsplash.com/photo-1542272604-787c3835535d?w=100",
          // Enable UPI Intent flow for WebView (Capacitor) — lets checkout.js
          // launch external UPI apps (GPay, PhonePe, Paytm) via deep links
          webview_intent: true,
          handler: async function (response) {
            try {
              const paymentId = response.razorpay_payment_id || `rzp_sim_${Date.now()}`;
              const resSubId = response.razorpay_subscription_id || razorpaySubscriptionId || '';
              const finalSubData = {
                ...subData,
                paymentId: paymentId,
                paymentStatus: 'Paid',
                razorpaySubscriptionId: resSubId
              };

              if (subId) {
                await updateDoc(doc(null, 'subscriptions', subId), finalSubData);
              } else {
                await addDoc(collection(null, 'subscriptions'), finalSubData);
              }

              // 2. Set the customer's tier field in the 'customers' collection
              const customerRef = doc(null, 'customers', finalCustomerId);
              const customerUpdate = {
                id: finalCustomerId,
                tier: tier,
                name: finalCustomerName,
                phone: customerPhone.trim(),
                joinedDate: crmCustomer?.joinedDate || startDateStr
              };
              await setDoc(customerRef, customerUpdate, { merge: true });

              alert(`Successfully subscribed to RG Premium ${tier} Plan! 🎉 Payment ID: ${paymentId}`);
              setActiveTab('you'); // Go back to profile view
            } catch (err) {
              console.error("Error creating subscription after payment success:", err);
              alert("Payment succeeded, but subscription activation failed. Contact support.");
            } finally {
              setIsSubmitting(false);
            }
          },
          prefill: {
            name: customerName.trim() || (crmCustomer ? crmCustomer.name : "Guest Customer"),
            email: crmCustomer?.email || `${customerPhone || "7425987654"}@rgretailer.com`,
            contact: customerPhone.trim() || "7425987654"
          },
          theme: {
            color: "#ff6b35"
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
              console.log("Subscription payment cancelled by user.");
            }
          }
        };

        if (razorpaySubscriptionId) {
          options.subscription_id = razorpaySubscriptionId;
        } else {
          options.amount = Math.round(price * 100);
          options.currency = "INR";
        }

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Safe fallback for sandbox testing or 0 price (or if no key is configured)
        if (subId) {
          await updateDoc(doc(null, 'subscriptions', subId), subData);
        } else {
          await addDoc(collection(null, 'subscriptions'), subData);
        }

        const customerRef = doc(null, 'customers', finalCustomerId);
        const customerUpdate = {
          id: finalCustomerId,
          tier: tier,
          name: finalCustomerName,
          phone: customerPhone.trim(),
          joinedDate: crmCustomer?.joinedDate || startDateStr
        };
        await setDoc(customerRef, customerUpdate, { merge: true });

        alert(`Successfully subscribed to RG Premium ${tier} Plan! 🎉 (Sandbox Mode)`);
        setActiveTab('you'); // Go back to profile view
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Failed to upgrade subscription:", err);
      alert("Subscription purchase failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Real-time subscription sync based on customer record ID
  useEffect(() => {
    if (!crmCustomer?.id) {
      setActiveSubscription(null);
      setMembershipTier('Free');
      return;
    }

    const q = query(collection(null, 'subscriptions'), where('customerId', '==', crmCustomer.id));
    const unsubscribe = onSnapshot(q, (snap) => {
      let activeSub = null;
      const todayStr = new Date().toISOString().split('T')[0];

      snap.forEach(d => {
        const sub = { ...d.data(), id: d.id };
        const isActive = sub.status === 'Active';
        const isNotExpired = !sub.endDate || sub.endDate >= todayStr;
        if (isActive && isNotExpired) {
          activeSub = sub;
        }
      });

      setActiveSubscription(activeSub);
      setMembershipTier(activeSub ? activeSub.planName : 'Free');
    }, (err) => {
      console.error("CRM subscriptions listener error:", err);
    });

    return () => unsubscribe();
  }, [crmCustomer?.id]);

  // Auto-sync recurring subscription status from Razorpay (UPI Autopay roll-over sync)
  useEffect(() => {
    if (!activeSubscription?.razorpaySubscriptionId || !paymentGatewayKey) {
      return;
    }

    const syncSubStatus = async () => {
      try {
        const keyId = paymentGatewayKey;
        const keySecret = localStorage.getItem('rg_payment_gateway_secret') || '';
        if (!keySecret) return;

        const authHeader = 'Basic ' + btoa(keyId.trim() + ':' + keySecret.trim());

        // Fetch subscription status directly from Razorpay REST API
        const response = await fetch(`https://api.razorpay.com/v1/subscriptions/${activeSubscription.razorpaySubscriptionId}`, {
          method: 'GET',
          headers: {
            'Authorization': authHeader
          }
        });

        if (response.ok) {
          const rzpSub = await response.json();
          console.log("Synced active subscription from Razorpay:", rzpSub);

          const status = rzpSub.status;
          const current_end = rzpSub.current_end; // unix timestamp in seconds

          if (current_end) {
            const currentEndDate = new Date(current_end * 1000);
            const y = currentEndDate.getFullYear();
            const m = String(currentEndDate.getMonth() + 1).padStart(2, '0');
            const d = String(currentEndDate.getDate()).padStart(2, '0');
            const currentEndDateStr = `${y}-${m}-${d}`;

            const updateFields = {};
            let changed = false;

            // Roll-over of billing cycle (UPI auto-pay completed)
            if (currentEndDateStr > activeSubscription.endDate) {
              updateFields.endDate = currentEndDateStr;
              updateFields.nextBillingDate = currentEndDateStr;
              updateFields.paymentStatus = 'Paid';
              changed = true;
            }

            // Sync cancellation/expiration status
            const rzpStatusNormalized = (status === 'active' || status === 'authenticated' || status === 'created') ? 'Active' : 'Expired';
            if (rzpStatusNormalized !== activeSubscription.status) {
              updateFields.status = rzpStatusNormalized;
              changed = true;
            }

            if (changed) {
              await updateDoc(doc(null, 'subscriptions', activeSubscription.id), updateFields);
              console.log("Updated local subscription record to match Razorpay state:", updateFields);
            }
          }
        }
      } catch (err) {
        console.error("Error auto-syncing subscription status from Razorpay:", err);
      }
    };

    // Run sync when the subscription is loaded/updated
    syncSubStatus();
  }, [activeSubscription?.id, activeSubscription?.razorpaySubscriptionId, paymentGatewayKey]);

  // Clean up CRM listeners on unmount
  useEffect(() => {
    return () => {
      if (crmUnsubscribeRef.current) {
        crmUnsubscribeRef.current();
      }
    };
  }, []);

  useEffect(() => {
    const checkViewport = () => {
      const hasCapacitor = !!window.Capacitor || (window.webkit && window.webkit.messageHandlers) || window.AndroidBridge;
      const isSmallScreen = window.innerWidth < 768;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobileMode(hasCapacitor || isSmallScreen || isMobileUA);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Load store settings, coupons, and products catalog in real time
  useEffect(() => {
    // Subscribe to membership_plans collection reactively
    const unsubMembershipPlans = onSnapshot(collection(null, 'membership_plans'), (snap) => {
      const list = [];
      snap.forEach(d => {
        list.push({ ...d.data(), id: d.id });
      });
      console.log("APP_MEMBERSHIP_PLANS_FETCHED: " + JSON.stringify(list));
      setMembershipPlans(list);
    }, (err) => {
      console.error("Membership plans snapshot stream failed:", err);
    });

    // Listen to store details reactively from settings/store
    const unsubStore = onSnapshot(doc(null, 'settings', 'store'), (snap) => {
      if (snap && snap.exists()) {
        setStoreSettings(snap.data());
      }
    }, (err) => {
      console.error("Error loading store settings:", err);
    });

    // Listen to legal policies reactively from settings/legal
    const unsubLegal = onSnapshot(doc(null, 'settings', 'legal'), (snap) => {
      if (snap && snap.exists()) {
        setLegalPolicies(snap.data());
      }
    }, (err) => {
      console.error("Error loading legal settings:", err);
    });

    // Listen to loyalty settings reactively from settings/loyalty
    const unsubLoyalty = onSnapshot(doc(null, 'settings', 'loyalty'), (snap) => {
      if (snap && snap.exists()) {
        const lData = snap.data();
        setLoyaltyConfig({
          valuePerPoint: parseFloat(lData.valuePerPoint || 0.50),
          minRedeem: parseInt(lData.minRedeem || 100, 10),
          pointsPer100: parseFloat(lData.pointsPer100 || 10)
        });
      }
    }, (err) => {
      console.error("Error loading loyalty settings:", err);
    });

    // Subscribe to active coupons list reactively
    const unsubCoupons = onSnapshot(collection(null, 'coupons'), (snap) => {
      const coupList = [];
      snap.forEach(d => {
        const data = d.data();
        coupList.push({ ...data, id: d.id });
      });
      setAvailableCoupons(coupList);
    }, (err) => {
      console.error("Coupons snapshot stream failed:", err);
    });

    // Subscribe to discounts collection reactively
    const unsubDiscounts = onSnapshot(collection(null, 'discounts'), (snap) => {
      const list = [];
      snap.forEach(d => {
        list.push({ ...d.data(), id: d.id });
      });
      setDiscounts(list);
    }, (err) => {
      console.error("Failed to sync discounts:", err);
    });

    // Subscribe to available products catalog reactively
    const unsubProducts = onSnapshot(collection(null, 'products'), (snap) => {
      const prodList = [];
      const catSet = new Set(['All']);
      snap.forEach(d => {
        const data = d.data();
        const isOnline = data.isOnlineStore !== false && data.isOnlineStore !== 'false';
        const isDeleted = data.isDeleted === true || data.isDeleted === 'true';
        if (parseInt(data.stockOnline || 0, 10) > 0 && isOnline && !isDeleted) {
          prodList.push({ ...data, id: d.id });
          if (data.category) catSet.add(data.category);
        }
      });
      setRawProducts(prodList);
      setCategories(Array.from(catSet));
      setDbLoading(false);
    }, (err) => {
      console.error("Products snapshot stream failed:", err);
      setDbLoading(false);
    });

    // Subscribe to active recommendation rules reactively
    const unsubRules = onSnapshot(collection(null, 'recommendation_rules'), (snap) => {
      const rulesList = [];
      snap.forEach(d => {
        rulesList.push({ ...d.data(), id: d.id });
      });
      setRecommendationRules(rulesList);
    }, (err) => {
      console.error("Recommendation rules stream failed:", err);
    });

    // Listen to recommendation settings reactively from settings/recommendations
    const unsubRecSettings = onSnapshot(doc(null, 'settings', 'recommendations'), (snap) => {
      if (snap && snap.exists()) {
        setRecommendationSettings(snap.data());
      }
    }, (err) => {
      console.error("Error loading recommendation settings:", err);
    });

    // Listen to master API keys reactively from settings/api_keys
    const unsubApiKeys = onSnapshot(doc(null, 'settings', 'api_keys'), (snap) => {
      if (snap && snap.exists()) {
        const data = snap.data();
        if (data.tryonUrl) {
          localStorage.setItem('rg_tryon_url', data.tryonUrl.trim());
        }
        if (data.tryonKey) {
          localStorage.setItem('rg_tryon_key', data.tryonKey.trim());
        }
        localStorage.setItem('rg_tryon_engine', data.tryonEngine || 'vertex');
        localStorage.setItem('rg_vertex_project_id', data.vertexProjectId || '');
        localStorage.setItem('rg_vertex_region', data.vertexRegion || 'us-central1');
        localStorage.setItem('rg_vertex_service_account', data.vertexServiceAccount || '');
        if (data.paymentGateway) {
          setPaymentGatewayKey(data.paymentGateway);
          localStorage.setItem('rg_payment_gateway_key', data.paymentGateway.trim());
        }
        if (data.paymentGatewaySecret) {
          localStorage.setItem('rg_payment_gateway_secret', data.paymentGatewaySecret.trim());
        }
      }
    }, (err) => {
      console.error("Error loading master API keys in storefront:", err);
    });

    // Listen to recommendation A/B test settings reactively from settings/recommendations_ab
    const unsubRecABSettings = onSnapshot(doc(null, 'settings', 'recommendations_ab'), (snap) => {
      if (snap && snap.exists()) {
        setRecommendationABSettings(snap.data());
      }
    }, (err) => {
      console.error("Error loading recommendation A/B settings:", err);
    });

    // Listen to recommendation bundles collection reactively
    const unsubRecBundles = onSnapshot(collection(null, 'recommendation_bundles'), (snap) => {
      const list = [];
      snap.forEach(d => {
        list.push({ ...d.data(), id: d.id });
      });
      setRecommendationBundles(list);
    }, (err) => {
      console.error("Error loading recommendation bundles:", err);
    });

    // Subscribe to stories collection reactively
    const unsubStories = onSnapshot(collection(null, 'stories'), (snap) => {
      const storiesList = [];
      snap.forEach(d => {
        storiesList.push({ ...d.data(), id: d.id });
      });
      // Sort stories by position ascending
      storiesList.sort((a, b) => {
        const posA = parseInt(a.position ?? 0, 10);
        const posB = parseInt(b.position ?? 0, 10);
        return posA - posB;
      });
      setStories(storiesList);
    }, (err) => {
      console.error("Stories snapshot stream failed:", err);
    });

    // Subscribe to hero_slides collection reactively
    const unsubHeroSlides = onSnapshot(collection(null, 'hero_slides'), (snap) => {
      const slidesList = [];
      snap.forEach(d => {
        slidesList.push({ ...d.data(), id: d.id });
      });
      // Sort by position ascending
      slidesList.sort((a, b) => {
        const posA = parseInt(a.position ?? 0, 10);
        const posB = parseInt(b.position ?? 0, 10);
        return posA - posB;
      });
      setHeroSlides(slidesList);
    }, (err) => {
      console.error("Hero slides snapshot stream failed:", err);
    });

    // Subscribe to outfits collection reactively
    const unsubOutfits = onSnapshot(collection(null, 'outfits'), (snap) => {
      const outfitsList = [];
      snap.forEach(d => {
        outfitsList.push({ ...d.data(), id: d.id });
      });
      // Sort by position ascending
      outfitsList.sort((a, b) => {
        const posA = parseInt(a.position ?? 0, 10);
        const posB = parseInt(b.position ?? 0, 10);
        return posA - posB;
      });
      setOutfits(outfitsList);
    }, (err) => {
      console.error("Outfits snapshot stream failed:", err);
    });

    // Subscribe to category offers collection reactively
    const unsubCategoryOffers = onSnapshot(collection(null, 'category_offers'), (snap) => {
      const list = [];
      snap.forEach(d => {
        list.push({ ...d.data(), id: d.id });
      });
      // Sort newest first
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setCategoryOffers(list);
    }, (err) => {
      console.error("Category offers stream error:", err);
    });

    // Subscribe to flash_sales collection reactively
    const unsubFlashSales = onSnapshot(collection(null, 'flash_sales'), (snap) => {
      const salesList = [];
      snap.forEach(d => {
        salesList.push({ ...d.data(), id: d.id });
      });
      setFlashSales(salesList);
    }, (err) => {
      console.error("Flash sales snapshot stream failed:", err);
    });

    return () => {
      unsubStore();
      unsubLegal();
      unsubLoyalty();
      unsubCoupons();
      unsubDiscounts();
      unsubProducts();
      unsubRules();
      unsubRecSettings();
      unsubRecABSettings();
      unsubRecBundles();
      unsubStories();
      unsubHeroSlides();
      unsubOutfits();
      unsubCategoryOffers();
      unsubFlashSales();
      unsubApiKeys();
      unsubMembershipPlans();
    };
  }, []);

  // Listen to customer's active orders reactively once phone number is set
  useEffect(() => {
    if (!customerPhone.trim()) {
      setPlacedOrders([]);
      return;
    }

    const q = query(collection(null, 'orders'), where('phone', '==', customerPhone.trim()));
    const unsubscribe = onSnapshot(q, (snap) => {
      const orders = [];
      snap.forEach(d => {
        const data = d.data();
        let step = 0;
        const s = (data.status || 'Placed').toLowerCase();
        if (s === 'placed' || s === 'pending') step = 0;
        else if (s === 'confirmed') step = 1;
        else if (s === 'processing' || s === 'packaging') step = 2;
        else if (s === 'shipped') step = 3;
        else if (s === 'out for delivery') step = 4;
        else if (s === 'delivered' || s === 'completed') step = 5;

        orders.push({
          id: d.id,
          date: data.date,
          price: `₹${(data.totalAmount || 0).toLocaleString()}`,
          status: data.status || 'Pending',
          step: step,
          ...data
        });
      });
      // Sort: newest first
      orders.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
      setPlacedOrders(orders);
    }, (err) => {
      console.error("Orders listener error:", err);
    });

    return unsubscribe;
  }, [customerPhone]);

  // Subscribe to customer notifications reactively (Module 10 Dynamic notifications trigger)
  useEffect(() => {
    if (!customerPhone.trim()) {
      setNotifications([]);
      return;
    }

    const q = query(
      collection(null, 'notifications'),
      where('phone', '==', customerPhone.trim())
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = [];
      const nowStr = new Date().toISOString();
      snap.forEach(d => {
        const data = d.data();
        if (data.status === 'Scheduled' && data.createdAt > nowStr) {
          return;
        }
        list.push({ ...data, id: d.id });
      });
      // Sort descending by createdAt
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setNotifications(list);

      // Trigger temporary in-app welcomeToast if there's a new unread notification
      const unread = list.filter(n => !n.read);
      if (unread.length > 0) {
        const newest = unread[0];
        const diff = Date.now() - new Date(newest.createdAt).getTime();
        if (diff < 10000 && !firedNotificationsRef.current.has(newest.id)) {
          firedNotificationsRef.current.add(newest.id);
          setWelcomeToast(`🔔 ${newest.title}: ${newest.message}`);
          setTimeout(() => setWelcomeToast(''), 5000);
          triggerLocalNotification(newest);
        }
      }
    }, (err) => {
      console.error("Notifications listener error:", err);
    });

    return () => unsub();
  }, [customerPhone]);

  // Listen to customer loyalty transactions reactively
  useEffect(() => {
    if (!customerPhone.trim()) {
      setLoyaltyTransactions([]);
      return;
    }

    const q = query(
      collection(null, 'loyalty_transactions'),
      where('customerPhone', '==', customerPhone.trim())
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach(d => {
        list.push({ ...d.data(), id: d.id });
      });
      // Sort: newest first
      list.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
      setLoyaltyTransactions(list);
    }, (err) => {
      console.error("Loyalty transactions listener error:", err);
    });

    return () => unsubscribe();
  }, [customerPhone]);

  const handleNotificationClick = async (notif) => {
    try {
      if (notif.id && !notif.id.startsWith('offer_') && !notif.id.startsWith('fallback_')) {
        const notifRef = doc(null, 'notifications', notif.id);
        await updateDoc(notifRef, { read: true });
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }

    if (!notif.deepLink) return;

    const route = notif.deepLink.toLowerCase();
    if (route === 'home') {
      setActiveTab('home');
    } else if (route === 'paywall') {
      setActiveTab('paywall');
    } else if (route === 'wallet') {
      setActiveTab('you');
      setProfileSubView('wallet');
    } else if (route === 'product' && notif.productId) {
      const match = products.find(p => p.id === notif.productId);
      if (match) {
        setSelectedProduct(match);
      }
    }
  };

  // Trigger Native OS local notification with default sound
  const triggerLocalNotification = async (notif) => {
    try {
      const isNative = Capacitor.isNativePlatform();
      if (!isNative) {
        console.log("LocalNotifications: Web mode. Skipping tray push.");
        return;
      }

      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        const req = await LocalNotifications.requestPermissions();
        if (req.display !== 'granted') {
          console.warn("Display notifications permission was not granted.");
          return;
        }
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            title: notif.title || "RG Retailer Etnic Wear",
            body: notif.message || "New catalog updates dropped!",
            id: Math.floor(10000 + Math.random() * 90000),
            schedule: { at: new Date(Date.now() + 50) },
            sound: 'default',
            channelId: 'rg_alerts', // Route notification alert explicitly to high-importance alerts channel
            extra: {
              id: notif.id,
              deepLink: notif.deepLink || '',
              productId: notif.productId || ''
            }
          }
        ]
      });
      console.log("Successfully scheduled native sound notification.");
    } catch (err) {
      console.error("Failed to trigger local notification sound/alert:", err);
    }
  };

  // Initialize notification channel and prompt for display permissions on boot
  useEffect(() => {
    const initNotifications = async () => {
      try {
        const isNative = Capacitor.isNativePlatform();
        if (!isNative) return;

        // Register default high-importance notification channel with sound
        await LocalNotifications.createChannel({
          id: 'rg_alerts',
          name: 'Campaign Alerts',
          description: 'General push notifications and campaign updates',
          importance: 5, // IMPORTANCE_HIGH (heads-up banner + sound alert)
          sound: 'default',
          vibration: true,
          visibility: 1
        });
        console.log("Capacitor: Notification channel 'rg_alerts' verified/created.");

        // Request display permission immediately on boot to prompt user
        const perm = await LocalNotifications.checkPermissions();
        if (perm.display !== 'granted') {
          if (perm.display === 'denied') {
            alert("⚠️ Push Notifications are disabled. Please enable notifications in your phone Settings under 'RG Retailer Etnic Wear' to receive alerts and promotional updates with sound.");
          } else {
            const req = await LocalNotifications.requestPermissions();
            if (req.display !== 'granted') {
              console.warn("Notifications permission denied on boot.");
              alert("⚠️ Push Notifications are disabled. Please enable notifications in your phone Settings under 'RG Retailer Etnic Wear' to receive alerts and promotional updates with sound.");
            } else {
              console.log("Notifications permission granted on boot.");
            }
          }
        } else {
          console.log("Notifications permission already granted.");
        }
      } catch (err) {
        console.error("Failed to initialize local notifications on boot:", err);
      }
    };

    initNotifications();
  }, []);

  // Register tap actions to listen for native notification clicks
  useEffect(() => {
    let clickListener = null;
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      try {
        clickListener = LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
          console.log("Notification tap action triggered:", action);
          const extra = action.notification?.extra;
          if (extra) {
            handleNotificationClick({
              id: extra.id,
              deepLink: extra.deepLink,
              productId: extra.productId
            });
          }
        });
      } catch (err) {
        console.warn("Could not register local notifications clicked listener:", err);
      }
    }

    return () => {
      if (clickListener) {
        clickListener.remove();
      }
    };
  }, [products]);

  // Native Push Notifications Registration and Token Sync
  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    if (!isNative) {
      return;
    }

    const initPushNotifications = async () => {
      try {
        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
          console.warn("Push notifications permission not granted.");
          return;
        }

        // 1. Add listeners first to avoid race conditions
        const regListener = await PushNotifications.addListener('registration', async (token) => {
          console.log('Push notification registration success, token:', token.value);
          localStorage.setItem('rg_fcm_token', token.value);

          if (crmCustomer?.id) {
            try {
              const custRef = doc(null, 'customers', crmCustomer.id);
              await updateDoc(custRef, { fcmToken: token.value });
              console.log("Customer FCM Token successfully updated in Firestore!");
            } catch (err) {
              console.error("Failed to save FCM Token to customer document:", err);
            }
          }
        });

        const errListener = await PushNotifications.addListener('registrationError', (error) => {
          console.error('Push notification registration error:', error);
        });

        const recvListener = await PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Foreground Push received:', notification);
          setWelcomeToast(`🔔 ${notification.title}: ${notification.body}`);
          setTimeout(() => setWelcomeToast(''), 5000);
        });

        const actionListener = await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          console.log('Push action performed:', action);
          const data = action.notification?.data;
          if (data && data.deepLink) {
            handleNotificationClick({
              id: data.id || `push_${Date.now()}`,
              deepLink: data.deepLink,
              productId: data.productId || ''
            });
          }
        });

        // 2. Now register with APNS/FCM
        await PushNotifications.register();

        return () => {
          regListener.remove();
          errListener.remove();
          recvListener.remove();
          actionListener.remove();
        };
      } catch (err) {
        console.error("Failed to initialize Native Push Notifications:", err);
      }
    };

    initPushNotifications();
  }, [crmCustomer?.id]);

  // Fetch Loyalty profile by Phone
  const handleCheckLoyalty = (phoneVal) => {
    if (!phoneVal.trim() || phoneVal.length < 10) {
      setLoyaltyMessage("Enter a valid 10-digit number.");
      return;
    }

    setLoyaltyMessage("Checking CRM profile...");

    // Clean up previous profile listener if any
    if (crmUnsubscribeRef.current) {
      crmUnsubscribeRef.current();
      crmUnsubscribeRef.current = null;
    }

    try {
      const q = query(collection(null, 'customers'), where('phone', '==', phoneVal.trim()));

      const unsubscribe = onSnapshot(q, async (snap) => {
        try {
          const foundCustomer = await getBestCustomerProfile(snap.docs);
          if (foundCustomer) {
            setCrmCustomer(foundCustomer);
            setCustomerName(foundCustomer.name || '');
            setLoyaltyMessage(`Welcome back, ${foundCustomer.name}!`);
            setMembershipTier(foundCustomer.tier || 'Free');
          } else {
            setCrmCustomer(null);
            setUseLoyaltyPoints(false);
            setLoyaltyMessage("New profile will be created upon checkout.");
            setMembershipTier('Free');
          }
        } catch (err) {
          console.error("Error resolving customer in checkLoyalty:", err);
        }
      }, (err) => {
        console.error("Error verifying loyalty profile:", err);
        setLoyaltyMessage("Sandbox sync complete.");
      });

      crmUnsubscribeRef.current = unsubscribe;
      setCustomerPhone(phoneVal.trim());
      localStorage.setItem('rg_user_phone', phoneVal.trim());
    } catch (err) {
      console.error("Error setting up customer sync listener:", err);
    }
  };

  // Load saved CRM phone, pre-load Razorpay, and loyalty record on mount if onboarded
  useEffect(() => {
    // Initialise dark mode state from local storage on launch
    const isDark = localStorage.getItem('rg_settings_dark') === 'true';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Dynamic Razorpay script pre-load
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('Razorpay checkout overlay script successfully loaded.');
    };
    script.onerror = () => {
      console.error('Razorpay checkout overlay script loading failed.');
    };
    document.body.appendChild(script);

    if (isOnboarded) {
      const savedPhone = localStorage.getItem('rg_user_phone');
      if (savedPhone) {
        setCustomerPhone(savedPhone);
        handleCheckLoyalty(savedPhone);
      }
    }

    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) { }
    };
  }, [isOnboarded]);

  // Persist Wishlist state changes
  useEffect(() => {
    localStorage.setItem('rg_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Synchronize dynamic balances with crmCustomer
  useEffect(() => {
    if (crmCustomer) {
      // Sync cached FCM token from local storage to Firestore if missing/different
      const cachedToken = localStorage.getItem('rg_fcm_token');
      if (cachedToken && crmCustomer.id && crmCustomer.fcmToken !== cachedToken) {
        const syncToken = async () => {
          try {
            const custRef = doc(null, 'customers', crmCustomer.id);
            await updateDoc(custRef, { fcmToken: cachedToken });
            console.log("FCM Token synced to customer document from local storage.");
          } catch (err) {
            console.error("Failed to sync cached FCM token to customer:", err);
          }
        };
        syncToken();
      }

      // Generate a referral code if missing
      if (!crmCustomer.referralCode && crmCustomer.id) {
        const cleanName = (crmCustomer.name || 'RG').replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();
        const cleanPhone = (crmCustomer.phone || '0000').slice(-4);
        const generatedCode = `${cleanName}${cleanPhone}`;

        const generateRefCode = async () => {
          try {
            const custRef = doc(null, 'customers', crmCustomer.id);
            await updateDoc(custRef, { referralCode: generatedCode });
            console.log("Generated and saved missing referral code:", generatedCode);
            setCrmCustomer(prev => ({ ...prev, referralCode: generatedCode }));
          } catch (err) {
            console.error("Failed to generate and save referral code:", err);
          }
        };
        generateRefCode();
      }

      // Fetch dynamic referrals count
      if (crmCustomer.referralCode) {
        const fetchReferrals = async () => {
          try {
            const refQ = query(collection(null, 'customers'), where('referredBy', '==', crmCustomer.referralCode));
            const refSnap = await getDocs(refQ);
            setReferralsCount(refSnap.docs.length);
          } catch (err) {
            console.error("Error querying referrals count:", err);
          }
        };
        fetchReferrals();
      }

      if (crmCustomer.walletBalance !== undefined) {
        setWalletBalance(parseFloat(crmCustomer.walletBalance));
      }
      if (crmCustomer.loyaltyPoints !== undefined) {
        setLoyaltyPoints(parseInt(crmCustomer.loyaltyPoints, 10));
      }
      if (crmCustomer.name && !customerName) {
        setCustomerName(crmCustomer.name);
      }
      if (crmCustomer.address && !deliveryAddress) {
        setDeliveryAddress(crmCustomer.address);
      }
      if (crmCustomer.addresses && Array.isArray(crmCustomer.addresses)) {
        setSavedAddresses(crmCustomer.addresses);
      }
      if (crmCustomer.transactions && Array.isArray(crmCustomer.transactions)) {
        setWalletTransactions(crmCustomer.transactions);
      }

      // Compile POS address fields if addresses array is empty or undefined
      if ((!crmCustomer.addresses || crmCustomer.addresses.length === 0) &&
        (crmCustomer.addressLine1 || crmCustomer.city || crmCustomer.state || crmCustomer.pincode)) {
        const newAddrId = `addr_${Date.now()}`;
        const compiledAddr = {
          id: newAddrId,
          label: 'POS Address',
          name: crmCustomer.name || customerName || 'Valued Customer',
          phone: crmCustomer.phone || customerPhone || '',
          addressLine1: crmCustomer.addressLine1 || '',
          city: crmCustomer.city || 'Mumbai',
          state: crmCustomer.state || 'Maharashtra',
          pincode: crmCustomer.pincode || '',
          isDefault: true,
          detail: `${crmCustomer.addressLine1 || ''}, ${crmCustomer.city || 'Mumbai'}, ${crmCustomer.state || 'Maharashtra'} - ${crmCustomer.pincode || ''}`.trim().replace(/^,\s*/, '')
        };

        const updateAddressOnCloud = async () => {
          try {
            const custRef = doc(null, 'customers', crmCustomer.id);
            await updateDoc(custRef, {
              addresses: [compiledAddr]
            });
            setSavedAddresses([compiledAddr]);
            setDeliveryAddress(compiledAddr.detail);
            setCrmCustomer(prev => ({
              ...prev,
              addresses: [compiledAddr]
            }));
          } catch (err) {
            console.error("Failed to compile and sync POS address to CRM:", err);
          }
        };
        updateAddressOnCloud();
      }
    }
  }, [crmCustomer]);

  // Wishlist toggle handler
  const handleToggleWishlist = (productId) => {
    setWishlist(prev => {
      const next = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      if (prev.includes(productId)) {
        try {
          const tryOnImages = JSON.parse(localStorage.getItem('rg_wishlist_tryon_images') || '{}');
          if (tryOnImages[productId]) {
            delete tryOnImages[productId];
            localStorage.setItem('rg_wishlist_tryon_images', JSON.stringify(tryOnImages));
          }
        } catch (e) {
          console.error(e);
        }
      }
      return next;
    });
  };

  // Wallet and Loyalty point loaders / handlers
  const handleAddMoney = (amount) => {
    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        alert("Payment gateway SDK is loading. Please wait a few seconds and try again.");
        reject(new Error("Razorpay SDK not loaded"));
        return;
      }

      if (!paymentGatewayKey) {
        alert("Payment gateway is not configured. Refilling wallet using simulator.");
        // Simulated payment flow for testing/fallback
        setTimeout(async () => {
          const newBalance = walletBalance + amount;
          setWalletBalance(newBalance);

          const newTx = {
            id: `tx_${Date.now()}`,
            amount: amount,
            type: 'Deposit',
            description: 'Refilled Wallet (Simulated)',
            date: new Date().toISOString().split('T')[0]
          };
          setWalletTransactions(prev => [newTx, ...prev]);

          if (crmCustomer) {
            try {
              const custRef = doc(null, 'customers', crmCustomer.id);
              const updatedTxs = [newTx, ...(crmCustomer.transactions || [])];
              await updateDoc(custRef, {
                walletBalance: newBalance,
                transactions: updatedTxs
              });
              setCrmCustomer(prev => ({
                ...prev,
                walletBalance: newBalance,
                transactions: updatedTxs
              }));
            } catch (err) {
              console.error("Failed to sync wallet top-up to CRM:", err);
            }
          }
          resolve();
        }, 1000);
        return;
      }

      const options = {
        key: paymentGatewayKey,
        amount: Math.round(amount * 100), // in paise
        currency: "INR",
        name: storeSettings.storeName || "RG Retailer",
        description: `Wallet Refill (₹${amount})`,
        image: storeSettings.logoURL || "https://images.unsplash.com/photo-1542272604-787c3835535d?w=100",
        webview_intent: true,
        handler: async function (response) {
          try {
            const paymentId = response.razorpay_payment_id || `rzp_sim_${Date.now()}`;
            const newBalance = walletBalance + amount;
            setWalletBalance(newBalance);

            const newTx = {
              id: `tx_deposit_${Date.now()}`,
              amount: amount,
              type: 'Deposit',
              description: `Wallet Refill (ID: ${paymentId})`,
              date: new Date().toISOString().split('T')[0]
            };
            setWalletTransactions(prev => [newTx, ...prev]);

            if (crmCustomer) {
              const custRef = doc(null, 'customers', crmCustomer.id);
              const updatedTxs = [newTx, ...(crmCustomer.transactions || [])];
              await updateDoc(custRef, {
                walletBalance: newBalance,
                transactions: updatedTxs
              });
              setCrmCustomer(prev => ({
                ...prev,
                walletBalance: newBalance,
                transactions: updatedTxs
              }));
            }
            resolve();
          } catch (err) {
            console.error("Error crediting wallet after payment:", err);
            reject(err);
          }
        },
        prefill: {
          name: customerName.trim() || (crmCustomer ? crmCustomer.name : "Guest Customer"),
          email: crmCustomer?.email || `${customerPhone || "7425987654"}@rgretailer.com`,
          contact: customerPhone.trim() || "7425987654"
        },
        theme: {
          color: "#4f46e5"
        },
        modal: {
          ondismiss: function () {
            console.log("Wallet payment window cancelled by user.");
            reject(new Error("Payment cancelled by user"));
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  const handleRedeemReward = async (pointsCost, walletValue) => {
    const newPoints = Math.max(0, loyaltyPoints - pointsCost);
    const newWallet = walletBalance + walletValue;

    setLoyaltyPoints(newPoints);
    setWalletBalance(newWallet);

    const newTx = {
      id: `tx_redeem_${Date.now()}`,
      amount: walletValue,
      type: 'Deposit',
      description: `Redeemed ${pointsCost} points for Wallet Reward`,
      date: new Date().toISOString().split('T')[0]
    };
    setWalletTransactions(prev => [newTx, ...prev]);

    if (crmCustomer) {
      try {
        const custRef = doc(null, 'customers', crmCustomer.id);
        const updatedTxs = [newTx, ...(crmCustomer.transactions || [])];
        await updateDoc(custRef, {
          loyaltyPoints: newPoints,
          walletBalance: newWallet,
          transactions: updatedTxs
        });
        setCrmCustomer(prev => ({
          ...prev,
          loyaltyPoints: newPoints,
          walletBalance: newWallet,
          transactions: updatedTxs
        }));

        // Write audit log transaction record
        await addDoc(collection(null, 'loyalty_transactions'), {
          customerId: crmCustomer.id,
          customerName: crmCustomer.name || customerName.trim() || customerPhone.trim() || 'Anonymous Client',
          customerPhone: customerPhone.trim() || crmCustomer.phone || '',
          type: 'redeem',
          amount: -pointsCost,
          timestamp: new Date().toISOString(),
          description: `Redeemed ${pointsCost} points for ₹${walletValue} Wallet Coupon`
        });
      } catch (err) {
        console.error("Failed to sync redeemed points to CRM:", err);
      }
    }
  };

  // Saved Addresses Handlers
  const handleAddAddress = async (newAddr) => {
    const newId = `addr_${Date.now()}`;
    const newAddrObj = {
      ...newAddr,
      id: newId,
      detail: newAddr.detail || `${newAddr.line1}${newAddr.line2 ? ', ' + newAddr.line2 : ''}, ${newAddr.city}, ${newAddr.state} - ${newAddr.pinCode || newAddr.pincode}`
    };
    const updated = [...savedAddresses, newAddrObj];
    setSavedAddresses(updated);

    // Set default or first address as current deliveryAddress
    if (newAddr.isDefault || savedAddresses.length === 0) {
      setDeliveryAddress(newAddrObj.detail);
    }

    if (crmCustomer) {
      try {
        const custRef = doc(null, 'customers', crmCustomer.id);
        await updateDoc(custRef, {
          addresses: updated
        });
      } catch (err) {
        console.error("Error saving new address to Firestore CRM:", err);
      }
    }
  };

  const handleDeleteAddress = async (addrId) => {
    const updated = savedAddresses.filter(a => a.id !== addrId);
    setSavedAddresses(updated);

    if (crmCustomer) {
      try {
        const custRef = doc(null, 'customers', crmCustomer.id);
        await updateDoc(custRef, {
          addresses: updated
        });
      } catch (err) {
        console.error("Error deleting address from Firestore CRM:", err);
      }
    }
  };

  // Profile Save handler
  const handleSaveProfile = async (updatedData) => {
    setCustomerName(updatedData.name);
    setCustomerPhone(updatedData.phone);

    if (crmCustomer) {
      try {
        const custRef = doc(null, 'customers', crmCustomer.id);
        await updateDoc(custRef, {
          name: updatedData.name,
          phone: updatedData.phone,
          gender: updatedData.gender,
          ageGroup: updatedData.ageGroup,
          photoURL: updatedData.photoURL || ''
        });
        setCrmCustomer(prev => ({
          ...prev,
          name: updatedData.name,
          phone: updatedData.phone,
          gender: updatedData.gender,
          ageGroup: updatedData.ageGroup,
          photoURL: updatedData.photoURL || ''
        }));
      } catch (err) {
        console.error("Failed to sync profile update to CRM:", err);
      }
    } else if (updatedData.phone) {
      const newCustId = `cust_${Date.now()}`;
      const newCust = {
        id: newCustId,
        name: updatedData.name,
        phone: updatedData.phone,
        email: `${updatedData.phone}@rgretailer.com`,
        address: deliveryAddress || 'Default Address',
        gender: updatedData.gender,
        ageGroup: updatedData.ageGroup,
        photoURL: updatedData.photoURL || '',
        loyaltyPoints: loyaltyPoints,
        walletBalance: walletBalance,
        outstandingBalance: 0,
        city: 'Mumbai',
        state: 'Maharashtra',
        dob: '1998-05-29',
        rating: 'Normal',
        ledger: [],
        tier: membershipTier,
        source: 'App',
        joinedDate: new Date().toISOString().split('T')[0]
      };
      try {
        await setDoc(doc(null, 'customers', newCustId), newCust);
        setCrmCustomer(newCust);
      } catch (err) {
        console.error("Failed to register new CRM customer:", err);
      }
    }
    alert("Profile saved successfully! CRM synced.");
    setProfileSubView('dashboard');
  };

  const handleUpdateCustomerSettings = async (settingsKey, val) => {
    if (crmCustomer) {
      try {
        const custRef = doc(null, 'customers', crmCustomer.id);
        const currentSettings = crmCustomer.settings || {};
        const updatedSettings = { ...currentSettings, [settingsKey]: val };
        await updateDoc(custRef, {
          settings: updatedSettings
        });
        setCrmCustomer(prev => ({
          ...prev,
          settings: updatedSettings
        }));
      } catch (err) {
        console.error("Failed to update user settings in Firestore:", err);
      }
    }
  };

  const handleOnboardingComplete = async (data) => {
    try {
      console.log("Onboarding complete called with data:", JSON.stringify(data));
      setMembershipTier(data.membershipTier || 'Free');
      if (data.phone) {
        const phoneClean = data.phone.trim();
        console.log("Onboarding phone clean:", phoneClean);
        setCustomerPhone(phoneClean);
        localStorage.setItem('rg_user_phone', phoneClean);

        // Save/merge onboarding details to Firestore in the 'customers' collection
        console.log("Saving preferences to database...");
        try {
          const q = query(collection(null, 'customers'), where('phone', '==', phoneClean));
          console.log("Query created. Fetching docs...");
          const snap = await getDocs(q);
          console.log("docs fetched successfully.");
          let customerDocId = null;
          let existingData = {};
          snap.forEach(d => {
            customerDocId = d.id;
            existingData = d.data();
          });
          console.log("Found existing customerDocId:", customerDocId);

          let matchedReferrer = null;
          if (data.referredByCode) {
            console.log("Verifying referral code:", data.referredByCode);
            try {
              const refQ = query(collection(null, 'customers'), where('referralCode', '==', data.referredByCode.trim()));
              const refSnap = await getDocs(refQ);
              refSnap.forEach(d => {
                matchedReferrer = { ...d.data(), id: d.id };
              });
              console.log("Matched referrer:", JSON.stringify(matchedReferrer));
            } catch (err) {
              console.error("Error checking referral code validity:", err);
            }
          }

          if (matchedReferrer) {
            try {
              const referrerRef = doc(null, 'customers', matchedReferrer.id);
              const referrerNewWallet = (parseFloat(matchedReferrer.walletBalance) || 0) + 100.00;
              const referrerNewTx = {
                id: `tx_referrer_${Date.now()}`,
                amount: 100.00,
                type: 'Deposit',
                description: `Referral reward for inviting ${data.name || 'Friend'}`,
                date: new Date().toISOString().split('T')[0]
              };
              const referrerUpdatedTxs = [referrerNewTx, ...(matchedReferrer.transactions || [])];
              await updateDoc(referrerRef, {
                walletBalance: referrerNewWallet,
                transactions: referrerUpdatedTxs
              });
              console.log("Referrer wallet successfully credited!");
            } catch (err) {
              console.error("Failed to credit referrer wallet:", err);
            }
          }

          const welcomeAmount = 250.00;
          const referralAmount = matchedReferrer ? 100.00 : 0.00;
          const initialWallet = welcomeAmount + referralAmount;

          const generatedReferralCode = `${(data.name || 'RG').replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase()}${phoneClean.slice(-4)}`;

          const defaultTransactions = [
            {
              id: 'tx_welcome',
              amount: welcomeAmount,
              type: 'Deposit',
              description: 'Welcome Sign Up Bonus Balance',
              date: new Date().toISOString().split('T')[0]
            }
          ];
          if (matchedReferrer) {
            defaultTransactions.push({
              id: `tx_referred_${Date.now()}`,
              amount: referralAmount,
              type: 'Deposit',
              description: `Referral signup bonus (Referred by ${matchedReferrer.name || 'Friend'})`,
              date: new Date().toISOString().split('T')[0]
            });
          }

          const updatedData = {
            name: data.name || existingData.name || 'Mike',
            phone: phoneClean,
            email: data.email || existingData.email || auth.currentUser?.email || '',
            gender: data.gender || existingData.gender || 'Women',
            ageRange: data.ageRange || existingData.ageRange || '25–34',
            profession: data.profession || existingData.profession || 'Casual',
            stylePersona: data.stylePersona || existingData.stylePersona || 'Minimalist',
            interests: (data.interests && data.interests.length > 0) ? data.interests : (data.stylePersona ? data.stylePersona.split(',').map(s => s.trim()) : (existingData.interests || [])),
            tier: existingData.tier || 'Free',
            joinedDate: existingData.joinedDate || new Date().toISOString().split('T')[0],
            walletBalance: existingData.walletBalance !== undefined ? parseFloat(existingData.walletBalance) : initialWallet,
            loyaltyPoints: existingData.loyaltyPoints !== undefined ? parseInt(existingData.loyaltyPoints, 10) : 120,
            referralCode: existingData.referralCode || generatedReferralCode,
            referredBy: existingData.referredBy || (matchedReferrer ? matchedReferrer.referralCode : ''),
            transactions: existingData.transactions || defaultTransactions
          };

          if (customerDocId) {
            console.log("Updating customer doc reference...");
            await setDoc(doc(null, 'customers', customerDocId), updatedData, { merge: true });
          } else {
            console.log("Adding new customer doc reference...");
            const newDocRef = await addDoc(collection(null, 'customers'), updatedData);
            console.log("New customer doc added with ID:", newDocRef.id);
            await setDoc(doc(null, 'customers', newDocRef.id), { id: newDocRef.id }, { merge: true });
          }
          console.log("Customer preferences saved successfully.");
        } catch (err) {
          console.error("Failed to save onboarding preferences to cloud:", err);
        }

        console.log("Checking loyalty points for phone:", phoneClean);
        handleCheckLoyalty(phoneClean);
      }
      
      console.log("Processing welcome coupons and notifications...");
      if (data.hasStyleDiscount) {
        setActiveCoupon({
          id: 'style10',
          code: 'STYLE10',
          type: 'Percent',
          value: 10,
          minOrder: 0,
          maxDiscount: 1000,
          status: 'Active'
        });
        setWelcomeToast('Welcome Curation Coupon STYLE10 (10% OFF) Applied!');
        setTimeout(() => setWelcomeToast(''), 4500);
      } else {
        setWelcomeToast('Preferences saved successfully! Curation active.');
        setTimeout(() => setWelcomeToast(''), 3000);
      }
      console.log("Saving onboarding status locally...");
      localStorage.setItem('rg_onboarded', 'true');
      setIsOnboarded(true);
      console.log("Onboarding flow successfully completed!");
    } catch (err) {
      console.error("CRITICAL ERROR IN ONBOARDING COMPLETE CALLBACK:", err);
      alert("Onboarding Error: " + (err.message || String(err)));
    }
  };

  const handleClearCache = async () => {
    console.log("Clearing cached local storage settings and API keys...");
    localStorage.removeItem('rg_payment_gateway_key');
    localStorage.removeItem('rg_payment_gateway_secret');
    localStorage.removeItem('rg_tryon_url');
    localStorage.removeItem('rg_tryon_key');
    localStorage.removeItem('rg_tryon_engine');
    localStorage.removeItem('rg_vertex_project_id');
    localStorage.removeItem('rg_vertex_region');
    localStorage.removeItem('rg_vertex_service_account');

    // Reset local state to reflect change immediately
    setPaymentGatewayKey('');

    // Re-fetch fresh configurations from Firestore
    try {
      const keysRef = doc(null, 'settings', 'api_keys');
      const keysSnap = await getDoc(keysRef);
      if (keysSnap.exists()) {
        const data = keysSnap.data();
        console.log("Refetched API keys after cache clear:", data.paymentGateway);
        if (data.paymentGateway) {
          setPaymentGatewayKey(data.paymentGateway);
          localStorage.setItem('rg_payment_gateway_key', data.paymentGateway.trim());
        }
        if (data.paymentGatewaySecret) {
          localStorage.setItem('rg_payment_gateway_secret', data.paymentGatewaySecret.trim());
        }
        if (data.tryonUrl) localStorage.setItem('rg_tryon_url', data.tryonUrl.trim());
        if (data.tryonKey) localStorage.setItem('rg_tryon_key', data.tryonKey.trim());
        localStorage.setItem('rg_tryon_engine', data.tryonEngine || 'vertex');
        localStorage.setItem('rg_vertex_project_id', data.vertexProjectId || '');
        localStorage.setItem('rg_vertex_region', data.vertexRegion || 'us-central1');
        localStorage.setItem('rg_vertex_service_account', data.vertexServiceAccount || '');
      }
      alert("Cache cleared successfully! Dynamic API keys synced from Firestore.");
    } catch (err) {
      console.error("Failed to sync API keys on cache clear:", err);
      alert("Cache cleared, but failed to sync from Firestore. Check your connection.");
    }
    setProfileSubView('dashboard');
  };

  const handleSignOut = async () => {
    localStorage.removeItem('rg_user_phone');
    localStorage.removeItem('rg_onboarded');
    setCustomerPhone('');
    setCrmCustomer(null);
    setCustomerName('');
    setIsOnboarded(false);
    setActiveTab('home');
    setProfileSubView('dashboard');

    if (auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Firebase Auth signout error:", err);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (crmCustomer && crmCustomer.id) {
      try {
        await deleteDoc(doc(null, 'customers', crmCustomer.id));
        alert("Your account and all associated profile details have been permanently deleted.");
      } catch (err) {
        console.error("Failed to delete customer profile document:", err);
      }
    } else {
      alert("Account request submitted. Data purge completed.");
    }
    handleSignOut();
  };

  // Render method for Profile sub views
  const renderProfileTab = () => {
    const initials = customerName ? customerName.trim().split(/\s+/).map(p => p[0]).join('').toUpperCase().slice(0, 2) : 'MR';

    if (profileSubView === 'orders') {
      return (
        <MyOrders
          placedOrders={placedOrders}
          products={products}
          onClose={() => setProfileSubView('dashboard')}
          onDownloadInvoice={handleDownloadInvoicePDF}
          onShareInvoice={handleShareInvoicePDF}
        />
      );
    }

    if (profileSubView === 'addresses') {
      return (
        <MyAddresses
          savedAddresses={savedAddresses}
          onAddAddress={handleAddAddress}
          onDeleteAddress={handleDeleteAddress}
          onClose={() => setProfileSubView('dashboard')}
        />
      );
    }

    if (profileSubView === 'wallet') {
      return (
        <MyWallet
          balance={walletBalance}
          transactions={walletTransactions}
          onAddMoney={handleAddMoney}
          onClose={() => setProfileSubView('dashboard')}
        />
      );
    }

    if (profileSubView === 'coupons') {
      return (
        <MyCoupons
          availableCoupons={availableCoupons}
          activeCoupon={activeCoupon}
          onApplyCoupon={setActiveCoupon}
          onClose={() => setProfileSubView('dashboard')}
        />
      );
    }

    if (profileSubView === 'loyalty') {
      return (
        <LoyaltyPoints
          points={loyaltyPoints}
          history={formattedLoyaltyTransactions}
          onRedeemReward={handleRedeemReward}
          onClose={() => setProfileSubView('dashboard')}
        />
      );
    }

    if (profileSubView === 'refer') {
      return (
        <ReferEarn
          referralCode={crmCustomer?.referralCode || 'RG7425MX'}
          referralsCount={referralsCount}
          onClose={() => setProfileSubView('dashboard')}
        />
      );
    }

    if (profileSubView === 'edit') {
      return (
        <EditProfile
          customer={{
            name: customerName,
            phone: customerPhone,
            email: crmCustomer?.email || 'manisharawat7425@gmail.com',
            gender: crmCustomer?.gender || 'Female',
            ageGroup: crmCustomer?.ageGroup || '18-24',
            photoURL: crmCustomer?.photoURL || ''
          }}
          onSaveProfile={handleSaveProfile}
          onClose={() => setProfileSubView('dashboard')}
        />
      );
    }

    if (profileSubView === 'settings') {
      return (
        <Settings
          customer={crmCustomer}
          onUpdateCustomerSettings={handleUpdateCustomerSettings}
          onSignOut={handleSignOut}
          onDeleteAccount={handleDeleteAccount}
          onClearCache={handleClearCache}
          onClose={() => setProfileSubView('dashboard')}
          legalPolicies={legalPolicies}
        />
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--phone-bg)', overflowY: 'auto' }}>
        {/* User Card */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          padding: '24px 20px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#e93c76',
            color: '#ffffff',
            fontSize: '22px',
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Outfit', sans-serif",
            overflow: 'hidden'
          }}>
            {crmCustomer?.photoURL ? (
              <img src={crmCustomer.photoURL} alt="User Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initials
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              {customerName || 'Guest User'}
            </h3>
            <span style={{ fontSize: '12px', color: '#cbd5e1' }}>
              {customerPhone || 'Enter phone number'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                backgroundColor: membershipTier === 'Platinum' ? '#a855f7' : (membershipTier === 'Gold' ? '#eab308' : (membershipTier === 'Silver' ? '#94a3b8' : 'rgba(255,255,255,0.15)')),
                color: membershipTier === 'Gold' ? '#000000' : '#ffffff',
                padding: '2px 8px',
                borderRadius: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                RG {membershipTier}
              </span>
              <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 700 }}>
                {loyaltyPoints} points
              </span>
            </div>
          </div>
        </div>

        {/* Action Link Lists */}
        <div style={{ padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Member perks */}
          <div
            onClick={() => setActiveTab('paywall')}
            style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
              border: '1px solid #fde047',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ color: '#d97706' }}><Crown size={20} /></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#92400e' }}>Premium Membership</span>
                <span style={{ fontSize: '11.5px', color: '#b45309' }}>View or upgrade subscription plan</span>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: '#d97706' }} />
          </div>

          <div style={{ background: 'var(--phone-card-bg)', borderRadius: '20px', border: '1.5px solid var(--phone-card-border)', overflow: 'hidden' }}>
            {/* Edit Profile */}
            <div
              onClick={() => setProfileSubView('edit')}
              style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1.5px solid var(--phone-card-border)', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={16} />
                </div>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--phone-text-title)' }}>Edit Profile</span>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--phone-text-muted)' }} />
            </div>

            {/* My Orders */}
            <div
              onClick={() => setProfileSubView('orders')}
              style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1.5px solid var(--phone-card-border)', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag size={16} />
                </div>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--phone-text-title)' }}>My Orders</span>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--phone-text-muted)' }} />
            </div>

            {/* My Wallet */}
            <div
              onClick={() => setProfileSubView('wallet')}
              style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1.5px solid var(--phone-card-border)', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--phone-text-title)' }}>My Wallet</span>
                  <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)', fontWeight: 600 }}>Balance: ₹{walletBalance.toLocaleString()}</span>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--phone-text-muted)' }} />
            </div>

            {/* Saved Addresses */}
            <div
              onClick={() => setProfileSubView('addresses')}
              style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1.5px solid var(--phone-card-border)', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={16} />
                </div>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--phone-text-title)' }}>Saved Addresses</span>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--phone-text-muted)' }} />
            </div>

            {/* Coupons & Offers */}
            <div
              onClick={() => setProfileSubView('coupons')}
              style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1.5px solid var(--phone-card-border)', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ticket size={16} />
                </div>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--phone-text-title)' }}>Coupons & Offers</span>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--phone-text-muted)' }} />
            </div>

            {/* Loyalty points */}
            <div
              onClick={() => setProfileSubView('loyalty')}
              style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1.5px solid var(--phone-card-border)', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--phone-text-title)' }}>Loyalty Points</span>
                  <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)', fontWeight: 600 }}>Balance: {loyaltyPoints} pts</span>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--phone-text-muted)' }} />
            </div>

            {/* Refer & Earn */}
            <div
              onClick={() => setProfileSubView('refer')}
              style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1.5px solid var(--phone-card-border)', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Gift size={16} />
                </div>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--phone-text-title)' }}>Refer & Earn</span>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--phone-text-muted)' }} />
            </div>

            {/* Settings */}
            <div
              onClick={() => setProfileSubView('settings')}
              style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sliders size={16} />
                </div>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--phone-text-title)' }}>Settings</span>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--phone-text-muted)' }} />
            </div>

          </div>
        </div>
      </div>
    );
  };

  // Handle hardware back button on Android
  useEffect(() => {
    if (!isOnboarded) return;

    let handlerPromise = null;
    try {
      handlerPromise = CapApp.addListener('backButton', () => {
        if (selectedProduct) {
          setSelectedProduct(null);
          return;
        }

        if (activeTab === 'saved') {
          if (cartCheckoutStep === 'select-address') {
            setCartCheckoutStep('bag');
          } else if (cartCheckoutStep === 'payment') {
            setCartCheckoutStep('select-address');
          } else {
            setActiveTab('home');
          }
        } else if (activeTab !== 'home') {
          setActiveTab('home');
        } else {
          CapApp.exitApp();
        }
      });
    } catch (err) {
      console.warn("Native backButton listener registration not supported in this environment:", err);
    }

    return () => {
      if (handlerPromise) {
        handlerPromise.then(h => h.remove()).catch(() => { });
      }
    };
  }, [isOnboarded, selectedProduct, activeTab, cartCheckoutStep]);

  const parsePrice = (priceVal) => {
    if (priceVal === null || priceVal === undefined) return 0;
    if (typeof priceVal === 'number') return priceVal;
    const cleaned = String(priceVal).replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Cart operations
  const adjustQty = (productId, delta) => {
    setCart(prevCart => {
      const item = prevCart.find(i => i.id === productId);
      if (!item) return prevCart;

      const newQty = item.qty + delta;
      if (newQty <= 0) {
        return prevCart.filter(i => i.id !== productId);
      } else {
        const maxStock = item.stockOnline !== undefined ? parseInt(item.stockOnline, 10) : 99;
        if (newQty <= maxStock) {
          return prevCart.map(i => i.id === productId ? { ...i, qty: newQty } : i);
        }
        return prevCart;
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(i => i.id !== productId));
  };

  const addToCart = (product, qtyToAdd = 1) => {
    try {
      const quantity = product && product.qty !== undefined ? product.qty : qtyToAdd;
      setCart(prevCart => {
        try {
          if (!product) {
            console.error("addToCart received a null/undefined product!");
            return prevCart;
          }
          const existing = prevCart.find(item => item && item.id === product.id);
          const maxStock = product.stockOnline !== undefined ? parseInt(product.stockOnline, 10) : 99;
          if (existing) {
            const newQty = Math.min(existing.qty + quantity, maxStock);
            return prevCart.map(item => item && item.id === product.id ? { ...item, qty: newQty } : item);
          } else {
            return [...prevCart, { ...product, qty: Math.min(quantity, maxStock) }];
          }
        } catch (e2) {
          console.error("Error inside setCart callback of addToCart:", e2);
          alert("Cart Update Failure: " + e2.message);
          return prevCart;
        }
      });
    } catch (e) {
      console.error("Error inside addToCart function:", e);
      alert("addToCart Action Failure: " + e.message);
    }
  };

  const addItemsToCart = (itemsList) => {
    setCart(prevCart => {
      let tempCart = [...prevCart];
      itemsList.forEach(product => {
        const quantity = product.qty !== undefined ? product.qty : 1;
        const existingIdx = tempCart.findIndex(item => item.id === product.id);
        const maxStock = product.stockOnline !== undefined ? parseInt(product.stockOnline, 10) : 99;

        if (existingIdx > -1) {
          const existing = tempCart[existingIdx];
          const newQty = Math.min(existing.qty + quantity, maxStock);
          tempCart[existingIdx] = { ...existing, qty: newQty };
        } else {
          tempCart.push({ ...product, qty: Math.min(quantity, maxStock) });
        }
      });
      return tempCart;
    });
  };

  // Math calculations
  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (parsePrice(item.sellingPrice || 0) * item.qty), 0);
  };

  const getCouponDiscount = (subtotal) => {
    if (!activeCoupon) return 0;
    if (subtotal < parseFloat(activeCoupon.minOrder || 0)) return 0;

    let discount = 0;
    if (activeCoupon.type === 'Percent') {
      discount = subtotal * (parseFloat(activeCoupon.value || 0) / 100);
      if (activeCoupon.maxDiscount && discount > parseFloat(activeCoupon.maxDiscount)) {
        discount = parseFloat(activeCoupon.maxDiscount);
      }
    } else if (activeCoupon.type === 'Fixed') {
      discount = parseFloat(activeCoupon.value || 0);
    }
    return Math.min(discount, subtotal);
  };

  const getPointsValue = () => {
    if (!crmCustomer || !useLoyaltyPoints) return 0;
    const points = parseInt(crmCustomer.loyaltyPoints || 0, 10);
    if (points < loyaltyConfig.minRedeem) return 0;
    return points * loyaltyConfig.valuePerPoint;
  };

  const getMemberDiscount = (subtotalVal) => {
    const matchedPlan = membershipPlans.find(
      p => p.id?.toLowerCase() === membershipTier.toLowerCase() || p.name?.toLowerCase() === membershipTier.toLowerCase()
    );
    if (matchedPlan && matchedPlan.discountPercent !== undefined) {
      return subtotalVal * (parseFloat(matchedPlan.discountPercent || 0) / 100);
    }
    // Fallbacks matching legacy storefront defaults
    if (membershipTier === 'Silver') return subtotalVal * 0.10;
    if (membershipTier === 'Gold') return subtotalVal * 0.15;
    if (membershipTier === 'Platinum') return subtotalVal * 0.25;
    if (membershipTier === 'VIP') return subtotalVal * 0.12;
    if (membershipTier === 'Plus') return subtotalVal * 0.05;
    return 0;
  };

  const getShippingFee = (subtotalVal) => {
    const tier = membershipTier || 'Free';
    if (tier === 'Gold' || tier === 'Platinum') {
      return 0;
    }
    if (tier === 'Silver') {
      return subtotalVal >= 499 ? 0 : 49;
    }
    return subtotalVal >= 999 ? 0 : 99;
  };

  const getGrandTotal = () => {
    const subtotal = getSubtotal();
    const memberDeduct = getMemberDiscount(subtotal);
    const subAfterMember = Math.max(subtotal - memberDeduct, 0);
    const couponDeduct = getCouponDiscount(subAfterMember);
    const pointsDeduct = getPointsValue();
    const shippingFee = getShippingFee(subtotal);
    const total = Math.max(subAfterMember - couponDeduct - pointsDeduct, 0) + shippingFee;
    console.log("[RG DEBUG] getGrandTotal calculated:", { subtotal, memberDeduct, subAfterMember, couponDeduct, pointsDeduct, shippingFee, total, cart });
    return total;
  };

  const executePlaceOrder = async (
    finalPaidAmount,
    walletSpent,
    subtotal,
    memberDeduct,
    couponDeduct,
    pointsDeduct,
    pointsRedeemed,
    finalPointsEarned,
    newPointsBalance,
    newWalletBalance,
    finalCustomerId,
    paymentId = "",
    paymentStatusVal = "Pending"
  ) => {
    try {
      const generatedOrderId = `ORD-ON-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      // 1. Sync updated fields to Firestore CRM
      if (crmCustomer) {
        const custRef = doc(null, 'customers', crmCustomer.id);
        let updatedTxs = crmCustomer.transactions || [];
        if (walletSpent > 0) {
          const debitTx = {
            id: `tx_debit_${Date.now()}`,
            amount: walletSpent,
            type: 'Debit',
            description: `Paid for order ${generatedOrderId}`,
            date: new Date().toISOString().split('T')[0]
          };
          updatedTxs = [debitTx, ...updatedTxs];
        }

        await updateDoc(custRef, {
          loyaltyPoints: newPointsBalance,
          walletBalance: newWalletBalance,
          tier: membershipTier,
          transactions: updatedTxs
        });

        setCrmCustomer(prev => ({
          ...prev,
          loyaltyPoints: newPointsBalance,
          walletBalance: newWalletBalance,
          tier: membershipTier,
          transactions: updatedTxs
        }));
      } else if (customerPhone.trim()) {
        const custRef = doc(null, 'customers', finalCustomerId);

        let currentAddresses = savedAddresses;
        if (savedAddresses.length === 0 && deliveryAddress.trim()) {
          currentAddresses = [{
            id: `addr_${Date.now()}`,
            label: 'Home',
            name: customerName.trim() || "B2C Guest Customer",
            phone: customerPhone.trim(),
            addressLine1: deliveryAddress.trim(),
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '',
            isDefault: true,
            detail: deliveryAddress.trim()
          }];
        }

        const welcomeAmount = 250.00;
        let initialTxs = [
          {
            id: 'tx_welcome',
            amount: welcomeAmount,
            type: 'Deposit',
            description: 'Welcome Sign Up Bonus Balance',
            date: new Date().toISOString().split('T')[0]
          }
        ];
        if (walletSpent > 0) {
          initialTxs.unshift({
            id: `tx_debit_${Date.now()}`,
            amount: walletSpent,
            type: 'Debit',
            description: `Paid for order ${generatedOrderId}`,
            date: new Date().toISOString().split('T')[0]
          });
        }

        const newCust = {
          id: finalCustomerId,
          name: customerName.trim() || "B2C Guest Customer",
          phone: customerPhone.trim(),
          email: `${customerPhone.trim()}@rgretailer.com`,
          address: deliveryAddress.trim() || "Default Store Address",
          gender: "Women",
          loyaltyPoints: newPointsBalance,
          walletBalance: newWalletBalance,
          outstandingBalance: 0,
          city: "Mumbai",
          state: "Maharashtra",
          dob: "1998-05-29",
          rating: "Normal",
          ledger: [],
          tier: membershipTier,
          source: 'App',
          joinedDate: new Date().toISOString().split('T')[0],
          addresses: currentAddresses,
          transactions: initialTxs
        };
        await setDoc(custRef, newCust);
        setCrmCustomer(newCust);
      }

      // 2. Decrement online inventory stock for each product purchased securely
      for (const item of cart) {
        try {
          const prodRef = doc(null, 'products', item.id);
          const prodSnap = await getDoc(prodRef);
          if (prodSnap.exists()) {
            const data = prodSnap.data();
            const currentStock = parseInt(data.stockOnline || 0, 10);
            const newStock = Math.max(0, currentStock - item.qty);

            const updates = {
              stockOnline: newStock,
              lastUpdated: new Date().toISOString()
            };

            // Decrement size-wise stock if it exists
            const sizeKey = item.selectedSize || item.size;
            if (data.quantityPerSize && sizeKey && data.quantityPerSize[sizeKey] !== undefined) {
              const currentSizeStock = parseInt(data.quantityPerSize[sizeKey] || 0, 10);
              const newSizeStock = Math.max(0, currentSizeStock - item.qty);
              updates[`quantityPerSize.${sizeKey}`] = newSizeStock;
            }

            await updateDoc(prodRef, updates);
          }
        } catch (err) {
          console.error(`Error decrementing stock for product ID ${item.id}:`, err);
        }
      }

      // 3. Create the Order Payload
      const orderPayload = {
        orderId: generatedOrderId,
        date: new Date().toISOString().split('T')[0],
        customerId: finalCustomerId,
        customerName: customerName.trim() || (crmCustomer ? crmCustomer.name : "B2C Guest Customer"),
        phone: customerPhone.trim() || "9988776655",
        address: deliveryAddress.trim() || "Default Store Address",
        paymentMode: paymentMode,
        paymentStatus: paymentStatusVal,
        paymentId: paymentId,
        status: "Pending",
        totalAmount: finalPaidAmount,
        subtotal: subtotal,
        memberDiscount: memberDeduct,
        couponCode: activeCoupon ? activeCoupon.code : "",
        couponDiscount: couponDeduct,
        pointsRedeemed: pointsRedeemed,
        pointsDiscount: pointsDeduct,
        walletDiscount: walletSpent,
        pointsEarned: finalPointsEarned,
        membershipTier: membershipTier,
        shippingFee: getShippingFee(subtotal),
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          qty: item.qty,
          sellingPrice: parseFloat(item.sellingPrice),
          imageURL: item.imageURL || item.image || (item.media && item.media[0]) || "",
          size: item.size || item.selectedSize || "L",
          color: item.color || item.selectedColor || "Default",
          category: item.category || ""
        }))
      };

      // Generate invoice PDF automatically at order generation time
      try {
        const doc = createInvoicePDF(orderPayload, storeSettings);
        orderPayload.invoicePdf = getPdfBase64(doc);
      } catch (pdfErr) {
        console.error("Failed to pre-generate order invoice PDF:", pdfErr);
      }

      await addDoc(collection(null, 'orders'), orderPayload);

      // Log transactions to loyalty_transactions
      if (pointsRedeemed > 0) {
        try {
          await addDoc(collection(null, 'loyalty_transactions'), {
            customerId: finalCustomerId,
            customerName: orderPayload.customerName,
            customerPhone: orderPayload.phone,
            type: 'redeem',
            amount: -pointsRedeemed,
            timestamp: new Date().toISOString(),
            description: `Redeemed for order ${orderPayload.orderId}`
          });
        } catch (txErr) {
          console.error("Failed to log points redeem transaction:", txErr);
        }
      }
      if (finalPointsEarned > 0) {
        try {
          await addDoc(collection(null, 'loyalty_transactions'), {
            customerId: finalCustomerId,
            customerName: orderPayload.customerName,
            customerPhone: orderPayload.phone,
            type: 'earn',
            amount: finalPointsEarned,
            timestamp: new Date().toISOString(),
            description: `Points earned from ${orderPayload.orderId}`
          });
        } catch (txErr) {
          console.error("Failed to log points earn transaction:", txErr);
        }
      }

      setUseLoyaltyPoints(false);
      setUseWalletBalance(false);
      setOrderSuccessId(orderPayload.orderId);
      setCart([]);
      setActiveCoupon(null);
      setDeliveryAddress('');

      // Update local wallet and loyalty balances instantly
      setWalletBalance(newWalletBalance);
      setLoyaltyPoints(newPointsBalance);
      if (walletSpent > 0) {
        const txDebit = {
          id: `tx_${Date.now()}`,
          amount: -walletSpent,
          type: 'Debit',
          description: `Paid for order ${orderPayload.orderId}`,
          date: new Date().toISOString().split('T')[0]
        };
        setWalletTransactions(prev => [txDebit, ...prev]);
      }
      setIsSubmitting(false);
    } catch (error) {
      console.error("executePlaceOrder Error:", error);
      alert("Order placement failure: " + error.message);
      setIsSubmitting(false);
    }
  };

  const handleDownloadInvoicePDF = async (order) => {
    try {
      const displayId = order.orderId || order.id;
      const cleanId = displayId.slice(-12).toUpperCase();
      const fileName = `Invoice-${cleanId}.pdf`;

      const isNative = Capacitor.isNativePlatform();

      // 1. Fetch or generate base64 synchronously to preserve user gesture
      let pdfBase64 = order.invoicePdf;
      if (!pdfBase64) {
        const docObj = createInvoicePDF(order, storeSettings);
        pdfBase64 = getPdfBase64(docObj);
        // Save to Firestore in background asynchronously
        updateDoc(doc(null, 'orders', order.id), { invoicePdf: pdfBase64 })
          .then(() => {
            order.invoicePdf = pdfBase64;
          })
          .catch(err => console.error("Failed to cache pre-generated PDF back to Firestore:", err));
      }

      if (isNative) {
        const result = await Filesystem.writeFile({
          path: fileName,
          data: pdfBase64,
          directory: Directory.Cache
        });

        await Share.share({
          files: [result.uri],
          dialogTitle: 'Export / Save Invoice PDF'
        });

        setWelcomeToast("Invoice ready for saving!");
        setTimeout(() => setWelcomeToast(''), 3000);
      } else {
        // Web fallback: convert base64 to Blob URL
        const byteCharacters = atob(pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(pdfBlob);

        // 1. Try programmatic link download
        const element = document.createElement('a');
        element.href = blobUrl;
        element.download = fileName;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        // 2. Mobile/Safari fallback: open the PDF Blob URL in a new tab/window
        window.open(blobUrl, '_blank');

        setWelcomeToast("Invoice PDF download initiated!");
        setTimeout(() => setWelcomeToast(''), 3000);
      }
    } catch (e) {
      console.error("PDF download failed:", e);
      setWelcomeToast("Failed to download PDF invoice: " + e.message);
      setTimeout(() => setWelcomeToast(''), 4000);
    }
  };

  const handleShareInvoicePDF = async (order) => {
    try {
      const displayId = order.orderId || order.id;
      const cleanId = displayId.slice(-12).toUpperCase();
      const fileName = `Invoice-${cleanId}.pdf`;

      const isNative = Capacitor.isNativePlatform();

      // 1. Fetch or generate base64 synchronously to preserve user gesture
      let pdfBase64 = order.invoicePdf;
      if (!pdfBase64) {
        const docObj = createInvoicePDF(order, storeSettings);
        pdfBase64 = getPdfBase64(docObj);
        // Save to Firestore in background asynchronously
        updateDoc(doc(null, 'orders', order.id), { invoicePdf: pdfBase64 })
          .then(() => {
            order.invoicePdf = pdfBase64;
          })
          .catch(err => console.error("Failed to cache pre-generated PDF back to Firestore:", err));
      }

      if (isNative) {
        const result = await Filesystem.writeFile({
          path: fileName,
          data: pdfBase64,
          directory: Directory.Cache
        });

        await Share.share({
          files: [result.uri],
          dialogTitle: 'Share Invoice PDF'
        });
      } else {
        const byteCharacters = atob(pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(pdfBlob);

        let shared = false;
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file]
            });
            shared = true;
          } catch (shareErr) {
            console.warn("Navigator share failed, using fallback:", shareErr);
          }
        }

        if (!shared) {
          // Open PDF Blob URL in a new tab so they can view/share/save it
          window.open(blobUrl, '_blank');

          // Fallback to WhatsApp text details
          const shareText = `${(storeSettings.storeName || "RG Retailer").toUpperCase()} Invoice Details:\nOrder ID: #${cleanId}\nCustomer: ${order.customerName || 'Guest'}\nTotal Paid: Rs. ${order.totalAmount || 0}\nPayment Status: ${order.paymentStatus || 'Pending'}\nStatus: ${order.status || 'Placed'}`;
          const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
          window.open(whatsappUrl, '_blank');
        }
      }
    } catch (e) {
      console.error("Native share failed, falling back to WhatsApp link:", e);
      try {
        const displayId = order.orderId || order.id;
        const cleanId = displayId.slice(-12).toUpperCase();

        // Regenerate Blob URL for safety
        let pdfBase64 = order.invoicePdf || getPdfBase64(createInvoicePDF(order, storeSettings));
        const byteCharacters = atob(pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(pdfBlob);

        window.open(blobUrl, '_blank');

        const shareText = `${(storeSettings.storeName || "RG Retailer").toUpperCase()} Invoice Details:\nOrder ID: #${cleanId}\nCustomer: ${order.customerName || 'Guest'}\nTotal Paid: Rs. ${order.totalAmount || 0}\nPayment Status: ${order.paymentStatus || 'Pending'}\nStatus: ${order.status || 'Placed'}`;
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank');
      } catch (err) {
        setWelcomeToast("Failed to share invoice: " + err.message);
        setTimeout(() => setWelcomeToast(''), 4000);
      }
    }
  };

  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);
    try {
      const subtotal = getSubtotal();
      if (subtotal <= 0) {
        alert("Cannot place an order with a subtotal of ₹0 or less.");
        setIsSubmitting(false);
        return;
      }
      const memberDeduct = getMemberDiscount(subtotal);
      const subAfterMember = Math.max(subtotal - memberDeduct, 0);
      const couponDeduct = getCouponDiscount(subAfterMember);
      const pointsDeduct = getPointsValue();
      const grandTotal = getGrandTotal();

      const walletBalanceVal = crmCustomer ? parseFloat(crmCustomer.walletBalance ?? 250.00) : walletBalance;
      const walletSpent = useWalletBalance ? Math.min(walletBalanceVal, grandTotal) : 0;
      const finalPaidAmount = Math.max(grandTotal - walletSpent, 0);

      const pointsPer100 = loyaltyConfig.pointsPer100 || 10;
      let tierMultiplier = 1.0;
      const matchedPlan = membershipPlans.find(
        p => p.id?.toLowerCase() === membershipTier.toLowerCase() || p.name?.toLowerCase() === membershipTier.toLowerCase()
      );
      if (matchedPlan && matchedPlan.loyaltyMultiplier !== undefined) {
        tierMultiplier = parseFloat(matchedPlan.loyaltyMultiplier || 1.0);
      } else {
        if (membershipTier === 'Silver') tierMultiplier = 1.5;
        else if (membershipTier === 'Gold') tierMultiplier = 2.0;
        else if (membershipTier === 'Platinum') tierMultiplier = 3.0;
        else if (membershipTier === 'VIP') tierMultiplier = 2.0;
        else if (membershipTier === 'Plus') tierMultiplier = 1.2;
      }

      const finalPointsEarned = Math.floor((finalPaidAmount / 100) * pointsPer100 * tierMultiplier);
      const pointsRedeemed = useLoyaltyPoints && crmCustomer ? parseInt(crmCustomer.loyaltyPoints || 0, 10) : 0;

      const newPointsBalance = crmCustomer
        ? Math.max(0, parseInt(crmCustomer.loyaltyPoints || 0, 10) - pointsRedeemed + finalPointsEarned)
        : Math.max(0, loyaltyPoints - pointsRedeemed + finalPointsEarned);
      const newWalletBalance = crmCustomer
        ? Math.max(0, walletBalanceVal - walletSpent)
        : Math.max(0, walletBalanceVal - walletSpent);

      let finalCustomerId = crmCustomer ? crmCustomer.id : `cust_${Date.now()}`;

      // Razorpay Payment Gateway integration logic
      if (finalPaidAmount > 0 && paymentMode !== 'Cash' && paymentMode !== 'Wallet') {
        if (!window.Razorpay) {
          alert("Payment gateway SDK is loading. Please wait a few seconds and try again.");
          setIsSubmitting(false);
          return;
        }

        const options = {
          key: paymentGatewayKey,
          amount: Math.round(finalPaidAmount * 100), // in paise
          currency: "INR",
          name: storeSettings.storeName || "RG Retailer",
          description: `Order Secure Payment (${cart.length} items)`,
          image: storeSettings.logoURL || "https://images.unsplash.com/photo-1542272604-787c3835535d?w=100",
          // Enable UPI Intent flow for WebView (Capacitor) — lets checkout.js
          // launch external UPI apps (GPay, PhonePe, Paytm) via deep links
          webview_intent: true,
          handler: async function (response) {
            try {
              const paymentId = response.razorpay_payment_id || `rzp_sim_${Date.now()}`;
              await executePlaceOrder(
                finalPaidAmount,
                walletSpent,
                subtotal,
                memberDeduct,
                couponDeduct,
                pointsDeduct,
                pointsRedeemed,
                finalPointsEarned,
                newPointsBalance,
                newWalletBalance,
                finalCustomerId,
                paymentId,
                "Paid"
              );
            } catch (err) {
              console.error("Error creating order after payment success:", err);
              alert("Payment succeeded, but order processing failed. Contact customer care.");
              setIsSubmitting(false);
            }
          },
          prefill: {
            name: customerName.trim() || (crmCustomer ? crmCustomer.name : "Guest Customer"),
            email: crmCustomer?.email || `${customerPhone || "7425987654"}@rgretailer.com`,
            contact: customerPhone.trim() || "7425987654"
          },
          notes: {
            address: deliveryAddress
          },
          theme: {
            color: "#ff6b35"
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
              console.log("Payment window cancelled by user.");
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Cash or fully paid by wallet balance
        const paymentStatusVal = (paymentMode === 'Wallet' || finalPaidAmount === 0) ? "Paid" : "Pending";
        await executePlaceOrder(
          finalPaidAmount,
          walletSpent,
          subtotal,
          memberDeduct,
          couponDeduct,
          pointsDeduct,
          pointsRedeemed,
          finalPointsEarned,
          newPointsBalance,
          newWalletBalance,
          finalCustomerId,
          "",
          paymentStatusVal
        );
      }
    } catch (err) {
      console.error("Order submission failed:", err);
      alert("Checkout error: " + err.message);
      setIsSubmitting(false);
    }
  };

  const getStoreMonogram = () => {
    const words = storeSettings.storeName.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return storeSettings.storeName.slice(0, 2).toUpperCase();
  };

  if (isMobileMode) {
    return (
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--phone-bg)', color: 'var(--phone-text-title)', overflow: 'hidden' }}
      >
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* Pull-to-refresh visual loader */}
          {(pullDistance > 0 || isRefreshing) && (
            <div style={{
              position: 'absolute',
              top: isRefreshing ? '24px' : `${Math.min(48, pullDistance - 20)}px`,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              border: '1.5px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              transition: isRefreshing ? 'all 0.2s ease' : 'none',
              opacity: isRefreshing ? 1 : Math.min(1, pullDistance / 50)
            }}>
              <RefreshCw
                size={18}
                style={{
                  color: '#ff6b35',
                  transform: isRefreshing ? 'none' : `rotate(${pullDistance * 6}deg)`,
                  animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
                }}
              />
            </div>
          )}
          {!isOnboarded ? (
            <OnboardingFlow products={products} onComplete={handleOnboardingComplete} isReturningUser={isReturningUser} />
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--phone-bg)', position: 'relative' }}>
              {welcomeToast && (
                <div style={{
                  position: 'absolute',
                  top: '56px',
                  left: '16px',
                  right: '16px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.16)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 200,
                  animation: 'slideDownFade 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                  <Check size={14} style={{ color: '#10b981' }} />
                  <span>{welcomeToast}</span>
                </div>
              )}

              {/* Notch & status bar */}
              <div style={{ height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--phone-header-bg)' }}>
                <div style={{ width: '60px', height: '6px', background: 'var(--phone-card-border)', borderRadius: '3px', margin: '4px auto 0' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 14px', fontSize: '9px', color: 'var(--phone-text-muted)', fontWeight: 600, background: 'var(--phone-header-bg)' }}>
                <span>9:41</span>
                <span>LTE ▮ 93%</span>
              </div>

              {/* Sticky Boutique Header - Removed for cleaner layout, replaced with minimal spacer */}
              <div style={{ height: '8px', background: 'var(--phone-bg)' }}></div>

              {/* Sub Tab Coordination */}
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--phone-bg)' }}>
                {activeTab === 'home' && (
                  <HomeFeed
                    products={products}
                    stories={stories}
                    heroSlides={heroSlides}
                    outfits={outfits}
                    flashSales={flashSales}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                    categories={categories}
                    stylePersona={crmCustomer?.stylePersona || 'Creative'}
                    recommendationRules={recommendationRules}
                    recommendationSettings={recommendationSettings}
                    recommendationABSettings={recommendationABSettings}
                    recommendationBundles={recommendationBundles}
                    crmCustomer={crmCustomer}
                    onAddToCart={addToCart}
                    placedOrders={placedOrders}
                    notifications={notifications}
                    availableCoupons={availableCoupons}
                    cart={cart}
                    onNavigateToBag={(buyNow = false) => {
                      if (buyNow) {
                        setCartCheckoutStep('select-address');
                      } else {
                        setCartCheckoutStep('bag');
                      }
                      setActiveTab('saved');
                    }}
                    onAddMultipleToCart={addItemsToCart}
                    dbLoading={dbLoading}
                    wishlist={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                    onNotificationClick={handleNotificationClick}
                    categoryOffers={categoryOffers}
                    membershipPlans={membershipPlans}
                    onUpgradeTier={handleUpgradeSubscription}
                  />
                )}

                {activeTab === 'explore' && (
                  <HomeFeed
                    products={products}
                    stories={stories}
                    heroSlides={heroSlides}
                    isExplore={true}
                    outfits={outfits}
                    flashSales={flashSales}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                    categories={categories}
                    stylePersona={crmCustomer?.stylePersona || 'Creative'}
                    recommendationRules={recommendationRules}
                    recommendationSettings={recommendationSettings}
                    recommendationABSettings={recommendationABSettings}
                    recommendationBundles={recommendationBundles}
                    crmCustomer={crmCustomer}
                    onAddToCart={addToCart}
                    placedOrders={placedOrders}
                    availableCoupons={availableCoupons}
                    cart={cart}
                    onNavigateToBag={(buyNow = false) => {
                      if (buyNow) {
                        setCartCheckoutStep('select-address');
                      } else {
                        setCartCheckoutStep('bag');
                      }
                      setActiveTab('saved');
                    }}
                    onAddMultipleToCart={addItemsToCart}
                    dbLoading={dbLoading}
                    wishlist={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                    onNotificationClick={handleNotificationClick}
                    categoryOffers={categoryOffers}
                    membershipPlans={membershipPlans}
                    onUpgradeTier={handleUpgradeSubscription}
                  />
                )}

                {activeTab === 'tryon' && (
                  <TryOnStudio
                    products={products}
                    wishlist={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                    onAddToCart={addToCart}
                    onSelectProduct={(p) => {
                      setSelectedProduct(p);
                      setAutoOpenTryOn(false);
                    }}
                    onClose={() => setActiveTab('home')}
                  />
                )}

                {activeTab === 'paywall' && (
                  <MembershipPaywall
                    activeTier={membershipTier}
                    onUpgradeTier={(tier, cycle) => handleUpgradeSubscription(tier, cycle)}
                    onClose={() => setActiveTab('you')}
                    membershipPlans={membershipPlans}
                  />
                )}

                {activeTab === 'wishlist' && (
                  <MyWishlist
                    products={products}
                    wishlist={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                    onAddToCart={addToCart}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                    onClose={() => setActiveTab('home')}
                  />
                )}

                {activeTab === 'you' && renderProfileTab()}

                {activeTab === 'saved' && (
                  <CartCheckout
                    cart={cart}
                    adjustQty={adjustQty}
                    removeFromCart={removeFromCart}
                    subtotal={getSubtotal()}
                    couponDiscount={getCouponDiscount(Math.max(getSubtotal() - getMemberDiscount(getSubtotal()), 0))}
                    activeCoupon={activeCoupon}
                    availableCoupons={activeCoupons}
                    setActiveCoupon={setActiveCoupon}
                    pointsDiscount={getPointsValue()}
                    useLoyaltyPoints={useLoyaltyPoints}
                    setUseLoyaltyPoints={setUseLoyaltyPoints}
                    crmCustomer={crmCustomer}
                    loyaltyConfig={loyaltyConfig}
                    grandTotal={getGrandTotal()}
                    initialStep={cartCheckoutStep}
                    customerName={customerName}
                    setCustomerName={setCustomerName}
                    customerPhone={customerPhone}
                    setCustomerPhone={setCustomerPhone}
                    deliveryAddress={deliveryAddress}
                    setDeliveryAddress={setDeliveryAddress}
                    paymentMode={paymentMode}
                    setPaymentMode={setPaymentMode}
                    isSubmitting={isSubmitting}
                    onSubmitOrder={handlePlaceOrder}
                    loyaltyMessage={loyaltyMessage}
                    onCheckLoyalty={handleCheckLoyalty}
                    membershipTier={membershipTier}
                    placedOrders={placedOrders}
                    useWalletBalance={useWalletBalance}
                    setUseWalletBalance={setUseWalletBalance}
                    savedAddresses={savedAddresses}
                    onAddAddress={handleAddAddress}
                    onDeleteAddress={handleDeleteAddress}
                    membershipPlans={membershipPlans}
                    memberDiscount={getMemberDiscount(getSubtotal())}
                    shippingFee={getShippingFee(getSubtotal())}
                  />
                )}
              </div>

              {/* Bottom Navigation Menu bar within phone (Orange active accents) */}
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '10px 6px', borderTop: '1.5px solid var(--phone-nav-border)', background: 'var(--phone-header-bg)' }}>
                <button
                  onClick={() => setActiveTab('home')}
                  style={{ background: 'none', border: 'none', color: activeTab === 'home' ? '#ff6b35' : 'var(--phone-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', fontSize: '9px', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
                >
                  <Home size={18} />
                  <span>Home</span>
                </button>

                <button
                  onClick={() => setActiveTab('explore')}
                  style={{ background: 'none', border: 'none', color: activeTab === 'explore' ? '#ff6b35' : 'var(--phone-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', fontSize: '9px', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
                >
                  <Search size={18} />
                  <span>Search</span>
                </button>

                {/* Large Floating Center Scan Button */}
                <div style={{ position: 'relative', marginTop: '-20px', zIndex: 10 }}>
                  <button
                    onClick={() => setActiveTab('tryon')}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: activeTab === 'tryon' ? '#ea580c' : '#ff6b35',
                      border: '4px solid var(--phone-card-bg)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(255, 107, 53, 0.35)',
                      outline: 'none'
                    }}
                    title="AI Virtual Try-On Studio"
                  >
                    <Eye size={18} />
                  </button>
                </div>

                <button
                  onClick={() => setActiveTab('wishlist')}
                  style={{ background: 'none', border: 'none', color: activeTab === 'wishlist' ? '#ff6b35' : 'var(--phone-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', fontSize: '9px', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
                >
                  <Heart size={18} />
                  <span>Wishlist</span>
                </button>

                <button
                  onClick={() => setActiveTab('you')}
                  style={{ background: 'none', border: 'none', color: activeTab === 'you' ? '#ff6b35' : 'var(--phone-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', fontSize: '9px', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
                >
                  <User size={18} />
                  <span>Profile</span>
                </button>
              </div>

              {/* Product Detail Modal popups */}
              {selectedProduct && (
                <ProductDetailModal
                  product={selectedProduct}
                  autoOpenTryOn={autoOpenTryOn}
                  wishlist={wishlist}
                  onToggleWishlist={handleToggleWishlist}
                  onClose={() => {
                    setSelectedProduct(null);
                    setAutoOpenTryOn(false);
                  }}
                  onAddToBag={(p) => addToCart(p)}
                  onNavigateToBag={(buyNow = false) => {
                    if (buyNow) {
                      setCartCheckoutStep('select-address');
                    } else {
                      setCartCheckoutStep('bag');
                    }
                    setActiveTab('saved');
                    setSelectedProduct(null);
                    setAutoOpenTryOn(false);
                  }}
                />
              )}

            </div>
          )}
        </div>

        {/* Global checkout success popup */}
        {orderSuccessId && (
          <div className="overlay-success-container">
            <div className="glass-panel success-modal" style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0' }}>
              <div className="success-icon-badge" style={{ background: '#ecfdf5', color: '#10b981' }}>
                <Check size={36} />
              </div>
              <h3 className="success-title" style={{ color: '#0f172a' }}>Order Placed!</h3>
              <p className="success-message" style={{ color: '#64748b' }}>
                Thank you for ordering at **{storeSettings.storeName}**! Your order has synced with the store's physical POS screen in real time.
                <br />
                <span className="order-id-highlight" style={{ background: '#f1f5f9', color: '#ff6b35' }}>ID: {orderSuccessId}</span>
              </p>
              <button className="modal-close-btn" style={{ background: '#ff6b35', color: '#ffffff' }} onClick={() => setOrderSuccessId(null)}>
                Continue Shopping
              </button>
            </div>
          </div>
        )}

        {globalAlert.show && (
          <div className="overlay-alert-container" onClick={() => setGlobalAlert(prev => ({ ...prev, show: false }))}>
            <div className="custom-alert-modal" onClick={e => e.stopPropagation()}>
              <div className={`custom-alert-icon-wrapper custom-alert-icon-${globalAlert.type}`}>
                {globalAlert.type === 'error' && <AlertCircle size={28} />}
                {globalAlert.type === 'success' && <Check size={28} />}
                {globalAlert.type === 'info' && <Info size={28} />}
              </div>
              <h3 className="custom-alert-title">{globalAlert.title}</h3>
              <p className="custom-alert-message">{globalAlert.message}</p>
              <button className="custom-alert-close-btn" onClick={() => setGlobalAlert(prev => ({ ...prev, show: false }))}>
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Universal header bar */}
      <header className="app-header">
        <div className="brand-section">
          {storeSettings.logoURL ? (
            <img
              src={storeSettings.logoURL}
              alt="Logo"
              style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-color)' }}
            />
          ) : (
            <div className="brand-logo-circle">
              {getStoreMonogram()}
            </div>
          )}
          <div>
            <h1 className="brand-name">{storeSettings.storeName}</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Premium Unified Workspace</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            className="payment-mode-btn"
            onClick={() => setShowAdminConsole(!showAdminConsole)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
          >
            <Sliders size={13} />
            {showAdminConsole ? 'Hide Admin Console' : 'Show Admin Console'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <ShieldCheck size={18} style={{ color: 'var(--accent-green)' }} />
            <span>Direct-Sync Enabled</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 1.5rem', gap: '3rem', flexWrap: 'wrap', background: 'radial-gradient(circle at center, #111827, #030712)' }}>

        {/* Left Side: Phone Frame Mock */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-color)', fontFamily: 'var(--font-heading)' }}>
            📱 Customer Mobile View
          </span>

          {!isOnboarded ? (
            <div className="glass-panel" style={{ width: '310px', height: '580px', borderRadius: '34px', border: '3px solid var(--phone-border)', padding: '9px', background: 'var(--phone-header-bg)', boxShadow: '0 20px 45px rgba(0,0,0,0.15)' }}>
              <div style={{ border: '1.5px solid var(--phone-card-border)', borderRadius: '26px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--phone-header-bg)', position: 'relative' }}>
                <OnboardingFlow products={products} onComplete={handleOnboardingComplete} isReturningUser={isReturningUser} />
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ width: '310px', height: '580px', borderRadius: '34px', border: '3px solid var(--phone-border)', padding: '9px', background: 'var(--phone-header-bg)', boxShadow: '0 20px 45px rgba(0,0,0,0.15)' }}>
              <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ border: '1.5px solid var(--phone-card-border)', borderRadius: '26px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--phone-header-bg)', position: 'relative' }}
              >
                {/* Pull-to-refresh visual loader */}
                {(pullDistance > 0 || isRefreshing) && (
                  <div style={{
                    position: 'absolute',
                    top: isRefreshing ? '24px' : `${Math.min(48, pullDistance - 20)}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    border: '1.5px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    transition: isRefreshing ? 'all 0.2s ease' : 'none',
                    opacity: isRefreshing ? 1 : Math.min(1, pullDistance / 50)
                  }}>
                    <RefreshCw
                      size={18}
                      style={{
                        color: '#ff6b35',
                        transform: isRefreshing ? 'none' : `rotate(${pullDistance * 6}deg)`,
                        animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
                      }}
                    />
                  </div>
                )}
                {welcomeToast && (
                  <div style={{
                    position: 'absolute',
                    top: '56px',
                    left: '16px',
                    right: '16px',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.16)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    zIndex: 200,
                    animation: 'slideDownFade 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}>
                    <Check size={14} style={{ color: '#10b981' }} />
                    <span>{welcomeToast}</span>
                  </div>
                )}

                {/* Notch & status bar */}
                <div style={{ height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--phone-header-bg)' }}>
                  <div style={{ width: '60px', height: '6px', background: 'var(--phone-card-border)', borderRadius: '3px', margin: '4px auto 0' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 14px', fontSize: '9px', color: 'var(--phone-text-muted)', fontWeight: 600, background: 'var(--phone-header-bg)' }}>
                  <span>9:41</span>
                  <span>LTE ▮ 93%</span>
                </div>

                {/* Sticky Boutique Header - Removed for cleaner layout, replaced with minimal spacer */}
                <div style={{ height: '8px', background: 'var(--phone-bg)' }}></div>

                {/* Sub Tab Coordination */}
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--phone-bg)' }}>
                  {activeTab === 'home' && (
                    <HomeFeed
                      products={products}
                      stories={stories}
                      heroSlides={heroSlides}
                      outfits={outfits}
                      flashSales={flashSales}
                      onSelectProduct={(p) => setSelectedProduct(p)}
                      activeCategory={activeCategory}
                      setActiveCategory={setActiveCategory}
                      categories={categories}
                      stylePersona={crmCustomer?.stylePersona || 'Creative'}
                      recommendationRules={recommendationRules}
                      crmCustomer={crmCustomer}
                      onAddToCart={addToCart}
                      placedOrders={placedOrders}
                      availableCoupons={availableCoupons}
                      cart={cart}
                      onNavigateToBag={(buyNow = false) => {
                        if (buyNow) {
                          setCartCheckoutStep('select-address');
                        } else {
                          setCartCheckoutStep('bag');
                        }
                        setActiveTab('saved');
                      }}
                      onAddMultipleToCart={addItemsToCart}
                      dbLoading={dbLoading}
                      wishlist={wishlist}
                      onToggleWishlist={handleToggleWishlist}
                      onNotificationClick={handleNotificationClick}
                      categoryOffers={categoryOffers}
                      membershipPlans={membershipPlans}
                      onUpgradeTier={handleUpgradeSubscription}
                    />
                  )}

                  {activeTab === 'explore' && (
                    <HomeFeed
                      products={products}
                      stories={stories}
                      heroSlides={heroSlides}
                      isExplore={true}
                      outfits={outfits}
                      flashSales={flashSales}
                      onSelectProduct={(p) => setSelectedProduct(p)}
                      activeCategory={activeCategory}
                      setActiveCategory={setActiveCategory}
                      categories={categories}
                      stylePersona={crmCustomer?.stylePersona || 'Creative'}
                      recommendationRules={recommendationRules}
                      crmCustomer={crmCustomer}
                      onAddToCart={addToCart}
                      placedOrders={placedOrders}
                      availableCoupons={availableCoupons}
                      cart={cart}
                      onNavigateToBag={(buyNow = false) => {
                        if (buyNow) {
                          setCartCheckoutStep('select-address');
                        } else {
                          setCartCheckoutStep('bag');
                        }
                        setActiveTab('saved');
                      }}
                      onAddMultipleToCart={addItemsToCart}
                      dbLoading={dbLoading}
                      wishlist={wishlist}
                      onToggleWishlist={handleToggleWishlist}
                      onNotificationClick={handleNotificationClick}
                      categoryOffers={categoryOffers}
                      membershipPlans={membershipPlans}
                      onUpgradeTier={handleUpgradeSubscription}
                    />
                  )}

                  {activeTab === 'tryon' && (
                    <TryOnStudio
                      products={products}
                      wishlist={wishlist}
                      onToggleWishlist={handleToggleWishlist}
                      onAddToCart={addToCart}
                      onSelectProduct={(p) => {
                        setSelectedProduct(p);
                        setAutoOpenTryOn(false);
                      }}
                      onClose={() => setActiveTab('home')}
                    />
                  )}

                  {activeTab === 'paywall' && (
                    <MembershipPaywall
                      activeTier={membershipTier}
                      onUpgradeTier={(tier, cycle) => handleUpgradeSubscription(tier, cycle)}
                      onClose={() => setActiveTab('you')}
                      membershipPlans={membershipPlans}
                    />
                  )}

                  {activeTab === 'wishlist' && (
                    <MyWishlist
                      products={products}
                      wishlist={wishlist}
                      onToggleWishlist={handleToggleWishlist}
                      onAddToCart={addToCart}
                      onSelectProduct={(p) => setSelectedProduct(p)}
                      onClose={() => setActiveTab('home')}
                    />
                  )}

                  {activeTab === 'you' && renderProfileTab()}

                  {activeTab === 'saved' && (
                    <CartCheckout
                      cart={cart}
                      adjustQty={adjustQty}
                      removeFromCart={removeFromCart}
                      subtotal={getSubtotal()}
                      couponDiscount={getCouponDiscount(Math.max(getSubtotal() - getMemberDiscount(getSubtotal()), 0))}
                      activeCoupon={activeCoupon}
                      availableCoupons={activeCoupons}
                      setActiveCoupon={setActiveCoupon}
                      pointsDiscount={getPointsValue()}
                      useLoyaltyPoints={useLoyaltyPoints}
                      setUseLoyaltyPoints={setUseLoyaltyPoints}
                      crmCustomer={crmCustomer}
                      loyaltyConfig={loyaltyConfig}
                      grandTotal={getGrandTotal()}
                      initialStep={cartCheckoutStep}
                      customerName={customerName}
                      setCustomerName={setCustomerName}
                      customerPhone={customerPhone}
                      setCustomerPhone={setCustomerPhone}
                      deliveryAddress={deliveryAddress}
                      setDeliveryAddress={setDeliveryAddress}
                      paymentMode={paymentMode}
                      setPaymentMode={setPaymentMode}
                      isSubmitting={isSubmitting}
                      onSubmitOrder={handlePlaceOrder}
                      loyaltyMessage={loyaltyMessage}
                      onCheckLoyalty={handleCheckLoyalty}
                      membershipTier={membershipTier}
                      placedOrders={placedOrders}
                      useWalletBalance={useWalletBalance}
                      setUseWalletBalance={setUseWalletBalance}
                      savedAddresses={savedAddresses}
                      onAddAddress={handleAddAddress}
                      onDeleteAddress={handleDeleteAddress}
                      membershipPlans={membershipPlans}
                      memberDiscount={getMemberDiscount(getSubtotal())}
                      shippingFee={getShippingFee(getSubtotal())}
                    />
                  )}
                </div>

                {/* Bottom Navigation Menu bar within phone (Orange active accents) */}
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '10px 6px', borderTop: '1.5px solid var(--phone-nav-border)', background: 'var(--phone-header-bg)' }}>
                  <button
                    onClick={() => setActiveTab('home')}
                    style={{ background: 'none', border: 'none', color: activeTab === 'home' ? '#ff6b35' : 'var(--phone-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', fontSize: '9px', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
                  >
                    <Home size={18} />
                    <span>Home</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('explore')}
                    style={{ background: 'none', border: 'none', color: activeTab === 'explore' ? '#ff6b35' : 'var(--phone-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', fontSize: '9px', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
                  >
                    <Search size={18} />
                    <span>Search</span>
                  </button>

                  {/* Large Floating Center Scan Button */}
                  <div style={{ position: 'relative', marginTop: '-20px', zIndex: 10 }}>
                    <button
                      onClick={() => setActiveTab('tryon')}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: activeTab === 'tryon' ? '#ea580c' : '#ff6b35',
                        border: '4px solid var(--phone-card-bg)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(255, 107, 53, 0.35)',
                        outline: 'none'
                      }}
                      title="AI Virtual Try-On Studio"
                    >
                      <Eye size={18} />
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveTab('wishlist')}
                    style={{ background: 'none', border: 'none', color: activeTab === 'wishlist' ? '#ff6b35' : 'var(--phone-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', fontSize: '9px', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
                  >
                    <Heart size={18} />
                    <span>Wishlist</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('you')}
                    style={{ background: 'none', border: 'none', color: activeTab === 'you' ? '#ff6b35' : 'var(--phone-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', fontSize: '9px', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
                  >
                    <User size={18} />
                    <span>Profile</span>
                  </button>
                </div>

                {/* Product Detail Modal popups */}
                {selectedProduct && (
                  <ProductDetailModal
                    product={selectedProduct}
                    autoOpenTryOn={autoOpenTryOn}
                    wishlist={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                    onClose={() => {
                      setSelectedProduct(null);
                      setAutoOpenTryOn(false);
                    }}
                    onAddToBag={(p) => addToCart(p)}
                    onNavigateToBag={(buyNow = false) => {
                      if (buyNow) {
                        setCartCheckoutStep('select-address');
                      } else {
                        setCartCheckoutStep('bag');
                      }
                      setActiveTab('saved');
                      setSelectedProduct(null);
                      setAutoOpenTryOn(false);
                    }}
                  />
                )}

              </div>
            </div>
          )}
        </div>

        {/* Right Side: Admin Desktop Console window mockup */}
        {showAdminConsole && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-gold)', fontFamily: 'var(--font-heading)' }}>
              💻 Store Merchant Dashboard
            </span>
            <div className="glass-panel" style={{ width: '480px', height: '580px', overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '16px', boxShadow: '0 20px 45px rgba(0,0,0,0.6)' }}>

              {/* Window chrome title bar */}
              <div style={{ display: 'flex', alignContent: 'center', gap: '6px', padding: '10px 14px', borderBottom: '2px solid var(--line)', background: 'rgba(255,255,255,0.03)' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-red)' }}></span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-gold)' }}></span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-green)' }}></span>
                <span style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>
                  admin.rgretailer.app/engine
                </span>
              </div>

              <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <AdminConsole products={products} recommendationRules={recommendationRules} stories={stories} />
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Global checkout success popup */}
      {orderSuccessId && (
        <div className="overlay-success-container">
          <div className="glass-panel success-modal">
            <div className="success-icon-badge">
              <Check size={36} />
            </div>
            <h3 className="success-title">Order Placed!</h3>
            <p className="success-message">
              Thank you for ordering at **{storeSettings.storeName}**! Your order has synced with the store's physical POS screen in real time.
              <br />
              <span className="order-id-highlight">ID: {orderSuccessId}</span>
            </p>
            <button className="modal-close-btn" onClick={() => setOrderSuccessId(null)}>
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {globalAlert.show && (
        <div className="overlay-alert-container" onClick={() => setGlobalAlert(prev => ({ ...prev, show: false }))}>
          <div className="custom-alert-modal" onClick={e => e.stopPropagation()}>
            <div className={`custom-alert-icon-wrapper custom-alert-icon-${globalAlert.type}`}>
              {globalAlert.type === 'error' && <AlertCircle size={28} />}
              {globalAlert.type === 'success' && <Check size={28} />}
              {globalAlert.type === 'info' && <Info size={28} />}
            </div>
            <h3 className="custom-alert-title">{globalAlert.title}</h3>
            <p className="custom-alert-message">{globalAlert.message}</p>
            <button className="custom-alert-close-btn" onClick={() => setGlobalAlert(prev => ({ ...prev, show: false }))}>
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;

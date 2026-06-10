import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  MapPin, 
  CreditCard, 
  User, 
  Check, 
  Plus, 
  Minus, 
  Trash2,
  Percent,
  Sparkles,
  Ticket,
  ChevronRight,
  ShieldCheck,
  Wallet,
  Crown,
  ArrowLeft,
  Briefcase,
  Navigation,
  X,
  Star,
  Truck,
  Phone,
  Home
} from 'lucide-react';

function CartCheckout({ 
  cart = [], 
  adjustQty, 
  removeFromCart, 
  subtotal = 0, 
  couponDiscount = 0, 
  activeCoupon = null, 
  availableCoupons = [], 
  setActiveCoupon,
  pointsDiscount = 0, 
  useLoyaltyPoints = false, 
  setUseLoyaltyPoints, 
  crmCustomer = null,
  loyaltyConfig = { pointsPer100: 10, valuePerPoint: 0.50, minRedeem: 100 },
  grandTotal = 0, 
  customerName = '', 
  setCustomerName, 
  customerPhone = '', 
  setCustomerPhone, 
  deliveryAddress = '', 
  setDeliveryAddress, 
  paymentMode = 'UPI', 
  setPaymentMode, 
  isSubmitting = false, 
  onSubmitOrder,
  loyaltyMessage = '',
  onCheckLoyalty,
  membershipTier = 'Free',
  placedOrders = [],
  useWalletBalance = false,
  setUseWalletBalance,
  initialStep = 'bag',
  savedAddresses = [],
  onAddAddress,
  onDeleteAddress,
  membershipPlans = [],
  memberDiscount = 0,
  shippingFee = 0
}) {
  const [checkoutStep, setCheckoutStep] = useState(initialStep); // bag, select-address, select-payment
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    setCheckoutStep(initialStep);
  }, [initialStep]);

  // Selected Address state
  const [selectedAddressId, setSelectedAddressId] = useState('');

  // Address form fields
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formLine1, setFormLine1] = useState('');
  const [formLine2, setFormLine2] = useState('');
  const [formPinCode, setFormPinCode] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [addressType, setAddressType] = useState('Home');

  // Auto-select default address on mount or if savedAddresses changes
  useEffect(() => {
    if (savedAddresses && savedAddresses.length > 0) {
      const currentExists = savedAddresses.some(a => a.id === selectedAddressId);
      if (!selectedAddressId || !currentExists) {
        const def = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
        setSelectedAddressId(def.id);
      }
    } else {
      setSelectedAddressId('');
    }
  }, [savedAddresses, selectedAddressId]);

  // Sync selected address to parent shipping details
  useEffect(() => {
    const selected = savedAddresses.find(a => a.id === selectedAddressId);
    if (selected) {
      setCustomerName(selected.name);
      setCustomerPhone(selected.phone);
      const addrStr = selected.line1 ? `${selected.line1}${selected.line2 ? ', ' + selected.line2 : ''}, ${selected.city}, ${selected.state} - ${selected.pinCode || selected.pincode}` : selected.detail;
      setDeliveryAddress(addrStr);
    }
  }, [selectedAddressId, savedAddresses]);

  // Handle coupon entry typing
  const [couponInputText, setCouponInputText] = useState('');
  const handleApplyTypedCoupon = (e) => {
    e.preventDefault();
    if (!couponInputText.trim()) return;
    const match = availableCoupons.find(c => c.code.toUpperCase() === couponInputText.trim().toUpperCase());
    if (match) {
      if (subtotal >= parseFloat(match.minOrder || 0)) {
        setActiveCoupon(match);
        alert(`Coupon ${match.code} applied successfully!`);
        setCouponInputText('');
      } else {
        alert(`Minimum order of ₹${match.minOrder} required for this coupon.`);
      }
    } else {
      alert("Invalid or expired coupon code.");
    }
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim() || !formLine1.trim() || !formPinCode.trim() || !formCity.trim() || !formState.trim()) {
      alert("Please fill in all required fields.");
      return;
    }
    
    if (formPhone.replace(/\D/g, '').length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (formPinCode.replace(/\D/g, '').length < 6) {
      alert("Please enter a valid 6-digit PIN code.");
      return;
    }

    const newAddrId = `addr_${Date.now()}`;
    const compiledDetail = `${formLine1.trim()}${formLine2.trim() ? ', ' + formLine2.trim() : ''}, ${formCity.trim()}, ${formState.trim()} - ${formPinCode.trim()}`;

    const newAddr = {
      id: newAddrId,
      type: addressType,
      name: formName.trim(),
      line1: formLine1.trim(),
      line2: formLine2.trim(),
      city: formCity.trim(),
      state: formState.trim(),
      pinCode: formPinCode.trim(),
      phone: formPhone.trim(),
      detail: compiledDetail,
      isDefault: savedAddresses.length === 0
    };

    onAddAddress(newAddr);
    setSelectedAddressId(newAddrId);
    
    // Clear inputs
    setFormName('');
    setFormPhone('');
    setFormLine1('');
    setFormLine2('');
    setFormPinCode('');
    setFormCity('');
    setFormState('');
    setAddressType('Home');
    setShowAddressForm(false);
  };

  const handleUseCurrentLocation = () => {
    setFormName(formName || 'Manisha Rawat');
    setFormPhone(formPhone || '7425987654');
    setFormLine1("Flat 402, Royal Residency");
    setFormLine2("Linking Road, Bandra West");
    setFormCity("Mumbai");
    setFormState("Maharashtra");
    setFormPinCode("400050");
    
    try {
      if (navigator.vibrate) navigator.vibrate(15);
    } catch(e){}
    alert("Bandra West location coordinates synced successfully!");
  };

  const parsePrice = (priceVal) => {
    if (priceVal === null || priceVal === undefined) return 0;
    if (typeof priceVal === 'number') return priceVal;
    const cleaned = String(priceVal).replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Cart values calculations
  const totalMRP = cart.reduce((sum, item) => sum + (parsePrice(item.mrp || item.sellingPrice) * item.qty), 0);
  const discountOnMRP = totalMRP - subtotal;
  
  const welcomeWalletBalance = crmCustomer ? parsePrice(crmCustomer.walletBalance ?? 250.00) : 250.00;
  const walletSpent = useWalletBalance ? Math.min(welcomeWalletBalance, grandTotal) : 0;
  const amountPayable = Math.max(grandTotal - walletSpent, 0);
  const netDiscount = discountOnMRP + memberDiscount + couponDiscount + pointsDiscount + walletSpent;
  
  // Points calculations
  const pointsPer100 = loyaltyConfig?.pointsPer100 || 10;
  let tierMultiplier = 1.0;
  const matchedPlan = membershipPlans.find(
    p => p.id?.toLowerCase() === membershipTier.toLowerCase() || p.name?.toLowerCase() === membershipTier.toLowerCase()
  );
  if (matchedPlan && matchedPlan.loyaltyMultiplier !== undefined) {
    tierMultiplier = parseFloat(matchedPlan.loyaltyMultiplier || 1.0);
  } else {
    // Fallbacks matching Admin seeds & legacy definitions
    if (membershipTier === 'Silver') tierMultiplier = 1.5;
    else if (membershipTier === 'Gold') tierMultiplier = 2.0;
    else if (membershipTier === 'Platinum') tierMultiplier = 3.0;
    else if (membershipTier === 'VIP') tierMultiplier = 2.0;
    else if (membershipTier === 'Plus') tierMultiplier = 1.2;
  }
  const earnPoints = Math.floor((grandTotal / 100) * pointsPer100 * tierMultiplier);

  const selectedAddress = savedAddresses.find(a => a.id === selectedAddressId) || savedAddresses[0];

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--phone-bg)',
      color: 'var(--phone-text-title)',
      fontFamily: "'Outfit', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{`
        .toggle-switch-input {
          position: relative;
          width: 44px;
          height: 24px;
          -webkit-appearance: none;
          background: var(--phone-card-border);
          outline: none;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .toggle-switch-input:checked {
          background: #ff6b35;
        }
        .toggle-switch-input::before {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          top: 2px;
          left: 2px;
          background: #ffffff;
          transition: transform 0.2s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        }
        .toggle-switch-input:checked::before {
          transform: translateX(20px);
        }
        .ios-toggle-switch {
          display: flex;
          align-items: center;
        }
        .checkout-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: var(--phone-header-bg);
          border-bottom: 1.5px solid var(--phone-card-border);
        }
        .stepper-bubble {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: bold;
        }
        .payment-radio-card {
          background: var(--phone-card-bg);
          border: 1.5px solid var(--phone-card-border);
          border-radius: 20px;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.22s ease;
        }
        .payment-radio-card.active {
          border-color: #ff6b35;
          box-shadow: 0 4px 14px rgba(255, 107, 53, 0.05);
        }
        .address-card-item {
          background: var(--phone-card-bg);
          border: 2px solid var(--phone-card-border);
          border-radius: 20px;
          padding: 18px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        .address-card-item.active {
          border-color: #ff6b35;
        }
        .address-type-btn {
          flex: 1;
          padding: 10px;
          border-radius: 12px;
          border: 1.5px solid var(--phone-card-border);
          background: var(--phone-bg);
          color: var(--phone-text-body);
          font-size: 12.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .address-type-btn.active {
          border-color: #ff6b35;
          background: rgba(249, 115, 22, 0.08);
          color: var(--primary-color);
        }
        .checkout-input {
          width: 100%;
          padding: 10px 14px;
          border: 1.2px solid var(--phone-card-border);
          background: var(--phone-bg);
          color: var(--phone-text-title);
          border-radius: 10px;
          font-size: 13px;
          outline: none;
          font-family: 'Outfit', sans-serif;
        }
        .checkout-input:focus {
          border-color: #ff6b35;
        }
      `}</style>

      {/* STEP 1: Shopping Cart Bag list view */}
      {checkoutStep === 'bag' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Header titles */}
          <div className="checkout-header">
            <button 
              onClick={() => window.location.reload()}
              style={{ background: 'none', border: 'none', color: 'var(--phone-text-title)', cursor: 'pointer', outline: 'none' }}
            >
              <ArrowLeft size={20} />
            </button>
            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--phone-text-title)' }}>
              Shopping Cart ({cart.length})
            </span>
            <div style={{ width: '20px' }} />
          </div>

          <div className="carousel-scroll" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '90px' }}>
            
            {/* Premium Gold Crown Promo banner */}
            <div style={{ 
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              borderBottom: '1px solid var(--phone-card-border)',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Crown size={18} style={{ color: '#ca8a04' }} />
              <span style={{ fontSize: '12px', color: '#854d0e', fontWeight: 700 }}>
                Upgrade to Premium & save extra 10-25% on this order!
              </span>
            </div>

            {/* Shopping cart items display */}
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--phone-card-bg)', border: '1.5px solid var(--phone-card-border)', color: 'var(--phone-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <ShoppingBag size={28} style={{ margin: 'auto' }} />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--phone-text-title)', margin: 0 }}>Your Bag is Empty</h3>
                <p style={{ fontSize: '13px', color: 'var(--phone-text-muted)', margin: 0, fontWeight: 500 }}>
                  Add products from boutique curations to checkout!
                </p>
              </div>
            ) : (
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {cart.map(item => (
                  <div 
                    key={item.id}
                    style={{
                      background: 'var(--phone-card-bg)',
                      borderRadius: '24px',
                      border: '1.5px solid var(--phone-card-border)',
                      padding: '16px',
                      display: 'flex',
                      gap: '14px',
                      position: 'relative'
                    }}
                  >
                    {/* Item thumbnail */}
                    <div style={{ width: '84px', height: '100px', borderRadius: '16px', overflow: 'hidden', background: 'var(--phone-bg)', border: '1px solid var(--phone-card-border)', flexShrink: 0 }}>
                      <img src={item.imageURL || item.image || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200"} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    {/* Details content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, paddingRight: '24px' }}>
                      <span style={{ fontSize: '10.5px', color: 'var(--phone-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {item.brand || 'RG BRAND'}
                      </span>
                      <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--phone-text-title)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                        {item.name}
                      </h4>
                      <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)', fontWeight: 600 }}>
                        Size: {item.size || 'L'} | Color: {item.color || 'Pink Floral'}
                      </span>
                      
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--primary-color)' }}>
                          ₹{parsePrice(item.sellingPrice).toLocaleString()}
                        </span>
                        <span style={{ fontSize: '11.5px', textDecoration: 'line-through', color: 'var(--phone-text-muted)' }}>
                          ₹{parsePrice(item.mrp || item.sellingPrice * 1.8).toLocaleString()}
                        </span>
                      </div>

                      {/* Quantity pills selector */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', border: '1.2px solid var(--phone-card-border)', borderRadius: '8px', width: 'fit-content', padding: '1px', background: 'var(--phone-bg)' }}>
                        <button 
                          onClick={() => adjustQty(item.id, -1)}
                          style={{ background: 'none', border: 'none', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--phone-text-body)', cursor: 'pointer', outline: 'none' }}
                        >
                          <Minus size={11} />
                        </button>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--phone-text-title)', minWidth: '14px', textAlign: 'center' }}>
                          {item.qty}
                        </span>
                        <button 
                          onClick={() => adjustQty(item.id, 1)}
                          style={{ background: 'none', border: 'none', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--phone-text-body)', cursor: 'pointer', outline: 'none' }}
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Delete trash button */}
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: '0.25rem', outline: 'none' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Separator */}
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--phone-card-border)', opacity: 0.5 }} />

            {/* Apply Coupons Section */}
            <div style={{ padding: '20px', background: 'var(--phone-card-bg)', display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid var(--phone-card-border)' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--phone-text-title)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Ticket size={16} style={{ color: 'var(--primary-color)' }} /> Apply Coupon
              </span>
              
              <form onSubmit={handleApplyTypedCoupon} style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="Enter coupon code" 
                  value={couponInputText}
                  onChange={(e) => setCouponInputText(e.target.value)}
                  style={{ flex: 1, padding: '12px 16px', border: '1.5px solid var(--phone-card-border)', background: 'var(--phone-bg)', color: 'var(--phone-text-title)', borderRadius: '12px', fontSize: '13.5px', outline: 'none', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}
                />
                <button
                  type="submit"
                  className="interactive-element"
                  style={{ padding: '0 20px', borderRadius: '12px', border: 'none', background: 'var(--primary-color)', color: '#ffffff', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Apply
                </button>
              </form>

              {activeCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '8px 12px', borderRadius: '10px', fontSize: '12px' }}>
                  <span style={{ color: '#6366f1', fontWeight: 800 }}>Coupon {activeCoupon.code} Applied!</span>
                  <button 
                    onClick={() => { setActiveCoupon(null); setCouponInputText(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-red)', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Loyalty Points selector */}
            <div style={{ padding: '20px', background: 'var(--phone-card-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--phone-card-border)' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ color: 'var(--accent-gold)', marginTop: '2px' }}>
                  <Sparkles size={18} fill="var(--accent-gold)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--phone-text-title)' }}>Loyalty Points</span>
                  <span style={{ fontSize: '12.5px', color: 'var(--phone-text-body)', fontWeight: 600 }}>
                    {crmCustomer?.loyaltyPoints ?? 120} points available
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)', fontWeight: 500 }}>
                    {(crmCustomer?.loyaltyPoints ?? 120) >= (loyaltyConfig?.minRedeem || 100) ? (
                      `Save up to ₹${((crmCustomer?.loyaltyPoints ?? 120) * (loyaltyConfig?.valuePerPoint || 0.50)).toFixed(0)}`
                    ) : (
                      `Min ${loyaltyConfig?.minRedeem || 100} points required to redeem`
                    )}
                  </span>
                </div>
              </div>

              {/* iOS switch toggle slider */}
              <label className="ios-toggle-switch">
                <input 
                  type="checkbox" 
                  className="toggle-switch-input"
                  checked={useLoyaltyPoints}
                  disabled={(crmCustomer?.loyaltyPoints ?? 120) < (loyaltyConfig?.minRedeem || 100)}
                  onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                />
              </label>
            </div>

            {/* Wallet Balance selector */}
            <div style={{ padding: '20px', background: 'var(--phone-card-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--phone-card-border)' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ color: '#0ea5e9', marginTop: '2px' }}>
                  <Wallet size={18} fill="#0ea5e9" style={{ color: '#0ea5e9' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--phone-text-title)' }}>Wallet Balance</span>
                  <span style={{ fontSize: '12.5px', color: 'var(--phone-text-body)', fontWeight: 600 }}>
                    ₹{welcomeWalletBalance.toFixed(2)} available
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)', fontWeight: 500 }}>
                    {welcomeWalletBalance > 0 ? `Deduct up to ₹${Math.min(welcomeWalletBalance, grandTotal).toFixed(2)} from total` : 'No balance available'}
                  </span>
                </div>
              </div>

              {/* iOS switch toggle slider */}
              <label className="ios-toggle-switch">
                <input 
                  type="checkbox" 
                  className="toggle-switch-input"
                  checked={useWalletBalance}
                  disabled={welcomeWalletBalance <= 0}
                  onChange={(e) => setUseWalletBalance(e.target.checked)}
                />
              </label>
            </div>

            {/* Separator */}
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--phone-card-border)', opacity: 0.5 }} />

            {/* Price Details Ledger cards breakdown */}
            {cart.length > 0 && (
              <div style={{ padding: '20px', background: 'var(--phone-card-bg)', display: 'flex', flexDirection: 'column', gap: '14px', borderBottom: '1px solid var(--phone-card-border)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--phone-text-title)', margin: 0 }}>
                  Price Details
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderBottom: '1px solid var(--phone-card-border)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--phone-text-body)', fontWeight: 600 }}>
                    <span>Total MRP ({cart.length} items)</span>
                    <span style={{ color: 'var(--phone-text-title)', fontWeight: 800 }}>₹{totalMRP.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--phone-text-body)', fontWeight: 600 }}>
                    <span>Discount on MRP</span>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 800 }}>-₹{discountOnMRP.toLocaleString()}</span>
                  </div>
                  {memberDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--phone-text-body)', fontWeight: 600 }}>
                      <span>Membership Discount</span>
                      <span style={{ color: 'var(--accent-green)', fontWeight: 800 }}>-₹{memberDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--phone-text-body)', fontWeight: 600 }}>
                      <span>Coupon Discount</span>
                      <span style={{ color: 'var(--accent-green)', fontWeight: 800 }}>-₹{couponDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  {useLoyaltyPoints && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--phone-text-body)', fontWeight: 600 }}>
                      <span>Loyalty Discount</span>
                      <span style={{ color: 'var(--accent-green)', fontWeight: 800 }}>-₹{pointsDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  {useWalletBalance && walletSpent > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--phone-text-body)', fontWeight: 600 }}>
                      <span>Wallet Deduction</span>
                      <span style={{ color: 'var(--accent-green)', fontWeight: 800 }}>-₹{walletSpent.toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--phone-text-body)', fontWeight: 600 }}>
                    <span>Delivery Fee</span>
                    <span style={{ color: shippingFee > 0 ? 'var(--phone-text-title)' : 'var(--accent-green)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {shippingFee > 0 ? (
                        `₹${shippingFee}`
                      ) : (
                        <>
                          <span style={{ textDecoration: 'line-through', color: 'var(--phone-text-muted)', fontSize: '11px' }}>₹{membershipTier === 'Silver' ? 49 : 99}</span>
                          FREE
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Net sums */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--phone-text-title)' }}>Amount Payable</span>
                  <span style={{ fontSize: '19px', fontWeight: 900, color: 'var(--phone-text-title)' }}>
                    ₹{amountPayable.toLocaleString()}
                  </span>
                </div>

                {/* Loyalty points earn notice */}
                <div style={{ fontSize: '11px', color: 'var(--primary-color)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '-2px' }}>
                  <Star size={12} fill="var(--accent-gold)" style={{ color: 'var(--accent-gold)' }} />
                  Earn {earnPoints} points on this order
                </div>

                {/* Mint green saving banner */}
                <div style={{ 
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  color: 'var(--accent-green)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  textAlign: 'center',
                  border: '1.2px solid rgba(16, 185, 129, 0.2)'
                }}>
                  You are saving ₹{netDiscount.toLocaleString()} on this order!
                </div>
              </div>
            )}

          </div>

          {/* Floating checkout Proceed action bar */}
          {cart.length > 0 && (
            <div style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              background: 'var(--phone-header-bg)', 
              borderTop: '1.5px solid var(--phone-card-border)', 
              padding: '12px 20px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              zIndex: 20
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <span style={{ fontSize: '10px', color: 'var(--phone-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Amount Payable</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--phone-text-title)' }}>₹{amountPayable.toLocaleString()}</span>
              </div>

              <button
                onClick={() => {
                  if (subtotal <= 0) {
                    alert("Your cart subtotal must be greater than ₹0 to proceed.");
                    return;
                  }
                  setCheckoutStep('select-address');
                }}
                className="btn-premium"
                style={{ 
                  padding: '14px 28px', 
                  borderRadius: '14px', 
                  background: 'linear-gradient(135deg, #ff6b35 0%, #ea580c 100%)', 
                  color: '#ffffff', 
                  border: 'none', 
                  fontSize: '14.5px', 
                  fontWeight: 800, 
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.22)'
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          )}

        </div>
      )}

      {/* STEP 2: Select Address view card list */}
      {checkoutStep === 'select-address' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Header details */}
          <div className="checkout-header">
            <button 
              onClick={() => setCheckoutStep('bag')}
              style={{ background: 'none', border: 'none', color: 'var(--phone-text-title)', cursor: 'pointer', outline: 'none' }}
            >
              <ArrowLeft size={20} />
            </button>
            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--phone-text-title)' }}>
              Select Address
            </span>
            <div style={{ width: '20px' }} />
          </div>

          <div className="carousel-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px', paddingBottom: '90px', WebkitOverflowScrolling: 'touch' }}>
            
            {/* Stepper progress indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div className="stepper-bubble" style={{ backgroundColor: 'var(--phone-text-title)', color: 'var(--phone-bg)' }}>1</div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--phone-text-title)' }}>Address</span>
              </div>
              <div style={{ width: '40px', height: '2.2px', backgroundColor: 'var(--accent-green)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.5 }}>
                <div className="stepper-bubble" style={{ backgroundColor: 'var(--phone-card-bg)', border: '2px solid var(--phone-card-border)', color: 'var(--phone-text-muted)' }}>2</div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--phone-text-muted)' }}>Payment</span>
              </div>
            </div>

            {/* List saved addresses cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {savedAddresses.map(addr => {
                const isActive = selectedAddressId === addr.id;
                const resolvedType = addr.type || 'Home';
                return (
                  <div 
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`address-card-item ${isActive ? 'active' : ''}`}
                    style={{
                      borderWidth: '2px',
                      borderColor: isActive ? 'var(--primary-color)' : 'var(--phone-card-border)'
                    }}
                  >
                    {/* Active checked badge icon */}
                    {isActive && (
                      <div style={{ position: 'absolute', top: '18px', right: '18px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                        <Check size={12} style={{ color: '#ffffff' }} />
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: 'var(--primary-color)' }}>
                        {resolvedType === 'Office' || resolvedType === 'Work' ? <Briefcase size={12} /> : resolvedType === 'Home' ? <Home size={12} /> : <MapPin size={12} />}
                      </div>
                      <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--phone-text-title)', textTransform: 'uppercase' }}>
                        {resolvedType}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--phone-text-title)', margin: '0 0 4px' }}>
                      {addr.name}
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--phone-text-body)', margin: '0 0 6px', lineHeight: '1.45', fontWeight: 500 }}>
                      {addr.line1 ? (
                        <>
                          {addr.line1}
                          {addr.line2 ? `, ${addr.line2}` : ''}
                          <br />
                          {addr.city}, {addr.state} – {addr.pinCode || addr.pincode}
                        </>
                      ) : (
                        addr.detail
                      )}
                    </p>
                    <span style={{ fontSize: '12px', color: 'var(--phone-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} style={{ color: 'var(--primary-color)' }} />
                      {addr.phone}
                    </span>
                  </div>
                );
              })}

              {/* Dashed circular button card to trigger Address Editor Form sheet */}
              <button 
                onClick={() => setShowAddressForm(true)}
                className="interactive-element"
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '20px',
                  border: '2px dashed var(--primary-color)',
                  background: 'none',
                  color: 'var(--primary-color)',
                  fontSize: '14.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  outline: 'none'
                }}
              >
                + Add New Address
              </button>
            </div>

          </div>

          {/* Fixed bottom proceed to payment bar */}
          <div style={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            background: 'var(--phone-header-bg)', 
            borderTop: '1.5px solid var(--phone-card-border)', 
            padding: '12px 20px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            zIndex: 20
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span style={{ fontSize: '10px', color: 'var(--phone-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Ship to</span>
              <span style={{ fontSize: '14.5px', fontWeight: 900, color: 'var(--phone-text-title)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>
                {selectedAddress?.name || 'No address chosen'}
              </span>
            </div>

            <button
              onClick={() => {
                if (!selectedAddressId) {
                  alert("Please add or select a shipping address first!");
                  return;
                }
                setCheckoutStep('select-payment');
              }}
              className="btn-premium"
              style={{ 
                padding: '14px 28px', 
                borderRadius: '14px', 
                background: 'linear-gradient(135deg, #ff6b35 0%, #ea580c 100%)', 
                color: '#ffffff', 
                border: 'none', 
                fontSize: '14.5px', 
                fontWeight: 800, 
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.22)'
              }}
            >
              Continue to Payment
            </button>
          </div>

          {/* Dynamic sliding custom Address Editor Form drag sheet drawer */}
          {showAddressForm && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'flex-end',
              animation: 'fadeIn 0.2s'
            }}>
              <form 
                onSubmit={handleSaveAddress}
                style={{
                  width: '100%',
                  background: 'var(--phone-card-bg)',
                  borderRadius: '28px 28px 0 0',
                  borderTop: '1.5px solid var(--phone-card-border)',
                  padding: '14px 20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  maxHeight: '94%',
                  overflowY: 'auto'
                }}
              >
                {/* Drag handle line */}
                <div style={{ width: '40px', height: '5px', background: 'var(--phone-card-border)', borderRadius: '3px', margin: '0 auto 6px' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--phone-text-title)' }}>Add Address</span>
                  <button 
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    style={{ background: 'var(--phone-bg)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--phone-text-muted)', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Use current location selector shortcut */}
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="interactive-element"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--phone-text-title)',
                    background: 'transparent',
                    color: 'var(--phone-text-title)',
                    fontSize: '13px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Navigation size={14} style={{ color: 'var(--phone-text-title)' }} />
                  Use my current location
                </button>

                {/* Address type selection pills */}
                <div style={{ display: 'flex', gap: '8px', margin: '4px 0' }}>
                  {[
                    { id: 'Home', label: 'Home', icon: <MapPin size={13} /> },
                    { id: 'Office', label: 'Office', icon: <Briefcase size={13} /> },
                    { id: 'Other', label: 'Other', icon: <User size={13} /> }
                  ].map(pill => (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setAddressType(pill.id)}
                      className={`address-type-btn ${addressType === pill.id ? 'active' : ''}`}
                    >
                      {pill.icon}
                      {pill.label}
                    </button>
                  ))}
                </div>

                {/* Form fields lists inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--phone-text-body)' }}>Full Name *</span>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="checkout-input"
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--phone-text-body)' }}>Phone Number *</span>
                    <input 
                      type="tel" 
                      required
                      maxLength="10"
                      placeholder="10-digit mobile number"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value.replace(/\D/g, ''))}
                      className="checkout-input"
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--phone-text-body)' }}>Address Line 1 *</span>
                    <input 
                      type="text" 
                      required
                      placeholder="House / Flat No., Building, Street"
                      value={formLine1}
                      onChange={(e) => setFormLine1(e.target.value)}
                      className="checkout-input"
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--phone-text-body)' }}>Address Line 2</span>
                    <input 
                      type="text" 
                      placeholder="Area, Locality, Landmark (Optional)"
                      value={formLine2}
                      onChange={(e) => setFormLine2(e.target.value)}
                      className="checkout-input"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--phone-text-body)' }}>PIN Code *</span>
                      <input 
                        type="text" 
                        required
                        maxLength="6"
                        placeholder="6-digit PIN"
                        value={formPinCode}
                        onChange={(e) => setFormPinCode(e.target.value.replace(/\D/g, ''))}
                        className="checkout-input"
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--phone-text-body)' }}>City *</span>
                      <input 
                        type="text" 
                        required
                        placeholder="City"
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        className="checkout-input"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--phone-text-body)' }}>State *</span>
                    <input 
                      type="text" 
                      required
                      placeholder="State"
                      value={formState}
                      onChange={(e) => setFormState(e.target.value)}
                      className="checkout-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-premium"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'var(--primary-color)',
                    color: '#ffffff',
                    fontSize: '14.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    marginTop: '8px',
                    boxShadow: '0 4px 12px rgba(255, 107, 53, 0.2)'
                  }}
                >
                  Save Address
                </button>
              </form>
            </div>
          )}

        </div>
      )}

      {/* STEP 3: Payment view & orders ledger summary */}
      {checkoutStep === 'select-payment' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Header details */}
          <div className="checkout-header">
            <button 
              onClick={() => setCheckoutStep('select-address')}
              style={{ background: 'none', border: 'none', color: 'var(--phone-text-title)', cursor: 'pointer', outline: 'none' }}
            >
              <ArrowLeft size={20} />
            </button>
            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--phone-text-title)' }}>
              Payment
            </span>
            <div style={{ width: '20px' }} />
          </div>

          <div className="carousel-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px', paddingBottom: '90px', WebkitOverflowScrolling: 'touch' }}>
            
            {/* Stepper indicators progress bar */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div className="stepper-bubble" style={{ backgroundColor: 'var(--accent-green)', color: '#ffffff' }}>✓</div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-green)' }}>Address</span>
              </div>
              <div style={{ width: '40px', height: '2.2px', backgroundColor: 'var(--accent-green)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div className="stepper-bubble" style={{ backgroundColor: 'var(--phone-text-title)', color: 'var(--phone-bg)' }}>2</div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--phone-text-title)' }}>Payment</span>
              </div>
            </div>

            {/* Delivering to card summary */}
            <div style={{ background: 'var(--phone-card-bg)', border: '1.5px solid var(--phone-card-border)', borderRadius: '20px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '12px' }}>
                <span style={{ fontSize: '10.5px', color: 'var(--phone-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Delivering to</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--phone-text-title)' }}>{selectedAddress?.name}</span>
                <p style={{ fontSize: '12.5px', color: 'var(--phone-text-body)', margin: 0, fontWeight: 500, lineHeight: 1.35 }}>
                  {selectedAddress?.line1 ? (
                    `${selectedAddress.line1}, ${selectedAddress.city} - ${selectedAddress.pinCode || selectedAddress.pincode}`
                  ) : (
                    selectedAddress?.detail
                  )}
                </p>
              </div>
              <button 
                onClick={() => setCheckoutStep('select-address')}
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer', outline: 'none' }}
              >
                Change
              </button>
            </div>

            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--phone-text-title)', margin: '0 0 14px' }}>
              Select Payment Method
            </h3>

            {/* Radio Payment methods checklist cards list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {[
                { id: 'UPI', title: 'UPI', desc: 'Pay using any UPI app', icon: <Navigation size={18} /> },
                { id: 'Card', title: 'Credit/Debit Card', desc: 'Visa, Mastercard, RuPay', icon: <CreditCard size={18} /> },
                { id: 'NetBanking', title: 'Net Banking', desc: 'All major banks', icon: <Briefcase size={18} /> },
                { id: 'Wallets', title: 'Wallets', desc: 'Paytm, PhonePe, etc.', icon: <Wallet size={18} /> },
                { id: 'Cash', title: 'Cash on Delivery', desc: 'Secure cash payment', icon: <Truck size={18} /> }
              ].map(pay => {
                const isActive = paymentMode === pay.id;
                return (
                  <div 
                    key={pay.id}
                    onClick={() => setPaymentMode(pay.id)}
                    className={`payment-radio-card ${isActive ? 'active' : ''}`}
                    style={{
                      borderColor: isActive ? 'var(--primary-color)' : 'var(--phone-card-border)'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: 'var(--phone-text-body)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {pay.icon}
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--phone-text-title)' }}>{pay.title}</span>
                        <span style={{ fontSize: '11.5px', color: 'var(--phone-text-muted)', fontWeight: 600 }}>{pay.desc}</span>
                      </div>
                    </div>

                    {/* Radio bullet check circles */}
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2.2px solid ${isActive ? 'var(--primary-color)' : 'var(--phone-card-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isActive && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary-color)' }} />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* UPI QR inline dynamic displays */}
            {paymentMode === 'UPI' && (
              <div className="col gap4 center animate-fade-in" style={{ 
                padding: '16px', 
                border: '2px dashed rgba(16, 185, 129, 0.3)', 
                borderRadius: '20px', 
                background: 'rgba(16, 185, 129, 0.04)', 
                textAlign: 'center', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px'
              }}>
                <span style={{ color: 'var(--accent-green)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                  <Sparkles size={13} /> Scan QR with any UPI App to Pay
                </span>
                <div style={{ 
                  width: '110px', 
                  height: '110px', 
                  background: '#ffffff', 
                  padding: '6px', 
                  borderRadius: '12px', 
                  display: 'grid', 
                  placeItems: 'center',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
                }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=98x98&data=${encodeURIComponent(`upi://pay?pa=rgretailer@paytm&pn=RG%20Retailer&am=${amountPayable.toFixed(2)}&cu=INR`)}`} 
                    alt="UPI QR Code" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <span style={{ fontSize: '10px', color: 'var(--phone-text-muted)' }}>UPI ID: <b>rgretailer@paytm</b></span>
              </div>
            )}

            {/* Order Summary card panel */}
            <div style={{ background: 'var(--phone-card-bg)', border: '1.5px solid var(--phone-card-border)', borderRadius: '20px', padding: '16px 20px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--phone-text-title)', margin: '0 0 12px' }}>
                Order Summary
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid var(--phone-card-border)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--phone-text-body)', fontWeight: 600 }}>
                  <span>Subtotal ({cart.length} items)</span>
                  <span style={{ color: 'var(--phone-text-title)', fontWeight: 800 }}>₹{subtotal.toLocaleString()}</span>
                </div>
                {memberDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--phone-text-body)', fontWeight: 600 }}>
                    <span>Membership Discount</span>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 800 }}>-₹{memberDiscount.toLocaleString()}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--phone-text-body)', fontWeight: 600 }}>
                    <span>Coupon Discount</span>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 800 }}>-₹{couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                {useLoyaltyPoints && pointsDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--phone-text-body)', fontWeight: 600 }}>
                    <span>Loyalty Discount</span>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 800 }}>-₹{pointsDiscount.toLocaleString()}</span>
                  </div>
                )}
                {useWalletBalance && walletSpent > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--phone-text-body)', fontWeight: 600 }}>
                    <span>Wallet Deduction</span>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 800 }}>-₹{walletSpent.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--phone-text-body)', fontWeight: 600 }}>
                  <span>Delivery Fee</span>
                  <span style={{ color: shippingFee > 0 ? 'var(--phone-text-title)' : 'var(--accent-green)', fontWeight: 800 }}>
                    {shippingFee > 0 ? `₹${shippingFee}` : 'FREE'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span style={{ fontSize: '14.5px', fontWeight: 900, color: 'var(--phone-text-title)' }}>Amount Payable</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--phone-text-title)' }}>₹{amountPayable.toLocaleString()}</span>
              </div>
            </div>

            {/* Secure Razorpay checkmark badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: 'var(--phone-text-muted)', fontWeight: 600, padding: '8px 0' }}>
              <ShieldCheck size={16} style={{ color: 'var(--accent-green)' }} />
              <span>Your payment is 100% secure with Razorpay</span>
            </div>

          </div>

          {/* Fixed bottom Pay order processing bar */}
          <div style={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            background: 'var(--phone-header-bg)', 
            borderTop: '1.5px solid var(--phone-card-border)', 
            padding: '12px 20px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            zIndex: 20
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span style={{ fontSize: '10px', color: 'var(--phone-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Amount Payable</span>
              <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--phone-text-title)' }}>₹{amountPayable.toLocaleString()}</span>
            </div>

            <button
              onClick={onSubmitOrder}
              disabled={isSubmitting}
              className="btn-premium"
              style={{ 
                padding: '14px 36px', 
                borderRadius: '14px', 
                background: 'linear-gradient(135deg, #ff6b35 0%, #ea580c 100%)', 
                color: '#ffffff', 
                border: 'none', 
                fontSize: '14.5px', 
                fontWeight: 800, 
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.22)'
              }}
            >
              {isSubmitting ? 'Processing...' : amountPayable > 0 ? `Pay ₹${amountPayable.toLocaleString()}` : 'Place Order'}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

export default CartCheckout;

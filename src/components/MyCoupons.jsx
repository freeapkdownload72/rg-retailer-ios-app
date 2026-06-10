import React, { useState } from 'react';
import { ArrowLeft, Ticket, Check, AlertCircle, Copy } from 'lucide-react';

function MyCoupons({ availableCoupons = [], activeCoupon, onApplyCoupon, onClose }) {
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [activeTab, setActiveTab] = useState('available'); // 'available' or 'expired'
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Fallback default mock coupons if empty
  const defaultAvailable = [
    { id: 'save20', code: 'SAVE20', title: '20% OFF on all items', description: 'Get 20% off up to ₹500 on orders above ₹1,000.', minOrder: 1000, value: 20, type: 'Percent', maxDiscount: 500 },
    { id: 'welcome100', code: 'WELCOME100', title: '₹100 Instant Discount', description: 'Get flat ₹100 off on your first order. No minimum order value.', minOrder: 0, value: 100, type: 'Fixed' },
    { id: 'style10', code: 'STYLE10', title: '10% Style Quiz Reward', description: 'Quiz completion special discount! 10% off on your shopping cart.', minOrder: 0, value: 10, type: 'Percent' }
  ];

  const defaultExpired = [
    { id: 'festive50', code: 'FESTIVE50', title: '50% Festive Mega Discount', description: 'Expired on 31st May 2026. Was valid on orders above ₹2,000.', minOrder: 2000, value: 50, type: 'Percent' }
  ];

  const todayStr = new Date().toISOString().split('T')[0];
  
  const dbAvailable = availableCoupons.filter(c => {
    const isActive = c.isActive !== false;
    const isStarted = !c.startDate || c.startDate <= todayStr;
    const isNotExpired = !c.endDate || c.endDate >= todayStr;
    return isActive && isStarted && isNotExpired;
  });

  const dbExpired = availableCoupons.filter(c => {
    const isActive = c.isActive !== false;
    const isStarted = !c.startDate || c.startDate <= todayStr;
    const isNotExpired = !c.endDate || c.endDate >= todayStr;
    return !(isActive && isStarted && isNotExpired);
  });

  const currentAvailable = availableCoupons.length > 0 ? dbAvailable : defaultAvailable;
  const currentExpired = availableCoupons.length > 0 ? dbExpired : defaultExpired;

  const handleApplyInputCoupon = (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    setErrorMsg('');
    setSuccessMsg('');

    const matched = currentAvailable.find(
      c => c.code.toUpperCase() === couponCodeInput.trim().toUpperCase()
    );

    if (matched) {
      onApplyCoupon(matched);
      setSuccessMsg(`Coupon ${matched.code} applied successfully!`);
      setCouponCodeInput('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMsg('Invalid or expired coupon code.');
    }
  };

  const handleApplyCardCoupon = (coupon) => {
    onApplyCoupon(coupon);
    setSuccessMsg(`Coupon ${coupon.code} applied!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCopyCode = (e, code, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--phone-bg)', color: 'var(--phone-text-title)', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', borderBottom: '1px solid var(--phone-card-border)', background: 'var(--phone-header-bg)' }}>
        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--phone-text-title)', padding: '4px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <ArrowLeft size={22} />
        </button>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--phone-text-title)', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.3px', margin: 0 }}>
          Coupons & Offers
        </h2>
      </div>

      {/* Body container */}
      <div className="carousel-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px', WebkitOverflowScrolling: 'touch' }}>
        
        {/* Coupon input code */}
        <div style={{
          background: 'var(--phone-card-bg)',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.01)',
          border: '1.5px solid var(--phone-card-border)',
          marginBottom: '20px'
        }}>
          <form onSubmit={handleApplyInputCoupon} style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text"
              placeholder="Enter coupon code"
              value={couponCodeInput}
              onChange={(e) => setCouponCodeInput(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1.5px solid var(--phone-card-border)',
                background: 'var(--phone-bg)',
                color: 'var(--phone-text-title)',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--phone-text-title)',
                outline: 'none',
                textTransform: 'uppercase',
                fontFamily: "'Outfit', sans-serif"
              }}
            />
            <button
              type="submit"
              className="interactive-element"
              style={{
                padding: '0 18px',
                borderRadius: '10px',
                background: 'var(--primary-color)',
                color: '#ffffff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255,107,53,0.15)'
              }}
            >
              Apply
            </button>
          </form>

          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-red)', fontSize: '11.5px', marginTop: '8px', fontWeight: 600 }}>
              <AlertCircle size={13} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)', fontSize: '11.5px', marginTop: '8px', fontWeight: 600 }}>
              <Check size={13} />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Available / Expired Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--phone-card-border)', padding: '3px', borderRadius: '12px', marginBottom: '16px' }}>
          <button
            onClick={() => setActiveTab('available')}
            className="interactive-element"
            style={{
              flex: 1,
              padding: '8px 0',
              border: 'none',
              background: activeTab === 'available' ? 'var(--phone-card-bg)' : 'none',
              color: activeTab === 'available' ? 'var(--phone-text-title)' : 'var(--phone-text-body)',
              fontWeight: 700,
              fontSize: '12.5px',
              borderRadius: '10px',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s'
            }}
          >
            Available ({currentAvailable.length})
          </button>
          <button
            onClick={() => setActiveTab('expired')}
            className="interactive-element"
            style={{
              flex: 1,
              padding: '8px 0',
              border: 'none',
              background: activeTab === 'expired' ? 'var(--phone-card-bg)' : 'none',
              color: activeTab === 'expired' ? 'var(--phone-text-title)' : 'var(--phone-text-body)',
              fontWeight: 700,
              fontSize: '12.5px',
              borderRadius: '10px',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s'
            }}
          >
            Expired ({currentExpired.length})
          </button>
        </div>

        {/* Coupons List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activeTab === 'available' ? (
            currentAvailable.map(coupon => {
              const isActive = activeCoupon && activeCoupon.code === coupon.code;
              return (
                <div 
                  key={coupon.id}
                  onClick={() => handleApplyCardCoupon(coupon)}
                  style={{
                    background: 'var(--phone-card-bg)',
                    border: isActive ? '2px solid var(--primary-color)' : '1.5px dashed var(--phone-card-border)',
                    borderRadius: '20px',
                    padding: '16px',
                    position: 'relative',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 6px 18px rgba(255,107,53,0.05)' : '0 2px 6px rgba(0,0,0,0.01)',
                    transition: 'all 0.2s'
                  }}
                >
                  {/* Left Ticket cut decoration */}
                  <div style={{ position: 'absolute', top: '50%', left: '-8px', transform: 'translateY(-50%)', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--phone-bg)', borderRight: isActive ? '2px solid var(--primary-color)' : '1px solid var(--phone-card-border)', zIndex: 2 }}></div>
                  {/* Right Ticket cut decoration */}
                  <div style={{ position: 'absolute', top: '50%', right: '-8px', transform: 'translateY(-50%)', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--phone-bg)', borderLeft: isActive ? '2px solid var(--primary-color)' : '1px solid var(--phone-card-border)', zIndex: 2 }}></div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Ticket size={16} style={{ color: isActive ? 'var(--primary-color)' : '#6366f1' }} />
                      <span style={{
                        fontSize: '13px',
                        fontWeight: 900,
                        color: '#6366f1',
                        letterSpacing: '0.5px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid rgba(99, 102, 241, 0.2)'
                      }}>
                        {coupon.code}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={(e) => handleCopyCode(e, coupon.code, coupon.id)}
                        className="interactive-element"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--phone-text-body)',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        {copiedId === coupon.id ? <span style={{ color: 'var(--accent-green)' }}>Copied!</span> : <Copy size={13} />}
                      </button>

                      <button
                        className="interactive-element"
                        style={{
                          background: isActive ? 'var(--primary-color)' : 'none',
                          border: isActive ? 'none' : '1.5px solid var(--primary-color)',
                          color: isActive ? '#ffffff' : 'var(--primary-color)',
                          padding: '3px 12px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        {isActive ? 'Applied' : 'Apply'}
                      </button>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--phone-text-title)', margin: '4px 0 2px' }}>
                    {coupon.title || `${coupon.value}% OFF Offer`}
                  </h4>
                  <p style={{ fontSize: '11.5px', color: 'var(--phone-text-body)', margin: 0, lineHeight: '1.4', fontWeight: 500 }}>
                    {coupon.description || `Save ${coupon.type === 'Percent' ? `${coupon.value}%` : `₹${coupon.value}`} on this checkout coupon.`}
                  </p>

                  {coupon.minOrder > 0 && (
                    <div style={{ fontSize: '10.5px', color: 'var(--primary-color)', fontWeight: 700, marginTop: '8px' }}>
                      Minimum purchase value: ₹{coupon.minOrder.toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            currentExpired.map(coupon => (
              <div 
                key={coupon.id}
                style={{
                  background: 'var(--phone-card-bg)',
                  border: '1.5px dashed var(--phone-card-border)',
                  borderRadius: '20px',
                  padding: '16px',
                  position: 'relative',
                  opacity: 0.6
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: 'var(--phone-text-muted)',
                    letterSpacing: '0.5px',
                    background: 'var(--phone-bg)',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    {coupon.code}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--accent-red)', fontWeight: 800, textTransform: 'uppercase' }}>
                    Expired
                  </span>
                </div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--phone-text-body)', margin: '4px 0 2px' }}>
                  {coupon.title}
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--phone-text-muted)' }}>
                  {coupon.description}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MyCoupons;

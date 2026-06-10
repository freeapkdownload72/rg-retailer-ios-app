import React, { useState } from 'react';
import { ArrowLeft, Share2, Users, Gift, Copy, Check, ShoppingBag, UserPlus } from 'lucide-react';

function ReferEarn({ referralCode = 'RG7425MX', referralsCount = 0, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'RG Retailer - Curated Fashion & Quick Quiz Discount',
        text: `Hey! Shop premium fashion curation at RG Retailer. Sign up using my referral code: ${referralCode} to get ₹100 welcome wallet balance!`,
        url: window.location.href,
      }).catch(err => console.log(err));
    } else {
      handleCopyCode();
      alert("Referral link copied! Send it to your friends to start earning ₹100 reward.");
    }
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
          Refer & Earn
        </h2>
      </div>

      {/* Body container */}
      <div className="carousel-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px', WebkitOverflowScrolling: 'touch' }}>
        
        {/* Timeline Steps Card */}
        <div style={{
          background: 'var(--phone-card-bg)',
          borderRadius: '24px',
          padding: '24px 20px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.01)',
          border: '1.5px solid var(--phone-card-border)',
          marginBottom: '20px'
        }}>
          {/* Vertical Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
            {/* Timeline connector line */}
            <div style={{
              position: 'absolute',
              left: '20px',
              top: '20px',
              bottom: '20px',
              width: '2px',
              background: 'var(--phone-card-border)',
              zIndex: 1
            }}></div>

            {/* Step 1 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', zIndex: 2 }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(249, 115, 22, 0.08)',
                color: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(249,115,22,0.05)'
              }}>
                <Share2 size={18} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '10.5px', color: 'var(--primary-color)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Step 1</span>
                <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--phone-text-title)' }}>Share code</span>
                <span style={{ fontSize: '12px', color: 'var(--phone-text-body)', fontWeight: 500 }}>Share your unique code with friends</span>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', zIndex: 2 }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(249, 115, 22, 0.08)',
                color: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(249,115,22,0.05)'
              }}>
                <UserPlus size={18} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '10.5px', color: 'var(--primary-color)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Step 2</span>
                <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--phone-text-title)' }}>Friend Signs Up</span>
                <span style={{ fontSize: '12px', color: 'var(--phone-text-body)', fontWeight: 500 }}>They sign up using your code</span>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', zIndex: 2 }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(249, 115, 22, 0.08)',
                color: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(249,115,22,0.05)'
              }}>
                <ShoppingBag size={18} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '10.5px', color: 'var(--primary-color)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Step 3</span>
                <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--phone-text-title)' }}>They Shop</span>
                <span style={{ fontSize: '12px', color: 'var(--phone-text-body)', fontWeight: 500 }}>Friend makes their first purchase</span>
              </div>
            </div>

            {/* Step 4 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', zIndex: 2 }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(249, 115, 22, 0.08)',
                color: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(249,115,22,0.05)'
              }}>
                <Gift size={18} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '10.5px', color: 'var(--primary-color)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Step 4</span>
                <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--phone-text-title)' }}>You Earn</span>
                <span style={{ fontSize: '12px', color: 'var(--phone-text-body)', fontWeight: 500 }}>Both get ₹100 welcome reward</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copy Referral Code Card */}
        <div style={{
          background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
          borderRadius: '24px',
          padding: '20px',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(124, 58, 237, 0.2)',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Your Referral Code</span>
            <div style={{ fontSize: '20px', fontWeight: 900, marginTop: '4px', letterSpacing: '1px', fontFamily: "'Outfit', sans-serif" }}>
              {referralCode}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCopyCode}
              className="interactive-element"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
            <button
              onClick={handleShare}
              className="interactive-element"
              style={{
                padding: '0 16px',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                border: 'none',
                color: '#7c3aed',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Share2 size={14} />
              Share
            </button>
          </div>
        </div>

        {/* Your Referrals box */}
        <div style={{
          background: 'var(--phone-card-bg)',
          borderRadius: '24px',
          padding: '20px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.01)',
          border: '1.5px solid var(--phone-card-border)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--phone-text-title)', fontFamily: "'Outfit', sans-serif", margin: 0 }}>
              Your Referrals
            </h3>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--phone-text-body)',
              backgroundColor: 'var(--phone-bg)',
              padding: '3px 10px',
              borderRadius: '20px',
              border: '1px solid var(--phone-card-border)'
            }}>
              {referralsCount} total
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', textAlign: 'center', gap: '10px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', border: '1.5px solid var(--phone-card-border)', color: 'var(--phone-text-muted)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <Users size={24} />
            </div>
            <span style={{ fontSize: '13.5px', color: 'var(--phone-text-title)', fontWeight: 800 }}>No referrals yet</span>
            <p style={{ fontSize: '11.5px', color: 'var(--phone-text-muted)', margin: 0, maxWidth: '200px', lineHeight: '1.4', fontWeight: 500 }}>
              Share your code to start earning rewards! Both you and your friend get ₹100.
            </p>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--phone-text-body)', margin: '0 0 8px' }}>Terms & Conditions</h4>
          <ul style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: 'var(--phone-text-muted)', lineHeight: '1.5', fontWeight: 500 }}>
            <li>Referral rewards are credited after the referred friend's first order is delivered.</li>
            <li>Maximum 50 successful referrals per user.</li>
            <li>Rewards expire in 90 days.</li>
            <li>RG Retailer reserves the right to modify or discontinue the referral program.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ReferEarn;

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Sparkles, Star, Zap, Crown, Award, HelpCircle } from 'lucide-react';


function MembershipPaywall({ activeTier = 'Free', onUpgradeTier, onClose, membershipPlans = [] }) {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'
  const [selectedPlan, setSelectedPlan] = useState('Gold'); // 'Silver', 'Gold', 'Platinum'

  const [plans, setPlans] = useState([
    {
      id: 'silver',
      name: 'Silver',
      icon: <Award size={20} />,
      monthlyPrice: 149,
      yearlyPrice: 1490,
      discount: '10% Member Discount',
      color: '#94a3b8',
      features: [
        '10% OFF all curated apparel',
        'Standard Free shipping on orders over ₹999',
        'Early access to limited curation drops',
        'Bronze tier loyalty status (1.0x points)'
      ]
    },
    {
      id: 'gold',
      name: 'Gold',
      icon: <Crown size={20} />,
      monthlyPrice: 399,
      yearlyPrice: 3990,
      discount: '15% Member Discount',
      color: '#eab308',
      popular: true,
      features: [
        '15% OFF all curated apparel',
        'Priority Free shipping on all orders',
        '24/7 AI Personal Stylist consultations',
        'Silver tier loyalty status (1.2x points)',
        'Exclusive premium member badge'
      ]
    },
    {
      id: 'platinum',
      name: 'Platinum',
      icon: <Crown size={20} />,
      monthlyPrice: 799,
      yearlyPrice: 7990,
      discount: '25% Member Discount',
      color: '#a855f7',
      features: [
        '25% OFF all curated apparel',
        'Ultra VIP Free same-day delivery',
        '24/7 Personal human concierge support',
        'Gold tier loyalty status (1.5x points)',
        'First-look VIP style drops & sizing holds',
        'Free returns & swaps forever'
      ]
    }
  ]);

  useEffect(() => {
    if (membershipPlans && membershipPlans.length > 0) {
      const list = membershipPlans.map(plan => {
        const id = plan.id;
        
        let icon = <Award size={20} />;
        let color = '#94a3b8';
        let popular = false;

        if (id === 'gold' || plan.name === 'Gold') {
          icon = <Crown size={20} />;
          color = '#eab308';
          popular = true;
        } else if (id === 'platinum' || plan.name === 'Platinum') {
          icon = <Crown size={20} />;
          color = '#a855f7';
        }

        return {
          id: id,
          name: plan.name || id,
          icon,
          monthlyPrice: parseFloat(plan.monthlyPrice || 0),
          yearlyPrice: parseFloat(plan.yearlyPrice || 0),
          discount: `${plan.discountPercent || 0}% Member Discount`,
          color,
          popular,
          features: plan.features || []
        };
      });

      const order = { 'silver': 1, 'gold': 2, 'platinum': 3 };
      list.sort((a, b) => (order[a.id] || 99) - (order[b.id] || 99));

      setPlans(list);
    }
  }, [membershipPlans]);

  const handleSubscribe = () => {
    if (activeTier?.toLowerCase() === selectedPlan?.toLowerCase()) {
      return;
    }
    onUpgradeTier(selectedPlan, billingCycle);
  };

  const getPlanPrice = (plan) => {
    return billingCycle === 'monthly' 
      ? `₹${plan.monthlyPrice}/mo` 
      : `₹${Math.round(plan.yearlyPrice / 12)}/mo`;
  };

  const getPlanBilledPrice = (plan) => {
    return billingCycle === 'monthly'
      ? `Billed monthly`
      : `Billed annually (₹${plan.yearlyPrice}/yr)`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0b0f19', color: '#ffffff', animation: 'fadeIn 0.3s ease', position: 'relative' }}>
      
      {/* Header Back Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0f172a' }}>
        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#ffffff', padding: '4px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <ArrowLeft size={22} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.3px', margin: 0 }}>
          RG Premium Membership
        </h2>
      </div>

      {/* Main content scroll block */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 80px' }}>
        
        {/* Header Pitch & Sparkle Badge */}
        <div style={{ textAlign: 'center', marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255, 107, 53, 0.1)', color: '#ff6b35', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} />
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#ffffff', fontFamily: "'Outfit', sans-serif", margin: 0, letterSpacing: '-0.5px' }}>
            Unlock VIP Fashion Privileges
          </h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, maxWidth: '280px', lineHeight: '1.4' }}>
            Elevate your shopping with automatic discount offsets, personal curation styling, and free courier delivery.
          </p>
        </div>

        {/* Monthly / Yearly Billing Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setBillingCycle('monthly')}
              style={{
                padding: '8px 16px',
                borderRadius: '30px',
                border: 'none',
                background: billingCycle === 'monthly' ? '#ff6b35' : 'transparent',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s'
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              style={{
                padding: '8px 16px',
                borderRadius: '30px',
                border: 'none',
                background: billingCycle === 'yearly' ? '#ff6b35' : 'transparent',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Yearly</span>
              <span style={{ fontSize: '9px', fontWeight: 800, backgroundColor: '#22c55e', color: '#ffffff', padding: '2px 6px', borderRadius: '20px', textTransform: 'uppercase' }}>
                SAVE 17%
              </span>
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Plans Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
          {plans.map(plan => {
            const isSelected = selectedPlan === plan.name;
            const isCurrent = activeTier === plan.name;

            const getPlanWeight = (tierName) => {
              const name = tierName?.toLowerCase();
              if (name === 'silver') return 1;
              if (name === 'gold') return 2;
              if (name === 'platinum') return 3;
              return 0; // Free / others
            };

            const isUpgrade = !isCurrent && getPlanWeight(plan.name) > getPlanWeight(activeTier) && activeTier !== 'Free';

            return (
              <div
                key={plan.name}
                onClick={() => setSelectedPlan(plan.name)}
                style={{
                  background: isSelected ? 'rgba(255,255,255,0.03)' : (isCurrent ? 'rgba(34, 197, 94, 0.02)' : 'rgba(255,255,255,0.01)'),
                  borderRadius: '20px',
                  border: isSelected 
                    ? `2.5px solid ${plan.color}` 
                    : (isCurrent 
                        ? `1.5px dashed #22c55e` 
                        : '1.5px solid rgba(255,255,255,0.08)'),
                  boxShadow: isCurrent ? '0 0 14px rgba(34, 197, 94, 0.08)' : 'none',
                  padding: '18px 20px',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                {/* Popular Pill badge */}
                {plan.popular && (
                  <span style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '20px',
                    backgroundColor: '#eab308',
                    color: '#000000',
                    fontSize: '9px',
                    fontWeight: 900,
                    padding: '3px 8px',
                    borderRadius: '20px',
                    letterSpacing: '0.5px'
                  }}>
                    MOST POPULAR
                  </span>
                )}

                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ color: plan.color }}>{plan.icon}</div>
                    <span style={{ fontSize: '16px', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
                      RG {plan.name}
                    </span>
                    {isCurrent && (
                      <span style={{ 
                        fontSize: '9.5px', 
                        fontWeight: 900, 
                        backgroundColor: '#22c55e', 
                        color: '#ffffff', 
                        padding: '3px 8px', 
                        borderRadius: '20px',
                        letterSpacing: '0.2px',
                        textTransform: 'uppercase',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <Check size={9} strokeWidth={3} />
                        Active Plan
                      </span>
                    )}
                    {isUpgrade && (
                      <span style={{ 
                        fontSize: '9.5px', 
                        fontWeight: 900, 
                        backgroundColor: 'rgba(251, 191, 36, 0.1)', 
                        color: '#fbbf24', 
                        border: '1px solid rgba(251, 191, 36, 0.2)',
                        padding: '3px 8px', 
                        borderRadius: '20px',
                        letterSpacing: '0.2px',
                        textTransform: 'uppercase'
                      }}>
                        Upgrade Option
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: plan.color, fontFamily: "'Outfit', sans-serif" }}>
                      {getPlanPrice(plan)}
                    </span>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>
                      {getPlanBilledPrice(plan)}
                    </span>
                  </div>
                </div>

                {isCurrent && (
                  <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 600, display: 'block', marginTop: '-2px' }}>
                    You are currently subscribed to this membership.
                  </span>
                )}

                <div style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={12} fill="#22c55e" />
                  {plan.discount}
                </div>

                {/* Features dropdown checklist when selected */}
                {isSelected && (
                  <div style={{
                    marginTop: '10px',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    paddingTop: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    animation: 'fadeIn 0.2s ease'
                  }}>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <Check size={14} style={{ color: plan.color, marginTop: '2px' }} />
                        <span style={{ fontSize: '11.5px', color: '#cbd5e1', lineHeight: '1.4' }}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Benefits Matrix Grid */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '20px 16px'
        }}>
          <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: '#ffffff', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Star size={16} fill="#fbbf24" strokeWidth={0} />
            Premium Benefits Overview
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Check size={14} style={{ color: '#22c55e', marginTop: '2px' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#ffffff' }}>Up to 25% OFF</span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>Every product, no limit</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Check size={14} style={{ color: '#22c55e', marginTop: '2px' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#ffffff' }}>Free Delivery</span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>Same day priority option</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Check size={14} style={{ color: '#22c55e', marginTop: '2px' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#ffffff' }}>AI Stylist Chat</span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>24/7 personal curated fits</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Check size={14} style={{ color: '#22c55e', marginTop: '2px' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#ffffff' }}>VIP Style Drops</span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>Reserve sizes before release</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Sticky Bottom Subscribe Footer */}
      {(() => {
        const getPlanWeight = (tierName) => {
          const name = tierName?.toLowerCase();
          if (name === 'silver') return 1;
          if (name === 'gold') return 2;
          if (name === 'platinum') return 3;
          return 0; // Free / others
        };

        const activeWeight = getPlanWeight(activeTier);
        const selectedWeight = getPlanWeight(selectedPlan);

        let btnText = 'Subscribe Now';
        let btnDisabled = false;
        let btnBg = '#ff6b35';
        let btnColor = '#ffffff';
        let btnCursor = 'pointer';
        let btnShadow = '0 4px 14px rgba(255,107,53,0.3)';

        if (activeTier.toLowerCase() === selectedPlan.toLowerCase()) {
          btnText = 'Current Plan';
          btnDisabled = true;
          btnBg = '#1e293b'; // slate-800
          btnColor = '#64748b';
          btnCursor = 'not-allowed';
          btnShadow = 'none';
        } else if (selectedWeight > activeWeight && activeTier !== 'Free') {
          btnText = 'Upgrade Now';
          btnBg = '#ff6b35';
          btnShadow = '0 4px 14px rgba(255,107,53,0.3)';
        } else if (selectedWeight < activeWeight && activeTier !== 'Free') {
          btnText = 'Switch Plan';
          btnBg = '#475569'; // slate-600
          btnShadow = '0 4px 10px rgba(71,85,105,0.2)';
        }

        return (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#0f172a',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 50
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>Selected Plan</span>
              <span style={{ fontSize: '14.5px', fontWeight: 900, color: '#ffffff' }}>
                RG {selectedPlan} {billingCycle === 'yearly' && '(Yearly)'}
              </span>
              {selectedWeight > activeWeight && activeTier !== 'Free' && (
                <span style={{ fontSize: '10.5px', color: '#fbbf24', fontWeight: 700, marginTop: '2.5px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  ✨ You can upgrade anytime!
                </span>
              )}
            </div>

            <button
              onClick={handleSubscribe}
              disabled={btnDisabled}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                backgroundColor: btnBg,
                color: btnColor,
                border: 'none',
                fontSize: '13px',
                fontWeight: 800,
                cursor: btnCursor,
                boxShadow: btnShadow,
                outline: 'none',
                transition: 'all 0.2s'
              }}
            >
              {btnText}
            </button>
          </div>
        );
      })()}

    </div>
  );
}

export default MembershipPaywall;

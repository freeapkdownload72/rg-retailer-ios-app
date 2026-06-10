import React, { useState } from 'react';
import { ArrowLeft, Award, Star, History, Gift, Check, Info } from 'lucide-react';

function LoyaltyPoints({ points = 0, history = [], onRedeemReward, onClose }) {
  const [activeTab, setActiveTab] = useState('shop'); // 'shop', 'history', 'tiers'

  const tierLimits = {
    Bronze: { min: 0, max: 200, multiplier: '1.0x' },
    Silver: { min: 200, max: 500, multiplier: '1.2x' },
    Gold: { min: 500, max: 1000, multiplier: '1.5x' },
    Platinum: { min: 1000, max: 99999, multiplier: '2.0x' }
  };

  // Determine current tier
  let currentTier = 'Bronze';
  if (points >= 1000) currentTier = 'Platinum';
  else if (points >= 500) currentTier = 'Gold';
  else if (points >= 200) currentTier = 'Silver';

  const nextTierInfo = {
    Bronze: { name: 'Silver', required: 200 },
    Silver: { name: 'Gold', required: 500 },
    Gold: { name: 'Platinum', required: 1000 },
    Platinum: { name: '', required: 0 }
  };

  const nextTier = nextTierInfo[currentTier];
  const progressPercent = nextTier.required > 0 
    ? Math.min((points / nextTier.required) * 100, 100) 
    : 100;

  const rewardItems = [
    { id: 'reward_50', cost: 100, rewardValue: 50, title: '₹50 Off Wallet Coupon', description: 'Redeem 100 points for a ₹50 wallet balance topup.' },
    { id: 'reward_100', cost: 200, rewardValue: 100, title: '₹100 Off Wallet Coupon', description: 'Redeem 200 points for a ₹100 wallet balance topup.' },
    { id: 'reward_250', cost: 500, rewardValue: 250, title: '₹250 Off Wallet Coupon', description: 'Redeem 500 points for a ₹250 wallet balance topup.' },
    { id: 'reward_500', cost: 900, rewardValue: 500, title: '₹500 Off Wallet Coupon', description: 'Super Saver! Redeem 900 points for a ₹500 wallet balance topup.' }
  ];

  const defaultHistory = [
    { id: 'tx_1', description: 'Points earned from ORD-ON-9831', points: 45, date: '2026-05-30', type: 'Earned' },
    { id: 'tx_2', description: 'Points earned from ORD-ON-9428', points: 30, date: '2026-05-28', type: 'Earned' },
    { id: 'tx_3', description: 'Welcome points reward', points: 25, date: '2026-05-25', type: 'Earned' }
  ];

  const currentHistory = history.length > 0 ? history : defaultHistory;

  const handleRedeem = (item) => {
    if (points < item.cost) {
      alert("Insufficient points! Keep shopping to earn more points.");
      return;
    }
    onRedeemReward(item.cost, item.rewardValue);
    alert(`Successfully redeemed ${item.cost} points for a ₹${item.rewardValue} wallet topup!`);
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
          Loyalty Rewards
        </h2>
      </div>

      {/* Body container */}
      <div className="carousel-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px', WebkitOverflowScrolling: 'touch' }}>
        
        {/* Dark Blue Overview Dashboard Card */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '24px',
          padding: '24px',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          marginBottom: '20px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: '4px 10px', borderRadius: '20px', width: 'fit-content' }}>
                <Award size={14} style={{ color: '#fbbf24' }} />
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {currentTier} Tier ({tierLimits[currentTier].multiplier} Multiplier)
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '12px', fontWeight: 600 }}>Available Points Balance</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                <Star size={22} fill="#fbbf24" strokeWidth={0} style={{ transform: 'translateY(-2px)' }} />
                <span style={{ fontSize: '32px', fontWeight: 900, fontFamily: "'Outfit', sans-serif", color: '#fbbf24' }}>
                  {points.toLocaleString()}
                </span>
                <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600 }}>pts</span>
              </div>
            </div>

            <Award size={48} style={{ color: '#fbbf24', opacity: 0.15, position: 'absolute', right: '20px', top: '24px' }} />
          </div>

          {/* Progress Bar to next tier */}
          {nextTier.name && (
            <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#cbd5e1', marginBottom: '6px', fontWeight: 700 }}>
                <span>Progress to {nextTier.name} Tier</span>
                <span>{points} / {nextTier.required} pts</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: '#fbbf24', borderRadius: '3px', transition: 'width 0.5s ease-out' }}></div>
              </div>
              <p style={{ fontSize: '10.5px', color: '#e2e8f0', margin: '8px 0 0', fontStyle: 'italic', fontWeight: 500 }}>
                Earn {nextTier.required - points} more points to unlock a {tierLimits[nextTier.name].multiplier} point earning multiplier!
              </p>
            </div>
          )}
        </div>

        {/* Tab Selection Row */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--phone-card-border)', padding: '3px', borderRadius: '12px', marginBottom: '16px' }}>
          {['shop', 'history', 'tiers'].map(tabName => {
            const isActive = activeTab === tabName;
            return (
              <button
                key={tabName}
                onClick={() => setActiveTab(tabName)}
                className="interactive-element"
                style={{
                  flex: 1,
                  padding: '8px 0',
                  border: 'none',
                  background: isActive ? 'var(--phone-card-bg)' : 'none',
                  color: isActive ? 'var(--phone-text-title)' : 'var(--phone-text-body)',
                  fontWeight: 800,
                  fontSize: '12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  outline: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                {tabName === 'shop' && <Gift size={12} />}
                {tabName === 'history' && <History size={12} />}
                {tabName === 'tiers' && <Info size={12} />}
                <span style={{ textTransform: 'capitalize' }}>
                  {tabName === 'shop' ? 'Shop' : (tabName === 'history' ? 'History' : 'Tiers')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        {activeTab === 'shop' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rewardItems.map(item => {
              const canAfford = points >= item.cost;
              return (
                <div 
                  key={item.id}
                  style={{
                    background: 'var(--phone-card-bg)',
                    border: '1.5px solid var(--phone-card-border)',
                    borderRadius: '20px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.01)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, marginRight: '16px' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--phone-text-title)' }}>{item.title}</span>
                    <p style={{ fontSize: '11px', color: 'var(--phone-text-body)', margin: 0, lineHeight: '1.4', fontWeight: 500 }}>
                      {item.description}
                    </p>
                    <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800, marginTop: '2px' }}>
                      Cost: {item.cost} points
                    </span>
                  </div>

                  <button
                    onClick={() => handleRedeem(item)}
                    disabled={!canAfford}
                    className="interactive-element"
                    style={{
                      background: canAfford ? 'var(--primary-color)' : 'var(--phone-card-border)',
                      border: 'none',
                      color: canAfford ? '#ffffff' : 'var(--phone-text-muted)',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      cursor: canAfford ? 'pointer' : 'default',
                      whiteSpace: 'nowrap',
                      boxShadow: canAfford ? '0 4px 10px rgba(255,107,53,0.15)' : 'none'
                    }}
                  >
                    Redeem
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {currentHistory.map((tx, idx) => {
              const isEarn = tx.type === 'Earned' || tx.points > 0;
              return (
                <div 
                  key={tx.id || idx}
                  style={{
                    background: 'var(--phone-card-bg)',
                    border: '1.5px solid var(--phone-card-border)',
                    borderRadius: '16px',
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.01)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--phone-text-title)' }}>{tx.description}</span>
                    <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)', fontWeight: 600 }}>{tx.date}</span>
                  </div>
                  <span style={{
                    fontSize: '13.5px',
                    fontWeight: 900,
                    color: isEarn ? '#10b981' : '#ef4444',
                    fontFamily: "'Outfit', sans-serif"
                  }}>
                    {isEarn ? '+' : '-'}{Math.abs(tx.points)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'tiers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--phone-card-bg)', borderRadius: '20px', padding: '16px', border: '1.5px solid var(--phone-card-border)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--phone-text-title)', margin: '0 0 10px' }}>Loyalty Multiplier Program</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.keys(tierLimits).map(tierName => {
                const limit = tierLimits[tierName];
                const isActive = currentTier === tierName;

                return (
                  <div 
                    key={tierName}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                      border: isActive ? '1px solid #10b981' : '1px solid var(--phone-card-border)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: isActive ? '#10b981' : 'var(--phone-text-title)' }}>
                          {tierName} Tier
                        </span>
                        {isActive && (
                          <span style={{ fontSize: '9px', fontWeight: 800, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                            Current
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)', fontWeight: 600 }}>
                        {tierName === 'Platinum' ? `${limit.min}+ points` : `${limit.min} - ${limit.max} points`}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: isActive ? '#10b981' : '#6366f1' }}>
                        {limit.multiplier} Earnings
                      </span>
                      <p style={{ fontSize: '10px', color: 'var(--phone-text-muted)', margin: '2px 0 0', fontWeight: 500 }}>point multiplier</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default LoyaltyPoints;

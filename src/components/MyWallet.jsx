import React, { useState } from 'react';
import { ArrowLeft, Wallet, Plus, CreditCard, RefreshCw, AlertCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

function MyWallet({ balance, transactions = [], onAddMoney, onClose }) {
  const [addAmount, setAddAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const quickAmounts = [100, 200, 500, 1000, 2000];

  const handleQuickSelect = (amt) => {
    setAddAmount(amt.toString());
    setError('');
  };

  const handleAddMoneySubmit = async (e) => {
    e.preventDefault();
    const parsed = parseFloat(addAmount);
    if (isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onAddMoney(parsed);
      setAddAmount('');
      alert(`₹${parsed.toLocaleString()} successfully added to your wallet!`);
    } catch (err) {
      setError('Failed to add money. Please try again.');
    } finally {
      setLoading(false);
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
          My Wallet
        </h2>
      </div>

      {/* Body content */}
      <div className="carousel-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px', WebkitOverflowScrolling: 'touch' }}>
        {/* Gradient Wallet Balance Card */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          borderRadius: '24px',
          padding: '24px',
          color: '#ffffff',
          boxShadow: '0 12px 30px rgba(79, 70, 229, 0.25)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '24px'
        }}>
          {/* Decorative background glow */}
          <div style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.15)',
            filter: 'blur(20px)'
          }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.85)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              Available Balance
            </span>
            <Wallet size={20} style={{ color: 'rgba(255, 255, 255, 0.85)' }} />
          </div>

          <div style={{ fontSize: '34px', fontWeight: 900, fontFamily: "'Outfit', sans-serif", marginBottom: '8px' }}>
            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 500 }}>
            Use this balance for instant one-click checkouts!
          </div>
        </div>

        {/* Add Money Form */}
        <div style={{
          background: 'var(--phone-card-bg)',
          borderRadius: '24px',
          padding: '20px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.01)',
          border: '1.5px solid var(--phone-card-border)',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--phone-text-title)', fontFamily: "'Outfit', sans-serif", margin: '0 0 12px' }}>
            Add Money to Wallet
          </h3>

          <form onSubmit={handleAddMoneySubmit}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '16px', fontSize: '18px', fontWeight: 700, color: 'var(--phone-text-body)' }}>₹</span>
                <input 
                  type="number"
                  placeholder="Enter amount"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 34px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--phone-card-border)',
                    background: 'var(--phone-bg)',
                    color: 'var(--phone-text-title)',
                    fontSize: '16px',
                    fontWeight: 700,
                    outline: 'none',
                    fontFamily: "'Outfit', sans-serif"
                  }}
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="interactive-element"
                style={{
                  padding: '0 20px',
                  borderRadius: '12px',
                  background: 'var(--primary-color)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(255,107,53,0.15)',
                  transition: 'opacity 0.2s'
                }}
              >
                {loading ? <RefreshCw size={16} className="spin" /> : <Plus size={16} />}
                Add
              </button>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-red)', fontSize: '12px', marginBottom: '12px' }}>
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            {/* Quick selectors */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {quickAmounts.map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickSelect(amt)}
                  className="interactive-element"
                  style={{
                    padding: '8px 14px',
                    borderRadius: '20px',
                    border: '1.2px solid var(--phone-card-border)',
                    background: addAmount === amt.toString() ? '#6366f1' : 'var(--phone-bg)',
                    color: addAmount === amt.toString() ? '#ffffff' : 'var(--phone-text-body)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  +₹{amt}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Transaction History Section */}
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--phone-text-title)', fontFamily: "'Outfit', sans-serif", margin: '0 0 12px' }}>
            Transaction History
          </h3>

          {transactions.length === 0 ? (
            <div style={{
              background: 'var(--phone-card-bg)',
              borderRadius: '24px',
              padding: '30px 20px',
              textAlign: 'center',
              border: '1.5px solid var(--phone-card-border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.01)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: 'var(--phone-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={22} />
              </div>
              <span style={{ fontSize: '13.5px', color: 'var(--phone-text-body)', fontWeight: 700 }}>No transactions yet</span>
              <p style={{ fontSize: '12px', color: 'var(--phone-text-muted)', margin: 0, lineHeight: '1.4' }}>
                When you add funds or make orders using your wallet, the history will show up here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {transactions.map((tx, idx) => {
                const isDeposit = tx.type === 'Deposit' || tx.type === 'deposit' || tx.amount > 0;
                const formattedDate = tx.date || new Date().toISOString().split('T')[0];

                return (
                  <div 
                    key={tx.id || idx}
                    style={{
                      background: 'var(--phone-card-bg)',
                      borderRadius: '16px',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1.5px solid var(--phone-card-border)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: isDeposit ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: isDeposit ? '#10b981' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {isDeposit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--phone-text-title)' }}>
                          {tx.description || (isDeposit ? 'Money Added' : 'Paid for Order')}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)', fontWeight: 600 }}>
                          {formattedDate}
                        </span>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: isDeposit ? '#10b981' : '#ef4444',
                      fontFamily: "'Outfit', sans-serif"
                    }}>
                      {isDeposit ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyWallet;

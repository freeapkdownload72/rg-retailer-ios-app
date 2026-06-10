import React from 'react';
import { ArrowLeft, Box, ChevronRight, Download, Share2 } from 'lucide-react';

function MyOrders({ placedOrders = [], products = [], onClose, onDownloadInvoice, onShareInvoice }) {
  // Helper to find product image from main catalog
  const getProductImage = (itemId) => {
    const matched = products.find(p => p.id === itemId);
    return matched ? (matched.imageURL || matched.image) : 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400';
  };

  const getStatusStyles = (status = 'Pending') => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'placed':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }; // Orange
      case 'confirmed':
      case 'accepted':
        return { bg: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }; // Blue
      case 'processing':
      case 'packaging':
        return { bg: 'rgba(147, 51, 234, 0.1)', color: '#9333ea' }; // Purple
      case 'shipped':
        return { bg: 'rgba(6, 182, 212, 0.1)', color: '#0891b2' }; // Teal/Cyan
      case 'out for delivery':
        return { bg: 'rgba(236, 72, 153, 0.1)', color: '#db2777' }; // Pink
      case 'delivered':
      case 'completed':
        return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }; // Green
      case 'cancelled':
      case 'returned':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }; // Red
      default:
        return { bg: 'rgba(100, 116, 139, 0.1)', color: '#475569' }; // Slate
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
          My Orders
        </h2>
      </div>

      {/* Orders Scroll Container */}
      <div className="carousel-scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px', WebkitOverflowScrolling: 'touch' }}>
        {placedOrders.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%', gap: '14px', padding: '0 24px', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--phone-card-bg)', border: '1.5px solid var(--phone-card-border)', color: 'var(--phone-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box size={36} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--phone-text-title)', fontFamily: "'Outfit', sans-serif", margin: 0 }}>No Placed Orders Yet</h3>
            <p style={{ fontSize: '12.5px', color: 'var(--phone-text-body)', lineHeight: '1.5', margin: 0, fontWeight: 500 }}>
              You haven't made any purchases yet. Your synced offline invoices and mobile orders will automatically compile here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {placedOrders.map(order => {
              const itemsCount = order.items ? order.items.reduce((sum, i) => sum + i.qty, 0) : 0;
              const formattedDate = order.date ? new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '6 Apr 2026';
              const cleanTotal = typeof order.totalAmount === 'number' ? order.totalAmount : parseInt(String(order.price || '0').replace(/[^\d]/g, ''), 10);
              const statusStyles = getStatusStyles(order.status || 'Placed');

              return (
                <div 
                  key={order.id}
                  style={{
                    backgroundColor: 'var(--phone-card-bg)',
                    borderRadius: '20px',
                    border: '1.5px solid var(--phone-card-border)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Order header row */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--phone-card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--phone-text-title)', fontFamily: "'Outfit', sans-serif" }}>
                        Order #{order.orderId || order.id.slice(-8).toUpperCase()}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)', fontWeight: 600 }}>
                        Placed on {formattedDate === 'Invalid Date' ? '6 Apr 2026' : formattedDate}
                      </span>
                    </div>
                    
                    {/* Status badge in green or blue pill */}
                    <div style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      backgroundColor: statusStyles.bg, 
                      color: statusStyles.color, 
                      fontSize: '10px', 
                      fontWeight: 800,
                      fontFamily: "'Outfit', sans-serif",
                      letterSpacing: '0.3px',
                      textTransform: 'uppercase'
                    }}>
                      {order.status || 'Placed'}
                    </div>
                  </div>

                  {/* Items Listing */}
                  <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {order.items && order.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', background: 'var(--phone-bg)', border: '1px solid var(--phone-card-border)', flexShrink: 0 }}>
                          <img 
                            src={item.imageURL || getProductImage(item.id)} 
                            alt={item.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--phone-text-title)' }}>
                            {item.name}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)', fontWeight: 600 }}>
                            Size: {item.size || 'L'} | Color: {item.color || 'Default'}
                          </span>
                          <span style={{ fontSize: '11.5px', color: 'var(--phone-text-body)', fontWeight: 600 }}>
                            Qty: {item.qty} | Price: ₹{item.sellingPrice ? item.sellingPrice.toLocaleString() : '0'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order footer summaries card */}
                  <div style={{ 
                    padding: '12px 16px', 
                    background: 'var(--phone-bg)', 
                    borderTop: '1px solid var(--phone-card-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--phone-text-body)' }}>
                        Total Paid: 
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--primary-color)', fontFamily: "'Outfit', sans-serif" }}>
                        ₹{cleanTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions to Download / Share Invoice */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    padding: '10px 16px 14px',
                    borderTop: '1px solid var(--phone-card-border)',
                    background: 'var(--phone-card-bg)'
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDownloadInvoice) onDownloadInvoice(order);
                      }}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid var(--phone-card-border)',
                        background: 'var(--phone-bg)',
                        color: 'var(--phone-text-title)',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <Download size={13} /> Download
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onShareInvoice) onShareInvoice(order);
                      }}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #ff6b35 0%, #ea580c 100%)',
                        color: '#ffffff',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <Share2 size={13} /> Share
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;

import React from 'react';
import { Heart, Eye, ArrowLeft, ShoppingBag } from 'lucide-react';

function MyWishlist({ products = [], wishlist = [], onToggleWishlist, onAddToCart, onSelectProduct, onClose }) {
  // Filter products that are in the wishlist
  const wishlistedItems = products.filter(p => wishlist.includes(p.id));

  // Load try-on mockups mapping
  const savedTryOnImages = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('rg_wishlist_tryon_images') || '{}');
    } catch (e) {
      return {};
    }
  }, [wishlist]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--phone-bg)', color: 'var(--phone-text-title)', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--phone-card-border)', background: 'var(--phone-header-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--phone-text-title)', padding: '4px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <ArrowLeft size={22} />
          </button>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--phone-text-title)', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.3px', margin: 0 }}>
            Wishlist
          </h2>
        </div>
        <span style={{ fontSize: '13px', color: 'var(--phone-text-muted)', fontWeight: 600 }}>
          {wishlistedItems.length} {wishlistedItems.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Body content */}
      <div className="carousel-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px', WebkitOverflowScrolling: 'touch' }}>
        {wishlistedItems.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%', gap: '16px', padding: '0 24px', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ff6b35', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={36} fill="#ff6b35" strokeWidth={0} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--phone-text-title)', fontFamily: "'Outfit', sans-serif", margin: 0 }}>Your Wishlist is Empty</h3>
            <p style={{ fontSize: '12.5px', color: 'var(--phone-text-body)', lineHeight: '1.5', margin: 0, fontWeight: 500 }}>
              Tap the heart icon on any product while browsing our curated boutique to save them here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {wishlistedItems.map(product => {
              const originalPrice = parseFloat(product.mrp || product.sellingPrice * 2);
              const discountPercent = Math.round(((originalPrice - parseFloat(product.sellingPrice)) / originalPrice) * 100);

              return (
                <div 
                  key={product.id}
                  style={{
                    backgroundColor: 'var(--phone-card-bg)',
                    borderRadius: '20px',
                    border: '1.5px solid var(--phone-card-border)',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
                    transition: 'transform 0.2s ease'
                  }}
                  onClick={() => onSelectProduct(product)}
                >
                  {/* Badges & Image */}
                  <div style={{ position: 'relative', height: '170px', width: '100%', overflow: 'hidden', background: savedTryOnImages[product.id] ? '#111827' : 'var(--phone-bg)' }}>
                    <img 
                      src={savedTryOnImages[product.id] || product.imageURL || product.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'} 
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: savedTryOnImages[product.id] ? 'contain' : 'cover' }}
                    />
                    
                    {/* VTO Preview indicator tag */}
                    {savedTryOnImages[product.id] && (
                      <span style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: '#8b5cf6', color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        ✨ TRY-ON
                      </span>
                    )}
                    
                    {/* NEW tag if applicable */}
                    {discountPercent > 50 && (
                      <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#3b82f6', color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        NEW
                      </span>
                    )}

                    {/* Discount tag */}
                    {discountPercent > 0 && (
                      <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#ef4444', color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.5px' }}>
                        {discountPercent}% OFF
                      </span>
                    )}

                    {/* Floating Overlay Icons */}
                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(product.id);
                        }}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: '#ff6b35',
                          border: 'none',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(255,107,53,0.3)',
                          outline: 'none'
                        }}
                      >
                        <Heart size={14} fill="#ffffff" strokeWidth={0} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(product);
                        }}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: '#0f172a',
                          border: 'none',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                          outline: 'none'
                        }}
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Info details */}
                  <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--phone-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {product.brand || 'RG Casuals'}
                      </span>
                      <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--phone-text-title)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.name}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary-color)' }}>
                          ₹{parseInt(product.sellingPrice).toLocaleString()}
                        </span>
                        {discountPercent > 0 && (
                          <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)', textDecoration: 'line-through' }}>
                            ₹{parseInt(originalPrice).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Quick Add Bag CTA */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(product);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px'
                        }}
                        title="Add to Bag"
                      >
                        <ShoppingBag size={16} />
                      </button>
                    </div>
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

export default MyWishlist;

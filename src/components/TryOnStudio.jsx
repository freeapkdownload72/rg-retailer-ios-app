import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Eye, 
  ArrowLeft, 
  ShoppingBag, 
  Sparkles, 
  X, 
  Check, 
  Camera, 
  User, 
  Search 
} from 'lucide-react';
import { runVitonTryOn } from '../utils/vitonApi';

function TryOnStudio({ 
  products = [], 
  wishlist = [], 
  onToggleWishlist, 
  onAddToCart, 
  onSelectProduct, 
  onClose 
}) {
  const activeEngine = localStorage.getItem('rg_tryon_engine') || 'vertex';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Try-On Engine States
  const [tryOnProduct, setTryOnProduct] = useState(null);
  const [tryOnStepState, setTryOnStepState] = useState('upload'); // upload, analyzing, result
  const [tryOnMode, setTryOnMode] = useState('generative'); // generative, canvas
  const [customerPhoto, setCustomerPhoto] = useState(null);
  const [tryOnResult, setTryOnResult] = useState(null); 
  const [tryOnError, setTryOnError] = useState(null); 
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [tryOnSize, setTryOnSize] = useState('M');
  const [tryOnColor, setTryOnColor] = useState('#ff6b35');
  const canvasRef = useRef(null);

  // Extract categories dynamically
  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  // Filter products based on category pill and search query
  const getFilteredProducts = () => {
    let result = [...products];

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    return result;
  };

  // Virtual Try-on progress bar & API coordinator
  useEffect(() => {
    let interval;
    let finished = false;
    let apiErrorMsg = null;
    
    if (tryOnStepState === 'analyzing') {
      setAnalyzeProgress(0);
      setTryOnResult(null); 
      setTryOnError(null);  

      if (tryOnMode === 'generative') {
        runVitonTryOn({
          humanImg: customerPhoto,
          garmImg: tryOnProduct?.imageURL || tryOnProduct?.image,
          category: tryOnProduct?.category || "overall",
          description: tryOnProduct?.description || tryOnProduct?.name || "Garment"
        })
        .then(resultUrl => {
          console.log("Successfully fetched Vertex AI virtual try-on result:", resultUrl);
          setTryOnResult(resultUrl);
          finished = true;
        })
        .catch(err => {
          console.error("Vertex AI try-on generation failed:", err);
          const errorStr = err?.message || String(err);
          apiErrorMsg = errorStr;
          setTryOnError(errorStr);
          finished = true;
        });
      } else {
        finished = true;
      }

      interval = setInterval(() => {
        setAnalyzeProgress(prev => {
          if (finished) {
            if (apiErrorMsg) {
              clearInterval(interval);
              return prev;
            }
            if (prev >= 100) {
              clearInterval(interval);
              setTryOnStepState('result');
              return 100;
            }
            return Math.min(100, prev + 15);
          } else {
            if (prev >= 90) {
              return 90; 
            }
            return prev + 5; 
          }
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [tryOnStepState, customerPhoto, tryOnProduct, tryOnMode]);

  // Dynamic Try-on canvas drawing logic
  useEffect(() => {
    if (tryOnStepState === 'result' && canvasRef.current && tryOnProduct) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const userImg = new Image();
      userImg.crossOrigin = "anonymous";
      
      if (tryOnMode === 'generative' && tryOnResult) {
        userImg.src = tryOnResult;
        userImg.onload = () => {
          const hRatio = canvas.width / userImg.width;
          const vRatio = canvas.height / userImg.height;
          const ratio = Math.min(hRatio, vRatio);
          const centerShift_x = (canvas.width - userImg.width * ratio) / 2;
          const centerShift_y = (canvas.height - userImg.height * ratio) / 2;
          ctx.drawImage(userImg, 0, 0, userImg.width, userImg.height, 
                                 centerShift_x, centerShift_y, userImg.width * ratio, userImg.height * ratio);
        };
      } else {
        userImg.src = customerPhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400";
        userImg.onload = () => {
          const hRatio = canvas.width / userImg.width;
          const vRatio = canvas.height / userImg.height;
          const ratio = Math.min(hRatio, vRatio);
          const centerShift_x = (canvas.width - userImg.width * ratio) / 2;
          const centerShift_y = (canvas.height - userImg.height * ratio) / 2;
          ctx.drawImage(userImg, 0, 0, userImg.width, userImg.height, 
                                 centerShift_x, centerShift_y, userImg.width * ratio, userImg.height * ratio);
          
          const productImg = new Image();
          productImg.crossOrigin = "anonymous";
          productImg.src = tryOnProduct?.imageURL || tryOnProduct?.image || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400";
          
          productImg.onload = () => {
            let targetW = canvas.width * 0.55;
            let targetH = (productImg.height / productImg.width) * targetW;
            let drawX = (canvas.width - targetW) / 2;
            let drawY = canvas.height * 0.32;
            
            if (tryOnMode === 'generative') {
              ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
              ctx.shadowBlur = 14;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 6;
              ctx.drawImage(productImg, drawX, drawY, targetW, targetH);
              ctx.shadowBlur = 0;
              
              ctx.fillStyle = "rgba(255, 107, 53, 0.03)";
              ctx.fillRect(drawX, drawY, targetW, targetH);
            } else {
              ctx.drawImage(productImg, drawX, drawY, targetW, targetH);
            }
          };
        };
      }
    }
  }, [tryOnStepState, customerPhoto, tryOnProduct, tryOnMode, tryOnResult]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomerPhoto(reader.result);
        setTryOnStepState('analyzing');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveToWishlistWithTryOn = () => {
    if (!tryOnProduct) return;
    const isSaved = wishlist?.includes(tryOnProduct.id);
    if (!isSaved) {
      onToggleWishlist && onToggleWishlist(tryOnProduct.id);
    }
    if (tryOnResult) {
      try {
        const tryOnImages = JSON.parse(localStorage.getItem('rg_wishlist_tryon_images') || '{}');
        tryOnImages[tryOnProduct.id] = tryOnResult;
        localStorage.setItem('rg_wishlist_tryon_images', JSON.stringify(tryOnImages));
        alert("Product saved to Wishlist with Try-On mockup! ❤️");
      } catch (e) {
        console.error(e);
      }
    }
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--phone-bg)', color: 'var(--phone-text-title)', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', borderBottom: '1px solid var(--phone-card-border)', background: 'var(--phone-header-bg)' }}>
        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--phone-text-title)', padding: '4px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <ArrowLeft size={22} />
        </button>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--phone-text-title)', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.3px', margin: 0 }}>
            AI Try-On Studio
          </h2>
          <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)', fontWeight: 600 }}>
            Select any item to start virtual fitting
          </span>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--phone-header-bg)', borderBottom: '1.5px solid var(--phone-card-border)' }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--phone-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search products, brands, or categories..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              borderRadius: '12px',
              border: '1.5px solid var(--phone-card-border)',
              background: 'var(--phone-bg)',
              color: 'var(--phone-text-title)',
              fontSize: '13px',
              fontWeight: 600,
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          />
          {searchQuery && (
            <X 
              size={16} 
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '12px', color: 'var(--phone-text-muted)', cursor: 'pointer' }} 
            />
          )}
        </div>

        {/* Categories Pills */}
        <div className="momentum-scroll-x" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px', WebkitOverflowScrolling: 'touch' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                background: selectedCategory === cat ? '#ff6b35' : 'var(--phone-card-bg)',
                color: selectedCategory === cat ? '#ffffff' : 'var(--phone-text-title)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                boxShadow: selectedCategory === cat ? '0 3px 8px rgba(255, 107, 53, 0.25)' : 'none'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', WebkitOverflowScrolling: 'touch' }}>
        {filteredProducts.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: '10px', padding: '0 24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--phone-text-title)', fontFamily: "'Outfit', sans-serif", margin: 0 }}>No Products Found</h3>
            <p style={{ fontSize: '12px', color: 'var(--phone-text-body)', lineHeight: '1.5', margin: 0, fontWeight: 500 }}>
              Try adjusting your filters or search keywords to find products.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {filteredProducts.map(product => {
              const isLiked = wishlist.includes(product.id);
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
                  onClick={() => onSelectProduct && onSelectProduct(product)}
                >
                  {/* Badges & Image wrapper */}
                  <div style={{ position: 'relative', height: '170px', width: '100%', overflow: 'hidden', background: 'var(--phone-bg)' }}>
                    <img 
                      src={product.imageURL || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'} 
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    
                    {/* Discount Tag */}
                    {discountPercent > 0 && (
                      <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#ef4444', color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.5px' }}>
                        {discountPercent}% OFF
                      </span>
                    )}

                    {/* Adjacent Floating Overlay Icons */}
                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', gap: '6px', zIndex: 3 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(product.id);
                        }}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: isLiked ? '#ef4444' : 'var(--phone-card-bg)',
                          border: '1px solid var(--phone-card-border)',
                          color: isLiked ? '#ffffff' : 'var(--phone-text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                          outline: 'none'
                        }}
                      >
                        <Heart size={14} fill={isLiked ? '#ffffff' : 'none'} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTryOnProduct(product);
                          setTryOnStepState('upload');
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
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Info details */}
                  <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--phone-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {product.brand || 'RG BRAND'}
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

                      {/* Add Bag CTA */}
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

      {/* AI try-on drawer inside TryOnStudio */}
      {tryOnProduct && (
        <div className="ai-tryon-overlay" onClick={() => {
          setTryOnProduct(null);
          setTryOnStepState('upload');
        }}>
          <div className="ai-tryon-drawer" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} style={{ color: '#8b5cf6' }} /> AI Virtual Try-On Studio
              </span>
              <button 
                onClick={() => {
                  setTryOnProduct(null);
                  setTryOnStepState('upload');
                }}
                style={{ background: '#f1f3f6', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Step 1: Upload Photo / Choose Mode */}
            {tryOnStepState === 'upload' && (
              <div style={{ textAlign: 'center', padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '84px', height: '110px', borderRadius: '12px', border: '2.5px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', overflow: 'hidden' }}>
                  <User size={30} style={{ opacity: 0.3 }} />
                </div>

                <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Take Portrait or Upload Photo</h4>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: '1.4', padding: '0 10px', fontWeight: 500 }}>
                  Snap a live selfie or choose a full-body photograph to have this garment dynamically draped on your shape.
                </p>

                <label 
                  style={{
                    backgroundColor: '#8b5cf6',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 10px rgba(139, 92, 246, 0.2)'
                  }}
                >
                  <Camera size={14} />
                  Choose Photo
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                </label>
              </div>
            )}

            {/* Step 2: Mapping / Analyzing scanner with poses checklist */}
            {tryOnStepState === 'analyzing' && (
              <div style={{ textAlign: 'center', padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
                {tryOnError ? (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '10px 14px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '4px' }}>
                      <X size={24} />
                    </div>
                    <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: '#ef4444', margin: 0 }}>AI Studio Engine Failed</h4>
                    
                    <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', padding: '12px', fontSize: '11.5px', color: '#991b1b', lineHeight: '1.5', textAlign: 'left', width: '100%', fontWeight: 600, wordBreak: 'break-word' }}>
                      {tryOnError}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '6px' }}>
                      <button
                        onClick={() => {
                          setTryOnError(null);
                          setTryOnStepState('idle');
                          setTimeout(() => {
                            setTryOnStepState('analyzing');
                          }, 50);
                        }}
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: '#8b5cf6', color: '#ffffff', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 10px rgba(139, 92, 246, 0.2)' }}
                      >
                        Retry Google Vertex AI Try-On
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="tryon-scan-overlay" style={{ width: '130px', height: '160px', borderRadius: '16px' }}>
                      <img src={customerPhoto} alt="mapping" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div className="ai-scanning-line" style={{ background: 'linear-gradient(90deg, transparent, #8b5cf6, #ec4899, #8b5cf6, transparent)', boxShadow: '0 0 10px #8b5cf6' }} />
                    </div>
                    
                    <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Google Vertex AI Try-On...
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', textAlign: 'left', padding: '0 12px' }}>
                      {[
                        { label: 'Authorizing GCP IAM OAuth token...', min: 0 },
                        { label: 'Resolving image array inputs...', min: 25 },
                        { label: 'Analyzing skeleton and contours...', min: 50 },
                        { label: 'Synthesizing fabric fit via Vertex AI...', min: 75 },
                        { label: 'Rendering high-fidelity preview...', min: 95 }
                      ].map(s => {
                        const isCompleted = analyzeProgress > s.min;
                        const isCurrent = analyzeProgress <= s.min && (analyzeProgress + 25) > s.min;
                        return (
                          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 600, color: isCompleted ? '#10b981' : (isCurrent ? '#8b5cf6' : '#94a3b8'), opacity: isCompleted || isCurrent ? 1 : 0.6 }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: `1.5px solid ${isCompleted ? '#10b981' : (isCurrent ? '#8b5cf6' : '#94a3b8')}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isCompleted ? '#10b981' : 'transparent' }}>
                              {isCompleted && <Check size={8} style={{ color: '#ffffff' }} />}
                            </div>
                            <span>{s.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ width: '85%', height: '5px', background: '#f1f3f6', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${analyzeProgress}%`, height: '100%', background: '#8b5cf6', transition: 'width 0.15s' }} />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Result Preview Canvas */}
            {tryOnStepState === 'result' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ position: 'relative', height: '320px', borderRadius: '18px', overflow: 'hidden', border: '1.5px solid #cbd5e1', display: 'flex', justifyContent: 'center', background: '#111827' }}>
                  <canvas ref={canvasRef} width={240} height={320} style={{ display: 'block', width: '240px', height: '320px' }} />
                  
                  <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#8b5cf6', color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Sparkles size={8} /> GOOGLE VERTEX AI ACTIVE
                  </div>

                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(15,23,42,0.85)', color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                    AI PREVIEW
                  </div>
                </div>
                
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px', fontSize: '11px', color: '#475569', textAlign: 'left', fontWeight: 500, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    💡 Google Vertex AI Active!
                  </span>
                  <span>
                    Leveraging enterprise-grade Google Vertex AI try-on models to dynamically drape garments on your figure with shadow alignment.
                  </span>
                </div>

                {/* Save to Wishlist with Try-on mockup button */}
                <button
                  onClick={handleSaveToWishlistWithTryOn}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1.5px solid #ef4444',
                    background: '#fff5f5',
                    color: '#ef4444',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '4px'
                  }}
                >
                  <Heart size={15} fill={wishlist?.includes(tryOnProduct?.id) ? '#ef4444' : 'none'} style={{ color: '#ef4444' }} />
                  <span>{wishlist?.includes(tryOnProduct?.id) ? "Update Wishlist Try-On" : "Save to Wishlist with Try-On"}</span>
                </button>

                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button 
                    onClick={() => setTryOnStepState('upload')}
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1.2px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Retake Photo
                  </button>
                  <button 
                    onClick={() => {
                      onAddToCart && onAddToCart(tryOnProduct);
                      setTryOnProduct(null);
                      setTryOnStepState('upload');
                    }}
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: tryOnMode === 'generative' ? '#8b5cf6' : '#ff6b35', color: '#ffffff', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Add Fitted to Bag
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TryOnStudio;

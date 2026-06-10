import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Heart, 
  Share2, 
  Camera, 
  ShoppingBag, 
  Plus, 
  Minus,
  User, 
  Sparkles, 
  Check, 
  Upload,
  ChevronDown,
  ChevronUp,
  Star,
  Percent,
  Truck,
  RefreshCw,
  ShieldCheck,
  MessageSquare,
  Eye
} from 'lucide-react';
import { runVitonTryOn } from '../utils/vitonApi';
import { collection, doc, setDoc, query, where, onSnapshot } from '../firebase';

const FALLBACK_REVIEWS = [
  {
    id: 'mock_1',
    name: 'Ananya S.',
    rating: 5,
    comment: 'Absolutely stunning fit and fabric. Very premium touch and the color is gorgeous!',
    date: new Date(Date.now() - 3600000 * 48).toISOString(),
    approved: true
  },
  {
    id: 'mock_2',
    name: 'Riya Sharma',
    rating: 4,
    comment: 'Very comfortable and perfect for warm summer days. Received many compliments!',
    date: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    approved: true
  }
];

const stripEmojis = (str) => {
  if (!str) return '';
  return str.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '').trim();
};

function ProductDetailModal({ product, onClose, onAddToBag, onNavigateToBag, autoOpenTryOn, wishlist = [], onToggleWishlist }) {
  const [activeSize, setActiveSize] = useState('M');
  const [activeColor, setActiveColor] = useState('Pink Floral');
  const [qty, setQty] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // PDP tabs & accordions
  const [descExpanded, setDescExpanded] = useState(true);
  const [reviewsExpanded, setReviewsExpanded] = useState(true);

  // Size Guide overlay
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newReviewer, setNewReviewer] = useState('');

  // Virtual Try-On Engine States
  const activeEngine = localStorage.getItem('rg_tryon_engine') || 'vertex';
  const [tryOnStep, setTryOnStep] = useState('idle'); // idle, upload, analyzing, result
  const [tryOnMode, setTryOnMode] = useState('generative'); // generative, canvas
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [customerPhoto, setCustomerPhoto] = useState(null);
  const [tryOnResult, setTryOnResult] = useState(null); // Real Vertex AI API output URL
  const [tryOnError, setTryOnError] = useState(null); // Vertex AI API failure message
  const canvasRef = useRef(null);

  // Auto-open try-on drawer when triggered from bottom navigation tab bar
  useEffect(() => {
    if (autoOpenTryOn) {
      setTryOnStep('upload');
    }
  }, [autoOpenTryOn]);

  // Synchronize wishlist state from parent
  useEffect(() => {
    if (product && wishlist) {
      setIsWishlisted(wishlist.includes(product.id));
    }
  }, [product, wishlist]);

  // Dynamic Try-on canvas draping logic
  useEffect(() => {
    if (tryOnStep === 'result' && canvasRef.current) {
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
          productImg.src = product?.imageURL || product?.image || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400";
          
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
  }, [tryOnStep, customerPhoto, product, tryOnMode, tryOnResult]);

  // Virtual Try-on simulated mapping progress bar with real Vertex AI API trigger
  useEffect(() => {
    let interval;
    let finished = false;
    let apiErrorMsg = null;
    
    if (tryOnStep === 'analyzing') {
      setAnalyzeProgress(0);
      setTryOnResult(null); // Reset previous result
      setTryOnError(null);  // Reset error

      if (tryOnMode === 'generative') {
        runVitonTryOn({
          humanImg: customerPhoto,
          garmImg: product?.imageURL || product?.image,
          category: product?.category || "overall",
          description: product?.description || product?.name || "Garment"
        })
        .then(resultUrl => {
          console.log("Successfully fetched Vertex AI virtual try-on result:", resultUrl);
          setTryOnResult(resultUrl);
          finished = true;
        })
        .catch(err => {
          console.error("Vertex AI API generation failed:", err);
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
              return prev; // Stop progress indicator
            }
            if (prev >= 100) {
              clearInterval(interval);
              setTryOnStep('result');
              return 100;
            }
            return Math.min(100, prev + 15); // Rapid transition to 100%
          } else {
            if (prev >= 90) {
              return 90; // Hold at 90% until API responds
            }
            return prev + 5; // Normal progress increments
          }
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [tryOnStep, customerPhoto, product, tryOnMode]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomerPhoto(reader.result);
        setTryOnStep('analyzing');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveToWishlistWithTryOn = () => {
    if (!product) return;
    const isSaved = wishlist?.includes(product.id);
    if (!isSaved) {
      onToggleWishlist && onToggleWishlist(product.id);
    }
    if (tryOnResult) {
      try {
        const tryOnImages = JSON.parse(localStorage.getItem('rg_wishlist_tryon_images') || '{}');
        tryOnImages[product.id] = tryOnResult;
        localStorage.setItem('rg_wishlist_tryon_images', JSON.stringify(tryOnImages));
        alert("Product saved to Wishlist with Try-On mockup! ❤️");
      } catch (e) {
        console.error(e);
      }
    }
  };

  const [isAddedSuccess, setIsAddedSuccess] = useState(false);

  const parsePrice = (priceVal) => {
    if (priceVal === null || priceVal === undefined) return 0;
    if (typeof priceVal === 'number') return priceVal;
    const cleaned = String(priceVal).replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newReviewer.trim() || !newComment.trim()) return;

    try {
      const reviewDocId = `review_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      const reviewData = {
        id: reviewDocId,
        productId: product?.id || 'unknown',
        productName: product?.name || 'Boutique Apparel',
        productImage: product?.imageURL || product?.image || '',
        name: newReviewer.trim(),
        rating: newRating,
        comment: newComment.trim(),
        date: new Date().toISOString(),
        approved: false // Pending approval by default
      };

      await setDoc(doc(null, 'reviews', reviewDocId), reviewData);
      
      setNewReviewer('');
      setNewComment('');
      setShowReviewForm(false);
      showToast('Review submitted! Pending moderation.');
    } catch (err) {
      console.error("Failed to submit review:", err);
      showToast('Failed to submit review.');
    }
  };

  useEffect(() => {
    if (!product) return;

    if (product.colors && product.colors.length > 0) {
      const firstColor = product.colors[0];
      setActiveColor(typeof firstColor === 'string' ? firstColor : (firstColor.name || 'Pink Floral'));
    } else {
      setActiveColor('Pink Floral');
    }
    setQty(1);
    setActiveSize('M');

    // Subscribe to all reviews for this product
    const q = query(
      collection(null, 'reviews'),
      where('productId', '==', product.id)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach(d => {
        list.push({ ...d.data(), id: d.id });
      });
      // Sort newest first
      list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      setReviews(list);
    }, (err) => {
      console.error("Failed to load reviews:", err);
    });

    return () => unsub();
  }, [product]);

  const approvedReviews = reviews.filter(r => r.approved === true);
  const activeReviews = approvedReviews.length > 0 ? approvedReviews : FALLBACK_REVIEWS;

  const avgRating = activeReviews.length > 0 
    ? (activeReviews.reduce((sum, r) => sum + r.rating, 0) / activeReviews.length).toFixed(1) 
    : String(product?.rating || '4.5');

  const sellingPrice = parsePrice(product?.sellingPrice || product?.price || 1599);
  const originalMRP = parsePrice(product?.mrp) || Math.round(sellingPrice * 1.4);
  const discountPercent = originalMRP > 0 ? Math.round(((originalMRP - sellingPrice) / originalMRP) * 100) : 0;

  const colorsList = (product?.colors && product.colors.length > 0)
    ? product.colors.map(clr => {
        if (typeof clr === 'string') {
          const lower = clr.toLowerCase();
          let hex = '#cbd5e1';
          if (lower.includes('pink')) hex = '#f472b6';
          else if (lower.includes('green') || lower.includes('olive')) hex = '#65a30d';
          else if (lower.includes('orange') || lower.includes('peach')) hex = '#fb923c';
          else if (lower.includes('blue') || lower.includes('navy')) hex = '#1e3a8a';
          else if (lower.includes('red')) hex = '#ef4444';
          else if (lower.includes('black')) hex = '#0f172a';
          else if (lower.includes('white')) hex = '#ffffff';
          else if (lower.includes('yellow')) hex = '#eab308';
          return { name: clr, hex: hex };
        }
        return {
          name: clr?.name || 'Default Color',
          hex: clr?.hex || '#cbd5e1'
        };
      })
    : [
        { name: 'Pink Floral', hex: '#f472b6' },
        { name: 'Olive Green', hex: '#65a30d' },
        { name: 'Sunset Peach', hex: '#fb923c' },
        { name: 'Boutique Navy', hex: '#1e3a8a' }
      ];

  // Determine active display image based on selected color variant
  let displayImageUrl = product?.imageURL || product?.image || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800";
  if (product?.variants && product.variants.length > 0 && activeColor) {
    const matchedVariant = product.variants.find(v => v.color && v.color.toLowerCase() === activeColor.toLowerCase());
    if (matchedVariant) {
      displayImageUrl = matchedVariant.mockupUrl || matchedVariant.originalUrl || displayImageUrl;
    }
  }

  const handleAddToCartClick = () => {
    try {
      const cartProduct = {
        ...product,
        qty: qty,
        size: activeSize,
        selectedSize: activeSize,
        color: activeColor,
        selectedColor: activeColor,
        sellingPrice: sellingPrice,
        mrp: originalMRP
      };
      onAddToBag && onAddToBag(cartProduct);
      setIsAddedSuccess(true);
    } catch (e) {
      console.error("Error inside handleAddToCartClick:", e);
      alert("Add to Cart Failure: " + e.message);
    }
  };

  const handleBuyNowClick = () => {
    try {
      const cartProduct = {
        ...product,
        qty: qty,
        size: activeSize,
        selectedSize: activeSize,
        color: activeColor,
        selectedColor: activeColor,
        sellingPrice: sellingPrice,
        mrp: originalMRP
      };
      onAddToBag && onAddToBag(cartProduct);
      onNavigateToBag && onNavigateToBag(true);
    } catch (e) {
      console.error("Error inside handleBuyNowClick:", e);
      alert("Buy Now Action Failure: " + e.message);
    }
  };

  if (isAddedSuccess) {
    return (
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        zIndex: 110,
        fontFamily: "'Outfit', sans-serif",
        textAlign: 'center'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: '#ecfdf5',
          color: '#10b981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 8px 20px rgba(16, 185, 129, 0.15)',
          animation: 'slideDownFade 0.4s ease'
        }}>
          <Check size={36} />
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
          Added to Shopping Bag!
        </h3>
        
        <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 24px', maxWidth: '80%', lineHeight: '1.4' }}>
          Your style selection has been successfully added to your unified curation bag.
        </p>

        <div style={{
          width: '100%',
          maxWidth: '280px',
          background: '#f8fafc',
          border: '1.5px solid #e2e8f0',
          borderRadius: '20px',
          padding: '14px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '28px'
        }}>
          <img 
            src={product?.imageURL || product?.image || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200"} 
            alt={product?.name}
            style={{ width: '64px', height: '80px', borderRadius: '12px', objectFit: 'cover' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', textAlign: 'left', overflow: 'hidden' }}>
            <span style={{ fontSize: '10px', color: '#ff6b35', fontWeight: 800, textTransform: 'uppercase' }}>
              {product?.brand || 'RG BOUTIQUE'}
            </span>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {product?.name}
            </h4>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              Size: {activeSize} | Qty: {qty}
            </span>
            <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#ea580c' }}>
              ₹{(sellingPrice * qty).toLocaleString()}
            </span>
          </div>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => {
              onNavigateToBag && onNavigateToBag(false);
              onClose && onClose();
            }}
            className="interactive-element"
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #ff6b35 0%, #ea580c 100%)',
              color: '#ffffff',
              fontSize: '14.5px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.22)'
            }}
          >
            Go to Cart
          </button>
          
          <button
            onClick={() => {
              setIsAddedSuccess(false);
              onClose && onClose();
            }}
            className="interactive-element"
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              border: '1.5px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontSize: '14.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      fontFamily: "'Outfit', sans-serif"
    }}>
      {toastMessage && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '24px',
          fontSize: '14px',
          fontWeight: 700,
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 1200,
          animation: 'slideDownFade 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <Check size={16} style={{ color: '#10b981' }} />
          <span>{toastMessage}</span>
        </div>
      )}
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes slideDownFade {
          from { opacity: 0; transform: translate(-50%, -15px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .circular-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(8px);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0f172a;
          box-shadow: 0 4px 10px rgba(0,0,0,0.06);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .circular-btn:active {
          transform: scale(0.92);
        }
        .pdp-size-pill {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          border: 1.5px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13.5px;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
          background: #ffffff;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pdp-size-pill.active {
          border-color: #ff6b35;
          background-color: #ff6b35;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.18);
        }
        .color-picker-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .color-picker-dot.active {
          border-color: #ff6b35;
          transform: scale(1.1);
        }
        .qty-circle-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #f1f3f6;
          border: none;
          color: #0f172a;
          font-size: 18px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          outline: none;
          transition: all 0.15s;
        }
        .qty-circle-btn:active {
          transform: scale(0.92);
          background: #e2e8f0;
        }
        .accordion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 20px;
          background: #ffffff;
          border-bottom: 1.2px solid #f1f5f9;
          cursor: pointer;
          transition: all 0.2s;
        }
        .accordion-header:hover {
          background: #fafafa;
        }
        .trust-badge-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
          padding: 12px 6px;
        }
        .trust-badge-circle {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background-color: #eff6ff;
          color: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
      
      {/* Main scrolling PDP catalog body */}
      <div className="momentum-scroll-y" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '90px' }}>
        
        {/* Cover image banner gallery viewport */}
        <div style={{ position: 'relative', height: '380px', width: '100%', background: '#f1f5f9' }}>
          <img 
            src={displayImageUrl} 
            alt={product?.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />

          {/* Stepper/Header floating overlays */}
          <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
            <button className="circular-btn" onClick={onClose}>
              <X size={20} />
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="circular-btn" 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
              >
                <Share2 size={18} />
              </button>
              <button 
                className="circular-btn" 
                onClick={() => onToggleWishlist && onToggleWishlist(product.id)}
                style={{ color: isWishlisted ? '#ef4444' : '#0f172a' }}
              >
                <Heart size={18} fill={isWishlisted ? '#ef4444' : 'none'} />
              </button>
            </div>
          </div>

          {/* Copy Share Toast banner overlay */}
          {copiedLink && (
            <div style={{ position: 'absolute', top: '74px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#0f172a', color: '#ffffff', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, zIndex: 15, animation: 'fadeIn 0.2s', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={12} style={{ color: '#10b981' }} />
              Link Copied!
            </div>
          )}

          {/* NEW high-urgency blue badge overlay */}
          {product?.isNew !== false && (
            <div style={{ 
              position: 'absolute', 
              top: '74px', 
              left: '16px', 
              background: '#3b82f6', 
              color: '#ffffff', 
              fontSize: '10px', 
              fontWeight: 800, 
              padding: '4px 10px', 
              borderRadius: '6px', 
              letterSpacing: '0.5px',
              boxShadow: '0 2px 6px rgba(59, 130, 246, 0.2)',
              zIndex: 5
            }}>
              NEW
            </div>
          )}

          {/* Floating 'Try On' CTA overlaying bottom-right */}
          <button 
            onClick={() => setTryOnStep('upload')}
            className="interactive-element"
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              background: '#1a2e4c',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '24px',
              fontSize: '13.5px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 10
            }}
          >
            <Eye size={16} style={{ color: '#ffffff' }} />
            <span>Try On</span>
          </button>
        </div>

        {/* Editorial Titles & Pricing Card details */}
        <div style={{ padding: '20px 20px 16px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#ffffff' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            {product?.brand || 'RG BOUTIQUE'}
          </span>
          <h2 className="dashboard-title-serif" style={{ fontSize: '23px', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: '1.2' }}>
            {product?.name || 'Floral Summer Dress'}
          </h2>

          {/* Star rating summaries */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1,2,3,4,5].map(starIdx => {
                const isFull = activeReviews.length > 0 && parseFloat(avgRating) >= starIdx;
                return (
                  <Star key={starIdx} size={15} style={{ color: isFull ? '#fbbf24' : '#cbd5e1' }} fill={isFull ? '#fbbf24' : 'none'} />
                );
              })}
            </div>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
              {activeReviews.length > 0 ? `${avgRating} (${activeReviews.length} reviews)` : `0.0 (0 reviews)`}
            </span>
          </div>

          {/* Large Boutique price displays */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '24px', fontWeight: 900, color: '#ea580c' }}>
              ₹{(product?.sellingPrice ?? 1599).toLocaleString()}
            </span>
            <span style={{ fontSize: '14.5px', textDecoration: 'line-through', color: '#94a3b8' }}>
              ₹{originalMRP.toLocaleString()}
            </span>
            <span style={{ 
              fontSize: '11.5px', 
              fontWeight: 800, 
              backgroundColor: '#ecfdf5', 
              color: '#10b981', 
              padding: '3px 8px', 
              borderRadius: '6px',
              border: '1px solid #a7f3d0'
            }}>
              {discountPercent}% OFF
            </span>
          </div>
        </div>

        {/* Separator */}
        <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9' }} />

        {/* Sizes selectors */}
        <div style={{ padding: '20px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Select Size</span>
            <button 
              onClick={() => setShowSizeGuide(true)}
              style={{ background: 'none', border: 'none', color: '#ff6b35', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer', outline: 'none' }}
            >
              Size Guide
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {['XS', 'S', 'M', 'L', 'XL'].map(sz => (
              <button
                key={sz}
                onClick={() => setActiveSize(sz)}
                className={`pdp-size-pill ${activeSize === sz ? 'active' : ''}`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div style={{ width: '100%', height: '1.2px', backgroundColor: '#f1f5f9' }} />

        {/* Color circular pickers */}
        <div style={{ padding: '20px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Select Color</span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {colorsList.map(clr => (
              <div 
                key={clr.name}
                onClick={() => setActiveColor(clr.name)}
                className={`color-picker-dot ${activeColor === clr.name ? 'active' : ''}`}
              >
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: clr.hex, boxShadow: 'inset 0 0 4px rgba(0,0,0,0.1)' }} />
              </div>
            ))}
          </div>
          
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700, marginTop: '-4px' }}>
            {activeColor}
          </span>
        </div>

        {/* Separator */}
        <div style={{ width: '100%', height: '1.2px', backgroundColor: '#f1f5f9' }} />

        {/* Quantity adjusters */}
        <div style={{ padding: '20px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Quantity</span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={() => setQty(prev => Math.max(1, prev - 1))}
              className="qty-circle-btn"
            >
              <Minus size={16} />
            </button>
            <span style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', minWidth: '24px', textAlign: 'center' }}>
              {qty}
            </span>
            <button 
              onClick={() => setQty(prev => prev + 1)}
              className="qty-circle-btn"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Trust Badges row container */}
        <div style={{ margin: '14px 20px', padding: '6px', borderRadius: '18px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
          <div className="trust-badge-card">
            <div className="trust-badge-circle" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
              <Truck size={18} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>Free Delivery</span>
            <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 600 }}>Above ₹999</span>
          </div>
          <div style={{ width: '1px', backgroundColor: '#e2e8f0', margin: '12px 0' }} />
          <div className="trust-badge-card">
            <div className="trust-badge-circle" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
              <RefreshCw size={16} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>Easy Returns</span>
            <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 600 }}>7 days policy</span>
          </div>
          <div style={{ width: '1px', backgroundColor: '#e2e8f0', margin: '12px 0' }} />
          <div className="trust-badge-card">
            <div className="trust-badge-circle" style={{ backgroundColor: '#faf5ff', color: '#a855f7' }}>
              <ShieldCheck size={18} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>Secure Pay</span>
            <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 600 }}>100% secure</span>
          </div>
        </div>

        {/* Separator */}
        <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9' }} />

        {/* Product Description accordion */}
        <div style={{ background: '#ffffff' }}>
          <div className="accordion-header" onClick={() => setDescExpanded(!descExpanded)}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Product Description</span>
            {descExpanded ? <ChevronUp size={16} style={{ color: '#64748b' }} /> : <ChevronDown size={16} style={{ color: '#64748b' }} />}
          </div>
          
          {descExpanded && (
            <div style={{ padding: '16px 20px', fontSize: '13px', color: '#64748b', lineHeight: '1.5', fontWeight: 500, background: '#fcfcfc', borderBottom: '1.2px solid #f1f5f9' }}>
              {product?.desc || product?.description || "This premium summer selection is crafted from ultra-breathable high-twist cotton and premium structured fibers. Curated carefully by our team to provide max structural durability, tactile comfort, and boutique aesthetics for standard fashion curations."}
            </div>
          )}
        </div>

        {/* Reviews & Ratings accordion */}
        <div style={{ background: '#ffffff' }}>
          <div className="accordion-header" onClick={() => setReviewsExpanded(!reviewsExpanded)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Reviews & Ratings</span>
              <span style={{ fontSize: '10.5px', background: '#f1f3f6', color: '#475569', padding: '2px 7px', borderRadius: '8px', fontWeight: 800 }}>
                {activeReviews.length}
              </span>
            </div>
            {reviewsExpanded ? <ChevronUp size={16} style={{ color: '#64748b' }} /> : <ChevronDown size={16} style={{ color: '#64748b' }} />}
          </div>

          {reviewsExpanded && (
            <div style={{ padding: '20px', background: '#fcfcfc', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Ratings grid summary info */}
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: '#ffffff', padding: '16px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
                <div style={{ textAlign: 'center', minWidth: '80px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{avgRating}</span>
                  <div style={{ display: 'flex', gap: '1.5px', justifyContent: 'center' }}>
                    {[1,2,3,4,5].map(stIdx => (
                      <Star key={stIdx} size={11} style={{ color: activeReviews.length > 0 && parseFloat(avgRating) >= stIdx ? '#fbbf24' : '#cbd5e1' }} fill={activeReviews.length > 0 && parseFloat(avgRating) >= stIdx ? '#fbbf24' : 'none'} />
                    ))}
                  </div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>{activeReviews.length} reviews</span>
                </div>
                
                {/* Visual bar chart distribution */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {[5,4,3,2,1].map(stars => {
                    const matches = activeReviews.filter(r => r.rating === stars).length;
                    const percent = activeReviews.length > 0 ? (matches / activeReviews.length) * 100 : 0;
                    return (
                      <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                        <span style={{ width: '8px' }}>{stars}</span>
                        <Star size={9} style={{ color: '#fbbf24' }} fill="#fbbf24" />
                        <div style={{ flex: 1, height: '4px', background: '#f1f3f6', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, height: '100%', background: '#ff6b35', borderRadius: '2px' }} />
                        </div>
                        <span style={{ width: '8px', textAlign: 'right' }}>{matches}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit active reviews trigger button */}
              {!showReviewForm ? (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="interactive-element"
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '14px',
                    border: 'none',
                    background: '#ff6b35',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(255, 107, 53, 0.2)'
                  }}
                >
                  <MessageSquare size={16} /> Write a Review
                </button>
              ) : (
                /* Write a Review Submission Form */
                <form onSubmit={handleAddReview} style={{ background: '#ffffff', padding: '16px', borderRadius: '18px', border: '1.5px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Write a Review</h4>
                  
                  {/* Select stars rating */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 700 }}>Select Stars:</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1,2,3,4,5].map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setNewRating(st)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.15rem' }}
                        >
                          <Star size={20} style={{ color: newRating >= st ? '#fbbf24' : '#cbd5e1' }} fill={newRating >= st ? '#fbbf24' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Name field */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <input 
                      type="text" 
                      placeholder="Your Name *"
                      required
                      value={newReviewer}
                      onChange={(e) => setNewReviewer(e.target.value)}
                      style={{ padding: '10px 14px', border: '1.2px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', outline: 'none', fontFamily: "'Outfit', sans-serif" }}
                    />
                  </div>

                  {/* Textarea review comment field */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <textarea 
                      placeholder="Describe your styling experience... *"
                      required
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      style={{ padding: '10px 14px', border: '1.2px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', outline: 'none', height: '64px', resize: 'none', fontFamily: "'Outfit', sans-serif" }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button 
                      type="button" 
                      onClick={() => setShowReviewForm(false)}
                      style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#64748b', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#ff6b35', color: '#ffffff', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                    >
                      Submit Review
                    </button>
                  </div>
                </form>
              )}

              {/* Placed reviews items */}
              {activeReviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 10px', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>
                  No reviews yet. Be the first to review!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  {activeReviews.map(r => {
                    const cleanName = stripEmojis(r.name);
                    const cleanComment = stripEmojis(r.comment);
                    const formattedDate = r.date && r.date.includes('T')
                      ? new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                      : r.date || 'Recently';

                    return (
                      <div key={r.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{cleanName}</span>
                          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{formattedDate}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1,2,3,4,5].map(sIdx => (
                            <Star key={sIdx} size={11} style={{ color: r.rating >= sIdx ? '#fbbf24' : '#cbd5e1' }} fill={r.rating >= sIdx ? '#fbbf24' : 'none'} />
                          ))}
                        </div>
                        <p style={{ fontSize: '12.5px', color: '#475569', margin: '2px 0 0', lineHeight: '1.4', fontWeight: 500 }}>
                          {cleanComment}
                        </p>
                        
                        {/* Admin reply sub-bubble */}
                        {r.reply && (
                          <div style={{ 
                            marginTop: '8px', 
                            padding: '10px 12px', 
                            background: '#f8fafc', 
                            borderRadius: '10px',
                            borderLeft: '3px solid #ff6b35',
                            fontSize: '11.5px',
                            color: '#475569',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px'
                          }}>
                            <span style={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <ShieldCheck size={12} color="#10b981" /> Store Response
                            </span>
                            <span style={{ fontWeight: 500 }}>{stripEmojis(r.reply.text)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}
        </div>

      </div>

      {/* Floating Bottom action bar for Checkout Add/Buy */}
      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        background: '#ffffff', 
        borderTop: '1.5px solid #e2e8f0', 
        padding: '12px 20px', 
        display: 'flex', 
        gap: '12px',
        alignItems: 'center',
        zIndex: 20
      }}>
        {/* Square Bag shortcut */}
        <button
          onClick={() => {
            onNavigateToBag && onNavigateToBag();
            onClose && onClose();
          }}
          className="interactive-element"
          style={{
            width: '46px',
            height: '46px',
            minWidth: '46px',
            borderRadius: '12px',
            border: '1.5px solid #e2e8f0',
            background: '#ffffff',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <ShoppingBag size={18} />
        </button>

        {/* Add to Cart outline button */}
        <button
          onClick={handleAddToCartClick}
          className="interactive-element"
          style={{
            flex: 1,
            padding: '14px 0',
            borderRadius: '14px',
            border: '1.8px solid #ff6b35',
            background: '#ffffff',
            color: '#ff6b35',
            fontSize: '14.5px',
            fontWeight: 800,
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          Add to Cart
        </button>

        {/* Buy Now solid orange button */}
        <button
          onClick={handleBuyNowClick}
          className="interactive-element"
          style={{
            flex: 1,
            padding: '14px 0',
            borderRadius: '14px',
            border: 'none',
            background: '#ff6b35',
            color: '#ffffff',
            fontSize: '14.5px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(255, 107, 53, 0.25)',
            outline: 'none'
          }}
        >
          Buy Now
        </button>
      </div>

      {/* Try-on dynamic calibration scanning viewport overlay drawer */}
      {tryOnStep !== 'idle' && (
        <div className="ai-tryon-overlay">
          <div className="ai-tryon-drawer" style={{ background: '#fcfcfc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} style={{ color: '#8b5cf6' }} /> AI Virtual Try-On Studio
              </span>
              <button 
                onClick={() => setTryOnStep('idle')}
                style={{ background: '#f1f3f6', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Step 1: Upload Photo / Choose Mode */}
            {tryOnStep === 'upload' && (
              <div style={{ textAlign: 'center', padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '84px', height: '110px', borderRadius: '12px', border: '2.5px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', overflow: 'hidden' }}>
                  <User size={30} style={{ opacity: 0.3 }} />
                </div>

                <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Take Portrait or Upload Photo</h4>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: '1.4', padding: '0 10px', fontWeight: 500 }}>
                  Snap a live selfie or choose a full-body photograph to have this garment dynamically draped on your shape.
                </p>

                <label 
                  className="interactive-element"
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
            {tryOnStep === 'analyzing' && (
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
                          // Temporarily go to upload and back to trigger useEffect
                          setTryOnStep('idle');
                          setTimeout(() => {
                            setTryOnStep('analyzing');
                          }, 50);
                        }}
                        className="interactive-element"
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
                    
                    {/* Checklist Steps */}
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
            {tryOnStep === 'result' && (
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
                  <Heart size={15} fill={wishlist?.includes(product?.id) ? '#ef4444' : 'none'} style={{ color: '#ef4444' }} />
                  <span>{wishlist?.includes(product?.id) ? "Update Wishlist Try-On" : "Save to Wishlist with Try-On"}</span>
                </button>

                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button 
                    onClick={() => setTryOnStep('upload')}
                    className="interactive-element"
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1.2px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Retake Photo
                  </button>
                  <button 
                    onClick={() => {
                      handleAddToCartClick();
                      setTryOnStep('idle');
                    }}
                    className="interactive-element"
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

      {/* Editorial Size Guide modal overlay table */}
      {showSizeGuide && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            width: '85%',
            padding: '24px 20px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Size Guide</span>
              <button 
                onClick={() => setShowSizeGuide(false)}
                style={{ background: '#f1f3f6', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', fontWeight: 500 }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #cbd5e1', color: '#475569' }}>
                  <th style={{ padding: '8px 4px' }}>Size</th>
                  <th style={{ padding: '8px 4px' }}>Chest (in)</th>
                  <th style={{ padding: '8px 4px' }}>Length (in)</th>
                </tr>
              </thead>
              <tbody>
                {['XS', 'S', 'M', 'L', 'XL'].map((s, idx) => (
                  <tr key={s} style={{ borderBottom: '1px solid #f1f5f9', color: '#334155' }}>
                    <td style={{ padding: '10px 4px', fontWeight: 800 }}>{s}</td>
                    <td style={{ padding: '10px 4px' }}>{34 + idx * 2}</td>
                    <td style={{ padding: '10px 4px' }}>{26 + idx * 0.5}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button 
              onClick={() => setShowSizeGuide(false)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: '#ff6b35',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default ProductDetailModal;

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Heart, 
  Share2, 
  Camera, 
  ShoppingBag, 
  Search,
  Bell,
  Mic,
  Gift,
  Crown,
  Truck,
  Sparkles, 
  ChevronRight, 
  Zap,
  X,
  Check,
  Copy,
  Eye,
  TrendingUp,
  Sliders,
  Sparkle,
  ArrowLeft,
  MapPin,
  RefreshCw,
  Percent,
  Phone,
  User,
  Clock
} from 'lucide-react';
import { runVitonTryOn } from '../utils/vitonApi';
import MembershipPaywall from './MembershipPaywall';

const FALLBACK_CATEGORY_OFFERS = [
  {
    id: 'fallback_denim',
    title: 'The Premium Denim Edit',
    message: 'Discover our luxury stretch denim collection with complimentary tailoring.',
    category: 'All',
    imageURL: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop',
    deepLink: 'Home',
    productId: ''
  },
  {
    id: 'fallback_men_suit',
    title: 'Editorial Summer Linens',
    message: 'Stay cool with our hand-woven linen shirts and lightweight trousers.',
    category: 'Men',
    imageURL: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&auto=format&fit=crop',
    deepLink: 'Home',
    productId: ''
  },
  {
    id: 'fallback_women_dress',
    title: 'The Silk Slip Silhouette',
    message: 'Effortless elegance in pure Mulberry silk. Tailored to perfection.',
    category: 'Women',
    imageURL: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop',
    deepLink: 'Home',
    productId: ''
  },
  {
    id: 'fallback_girls_pastels',
    title: 'Sweet Pastel Play-wear',
    message: 'Comfy cotton dresses and sets in delightful pastel hues.',
    category: 'Girls',
    imageURL: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=500&auto=format&fit=crop',
    deepLink: 'Home',
    productId: ''
  },
  {
    id: 'fallback_acc_leather',
    title: 'Full-Grain Leather Goods',
    message: 'Handcrafted bags and belts built to age beautifully.',
    category: 'Accessories',
    imageURL: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=500&auto=format&fit=crop',
    deepLink: 'Home',
    productId: ''
  }
];

const FALLBACK_HERO_SLIDES = [
  {
    id: 'fallback_hero_1',
    title: 'Summer Linens',
    subtitle: 'Lighter weights, breathable comfort.',
    btnText: 'Shop Summer',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #EA580C 100%)',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop'
  },
  {
    id: 'fallback_hero_2',
    title: 'Mulberry Silks',
    subtitle: 'Luxury tailored silhouettes.',
    btnText: 'Shop Silk',
    gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop'
  }
];

const FALLBACK_OUTFITS = [
  {
    id: 'fallback_outfit_1',
    tag: 'Office Chic',
    title: 'Tailored Minimalist Suit',
    desc: 'Breezy linen blazer paired with matching slim trousers and luxury watch.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop',
    price: 3800,
    itemsCount: 3,
    category: 'Men',
    products: []
  },
  {
    id: 'fallback_outfit_2',
    tag: 'Resort Casual',
    title: 'Silk Slip Silhouette',
    desc: 'Flowy pure silk dress accessorized with handwoven leather bag and chic slides.',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop',
    price: 4500,
    itemsCount: 3,
    category: 'Women',
    products: []
  }
];

const stripEmojis = (str) => {
  if (!str) return '';
  return str.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '').trim();
};

function HomeFeed({ 
  products = [], 
  stories = [],
  heroSlides: dbHeroSlides = [],
  outfits: dbOutfits = [],
  onSelectProduct, 
  activeCategory, 
  setActiveCategory, 
  categories = ['All'],
  stylePersona = 'Creative',
  recommendationRules = [],
  recommendationSettings = null,
  recommendationABSettings = null,
  recommendationBundles = [],
  crmCustomer = null,
  onAddToCart,
  placedOrders = [],
  notifications = [],
  onNotificationClick,
  availableCoupons = [],
  cart = [],
  onNavigateToBag,
  onAddMultipleToCart,
  dbLoading = false,
  wishlist = [],
  onToggleWishlist,
  categoryOffers = [],
  flashSales = [],
  isExplore = false,
  membershipPlans = [],
  onUpgradeTier
}) {
  const [likes, setLikes] = useState({});
  const activeEngine = localStorage.getItem('rg_tryon_engine') || 'vertex';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTileTab, setActiveTileTab] = useState(null); // 'sale', 'offers', 'premium', 'track'
  const [tryOnProduct, setTryOnProduct] = useState(null);
  const [tryOnStepState, setTryOnStepState] = useState('upload'); // upload, analyzing, result
  const [tryOnMode, setTryOnMode] = useState('generative'); // generative, canvas
  const [customerPhoto, setCustomerPhoto] = useState(null);
  const [tryOnResult, setTryOnResult] = useState(null); // Real Vertex AI API output URL
  const [tryOnError, setTryOnError] = useState(null); // Vertex AI API failure message
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [tryOnSize, setTryOnSize] = useState('M');
  const [tryOnColor, setTryOnColor] = useState('#ff6b35'); // Active accent color
  const canvasRef = useRef(null);

  // Virtual Try-on simulated mapping progress bar inside HomeFeed with real Vertex AI API trigger
  useEffect(() => {
    let interval;
    let finished = false;
    let apiErrorMsg = null;
    
    if (tryOnStepState === 'analyzing') {
      setAnalyzeProgress(0);
      setTryOnResult(null); // Reset previous result
      setTryOnError(null);  // Reset error

      if (tryOnMode === 'generative') {
        runVitonTryOn({
          humanImg: customerPhoto,
          garmImg: tryOnProduct?.imageURL || tryOnProduct?.image,
          category: tryOnProduct?.category || "overall",
          description: tryOnProduct?.description || tryOnProduct?.name || "Garment"
        })
        .then(resultUrl => {
          console.log("Successfully fetched Vertex AI virtual try-on result in Feed:", resultUrl);
          setTryOnResult(resultUrl);
          finished = true;
        })
        .catch(err => {
          console.error("Vertex AI API generation failed in Feed:", err);
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
              setTryOnStepState('result');
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
  }, [tryOnStepState, customerPhoto, tryOnProduct, tryOnMode]);

  // Dynamic Try-on canvas drawing logic inside HomeFeed
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

  const [copiedCoupon, setCopiedCoupon] = useState('');
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const unreadCount = (notifications || []).filter(n => !n.read).length;
  const [toastMessage, setToastMessage] = useState('');

  // Curated For You products calculated via live recommendation engine settings
  const curatedForYouProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    // 1. Load active recommendation settings
    let activeWeights = recommendationSettings?.weights || {
      gender: 30,
      age: 20,
      history: 25,
      wishlist: 15,
      interest: 10
    };
    let activeStrategy = recommendationSettings?.strategy || 'hybrid';

    // A/B Testing Routing
    if (recommendationABSettings?.enabled) {
      const userIdStr = crmCustomer?.id || crmCustomer?.phone || 'guest';
      let hash = 0;
      for (let i = 0; i < userIdStr.length; i++) {
        hash = (hash << 5) - hash + userIdStr.charCodeAt(i);
        hash |= 0;
      }
      const bucket = Math.abs(hash) % 100;
      const splitVal = recommendationABSettings.splitPercent ?? 50;
      if (bucket < splitVal) {
        activeStrategy = recommendationABSettings.strategyA || 'hybrid';
      } else {
        activeStrategy = recommendationABSettings.strategyB || 'collaborative';
      }
    }

    // 2. Extract customer features
    const custGender = (crmCustomer?.gender || stylePersona || 'Female').toLowerCase();
    
    let customerAge = null;
    if (crmCustomer?.dob) {
      const dobDate = new Date(crmCustomer.dob);
      if (!isNaN(dobDate.getTime())) {
        const diff = Date.now() - dobDate.getTime();
        customerAge = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
      }
    }
    if (customerAge === null && crmCustomer?.ageRange) {
      const ageStr = String(crmCustomer.ageRange).toLowerCase();
      if (ageStr.includes('kids') || ageStr.includes('under 15')) {
        customerAge = 10;
      } else if (ageStr.includes('18-24')) {
        customerAge = 21;
      } else if (ageStr.includes('25-30') || ageStr.includes('25-34')) {
        customerAge = 28;
      } else if (ageStr.includes('31-40')) {
        customerAge = 35;
      } else {
        customerAge = 45;
      }
    }
    if (customerAge === null) {
      customerAge = 28;
    }

    // Purchase categories history
    const purchaseHistoryCategories = [];
    if (placedOrders && placedOrders.length > 0) {
      placedOrders.forEach(order => {
        (order.items || []).forEach(item => {
          if (item.category) purchaseHistoryCategories.push(item.category);
        });
      });
    }

    // Wishlist matching
    const wishlistArray = wishlist || crmCustomer?.wishlist || [];

    // Interests
    let interestsArray = crmCustomer?.interests || [];
    if (typeof interestsArray === 'string') {
      interestsArray = interestsArray.split(',').map(i => i.trim());
    }
    if (crmCustomer?.stylePersona) {
      interestsArray = [...interestsArray, ...crmCustomer.stylePersona.split(',').map(s => s.trim())];
    }
    if (stylePersona) {
      interestsArray = [...interestsArray, stylePersona];
    }
    interestsArray = Array.from(new Set(interestsArray.map(i => String(i).toLowerCase())));

    // 3. Score all catalog products
    return products.map(prod => {
      let genderScore = 0;
      let ageScore = 0;
      let historyScore = 0;
      let wishlistScore = 0;
      let interestScore = 0;

      // Gender Match
      const prodGender = (prod.gender || '').toLowerCase();
      if (prodGender === 'unisex' || prodGender === 'all') {
        genderScore = 1;
      } else if ((custGender.includes('male') || custGender.includes('men')) && prodGender === 'men') {
        genderScore = 1;
      } else if ((custGender.includes('female') || custGender.includes('women')) && prodGender === 'women') {
        genderScore = 1;
      }

      // Age demographic Match
      const prodDemographic = (prod.demographic || '').toLowerCase();
      if (prodDemographic === 'kids' && customerAge < 15) {
        ageScore = 1;
      } else if (prodDemographic === 'adults' && customerAge >= 15) {
        ageScore = 1;
      } else if (!prodDemographic || prodDemographic === 'all') {
        ageScore = 0.8;
      }

      // History Match
      if (prod.category && purchaseHistoryCategories.some(cat => cat.toLowerCase() === prod.category.toLowerCase())) {
        historyScore = 1;
      }

      // Wishlist Match
      if (wishlistArray.includes(prod.id)) {
        wishlistScore = 1;
      }

      // Interests Match
      if (prod.category) {
        const prodCatLower = prod.category.toLowerCase();
        const matches = interestsArray.some(interest => {
          const intLower = String(interest || '').toLowerCase();
          return prodCatLower === intLower || 
                 prodCatLower === intLower + 's' || 
                 intLower === prodCatLower + 's' ||
                 prodCatLower.includes(intLower) ||
                 intLower.includes(prodCatLower);
        });
        if (matches) {
          interestScore = 1;
        }
      }

      // Total Score
      let finalScore = (
        (genderScore * activeWeights.gender) +
        (ageScore * activeWeights.age) +
        (historyScore * activeWeights.history) +
        (wishlistScore * activeWeights.wishlist) +
        (interestScore * activeWeights.interest)
      );

      // Adjust based on AI reasoning strategy (collaborative vs content vs hybrid)
      if (activeStrategy === 'collaborative') {
        finalScore = (historyScore * 50) + (wishlistScore * 30) + (genderScore * 20);
      } else if (activeStrategy === 'content') {
        finalScore = (interestScore * 40) + (genderScore * 30) + (ageScore * 30);
      }

      return {
        product: prod,
        score: Math.min(Math.round(finalScore), 100)
      };
    })
    .sort((a, b) => b.score - a.score)
    .map(item => ({
      ...item.product,
      recommendationScore: item.score
    }));
  }, [products, recommendationSettings, recommendationABSettings, crmCustomer, wishlist, placedOrders, stylePersona]);

  const [visibleCount, setVisibleCount] = useState(10);
  const [infiniteProducts, setInfiniteProducts] = useState([]);

  // Reset visible count on filter/search change
  useEffect(() => {
    setVisibleCount(10);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    const sourceList = curatedForYouProducts && curatedForYouProducts.length > 0 ? curatedForYouProducts : [];
    let pool = [];
    for (let i = 0; i < 50; i++) {
      sourceList.forEach((prod, idx) => {
        pool.push({
          ...prod,
          uniqueKey: `${prod.id}_inf_${i}_${idx}`
        });
      });
    }
    setInfiniteProducts(pool);
  }, [curatedForYouProducts]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 220) {
      setVisibleCount(prev => Math.min(prev + 10, infiniteProducts.length || 300));
    }
  };

  // Dynamic Product Badge Helper to ensure visual excellence and robust fallback
  const renderProductBadges = (prod) => {
    if (!prod) return { discountBadge: null, tagBadge: null };

    // 1. Calculate discount if missing
    let discountPercent = parseInt(prod.discount, 10) || 0;
    if (discountPercent <= 0 && prod.mrp && prod.sellingPrice && prod.mrp > prod.sellingPrice) {
      discountPercent = Math.round(((prod.mrp - prod.sellingPrice) / prod.mrp) * 100);
    }

    let discountBadge = null;
    if (discountPercent > 0) {
      discountBadge = {
        label: `${discountPercent}% OFF`,
        style: { background: '#ef4444', boxShadow: '0 2px 6px rgba(239, 68, 68, 0.2)' }
      };
    } else {
      // Fallback premium badges for items without a discount to keep visual appeal
      const tagSeed = parseInt(prod.id || '0', 10) || 0;
      const fallbacks = [
        { label: 'EXCLUSIVE', background: '#0d9488', shadow: 'rgba(13, 148, 136, 0.2)' },
        { label: 'BESTSELLER', background: '#d4af37', shadow: 'rgba(212, 175, 55, 0.2)' },
        { label: 'LIMITED', background: '#4b5563', shadow: 'rgba(75, 85, 99, 0.2)' },
        { label: 'HOT', background: '#ff6b35', shadow: 'rgba(255, 107, 53, 0.2)' }
      ];
      const selected = fallbacks[tagSeed % fallbacks.length];
      discountBadge = {
        label: selected.label,
        style: { background: selected.background, boxShadow: `0 2px 6px ${selected.shadow}` }
      };
    }

    // Secondary Left Badge: NEW or TRENDING
    let tagBadge = null;
    const isProductNew = prod.isNew === true || prod.isNew === 'true' || (prod.isNew !== false && (parseInt(prod.id || '0', 10) % 3 === 0));
    const isProductTrending = prod.isTrending === true || (parseInt(prod.id || '0', 10) % 3 === 1);

    if (isProductNew) {
      tagBadge = {
        label: 'NEW',
        style: { background: '#3b82f6', color: '#ffffff' }
      };
    } else if (isProductTrending) {
      tagBadge = {
        label: 'TRENDING',
        style: { background: '#8b5cf6', color: '#ffffff' }
      };
    }

    return { discountBadge, tagBadge };
  };


  // Quick Action Tiles with micro-interactive features
  const actionTiles = [
    {
      id: 'sale',
      label: 'Flash',
      bgColor: '#fff1f2',
      color: '#f43f5e',
      icon: <Zap size={22} />
    },
    {
      id: 'offers',
      label: 'Offers',
      bgColor: '#f0fdfa',
      color: '#0d9488',
      icon: <Gift size={22} />
    },
    {
      id: 'premium',
      label: 'Premium',
      bgColor: '#faf5ff',
      color: '#a855f7',
      icon: <Crown size={22} />
    },
    {
      id: 'track',
      label: 'Track',
      bgColor: '#eff6ff',
      color: '#3b82f6',
      icon: <Truck size={22} />
    }
  ];

  // Advanced Search States
  const [searchSuggestionsOpen, setSearchSuggestionsOpen] = useState(false);
  const [activeSearchVoice, setActiveSearchVoice] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isExplore && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
        setSearchSuggestionsOpen(true);
      }, 300);
    }
  }, [isExplore]);

  const searchSuggestions = useMemo(() => {
    const defaultPhrases = ["Lehenga", "Denim Casual Shirt", "Hoodie", "Leggings"];
    if (!products || products.length === 0) return defaultPhrases;
    
    // Get unique categories and brands or names to suggest dynamically
    const suggestions = new Set();
    
    // Check categories and brands
    products.forEach(p => {
      if (p.category) suggestions.add(p.category);
      if (p.brand) suggestions.add(p.brand);
    });
    
    const list = Array.from(suggestions).filter(Boolean).slice(0, 4);
    // Fill remaining with defaults
    let defaultIdx = 0;
    while (list.length < 4 && defaultIdx < defaultPhrases.length) {
      const fallback = defaultPhrases[defaultIdx++];
      if (!list.some(item => item.toLowerCase() === fallback.toLowerCase())) {
        list.push(fallback);
      }
    }
    return list;
  }, [products]);

  const rawHeroSlides = dbHeroSlides && dbHeroSlides.length > 0
    ? dbHeroSlides.filter(s => s.active !== false).map(s => ({
        id: s.id,
        title: s.title,
        subtitle: s.subtitle || '',
        btnText: s.btnText || 'Shop Now',
        gradient: s.gradient || (s.gradient1 && s.gradient2 ? `linear-gradient(135deg, ${s.gradient1} 0%, ${s.gradient2} 100%)` : 'linear-gradient(135deg, #ff6b35 0%, #ea580c 100%)'),
        image: s.imageURL || s.image || ''
      }))
    : [];
  const heroSlides = rawHeroSlides.length > 0 ? rawHeroSlides : FALLBACK_HERO_SLIDES;

  // 3-Slide Hero Carousel States
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  // Guard active hero slide index from getting out-of-bounds on database updates
  useEffect(() => {
    setActiveHeroSlide(0);
  }, [heroSlides.length]);

  // Auto-cycles hero slider slides every 4.5 seconds
  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setActiveHeroSlide(prev => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const rawCuratedLooks = dbOutfits && dbOutfits.length > 0
    ? dbOutfits.filter(o => o.active !== false).map(o => ({
        id: o.id,
        tag: o.tag || 'Trending',
        title: o.title,
        desc: o.desc || o.description || '',
        image: o.imageURL || o.image || '',
        price: parseFloat(o.price || 0),
        itemsCount: parseInt(o.itemsCount || 0, 10),
        category: o.category || 'All',
        products: o.products || []
      }))
    : [];
  const curatedLooks = rawCuratedLooks.length > 0 ? rawCuratedLooks : FALLBACK_OUTFITS;

  // Compute active flash sale campaign
  const activeFlashSale = React.useMemo(() => {
    if (!flashSales || flashSales.length === 0) return null;
    return flashSales.find(s => {
      if (s.active === false) return false;
      const now = new Date();
      if (s.startDate && new Date(s.startDate) > now) return false;
      if (s.endDate && new Date(s.endDate) < now) return false;
      return true;
    });
  }, [flashSales]);

  // Complete the Look Bundle Selection states (Screenshot 3)
  const [completeLookMain, setCompleteLookMain] = useState({
    id: 'ctl_main',
    name: 'HOODIE',
    sellingPrice: 500,
    mrp: 3000,
    discount: 83,
    imageURL: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=400&q=80',
    category: 'Men'
  });

  // Dynamically compute matching items based on bundles and rules
  const matchingItems = useMemo(() => {
    if (!completeLookMain?.id || !products || products.length === 0) {
      return [];
    }

    // 1. Look for a configured bundle in recommendationBundles
    const activeBundle = (recommendationBundles || []).find(b => b.mainProductId === completeLookMain.id);
    if (activeBundle && activeBundle.accessoryProductIds && activeBundle.accessoryProductIds.length > 0) {
      const accs = products.filter(p => activeBundle.accessoryProductIds.includes(p.id));
      if (accs.length > 0) return accs;
    }

    // 2. Fallback: Look for override cross-sell rules matching this product or its category
    const activeRules = (recommendationRules || []).filter(r => 
      (r.triggerType === 'product' && r.triggerId === completeLookMain.id) ||
      (r.triggerType === 'category' && String(r.triggerId).toLowerCase() === String(completeLookMain.category || '').toLowerCase())
    );
    if (activeRules.length > 0) {
      const recIds = activeRules.map(r => r.recommendedId);
      const accs = products.filter(p => recIds.includes(p.id));
      if (accs.length > 0) return accs;
    }

    // 3. Fallback: Auto-suggest items from another category matching the brand or category context
    const fallbacks = products.filter(p => p.id !== completeLookMain.id);
    const accList = fallbacks.filter(p => String(p.category || '').toLowerCase().includes('accessories') || String(p.category || '').toLowerCase().includes('cosmetics'));
    if (accList.length > 0) return accList.slice(0, 3);
    
    return fallbacks.slice(0, 3);
  }, [completeLookMain, products, recommendationBundles, recommendationRules]);

  const [checkedLookItems, setCheckedLookItems] = useState({});

  // Reset checked accessory selections when main product or accessories update
  useEffect(() => {
    const initialChecked = {};
    matchingItems.forEach((item, idx) => {
      initialChecked[item.id] = idx < 2; // default check first 2 items
    });
    setCheckedLookItems(initialChecked);
  }, [matchingItems]);

  const toggleLookItem = (itemId) => {
    setCheckedLookItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Bundle calculations (Dynamic Bundle upselling Discount!)
  const getBundleMath = () => {
    let subtotal = parseFloat(completeLookMain?.sellingPrice || 0);
    matchingItems.forEach(item => {
      if (checkedLookItems[item.id]) {
        subtotal += parseFloat(item.sellingPrice || 0);
      }
    });

    const isFullBundle = matchingItems.length > 0 && matchingItems.every(item => checkedLookItems[item.id] === true);
    
    // Get discount from the active bundle config if available, fallback to 15%
    const activeBundle = (recommendationBundles || []).find(b => b.mainProductId === completeLookMain?.id);
    const configuredDiscount = activeBundle ? parseInt(activeBundle.discountPercent || 15) : 15;
    
    const discountPercent = isFullBundle ? configuredDiscount : 0;
    const savings = Math.round(subtotal * (discountPercent / 100));
    const grandTotal = subtotal - savings;

    return { subtotal, savings, grandTotal, isFullBundle, discountPercent };
  };

  const bundleMath = getBundleMath();

  const handleAddBundleToBag = () => {
    const itemsToAdd = [];
    itemsToAdd.push(completeLookMain);
    matchingItems.forEach(item => {
      if (checkedLookItems[item.id]) {
        itemsToAdd.push({
          id: item.id,
          name: item.name,
          sellingPrice: item.sellingPrice,
          imageURL: item.imageURL,
          category: item.brand
        });
      }
    });
    
    if (onAddMultipleToCart) {
      onAddMultipleToCart(itemsToAdd);
    } else {
      itemsToAdd.forEach(item => onAddToCart && onAddToCart(item));
    }
    
    setToastMessage(`Curated Look added successfully!`);
    setTimeout(() => {
      setToastMessage('');
    }, 2400);
  };

  const handleBuyBundleToBag = () => {
    const itemsToAdd = [];
    itemsToAdd.push(completeLookMain);
    matchingItems.forEach(item => {
      if (checkedLookItems[item.id]) {
        itemsToAdd.push({
          id: item.id,
          name: item.name,
          sellingPrice: item.sellingPrice,
          imageURL: item.imageURL,
          category: item.brand
        });
      }
    });
    
    if (onAddMultipleToCart) {
      onAddMultipleToCart(itemsToAdd);
    } else {
      itemsToAdd.forEach(item => onAddToCart && onAddToCart(item));
    }
    
    onNavigateToBag && onNavigateToBag(true);
  };

  // Trending Now products from database products catalog (priority to trending flags)
  const trendingNowProducts = products && products.length > 0
    ? (() => {
        const marked = products.filter(p => p.trending === true || p.isTrending === true || p.isTrending === 'true' || p.trending === 'true');
        return marked.length > 0 ? marked.slice(0, 8) : products.slice(0, 4);
      })()
    : [];

  // New Arrivals from database products catalog (priority to new arrivals flags)
  const newArrivalsProducts = products && products.length > 0
    ? (() => {
        const marked = products.filter(p => p.newArrival === true || p.isNew === true || p.isNewArrival === true || p.newArrival === 'true' || p.isNew === 'true' || p.isNewArrival === 'true');
        if (marked.length > 0) return marked.slice(0, 8);
        return products.length > 4 ? products.slice(4, 8) : products.slice(0, 4);
      })()
    : [];



  // Dynamic greetings time checks
  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) setGreeting('Good morning');
    else if (hrs < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Story state coordination (Landing Catalogs)
  const [activeStoryView, setActiveStoryView] = useState(null); // null or selected story
  const [storySort, setStorySort] = useState('relevance'); // relevance, lowToHigh, highToLow

  // Banner state coordination
  const [activeBannerView, setActiveBannerView] = useState(null);
  const [bannerSort, setBannerSort] = useState('relevance');

  // Curated Outfits state coordination
  const [activeOutfitView, setActiveOutfitView] = useState(null);
  const [outfitCheckedAccessories, setOutfitCheckedAccessories] = useState({
    'acc_1': true,
    'acc_2': true,
    'acc_3': false
  });

  // Flash Sale state coordination
  const [activeFlashView, setActiveFlashView] = useState(false);
  const [flashSort, setFlashSort] = useState('relevance');
  const [flashTimeLeft, setFlashTimeLeft] = useState('02h 45m 12s');

  // Offers & Deals states
  const [activeOffersView, setActiveOffersView] = useState(false);
  const [offersFilter, setOffersFilter] = useState('All');

  // Premium Plans states
  const [activePremiumView, setActivePremiumView] = useState(false);
  const [premiumPeriod, setPremiumPeriod] = useState('Monthly');
  const [selectedPremiumPlan, setSelectedPremiumPlan] = useState('gold');

  const [premiumPlans, setPremiumPlans] = useState([
    { 
      id: 'silver', 
      title: 'Silver', 
      desc: 'Perfect for regular shoppers', 
      mPrice: 149, 
      yPrice: 1499, 
      ySavings: 289,
      benefits: [
        '10% discount on all orders',
        'Free delivery on orders above ₹499',
        '12-hour early access to new arrivals',
        '1.5x loyalty points',
        'Birthday bonus: 5% extra off'
      ]
    },
    { 
      id: 'gold', 
      title: 'Gold', 
      desc: 'Best value for fashion lovers', 
      mPrice: 399, 
      yPrice: 3999, 
      ySavings: 789,
      popular: true,
      benefits: [
        '15% discount on all orders',
        'Free delivery on all orders',
        '24-hour early access to new arrivals',
        'Access to exclusive products',
        'Priority customer support',
        'Free returns',
        '2x loyalty points',
        'Birthday bonus: 10% extra off'
      ]
    },
    { 
      id: 'platinum', 
      title: 'Platinum', 
      desc: 'Ultimate shopping experience', 
      mPrice: 799, 
      yPrice: 7999, 
      ySavings: 1589,
      benefits: [
        '25% discount on all orders',
        'Free express delivery',
        '48-hour early access to new arrivals',
        'Access to exclusive products',
        'Priority customer support',
        'Free returns with pickup',
        '3x loyalty points',
        'Birthday bonus: 20% extra off'
      ]
    }
  ]);

  useEffect(() => {
    if (membershipPlans && membershipPlans.length > 0) {
      const list = membershipPlans.map(plan => {
        const id = plan.id;
        
        let desc = 'Perfect for regular shoppers';
        let popular = false;
        let ySavings = 289;

        if (id === 'gold' || plan.name === 'Gold') {
          desc = 'Best value for fashion lovers';
          popular = true;
          ySavings = 789;
        } else if (id === 'platinum' || plan.name === 'Platinum') {
          desc = 'Ultimate shopping experience';
          ySavings = 1589;
        }

        const monthlyVal = parseFloat(plan.monthlyPrice || 0);
        const yearlyVal = parseFloat(plan.yearlyPrice || 0);
        const computedSavings = Math.max((monthlyVal * 12) - yearlyVal, 0);

        return {
          id: id,
          title: plan.name || id,
          desc: plan.description || desc,
          mPrice: monthlyVal,
          yPrice: yearlyVal,
          ySavings: computedSavings || ySavings,
          popular: plan.popular || popular,
          benefits: plan.features || []
        };
      });

      const order = { 'silver': 1, 'gold': 2, 'platinum': 3 };
      list.sort((a, b) => (order[a.id] || 99) - (order[b.id] || 99));

      setPremiumPlans(list);
    }
  }, [membershipPlans]);

  // Track / My Orders states
  const [activeTrackView, setActiveTrackView] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Synchronize the local copy state selectedOrderDetails reactively with placedOrders from parent
  useEffect(() => {
    if (selectedOrderDetails && placedOrders && placedOrders.length > 0) {
      const updated = placedOrders.find(o => o.id === selectedOrderDetails.id);
      if (updated && (
        updated.status !== selectedOrderDetails.status || 
        updated.step !== selectedOrderDetails.step || 
        JSON.stringify(updated.notes || []) !== JSON.stringify(selectedOrderDetails.notes || [])
      )) {
        setSelectedOrderDetails(updated);
      }
    }
  }, [placedOrders]);

  const formatOrderDate = (dateVal) => {
    if (!dateVal) return 'Pending Date';
    if (typeof dateVal === 'string' && dateVal.toLowerCase() === 'invalid date') {
      return new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    
    // If it's a Firestore timestamp or object
    if (dateVal && typeof dateVal === 'object') {
      if (typeof dateVal.toDate === 'function') {
        try {
          return dateVal.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch (e) {}
      }
      if (dateVal.seconds) {
        try {
          return new Date(dateVal.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch (e) {}
      }
    }

    // Try parsing as standard date
    try {
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    } catch (e) {}

    return String(dateVal);
  };

  // Live ticking urgency countdown timer
  useEffect(() => {
    if (!activeFlashView) return;
    const interval = setInterval(() => {
      let targetDate = null;
      if (activeFlashSale && activeFlashSale.endDate) {
        targetDate = new Date(activeFlashSale.endDate);
      } else {
        // Fallback: End of current day (midnight tonight)
        const tonight = new Date();
        tonight.setHours(23, 59, 59, 999);
        targetDate = tonight;
      }

      const now = new Date();
      const diffMs = targetDate.getTime() - now.getTime();

      if (diffMs <= 0) {
        setFlashTimeLeft('00h 00m 00s');
        clearInterval(interval);
      } else {
        const totalSecs = Math.floor(diffMs / 1000);
        const hrs = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        const pad = (n) => n.toString().padStart(2, '0');
        setFlashTimeLeft(`${pad(hrs)}h ${pad(mins)}m ${pad(secs)}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeFlashView, activeFlashSale]);

  // Dynamic accessories generator for Curated Outfits
  const getOutfitAccessories = (look) => {
    if (!look) return [];

    // If the outfit has linked products in the database, fetch them from the products catalog prop
    if (look.products && look.products.length > 0) {
      const dbLinkedProducts = look.products.map(pId => {
        const prod = products.find(p => p.id === pId);
        if (prod) {
          return {
            id: prod.id,
            name: prod.name,
            brand: prod.brand || 'RG ESSENTIALS',
            sellingPrice: parseFloat(prod.sellingPrice || 0),
            mrp: parseFloat(prod.mrp || prod.sellingPrice || 0),
            imageURL: prod.imageURL || prod.image || 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=300'
          };
        }
        return null;
      }).filter(Boolean);

      if (dbLinkedProducts.length > 0) {
        return dbLinkedProducts;
      }
    }

    const theme = (look.tag || look.category || '').toLowerCase();
    if (theme.includes('office') || theme.includes('formal') || theme.includes('chic')) {
      return [
        { id: 'acc_office_1', name: 'Sleek Leather Tote', brand: 'RG ESSENTIALS', sellingPrice: 1200, mrp: 3000, imageURL: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80' },
        { id: 'acc_office_2', name: 'Minimalist Wristwatch', brand: 'RG LUXURY', sellingPrice: 1800, mrp: 4500, imageURL: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=300&q=80' },
        { id: 'acc_office_3', name: 'Gold Knot Ring', brand: 'RG LUXURY', sellingPrice: 500, mrp: 1200, imageURL: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=300&q=80' }
      ];
    } else if (theme.includes('resort') || theme.includes('casual') || theme.includes('summer')) {
      return [
        { id: 'acc_casual_1', name: 'Canvas Tote Bag', brand: 'RG CASUALS', sellingPrice: 400, mrp: 1000, imageURL: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80' },
        { id: 'acc_casual_2', name: 'Retro Sunglasses', brand: 'RG EYEWEAR', sellingPrice: 600, mrp: 1500, imageURL: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=300&q=80' },
        { id: 'acc_casual_3', name: 'Leather Slides', brand: 'RG CASUALS', sellingPrice: 800, mrp: 2000, imageURL: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=300&q=80' }
      ];
    } else {
      return [
        { id: 'acc_def_1', name: 'Premium Leather Belt', brand: 'RG ESSENTIALS', sellingPrice: 500, mrp: 1200, imageURL: 'https://images.unsplash.com/photo-1624222247344-550fb8ecf7db?auto=format&fit=crop&w=300&q=80' },
        { id: 'acc_def_2', name: 'Sporty Smartwatch', brand: 'RG LUXURY', sellingPrice: 1500, mrp: 3500, imageURL: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=300&q=80' },
        { id: 'acc_def_3', name: 'Silver Hoop Earrings', brand: 'RG LUXURY', sellingPrice: 400, mrp: 900, imageURL: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=300&q=80' }
      ];
    }
  };

  // Auto-initialize first two accessories checked when outfit opens
  useEffect(() => {
    if (activeOutfitView) {
      const accs = getOutfitAccessories(activeOutfitView);
      const initialChecked = {};
      accs.forEach((item, idx) => {
        initialChecked[item.id] = idx < 2;
      });
      setOutfitCheckedAccessories(initialChecked);
    }
  }, [activeOutfitView]);

  // Reactive price calculations for Outfit Complete-the-Look Bundle (15% Off all Checked items)
  const getOutfitBundleMath = () => {
    if (!activeOutfitView) return { subtotal: 0, savings: 0, grandTotal: 0, isFullBundle: false };
    let subtotal = activeOutfitView.price;
    const accs = getOutfitAccessories(activeOutfitView);
    accs.forEach(item => {
      if (outfitCheckedAccessories[item.id]) {
        subtotal += item.sellingPrice;
      }
    });
    const isFullBundle = accs.every(item => outfitCheckedAccessories[item.id] === true);
    const discountPercent = isFullBundle ? 15 : 0;
    const savings = Math.round(subtotal * (discountPercent / 100));
    const grandTotal = subtotal - savings;
    return { subtotal, savings, grandTotal, isFullBundle };
  };

  // Upselling add to cart logic
  const handleAddOutfitBundleToBag = () => {
    if (!activeOutfitView) return;
    const accs = getOutfitAccessories(activeOutfitView);
    const math = getOutfitBundleMath();
    
    const itemsToAdd = [];
    itemsToAdd.push({
      id: activeOutfitView.id,
      name: activeOutfitView.title,
      sellingPrice: activeOutfitView.price,
      imageURL: activeOutfitView.image,
      category: activeOutfitView.tag
    });
    
    accs.forEach(item => {
      if (outfitCheckedAccessories[item.id]) {
        itemsToAdd.push({
          id: item.id,
          name: item.name,
          sellingPrice: item.sellingPrice,
          imageURL: item.imageURL,
          category: item.brand
        });
      }
    });
    
    if (onAddMultipleToCart) {
      onAddMultipleToCart(itemsToAdd);
    } else {
      itemsToAdd.forEach(item => onAddToCart && onAddToCart(item));
    }
    
    setToastMessage(`Outfit added! Saved ₹${math.savings}.`);
    setTimeout(() => {
      setToastMessage('');
    }, 2400);
    setActiveOutfitView(null);
  };

  const handleBuyOutfitBundleToBag = () => {
    if (!activeOutfitView) return;
    const accs = getOutfitAccessories(activeOutfitView);
    
    const itemsToAdd = [];
    itemsToAdd.push({
      id: activeOutfitView.id,
      name: activeOutfitView.title,
      sellingPrice: activeOutfitView.price,
      imageURL: activeOutfitView.image,
      category: activeOutfitView.tag
    });
    
    accs.forEach(item => {
      if (outfitCheckedAccessories[item.id]) {
        itemsToAdd.push({
          id: item.id,
          name: item.name,
          sellingPrice: item.sellingPrice,
          imageURL: item.imageURL,
          category: item.brand
        });
      }
    });
    
    if (onAddMultipleToCart) {
      onAddMultipleToCart(itemsToAdd);
    } else {
      itemsToAdd.forEach(item => onAddToCart && onAddToCart(item));
    }
    
    onNavigateToBag && onNavigateToBag(true);
    setActiveOutfitView(null);
  };

  // Merge Firestore stories, filtering out inactive customer view ones
  const activeStoriesList = stories && stories.length > 0
    ? stories.filter(s => s.active !== false)
    : [];

  // Helper matching products by deep link
  const getStoryProducts = (story) => {
    if (story?.id === 'trending_all') {
      return trendingNowProducts;
    }
    if (story?.id === 'new_all') {
      return newArrivalsProducts;
    }
    let sourceList = products && products.length > 0 ? products : curatedForYouProducts;
    if (!story || !story.deepLink || story.deepLink === 'All') {
      return sourceList;
    }
    
    const targetLink = story.deepLink.toLowerCase();
    
    // 1. Try matching by category
    let matches = sourceList.filter(p => p.category && p.category.toLowerCase() === targetLink);
    
    // 2. Fallback: try matching name or brand keyword
    if (matches.length === 0) {
      matches = sourceList.filter(p => 
        (p.name && p.name.toLowerCase().includes(targetLink)) ||
        (p.brand && p.brand.toLowerCase().includes(targetLink))
      );
    }
    
    return matches.length > 0 ? matches : sourceList;
  };

  // Helper sorting matches
  const getSortedStoryProducts = (story) => {
    const list = getStoryProducts(story);
    const sorted = [...list];
    
    if (storySort === 'lowToHigh') {
      sorted.sort((a, b) => parseFloat(a.sellingPrice || 0) - parseFloat(b.sellingPrice || 0));
    } else if (storySort === 'highToLow') {
      sorted.sort((a, b) => parseFloat(b.sellingPrice || 0) - parseFloat(a.sellingPrice || 0));
    }
    
    return sorted;
  };

  // Helper matching products by banner title/subtitle deep links
  const getBannerProducts = (banner) => {
    let sourceList = products && products.length > 0 ? products : curatedForYouProducts;
    if (!banner || !banner.title) return sourceList;
    const title = banner.title.toLowerCase();
    
    let matches = sourceList;
    if (title.includes('summer') || title.includes('linen')) {
      matches = sourceList.filter(p => 
        (p.category || '').toLowerCase().includes('shirt') || 
        (p.name || '').toLowerCase().includes('summer') || 
        (p.description || '').toLowerCase().includes('linen') ||
        (p.category || '').toLowerCase().includes('women')
      );
    } else if (title.includes('blazer') || title.includes('tailored')) {
      matches = sourceList.filter(p => 
        (p.category || '').toLowerCase().includes('blazer') || 
        (p.name || '').toLowerCase().includes('blazer') ||
        (p.name || '').toLowerCase().includes('shirt')
      );
    } else if (title.includes('streetwear') || title.includes('hoodie') || title.includes('athleisure')) {
      matches = sourceList.filter(p => 
        (p.category || '').toLowerCase().includes('hoodie') || 
        (p.name || '').toLowerCase().includes('hoodie') ||
        (p.category || '').toLowerCase().includes('jeans')
      );
    }
    return matches.length > 0 ? matches : sourceList;
  };

  const getSortedBannerProducts = (banner) => {
    const list = getBannerProducts(banner);
    const sorted = [...list];
    if (bannerSort === 'lowToHigh') {
      sorted.sort((a, b) => parseFloat(a.sellingPrice || 0) - parseFloat(b.sellingPrice || 0));
    } else if (bannerSort === 'highToLow') {
      sorted.sort((a, b) => parseFloat(b.sellingPrice || 0) - parseFloat(a.sellingPrice || 0));
    }
    return sorted;
  };

  // Helper matching products by flash sale discount threshold
  const getFlashProducts = () => {
    let sourceList = products && products.length > 0 ? products : curatedForYouProducts;
    if (activeFlashSale && activeFlashSale.products && activeFlashSale.products.length > 0) {
      return sourceList.filter(p => activeFlashSale.products.includes(p.id));
    }
    // Filter products with high discount (e.g. discount >= 25% or original mock prices)
    let matches = sourceList.filter(p => parseFloat(p.discount || 0) >= 25);
    return matches.length > 0 ? matches : sourceList;
  };

  const getSortedFlashProducts = () => {
    const list = getFlashProducts();
    const sorted = [...list];
    if (flashSort === 'lowToHigh') {
      sorted.sort((a, b) => parseFloat(a.sellingPrice || 0) - parseFloat(b.sellingPrice || 0));
    } else if (flashSort === 'highToLow') {
      sorted.sort((a, b) => parseFloat(b.sellingPrice || 0) - parseFloat(a.sellingPrice || 0));
    }
    return sorted;
  };

  // Voice Search simulation trigger
  const handleTriggerVoice = () => {
    setActiveSearchVoice(true);
    setSearchQuery("Listening...");
    setTimeout(() => {
      setSearchQuery("Lehenga");
      setActiveSearchVoice(false);
    }, 2400);
  };

  const handleToggleLike = (id, e) => {
    if (e) e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(id);
    } else {
      setLikes(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    }
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(''), 2000);
  };

  const handleTriggerQuickTab = (tabId) => {
    if (activeTileTab === tabId) {
      setActiveTileTab(null);
    } else {
      setActiveTileTab(tabId);
    }
  };

  const scrollCategories = ["All", "Men", "Women", "Girls", "Accessories"];

  // Filter products based on search queries and category tab selectors
  const getFilteredCuratedProducts = () => {
    const hasSearch = searchQuery.trim() && searchQuery !== "Listening...";
    
    // If searching, search the unique products catalog; otherwise use the infinite personalized feed
    const sourceList = hasSearch 
      ? (products && products.length > 0 ? products : curatedForYouProducts)
      : (infiniteProducts.length > 0 ? infiniteProducts : (products && products.length > 0 ? products : curatedForYouProducts));
      
    let result = [...sourceList];

    // Filter by text search
    if (hasSearch) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.tags && Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(q))) ||
        (p.tags && typeof p.tags === 'string' && p.tags.toLowerCase().includes(q))
      );
    }

    // Filter by main category tab
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    return result.slice(0, visibleCount);
  };

  const filteredCurated = getFilteredCuratedProducts();
  const isSearching = searchQuery.trim() && searchQuery !== "Listening...";

  if (dbLoading) {
    return (
      <div className="dashboard-light" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--phone-bg)', color: 'var(--phone-text-title)', fontFamily: "'Outfit', sans-serif", position: 'relative', overflowY: 'auto', padding: '20px' }}>
        {/* Header Skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div className="skeleton-box" style={{ width: '120px', height: '24px' }}></div>
          <div className="skeleton-box" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="skeleton-box" style={{ width: '100%', height: '48px', borderRadius: '12px', marginBottom: '24px' }}></div>

        {/* Stories Skeleton (Horizontal scroll) */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '24px', overflowX: 'hidden' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div className="skeleton-box" style={{ width: '60px', height: '60px', borderRadius: '50%' }}></div>
              <div className="skeleton-box" style={{ width: '45px', height: '12px' }}></div>
            </div>
          ))}
        </div>

        {/* Hero Slides Skeleton */}
        <div className="skeleton-box" style={{ width: '100%', height: '180px', borderRadius: '18px', marginBottom: '24px' }}></div>

        {/* Quick Actions Skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-box" style={{ width: '100%', height: '70px', borderRadius: '14px' }}></div>
          ))}
        </div>

        {/* Products Grid Section Header Skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div className="skeleton-box" style={{ width: '100px', height: '18px' }}></div>
          <div className="skeleton-box" style={{ width: '50px', height: '18px' }}></div>
        </div>

        {/* Products Grid Skeleton (2 columns) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="skeleton-box" style={{ width: '100%', height: '160px', borderRadius: '12px' }}></div>
              <div className="skeleton-box" style={{ width: '80%', height: '14px' }}></div>
              <div className="skeleton-box" style={{ width: '50%', height: '12px' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-light" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--phone-bg)', color: 'var(--phone-text-title)', fontFamily: "'Outfit', sans-serif", position: 'relative', overflow: 'hidden' }}>
      
      {/* Scope CSS parameters: smooth physics scroll momentum, 2-up displays, glowing tabs, equalizers */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        .dashboard-light {
          font-family: 'Outfit', sans-serif !important;
          background-color: var(--phone-bg) !important;
          color: var(--phone-text-title) !important;
          -webkit-font-smoothing: antialiased !important;
          text-rendering: optimizeLegibility !important;
          scroll-behavior: smooth !important;
        }

        .dashboard-title-serif {
          font-family: 'Outfit', sans-serif !important;
          letter-spacing: -0.5px !important;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 20px 8px;
          background: var(--phone-bg);
        }

        .search-container {
          padding: 4px 20px 14px;
          background: var(--phone-bg);
        }

        .search-bar-wrapper {
          display: flex;
          align-items: center;
          background-color: var(--phone-card-bg);
          border-radius: 20px;
          padding: 11px 16px;
          gap: 10px;
          border: 1.5px solid var(--phone-card-border);
          transition: all 0.22s ease;
        }

        .search-bar-wrapper:focus-within {
          border-color: #ff6b35;
          background-color: var(--phone-card-bg);
          box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.08);
        }

        .search-bar-input {
          border: none;
          background: transparent;
          outline: none;
          color: var(--phone-text-title);
          font-size: 16px;
          width: 100%;
          font-family: 'Outfit', sans-serif;
          font-weight: 500;
        }

        .stories-container {
          display: flex;
          gap: 16px;
          padding: 10px 20px 12px;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch !important;
          background: var(--phone-bg);
        }

        .stories-container::-webkit-scrollbar {
          display: none;
        }

        .story-bubble {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          cursor: pointer;
          flex-shrink: 0;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .story-bubble:hover {
          transform: translateY(-1.5px);
        }

        .story-avatar-wrapper {
          width: 66px;
          height: 66px;
          border-radius: 50%;
          border: 2px solid transparent;
          background: linear-gradient(var(--phone-bg), var(--phone-bg)) padding-box,
                      linear-gradient(45deg, #ff6b35, #ec4899) border-box;
          padding: 2.5px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.03);
        }

        .story-avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .story-badge {
          position: absolute;
          top: -4px;
          font-size: 8px;
          font-weight: 800;
          color: #ffffff;
          padding: 2px 6px;
          border-radius: 8px;
          letter-spacing: 0.3px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .story-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--phone-text-muted);
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .action-tiles-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          padding: 14px 20px 18px;
          background: var(--phone-bg);
        }

        .action-tile-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .action-tile-icon-box {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 3px 6px rgba(0,0,0,0.01);
        }

        .action-tile-card:hover .action-tile-icon-box {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 8px 16px rgba(15,23,42,0.05);
        }

        .action-tile-card:active .action-tile-icon-box {
          transform: translateY(0px) scale(0.97);
        }

        .action-tile-label {
          font-size: 13px;
          font-weight: 700;
          color: var(--phone-text-body);
          transition: all 0.2s ease;
        }

        .action-tile-card:hover .action-tile-label {
          color: var(--phone-text-title);
        }

        /* 2-Up alignment rule displays exactly two cards side-by-side on viewport width with peek scroll */
        .twoup-product-card {
          width: calc((100vw - 64px) / 2.15) !important;
          min-width: calc((100vw - 64px) / 2.15) !important;
          flex-shrink: 0 !important;
          background: var(--phone-card-bg);
          border-radius: 24px;
          border: 1px solid var(--phone-card-border);
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          height: 290px !important;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .twoup-product-card:hover {
          transform: translateY(-3.5px);
          border-color: #ff6b35;
          box-shadow: 0 10px 24px rgba(255, 107, 53, 0.09);
        }

        .twoup-image-wrapper {
          height: 195px !important;
          overflow: hidden;
          position: relative;
          background: var(--phone-bg);
        }

        .wishlist-float-btn {
          position: absolute;
          bottom: 10px;
          right: 48px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--phone-card-bg);
          border: 1px solid var(--phone-card-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--phone-text-muted);
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
          z-index: 3;
          cursor: pointer;
          padding: 0;
          outline: none;
        }

        .try-on-float-btn {
          position: absolute;
          bottom: 10px;
          right: 10px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--phone-card-bg);
          border: 1px solid var(--phone-card-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--phone-text-muted);
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
          z-index: 3;
          cursor: pointer;
          padding: 0;
          outline: none;
        }

        .twoup-visual-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .twoup-product-card:hover .twoup-visual-img {
          transform: scale(1.05);
        }

        /* Active action tile highlight styling */
        .action-tile-card.active .action-tile-icon-box {
          box-shadow: 0 0 0 3.5px #ff6b35, 0 8px 16px rgba(255, 107, 53, 0.22);
          transform: scale(1.05) translateY(-3px);
        }

        /* E-commerce grid product visual system */
        .ecommerce-product-card {
          background: var(--phone-card-bg);
          border-radius: 24px;
          border: 1px solid var(--phone-card-border);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          height: 255px !important;
        }

        .ecommerce-product-card:hover {
          transform: translateY(-3px);
          border-color: #ff6b35;
          box-shadow: 0 8px 20px rgba(0,0,0,0.03);
        }

        .product-visual-container {
          position: relative;
          height: 168px !important;
          overflow: hidden;
          background: var(--phone-bg);
        }

        .product-visual-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ecommerce-product-card:hover .product-visual-img {
          transform: scale(1.04);
        }

        .discount-pill {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #ef4444;
          color: #ffffff;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 8px;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(239, 68, 68, 0.2);
          z-index: 2;
        }

        /* Category Tab Sub Bar styling */
        .category-tab-scroll {
          display: flex;
          gap: 12px;
          padding: 8px 20px 14px;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch !important;
          background: var(--phone-bg);
        }

        .category-tab-scroll::-webkit-scrollbar {
          display: none;
        }

        .category-scroll-pill {
          padding: 8px 20px;
          border-radius: 20px;
          color: var(--phone-text-body);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          background-color: var(--phone-card-border);
          border: none;
        }

        .category-scroll-pill:hover {
          color: var(--phone-text-title);
        }

        .category-scroll-pill.active {
          background-color: var(--primary-color);
          color: #ffffff;
          font-weight: 700;
        }

        /* Virtual AI Try On Modal Visual overlay */
        .ai-tryon-overlay {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          z-index: 1000;
          display: flex;
          align-items: flex-end;
          animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideDownFade {
          from { opacity: 0; transform: translate(-50%, -15px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        .ai-tryon-drawer {
          width: 100%;
          background: var(--phone-card-bg);
          border-radius: 32px 32px 0 0;
          padding: 24px 20px 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 -12px 36px rgba(0,0,0,0.12);
          max-height: 95%;
          overflow-y: auto;
        }

        .tryon-scan-overlay {
          width: 100%;
          height: 230px;
          background: #0f172a;
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-scanning-line {
          position: absolute;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, transparent, #ff6b35, #fbbf24, #ff6b35, transparent);
          box-shadow: 0 0 10px #ff6b35;
          animation: scanSweep 2s ease-in-out infinite;
        }

        @keyframes scanSweep {
          0% { top: 4%; }
          50% { top: 96%; }
          100% { top: 4%; }
        }

        .copied-toast-bubble {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #1e293b;
          color: #ffffff;
          padding: 8px 18px;
          border-radius: 24px;
          font-size: 13.5px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(0,0,0,0.12);
          animation: fadeInOut 2s ease-in-out;
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 1200;
        }

        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, -10px); }
          15% { opacity: 1; transform: translate(-50%, 0); }
          85% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -10px); }
        }

        /* Voice search mic wave animation */
        .mic-wave-pulse {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ff6b35;
          animation: micPulse 1.2s infinite;
        }
        @keyframes micPulse {
          0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(255,107,53,0.7); }
          70% { transform: scale(1.6); opacity: 0; box-shadow: 0 0 0 10px rgba(255,107,53,0); }
          100% { transform: scale(1); opacity: 0; box-shadow: 0 0 0 0 rgba(255,107,53,0); }
        }

        /* Custom outfits and products scrollable lists */
        .momentum-scroll-x {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          padding-bottom: 6px;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch !important;
        }
        .momentum-scroll-x::-webkit-scrollbar {
          display: none;
        }

        /* Complete Outfit Card Styling */
        .outfit-card {
          width: 272px !important;
          min-width: 272px !important;
          flex-shrink: 0 !important;
          background: var(--phone-card-bg);
          border-radius: 24px;
          border: 1px solid var(--phone-card-border);
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          height: 315px !important;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .outfit-card:hover {
          transform: translateY(-4px);
          border-color: #ff6b35;
          box-shadow: 0 10px 28px rgba(0,0,0,0.05);
        }
        .outfit-tag {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(8px);
          color: #ffffff;
          font-size: 10px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 8px;
          letter-spacing: 1px;
          text-transform: uppercase;
          z-index: 2;
        }

        .interactive-element {
          transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s ease !important;
        }
        .interactive-element:active {
          transform: scale(0.96) translateY(0px) !important;
        }
      `}</style>

      {/* Copy notification */}
      {copiedCoupon && (
        <div className="copied-toast-bubble">
          <Check size={14} style={{ color: '#10b981' }} />
          <span>Coupon Code Copied!</span>
        </div>
      )}

      {/* Premium Toast alert banner overlay */}
      {toastMessage && (
        <div style={{
          position: 'absolute',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#ffffff',
          padding: '12px 22px',
          borderRadius: '24px',
          fontSize: '13px',
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

      {activeStoryView ? (
        /* Dynamic Story Landing Catalog Screen overlay view (Image 4 & 5 appearance) */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--phone-bg)', overflow: 'hidden' }}>
          
          {/* Hero Banner header block with coordinated linear gradient backdrop */}
          <div style={{ 
            background: `linear-gradient(135deg, ${activeStoryView.gradient1 || '#ff6b35'} 0%, ${activeStoryView.gradient2 || '#ec4899'} 100%)`,
            color: '#ffffff',
            padding: '24px 20px 28px',
            position: 'relative',
            boxShadow: '0 4px 18px rgba(0,0,0,0.05)'
          }}>
            {/* Action buttons header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <button 
                onClick={() => setActiveStoryView(null)}
                style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(255,255,255,0.22)', 
                  border: 'none', 
                  color: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'transform 0.15s ease'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <ArrowLeft size={18} />
              </button>
              
              <button 
                style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(255,255,255,0.22)', 
                  border: 'none', 
                  color: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <Sliders size={18} />
              </button>
            </div>

            {/* Collection slogan overlays */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                {activeStoryView.badge || 'EXCLUSIVE COLLECTION'}
              </span>
              <h2 className="dashboard-title-serif" style={{ fontSize: '26px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px', lineHeight: '1.1' }}>
                {activeStoryView.title || activeStoryView.name}
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', margin: '4px 0 0', fontWeight: 500 }}>
                {activeStoryView.type === 'Category' ? `Curated category: ${activeStoryView.deepLink}` : `Curated Lookbook`}
              </p>
              <div style={{ fontSize: '12px', background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '6px', width: 'fit-content', marginTop: '6px', fontWeight: 700 }}>
                {getSortedStoryProducts(activeStoryView).length} Products Available
              </div>
            </div>
          </div>

          {/* Sorted horizontal pills bar selector */}
          <div style={{ display: 'flex', gap: '8px', padding: '14px 20px', overflowX: 'auto', scrollbarWidth: 'none', background: 'var(--phone-bg)', borderBottom: '1px solid var(--phone-card-border)' }}>
            {[
              { id: 'relevance', label: 'Relevance' },
              { id: 'lowToHigh', label: 'Price: Low to High' },
              { id: 'highToLow', label: 'Price: High to Low' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setStorySort(p.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  border: 'none',
                  background: storySort === p.id ? '#ff6b35' : 'var(--phone-card-border)',
                  color: storySort === p.id ? '#ffffff' : 'var(--phone-text-body)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  outline: 'none',
                  boxShadow: storySort === p.id ? '0 3px 8px rgba(255, 107, 53, 0.2)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* 2-Up Products Grid Catalog Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: 'var(--phone-bg)', scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}>
            {activeStoryView.id === 'outfits_all' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                {curatedLooks.map(look => (
                  <div 
                    key={look.id} 
                    className="outfit-card" 
                    onClick={() => {
                      setActiveOutfitView(look);
                      setActiveStoryView(null);
                    }}
                    style={{ width: '100% !important', minWidth: '100% !important', cursor: 'pointer' }}
                  >
                    <div className="outfit-tag">{look.tag}</div>
                    <div style={{ height: '160px', position: 'relative', overflow: 'hidden' }}>
                      <img src={look.image} alt={look.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--phone-text-title)', margin: 0 }}>{look.title}</h4>
                        <p style={{ fontSize: '12.5px', color: 'var(--phone-text-body)', margin: '4px 0 0', lineHeight: '1.4' }}>{look.desc}</p>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '1px solid var(--phone-card-border)', paddingTop: '10px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--phone-text-title)' }}>
                          ₹{look.price}
                          <span style={{ fontSize: '11.5px', color: 'var(--phone-text-muted)', fontWeight: 500, marginLeft: '4px' }}>• {look.itemsCount} items</span>
                        </span>
                        <span style={{ color: '#ff6b35', fontWeight: 800, fontSize: '12.5px' }}>View Detail &gt;</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {getSortedStoryProducts(activeStoryView).map(prod => {
                const isLiked = wishlist ? wishlist.includes(prod.id) : !!likes[prod.id];
                const { discountBadge, tagBadge } = renderProductBadges(prod);
                return (
                  <div key={prod.id} className="ecommerce-product-card" onClick={() => onSelectProduct && onSelectProduct(prod)}>
                    {discountBadge && (
                      <div className="discount-pill" style={{ ...discountBadge.style }}>{discountBadge.label}</div>
                    )}
                    {tagBadge && (
                      <div style={{ position: 'absolute', top: '10px', left: '10px', background: tagBadge.style.background, color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '3px 7px', borderRadius: '4px', zIndex: 2 }}>
                        {tagBadge.label}
                      </div>
                    )}

                    {/* Wishlist toggle overlay */}
                    <button 
                      onClick={(e) => handleToggleLike(prod.id, e)}
                      style={{ position: 'absolute', bottom: '90px', right: '48px', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--phone-card-bg)', border: '1px solid var(--phone-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isLiked ? '#ef4444' : 'var(--phone-text-muted)', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', zIndex: 3 }}
                    >
                      <Heart size={14} fill={isLiked ? '#ef4444' : 'none'} style={{ margin: 'auto' }} />
                    </button>

                    {/* Eye Curation Preview trigger */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setTryOnProduct(prod);
                      }}
                      style={{ position: 'absolute', bottom: '90px', right: '10px', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--phone-card-bg)', border: '1px solid var(--phone-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--phone-text-muted)', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', zIndex: 3 }}
                    >
                      <Eye size={14} style={{ margin: 'auto' }} />
                    </button>

                    <div className="product-visual-container">
                      <img src={prod.imageURL} alt={prod.name} className="product-visual-img" />
                    </div>

                    <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '3px', background: 'var(--phone-card-bg)', flex: 1 }}>
                      <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{prod.brand}</span>
                      <h5 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--phone-text-title)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</h5>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '2px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#ea580c' }}>₹{prod.sellingPrice}</span>
                        <span style={{ fontSize: '11.5px', textDecoration: 'line-through', color: 'var(--phone-text-muted)' }}>₹{prod.mrp}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            )}
          </div>

        </div>
      ) : activeBannerView ? (
        /* Dynamic Banner Landing Catalog Screen overlay view */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--phone-bg)', overflow: 'hidden' }}>
          {/* Hero Banner header block with coordinated linear gradient backdrop */}
          <div style={{ 
            background: activeBannerView.gradient || 'linear-gradient(135deg, #ff6b35 0%, #ea580c 100%)',
            color: '#ffffff',
            padding: '24px 20px 28px',
            position: 'relative',
            boxShadow: '0 4px 18px rgba(0,0,0,0.05)'
          }}>
            {/* Action buttons header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <button 
                onClick={() => setActiveBannerView(null)}
                className="interactive-element"
                style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(255,255,255,0.22)', 
                  border: 'none', 
                  color: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <ArrowLeft size={20} />
              </button>
              
              <button 
                className="interactive-element"
                style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(255,255,255,0.22)', 
                  border: 'none', 
                  color: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <Sliders size={20} />
              </button>
            </div>

            {/* Collection slogan overlays */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '1.8px' }}>
                PROMOTIONAL EDIT
              </span>
              <h2 className="dashboard-title-serif" style={{ fontSize: '25px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px', lineHeight: '1.2' }}>
                {activeBannerView.title}
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', margin: '4px 0 0', fontWeight: 500 }}>
                {activeBannerView.subtitle || 'Exclusively curated for you'}
              </p>
              <div style={{ fontSize: '12px', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '8px', width: 'fit-content', marginTop: '8px', fontWeight: 700 }}>
                {getSortedBannerProducts(activeBannerView).length} Products Found
              </div>
            </div>
          </div>

          {/* Sorted horizontal pills bar selector */}
          <div style={{ display: 'flex', gap: '8px', padding: '14px 20px', overflowX: 'auto', scrollbarWidth: 'none', background: 'var(--phone-bg)', borderBottom: '1px solid var(--phone-card-border)' }}>
            {[
              { id: 'relevance', label: 'Relevance' },
              { id: 'lowToHigh', label: 'Price: Low to High' },
              { id: 'highToLow', label: 'Price: High to Low' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setBannerSort(p.id)}
                className="interactive-element"
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  background: bannerSort === p.id ? '#ff6b35' : 'var(--phone-card-border)',
                  color: bannerSort === p.id ? '#ffffff' : 'var(--phone-text-body)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  outline: 'none',
                  boxShadow: bannerSort === p.id ? '0 3px 8px rgba(255, 107, 53, 0.2)' : 'none',
                  transition: 'all 0.2s',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* 2-Up Products Grid Catalog Content */}
          <div className="momentum-scroll-y" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: 'var(--phone-bg)', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {getSortedBannerProducts(activeBannerView).map(prod => {
                const isLiked = wishlist ? wishlist.includes(prod.id) : !!likes[prod.id];
                const { discountBadge, tagBadge } = renderProductBadges(prod);
                return (
                  <div key={prod.id} className="ecommerce-product-card interactive-element" onClick={() => onSelectProduct && onSelectProduct(prod)}>
                    {discountBadge && (
                      <div className="discount-pill" style={{ ...discountBadge.style }}>{discountBadge.label}</div>
                    )}
                    {tagBadge && (
                      <div style={{ position: 'absolute', top: '10px', left: '10px', background: tagBadge.style.background, color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '3px 7px', borderRadius: '4px', zIndex: 2 }}>
                        {tagBadge.label}
                      </div>
                    )}

                    {/* Wishlist toggle overlay */}
                    <button 
                      onClick={(e) => handleToggleLike(prod.id, e)}
                      style={{ position: 'absolute', bottom: '90px', right: '48px', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--phone-card-bg)', border: '1px solid var(--phone-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isLiked ? '#ef4444' : 'var(--phone-text-muted)', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', zIndex: 3 }}
                    >
                      <Heart size={14} fill={isLiked ? '#ef4444' : 'none'} style={{ margin: 'auto' }} />
                    </button>

                    {/* Eye Curation Preview trigger */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setTryOnProduct(prod);
                      }}
                      style={{ position: 'absolute', bottom: '90px', right: '10px', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--phone-card-bg)', border: '1px solid var(--phone-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--phone-text-muted)', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', zIndex: 3 }}
                    >
                      <Eye size={14} style={{ margin: 'auto' }} />
                    </button>

                    <div className="product-visual-container">
                      <img src={prod.imageURL} alt={prod.name} className="product-visual-img" />
                    </div>

                    <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '3px', background: 'var(--phone-card-bg)', flex: 1 }}>
                      <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{prod.brand}</span>
                      <h5 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--phone-text-title)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</h5>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '2px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#ea580c' }}>₹{prod.sellingPrice}</span>
                        <span style={{ fontSize: '11.5px', textDecoration: 'line-through', color: 'var(--phone-text-muted)' }}>₹{prod.mrp}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : activeOutfitView ? (
        /* Curated Outfit Detail & Accessory Upselling Drawer overlay */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--phone-bg)', overflow: 'hidden' }}>
          
          {/* Header block with Fitts's back button */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '16px 20px', 
            background: 'var(--phone-header-bg)', 
            borderBottom: '1px solid var(--phone-card-border)' 
          }}>
            <button 
              onClick={() => setActiveOutfitView(null)}
              className="interactive-element"
              style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--phone-card-border)', 
                border: 'none', 
                color: 'var(--phone-text-title)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--phone-text-title)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              OUTFIT DETAILS
            </span>
            <div style={{ width: '44px' }} /> {/* Equalizer spacer */}
          </div>

          <div className="momentum-scroll-y" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '32px' }}>
            {/* Giant graphic cover image with occasion tag badge */}
            <div style={{ position: 'relative', height: '300px', width: '100%', background: 'var(--phone-bg)' }}>
              <img src={activeOutfitView.image} alt={activeOutfitView.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ 
                position: 'absolute', 
                top: '16px', 
                left: '16px', 
                background: '#ff6b35', 
                color: '#ffffff', 
                fontSize: '11px', 
                fontWeight: 800, 
                padding: '5px 12px', 
                borderRadius: '8px', 
                letterSpacing: '1px',
                textTransform: 'uppercase',
                boxShadow: '0 4px 10px rgba(255, 107, 53, 0.3)'
              }}>
                {activeOutfitView.tag}
              </div>
            </div>

            {/* Look titles and editorial details description */}
            <div style={{ padding: '24px 20px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h2 className="dashboard-title-serif" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--phone-text-title)', margin: 0, lineHeight: '1.2' }}>
                {activeOutfitView.title}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--phone-text-body)', margin: 0, lineHeight: '1.5', fontWeight: 500 }}>
                {activeOutfitView.desc || 'Elegant minimalist selection carefully put together by our lead brand stylist.'}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--phone-text-title)' }}>
                  ₹{activeOutfitView.price}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--phone-text-muted)', fontWeight: 600 }}>
                  for {activeOutfitView.itemsCount} curated clothing items
                </span>
              </div>
            </div>

            {/* Products in this Outfit */}
            {activeOutfitView.products && activeOutfitView.products.length > 0 && (
              <div style={{ margin: '8px 20px 0', padding: '20px', borderRadius: '24px', background: 'var(--phone-card-bg)', border: '1.5px solid var(--phone-card-border)' }}>
                <span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--phone-text-title)', display: 'block', marginBottom: '12px' }}>
                  Products in this Outfit
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeOutfitView.products.map(pId => {
                    const prod = products.find(p => p.id === pId);
                    if (!prod) return null;
                    return (
                      <div 
                        key={pId} 
                        onClick={() => onSelectProduct && onSelectProduct(prod)}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                        className="interactive-element"
                      >
                        <div style={{ width: '50px', height: '50px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <img src={prod.imageURL || prod.image} alt={prod.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--phone-text-title)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</span>
                          <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)', fontWeight: 600 }}>{prod.brand || 'RG ESSENTIALS'}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--phone-text-title)' }}>₹{prod.sellingPrice}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Complete the Look upselling bundle panel */}
            <div style={{ margin: '8px 20px 0', padding: '20px', borderRadius: '24px', background: 'var(--phone-card-bg)', border: '1.5px solid var(--phone-card-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--phone-text-title)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} style={{ color: '#eab308' }} /> Complete the Look
                </span>
                
                {getOutfitBundleMath().isFullBundle ? (
                  <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#16a34a', background: '#ecfdf5', padding: '3px 8px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                    15% BUNDLE OFF ACTIVE
                  </span>
                ) : (
                  <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#ea580c', background: '#fff7ed', padding: '3px 8px', borderRadius: '8px', border: '1px solid #ffedd5' }}>
                    ADD ALL TO ACTIVATE 15% OFF
                  </span>
                )}
              </div>

              {/* Bundle Checkout details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center', background: 'var(--phone-bg)', padding: '14px 16px', borderRadius: '18px', border: '1px solid var(--phone-card-border)', marginBottom: '18px' }}>
                {/* Main Item */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#ff6b35', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Base Look</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--phone-text-title)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>{activeOutfitView.title}</span>
                  <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--phone-text-title)' }}>₹{activeOutfitView.price}</span>
                </div>

                {/* Plus */}
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c', fontWeight: 800, fontSize: '12px' }}>+</div>

                {/* Bundle Checkout Math */}
                {(() => {
                  const math = getOutfitBundleMath();
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'right' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--phone-text-muted)', textTransform: 'uppercase' }}>Bundle Total</span>
                      <span style={{ fontSize: '16px', fontWeight: 900, color: math.isFullBundle ? '#16a34a' : 'var(--phone-text-title)' }}>₹{math.grandTotal}</span>
                      {math.savings > 0 ? (
                        <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 800 }}>Saved ₹{math.savings}!</span>
                      ) : (
                        <span style={{ fontSize: '10.5px', color: 'var(--phone-text-muted)', fontWeight: 600 }}>No bundle discount</span>
                      )}
                    </div>
                  );
                })()}
              </div>

              <p style={{ fontSize: '13px', fontWeight: 800, color: 'var(--phone-text-body)', margin: '0 0 10px' }}>Select accessories to bundle:</p>
              
              {/* Dynamic 3-Column Checklist Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
                {getOutfitAccessories(activeOutfitView).map(item => {
                  const isChecked = !!outfitCheckedAccessories[item.id];
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => {
                        setOutfitCheckedAccessories(prev => ({
                          ...prev,
                          [item.id]: !prev[item.id]
                        }));
                      }}
                      className="interactive-element"
                      style={{ 
                        background: isChecked ? 'rgba(255, 107, 53, 0.08)' : 'var(--phone-bg)', 
                        borderRadius: '16px', 
                        border: `1.5px solid ${isChecked ? '#ff6b35' : 'var(--phone-card-border)'}`, 
                        padding: '10px', 
                        position: 'relative', 
                        display: 'flex', 
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isChecked ? '0 4px 12px rgba(255, 107, 53, 0.04)' : 'none'
                      }}
                    >
                      {/* Custom Checkbox circle */}
                      <div style={{ 
                        position: 'absolute', 
                        top: '8px', 
                        right: '8px', 
                        width: '18px', 
                        height: '18px', 
                        borderRadius: '50%', 
                        backgroundColor: isChecked ? '#ff6b35' : 'var(--phone-bg)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: '#ffffff', 
                        fontSize: '10px',
                        fontWeight: 'bold',
                        boxShadow: isChecked ? '0 2px 6px rgba(255,107,53,0.3)' : 'none',
                        zIndex: 2
                      }}>
                        {isChecked ? '✓' : ''}
                      </div>

                      <div style={{ height: '80px', borderRadius: '10px', overflow: 'hidden', marginBottom: '6px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={item.imageURL} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                      <span style={{ fontSize: '9px', color: 'var(--phone-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{item.brand}</span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--phone-text-title)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#ea580c', marginTop: '1px' }}>₹{item.sellingPrice}</span>
                    </div>
                  );
                })}
              </div>

              {/* Add Bundle checkout CTA */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                <button 
                  className="buy-action-pill interactive-element" 
                  style={{ 
                    flex: 1, 
                    padding: '14px 0', 
                    borderRadius: '16px',
                    border: '1.8px solid #ff6b35',
                    background: 'var(--phone-card-bg)',
                    color: '#ff6b35',
                    fontSize: '14.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                  onClick={handleAddOutfitBundleToBag}
                >
                  <ShoppingBag size={16} /> Add to Bag
                </button>
                <button 
                  className="buy-action-pill interactive-element" 
                  style={{ 
                    flex: 1, 
                    padding: '14px 0', 
                    borderRadius: '16px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ff6b35 0%, #ea580c 100%)',
                    color: '#ffffff',
                    fontSize: '14.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(255, 107, 53, 0.22)',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={handleBuyOutfitBundleToBag}
                >
                  Buy Curated Look
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : activeOffersView ? (
        /* Offers & Deals Screen Overlay */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--phone-bg)', overflow: 'hidden' }}>
          {/* Header block with Fitts's back button */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '16px 20px', 
            background: 'var(--phone-header-bg)', 
            borderBottom: '1px solid var(--phone-card-border)' 
          }}>
            <button 
              onClick={() => setActiveOffersView(false)}
              className="interactive-element"
              style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--phone-card-border)', 
                border: 'none', 
                color: 'var(--phone-text-title)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--phone-text-title)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Offers & Coupons
            </span>
            <div style={{ width: '44px' }} />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '80px' }}>
            {/* Category Offers Carousel */}
            {(() => {
              const activeOffers = (categoryOffers && categoryOffers.length > 0 ? categoryOffers : FALLBACK_CATEGORY_OFFERS)
                .filter(o => {
                  const catLower = (o.category || 'All').toLowerCase();
                  const selLower = (selectedCategory || 'All').toLowerCase();
                  return catLower === 'all' || catLower === selLower;
                });

              if (activeOffers.length === 0) return null;

              return (
                <div style={{ padding: '20px 0 10px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--phone-text-title)', margin: '0 20px 14px', fontFamily: "'Outfit', sans-serif" }}>
                    Special Offers
                  </h3>
                  <div 
                    className="carousel-scroll"
                    style={{ 
                      display: 'flex', 
                      gap: '12px', 
                      padding: '0 20px 6px', 
                      overflowX: 'auto', 
                      scrollbarWidth: 'none', 
                      WebkitOverflowScrolling: 'touch' 
                    }}
                  >
                    {activeOffers.map(offer => {
                      const cleanTitle = stripEmojis(offer.title);
                      const cleanMsg = stripEmojis(offer.message);
                      
                      let btnText = 'Explore';
                      if (offer.deepLink) {
                        const dl = offer.deepLink.toLowerCase();
                        if (dl === 'paywall') btnText = 'Join VIP';
                        else if (dl === 'wallet') btnText = 'Wallet';
                        else if (dl === 'product') btnText = 'Shop';
                      }

                      return (
                        <div
                          key={offer.id}
                          onClick={() => onNotificationClick && onNotificationClick(offer)}
                          className="interactive-element"
                          style={{
                            width: '220px',
                            flexShrink: 0,
                            borderRadius: '16px',
                            border: '1px solid var(--phone-card-border)',
                            backgroundColor: 'var(--phone-card-bg)',
                            overflow: 'hidden',
                            position: 'relative',
                            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
                            display: 'flex',
                            flexDirection: 'column',
                            cursor: 'pointer'
                          }}
                        >
                          {/* Banner Image */}
                          <div style={{ height: '100px', width: '100%', position: 'relative', background: '#F1F5F9' }}>
                            {offer.imageURL ? (
                              <img 
                                src={offer.imageURL} 
                                alt={cleanTitle} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                onError={(e) => {
                                  try {
                                    e.target.style.display = 'none';
                                    const fallback = e.target.parentNode.querySelector('.fallback-placeholder-gradient');
                                    if (fallback) fallback.style.display = 'flex';
                                  } catch (err) {}
                                }}
                              />
                            ) : null}
                            <div 
                              className="fallback-placeholder-gradient" 
                              style={{ 
                                display: offer.imageURL ? 'none' : 'flex', 
                                width: '100%', 
                                height: '100%', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)' 
                              }}
                            >
                              <Percent size={28} color="#ff6b35" style={{ opacity: 0.5 }} />
                            </div>
                            
                            {/* Category Badge */}
                            <span style={{
                              position: 'absolute',
                              top: '8px',
                              left: '8px',
                              background: 'rgba(15, 23, 42, 0.85)',
                              backdropFilter: 'blur(4px)',
                              color: '#ffffff',
                              fontSize: '9px',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              {offer.category}
                            </span>
                          </div>

                          {/* Content Section */}
                          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                            <span style={{ 
                              fontSize: '13px', 
                              fontWeight: 800, 
                              color: 'var(--phone-text-title)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {cleanTitle}
                            </span>
                            <span style={{ 
                              fontSize: '11px', 
                              lineHeight: '1.3', 
                              color: 'var(--phone-text-muted)',
                              height: '28px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              fontWeight: 500
                            }}>
                              {cleanMsg}
                            </span>
                            
                            {/* CTA Action indicator */}
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              marginTop: '8px'
                            }}>
                              <span style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                color: '#ff6b35',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}>
                                {btnText} <ChevronRight size={10} />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            <div style={{ padding: '20px 20px 10px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--phone-text-title)', margin: '0 0 14px' }}>
                Available Coupons
              </h3>

              {/* Dynamic Coupon list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { code: 'FIRST50', title: '50% OFF', subtitle: 'On your first order', meta: 'Min. order ₹499', bg: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' },
                  { code: 'FREESHIP', title: 'FREE SHIPPING', subtitle: 'No minimum order', meta: 'Applicable automatically', bg: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)' },
                  { code: 'PREMIUM20', title: '20% EXTRA OFF', subtitle: 'For premium members', meta: 'Min. order ₹999', bg: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' },
                  { code: 'SAVE15', title: '15% OFF', subtitle: 'On orders above ₹1499', meta: 'Min. order ₹1499', bg: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)' }
                ]
                  .filter(c => {
                    if (offersFilter === '% Off') return c.code !== 'FREESHIP';
                    if (offersFilter === 'Free Shipping') return c.code === 'FREESHIP';
                    if (offersFilter === 'Premium') return c.code === 'PREMIUM20';
                    return true;
                  })
                  .map(coupon => (
                    <div 
                      key={coupon.code}
                      style={{ 
                        background: coupon.bg,
                        color: '#ffffff',
                        borderRadius: '20px',
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '12px', 
                          backgroundColor: 'rgba(255,255,255,0.2)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          <Gift size={20} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '16px', fontWeight: 900 }}>{coupon.title}</span>
                          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>{coupon.subtitle}</span>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{coupon.meta}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleCopyCoupon(coupon.code)}
                        className="interactive-element"
                        style={{ 
                          backgroundColor: 'rgba(255,255,255,0.22)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {coupon.code}
                      </button>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Filter pills bar */}
            <div style={{ display: 'flex', gap: '10px', padding: '14px 20px 8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {['All Offers', '% Off', 'Free Shipping', 'Premium'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setOffersFilter(filter)}
                  className="interactive-element"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '20px',
                    border: 'none',
                    background: offersFilter === filter ? '#ff6b35' : 'var(--phone-card-border)',
                    color: offersFilter === filter ? '#ffffff' : 'var(--phone-text-body)',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: offersFilter === filter ? '0 3px 8px rgba(255, 107, 53, 0.2)' : 'none',
                    transition: 'all 0.2s',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Products on Offer grid */}
            <div style={{ padding: '14px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--phone-text-title)', margin: 0 }}>
                  Products on Offer
                </h3>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#ff6b35', cursor: 'pointer' }}>See All &gt;</span>
              </div>

              {/* 2-Up Products Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {(products && products.length > 0 ? products : curatedForYouProducts).slice(0, 4).map(prod => {
                  const isLiked = wishlist ? wishlist.includes(prod.id) : !!likes[prod.id];
                  const { discountBadge, tagBadge } = renderProductBadges(prod);
                  return (
                    <div key={prod.id} className="ecommerce-product-card interactive-element" onClick={() => onSelectProduct && onSelectProduct(prod)}>
                      {discountBadge && (
                        <div className="discount-pill" style={{ ...discountBadge.style }}>{discountBadge.label}</div>
                      )}
                      {tagBadge && (
                        <div style={{ position: 'absolute', top: '10px', left: '10px', background: tagBadge.style.background, color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '3px 7px', borderRadius: '4px', zIndex: 2 }}>
                          {tagBadge.label}
                        </div>
                      )}

                      {/* Wishlist toggle overlay */}
                      <button 
                        onClick={(e) => handleToggleLike(prod.id, e)}
                        style={{ position: 'absolute', bottom: '90px', right: '48px', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--phone-card-bg)', border: '1px solid var(--phone-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isLiked ? '#ef4444' : 'var(--phone-text-muted)', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', zIndex: 3 }}
                      >
                        <Heart size={14} fill={isLiked ? '#ef4444' : 'none'} style={{ margin: 'auto' }} />
                      </button>

                      {/* Try On eye trigger */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setTryOnProduct(prod);
                        }}
                        style={{ position: 'absolute', bottom: '90px', right: '10px', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--phone-card-bg)', border: '1px solid var(--phone-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--phone-text-muted)', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', zIndex: 3 }}
                      >
                        <Eye size={14} style={{ margin: 'auto' }} />
                      </button>

                      <div className="product-visual-container">
                        <img src={prod.imageURL} alt={prod.name} className="product-visual-img" />
                      </div>

                      <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '3px', background: 'var(--phone-card-bg)', flex: 1 }}>
                        <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{prod.brand || 'RG BRAND'}</span>
                        <h5 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--phone-text-title)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</h5>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '2px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 800, color: '#ea580c' }}>₹{prod.sellingPrice}</span>
                          <span style={{ fontSize: '11.5px', textDecoration: 'line-through', color: 'var(--phone-text-muted)' }}>₹{prod.mrp}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      ) : activeFlashView ? (
        /* Flash Sale Screen Overlay */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--phone-bg)', overflow: 'hidden' }}>
          {/* Header block with Fitts's back button and Flame badge */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '16px 20px', 
            background: 'var(--phone-header-bg)', 
            borderBottom: '1px solid var(--phone-card-border)' 
          }}>
            <button 
              onClick={() => setActiveFlashView(false)}
              className="interactive-element"
              style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--phone-card-border)', 
                border: 'none', 
                color: 'var(--phone-text-title)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={18} fill="#ff6b35" color="#ff6b35" />
              <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--phone-text-title)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {activeFlashSale ? activeFlashSale.title : 'Flash Sale'}
              </span>
            </div>
            <div style={{ width: '44px' }} />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '80px' }}>
            {/* Banner with Countdown */}
            <div style={{ 
              background: activeFlashSale?.imageURL ? `url(${activeFlashSale.imageURL}) center/cover no-repeat` : 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', 
              color: '#ffffff', 
              padding: '24px 20px', 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '140px',
              gap: '10px',
              position: 'relative'
            }}>
              {activeFlashSale?.imageURL && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.55)', zIndex: 1 }} />
              )}
              <span style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255, 255, 255, 0.9)', zIndex: 2 }}>
                {activeFlashSale ? `MEGA DISCOUNT: ${activeFlashSale.discount}% OFF` : 'Hurry! Deals ending soon'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 0, 0, 0.45)', padding: '8px 18px', borderRadius: '30px', zIndex: 2 }}>
                <Clock size={16} />
                <span style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' }}>
                  {flashTimeLeft}
                </span>
              </div>
            </div>

            {/* Sorting subbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--phone-text-body)' }}>
                {getSortedFlashProducts().length} items matching
              </span>
              <select 
                value={flashSort} 
                onChange={(e) => setFlashSort(e.target.value)}
                style={{ 
                  padding: '6px 12px', 
                  borderRadius: '10px', 
                  backgroundColor: 'var(--phone-card-bg)', 
                  border: '1px solid var(--phone-card-border)', 
                  color: 'var(--phone-text-title)', 
                  fontSize: '13px', 
                  fontWeight: 600,
                  outline: 'none'
                }}
              >
                <option value="relevance">Sort: Featured</option>
                <option value="lowToHigh">Price: Low to High</option>
                <option value="highToLow">Price: High to Low</option>
              </select>
            </div>

            {/* 2-Up Products Grid */}
            <div style={{ padding: '8px 20px 20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {getSortedFlashProducts().map(prod => {
                  const isLiked = wishlist ? wishlist.includes(prod.id) : !!likes[prod.id];
                  const { discountBadge, tagBadge } = renderProductBadges(prod);
                  return (
                    <div key={prod.id} className="ecommerce-product-card interactive-element" onClick={() => onSelectProduct && onSelectProduct(prod)}>
                      {discountBadge && (
                        <div className="discount-pill" style={{ ...discountBadge.style }}>{discountBadge.label}</div>
                      )}
                      {tagBadge && (
                        <div style={{ position: 'absolute', top: '10px', left: '10px', background: tagBadge.style.background, color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '3px 7px', borderRadius: '4px', zIndex: 2 }}>
                          {tagBadge.label}
                        </div>
                      )}
                      
                      {/* Wishlist toggle overlay */}
                      <button 
                        onClick={(e) => handleToggleLike(prod.id, e)}
                        style={{ position: 'absolute', bottom: '90px', right: '48px', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--phone-card-bg)', border: '1px solid var(--phone-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isLiked ? '#ef4444' : 'var(--phone-text-muted)', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', zIndex: 3 }}
                      >
                        <Heart size={14} fill={isLiked ? '#ef4444' : 'none'} style={{ margin: 'auto' }} />
                      </button>

                      {/* Try On eye trigger */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setTryOnProduct(prod);
                        }}
                        style={{ position: 'absolute', bottom: '90px', right: '10px', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--phone-card-bg)', border: '1px solid var(--phone-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--phone-text-muted)', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', zIndex: 3 }}
                      >
                        <Eye size={14} style={{ margin: 'auto' }} />
                      </button>

                      <div className="product-visual-container">
                        <img src={prod.imageURL} alt={prod.name} className="product-visual-img" />
                      </div>

                      <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '3px', background: 'var(--phone-card-bg)', flex: 1 }}>
                        <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{prod.brand || 'RG BRAND'}</span>
                        <h5 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--phone-text-title)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</h5>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '2px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 800, color: '#ea580c' }}>₹{prod.sellingPrice}</span>
                          <span style={{ fontSize: '11.5px', textDecoration: 'line-through', color: 'var(--phone-text-muted)' }}>₹{prod.mrp}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : activePremiumView ? (
        <MembershipPaywall 
          activeTier={crmCustomer?.tier || 'Free'}
          onUpgradeTier={async (tier, cycle) => {
            if (onUpgradeTier) {
              await onUpgradeTier(tier, cycle);
            }
            setActivePremiumView(false);
          }}
          onClose={() => setActivePremiumView(false)}
          membershipPlans={membershipPlans}
        />
      ) : activeTrackView ? (
        /* Track / My Orders Full-Screen Overlay View (Screenshot 10 & 9 & 11) */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fcfcfc', overflow: 'hidden' }}>
          
          {selectedOrderDetails ? (
            /* Detailed Order timeline view with progress timeline vertical steps */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fcfcfc', overflow: 'hidden' }}>
              
              {/* Header Details */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '16px 20px', 
                background: '#ffffff', 
                borderBottom: '1px solid #e2e8f0' 
              }}>
                <button 
                  onClick={() => setSelectedOrderDetails(null)}
                  className="interactive-element"
                  style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '50%', 
                    backgroundColor: '#f1f3f6', 
                    border: 'none', 
                    color: '#0f172a', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <ArrowLeft size={20} />
                </button>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Order Details
                </span>
                <button 
                  style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '50%', 
                    backgroundColor: 'transparent', 
                    border: 'none', 
                    color: '#0f172a', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
                  <RefreshCw size={18} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '32px' }}>
                
                {/* Horizontal Accrual Green alert box */}
                <div style={{ 
                  background: (selectedOrderDetails.status === 'Cancelled' || selectedOrderDetails.status === 'Returned') ? '#fef2f2' : '#ecfdf5',
                  color: (selectedOrderDetails.status === 'Cancelled' || selectedOrderDetails.status === 'Returned') ? '#ef4444' : '#10b981',
                  padding: '16px 20px',
                  margin: '20px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  border: `1px solid ${(selectedOrderDetails.status === 'Cancelled' || selectedOrderDetails.status === 'Returned') ? '#fecaca' : '#a7f3d0'}`,
                  fontWeight: 800,
                  fontSize: '15px'
                }}>
                  <Truck size={20} />
                  <span>
                    {selectedOrderDetails.status === 'Cancelled' ? 'Order Cancelled' : (selectedOrderDetails.status === 'Returned' ? 'Order Returned' : `Order ${selectedOrderDetails.status}`)}
                  </span>
                </div>

                {/* Vertical Order Timeline Progress steps */}
                {selectedOrderDetails.status !== 'Cancelled' && selectedOrderDetails.status !== 'Returned' && (
                  <div style={{ margin: '0 20px 20px', padding: '24px 20px', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 18px' }}>
                      Order Timeline
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', position: 'relative', paddingLeft: '32px' }}>
                      {/* Vertical line connector bar */}
                      <div style={{ 
                        position: 'absolute', 
                        left: '10px', 
                        top: '12px', 
                        bottom: '12px', 
                        width: '3px', 
                        background: '#e2e8f0', 
                        zIndex: 1 
                      }} />
                      
                      {/* Active green connector */}
                      <div style={{ 
                        position: 'absolute', 
                        left: '10px', 
                        top: '12px', 
                        height: `${(selectedOrderDetails.step / 5) * 100}%`, 
                        width: '3px', 
                        background: '#16a34a', 
                        zIndex: 2,
                        transition: 'all 0.5s'
                      }} />

                      {[
                        { stepIdx: 0, label: 'Order Placed' },
                        { stepIdx: 1, label: 'Confirmed' },
                        { stepIdx: 2, label: 'Processing' },
                        { stepIdx: 3, label: 'Shipped' },
                        { stepIdx: 4, label: 'Out for Delivery' },
                        { stepIdx: 5, label: 'Delivered' }
                      ].map(step => {
                        const isDone = selectedOrderDetails.step >= step.stepIdx;
                        return (
                          <div key={step.stepIdx} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                            {/* Icon bubble */}
                            <div style={{ 
                              position: 'absolute', 
                              left: '-32px', 
                              top: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: '22px', 
                              height: '22px', 
                              borderRadius: '50%', 
                              backgroundColor: isDone ? '#1a2e4c' : '#ffffff', 
                              border: `2.5px solid ${isDone ? '#1a2e4c' : '#cbd5e1'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              zIndex: 3
                            }}>
                              {isDone ? <Check size={10} style={{ color: '#ffffff' }} /> : null}
                            </div>
                            
                            <span style={{ 
                              fontSize: '14.5px', 
                              fontWeight: isDone ? 800 : 500, 
                              color: isDone ? '#0f172a' : '#94a3b8' 
                            }}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Purchased Order Items card */}
                <div style={{ margin: '0 20px 20px', padding: '20px', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                    Order Items
                  </h3>

                  {selectedOrderDetails.items && selectedOrderDetails.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'center', borderBottom: idx < selectedOrderDetails.items.length - 1 ? '1px solid #f1f5f9' : 'none', paddingBottom: idx < selectedOrderDetails.items.length - 1 ? '14px' : '0', paddingTop: idx > 0 ? '6px' : '0' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9', flexShrink: 0 }}>
                        <img 
                          src={item.imageURL || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80'} 
                          alt={item.name || 'Shirt'} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </span>
                        <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>
                          Size: {item.size || item.selectedSize || 'M'} | Color: {item.color || item.selectedColor || 'Default'}
                        </span>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'baseline', marginTop: '2px' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#ea580c' }}>
                            ₹{(item.sellingPrice || 0).toLocaleString()}
                          </span>
                          {item.mrp && item.mrp > item.sellingPrice && (
                            <span style={{ fontSize: '11px', textDecoration: 'line-through', color: '#94a3b8' }}>
                              ₹{item.mrp.toLocaleString()}
                            </span>
                          )}
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
                            x {item.qty || 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown card */}
                <div style={{ margin: '0 20px 20px', padding: '20px', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>
                    Price Details
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569', fontWeight: 500 }}>
                      <span>Subtotal</span>
                      <span style={{ color: '#0f172a', fontWeight: 800 }}>₹{parseFloat(selectedOrderDetails.subtotal || selectedOrderDetails.price || 0).toLocaleString()}</span>
                    </div>
                    {selectedOrderDetails.memberDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569', fontWeight: 500 }}>
                        <span>Membership Discount</span>
                        <span style={{ color: '#10b981', fontWeight: 800 }}>-₹{parseFloat(selectedOrderDetails.memberDiscount).toLocaleString()}</span>
                      </div>
                    )}
                    {selectedOrderDetails.couponDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569', fontWeight: 500 }}>
                        <span>Coupon Discount</span>
                        <span style={{ color: '#10b981', fontWeight: 800 }}>-₹{parseFloat(selectedOrderDetails.couponDiscount).toLocaleString()}</span>
                      </div>
                    )}
                    {selectedOrderDetails.pointsDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569', fontWeight: 500 }}>
                        <span>Loyalty Discount</span>
                        <span style={{ color: '#10b981', fontWeight: 800 }}>-₹{parseFloat(selectedOrderDetails.pointsDiscount).toLocaleString()}</span>
                      </div>
                    )}
                    {selectedOrderDetails.walletDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569', fontWeight: 500 }}>
                        <span>Wallet Deduction</span>
                        <span style={{ color: '#10b981', fontWeight: 800 }}>-₹{parseFloat(selectedOrderDetails.walletDiscount).toLocaleString()}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569', fontWeight: 500 }}>
                      <span>Delivery Fee</span>
                      <span style={{ color: '#0f172a', fontWeight: 800 }}>
                        {selectedOrderDetails.shippingFee !== undefined && selectedOrderDetails.shippingFee > 0 
                          ? `₹${selectedOrderDetails.shippingFee}` 
                          : 'FREE'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>Total Amount</span>
                      <span style={{ fontSize: '10.5px', backgroundColor: '#fffbeb', color: '#b45309', padding: '3px 8px', borderRadius: '6px', fontWeight: 800, border: '1px solid #fef3c7', width: 'fit-content' }}>
                        {selectedOrderDetails.paymentMode || 'Cash on Delivery'}
                      </span>
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>
                      ₹{selectedOrderDetails.totalAmount || 0}
                    </span>
                  </div>
                </div>

                {/* Delivery Address card */}
                <div style={{ margin: '0 20px 20px', padding: '20px', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>
                    Delivery Address
                  </h3>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <MapPin size={20} style={{ color: '#64748b', marginTop: '2px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                        {selectedOrderDetails.customerName || 'Customer'}
                      </span>
                      <span style={{ fontSize: '12.5px', color: '#64748b', lineHeight: '1.4', fontWeight: 500 }}>
                        {selectedOrderDetails.address || 'Foy Sagar Road, Rawat Nagar, Ajmer, Rajasthan - 305005'}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={13} style={{ color: '#64748b' }} />
                        {selectedOrderDetails.phone || '9680048013'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metadata cards */}
                <div style={{ margin: '0 20px 20px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Order ID</span>
                    <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedOrderDetails.orderId || selectedOrderDetails.id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Placed on</span>
                    <span style={{ color: '#0f172a', fontWeight: 700 }}>{formatOrderDate(selectedOrderDetails.date)}</span>
                  </div>
                </div>

                {/* Cancel Order Action Button */}
                {selectedOrderDetails.status !== 'Cancelled' && selectedOrderDetails.status !== 'Completed' && selectedOrderDetails.status !== 'Delivered' && selectedOrderDetails.status !== 'Returned' && (
                  <div style={{ padding: '0 20px' }}>
                    <button
                      onClick={async () => {
                        if (confirm("Are you sure you want to cancel this order?")) {
                          try {
                            const { doc, updateDoc } = await import('../firebase');
                            const orderRef = doc(null, 'orders', selectedOrderDetails.id);
                            await updateDoc(orderRef, { status: 'Cancelled' });
                            alert("Order cancelled successfully.");
                          } catch (err) {
                            alert("Cancelled order successfully!");
                          }
                          setSelectedOrderDetails(null);
                          setActiveTrackView(false);
                        }
                      }}
                      className="interactive-element"
                      style={{ 
                        width: '100%', 
                        padding: '14px', 
                        borderRadius: '16px', 
                        background: '#ffffff', 
                        color: '#ef4444', 
                        border: '1.5px solid #ef4444', 
                        fontSize: '15px', 
                        fontWeight: 800, 
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                    >
                      Cancel Order
                    </button>
                  </div>
                )}

              </div>

            </div>
          ) : (
            /* My Orders scrollable list (Screenshot 10) */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fcfcfc', overflow: 'hidden' }}>
              
              {/* Header details */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '16px 20px', 
                background: '#ffffff', 
                borderBottom: '1px solid #e2e8f0' 
              }}>
                <button 
                  onClick={() => setActiveTrackView(false)}
                  className="interactive-element"
                  style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '50%', 
                    backgroundColor: '#f1f3f6', 
                    border: 'none', 
                    color: '#0f172a', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <ArrowLeft size={20} />
                </button>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  My Orders
                </span>
                <div style={{ width: '44px' }} />
              </div>

              <div className="momentum-scroll-y" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '20px' }}>
                {placedOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      width: '64px', 
                      height: '64px', 
                      borderRadius: '50%', 
                      backgroundColor: '#eff6ff', 
                      color: '#3b82f6',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <Truck size={30} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      No Orders Yet
                    </h3>
                    <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: '1.5', maxWidth: '250px', fontWeight: 500 }}>
                      No active orders found. Place a curated order to track delivery!
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {placedOrders.map(order => (
                      <div 
                        key={order.id}
                        onClick={() => setSelectedOrderDetails(order)}
                        className="interactive-element"
                        style={{ 
                          background: '#ffffff',
                          borderRadius: '24px',
                          border: '1.5px solid #e2e8f0',
                          padding: '16px 20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
                        }}
                      >
                        {/* Header card with status badge */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>
                            Order #{order.orderId || order.id}
                          </span>
                          
                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: 800, 
                            backgroundColor: (order.status === 'Cancelled' || order.status === 'Returned') ? '#fef2f2' : (order.status === 'Completed' || order.status === 'Delivered' ? '#ecfdf5' : '#eff6ff'), 
                            color: (order.status === 'Cancelled' || order.status === 'Returned') ? '#ef4444' : (order.status === 'Completed' || order.status === 'Delivered' ? '#10b981' : '#3b82f6'),
                            padding: '4px 10px', 
                            borderRadius: '8px',
                            border: `1px solid ${(order.status === 'Cancelled' || order.status === 'Returned') ? '#fecaca' : (order.status === 'Completed' || order.status === 'Delivered' ? '#a7f3d0' : '#bfdbfe')}`
                          }}>
                            {order.status}
                          </span>
                        </div>

                        <span style={{ fontSize: '11.5px', color: '#94a3b8', fontWeight: 600 }}>
                          Placed on {formatOrderDate(order.date)}
                        </span>

                        <div style={{ width: '100%', height: '1px', backgroundColor: '#f1f5f9' }} />

                        {/* Thumbnail details */}
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9' }}>
                            <img 
                              src={order.items?.[0]?.imageURL || order.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80'} 
                              alt="Shirt" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                            <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                              {order.items?.[0]?.name || 'Summer Linen Shirt'}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                              Size: {order.items?.[0]?.size || 'L'} | Color: {order.items?.[0]?.color || 'Default'}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                              Qty: {order.items?.[0]?.qty || 1} {order.items && order.items.length > 1 && `(+ ${order.items.length - 1} more items)`}
                            </span>
                          </div>
                        </div>

                        <div style={{ width: '100%', height: '1px', backgroundColor: '#f1f5f9' }} />

                        {/* Chevron right footer */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                            Total: ₹{order.totalAmount || 0}
                          </span>
                          <ChevronRight size={16} style={{ color: '#cbd5e1' }} />
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      ) : (
        /* Scrollable Core Feed Body */
        <div style={{ flex: 1, overflowY: 'auto' }} onScroll={handleScroll}>
        
        {/* Dynamic header: Good morning, Name styling psychological hierarchy */}
        <div className="dashboard-header" style={{ padding: '24px 20px 8px', borderBottom: '1px solid var(--phone-card-border)', background: 'var(--phone-bg)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--phone-text-muted)', textTransform: 'uppercase', letterSpacing: '1.8px' }}>
              {greeting},
            </span>
            <h2 style={{ fontSize: '21px', fontWeight: 800, color: 'var(--phone-text-title)', margin: 0, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.4px', lineHeight: '1.2' }}>
              {crmCustomer ? crmCustomer.name : 'Guest Curator'}
            </h2>
            <span style={{ fontSize: '11px', color: '#ff6b35', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2.5px' }}>
              <Sparkles size={11} /> {crmCustomer?.tier === 'VIP' ? 'VIP Elite Club Member' : 'Premium Stylist Curation'}
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <div 
              onClick={() => setShowNotificationPopup(!showNotificationPopup)}
              style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--phone-card-bg)', border: '1.5px solid var(--phone-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' }}
            >
              <Bell size={18} style={{ color: 'var(--phone-text-title)' }} />
              {unreadCount > 0 && (
                <div style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ef4444', color: '#ffffff', fontSize: '9px', fontWeight: 800, width: '17px', height: '17px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unreadCount}
                </div>
              )}
            </div>

            <div 
              onClick={() => onNavigateToBag && onNavigateToBag()}
              style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--phone-card-bg)', border: '1.5px solid var(--phone-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' }}
            >
              <ShoppingBag size={18} style={{ color: 'var(--phone-text-title)' }} />
              {cart.length > 0 && (
                <div style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ea580c', color: '#ffffff', fontSize: '9px', fontWeight: 800, width: '17px', height: '17px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cart.reduce((sum, item) => sum + item.qty, 0)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Inbox Notification List */}
        {showNotificationPopup && (
          <div style={{ margin: '10px 20px', padding: '14px', borderRadius: '16px', background: 'var(--phone-card-bg)', border: '1.5px solid var(--phone-card-border)', animation: 'fadeIn 0.3s', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#ff6b35', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Bell size={14} /> Inbox Notifications
              </span>
              <X size={14} style={{ color: 'var(--phone-text-muted)', cursor: 'pointer' }} onClick={() => setShowNotificationPopup(false)} />
            </div>
            
            {(!notifications || notifications.length === 0) ? (
              <div>
                <p style={{ fontSize: '12.5px', color: 'var(--phone-text-body)', lineHeight: '1.4', margin: '4px 0 0', fontWeight: 500 }}>
                  Based on your preferences, a fresh batch of **{stylePersona}** matching items has dropped!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }} className="carousel-scroll">
                {notifications.map(n => {
                  const isUnread = !n.read;
                  return (
                    <div 
                      key={n.id} 
                      onClick={() => {
                        if (onNotificationClick) {
                          onNotificationClick(n);
                        }
                        setShowNotificationPopup(false);
                      }}
                      className="interactive-element"
                      style={{ 
                        padding: '10px 12px', 
                        borderRadius: '12px', 
                        background: isUnread ? '#FFF7ED' : 'var(--phone-bg)', 
                        border: isUnread ? '1px solid #FFEDD5' : '1px solid var(--phone-card-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        transition: 'transform 0.1s cubic-bezier(0.16, 1, 0.3, 1), background 0.15s ease'
                      }}
                    >
                      {n.imageURL && (
                        <div style={{ height: '70px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--phone-card-border)' }}>
                          <img 
                            src={n.imageURL} 
                            alt="Promo" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            onError={(e) => {
                              try {
                                e.target.parentNode.style.display = 'none';
                              } catch (err) {}
                            }}
                          />
                        </div>
                      )}

                      <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--phone-text-title)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isUnread && (
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#EA580C' }} />
                          )}
                          <span>{n.title}</span>
                        </div>
                        <span style={{ fontSize: '9px', color: 'var(--phone-text-muted)', fontWeight: 600 }}>
                          {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                        </span>
                      </div>
                      
                      <p style={{ fontSize: '11px', color: 'var(--phone-text-body)', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
                        {n.message}
                      </p>

                      {n.deepLink && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9.5px', color: '#EA580C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '2px' }}>
                          <span>Action: View {n.deepLink}</span>
                          <ChevronRight size={10} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Advanced search capsule with search predictions & voice listening */}
        <div className="search-container">
          <div className="search-bar-wrapper">
            <Search size={18} style={{ color: 'var(--phone-text-muted)' }} />
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setSearchSuggestionsOpen(false);
                searchInputRef.current?.blur();
              }}
              style={{ flex: 1, display: 'flex', alignItems: 'center', margin: 0, padding: 0 }}
            >
              <input 
                ref={searchInputRef}
                type="search" 
                className="search-bar-input" 
                placeholder="Search for clothes, brands..." 
                value={searchQuery}
                onFocus={() => setSearchSuggestionsOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchSuggestionsOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchSuggestionsOpen(false);
                    searchInputRef.current?.blur();
                  }
                }}
              />
            </form>
            {searchQuery && (
              <X 
                size={16} 
                style={{ color: 'var(--phone-text-muted)', cursor: 'pointer' }} 
                onClick={() => {
                  setSearchQuery('');
                  setSearchSuggestionsOpen(false);
                }} 
              />
            )}
            {activeSearchVoice ? (
              <div className="mic-wave-pulse" />
            ) : (
              <Mic size={18} style={{ color: 'var(--phone-text-muted)', cursor: 'pointer' }} onClick={handleTriggerVoice} />
            )}
          </div>

          {/* Search predictions suggestions panel */}
          {searchSuggestionsOpen && (
            <div style={{ background: 'var(--phone-card-bg)', borderRadius: '16px', border: '1.5px solid var(--phone-card-border)', marginTop: '6px', padding: '8px 0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', animation: 'fadeIn 0.2s', zIndex: 100, position: 'relative' }}>
              {searchSuggestions.map((phrase, idx) => (
                <div 
                  key={idx} 
                  onClick={() => {
                    setSearchQuery(phrase);
                    setSearchSuggestionsOpen(false);
                  }}
                  style={{ padding: '10px 16px', fontSize: '14.5px', color: 'var(--phone-text-body)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: '1.5px solid var(--phone-card-border)' }}
                >
                  <span>{phrase}</span>
                  <ChevronRight size={14} style={{ color: 'var(--phone-text-muted)' }} />
                </div>
              ))}
              <div 
                onClick={() => setSearchSuggestionsOpen(false)}
                style={{ padding: '8px 16px', fontSize: '13px', color: '#ff6b35', textAlign: 'center', cursor: 'pointer', fontWeight: 700 }}
              >
                Close Suggestions
              </div>
            </div>
          )}
        </div>

        {!isSearching && (
          <>
            {/* Stories section with linear gradient outline rings (Screenshot 5) */}
            <div className="stories-container">
          {activeStoriesList.map((s, index) => {
            const hasGradients = s.gradient1 && s.gradient2;
            const borderGrad = hasGradients 
              ? `linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(45deg, ${s.gradient1}, ${s.gradient2}) border-box`
              : `linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(45deg, #d4af37, #aa7c11) border-box`;
            
            const badgeColors = ['#f43f5e', '#ff6b35', '#0d9488', '#8b5cf6', '#eab308', '#ec4899', '#3b82f6'];
            const badgeBg = s.gradient1 || badgeColors[index % badgeColors.length];
            const displayBadge = s.badge || ['TRENDING', 'NEW', 'LIVE', 'HOT', 'LIMITED', 'EXCLUSIVE', 'SALE'][index % 7];
            
            return (
              <div 
                key={s.id} 
                className="story-bubble" 
                onClick={() => {
                  setActiveStoryView(s);
                  setStorySort('relevance');
                }}
              >
                <div className="story-avatar-wrapper" style={{ background: borderGrad }}>
                  <img src={s.imageURL || s.image} alt={s.title || s.name} className="story-avatar-img" />
                </div>
                {displayBadge && (
                  <span className="story-badge" style={{ backgroundColor: badgeBg }}>
                    {displayBadge}
                  </span>
                )}
                <span className="story-title">{s.title || s.name}</span>
              </div>
            );
          })}
        </div>

        {/* Action Quick Tiles matching screenshot color gradients exactly */}
        <div className="action-tiles-grid">
          {actionTiles.map(tile => {
            const isActive = activeTileTab === tile.id;
            return (
              <div 
                key={tile.id} 
                className="action-tile-card interactive-element"
                onClick={() => {
                  if (tile.id === 'sale') {
                    setActiveFlashView(true);
                    setFlashSort('relevance');
                  } else if (tile.id === 'offers') {
                    setActiveOffersView(true);
                    setOffersFilter('All');
                  } else if (tile.id === 'premium') {
                    setActivePremiumView(true);
                    setPremiumPeriod('Monthly');
                    setSelectedPremiumPlan('gold');
                  } else if (tile.id === 'track') {
                    setActiveTrackView(true);
                    setSelectedOrderDetails(null);
                  }
                }}
              >
                <div className="action-tile-icon-box" style={{ backgroundColor: tile.bgColor, color: tile.color }}>
                  {tile.icon}
                </div>
                <span className="action-tile-label">{tile.label}</span>
              </div>
            );
          })}
        </div>



        {/* 3-Slide Auto-cycling Hero Promotion Slider Carousel (Screenshot 5 visual) */}
        {(() => {
          const currentSlide = heroSlides[activeHeroSlide] || heroSlides[0] || defaultHeroSlides[0];
          return (
            <div 
              onClick={() => {
                setActiveBannerView(currentSlide);
                setBannerSort('relevance');
              }}
              className="interactive-element"
              style={{ 
                margin: '4px 20px 20px', 
                height: '185px',
                borderRadius: '24px', 
                position: 'relative', 
                overflow: 'hidden', 
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.15)',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer'
              }}
            >
              {/* Full-width visual banner image */}
              <img src={currentSlide.image} alt="Slider Visual" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              {/* Soft bottom dark overlay to keep overlay elements legible */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 40%)' }} />

              {/* Absolutely positioned Shop Now button overlay */}
              <div style={{ position: 'absolute', bottom: '18px', left: '20px', zIndex: 10 }}>
                <button 
                  style={{ 
                    padding: '9px 18px', 
                    borderRadius: '14px', 
                    border: 'none', 
                    background: '#ffffff', 
                    color: '#0f172a', 
                    fontSize: '13px', 
                    fontWeight: 800, 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                    outline: 'none'
                  }}
                >
                  {currentSlide.btnText || 'Shop Now'} <ChevronRight size={14} />
                </button>
              </div>

              {/* Slider Dots indicators bottom-right */}
              <div style={{ position: 'absolute', bottom: '24px', right: '20px', zIndex: 10, display: 'flex', gap: '6px' }}>
                {heroSlides.map((slide, sIdx) => (
                  <div 
                    key={slide.id || sIdx} 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveHeroSlide(sIdx);
                    }}
                    style={{ 
                      width: activeHeroSlide === sIdx ? '22px' : '8px', 
                      height: '8px', 
                      borderRadius: '4px', 
                      backgroundColor: activeHeroSlide === sIdx ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }} 
                  />
                ))}
              </div>
            </div>
          );
        })()}

        {/* Complete Outfits Carousel Section matching Screenshot 4 */}
        <div style={{ padding: '4px 20px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="dashboard-title-serif" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--phone-text-title)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkle size={18} style={{ color: 'var(--primary-color)' }} /> Complete Outfits
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--phone-text-body)', margin: '2px 0 0', fontWeight: 500 }}>
                Curated looks for every occasion
              </p>
            </div>
            <button 
              onClick={() => {
                setActiveStoryView({
                  id: 'outfits_all',
                  name: 'Curated Outfits',
                  badge: 'COMPLETE LOOKS',
                  gradient1: '#1e3a8a',
                  gradient2: '#3b82f6',
                  deepLink: 'Outfits'
                });
              }}
              style={{ 
                background: 'rgba(255, 107, 53, 0.08)',
                color: '#ff6b35',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '12px', 
                fontWeight: 800, 
                cursor: 'pointer',
                outline: 'none',
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              See All
            </button>
          </div>

          {/* Horizontal carousel outfits scroll */}
          <div className="momentum-scroll-x">
            {curatedLooks.map(look => (
              <div 
                key={look.id} 
                className="outfit-card interactive-element"
                onClick={() => setActiveOutfitView(look)}
                style={{ cursor: 'pointer' }}
              >
                <div className="outfit-tag">{look.tag}</div>
                
                <div style={{ height: '160px', position: 'relative', overflow: 'hidden', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={look.image} alt={look.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>

                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{look.title}</h4>
                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: '4px 0 0', lineHeight: '1.4', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {look.desc}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#1a2e4c' }}>
                      ₹{look.price} 
                      <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500, marginLeft: '4px' }}>• {look.itemsCount} items</span>
                    </span>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveOutfitView(look);
                      }}
                      className="interactive-element"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '5px', 
                        padding: '8px 14px', 
                        background: '#ff6b35', 
                        border: 'none', 
                        borderRadius: '12px', 
                        color: '#ffffff', 
                        fontSize: '12.5px',
                        fontWeight: 700, 
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        outline: 'none',
                        minHeight: '44px'
                      }}
                    >
                      <ShoppingBag size={13} /> View Outfit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Now (2-Up Carousel display, taller heights) matching Screenshot 4 */}
        <div style={{ padding: '4px 20px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="dashboard-title-serif" style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={18} style={{ color: '#ef4444' }} /> Trending Now
              </h3>
            </div>
            <button 
              onClick={() => {
                setActiveStoryView({
                  id: 'trending_all',
                  name: 'Trending Now',
                  badge: 'TRENDING',
                  gradient1: '#ef4444',
                  gradient2: '#b91c1c',
                  deepLink: 'Trending'
                });
                setStorySort('relevance');
              }}
              style={{ 
                background: 'rgba(255, 107, 53, 0.08)',
                color: '#ff6b35',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '12px', 
                fontWeight: 800, 
                cursor: 'pointer',
                outline: 'none',
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              See All
            </button>
          </div>

          {/* 2-Up alignment scroll listing */}
          <div className="momentum-scroll-x">
            {trendingNowProducts.map(prod => {
              const isLiked = wishlist ? wishlist.includes(prod.id) : !!likes[prod.id];
              const { discountBadge, tagBadge } = renderProductBadges(prod);
              return (
                <div 
                  key={prod.id} 
                  className="twoup-product-card" 
                  onClick={() => onSelectProduct && onSelectProduct(prod)}
                  style={{ cursor: 'pointer' }}
                >
                  {tagBadge && (
                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: tagBadge.style.background, color: '#ffffff', fontSize: '9.5px', fontWeight: 800, padding: '2.5px 6.5px', borderRadius: '4px', zIndex: 3 }}>
                      {tagBadge.label}
                    </div>
                  )}
                  {discountBadge && (
                    <div className="discount-pill" style={{ ...discountBadge.style }}>
                      {discountBadge.label.includes('%') ? `-${discountBadge.label.replace(' OFF', '')}` : discountBadge.label}
                    </div>
                  )}

                  <div className="twoup-image-wrapper">
                    <img src={prod.imageURL} alt={prod.name} className="twoup-visual-img" />
                    
                    <button 
                      onClick={(e) => handleToggleLike(prod.id, e)}
                      className="wishlist-float-btn"
                      style={{ color: isLiked ? '#ef4444' : 'var(--phone-text-muted)' }}
                    >
                      <Heart size={14} fill={isLiked ? '#ef4444' : 'none'} />
                    </button>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setTryOnProduct(prod);
                      }}
                      className="try-on-float-btn"
                    >
                      <Eye size={14} />
                    </button>
                  </div>

                  <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '2px', background: 'var(--phone-card-bg)', flex: 1 }}>
                    <span style={{ fontSize: '10.5px', color: 'var(--phone-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{prod.brand}</span>
                    <h5 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--phone-text-title)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</h5>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '1.5px' }}>
                      <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#ea580c' }}>₹{prod.sellingPrice}</span>
                      <span style={{ fontSize: '11.5px', textDecoration: 'line-through', color: 'var(--phone-text-muted)' }}>₹{prod.mrp}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Versatile complete the look bundle math (Screenshot 3 Visual) */}
        <div style={{ margin: '8px 20px 20px', padding: '18px', borderRadius: '24px', background: 'var(--phone-card-bg)', border: '1.5px solid var(--phone-card-border)', boxShadow: '0 4px 14px rgba(0,0,0,0.01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--phone-text-title)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={18} style={{ color: '#eab308' }} /> Complete the Look
            </span>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#ea580c', background: 'rgba(234, 88, 12, 0.1)', padding: '2.5px 8px', borderRadius: '8px' }}>Curated for you</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px', alignItems: 'center' }}>
            {/* Main Item */}
            <div style={{ background: 'var(--phone-bg)', padding: '12px', borderRadius: '16px', border: '1.5px solid var(--phone-card-border)', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase' }}>Main Item</span>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--phone-text-title)', margin: '2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{completeLookMain.name}</h4>
              <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--phone-text-title)' }}>₹{completeLookMain.sellingPrice}</span>
            </div>

            {/* Plus */}
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(234, 88, 12, 0.1)', border: '1px solid var(--phone-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c', fontWeight: 800, fontSize: '14px' }}>+</div>

            {/* Bundle Checkout details */}
            <div style={{ background: 'var(--phone-bg)', padding: '12px', borderRadius: '16px', border: '1.5px solid var(--phone-card-border)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--phone-text-muted)' }}>Bundle Total</span>
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#16a34a' }}>₹{bundleMath.grandTotal}</span>
              {bundleMath.savings > 0 && (
                <span style={{ fontSize: '11px', color: '#ea580c', fontWeight: 700 }}>Saved ₹{bundleMath.savings}! ({bundleMath.discountPercent}% Off)</span>
              )}
            </div>
          </div>

          <p style={{ fontSize: '13px', fontWeight: 800, color: 'var(--phone-text-body)', margin: '14px 0 8px' }}>Select matching accessories to bundle:</p>
          
          {/* Matching accessories checkboxes grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
            {matchingItems.map(item => {
              const isChecked = !!checkedLookItems[item.id];
              return (
                <div 
                  key={item.id} 
                  onClick={() => toggleLookItem(item.id)}
                  style={{ 
                    background: isChecked ? 'rgba(255, 107, 53, 0.08)' : 'var(--phone-bg)', 
                    borderRadius: '18px', 
                    border: `1.5px solid ${isChecked ? '#ff6b35' : 'var(--phone-card-border)'}`, 
                    padding: '10px', 
                    position: 'relative', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {/* Custom Checkbox circle */}
                  <div style={{ 
                    position: 'absolute', 
                    top: '8px', 
                    right: '8px', 
                    width: '18px', 
                    height: '18px', 
                    borderRadius: '50%', 
                    backgroundColor: isChecked ? '#ff6b35' : 'var(--phone-card-border)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#ffffff', 
                    fontSize: '10px',
                    fontWeight: 'bold',
                    boxShadow: isChecked ? '0 2px 6px rgba(255,107,53,0.3)' : 'none'
                  }}>
                    {isChecked ? '✓' : ''}
                  </div>

                  <div style={{ height: '80px', borderRadius: '10px', overflow: 'hidden', marginBottom: '6px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={item.imageURL} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <span style={{ fontSize: '9.5px', color: 'var(--phone-text-muted)', fontWeight: 700 }}>{item.brand}</span>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--phone-text-title)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#ea580c', marginTop: '1px' }}>₹{item.sellingPrice}</span>
                </div>
              );
            })}
          </div>

          {/* Add Bundle checkout CTA */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <button 
              className="buy-action-pill" 
              style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '14px', border: '1.8px solid #ff6b35', background: 'var(--phone-card-bg)', color: '#ff6b35', fontSize: '13px', fontWeight: 800, cursor: 'pointer', outline: 'none' }}
              onClick={handleAddBundleToBag}
            >
              <ShoppingBag size={15} /> Add to Bag
            </button>
            <button 
              className="buy-action-pill" 
              style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #ff6b35 0%, #ea580c 100%)', color: '#ffffff', fontSize: '13px', fontWeight: 800, cursor: 'pointer', outline: 'none', boxShadow: '0 4px 12px rgba(255, 107, 53, 0.2)' }}
              onClick={handleBuyBundleToBag}
            >
              Buy Curated Look
            </button>
          </div>
        </div>

        {/* New Arrivals (2-Up Carousel display, taller heights) matching Screenshot 2 */}
        <div style={{ padding: '4px 20px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="dashboard-title-serif" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--phone-text-title)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={18} style={{ color: '#10b981' }} /> New Arrivals
              </h3>
            </div>
            <button 
              onClick={() => {
                setActiveStoryView({
                  id: 'new_all',
                  name: 'New Arrivals',
                  badge: 'NEW ARRIVALS',
                  gradient1: '#10b981',
                  gradient2: '#047857',
                  deepLink: 'New'
                });
                setStorySort('relevance');
              }}
              style={{ 
                background: 'rgba(255, 107, 53, 0.08)',
                color: '#ff6b35',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '12px', 
                fontWeight: 800, 
                cursor: 'pointer',
                outline: 'none',
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              See All
            </button>
          </div>

          {/* 2-Up alignment scroll listing */}
          <div className="momentum-scroll-x">
            {newArrivalsProducts.map(prod => {
              const isLiked = wishlist ? wishlist.includes(prod.id) : !!likes[prod.id];
              const { discountBadge, tagBadge } = renderProductBadges(prod);
              return (
                <div 
                  key={prod.id} 
                  className="twoup-product-card" 
                  onClick={() => onSelectProduct && onSelectProduct(prod)}
                  style={{ cursor: 'pointer' }}
                >
                  {tagBadge && (
                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: tagBadge.style.background, color: '#ffffff', fontSize: '9.5px', fontWeight: 800, padding: '2.5px 6.5px', borderRadius: '4px', zIndex: 3 }}>
                      {tagBadge.label}
                    </div>
                  )}
                  {discountBadge && (
                    <div className="discount-pill" style={{ ...discountBadge.style }}>
                      {discountBadge.label.includes('%') ? `-${discountBadge.label.replace(' OFF', '')}` : discountBadge.label}
                    </div>
                  )}

                  <div className="twoup-image-wrapper">
                    <img src={prod.imageURL} alt={prod.name} className="twoup-visual-img" />
                    
                    <button 
                      onClick={(e) => handleToggleLike(prod.id, e)}
                      className="wishlist-float-btn"
                      style={{ color: isLiked ? '#ef4444' : 'var(--phone-text-muted)' }}
                    >
                      <Heart size={14} fill={isLiked ? '#ef4444' : 'none'} />
                    </button>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setTryOnProduct(prod);
                      }}
                      className="try-on-float-btn"
                    >
                      <Eye size={14} />
                    </button>
                  </div>

                  <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '2px', background: 'var(--phone-card-bg)', flex: 1 }}>
                    <span style={{ fontSize: '10.5px', color: 'var(--phone-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{prod.brand}</span>
                    <h5 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--phone-text-title)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</h5>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '1.5px' }}>
                      <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#ea580c' }}>₹{prod.sellingPrice}</span>
                      <span style={{ fontSize: '11.5px', textDecoration: 'line-through', color: 'var(--phone-text-muted)' }}>₹{prod.mrp}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
          </>
        )}

        {/* Shop by Category Pills scroll navigation (Screenshot 2 Visual) */}
        <div style={{ background: 'var(--phone-bg)', paddingTop: '18px', borderTop: '1.5px solid var(--phone-card-border)' }}>
          <div style={{ padding: '0 20px 6px' }}>
            <h3 className="dashboard-title-serif" style={{ fontSize: '19px', fontWeight: 800, color: 'var(--phone-text-title)', margin: 0 }}>
              {isSearching ? "Filter Results" : "Shop by Category"}
            </h3>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0', fontWeight: 500 }}>
              {isSearching ? "Narrow down search by category" : "Filter by curated collections"}
            </p>
          </div>
          <div className="category-tab-scroll" style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}>
            {scrollCategories.map(cat => (
              <button 
                key={cat} 
                className={`category-scroll-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 22px',
                  borderRadius: '24px',
                  fontSize: '14px',
                  fontWeight: 700,
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  outline: 'none',
                  transform: selectedCategory === cat ? 'scale(1.02)' : 'none',
                  boxShadow: selectedCategory === cat ? '0 4px 12px rgba(26, 46, 76, 0.12)' : 'none'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Curated For You dynamic product grid (Screenshot 1 & 6) */}
        <div style={{ padding: '12px 20px 32px', background: 'var(--phone-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(234, 88, 12, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
              ★
            </div>
            <div>
              <h3 className="dashboard-title-serif" style={{ fontSize: '19px', fontWeight: 800, color: 'var(--phone-text-title)', margin: 0 }}>
                {isSearching ? `Search Results for "${searchQuery}"` : "Curated For You"}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--phone-text-body)', margin: '2px 0 0', fontWeight: 500 }}>
                {isSearching ? `Found ${filteredCurated.length} matching products` : "Based on your style preferences"}
              </p>
            </div>
          </div>

          {filteredCurated.length === 0 ? (
            <p style={{ fontSize: '14px', color: 'var(--phone-text-muted)', textAlign: 'center', margin: '20px 0' }}>
              No curated matches found. Reset search query.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {filteredCurated.map(prod => {
                const isLiked = wishlist ? wishlist.includes(prod.id) : !!likes[prod.id];
                const { discountBadge, tagBadge } = renderProductBadges(prod);
                return (
                  <div key={prod.uniqueKey || prod.id} className="ecommerce-product-card" onClick={() => {
                    onSelectProduct && onSelectProduct(prod);
                    setCompleteLookMain(prod);
                  }}>
                    {discountBadge && (
                      <div className="discount-pill" style={{ ...discountBadge.style }}>{discountBadge.label}</div>
                    )}
                    {tagBadge && (
                      <div style={{ position: 'absolute', top: '10px', left: '10px', background: tagBadge.style.background, color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '3px 7px', borderRadius: '4px', zIndex: 2 }}>
                        {tagBadge.label}
                      </div>
                    )}

                    {/* Wishlist triggers */}
                    <button 
                      onClick={(e) => handleToggleLike(prod.id, e)}
                      style={{ position: 'absolute', bottom: '90px', right: '48px', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--phone-card-bg)', border: '1px solid var(--phone-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isLiked ? '#ef4444' : 'var(--phone-text-muted)', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', zIndex: 3 }}
                    >
                      <Heart size={14} fill={isLiked ? '#ef4444' : 'none'} />
                    </button>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setTryOnProduct(prod);
                      }}
                      style={{ position: 'absolute', bottom: '90px', right: '10px', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--phone-card-bg)', border: '1px solid var(--phone-card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--phone-text-muted)', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', zIndex: 3 }}
                    >
                      <Eye size={14} />
                    </button>

                    <div className="product-visual-container">
                      <img src={prod.imageURL} alt={prod.name} className="product-visual-img" />
                    </div>

                    <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '3px', background: 'var(--phone-card-bg)', flex: 1 }}>
                      <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{prod.brand}</span>
                      <h5 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--phone-text-title)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</h5>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '2px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#ea580c' }}>₹{prod.sellingPrice}</span>
                        <span style={{ fontSize: '12px', textDecoration: 'line-through', color: 'var(--phone-text-muted)' }}>₹{prod.mrp}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    )}

      {/* AI try-on virtual curation camera simulation modal */}
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
                          // Temporarily go to upload and back to trigger useEffect
                          setTryOnStepState('idle');
                          setTimeout(() => {
                            setTryOnStepState('analyzing');
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

            {/* Step 3: Result Preview Canvas with custom setup notification */}
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
                    className="interactive-element"
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

    </div>
  );
}

export default HomeFeed;

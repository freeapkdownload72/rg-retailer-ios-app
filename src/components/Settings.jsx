import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Volume2, 
  Smartphone, 
  Lock, 
  Shield, 
  EyeOff, 
  Trash2, 
  LogOut, 
  ChevronRight, 
  Moon, 
  Globe, 
  Bell, 
  Mail, 
  MessageSquare,
  Package,
  Percent,
  TrendingDown,
  Info,
  Check,
  ShieldCheck,
  X,
  FileText
} from 'lucide-react';

function Settings({ 
  customer,
  onUpdateCustomerSettings,
  onSignOut,
  onDeleteAccount,
  onClearCache,
  onClose,
  legalPolicies
}) {
  // Settings States loaded dynamically from customer settings or LocalStorage
  const getInitialSetting = (field, localKey, defaultVal) => {
    if (customer?.settings?.[field] !== undefined) {
      return customer.settings[field];
    }
    const local = localStorage.getItem(localKey);
    if (local === 'true') return true;
    if (local === 'false') return false;
    return defaultVal;
  };

  const [soundEffects, setSoundEffects] = useState(() => getInitialSetting('soundEffects', 'rg_settings_sound', true));
  const [hapticFeedback, setHapticFeedback] = useState(() => getInitialSetting('hapticFeedback', 'rg_settings_haptic', true));
  const [darkMode, setDarkMode] = useState(() => getInitialSetting('darkMode', 'rg_settings_dark', false));
  const [language, setLanguage] = useState(() => customer?.settings?.language || localStorage.getItem('rg_settings_lang') || 'English (India)');

  // Notification States
  const [pushNotifications, setPushNotifications] = useState(() => getInitialSetting('pushNotifications', 'rg_settings_push', true));
  const [emailNotifications, setEmailNotifications] = useState(() => getInitialSetting('emailNotifications', 'rg_settings_email', true));
  const [smsNotifications, setSmsNotifications] = useState(() => getInitialSetting('smsNotifications', 'rg_settings_sms', false));

  // Notification Preferences
  const [orderUpdates, setOrderUpdates] = useState(() => getInitialSetting('orderUpdates', 'rg_settings_order', true));
  const [promoOffers, setPromoOffers] = useState(() => getInitialSetting('promoOffers', 'rg_settings_promo', true));
  const [priceDrops, setPriceDrops] = useState(() => getInitialSetting('priceDrops', 'rg_settings_price', true));

  // Privacy & Security States
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => getInitialSetting('twoFactorEnabled', 'rg_settings_2fa', false));
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState(() => getInitialSetting('personalizedRecommendations', 'rg_settings_recs', true));
  const [diagnosticCollection, setDiagnosticCollection] = useState(() => getInitialSetting('diagnosticCollection', 'rg_settings_diagnostics', true));

  // Subview overlays
  const [activeOverlay, setActiveOverlay] = useState(null); // null, 'language', 'twofactor', 'privacy', 'password_info', 'legal'
  const [legalTab, setLegalTab] = useState('privacy'); // 'privacy', 'terms', 'refund'

  // Sound Synthesizer Utility (Web Audio API)
  const playLocalSound = (override = false) => {
    const isSoundOn = override || localStorage.getItem('rg_settings_sound') !== 'false';
    if (!isSoundOn) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime); // high pitch
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime); // subtle volume
      gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.08); // fade out
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
      console.warn("Audio Context blocked:", e);
    }
  };

  // Local Haptic pulse Vibrate API
  const triggerLocalHaptic = (override = false) => {
    const isHapticOn = override || localStorage.getItem('rg_settings_haptic') !== 'false';
    if (!isHapticOn) return;
    if (navigator.vibrate) {
      navigator.vibrate(15); // short 15ms pulse
    }
  };

  // Safe action callbacks to update LocalStorage + Cloud DB
  const handleSettingChange = (setter, field, localKey, val) => {
    setter(val);
    localStorage.setItem(localKey, String(val));
    if (onUpdateCustomerSettings) {
      onUpdateCustomerSettings(field, val);
    }
    triggerLocalHaptic();
    playLocalSound();
  };

  const handleSoundToggle = (val) => {
    setSoundEffects(val);
    localStorage.setItem('rg_settings_sound', String(val));
    if (onUpdateCustomerSettings) {
      onUpdateCustomerSettings('soundEffects', val);
    }
    if (val) {
      playLocalSound(true);
    }
    triggerLocalHaptic();
  };

  const handleHapticToggle = (val) => {
    setHapticFeedback(val);
    localStorage.setItem('rg_settings_haptic', String(val));
    if (onUpdateCustomerSettings) {
      onUpdateCustomerSettings('hapticFeedback', val);
    }
    if (val) {
      triggerLocalHaptic(true);
    }
    playLocalSound();
  };

  const handleDarkModeToggle = (val) => {
    setDarkMode(val);
    localStorage.setItem('rg_settings_dark', String(val));
    if (onUpdateCustomerSettings) {
      onUpdateCustomerSettings('darkMode', val);
    }
    triggerLocalHaptic();
    playLocalSound();

    if (val) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const selectLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('rg_settings_lang', lang);
    if (onUpdateCustomerSettings) {
      onUpdateCustomerSettings('language', lang);
    }
    triggerLocalHaptic();
    playLocalSound();
    setActiveOverlay(null);
  };

  const handleClearCacheClick = () => {
    triggerLocalHaptic();
    playLocalSound();
    onClearCache();
  };

  const handleSignOutClick = () => {
    triggerLocalHaptic();
    playLocalSound();
    const confirm = window.confirm("Are you sure you want to sign out?");
    if (confirm) onSignOut();
  };

  const handleDeleteAccountClick = () => {
    triggerLocalHaptic();
    playLocalSound();
    const confirm = window.confirm("WARNING: This will permanently delete your account and all associated order history. This action CANNOT be undone. Are you sure you want to proceed?");
    if (confirm) onDeleteAccount();
  };

  const languages = ['English (India)', 'English (US)', 'Hindi (India)', 'Marathi (India)', 'Gujarati (India)', 'Tamil (India)'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--phone-bg)', color: 'var(--phone-text-title)', animation: 'fadeIn 0.3s ease', position: 'relative' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', borderBottom: '1px solid var(--phone-card-border)', background: 'var(--phone-header-bg)', zIndex: 10 }}>
        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--phone-text-title)', padding: '4px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <ArrowLeft size={22} />
        </button>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--phone-text-title)', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.3px', margin: 0 }}>
          Settings
        </h2>
      </div>

      {/* Settings Options Scroll Container */}
      <div className="carousel-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px', WebkitOverflowScrolling: 'touch' }}>
        
        {/* NOTIFICATIONS GROUP */}
        <div>
          <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--phone-text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', paddingLeft: '8px', display: 'block', marginBottom: '8px' }}>
            Notifications
          </span>
          <div style={{ background: 'var(--phone-card-bg)', borderRadius: '16px', border: '1px solid var(--phone-card-border)', overflow: 'hidden' }}>
            {/* Push notifications */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--phone-card-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: 'var(--phone-text-body)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bell size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--phone-text-title)' }}>Push Notifications</span>
                  <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)' }}>Receive notifications on your device</span>
                </div>
              </div>
              <label className="switch">
                <input type="checkbox" checked={pushNotifications} onChange={(e) => handleSettingChange(setPushNotifications, 'pushNotifications', 'rg_settings_push', e.target.checked)} />
                <span className="slider round"></span>
              </label>
            </div>

            {/* Email notifications */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--phone-card-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: 'var(--phone-text-body)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--phone-text-title)' }}>Email Notifications</span>
                  <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)' }}>Receive updates via email</span>
                </div>
              </div>
              <label className="switch">
                <input type="checkbox" checked={emailNotifications} onChange={(e) => handleSettingChange(setEmailNotifications, 'emailNotifications', 'rg_settings_email', e.target.checked)} />
                <span className="slider round"></span>
              </label>
            </div>

            {/* SMS notifications */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: 'var(--phone-text-body)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--phone-text-title)' }}>SMS Notifications</span>
                  <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)' }}>Receive SMS alerts</span>
                </div>
              </div>
              <label className="switch">
                <input type="checkbox" checked={smsNotifications} onChange={(e) => handleSettingChange(setSmsNotifications, 'smsNotifications', 'rg_settings_sms', e.target.checked)} />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>

        {/* NOTIFICATION PREFERENCES GROUP */}
        <div>
          <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--phone-text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', paddingLeft: '8px', display: 'block', marginBottom: '8px' }}>
            Notification Preferences
          </span>
          <div style={{ background: 'var(--phone-card-bg)', borderRadius: '16px', border: '1px solid var(--phone-card-border)', overflow: 'hidden' }}>
            {/* Order Updates */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--phone-card-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: 'var(--phone-text-body)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--phone-text-title)' }}>Order Updates</span>
                  <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)' }}>Shipping and delivery updates</span>
                </div>
              </div>
              <label className="switch">
                <input type="checkbox" checked={orderUpdates} onChange={(e) => handleSettingChange(setOrderUpdates, 'orderUpdates', 'rg_settings_order', e.target.checked)} />
                <span className="slider round"></span>
              </label>
            </div>

            {/* Promotions & Offers */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--phone-card-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: 'var(--phone-text-body)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Percent size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--phone-text-title)' }}>Promotions & Offers</span>
                  <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)' }}>Sales, discounts and special offers</span>
                </div>
              </div>
              <label className="switch">
                <input type="checkbox" checked={promoOffers} onChange={(e) => handleSettingChange(setPromoOffers, 'promoOffers', 'rg_settings_promo', e.target.checked)} />
                <span className="slider round"></span>
              </label>
            </div>

            {/* Price Drops */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: 'var(--phone-text-body)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingDown size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--phone-text-title)' }}>Price Drops</span>
                  <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)' }}>Alerts when wishlist items go on sale</span>
                </div>
              </div>
              <label className="switch">
                <input type="checkbox" checked={priceDrops} onChange={(e) => handleSettingChange(setPriceDrops, 'priceDrops', 'rg_settings_price', e.target.checked)} />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>

        {/* APPEARANCE GROUP */}
        <div>
          <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--phone-text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', paddingLeft: '8px', display: 'block', marginBottom: '8px' }}>
            Appearance
          </span>
          <div style={{ background: 'var(--phone-card-bg)', borderRadius: '16px', border: '1px solid var(--phone-card-border)', overflow: 'hidden' }}>
            {/* Dark Mode */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--phone-card-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: 'var(--phone-text-body)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Moon size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--phone-text-title)' }}>Dark Mode</span>
                  <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)' }}>Use dark theme</span>
                </div>
              </div>
              <label className="switch">
                <input type="checkbox" checked={darkMode} onChange={(e) => handleDarkModeToggle(e.target.checked)} />
                <span className="slider round"></span>
              </label>
            </div>

            {/* Language */}
            <div 
              onClick={() => { triggerLocalHaptic(); playLocalSound(); setActiveOverlay('language'); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: 'var(--phone-text-body)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--phone-text-title)' }}>Language</span>
                  <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)' }}>{language}</span>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--phone-text-muted)' }} />
            </div>
          </div>
        </div>

        {/* SOUND & HAPTICS GROUP */}
        <div>
          <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--phone-text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', paddingLeft: '8px', display: 'block', marginBottom: '8px' }}>
            Sound & Haptics
          </span>
          <div style={{ background: 'var(--phone-card-bg)', borderRadius: '16px', border: '1px solid var(--phone-card-border)', overflow: 'hidden' }}>
            {/* Sound effects */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--phone-card-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: 'var(--phone-text-body)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Volume2 size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--phone-text-title)' }}>Sound Effects</span>
                  <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)' }}>Play sounds for actions</span>
                </div>
              </div>
              <label className="switch">
                <input type="checkbox" checked={soundEffects} onChange={(e) => handleSoundToggle(e.target.checked)} />
                <span className="slider round"></span>
              </label>
            </div>

            {/* Haptic feedback */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: 'var(--phone-text-body)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Smartphone size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--phone-text-title)' }}>Haptic Feedback</span>
                  <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)' }}>Vibration for interactions</span>
                </div>
              </div>
              <label className="switch">
                <input type="checkbox" checked={hapticFeedback} onChange={(e) => handleHapticToggle(e.target.checked)} />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>

        {/* PRIVACY & SECURITY GROUP */}
        <div>
          <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--phone-text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', paddingLeft: '8px', display: 'block', marginBottom: '8px' }}>
            Privacy & Security
          </span>
          <div style={{ background: 'var(--phone-card-bg)', borderRadius: '16px', border: '1px solid var(--phone-card-border)', overflow: 'hidden' }}>
            {/* Change Password */}
            <div 
              onClick={() => { triggerLocalHaptic(); playLocalSound(); setActiveOverlay('password_info'); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--phone-card-border)', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: 'var(--phone-text-body)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--phone-text-title)' }}>Change Password</span>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--phone-text-muted)' }} />
            </div>

            {/* 2FA */}
            <div 
              onClick={() => { triggerLocalHaptic(); playLocalSound(); setActiveOverlay('twofactor'); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--phone-card-border)', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: 'var(--phone-text-body)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--phone-text-title)' }}>Two-Factor Authentication</span>
                  <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)' }}>Add extra security to your account</span>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--phone-text-muted)' }} />
            </div>

            {/* Privacy settings */}
            <div 
              onClick={() => { triggerLocalHaptic(); playLocalSound(); setActiveOverlay('privacy'); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: 'var(--phone-text-body)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <EyeOff size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--phone-text-title)' }}>Privacy Settings</span>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--phone-text-muted)' }} />
            </div>
          </div>
        </div>

        {/* STORAGE GROUP */}
        <div>
          <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--phone-text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', paddingLeft: '8px', display: 'block', marginBottom: '8px' }}>
            Storage
          </span>
          <div style={{ background: 'var(--phone-card-bg)', borderRadius: '16px', border: '1px solid var(--phone-card-border)', overflow: 'hidden' }}>
            <div 
              onClick={handleClearCacheClick}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', cursor: 'pointer' }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: 'var(--phone-text-body)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Smartphone size={16} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--phone-text-title)' }}>Clear Cache</span>
                <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)' }}>Free up storage space</span>
              </div>
            </div>
          </div>
        </div>

        {/* LEGAL GROUP */}
        <div>
          <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--phone-text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', paddingLeft: '8px', display: 'block', marginBottom: '8px' }}>
            Legal
          </span>
          <div style={{ background: 'var(--phone-card-bg)', borderRadius: '16px', border: '1px solid var(--phone-card-border)', overflow: 'hidden' }}>
            <div 
              onClick={() => { triggerLocalHaptic(); playLocalSound(); setActiveOverlay('legal'); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--phone-bg)', color: 'var(--phone-text-body)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--phone-text-title)' }}>Legal & Policies</span>
                  <span style={{ fontSize: '11px', color: 'var(--phone-text-muted)' }}>Privacy, Terms, and Refunds</span>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--phone-text-muted)' }} />
            </div>
          </div>
        </div>

        {/* ACCOUNT GROUP */}
        <div>
          <span style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--phone-text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', paddingLeft: '8px', display: 'block', marginBottom: '8px' }}>
            Account
          </span>
          <div style={{ background: 'var(--phone-card-bg)', borderRadius: '16px', border: '1px solid var(--phone-card-border)', overflow: 'hidden' }}>
            {/* Sign out */}
            <div 
              onClick={handleSignOutClick}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderBottom: '1px solid var(--phone-card-border)', cursor: 'pointer' }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fff5f5', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LogOut size={16} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#ef4444' }}>Sign Out</span>
              </div>
            </div>

            {/* Delete Account */}
            <div 
              onClick={handleDeleteAccountClick}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', cursor: 'pointer' }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fff5f5', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={16} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#ef4444' }}>Delete Account</span>
                <span style={{ fontSize: '11px', color: '#ef4444' }}>Permanently delete your account</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Version Details */}
        <div style={{ textAlign: 'center', padding: '10px 0 30px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11.5px', color: 'var(--phone-text-muted)', fontWeight: 600 }}>Version 1.0.0</span>
          <span style={{ fontSize: '10px', color: 'var(--phone-text-muted)', opacity: 0.7 }}>© 2026 RG Retailer. All rights reserved.</span>
        </div>

      </div>

      {/* OVERLAY MODALS */}
      
      {/* 1. Language bottom-sheet panel */}
      {activeOverlay === 'language' && (
        <div 
          onClick={() => setActiveOverlay(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--phone-card-bg)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: 'var(--phone-text-title)' }}>Select Language</h3>
              <button 
                onClick={() => setActiveOverlay(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} style={{ color: '#000' }} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {languages.map((lang) => {
                const isSelected = language === lang;
                return (
                  <div 
                    key={lang}
                    onClick={() => selectLanguage(lang)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      backgroundColor: isSelected ? 'rgba(255, 107, 53, 0.08)' : 'var(--phone-bg)',
                      border: isSelected ? '1.5px solid #ff6b35' : '1.5px solid var(--phone-card-border)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: 700, color: isSelected ? '#ff6b35' : 'var(--phone-text-title)' }}>{lang}</span>
                    {isSelected && <Check size={18} style={{ color: '#ff6b35' }} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Two-Factor Authentication Dialog */}
      {activeOverlay === 'twofactor' && (
        <div 
          onClick={() => setActiveOverlay(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out', padding: '20px' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--phone-card-bg)', borderRadius: '24px', width: '100%', maxWidth: '340px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', border: '1px solid var(--phone-card-border)', animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(79, 70, 229, 0.08)', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: 'var(--phone-text-title)' }}>Two-Factor Security</h3>
            </div>
            
            <p style={{ fontSize: '12.5px', color: 'var(--phone-text-body)', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
              Add an extra layer of protection to your profile. Login checks will require verification code alerts.
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '12px', backgroundColor: 'var(--phone-bg)', border: '1px solid var(--phone-card-border)' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--phone-text-title)' }}>SMS 2FA Verification</span>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={twoFactorEnabled} 
                  onChange={(e) => handleSettingChange(setTwoFactorEnabled, 'twoFactorEnabled', 'rg_settings_2fa', e.target.checked)} 
                />
                <span className="slider round"></span>
              </label>
            </div>

            <button 
              onClick={() => setActiveOverlay(null)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#0f172a',
                color: '#fff',
                fontSize: '13.5px',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
                marginTop: '4px'
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 3. Privacy Settings Dialog */}
      {activeOverlay === 'privacy' && (
        <div 
          onClick={() => setActiveOverlay(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out', padding: '20px' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--phone-card-bg)', borderRadius: '24px', width: '100%', maxWidth: '340px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', border: '1px solid var(--phone-card-border)', animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(233, 60, 118, 0.08)', color: '#e93c76', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EyeOff size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: 'var(--phone-text-title)' }}>Privacy Settings</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Personalized Recs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 14px', borderRadius: '12px', backgroundColor: 'var(--phone-bg)', border: '1px solid var(--phone-card-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--phone-text-title)' }}>Personalized Feeds</span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={personalizedRecommendations} 
                      onChange={(e) => handleSettingChange(setPersonalizedRecommendations, 'personalizedRecommendations', 'rg_settings_recs', e.target.checked)} 
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--phone-text-muted)', lineHeight: 1.4, fontWeight: 500 }}>
                  Tailor shopping recommendations and outfit curation results.
                </span>
              </div>

              {/* Diagnostic data */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 14px', borderRadius: '12px', backgroundColor: 'var(--phone-bg)', border: '1px solid var(--phone-card-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--phone-text-title)' }}>Diagnostics Sharing</span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={diagnosticCollection} 
                      onChange={(e) => handleSettingChange(setDiagnosticCollection, 'diagnosticCollection', 'rg_settings_diagnostics', e.target.checked)} 
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--phone-text-muted)', lineHeight: 1.4, fontWeight: 500 }}>
                  Share diagnostic logs to help improve WebView app stability.
                </span>
              </div>
            </div>

            <button 
              onClick={() => setActiveOverlay(null)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#0f172a',
                color: '#fff',
                fontSize: '13.5px',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
                marginTop: '4px'
              }}
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* 4. Password / OTP Login Details Info Overlay */}
      {activeOverlay === 'password_info' && (
        <div 
          onClick={() => setActiveOverlay(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out', padding: '20px' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--phone-card-bg)', borderRadius: '24px', width: '100%', maxWidth: '340px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', border: '1px solid var(--phone-card-border)', animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: 'var(--phone-text-title)' }}>Secure OTP Security</h3>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--phone-text-body)', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
              Your account uses passwordless <strong>One-Time Passcode (OTP) verification</strong> linked to your phone number. 
            </p>
            <p style={{ fontSize: '12px', color: 'var(--phone-text-muted)', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
              This completely eliminates traditional passwords, keeping your account safe from password theft, credential stuffing, and phishing.
            </p>
            
            <button 
              onClick={() => setActiveOverlay(null)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#0f172a',
                color: '#fff',
                fontSize: '13.5px',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
                marginTop: '4px'
              }}
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* 5. Legal & Policies Overlay */}
      {activeOverlay === 'legal' && (
        <div 
          onClick={() => setActiveOverlay(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out', padding: '20px' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--phone-card-bg)', borderRadius: '24px', width: '100%', maxWidth: '360px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--phone-card-border)', animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)', maxHeight: '85vh', overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--phone-card-border)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} style={{ color: '#ff6b35' }} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: 'var(--phone-text-title)' }}>Legal & Policies</h3>
              </div>
              <button 
                onClick={() => setActiveOverlay(null)}
                style={{ background: 'none', border: 'none', color: 'var(--phone-text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs toggle */}
            <div style={{ display: 'flex', background: 'var(--phone-bg)', padding: '3px', borderRadius: '10px', border: '1px solid var(--phone-card-border)' }}>
              {[
                { id: 'privacy', label: 'Privacy' },
                { id: 'terms', label: 'Terms' },
                { id: 'refund', label: 'Refunds' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setLegalTab(t.id)}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    background: legalTab === t.id ? 'var(--phone-card-bg)' : 'transparent',
                    color: legalTab === t.id ? 'var(--phone-text-title)' : 'var(--phone-text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Policy Content Scroll View */}
            <div className="carousel-scroll" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '50vh', WebkitOverflowScrolling: 'touch' }}>
              {legalTab === 'privacy' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {legalPolicies?.privacyUrl && (
                    <div style={{ paddingBottom: '8px', borderBottom: '1px dashed var(--phone-card-border)', marginBottom: '4px' }}>
                      <a 
                        href={legalPolicies.privacyUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#ff6b35', fontSize: '11.5px', fontWeight: 700, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        <Globe size={13} />
                        <span>View Hosted Privacy Policy</span>
                      </a>
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: 'var(--phone-text-body)', lineHeight: 1.5, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {legalPolicies?.privacyText || `1. Data Collection\nWe collect your name, phone number, and delivery addresses to configure your customer account profile and sync retail invoices.\n\n2. Security & Transmission\nAll transaction ledgers and customer data updates are transmitted securely using HTTPS/SSL encryption to our Firebase servers.\n\n3. Purge & Account Deletion\nYou can delete your account directly inside app Settings. Deletion is immediate and permanently deletes your credentials and database logs.`}
                  </div>
                </div>
              )}

              {legalTab === 'terms' && (
                <div style={{ fontSize: '12px', color: 'var(--phone-text-body)', lineHeight: 1.5, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {legalPolicies?.termsText || `1. Account Eligibility\nYou must utilize a valid mobile number capable of receiving One-Time Passcodes (OTP) to register and authenticate.\n\n2. Refills and Payments\nWallet balances represent store credit. Refills processed through payment gateways are strictly non-refundable and designated for in-app checkout checkout only.\n\n3. Shipping Agreements\nCurated orders placed on the storefront are fulfilled directly by the partner store. Estimated delivery times are indicative.`}
                </div>
              )}

              {legalTab === 'refund' && (
                <div style={{ fontSize: '12px', color: 'var(--phone-text-body)', lineHeight: 1.5, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {legalPolicies?.refundText || `1. Order Cancellation\nOrders can be cancelled by the user up until the order fulfillment status transitions to "Shipped" inside the app.\n\n2. Return Period\nEligible purchases can be returned within 7 days of delivery in their original, unused condition with labels intact.\n\n3. Refund Destination\nAll approved refunds are credited back to the customer's store wallet balance within 24 to 48 hours of inspection approval.`}
                </div>
              )}
            </div>

            <button 
              onClick={() => setActiveOverlay(null)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#0f172a',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
                marginTop: '4px'
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Styled toggle switch CSS injection */}
      <style>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 38px;
          height: 22px;
        }
        .switch input { 
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #cbd5e1;
          -webkit-transition: .2s;
          transition: .2s;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          -webkit-transition: .2s;
          transition: .2s;
        }
        input:checked + .slider {
          background-color: #ff6b35;
        }
        input:focus + .slider {
          box-shadow: 0 0 1px #ff6b35;
        }
        input:checked + .slider:before {
          -webkit-transform: translateX(16px);
          -ms-transform: translateX(16px);
          transform: translateX(16px);
        }
        .slider.round {
          border-radius: 34px;
        }
        .slider.round:before {
          border-radius: 50%;
        }
        .spin {
          animation: spinAnimation 1s linear infinite;
        }
        @keyframes spinAnimation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default Settings;

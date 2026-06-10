import React, { useState, useEffect, useRef } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import {
  auth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  collection,
  query,
  where,
  getDocs
} from '../firebase';
import {
  Smartphone,
  Mail,
  ArrowLeft,
  Check,
  Sparkles,
  Info,
  ChevronRight,
  TrendingUp,
  User,
  UserCheck,
  Users,
  Zap,
  Compass,
  Briefcase,
  Crown,
  Shirt,
  Layers,
  Sliders,
  Activity,
  Shield,
  Tag,
  Smile,
  Coffee,
  Cpu,
  Star,
  Lightbulb,
  History,
  RefreshCw,
  Gift
} from 'lucide-react';

function OnboardingFlow({ products, onComplete, isReturningUser }) {
  const [step, setStep] = useState('splash'); // splash, signin, signup, otp, loader, phone_prompt, quiz_promo, step_gender, step_categories, step_budget, step_vibe
  const [sendingOtpMessage, setSendingOtpMessage] = useState(''); // Loading overlay message during OTP send
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Personalization Selections State
  const [gender, setGender] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [budget, setBudget] = useState('');
  const [selectedVibes, setSelectedVibes] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [exploreChoice, setExploreChoice] = useState('');
  const [hasStyleDiscount, setHasStyleDiscount] = useState(false);

  // Timer for OTP countdown
  useEffect(() => {
    let interval = null;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendTimer]);

  // Verify OTP code helper (avoids React state sync race conditions)
  const verifyOtpCode = async (code) => {
    if (code.length !== 6 || isVerifying) return;

    setIsVerifying(true);
    setOtpError('');

    try {
      if (window.nativeVerificationId) {
        // NATIVE: Confirm OTP using Capacitor Firebase plugin
        console.log("Confirming OTP via NATIVE plugin...", code);
        const result = await FirebaseAuthentication.confirmVerificationCode({
          verificationId: window.nativeVerificationId,
          verificationCode: code
        });
        console.log("Native OTP Verification Success!");

        // Also sign into the web SDK layer so auth.currentUser is populated
        if (result && result.credential) {
          try {
            const { PhoneAuthProvider } = await import('firebase/auth');
            const credential = PhoneAuthProvider.credential(
              window.nativeVerificationId,
              code
            );
            await signInWithCredential(auth, credential);
            console.log("Web SDK auth layer also signed in.");
          } catch (webErr) {
            console.warn("Web SDK credential sync skipped:", webErr);
          }
        }

        window.nativeVerificationId = null;
        setIsVerifying(false);
        setStep('loader');
      } else if (window.confirmationResult) {
        // WEB: Confirm OTP using web SDK confirmationResult
        const result = await window.confirmationResult.confirm(code);
        const user = result.user;
        console.log("Web OTP Verification Success! User UID:", user.uid);
        setIsVerifying(false);
        setStep('loader');
      } else {
        throw new Error("No active verification session found. Please request a new OTP code.");
      }
    } catch (err) {
      console.error("Verification failed:", err);
      setIsVerifying(false);

      const msg = err.message || '';
      if (msg.includes('invalid-verification-code') || msg.includes('INVALID') || msg.includes('invalid')) {
        setOtpError('Invalid OTP code. Please check and try again.');
      } else if (msg.includes('expired') || msg.includes('session-expired')) {
        setOtpError('OTP has expired. Please request a new code.');
      } else {
        setOtpError(msg || 'Verification failed. Please try again.');
      }

      // Clear the OTP fields so user can re-enter
      setOtpCode(['', '', '', '', '', '']);
      // Focus back to first OTP input
      setTimeout(() => {
        const firstInput = document.getElementById('otp-input-0');
        if (firstInput) firstInput.focus();
      }, 100);
    }
  };

  // Handle OTP field input shifting, autofills, and automatic verification
  const handleOtpChange = (index, value) => {
    setOtpError('');
    const newOtp = [...otpCode];

    // If the input contains multiple characters (e.g. copy-paste, keyboard autofill)
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length > 1) {
      const digits = cleanValue.split('').slice(0, 6);
      for (let i = 0; i < digits.length; i++) {
        if (index + i < 6) {
          newOtp[index + i] = digits[i];
        }
      }
      setOtpCode(newOtp);

      // Focus the last filled input
      const targetIndex = Math.min(index + digits.length - 1, 5);
      const nextInput = document.getElementById(`otp-input-${targetIndex}`);
      if (nextInput) nextInput.focus();

      // Trigger automatic verification if all digits are present
      if (newOtp.every(digit => digit !== '')) {
        verifyOtpCode(newOtp.join(''));
      }
      return;
    }

    if (isNaN(value)) return;
    newOtp[index] = value.slice(-1);
    setOtpCode(newOtp);

    // Shift focus to next input box if value entered
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Trigger automatic verification if all digits are present
    if (newOtp.every(digit => digit !== '')) {
      verifyOtpCode(newOtp.join(''));
    }
  };

  // Handle Backspace in OTP field
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        const newOtp = [...otpCode];
        newOtp[index - 1] = '';
        setOtpCode(newOtp);
      }
    }
  };

  // Explicit Clipboard Paste handler for 1-tap/Ctrl+V paste operations
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pastedData.length >= 6) {
      const digits = pastedData.split('').slice(0, 6);
      setOtpCode(digits);

      // Focus the last box
      const targetInput = document.getElementById('otp-input-5');
      if (targetInput) targetInput.focus();

      // Auto verify
      verifyOtpCode(digits.join(''));
    } else if (pastedData.length > 0) {
      const digits = pastedData.split('');
      const newOtp = [...otpCode];
      for (let i = 0; i < digits.length; i++) {
        if (i < 6) {
          newOtp[i] = digits[i];
        }
      }
      setOtpCode(newOtp);

      const targetIndex = Math.min(digits.length, 5);
      const nextInput = document.getElementById(`otp-input-${targetIndex}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Post-login loader: route returning users to home, new users to quiz
  useEffect(() => {
    if (step === 'loader') {
      const timeout = setTimeout(() => {
        if (isReturningUser) {
          // Returning user — skip quiz, go straight to app
          executeCompleteOnboarding(false);
        } else {
          // New user — show quiz promo
          setStep('quiz_promo');
        }
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [step, isReturningUser]);

  // Checks if the 6-digit OTP code is fully filled
  const isOtpFilled = otpCode.every(digit => digit !== '');

  const triggerSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (isSendingOtp) return; // Prevent double-tap
    setIsSendingOtp(true);
    setOtpError('');
    setSendingOtpMessage('Sending OTP...');

    const formatPhone = `+91${phoneNumber}`;

    try {
      if (Capacitor.isNativePlatform()) {
        // NATIVE ANDROID/iOS: Use Capacitor Firebase plugin (no reCAPTCHA needed)
        console.log("Using NATIVE phone auth for:", formatPhone);

        // Remove any previous listeners to avoid duplicates
        await FirebaseAuthentication.removeAllListeners();

        // 1. phoneCodeSent fires when Firebase sends the SMS OTP
        await FirebaseAuthentication.addListener('phoneCodeSent', (event) => {
          console.log("phoneCodeSent event received, verificationId:", event.verificationId);
          window.nativeVerificationId = event.verificationId;
          window.confirmationResult = null;

          setIsSendingOtp(false);
          setSendingOtpMessage('');
          setResendTimer(30);
          setOtpCode(['', '', '', '', '', '']);
          setOtpError('');
          setStep('otp');
        });

        // 2. phoneVerificationCompleted fires if auto-verified (SMS auto-read on device)
        await FirebaseAuthentication.addListener('phoneVerificationCompleted', async (event) => {
          console.log("phoneVerificationCompleted - auto-verified!");
          setIsSendingOtp(false);
          setSendingOtpMessage('');

          // If we have a verification code from auto-read, fill OTP boxes
          if (event.credential && event.credential.verificationCode) {
            const autoCode = event.credential.verificationCode;
            const digits = autoCode.split('').slice(0, 6);
            setOtpCode(digits.length === 6 ? digits : ['', '', '', '', '', '']);
          }

          // Auto sign-in: user's phone was verified without typing OTP
          try {
            if (event.credential) {
              const { PhoneAuthProvider } = await import('firebase/auth');
              const credential = PhoneAuthProvider.credential(
                event.credential.verificationId || window.nativeVerificationId,
                event.credential.verificationCode || ''
              );
              await signInWithCredential(auth, credential);
            }
          } catch (e) {
            console.warn("Auto-verify web sync skipped:", e);
          }
          setStep('loader');
        });

        // 3. phoneVerificationFailed fires if something goes wrong
        await FirebaseAuthentication.addListener('phoneVerificationFailed', (event) => {
          console.error("phoneVerificationFailed:", event.message);
          setIsSendingOtp(false);
          setSendingOtpMessage('');

          const msg = event.message || '';
          if (msg.includes('blocked') || msg.includes('unusual activity') || msg.includes('too-many-requests')) {
            alert("Too many OTP requests. Firebase has temporarily blocked this device. Please wait 1 hour and try again, or use 'Continue with Google' to sign in.");
          } else {
            alert("Phone verification failed: " + msg);
          }
        });

        setSendingOtpMessage('Verifying device...');

        // Now trigger the actual phone sign-in (this sends the SMS)
        await FirebaseAuthentication.signInWithPhoneNumber({ phoneNumber: formatPhone });
        console.log("signInWithPhoneNumber called, waiting for events...");

        setSendingOtpMessage('Waiting for OTP...');

      } else {
        // WEB BROWSER: Use standard RecaptchaVerifier (works in real browser only)
        console.log("Using WEB phone auth for:", formatPhone);

        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear();
          } catch (e) {
            console.warn("Error clearing recaptchaVerifier:", e);
          }
          window.recaptchaVerifier = null;
        }

        const container = document.getElementById('recaptcha-container');
        if (container) {
          container.innerHTML = '<div id="recaptcha-widget"></div>';
        }

        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-widget', {
          'size': 'invisible',
          'callback': (response) => {
            console.log("reCAPTCHA solved");
          }
        });

        const confirmationResult = await signInWithPhoneNumber(auth, formatPhone, window.recaptchaVerifier);
        window.confirmationResult = confirmationResult;
        window.nativeVerificationId = null;

        setIsSendingOtp(false);
        setResendTimer(30);
        setOtpCode(['', '', '', '', '', '']);
        setOtpError('');
        setStep('otp');
      }
    } catch (err) {
      console.error("Phone auth failed:", err);
      setIsSendingOtp(false);
      setSendingOtpMessage('');

      const msg = err.message || '';
      if (msg.includes('blocked') || msg.includes('unusual activity') || msg.includes('too-many-requests')) {
        alert("Too many OTP requests. Firebase has temporarily blocked this device. Please wait 1 hour and try again, or use 'Continue with Google' to sign in.");
      } else {
        alert("SMS OTP request failed: " + (msg || JSON.stringify(err)));
      }

      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) { }
        window.recaptchaVerifier = null;
      }
    }
  };

  const handleVerifyOtp = async () => {
    verifyOtpCode(otpCode.join(''));
  };

  const handleGoogleLogin = async () => {
    try {
      let user;
      if (Capacitor.isNativePlatform()) {
        console.log("Triggering Google Auth via Native Plugin...");
        const result = await FirebaseAuthentication.signInWithGoogle();
        if (!result.credential || !result.credential.idToken) {
          throw new Error("No credential/ID Token returned from native Google Sign-In.");
        }
        const credential = GoogleAuthProvider.credential(result.credential.idToken);
        const userCredential = await signInWithCredential(auth, credential);
        user = userCredential.user;
      } else {
        const provider = new GoogleAuthProvider();
        console.log("Triggering Google Auth Sign-in popup...");
        const result = await signInWithPopup(auth, provider);
        user = result.user;
      }
      console.log("Google Login succeeded for user:", user.email);

      if (user.displayName) {
        setFullName(user.displayName);
      }

      // Immediately show loader to prevent layout shifts
      setStep('loader');

      // Check Firestore to see if this user is already registered with a phone number
      let existingProfile = null;
      try {
        const q = query(collection(null, 'customers'), where('email', '==', user.email));
        const snap = await getDocs(q);
        snap.forEach(d => {
          existingProfile = { ...d.data(), id: d.id };
        });
      } catch (dbErr) {
        console.warn("Error checking Firestore for returning Google user:", dbErr);
      }

      if (user.phoneNumber) {
        const cleanedPhone = user.phoneNumber.replace('+91', '').trim();
        setPhoneNumber(cleanedPhone);
        setStep('quiz_promo');
      } else if (existingProfile && existingProfile.phone) {
        console.log("Returning Google user found with phone:", existingProfile.phone);
        setPhoneNumber(existingProfile.phone);

        // Pass existing profile details to onComplete to bypass onboarding & phone prompt
        onComplete({
          gender: existingProfile.gender || 'Women',
          ageRange: existingProfile.ageRange || '25–34',
          profession: existingProfile.profession || 'Casual',
          stylePersona: existingProfile.stylePersona || 'Minimalist',
          membershipTier: existingProfile.tier || 'Free',
          phone: existingProfile.phone,
          name: existingProfile.name || user.displayName || 'Mike',
          email: user.email || '',
          hasStyleDiscount: false
        });
      } else {
        // New user without a registered phone number -> show the prompt
        setStep('phone_prompt');
      }
    } catch (err) {
      console.error("Google Auth failed:", err);
      setStep('splash');
      alert("Google login failed: " + (err.message || String(err)));
    }
  };

  const handlePrevStep = () => {
    if (step === 'step_gender') setStep('quiz_promo');
    else if (step === 'step_age') setStep('step_gender');
    else if (step === 'step_categories') setStep('step_age');
    else if (step === 'step_budget') setStep('step_categories');
    else if (step === 'step_vibe') setStep('step_budget');
  };

  // Handle native hardware back button step navigation
  useEffect(() => {
    let handlerPromise = null;
    try {
      handlerPromise = CapApp.addListener('backButton', () => {
        if (step === 'splash') {
          CapApp.exitApp();
        } else if (step === 'signin' || step === 'signup' || step === 'phone_prompt') {
          setStep('splash');
        } else if (step === 'otp') {
          setStep('signup');
        } else if (step === 'quiz_promo') {
          setStep('splash');
        } else if (step === 'step_gender') {
          setStep('quiz_promo');
        } else if (step === 'step_age') {
          setStep('step_gender');
        } else if (step === 'step_categories') {
          setStep('step_age');
        } else if (step === 'step_budget') {
          setStep('step_categories');
        } else if (step === 'step_vibe') {
          setStep('step_budget');
        }
      });
    } catch (err) {
      console.warn("Native backButton listener not supported in this environment:", err);
    }

    return () => {
      if (handlerPromise) {
        handlerPromise.then(h => h.remove()).catch(() => { });
      }
    };
  }, [step]);

  // Multi-select category pill toggle
  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // Multi-select vibe toggle
  const toggleVibe = (vibe) => {
    if (selectedVibes.includes(vibe)) {
      setSelectedVibes(selectedVibes.filter(v => v !== vibe));
    } else {
      setSelectedVibes([...selectedVibes, vibe]);
    }
  };

  // Multi-select activity toggle
  const toggleActivity = (act) => {
    if (selectedActivities.includes(act)) {
      setSelectedActivities(selectedActivities.filter(a => a !== act));
    } else {
      setSelectedActivities([...selectedActivities, act]);
    }
  };

  const executeCompleteOnboarding = (hasDiscount = false) => {
    onComplete({
      gender: gender || 'Women',
      ageRange: ageGroup || '25–34',
      profession: selectedActivities.join(', ') || 'Casual',
      stylePersona: selectedVibes.join(', ') || 'Minimalist',
      interests: selectedCategories || [],
      membershipTier: 'Free',
      phone: phoneNumber || '8949764911',
      name: fullName || auth.currentUser?.displayName || 'Mike',
      email: auth.currentUser?.email || '',
      hasStyleDiscount: hasDiscount,
      referredByCode: referralCodeInput.trim()
    });
  };  // Common Progress Dots header renderer
  const renderWizardHeader = (activeDot, stepTitle, stepSubtitle, isOptional = false) => {
    const progressPercent = (activeDot / 5) * 100;
    return (
      <div style={{ padding: '20px 24px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button className="auth-back-btn" onClick={handlePrevStep} style={{ padding: '8px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={18} style={{ color: '#0f172a' }} />
          </button>

          {/* Segmented linear progress tracker line with gold-orange glow */}
          <div style={{ flex: 1, margin: '0 18px', height: '6px', borderRadius: '3px', backgroundColor: '#e2e8f0', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #f97316 0%, #ff8c3b 100%)',
              borderRadius: '3px',
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 1px 4px rgba(249,115,22,0.3)'
            }} />
          </div>

          {/* Clean badge indicator */}
          <div style={{
            padding: '4px 10px',
            borderRadius: '12px',
            backgroundColor: '#ffedd5',
            color: '#ea580c',
            fontSize: '11px',
            fontWeight: 800,
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: '0.3px'
          }}>
            Q{activeDot}/5
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#ff6b35', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {isOptional ? 'Recommended Setup (Optional)' : 'Required Preferences'}
          </span>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', fontFamily: "'Playfair Display', serif", letterSpacing: '-0.3px', lineHeight: '1.2' }}>
            {stepTitle}
          </h2>
          <p style={{ fontSize: '14.5px', color: '#64748b', lineHeight: '1.45', fontWeight: 400, marginTop: '2px' }}>
            {stepSubtitle}
          </p>
        </div>
      </div>
    );
  };

  const renderSplash = () => (
    <div className="auth-container" style={{ background: 'linear-gradient(to bottom, #f97316 0%, #fb923c 25%, #ffedd5 45%, #ffffff 55%, #ffffff 100%)', justifyContent: 'flex-start', overflow: 'hidden' }}>

      {/* Top half: Constellation & Logo */}
      <div style={{ height: '46%', width: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* Absolute SVG Constellation Nodes & Connected Lines Background */}
        <svg className="constellation-svg" shapeRendering="geometricPrecision" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
          {/* Straight connected lines with soft white opacity */}
          <line x1="22%" y1="56%" x2="50%" y2="48%" className="constellation-line" style={{ stroke: 'rgba(255, 255, 255, 0.45)', strokeWidth: 1, strokeLinecap: 'round' }} />
          <line x1="50%" y1="48%" x2="78%" y2="42%" className="constellation-line" style={{ stroke: 'rgba(255, 255, 255, 0.45)', strokeWidth: 1 }} />
          <line x1="78%" y1="42%" x2="66%" y2="80%" className="constellation-line" style={{ stroke: 'rgba(255, 255, 255, 0.45)', strokeWidth: 1 }} />
          <line x1="22%" y1="56%" x2="0%" y2="10%" className="constellation-line" style={{ stroke: 'rgba(255, 255, 255, 0.3)', strokeWidth: 1 }} />
          <line x1="78%" y1="42%" x2="100%" y2="90%" className="constellation-line" style={{ stroke: 'rgba(255, 255, 255, 0.3)', strokeWidth: 1 }} />
          <line x1="22%" y1="56%" x2="48%" y2="100%" className="constellation-line" style={{ stroke: 'rgba(255, 255, 255, 0.25)', strokeWidth: 1 }} />

          {/* Soft Filled background circles */}
          <circle cx="15%" cy="20%" r="32" className="constellation-orb-1" style={{ fill: 'rgba(255, 255, 255, 0.12)' }} />
          <circle cx="85%" cy="25%" r="40" className="constellation-orb-2" style={{ fill: 'rgba(255, 255, 255, 0.08)' }} />
          <circle cx="18%" cy="80%" r="22" className="constellation-orb-3" style={{ fill: 'rgba(255, 255, 255, 0.12)' }} />

          {/* Connected vector outer circles */}
          <circle cx="22%" cy="56%" r="28" className="constellation-node node-pulse-1" style={{ stroke: 'rgba(255, 255, 255, 0.4)', strokeWidth: 1, fill: 'none' }} />
          <circle cx="78%" cy="42%" r="24" className="constellation-node node-pulse-2" style={{ stroke: 'rgba(255, 255, 255, 0.4)', strokeWidth: 1, fill: 'none' }} />
          <circle cx="66%" cy="80%" r="20" className="constellation-node node-pulse-3" style={{ stroke: 'rgba(255, 255, 255, 0.3)', strokeWidth: 1, fill: 'none' }} />
        </svg>

        {/* Central white circular monogram logo with soft shadow */}
        <div className="splash-logo-container" style={{
          width: '96px',
          height: '96px',
          borderRadius: '50%',
          border: '2.5px solid rgba(255, 255, 255, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '36px',
          fontFamily: "'Outfit', sans-serif",
          letterSpacing: '0.5px',
          zIndex: 2,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          backgroundColor: 'transparent'
        }}>
          RG
        </div>
      </div>

      {/* Bottom Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 24px 28px',
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        zIndex: 2
      }}>

        {/* Headings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
          <span style={{ fontSize: '18px', fontWeight: 500, color: '#475569', fontFamily: "'Outfit', sans-serif" }}>
            Welcome to
          </span>
          <h2 style={{ fontSize: '44px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.8px', lineHeight: '1.05', margin: 0 }}>
            RG Retailer
          </h2>
          <p style={{ fontSize: '17px', color: '#64748b', lineHeight: '1.55', fontWeight: 400, margin: '10px 0 0' }}>
            Discover the latest fashion trends curated just for you. Experience shopping like never before.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center', width: '100%', marginTop: '16px' }}>
          <button
            className="auth-btn-primary"
            onClick={() => setStep('signup')}
            style={{
              width: '100%',
              padding: '18px',
              fontSize: '18px',
              fontWeight: 700,
              borderRadius: '16px',
              background: '#ff6b35',
              boxShadow: '0 8px 20px rgba(255, 107, 53, 0.28)'
            }}
          >
            Get Started
          </button>

          <button
            style={{ background: 'none', border: 'none', color: '#ff6b35', fontSize: '17px', fontWeight: 700, cursor: 'pointer', outline: 'none', marginTop: '4px' }}
            onClick={() => setStep('signin')}
          >
            I already have an account
          </button>
        </div>

        {/* Footer text */}
        <span style={{ fontSize: '13.5px', color: '#94a3b8', textAlign: 'center', lineHeight: '1.45', padding: '0 8px', marginTop: '16px' }}>
          By continuing, you agree to our <span style={{ textDecoration: 'underline', color: '#64748b', cursor: 'pointer' }}>Terms of Service</span> and <span style={{ textDecoration: 'underline', color: '#64748b', cursor: 'pointer' }}>Privacy Policy</span>
        </span>
      </div>
    </div>
  );

  // Full-screen overlay shown while OTP is being sent (covers the reCAPTCHA/SafetyNet delay)
  const renderSendingOverlay = () => {
    if (!sendingOtpMessage) return null;
    return (
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '20px', zIndex: 100, animation: 'fadeIn 0.3s'
      }}>
        <div className="circular-spinner-vector" style={{ width: '44px', height: '44px' }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', fontFamily: "'Outfit', sans-serif", margin: 0 }}>
            {sendingOtpMessage}
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Please wait, this may take a few seconds
          </p>
        </div>
      </div>
    );
  };

  const renderSignIn = () => (
    <div className="auth-container" style={{ position: 'relative' }}>
      {renderSendingOverlay()}
      {/* Header Chrome */}
      <div className="auth-header">
        <button className="auth-back-btn" onClick={() => setStep('splash')}>
          <ArrowLeft size={22} />
        </button>
      </div>

      <div className="auth-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to continue shopping</p>
        </div>

        <div className="auth-input-group" style={{ marginTop: '24px' }}>
          <label className="auth-input-label">Phone Number</label>
          <div className="auth-input-wrapper">
            <span className="auth-input-prefix">+91</span>
            <input
              type="tel"
              maxLength="10"
              placeholder="Enter your phone number"
              className="auth-input"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
            />
          </div>
        </div>

        <span className="auth-link auth-link-right">Trouble logging in?</span>

        <button
          className="auth-btn-primary"
          style={{ marginTop: '10px' }}
          onClick={triggerSendOtp}
          disabled={phoneNumber.length !== 10}
        >
          Send OTP
        </button>

        <div className="auth-divider">
          <div className="auth-divider-line"></div>
          <span className="auth-divider-text">or continue with</span>
          <div className="auth-divider-line"></div>
        </div>

        <button className="auth-btn-google" onClick={handleGoogleLogin}>
          <span style={{ fontSize: '16px', fontWeight: 800 }}>G</span> Continue with Google
        </button>

        <p className="auth-footer">
          Don't have an account? <span className="auth-footer-link" onClick={() => setStep('signup')}>Sign Up</span>
        </p>
      </div>
    </div>
  );

  const renderSignUp = () => (
    <div className="auth-container" style={{ position: 'relative' }}>
      {renderSendingOverlay()}
      {/* Header Chrome */}
      <div className="auth-header">
        <button className="auth-back-btn" onClick={() => setStep('splash')}>
          <ArrowLeft size={22} />
        </button>
      </div>

      <div className="auth-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Sign up to start your shopping journey</p>
        </div>

        <div className="auth-input-group" style={{ marginTop: '24px' }}>
          <label className="auth-input-label">Full Name</label>
          <div className="auth-input-wrapper">
            <input
              type="text"
              placeholder="Enter your full name"
              className="auth-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>

        <div className="auth-input-group">
          <label className="auth-input-label">Phone Number</label>
          <div className="auth-input-wrapper">
            <span className="auth-input-prefix">+91</span>
            <input
              type="tel"
              maxLength="10"
              placeholder="Enter your phone number"
              className="auth-input"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
            />
          </div>
        </div>

        <div className="auth-input-group" style={{ marginBottom: '14px' }}>
          <label className="auth-input-label">Referral Code (Optional)</label>
          <div className="auth-input-wrapper">
            <input
              type="text"
              placeholder="Enter referral code"
              className="auth-input"
              value={referralCodeInput}
              onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
            />
          </div>
        </div>

        <button
          className="auth-btn-primary"
          style={{ marginTop: '10px' }}
          onClick={triggerSendOtp}
          disabled={!fullName.trim() || phoneNumber.length !== 10}
        >
          Send OTP
        </button>

        <div className="auth-divider">
          <div className="auth-divider-line"></div>
          <span className="auth-divider-text">or continue with</span>
          <div className="auth-divider-line"></div>
        </div>

        <button className="auth-btn-google" onClick={handleGoogleLogin}>
          <span style={{ fontSize: '16px', fontWeight: 800 }}>G</span> Continue with Google
        </button>

        <p className="auth-footer">
          Already have an account? <span className="auth-footer-link" onClick={() => setStep('signin')}>Sign In</span>
        </p>
      </div>
    </div>
  );

  const renderOtp = () => (
    <div className="auth-container">
      {/* Top green success Toast banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#f0fdf4', borderBottom: '1px solid rgba(16, 185, 129, 0.15)', animation: 'fadeIn 0.4s' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', background: '#10b981', color: '#ffffff' }}>
          <Check size={12} strokeWidth={3} />
        </div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#14532d' }}>OTP sent! Check your SMS.</span>
      </div>

      {/* Header back button */}
      <div className="auth-header" style={{ padding: '16px 20px 0' }}>
        <button className="auth-back-btn" onClick={() => setStep('signup')}>
          <ArrowLeft size={22} />
        </button>
      </div>

      <div className="auth-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 className="auth-title">Verify Phone</h2>
          <p className="auth-subtitle">
            Enter the 6-digit code sent to<br />
            <span style={{ color: '#0f172a', fontWeight: 700 }}>
              +91 {phoneNumber}
            </span>
          </p>
        </div>

        {/* Error message for wrong OTP */}
        {otpError && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px',
            marginTop: '8px', animation: 'fadeIn 0.3s'
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#dc2626' }}>{otpError}</span>
          </div>
        )}

        {/* 6 box digit input layout */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', margin: '20px 0' }}>
          {otpCode.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              pattern="\d*"
              maxLength="1"
              className={`otp-square-box ${otpError ? 'otp-error' : ''}`}
              value={digit}
              onChange={(e) => {
                setOtpError('');
                handleOtpChange(index, e.target.value);
              }}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              onPaste={handlePaste}
            />
          ))}
        </div>

        {/* Resend OTP - 30 second timer */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          {resendTimer > 0 ? (
            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
              Didn't receive OTP? Resend in <span style={{ color: '#ff6b35', fontWeight: 700 }}>{resendTimer}s</span>
            </span>
          ) : (
            <button
              onClick={() => {
                setOtpError('');
                triggerSendOtp();
              }}
              disabled={isSendingOtp}
              style={{
                background: 'none', border: '1.5px solid #ff6b35', color: '#ff6b35',
                fontSize: '14px', fontWeight: 700, cursor: isSendingOtp ? 'not-allowed' : 'pointer',
                padding: '8px 20px', borderRadius: '12px', outline: 'none',
                opacity: isSendingOtp ? 0.5 : 1, transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <RefreshCw size={14} className={isSendingOtp ? 'animate-spin' : ''} />
              <span>{isSendingOtp ? 'Sending...' : 'Resend OTP'}</span>
            </button>
          )}
        </div>

        <button
          className="auth-btn-primary"
          style={{ marginTop: 'auto', opacity: isVerifying ? 0.7 : 1 }}
          onClick={handleVerifyOtp}
          disabled={!isOtpFilled || isVerifying}
        >
          {isVerifying ? 'Verifying...' : 'Verify & Continue'}
        </button>

        <span
          className="auth-link"
          style={{ alignSelf: 'center', color: '#ff6b35', fontWeight: 600, marginTop: '12px', cursor: 'pointer' }}
          onClick={() => setStep('signin')}
        >
          Change Phone Number
        </span>
      </div>
    </div>
  );

  const renderPhonePrompt = () => (
    <div className="auth-container">
      {/* Header back button */}
      <div className="auth-header">
        <button className="auth-back-btn" onClick={() => setStep('splash')}>
          <ArrowLeft size={22} />
        </button>
      </div>

      <div className="auth-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 className="auth-title">Almost there</h2>
          <p className="auth-subtitle">Link your phone number to your profile to sync rewards and invoice history.</p>
        </div>

        <div className="auth-input-group" style={{ marginTop: '24px' }}>
          <label className="auth-input-label">Phone Number</label>
          <div className="auth-input-wrapper">
            <span className="auth-input-prefix">+91</span>
            <input
              type="tel"
              maxLength="10"
              placeholder="Enter your phone number"
              className="auth-input"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
            />
          </div>
        </div>

        <div className="auth-input-group" style={{ marginTop: '14px' }}>
          <label className="auth-input-label">Referral Code (Optional)</label>
          <div className="auth-input-wrapper">
            <input
              type="text"
              placeholder="Enter referral code"
              className="auth-input"
              value={referralCodeInput}
              onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
            />
          </div>
        </div>

        <button
          className="auth-btn-primary"
          style={{ marginTop: '20px' }}
          onClick={() => {
            if (phoneNumber.length !== 10) {
              alert("Please enter a valid 10-digit mobile number.");
              return;
            }
            setStep('quiz_promo');
          }}
          disabled={phoneNumber.length !== 10}
        >
          Confirm &amp; Continue
        </button>
      </div>
    </div>
  );

  const renderLoader = () => (
    <div className="auth-container" style={{ justifyContent: 'center', alignItems: 'center', gap: '24px', padding: '36px' }}>
      {/* Circular rotating spinner segment */}
      <div className="circular-spinner-vector"></div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
          {isReturningUser ? 'Welcome back!' : 'Phone verified!'}
        </h3>
        <p style={{ fontSize: '14px', color: '#64748b' }}>
          {isReturningUser ? 'Loading your profile...' : 'Setting up your experience...'}
        </p>
      </div>
    </div>
  );

  // ==================== PERSONALIZATION WIZARD SCREENS ====================

  // Step 1: Gender Selection
  const renderStepGender = () => {
    const options = [
      { id: 'Male', label: 'Male', icon: <User size={18} />, desc: "Men's fashion and style catalog" },
      { id: 'Female', label: 'Female', icon: <UserCheck size={18} />, desc: "Women's fashion and style catalog" },
      { id: 'Other', label: 'Other', icon: <Users size={18} />, desc: "Unisex & expressive fluid styles" }
    ];

    return (
      <div className="auth-container">
        {renderWizardHeader(1, "What's your gender?", "Choose the option that represents you best")}
        <div className="auth-body" style={{ gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            {options.map(opt => {
              const isActive = gender === opt.id;
              return (
                <div
                  key={opt.id}
                  className={`card-option ${isActive ? 'active' : ''}`}
                  onClick={() => setGender(opt.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '10px', backgroundColor: isActive ? '#ffedd5' : '#f1f5f9', color: isActive ? '#ff6b35' : '#475569', transition: 'all 0.2s' }}>
                      {opt.icon}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>{opt.label}</span>
                      <span style={{ fontSize: '14px', color: '#64748b' }}>{opt.desc}</span>
                    </div>
                  </div>
                  <div className={`radio-circle ${isActive ? 'active' : ''}`}>
                    {isActive && <div className="radio-inner" />}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            className="auth-btn-primary"
            style={{ marginTop: 'auto' }}
            disabled={!gender}
            onClick={() => setStep('step_age')}
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  // Step 2: Age Group Grid
  const renderStepAge = () => {
    const options = [
      { id: '18-24', label: '18-24', icon: <Zap size={18} />, desc: 'Trendy & fresh vibes' },
      { id: '25-30', label: '25-30', icon: <Compass size={18} />, desc: 'Smart career & casual' },
      { id: '31-40', label: '31-40', icon: <Briefcase size={18} />, desc: 'Elegant classics' },
      { id: '40+', label: '40+', icon: <Crown size={18} />, desc: 'Timeless fashion' }
    ];

    return (
      <div className="auth-container">
        {renderWizardHeader(2, "What's your age?", "This helps us show relevant style recommendations")}
        <div className="auth-body">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginTop: '10px'
          }}>
            {options.map(opt => {
              const isActive = ageGroup === opt.id;
              return (
                <div
                  key={opt.id}
                  className={`grid-card-option ${isActive ? 'active' : ''}`}
                  onClick={() => setAgeGroup(opt.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px 12px',
                    borderRadius: '16px',
                    border: isActive ? '2px solid #ff6b35' : '1.5px solid #e2e8f0',
                    backgroundColor: isActive ? '#fff7ed' : '#ffffff',
                    cursor: 'pointer',
                    gap: '8px',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 4px 12px rgba(255,107,53,0.1)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '10px', backgroundColor: isActive ? '#ffedd5' : '#f1f5f9', color: isActive ? '#ff6b35' : '#475569', marginBottom: '4px', transition: 'all 0.2s' }}>
                    {opt.icon}
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{opt.label}</span>
                  <span style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.2' }}>{opt.desc}</span>
                </div>
              );
            })}
          </div>

          <button
            className="auth-btn-primary"
            style={{ marginTop: 'auto' }}
            disabled={!ageGroup}
            onClick={() => setStep('step_categories')}
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  // Step 3: Shopping Categories (What do you shop for most?)
  const renderStepCategories = () => {
    const pills = [
      { id: 'T-Shirts', label: 'T-Shirts', icon: <Shirt size={14} /> },
      { id: 'Shirts', label: 'Shirts', icon: <Shirt size={14} /> },
      { id: 'Jeans', label: 'Jeans', icon: <Layers size={14} /> },
      { id: 'Trousers', label: 'Trousers', icon: <Layers size={14} /> },
      { id: 'Jackets', label: 'Jackets', icon: <Layers size={14} /> },
      { id: 'Shorts', label: 'Shorts', icon: <Sliders size={14} /> },
      { id: 'Ethnic Wear', label: 'Ethnic Wear', icon: <Crown size={14} /> },
      { id: 'Activewear', label: 'Activewear', icon: <Activity size={14} /> },
      { id: 'Innerwear', label: 'Innerwear', icon: <Shield size={14} /> }
    ];

    return (
      <div className="auth-container">
        {renderWizardHeader(3, "What do you shop for most?", "Select your favorite categories")}
        <div className="auth-body">
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'flex-start',
            marginTop: '10px'
          }}>
            {pills.map(opt => {
              const isActive = selectedCategories.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  className={`pill-option ${isActive ? 'active' : ''}`}
                  onClick={() => toggleCategory(opt.id)}
                >
                  <span style={{ display: 'flex', alignItems: 'center' }}>{opt.icon}</span>
                  <span>{opt.label}</span>
                </div>
              );
            })}
          </div>

          <button
            className="auth-btn-primary"
            style={{ marginTop: 'auto' }}
            disabled={selectedCategories.length === 0}
            onClick={() => setStep('step_budget')}
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  // Step 4: Budget Selection
  const renderStepBudget = () => {
    const options = [
      { id: 'Under 500', label: 'Under ₹500', icon: <Tag size={18} /> },
      { id: '500-1000', label: '₹500 - ₹1000', icon: <Tag size={18} /> },
      { id: '1000-2000', label: '₹1000 - ₹2000', icon: <Tag size={18} /> },
      { id: '2000+', label: '₹2000+', icon: <Tag size={18} /> }
    ];

    return (
      <div className="auth-container">
        {renderWizardHeader(4, "What's your typical budget?", "Per item budget helps us show relevant products")}
        <div className="auth-body" style={{ gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            {options.map(opt => {
              const isActive = budget === opt.id;

              return (
                <div
                  key={opt.id}
                  className={`card-option ${isActive ? 'active' : ''}`}
                  onClick={() => setBudget(opt.id)}
                  style={{ display: 'flex', justifyContent: 'flex-start', gap: '14px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '10px', backgroundColor: isActive ? '#ffedd5' : '#f1f5f9', color: isActive ? '#ff6b35' : '#475569', transition: 'all 0.2s ease' }}>
                    {opt.icon}
                  </div>
                  <span style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>{opt.label}</span>
                </div>
              );
            })}
          </div>

          <button
            className="auth-btn-primary"
            style={{ marginTop: 'auto' }}
            disabled={!budget}
            onClick={() => setStep('step_vibe')}
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  // Step 5: Vibe Selection (Optional)
  const renderStepVibe = () => {
    const options = [
      { id: 'Casual', label: 'Casual', icon: <Smile size={18} />, desc: 'Relaxed & comfortable' },
      { id: 'Formal', label: 'Formal', icon: <Briefcase size={18} />, desc: 'Professional & elegant' },
      { id: 'Sporty', label: 'Sporty', icon: <Activity size={18} />, desc: 'Active & athletic' },
      { id: 'Minimalist', label: 'Minimalist', icon: <Sliders size={18} />, desc: 'Simple & clean' },
      { id: 'Bold', label: 'Bold', icon: <Sparkles size={18} />, desc: 'Vibrant & expressive' },
      { id: 'Vintage', label: 'Vintage', icon: <History size={18} />, desc: 'Retro & timeless' }
    ];

    return (
      <div className="auth-container">
        {renderWizardHeader(5, "What's your vibe?", "Select one or more that match your style (optional)", true)}
        <div className="auth-body" style={{ overflowY: 'auto', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
            {options.map(opt => {
              const isActive = selectedVibes.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  className={`card-option ${isActive ? 'active' : ''}`}
                  onClick={() => toggleVibe(opt.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '10px', backgroundColor: isActive ? '#ffedd5' : '#f1f5f9', color: isActive ? '#ff6b35' : '#475569', transition: 'all 0.2s ease' }}>
                      {opt.icon}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                      <span style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>{opt.label}</span>
                      <span style={{ fontSize: '13.5px', color: '#64748b' }}>{opt.desc}</span>
                    </div>
                  </div>
                  {isActive && <Check size={18} style={{ color: '#ff6b35', strokeWidth: 3 }} />}
                </div>
              );
            })}
          </div>

          <button
            className="auth-btn-primary"
            style={{ marginTop: '16px', background: 'linear-gradient(135deg, #ff6b35 0%, #ea580c 100%)' }}
            onClick={() => executeCompleteOnboarding(true)}
          >
            Complete Quiz &amp; Claim 10% OFF
          </button>
        </div>
      </div>
    );
  };

  const renderQuizPromo = () => (
    <div className="auth-container" style={{ background: 'linear-gradient(to bottom, #fff7ed 0%, #ffffff 50%, #ffffff 100%)' }}>
      <div style={{ padding: '24px 20px 0', display: 'flex', justifyContent: 'flex-start' }}>
        <button className="auth-back-btn" onClick={() => setStep('splash')} style={{ padding: '8px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={18} style={{ color: '#0f172a' }} />
        </button>
      </div>

      <div className="auth-body" style={{ justifyContent: 'center', gap: '24px', textAlign: 'center', padding: '10px 24px 30px' }}>

        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          backgroundColor: '#fff7ed',
          color: '#ff6b35',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          boxShadow: '0 10px 24px rgba(255, 107, 53, 0.15)',
          border: '4px solid #ffedd5',
          animation: 'pulseLogo 3s ease-in-out infinite alternate'
        }}>
          <Sparkles size={40} fill="#f97316" style={{ color: '#ff6b35' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#ff6b35', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            Exclusive Welcome Offer
          </span>
          <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.5px', lineHeight: '1.15', margin: 0 }}>
            Unlock 10% OFF<br />Your First Order! <span style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '4px', color: '#ff6b35' }}><Gift size={26} strokeWidth={2.5} /></span>
          </h2>
          <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.5', fontWeight: 500, padding: '0 8px', margin: '8px 0 0' }}>
            Complete our beautiful 5-question Style Curation Quiz to tailor your boutique catalog and instantly activate an additional <b>10% Welcome Curation Discount</b>!
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', marginTop: '12px' }}>
          <button
            onClick={() => {
              setHasStyleDiscount(true);
              setStep('step_gender');
            }}
            className="auth-btn-primary"
            style={{
              padding: '18px',
              fontSize: '17px',
              fontWeight: 800,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #ff6b35 0%, #ea580c 100%)',
              boxShadow: '0 8px 24px rgba(255, 107, 53, 0.3)'
            }}
          >
            Start Curation Quiz (45s)
          </button>

          <button
            onClick={() => executeCompleteOnboarding(false)}
            className="interactive-element"
            style={{
              padding: '16px',
              fontSize: '15.5px',
              fontWeight: 700,
              borderRadius: '16px',
              border: '1.5px solid #cbd5e1',
              background: '#ffffff',
              color: '#64748b',
              cursor: 'pointer'
            }}
          >
            Skip &amp; Browse Catalog
          </button>
        </div>

        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
          Takes less than 45 seconds • Skip anytime
        </span>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        .auth-container {
          background-color: #ffffff !important;
          color: #0f172a !important;
          font-family: 'Plus Jakarta Sans', sans-serif !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
          text-rendering: optimizeLegibility !important;
          height: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          position: relative !important;
          animation: fadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        /* SVG Constellation mesh floating */
        .constellation-svg {
          animation: floatMesh 25s linear infinite !important;
          transform-origin: center center !important;
        }

        @keyframes floatMesh {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(4deg) scale(1.06); }
          100% { transform: rotate(0deg) scale(1); }
        }

        .constellation-line {
          stroke-dasharray: 4, 4;
          animation: dashMove 30s linear infinite !important;
        }

        @keyframes dashMove {
          to { stroke-dashoffset: -100; }
        }

        .constellation-node {
          transform-origin: center !important;
          transition: all 0.5s ease !important;
        }

        .node-pulse-1 { animation: floatNode 6s ease-in-out infinite alternate !important; }
        .node-pulse-2 { animation: floatNode 8s ease-in-out infinite alternate 1.5s !important; }
        .node-pulse-3 { animation: floatNode 7s ease-in-out infinite alternate 3s !important; }

        @keyframes floatNode {
          0% { stroke: rgba(255, 255, 255, 0.3); transform: scale(1); }
          100% { stroke: rgba(255, 255, 255, 0.7); transform: scale(1.12); filter: drop-shadow(0 0 6px rgba(255,255,255,0.4)); }
        }

        .constellation-orb-1 { animation: floatOrb 12s ease-in-out infinite alternate !important; }
        .constellation-orb-2 { animation: floatOrb 16s ease-in-out infinite alternate 2s !important; }
        .constellation-orb-3 { animation: floatOrb 14s ease-in-out infinite alternate 4s !important; }

        @keyframes floatOrb {
          0% { transform: translateY(0) scale(1); opacity: 0.08; }
          100% { transform: translateY(-8px) scale(1.08); opacity: 0.18; }
        }

        .splash-logo-container {
          animation: pulseLogo 4s ease-in-out infinite alternate !important;
          background: rgba(255, 255, 255, 0.08) !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
          border: 2px solid rgba(255, 255, 255, 0.9) !important;
          transition: all 0.3s ease !important;
        }

        .splash-logo-container:hover {
          transform: scale(1.05) rotate(3deg) !important;
          background: rgba(255, 255, 255, 0.15) !important;
          box-shadow: 0 8px 32px rgba(255, 107, 53, 0.25) !important;
        }

        @keyframes pulseLogo {
          0% { transform: scale(1); box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
          100% { transform: scale(1.04); box-shadow: 0 8px 30px rgba(255,255,255,0.22); }
        }

        .auth-header {
          padding: 24px 20px 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
        }

        .auth-back-btn {
          background: none !important;
          border: none !important;
          color: #0f172a !important;
          cursor: pointer !important;
          padding: 4px !important;
          display: flex !important;
          align-items: center !important;
        }

        .auth-body {
          padding: 20px 24px 28px !important;
          flex: 1 !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 16px !important;
        }

        .auth-title {
          font-size: 38px !important;
          font-weight: 800 !important;
          color: #0f172a !important;
          font-family: 'Playfair Display', serif !important;
          letter-spacing: -0.6px !important;
          line-height: 1.15 !important;
        }

        .auth-subtitle {
          font-size: 16.5px !important;
          color: #64748b !important;
          margin-top: -4px !important;
          font-weight: 400 !important;
        }

        .auth-segment {
          display: flex !important;
          background-color: #f1f5f9 !important;
          border-radius: 12px !important;
          padding: 4px !important;
          gap: 4px !important;
        }

        .auth-segment-tab {
          flex: 1 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          padding: 12px !important;
          border-radius: 9px !important;
          font-weight: 600 !important;
          font-size: 16px !important;
          border: none !important;
          cursor: pointer !important;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .auth-segment-tab.active {
          background-color: #0f172a !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15) !important;
        }

        .auth-segment-tab.inactive {
          background-color: transparent !important;
          color: #64748b !important;
        }

        .auth-segment-tab.inactive:hover {
          color: #0f172a !important;
        }

        .auth-input-group {
          display: flex !important;
          flex-direction: column !important;
          gap: 8px !important;
        }

        .auth-input-label {
          font-size: 15px !important;
          font-weight: 700 !important;
          color: #334155 !important;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .auth-input-wrapper {
          display: flex !important;
          align-items: center !important;
          border: 1.5px solid #e2e8f0 !important;
          border-radius: 14px !important;
          padding: 14px 16px !important;
          background-color: #f8fafc !important;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .auth-input-wrapper:focus-within {
          border-color: #ff6b35 !important;
          background-color: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.12) !important;
        }

        .auth-input-prefix {
          font-weight: 700 !important;
          color: #0f172a !important;
          margin-right: 8px !important;
          font-size: 17px !important;
          font-family: 'Outfit', sans-serif !important;
        }

        .auth-input {
          background: transparent !important;
          border: none !important;
          outline: none !important;
          color: #0f172a !important;
          width: 100% !important;
          font-size: 17px !important;
          font-family: 'Outfit', sans-serif !important;
        }

        .auth-input::placeholder {
          color: #94a3b8 !important;
        }

        .auth-link {
          font-size: 15.5px !important;
          color: #64748b !important;
          text-decoration: none !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          transition: color 0.2s !important;
        }

        .auth-link:hover {
          color: #ff6b35 !important;
        }

        .auth-link-right {
          align-self: flex-end !important;
          margin-top: -4px !important;
        }

        .auth-btn-primary {
          width: 100% !important;
          padding: 17px !important;
          background: linear-gradient(135deg, #ff6b35 0%, #ea580c 100%) !important;
          border: none !important;
          border-radius: 16px !important;
          color: #ffffff !important;
          font-weight: 700 !important;
          font-size: 18px !important;
          cursor: pointer !important;
          font-family: 'Outfit', sans-serif !important;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3) !important;
        }

        .auth-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 24px rgba(255, 107, 53, 0.45) !important;
        }

        .auth-btn-primary:active:not(:disabled) {
          transform: translateY(0px) scale(0.97) !important;
        }

        .auth-btn-primary:disabled {
          background: #cbd5e1 !important;
          color: #94a3b8 !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
        }

        .auth-divider {
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          margin: 8px 0 !important;
        }

        .auth-divider-line {
          flex: 1 !important;
          height: 1.5px !important;
          background-color: #f1f5f9 !important;
        }

        .auth-divider-text {
          font-size: 13px !important;
          color: #94a3b8 !important;
          font-weight: 600;
        }

        .auth-btn-google {
          width: 100% !important;
          padding: 16px !important;
          background: #ffffff !important;
          border: 1.5px solid #ff6b35 !important;
          border-radius: 16px !important;
          color: #ff6b35 !important;
          font-weight: 700 !important;
          font-size: 17px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 10px !important;
          font-family: 'Outfit', sans-serif !important;
          cursor: pointer !important;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .auth-btn-google:hover {
          background-color: rgba(255, 107, 53, 0.04) !important;
          transform: translateY(-1.5px) !important;
          box-shadow: 0 4px 14px rgba(255,107,53,0.1) !important;
        }

        .auth-btn-google:active {
          transform: translateY(0px) scale(0.97) !important;
        }

        .auth-footer {
          text-align: center !important;
          font-size: 16px !important;
          color: #64748b !important;
          margin-top: auto !important;
          padding-top: 16px !important;
          font-weight: 500;
        }

        .auth-footer-link {
          color: #ff6b35 !important;
          font-weight: 700 !important;
          cursor: pointer !important;
          text-decoration: underline !important;
        }

        .otp-square-box {
          width: 46px !important;
          height: 46px !important;
          border: 1.5px solid #cbd5e1 !important;
          border-radius: 8px !important;
          background-color: #f8fafc !important;
          color: #0f172a !important;
          text-align: center !important;
          font-size: 22px !important;
          font-weight: 700 !important;
          outline: none !important;
          transition: all 0.2s ease !important;
        }

        .otp-square-box:focus {
          border-color: #ff6b35 !important;
          background-color: #ffffff !important;
          box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.15) !important;
          transform: scale(1.05);
        }

        .circular-spinner-vector {
          width: 48px;
          height: 48px;
          border: 4px solid #f1f5f9;
          border-top: 4px solid #ff6b35;
          border-radius: 50%;
          animation: spinCircular 1s linear infinite;
        }

        .animate-spin {
          animation: spinCircular 1s linear infinite !important;
        }

        @keyframes spinCircular {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* PERSONALIZATION CARDS STYLING */
        .card-option {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 18px 22px !important;
          border-radius: 18px !important;
          border: 1.5px solid #e2e8f0 !important;
          background-color: #ffffff !important;
          cursor: pointer !important;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
          box-shadow: 0 2px 4px rgba(15,23,42,0.01) !important;
        }

        .card-option:hover {
          transform: translateY(-3px) !important;
          border-color: #ff6b35 !important;
          box-shadow: 0 6px 18px rgba(255,107,53,0.08) !important;
        }

        .card-option.active {
          border-color: #ff6b35 !important;
          background-color: #fff7ed !important;
          transform: translateY(-3px) scale(1.015) !important;
          box-shadow: 0 8px 22px rgba(255,107,53,0.14) !important;
        }

        .card-option:active {
          transform: translateY(0px) scale(0.985) !important;
        }

        .grid-card-option {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 22px 14px !important;
          border-radius: 18px !important;
          border: 1.5px solid #e2e8f0 !important;
          background-color: #ffffff !important;
          cursor: pointer !important;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
          gap: 8px !important;
          text-align: center !important;
          box-shadow: 0 2px 4px rgba(15,23,42,0.01) !important;
        }

        .grid-card-option:hover {
          transform: translateY(-3px) !important;
          border-color: #ff6b35 !important;
          box-shadow: 0 6px 18px rgba(255,107,53,0.08) !important;
        }

        .grid-card-option.active {
          border-color: #ff6b35 !important;
          background-color: #fff7ed !important;
          transform: translateY(-4px) scale(1.025) !important;
          box-shadow: 0 8px 22px rgba(255,107,53,0.14) !important;
        }

        .grid-card-option:active {
          transform: translateY(0px) scale(0.975) !important;
        }

        .pill-option {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          padding: 12px 22px !important;
          border-radius: 24px !important;
          border: 1.5px solid #cbd5e1 !important;
          font-size: 15px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
          background-color: #ffffff !important;
          color: #475569 !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02) !important;
        }

        .pill-option:hover {
          border-color: #ff6b35 !important;
          color: #ff6b35 !important;
          transform: translateY(-2px) !important;
        }

        .pill-option.active {
          background: linear-gradient(135deg, #ff6b35 0%, #ea580c 100%) !important;
          color: #ffffff !important;
          border-color: #ea580c !important;
          transform: translateY(-3px) scale(1.04) !important;
          box-shadow: 0 6px 16px rgba(255, 107, 53, 0.25) !important;
        }

        .pill-option:active {
          transform: translateY(0px) scale(0.96) !important;
        }

        .radio-circle {
          width: 20px !important;
          height: 20px !important;
          border-radius: 50% !important;
          border: 2px solid #cbd5e1 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .radio-circle.active {
          border-color: #ff6b35 !important;
          background-color: #ff6b35 !important;
          animation: pulseBorder 1.5s infinite !important;
        }

        @keyframes pulseBorder {
          0% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(255, 107, 53, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0); }
        }

        .radio-inner {
          width: 8px !important;
          height: 8px !important;
          border-radius: 50% !important;
          background-color: #ffffff !important;
        }
      `}</style>

      <div style={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', background: '#ffffff' }}>
        <div id="recaptcha-container"></div>
        {/* Scrollable screen */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {step === 'splash' && renderSplash()}
          {step === 'signin' && renderSignIn()}
          {step === 'signup' && renderSignUp()}
          {step === 'otp' && renderOtp()}
          {step === 'loader' && renderLoader()}
          {step === 'phone_prompt' && renderPhonePrompt()}

          {step === 'quiz_promo' && renderQuizPromo()}

          {/* Personalization wizard steps */}
          {step === 'step_gender' && renderStepGender()}
          {step === 'step_age' && renderStepAge()}
          {step === 'step_categories' && renderStepCategories()}
          {step === 'step_budget' && renderStepBudget()}
          {step === 'step_vibe' && renderStepVibe()}
        </div>
      </div>
    </>
  );
}

export default OnboardingFlow;

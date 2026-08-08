import { useState, useEffect, Suspense, lazy, useMemo } from 'react';
import { useSound, type SoundType } from '../hooks/useSound';
import { motion, AnimatePresence } from 'framer-motion';

// Define exactly what data a toast notification holds
interface ToastMessage {
  id: number;
  msg: string;
  type: 'success' | 'error';
  order: number;
}

// Custom error class to securely pass the 'type' flag without breaking TypeScript
class APIError extends Error {
  type?: string;
  constructor(message: string, type?: string) {
    super(message);
    this.type = type;
    this.name = 'APIError';
  }
}

// Bulletproof Code Splitting
const ElectricBorder = lazy(() => import('./ElectricBorder'));
const ClientStats = lazy(() => import('./ClientStats'));

// Custom Hook for Debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Reusable Spinner Component
const LoadingSpinner = () => (
  <svg 
    style={{ animation: 'spin 1s linear infinite', width: '18px', height: '18px', marginRight: '8px' }} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25"></circle>
    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Helper function to generate 1st, 2nd, 3rd...
function getOrdinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// THE CLEVER FIX: Placed OUTSIDE the component to prevent memory reallocation on every re-render.
// This safely scans strings for emails and converts them to clickable anchor tags.
const renderMessage = (text: string) => {
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const parts = text.split(emailRegex);
  
  return parts.map((part, index) => {
    if (part.match(emailRegex)) {
      return (
        <a 
          key={index} 
          href={`mailto:${part}`}
          style={{ 
            color: '#ffd670', // Matches your ElectricBorder gold
            textDecoration: 'underline', 
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
          onClick={(e) => e.stopPropagation()} // Prevents the click from activating the toast background
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

// THE FIX: Component now accepts 'depthIndex' to calculate 3D stacking math in O(1) time
const ToastItem = ({ 
  toast, 
  onClose, 
  playSound, 
  isMobile, 
  isActive, 
  onActivate,
  depthIndex
}: { 
  toast: ToastMessage, 
  onClose: (id: number, manual: boolean) => void, 
  playSound: (sound: SoundType) => void,
  isMobile: boolean,
  isActive: boolean,
  onActivate: (id: number) => void,
  depthIndex: number
}) => {
  const INITIAL_TIME = 5;
  const MAX_TIME = 30;
  
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [totalTime, setTotalTime] = useState(INITIAL_TIME);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          onClose(toast.id, false); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [toast.id, onClose]);

  const addTime = () => {
    playSound('click');
    setTimeLeft((prev) => {
      const updated = prev + 5;
      return updated > MAX_TIME ? MAX_TIME : updated;
    });
    setTotalTime((prev) => {
      const updated = prev + 5;
      return updated > MAX_TIME ? MAX_TIME : updated;
    });
  };

  const isSuccess = toast.type === 'success';
  const themeColor = isSuccess ? '#22c55e' : '#ef4444';
  
  // Apple iOS Notification transparent gradient
  const themeGradient = isSuccess 
    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.85), rgba(22, 163, 74, 0.85))' 
    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.85), rgba(220, 38, 38, 0.85))';

  // --- MOBILE MINIMIZED CIRCLE UI ---
  if (isMobile && !isActive) {
    return (
      <motion.div
        layout
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        style={{
          position: 'relative',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          cursor: 'pointer',
          order: 1 
        }}
        onClick={() => {
          playSound('click');
          onActivate(toast.id);
        }}
      >
        <svg width="60" height="60" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
          <circle cx="30" cy="30" r="26" stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill={themeColor} />
          <motion.circle
            cx="30" cy="30" r="26"
            stroke="#fff"
            strokeWidth="4"
            fill="none"
            strokeDasharray={2 * Math.PI * 26}
            animate={{ strokeDashoffset: (2 * Math.PI * 26) * (1 - (timeLeft / totalTime)) }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </svg>
        <span style={{ color: '#fff', fontWeight: 'bold', zIndex: 2, fontSize: '13px' }}>
          {getOrdinal(toast.order)}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation(); 
            addTime();
          }}
          disabled={timeLeft >= MAX_TIME}
          style={{
            position: 'absolute',
            bottom: '-4px',
            right: '-8px',
            background: '#fff',
            color: themeColor,
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '10px',
            padding: '2px 6px',
            fontSize: '10px',
            fontWeight: '900',
            cursor: timeLeft >= MAX_TIME ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
            zIndex: 3,
            opacity: timeLeft >= MAX_TIME ? 0.5 : 1
          }}
        >
          +5s
        </button>
      </motion.div>
    );
  }

  // --- O(1) MATRIX MATH FOR DESKTOP 3D STACK ---
  const isVisible = isMobile ? true : depthIndex <= 2;
  const desktopScale = isMobile ? 1 : Math.max(0, 1 - (depthIndex * 0.05));
  const desktopY = isMobile ? 0 : -(depthIndex * 14); // Pushes older toasts up behind the active one
  const desktopZ = 50 - depthIndex;
  const desktopOpacity = isVisible ? (1 - depthIndex * 0.2) : 0;

  // --- FULL DESKTOP / ACTIVE MOBILE UI ---
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ 
        opacity: isMobile ? 1 : desktopOpacity, 
        y: desktopY, 
        scale: desktopScale,
        zIndex: desktopZ
      }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      style={{
        position: isMobile ? 'relative' : 'absolute',
        top: 0,
        order: isActive ? -1 : 0, 
        
        width: isMobile ? '100%' : '500px',
        maxWidth: isMobile ? '320px' : '100%',
        margin: '0 auto',
        
        background: themeGradient,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)', 
        border: '1px solid rgba(255,255,255,0.2)',
        
        color: 'white',
        padding: '16px',
        borderRadius: '20px',
        boxShadow: depthIndex === 0 ? '0 15px 35px rgba(0,0,0,0.3)' : 'none',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: depthIndex === 0 ? 'auto' : 'none', // Only the top card is clickable
        transformOrigin: 'top center'
      }}
    >
      <div style={{ position: 'absolute', top: '10px', left: '14px', fontSize: '11px', fontWeight: 'bold', opacity: 0.9, backgroundColor: 'rgba(0,0,0,0.25)', padding: '2px 6px', borderRadius: '4px' }}>
        {getOrdinal(toast.order)}
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onClose(toast.id, true);
        }} 
        style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer', padding: '4px', fontSize: '14px' }}
      >
        ✕
      </button>

      {/* THE FIX: Added whiteSpace: 'pre-wrap' and the renderMessage regex wrapper */}
      <div style={{ marginTop: '20px', fontSize: isMobile ? '14px' : '15px', lineHeight: '1.4', paddingRight: '12px', wordBreak: 'break-word', fontWeight: '500', textAlign: 'left', whiteSpace: 'pre-wrap' }}>
        {renderMessage(toast.msg)}
      </div>

      <div style={{ marginTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "12px", opacity: 0.9, fontWeight: '600' }}>
          Closing in {timeLeft}s...
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            addTime();
          }}
          disabled={timeLeft >= MAX_TIME}
          style={{
            padding: "4px 12px",
            fontSize: "12px",
            borderRadius: "12px",
            border: "none",
            cursor: timeLeft >= MAX_TIME ? "not-allowed" : "pointer",
            background: "rgba(255,255,255,0.2)",
            color: "#fff",
            fontWeight: 700,
            opacity: timeLeft >= MAX_TIME ? 0.6 : 1,
            backdropFilter: 'blur(4px)',
            transition: 'opacity 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          +5s
        </button>
      </div>

      <motion.div
        key={timeLeft}
        initial={{ width: `${(timeLeft / totalTime) * 100}%` }}
        animate={{ width: "0%" }}
        transition={{ duration: timeLeft, ease: "linear" }}
        style={{ height: "4px", background: "rgba(255,255,255,0.8)", borderRadius: "2px", marginTop: "12px" }}
      />
    </motion.div>
  );
};

export default function ContactFooter() {
  const API_URL = 'https://my-portfolio-system.onrender.com/api';
  const { playSound } = useSound();
  
  // Viewport detection
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // THE FIX: Initialize state correctly on mount instead of using useEffect double-renders
  const [name, setName] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('verifiedContact');
      if (saved) return JSON.parse(saved).savedName as string;
    }
    return '';
  });
  
  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('verifiedContact');
      if (saved) return JSON.parse(saved).savedEmail as string;
      return sessionStorage.getItem('pendingVerification') || '';
    }
    return '';
  });
  
  const [message, setMessage] = useState('');
  const [otp, setOtp] = useState('');
  
  const [apiError, setApiError] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('verifiedContact')) return false;
      return !!sessionStorage.getItem('pendingVerification');
    }
    return false;
  });
  
  const [isVerified, setIsVerified] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('verifiedContact');
    }
    return false;
  });
  
  const [isLoadingOtp, setIsLoadingOtp] = useState(false);
  const [isLoadingVerify, setIsLoadingVerify] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeToastId, setActiveToastId] = useState<number | null>(null);
  
  const debouncedEmail = useDebounce(email, 500);

  // THE FIX: Derived state via useMemo prevents re-renders while typing
  const emailError = useMemo(() => {
    if (apiError) return apiError;
    if (debouncedEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !emailRegex.test(debouncedEmail) ? 'Invalid email format' : '';
    }
    return '';
  }, [debouncedEmail, apiError]);

  const setToast = (data: {msg: string, type: 'success' | 'error'} | null) => {
    if (data === null) {
      setToasts([]);
      setActiveToastId(null);
    } else {
      const newId = Date.now() + Math.random();
      setToasts(currQueue => {
        let nextOrder = 1;
        if (currQueue.length > 0) {
          nextOrder = currQueue[currQueue.length - 1].order + 1;
        }
        return [...currQueue, { id: newId, msg: data.msg, type: data.type, order: nextOrder }];
      });
      setActiveToastId(newId);
    }
  };

  const removeToast = (id: number, manual: boolean = false) => {
    if (manual) playSound('click');
    setToasts(curr => {
      const filtered = curr.filter(t => t.id !== id);
      setActiveToastId(prevActive => {
        if (filtered.length === 0) return null;
        if (!filtered.find(t => t.id === prevActive)) return filtered[filtered.length - 1].id;
        return prevActive;
      });
      return filtered;
    });
  };

  useEffect(() => {
    if (isVerified) {
      localStorage.setItem('verifiedContact', JSON.stringify({ savedName: name, savedEmail: email }));
    }
  }, [name, email, isVerified]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    document.body.classList.add('keyboard-open');
    const target = e.target;
    setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
  };

  const handleBlur = () => {
    setTimeout(() => {
      const active = document.activeElement;
      if (!active || (active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA')) {
        document.body.classList.remove('keyboard-open');
      }
    }, 100);
  };

  useEffect(() => {
    const handleTouchOutside = (e: TouchEvent | MouseEvent) => {
      const active = document.activeElement as HTMLElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
        const target = e.target as HTMLElement;
        if (!target.closest('input, textarea, button')) active.blur();
      }
    };
    document.addEventListener('touchstart', handleTouchOutside, { passive: true });
    document.addEventListener('mousedown', handleTouchOutside);
    return () => {
      document.removeEventListener('touchstart', handleTouchOutside);
      document.removeEventListener('mousedown', handleTouchOutside);
    };
  }, []);

  const handleClear = () => {
    (document.activeElement as HTMLElement)?.blur();
    playSound('click');
    localStorage.removeItem('verifiedContact');
    sessionStorage.removeItem('pendingVerification'); 
    setName('');
    setEmail('');
    setMessage('');
    setIsVerified(false);
    setIsOtpSent(false);
    setOtp('');
    setApiError('');
  };

  const handleSendOtp = async () => {
    (document.activeElement as HTMLElement)?.blur(); 
    if (emailError || !email) return;
    playSound('click');
    setIsLoadingOtp(true);
    
    try {
      const response = await fetch(`${API_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      playSound('success');
      setIsOtpSent(true);
      sessionStorage.setItem('pendingVerification', email); 
      setToast({ msg: `Verification code successfully sent to ${email}`, type: 'success' });
    } catch (error: unknown) {
      playSound('error');
      setToast({ msg: (error as Error).message || 'Failed', type: 'error' });
      setApiError('Failed to send code.');
    } finally {
      setIsLoadingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    (document.activeElement as HTMLElement)?.blur(); 
    if (otp.length !== 5) {
      playSound('error');
      setToast({ msg: 'Please enter a 5-digit code.', type: 'error' });
      return;
    }
    playSound('click');
    setIsLoadingVerify(true);

    try {
      const response = await fetch(`${API_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new APIError(data.error, data.type);
      }

      playSound('success');
      setIsVerified(true);
      setIsOtpSent(false);
      sessionStorage.removeItem('pendingVerification'); 
      localStorage.setItem('verifiedContact', JSON.stringify({ savedName: name, savedEmail: email }));
    } catch (error: unknown) {
      playSound('error');
      const err = error as APIError;
      setToast({ msg: err.message || 'Invalid OTP', type: 'error' });

      if (err.type === 'EXPIRED') {
        setIsOtpSent(false);
        setOtp('');
        sessionStorage.removeItem('pendingVerification');
      }
    } finally {
      setIsLoadingVerify(false);
    }
  };

  const handleSubmit = async () => {
    (document.activeElement as HTMLElement)?.blur(); 
    if (!name || !email || !message || !isVerified) {
      playSound('error');
      setToast({ msg: 'Please fill all required fields and verify your email.', type: 'error' });
      return;
    }
    playSound('click');
    setIsLoadingSubmit(true);

    try {
      const response = await fetch(`${API_URL}/submit-contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      playSound('success');
      setToast({ msg: 'Message sent successfully!', type: 'success' });
      setMessage(''); 
    } catch (error: unknown) {
      playSound('error');
      setToast({ msg: (error as Error).message || 'Failed to send message.', type: 'error' });
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: 'var(--card-bg)',
    color: 'var(--text-main)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
    transition: 'opacity 0.2s ease'
  };

  return (
    <footer id='contact' style={{ padding: '4rem 1rem', backgroundColor: 'var(--bg-color)', minHeight: '100vh', position: 'relative' }}>
      
      <style>
        {`
          body.keyboard-open button[style*="position: fixed"] {
            opacity: 0 !important;
            pointer-events: none !important;
            transform: translateY(20px) scale(0.9) !important;
            transition: all 0.2s ease-in-out !important;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      {/* THE FIX: Desktop Top-Center absolute container / Mobile fixed flexbox */}
      <div style={{
        position: 'fixed',
        // Desktop positions top-center exactly like an Apple Notification. Mobile positions top-right.
        top: isMobile ? '20px' : '32px',
        left: isMobile ? '0' : '50%',
        transform: isMobile ? 'none' : 'translateX(-50%)',
        width: isMobile ? '100%' : '500px',
        zIndex: 9999,
        display: 'flex',
        flexFlow: isMobile ? 'row wrap' : 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px',
        padding: '0 20px',
        boxSizing: 'border-box',
        pointerEvents: 'none' 
      }}>
        <AnimatePresence>
          {toasts.map((t, index) => {
            // Calculate depth from the top (newest toast is at the end of the array)
            const depthIndex = toasts.length - 1 - index;
            return (
              <ToastItem 
                key={t.id} 
                toast={t} 
                onClose={removeToast} 
                playSound={playSound}
                isMobile={isMobile}
                isActive={isMobile ? t.id === activeToastId : true}
                onActivate={setActiveToastId}
                depthIndex={depthIndex}
              />
            );
          })}
        </AnimatePresence>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        <Suspense fallback={<div style={{ minHeight: '400px', width: '100%', backgroundColor: 'var(--bg-color)', borderRadius: '16px', border: '1px solid var(--border-color)' }} />}>
          <ElectricBorder color="#ffd670" speed={1.5} chaos={0.15} borderRadius={16}>
            <div style={{ backgroundColor: 'var(--bg-color)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', position: 'relative', zIndex: 10 }}>
              <h2 style={{ textAlign: 'center', color: 'var(--text-main)', marginBottom: '2rem' }}>CONTACT</h2>
              
              <div style={{ marginBottom: '16px' }}>
                <input id='name' name='name' type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} onFocus={handleFocus} onBlur={handleBlur} style={{ ...inputStyle, opacity: isLoadingSubmit ? 0.6 : 1 }} disabled={isLoadingSubmit} autoComplete='name' />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '4px' }}>
                <input 
                  id='email' name='email' type="email" placeholder="Your Email" value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setApiError('');
                    if (isOtpSent) {
                      setIsOtpSent(false); setOtp(''); sessionStorage.removeItem('pendingVerification');
                    }
                  }}
                  onFocus={handleFocus} onBlur={handleBlur} disabled={isVerified || isLoadingOtp || isLoadingSubmit} autoComplete='email'
                  style={{ ...inputStyle, opacity: (isVerified || isLoadingOtp) ? 0.6 : 1, flex: 1 }}
                />
                
                {isVerified ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ padding: '0 16px', backgroundColor: 'var(--underline-green)', color: 'var(--text-main)', borderRadius: '6px', display: 'flex', alignItems: 'center', border: '1px solid var(--highlight-green)' }}>✓ Verified</span>
                    <button onClick={handleClear} disabled={isLoadingSubmit} style={{ padding: '0 16px', backgroundColor: 'var(--card-bg)', color: 'var(--text-muted)', borderRadius: '6px', border: '1px solid var(--border-color)', cursor: isLoadingSubmit ? 'not-allowed' : 'pointer', opacity: isLoadingSubmit ? 0.5 : 1 }}>Clear</button>
                  </div>
                ) : (
                  <button 
                    onClick={handleSendOtp} 
                    disabled={!!emailError || !email || isLoadingOtp || isOtpSent}
                    style={{ padding: '0 24px', backgroundColor: 'var(--pill-bg)', border: '1px solid var(--pill-border)', borderRadius: '6px', cursor: (!!emailError || !email || isLoadingOtp || isOtpSent) ? 'not-allowed' : 'pointer', opacity: (!!emailError || !email || isLoadingOtp || isOtpSent) ? 0.6 : 1, fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '100px' }}
                  >
                    <p style={{color: 'var(--pill-text)', display: 'flex', alignItems: 'center', margin: 0}}>
                      <b>{isLoadingOtp ? <><LoadingSpinner /> Sending</> : (isOtpSent ? 'Code Sent ↓' : 'Verify')}</b>
                    </p>
                  </button>
                )}
              </div>
              
              {emailError && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '4px 0 16px 0' }}>{emailError}</p>}

              {isOtpSent && !isVerified && (
                <div style={{ marginBottom: '16px', marginTop: '12px' }}>
                  <input type="text" placeholder="Enter 5-digit OTP" maxLength={5} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} onFocus={handleFocus} onBlur={handleBlur} disabled={isLoadingVerify} style={{ ...inputStyle, marginBottom: '8px', textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem', opacity: isLoadingVerify ? 0.6 : 1 }} autoComplete='one-time-code' />
                  <button onClick={handleVerifyOtp} disabled={isLoadingVerify || otp.length !== 5} style={{ width: '100%', padding: '12px', backgroundColor: 'var(--orange)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: (isLoadingVerify || otp.length !== 5) ? 'not-allowed' : 'pointer', opacity: (isLoadingVerify || otp.length !== 5) ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isLoadingVerify ? <><LoadingSpinner /> Verifying...</> : 'Submit OTP'}
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '16px', padding: '12px', backgroundColor: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '6px' }}>
                <span style={{ fontSize: '1.1rem' }}>🔒</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  <strong>Privacy Note:</strong> I only store your verified email address to prevent spam. Your actual message goes straight to my personal inbox and is never saved in any database. Your data is perfectly safe with me.
                </p>
              </div>

              <textarea placeholder="Your Message" name='msg' value={message} onChange={(e) => setMessage(e.target.value)} onFocus={handleFocus} onBlur={handleBlur} disabled={isLoadingSubmit} style={{ ...inputStyle, minHeight: '120px', marginTop: '16px', resize: 'vertical', opacity: isLoadingSubmit ? 0.6 : 1 }} />

              <div style={{ marginTop: '24px' }}>
                <button 
                  onClick={handleSubmit} 
                  disabled={isLoadingSubmit || !isVerified}
                  style={{ width: '100%', padding: '16px', backgroundColor: isVerified ? 'var(--pill-bg)' : 'var(--card-bg)', color: isVerified ? 'var(--pill-main)' : 'var(--text-muted)', border: `1px solid ${isVerified ? 'var(--orange)' : 'var(--border-color)'}`, borderRadius: '6px', fontWeight: 'bold', fontSize: '1.1rem', cursor: (isLoadingSubmit || !isVerified) ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s', opacity: (isLoadingSubmit || !isVerified) ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseOver={(e) => { if (!isLoadingSubmit && isVerified) e.currentTarget.style.backgroundColor = 'var(--orange)'; }}
                  onMouseOut={(e) => { if (!isLoadingSubmit && isVerified) e.currentTarget.style.backgroundColor = 'var(--pill-bg)'; }}
                >
                  {isLoadingSubmit ? <><LoadingSpinner /> Sending Message...</> : "Let's Talk"}
                </button>
              </div>

            </div>
          </ElectricBorder>
        </Suspense>

        <Suspense fallback={<div style={{ minHeight: '150px' }} />}>
          <ClientStats />
        </Suspense>

      </div>
    </footer>
  );
}
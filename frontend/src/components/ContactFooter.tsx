import React, { useState, useEffect, Suspense, lazy, useMemo, useRef } from 'react';
import { useSound, type SoundType } from '../hooks/useSound';
import HighlightText from '../MicroService/HighlightText';
import UnderlineText from '../MicroService/UnderlineText';

interface ToastMessage {
  id: number;
  msg: string;
  type: 'success' | 'error';
  order: number;
  isExiting?: boolean; 
}

class APIError extends Error {
  type?: string;
  constructor(message: string, type?: string) {
    super(message);
    this.type = type;
    this.name = 'APIError';
  }
}

const ElectricBorder = lazy(() => import('../MicroService/ElectricBorder'));
const ClientStats = lazy(() => import('./ClientStats'));

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

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

function getOrdinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

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
            color: '#ffd670',
            textDecoration: 'underline', 
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
          onClick={(e) => e.stopPropagation()} 
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const CIRCUMFERENCE = 2 * Math.PI * 26;
const MAX_TIME_MS = 30000;

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
  
  const [displaySeconds, setDisplaySeconds] = useState(5);
  const [isPaused, setIsPaused] = useState(false);
  const [totalTimeMs, setTotalTimeMs] = useState(5000);
  
  const [isMounted, setIsMounted] = useState(false);

  const remainingMsRef = useRef(5000);
  const endTimeRef = useRef<number>(0); 
  const rAFRef = useRef<number | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const circleProgressRef = useRef<SVGCircleElement>(null);
  const lastSecondsRef = useRef(5);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const tid = setTimeout(() => setIsPaused(false), 0);
    return () => clearTimeout(tid);
  }, [isActive]);

  useEffect(() => {
    if (isPaused || toast.isExiting) return; 

    endTimeRef.current = Date.now() + remainingMsRef.current;

    const updateTimer = () => {
      const now = Date.now();
      const timeLeft = Math.max(0, endTimeRef.current - now);
      remainingMsRef.current = timeLeft;

      const percentage = timeLeft / totalTimeMs;

      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${percentage * 100}%`;
      }
      if (circleProgressRef.current) {
        circleProgressRef.current.style.strokeDashoffset = `${CIRCUMFERENCE * (1 - percentage)}`;
      }

      const secondsLeft = Math.ceil(timeLeft / 1000);
      if (secondsLeft !== lastSecondsRef.current) {
        lastSecondsRef.current = secondsLeft;
        setDisplaySeconds(secondsLeft);
      }

      if (timeLeft <= 0) {
        onClose(toast.id, false);
      } else {
        rAFRef.current = requestAnimationFrame(updateTimer);
      }
    };

    rAFRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
    };
  }, [isPaused, totalTimeMs, toast.id, onClose, toast.isExiting]);

  const addTime = () => {
    playSound('click');
    const newRemaining = Math.min(remainingMsRef.current + 5000, MAX_TIME_MS);
    const newTotal = Math.min(totalTimeMs + 5000, MAX_TIME_MS);
    
    remainingMsRef.current = newRemaining;
    setTotalTimeMs(newTotal);

    if (!isPaused) {
      endTimeRef.current = Date.now() + newRemaining;
    }

    const percentage = newRemaining / newTotal;
    if (progressBarRef.current) progressBarRef.current.style.width = `${percentage * 100}%`;
    if (circleProgressRef.current) circleProgressRef.current.style.strokeDashoffset = `${CIRCUMFERENCE * (1 - percentage)}`;
    
    const secondsLeft = Math.ceil(newRemaining / 1000);
    lastSecondsRef.current = secondsLeft;
    setDisplaySeconds(secondsLeft);
  };

  const isSuccess = toast.type === 'success';
  const themeColor = isSuccess ? '#22c55e' : '#ef4444';
  const themeGradient = isSuccess 
    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.85), rgba(22, 163, 74, 0.85))' 
    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.85), rgba(220, 38, 38, 0.85))';

  if (isMobile && !isActive) {
    return (
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onTouchCancel={() => setIsPaused(false)}
        style={{
          position: 'relative',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          cursor: 'pointer',
          order: 1,
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          opacity: (!isMounted || toast.isExiting) ? 0 : 1,
          transform: (!isMounted || toast.isExiting) ? 'scale(0.8)' : 'scale(1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onClick={() => {
          playSound('click');
          onActivate(toast.id);
        }}
      >
        <svg width="60" height="60" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
          <circle cx="30" cy="30" r="26" stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill={themeColor} />
          <circle
            ref={circleProgressRef}
            cx="30" cy="30" r="26"
            stroke="#fff"
            strokeWidth="4"
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={0}
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
          disabled={displaySeconds >= 30}
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
            cursor: displaySeconds >= 30 ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
            zIndex: 3,
            opacity: displaySeconds >= 30 ? 0.5 : 1
          }}
        >
          +5s
        </button>
      </div>
    );
  }

  const isVisible = isMobile ? true : depthIndex <= 2;
  const desktopScale = isMobile ? 1 : Math.max(0, 1 - (depthIndex * 0.05));
  const desktopY = isMobile ? 0 : -(depthIndex * 14); 
  const desktopZ = 50 - depthIndex;
  const desktopOpacity = isVisible ? (1 - depthIndex * 0.2) : 0;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      onTouchCancel={() => setIsPaused(false)}
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
        pointerEvents: depthIndex === 0 ? 'auto' : 'none', 
        transformOrigin: 'top center',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        zIndex: desktopZ,
        opacity: (!isMounted || toast.isExiting) ? 0 : (isMobile ? 1 : desktopOpacity),
        transform: (!isMounted || toast.isExiting) 
          ? (isMobile ? 'scale(0.8)' : 'translateY(-50px) scale(0.9)') 
          : (isMobile ? 'scale(1)' : `translateY(${desktopY}px) scale(${desktopScale})`),
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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

      <div style={{ marginTop: '20px', fontSize: isMobile ? '14px' : '15px', lineHeight: '1.4', paddingRight: '12px', wordBreak: 'break-word', fontWeight: '500', textAlign: 'left', whiteSpace: 'pre-wrap' }}>
        {renderMessage(toast.msg)}
      </div>

      <div style={{ marginTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "12px", opacity: 0.9, fontWeight: '600' }}>
          Closing in {displaySeconds}s...
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            addTime();
          }}
          disabled={displaySeconds >= 30}
          style={{
            padding: "4px 12px",
            fontSize: "12px",
            borderRadius: "12px",
            border: "none",
            cursor: displaySeconds >= 30 ? "not-allowed" : "pointer",
            background: "rgba(255,255,255,0.2)",
            color: "#fff",
            fontWeight: 700,
            opacity: displaySeconds >= 30 ? 0.6 : 1,
            backdropFilter: 'blur(4px)',
            transition: 'opacity 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          +5s
        </button>
      </div>

      <div
        ref={progressBarRef}
        style={{ 
          width: "100%",
          height: "4px", 
          background: "rgba(255,255,255,0.8)", 
          borderRadius: "2px", 
          marginTop: "12px"
        }}
      />
    </div>
  );
};


export default function ContactFooter() {
  const API_URL = 'https://my-portfolio-system.onrender.com/api';
  const { playSound } = useSound();
  
  const footerRef = useRef<HTMLDivElement>(null);
  
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    setToasts(curr => curr.map(t => t.id === id ? { ...t, isExiting: true } : t));
    setTimeout(() => {
      setToasts(curr => {
        const filtered = curr.filter(t => t.id !== id);
        setActiveToastId(prevActive => {
          if (filtered.length === 0) return null;
          if (prevActive === id) {
            const validToasts = filtered.filter(t => !t.isExiting);
            return validToasts.length > 0 ? validToasts[validToasts.length - 1].id : null;
          }
          return prevActive;
        });
        return filtered;
      });
    }, 300);
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

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    playSound('click');
    window.dispatchEvent(
      new CustomEvent('fire-spark', {
        detail: { x: e.clientX, y: e.clientY }
      })
    );
  };

  const handleBlur = () => {
    setTimeout(() => {
      const active = document.activeElement;
      if (!active || (active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA')) {
        document.body.classList.remove('keyboard-open');
      }
    }, 100);
  };

  // THE FIX: Advanced scroll-aware tap-out detection
  useEffect(() => {
    let isScrolling = false;

    const handleTouchStart = () => { isScrolling = false; };
    const handleTouchMove = () => { isScrolling = true; };

    const handleOutsideInteraction = (e: TouchEvent | MouseEvent) => {
      const active = document.activeElement as HTMLElement;
      
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
        const target = e.target as HTMLElement;
        
        // If the user tapped another button or input inside the form, let its own handler trigger the spark
        if (target.closest('input, textarea, button')) {
          return;
        }

        // MOBILE EDGE CASE: If the user swiped to scroll, close the keyboard but SUPPRESS sound/spark
        if (e.type === 'touchend' && isScrolling) {
          active.blur();
          return;
        }

        // Otherwise, it was a deliberate "Tap Out" on an empty space
        active.blur();
        playSound('click');

        let clientX = 0;
        let clientY = 0;

        if ('changedTouches' in e && e.changedTouches.length > 0) {
          clientX = e.changedTouches[0].clientX;
          clientY = e.changedTouches[0].clientY;
        } else if ('clientX' in e) {
          clientX = (e as MouseEvent).clientX;
          clientY = (e as MouseEvent).clientY;
        }

        window.dispatchEvent(
          new CustomEvent('fire-spark', {
            detail: { x: clientX, y: clientY }
          })
        );
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    // Using touchend instead of touchstart allows us to check if a scroll happened first
    document.addEventListener('touchend', handleOutsideInteraction);
    document.addEventListener('mousedown', handleOutsideInteraction);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleOutsideInteraction);
      document.removeEventListener('mousedown', handleOutsideInteraction);
    };
  }, [playSound]);

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
    padding: '14px',
    backgroundColor: 'var(--input-bg, var(--card-bg))', 
    color: 'var(--text-main)',
    border: '1px solid var(--input-border, var(--pill-border))',
    borderRadius: '8px',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
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
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes wiggle {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(10deg); }
            75% { transform: rotate(-10deg); }
          }
          @keyframes scaleRight {
            from { opacity: 0; transform: scaleX(0); }
            to { opacity: 1; transform: scaleX(1); }
          }
          
          .contact-input:focus {
            border-color: var(--input-focus, var(--pill-border)) !important;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
          }

          .responsive-icon-grid {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 16px;
            margin-bottom: 3rem;
            padding: 0 1rem;
          }
          @media (max-width: 480px) {
            .responsive-icon-grid {
              max-width: 250px; 
              margin-left: auto;
              margin-right: auto;
            }
          }

          .perf-icon-link {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background-color: var(--pill-bg);
            color: var(--text-main);
            border: 1px solid var(--border-color);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            text-decoration: none;
            position: relative;
          }
          
          @media (hover: hover) {
            .perf-icon-link:hover {
              background-color: var(--hover-bg);
              color: var(--hover-color);
              transform: scale(1.05);
            }
          }

          .perf-icon-link:active {
            background-color: var(--hover-bg);
            color: var(--hover-color);
            transform: scale(0.95);
          }

          .connect-title {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: nowrap;
            white-space: nowrap;
            font-size: clamp(1.4rem, 6.5vw, 2.2rem);
            font-weight: 800;
            color: var(--text-main);
            margin: 0 0 8px 0;
            opacity: 0;
          }
          .connect-title.animate-in {
            animation: slideUpFade 0.8s ease-out forwards;
          }
          
          .titleIcon {
            width: clamp(24px, 7vw, 50px);
            height: clamp(24px, 7vw, 50px);
            object-fit: contain;
            filter: drop-shadow(0 0 5px var(--primary, #3b82f6));
            margin-left: clamp(8px, 2.5vw, 20px);
            animation: wiggle 3s infinite ease-in-out;
            flex-shrink: 0;
          }
          
          .title-underline {
            width: 60px;
            height: 4px;
            background-color: #2563eb;
            margin: 0 auto 2.5rem auto;
            border-radius: 2px;
            opacity: 0;
            transform-origin: center;
          }
          .title-underline.animate-in {
            animation: scaleRight 0.8s ease-out 0.2s forwards;
          }
        `}
      </style>

      <div style={{
        position: 'fixed',
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
        <span />
        {toasts.map((t, index) => {
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
      </div>

      <div ref={footerRef} style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        
                <Suspense fallback={<div style={{ minHeight: '400px', width: '100%', backgroundColor: 'var(--bg-color)', borderRadius: '16px', border: '1px solid var(--border-color)' }} />}>
          <ElectricBorder color="var(--electric-blue)" speed={1.5} chaos={0.15} borderRadius={16}>
            <div style={{ backgroundColor: 'var(--contact-bg)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--pill-border)', position: 'relative', zIndex: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <h2 style={{ textAlign: 'center', color: 'var(--text-main)', marginBottom: '2rem' }}>CONTACT</h2>
              
              <div style={{ marginBottom: '16px' }}>
                <input 
                  className="contact-input" 
                  id='name' 
                  name='name' 
                  type="text" 
                  placeholder="Your Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  onFocus={handleFocus} 
                  onBlur={handleBlur} 
                  onClick={handleInputClick} 
                  style={{ ...inputStyle, opacity: isLoadingSubmit ? 0.6 : 1 }} 
                  disabled={isLoadingSubmit} 
                  autoComplete='name' 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '4px' }}>
                <input 
                  className="contact-input"
                  id='email' 
                  name='email' 
                  type="email" 
                  placeholder="Your Email" 
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setApiError('');
                    if (isOtpSent) {
                      setIsOtpSent(false); setOtp(''); sessionStorage.removeItem('pendingVerification');
                    }
                  }}
                  onFocus={handleFocus} 
                  onBlur={handleBlur} 
                  onClick={handleInputClick} 
                  disabled={isVerified || isLoadingOtp || isLoadingSubmit} 
                  autoComplete='email'
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
                  <input 
                    className="contact-input" 
                    type="text" 
                    placeholder="Enter 5-digit OTP" 
                    maxLength={5} 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                    onFocus={handleFocus} 
                    onBlur={handleBlur} 
                    onClick={handleInputClick} 
                    disabled={isLoadingVerify} 
                    style={{ ...inputStyle, marginBottom: '8px', textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem', opacity: isLoadingVerify ? 0.6 : 1 }} 
                    autoComplete='one-time-code' 
                  />
                  <button onClick={handleVerifyOtp} disabled={isLoadingVerify || otp.length !== 5} style={{ width: '100%', padding: '12px', backgroundColor: 'var(--orange)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: (isLoadingVerify || otp.length !== 5) ? 'not-allowed' : 'pointer', opacity: (isLoadingVerify || otp.length !== 5) ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isLoadingVerify ? <><LoadingSpinner /> Verifying...</> : 'Submit OTP'}
                  </button>
                </div>
              )}

              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '12px', 
                marginTop: '16px', 
                padding: '16px', 
                backgroundColor: 'var(--pill-bg)', 
                border: '1px solid var(--pill-border)', 
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)'
              }}>
                <span style={{ fontSize: '1.2rem', marginTop: '2px' }}>🔒</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  <HighlightText color="var(--highlight-orange)">Privacy Note:</HighlightText> I only store your verified email address to prevent spam. Your actual message goes straight to my personal inbox and is <UnderlineText color="var(--underline-blue)">never saved in any database</UnderlineText>. Your data is <HighlightText color="var(--highlight-green)">perfectly safe</HighlightText> with me.
                </p>
              </div>

              <textarea 
                className="contact-input" 
                placeholder="Your Message" 
                name='msg' 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                onFocus={handleFocus} 
                onBlur={handleBlur} 
                onClick={handleInputClick} 
                disabled={isLoadingSubmit} 
                style={{ ...inputStyle, minHeight: '120px', marginTop: '16px', resize: 'vertical', opacity: isLoadingSubmit ? 0.6 : 1 }} 
              />

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
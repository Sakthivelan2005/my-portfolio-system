import { useState, useEffect } from 'react';
import ElectricBorder from './ElectricBorder';
import ClientStats from './ClientStats';
import { useSound } from '../hooks/useSound';

// Custom Hook for Debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Reusable Spinner Component to keep the code DRY
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

export default function ContactFooter() {
  const API_URL = 'https://my-portfolio-system.onrender.com/api';
  const { playSound } = useSound();
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [otp, setOtp] = useState('');
  
  // UI & Loading States
  const [emailError, setEmailError] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  const [isLoadingOtp, setIsLoadingOtp] = useState(false);
  const [isLoadingVerify, setIsLoadingVerify] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  
  const debouncedEmail = useDebounce(email, 500);

  // 1. Local Storage Check on Mount
  useEffect(() => {
    const savedContact = localStorage.getItem('verifiedContact');
    if (savedContact) {
      const { savedName, savedEmail } = JSON.parse(savedContact);
      setName(savedName);
      setEmail(savedEmail);
      setIsVerified(true);
    }
  }, []);

  // 2. Format Validation via Debounce
  useEffect(() => {
    if (debouncedEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(debouncedEmail)) {
        setEmailError('Invalid email format');
      } else {
        setEmailError('');
      }
    } else {
      setEmailError('');
    }
  }, [debouncedEmail]);

  // Smart Focus & Blur Handlers for Mobile Keyboards
  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    document.body.classList.add('keyboard-open');
    const target = e.target;
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  const handleBlur = () => {
    setTimeout(() => {
      const active = document.activeElement;
      if (!active || (active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA')) {
        document.body.classList.remove('keyboard-open');
      }
    }, 100);
  };

  // Force Keyboard Dismissal when touching outside the form
  useEffect(() => {
    const handleTouchOutside = (e: TouchEvent | MouseEvent) => {
      const active = document.activeElement as HTMLElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
        const target = e.target as HTMLElement;
        if (!target.closest('input, textarea, button')) {
          active.blur();
        }
      }
    };
    
    document.addEventListener('touchstart', handleTouchOutside, { passive: true });
    document.addEventListener('mousedown', handleTouchOutside);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchOutside);
      document.removeEventListener('mousedown', handleTouchOutside);
    };
  }, []);

  // 3. Clear User (For shared devices)
  const handleClear = () => {
    (document.activeElement as HTMLElement)?.blur();
    playSound('click');
    localStorage.removeItem('verifiedContact');
    setName('');
    setEmail('');
    setMessage('');
    setIsVerified(false);
    setIsOtpSent(false);
  };

  // 4. Send OTP Logic
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
      setToast({ msg: `Verification code successfully sent to ${email}`, type: 'success' });
    } catch (error: any) {
      playSound('error');
      setToast({ msg: error.message || 'Error sending code.', type: 'error' });
      setEmailError('Failed to send code.');
    } finally {
      setIsLoadingOtp(false);
    }
  };

  // 5. Verify OTP Logic
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
      if (!response.ok) throw new Error(data.error);

      playSound('success');
      setIsVerified(true);
      setIsOtpSent(false);
      localStorage.setItem('verifiedContact', JSON.stringify({ savedName: name, savedEmail: email }));
    } catch (error: any) {
      playSound('error');
      setToast({ msg: error.message || 'Invalid OTP', type: 'error' });
    } finally {
      setIsLoadingVerify(false);
    }
  };

  // 6. Final Submission
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
    } catch (error: any) {
      playSound('error');
      setToast({ msg: error.message || 'Failed to send message.', type: 'error' });
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
      
      {/* Global CSS for Keyboard handling and Spinners */}
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

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: toast.type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
          color: '#fff',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <span>{toast.msg}</span>
          <button 
            onClick={() => {
              playSound('click');
              setToast(null);
            }} 
            style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
          >
            X
          </button>
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        
        <ElectricBorder
          color="#ffd670"
          speed={1.5}
          chaos={0.15}
          borderRadius={16}
        >
          <div style={{
            backgroundColor: 'var(--bg-color)',
            padding: '2.5rem',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            position: 'relative',
            zIndex: 10
          }}>
            
            <h2 style={{ textAlign: 'center', color: 'var(--text-main)', marginBottom: '2rem' }}>
              CONTACT
            </h2>
            
            {/* Name Input */}
            <div style={{ marginBottom: '16px' }}>
              <input 
                id='name'
                name='name'
                type="text" 
                placeholder="Your Name"
                value={name} 
                onChange={(e) => setName(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={{ ...inputStyle, opacity: isLoadingSubmit ? 0.6 : 1 }}
                disabled={isLoadingSubmit}
                autoComplete='name'
              />
            </div>

            {/* Email Row */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '4px' }}>
              <input 
                id='email'
                name='email'
                type="email" 
                placeholder="Your Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={isVerified || isLoadingOtp || isLoadingSubmit}
                autoComplete='email'
                style={{
                  ...inputStyle,
                  opacity: (isVerified || isLoadingOtp) ? 0.6 : 1,
                  flex: 1
                }}
              />
              
              {isVerified ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ 
                    padding: '0 16px', 
                    backgroundColor: 'var(--underline-green)', 
                    color: 'var(--text-main)', 
                    borderRadius: '6px', 
                    display: 'flex', 
                    alignItems: 'center',
                    border: '1px solid var(--highlight-green)'
                  }}>
                    ✓ Verified
                  </span>
                  <button 
                    onClick={handleClear} 
                    disabled={isLoadingSubmit}
                    style={{ 
                      padding: '0 16px', 
                      backgroundColor: 'var(--card-bg)', 
                      color: 'var(--text-muted)', 
                      borderRadius: '6px', 
                      border: '1px solid var(--border-color)',
                      cursor: isLoadingSubmit ? 'not-allowed' : 'pointer',
                      opacity: isLoadingSubmit ? 0.5 : 1
                    }}
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleSendOtp} 
                  disabled={!!emailError || !email || isLoadingOtp}
                  style={{
                    padding: '0 24px',
                    backgroundColor: 'var(--pill-bg)',
                    border: '1px solid var(--pill-border)',
                    borderRadius: '6px',
                    cursor: (!!emailError || !email || isLoadingOtp) ? 'not-allowed' : 'pointer',
                    opacity: (!!emailError || !email || isLoadingOtp) ? 0.6 : 1,
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '100px'
                  }}
                >
                  <p style={{color: 'var(--pill-text)', display: 'flex', alignItems: 'center', margin: 0}}>
                    <b>{isLoadingOtp ? <><LoadingSpinner /> Sending</> : 'Verify'}</b>
                  </p>
                </button>
              )}
            </div>
            
            {/* Inline Email Error */}
            {emailError && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '4px 0 16px 0' }}>{emailError}</p>}

            {/* OTP Box */}
            {isOtpSent && !isVerified && (
              <div style={{ marginBottom: '16px', marginTop: '12px' }}>
                <input 
                  type="text" 
                  placeholder="Enter 5-digit OTP" 
                  maxLength={5}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  onFocus={handleFocus}
                  onBlur={handleBlur} 
                  disabled={isLoadingVerify}
                  style={{
                    ...inputStyle, 
                    marginBottom: '8px', 
                    textAlign: 'center', 
                    letterSpacing: '4px', 
                    fontSize: '1.2rem',
                    opacity: isLoadingVerify ? 0.6 : 1
                  }}
                  autoComplete='one-time-code'
                />
                <button 
                  onClick={handleVerifyOtp} 
                  disabled={isLoadingVerify || otp.length !== 5}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'var(--orange)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: (isLoadingVerify || otp.length !== 5) ? 'not-allowed' : 'pointer',
                    opacity: (isLoadingVerify || otp.length !== 5) ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {isLoadingVerify ? <><LoadingSpinner /> Verifying...</> : 'Submit OTP'}
                </button>
              </div>
            )}

            {/* Privacy Disclaimer Note */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              marginTop: '16px',
              padding: '12px',
              backgroundColor: 'rgba(34, 197, 94, 0.05)', 
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: '6px'
            }}>
              <span style={{ fontSize: '1.1rem' }}>🔒</span>
              <p style={{
                margin: 0,
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                lineHeight: '1.4'
              }}>
                <strong>Privacy Note:</strong> I only store your verified email address to prevent spam. Your actual message goes straight to my personal inbox and is never saved in any database. Your data is perfectly safe with me.
              </p>
            </div>

            {/* Message Input */}
            <textarea 
              placeholder="Your Message" 
              name='msg'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={isLoadingSubmit}
              style={{ 
                ...inputStyle, 
                minHeight: '120px', 
                marginTop: '16px', 
                resize: 'vertical',
                opacity: isLoadingSubmit ? 0.6 : 1
              }}
            />

            {/* Submit Row */}
            <div style={{ marginTop: '24px' }}>
              <button 
                onClick={handleSubmit} 
                disabled={isLoadingSubmit || !isVerified}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: isVerified ? 'var(--pill-bg)' : 'var(--card-bg)',
                  color: isVerified ? 'var(--pill-main)' : 'var(--text-muted)',
                  border: `1px solid ${isVerified ? 'var(--orange)' : 'var(--border-color)'}`,
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  cursor: (isLoadingSubmit || !isVerified) ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  opacity: (isLoadingSubmit || !isVerified) ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => {
                  if (!isLoadingSubmit && isVerified) e.currentTarget.style.backgroundColor = 'var(--orange)';
                }}
                onMouseOut={(e) => {
                  if (!isLoadingSubmit && isVerified) e.currentTarget.style.backgroundColor = 'var(--pill-bg)';
                }}
              >
                {isLoadingSubmit ? <><LoadingSpinner /> Sending Message...</> : "Let's Talk"}
              </button>
            </div>

          </div>
        </ElectricBorder>

        {/* Client Stats Component Integrated Below */}
        <ClientStats />

      </div>
    </footer>
  );
}
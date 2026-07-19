import { useState, useEffect } from 'react';

export default function FloatingControls() {
  const [isDark, setIsDark] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Apply the theme to the global HTML tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);
  const toggleSound = () => setIsMuted(!isMuted);

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      display: 'flex',
      gap: '10px',
      zIndex: 1000
    }}>
      
      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        aria-label="Toggle Theme"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-main)',
          padding: '10px',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.2s ease'
        }}
      >
        {isDark ? (
          /* Pure SVG Moon */
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        ) : (
          /* Pure SVG Sun */
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
        )}
      </button>

      {/* Sound Toggle Button */}
      <button 
        onClick={toggleSound}
        aria-label="Toggle Sound"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-main)',
          padding: '10px',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.2s ease'
        }}
      >
        {isMuted ? (
          /* Pure SVG Volume Muted */
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
        ) : (
          /* Pure SVG Volume On */
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
        )}
      </button>

    </div>
  );
}
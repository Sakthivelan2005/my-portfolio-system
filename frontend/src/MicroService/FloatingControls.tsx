import { useSoundContext } from '../context/SoundContext';
import { useSound } from '../hooks/useSound';
import TooltipWrapper from './TooltipWrapper';
import { useTheme } from '../context/ThemeContext';

export default function FloatingControls() {
  const { playSound } = useSound();
  const { isSoundEnabled, toggleSound } = useSoundContext();
  const { isDark, toggleTheme } = useTheme();

  const handleThemeToggle = () => {
    toggleTheme();
    // This implicitly fires the spark via your useSound hook
    playSound('click'); 
  };

  // THE FIX: Manually dispatch the spark event for the Sound button 
  // using exact pointer coordinates, bypassing the sound engine.
  const handleSoundToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    toggleSound();
    window.dispatchEvent(
      new CustomEvent('fire-spark', {
        detail: { x: e.clientX, y: e.clientY }
      })
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      display: 'flex',
      gap: '10px',
      /* THE FIX: Raised to 50 to match Navbar level */
      zIndex: 50 
    }}>
      
      <TooltipWrapper text={isDark ? "Dark Mode" : "Light Mode"}>
      <button 
        onClick={handleThemeToggle} 
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
        )}
      </button>
      </TooltipWrapper>

      <TooltipWrapper text={isSoundEnabled ? "Mute Sound" : "Enable Sound"}>
      <button 
        onClick={handleSoundToggle}
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
        {isSoundEnabled ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
        ) }
      </button>
      </TooltipWrapper>
    </div>
  );
}
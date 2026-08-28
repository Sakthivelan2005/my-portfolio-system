import { useState, useEffect, useRef } from 'react';
import styles from './Navbar.module.css';
import { useSound } from '../hooks/useSound';
import TooltipWrapper from '../MicroService/TooltipWrapper';
import GalaxyNav from '../MicroService/GalaxyNav'; // Make sure this path is correct!

// 1. MASTER CONFIGURATION (DRY Principle)
// We define this outside the component so it doesn't recreate on every single render.
const NAV_ITEMS = [
  { 
    name: "Top", 
    id: "top",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
  },
  { 
    name: "Git Stats", 
    id: "git",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><circle cx="18" cy="9" r="3"></circle><path d="M18 12V9"></path><path d="M12 15V6"></path><path d="M6 9v3a3 3 0 0 0 3 3h3"></path></svg>
  },
  { 
    name: "Tech Arsenal", 
    id: "tech",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
  },
  { 
    name: "Projects", 
    id: "Projects",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
  },
  { 
    name: "Experience", 
    id: "experience",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
  },
  { 
    name: "Academics", 
    id: "academics",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
  },
  { 
    name: "Contact", 
    id: "contact",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
  },
  { 
    name: "Bottom", 
    id: "bottom",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
  }
];

export default function Navbar() {
  const { playSound } = useSound();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollMounted, setScrollMounted] = useState(false);

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsMounted(true), 0);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setIsMounted(false), 300); 
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (showScrollTop) {
      const timer = setTimeout(() => setScrollMounted(true), 0);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setScrollMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [showScrollTop]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const handleScrollTracking = () => {
      setShowScrollTop(window.scrollY > 300);
      const scrollPosition = Math.ceil(window.innerHeight + window.scrollY);
      const documentHeight = document.documentElement.scrollHeight;
      setIsAtBottom(documentHeight - scrollPosition <= 30);
    };

    window.addEventListener('scroll', handleScrollTracking, { passive: true });
    handleScrollTracking(); 
    return () => window.removeEventListener('scroll', handleScrollTracking);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        playSound('scroll');
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, playSound]);

 const handleSmoothScroll = (id: string) => {
    if (id === 'top' || id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // THE GHOST HUNTER: Polling mechanism for Lazy-Loaded Components
    let attempts = 0;
    const maxAttempts = 50; // Try for up to 2.5 seconds (50 * 50ms)

    const findAndScroll = () => {
      const element = document.getElementById(id);
      
      if (element) {
        // Element found! Scroll to it.
        element.scrollIntoView({ behavior: 'smooth' });
      } else if (attempts < maxAttempts) {
        // Element is still lazy-loading. Wait 50ms and try again.
        attempts++;
        setTimeout(findAndScroll, 50);
      } else {
        console.warn(`[System] Could not find element with ID: ${id} after lazy load timeout.`);
      }
    };

    // Start hunting
    findAndScroll();
  };

  const shouldHideScrollTop = isMobile && isAtBottom;

  // 2. ADAPTER FOR GALAXY NAV
  // We format the master config into exactly what GalaxyNav expects.
  const galaxyItems = NAV_ITEMS.map((item) => ({
    id: item.id,
    icon: <div style={{ width: '20px', height: '20px' }}>{item.icon}</div>,
    label: item.name,
    onClick: () => {
      playSound('click');
      handleSmoothScroll(item.id);
    }
  }));

  return (
    <>
      <style>
        {`
          .native-mobile-link {
            transition: color 0.2s ease, transform 0.2s ease !important;
            cursor: pointer;
          }
          .native-mobile-link:hover {
            transform: translateX(5px) !important;
            color: var(--pill-text) !important;
          }
          .native-btn-scale {
            transition: transform 0.15s cubic-bezier(0.25, 1, 0.5, 1);
          }
          .native-btn-scale:active {
            transform: scale(0.9) !important;
          }
          .native-btn-scale:hover {
            transform: scale(1.1);
          }
        `}
      </style>

      {/* 3. CONDITIONAL RENDER: Destroys GalaxyNav from memory on mobile */}
      {!isMobile && (
        <GalaxyNav items={galaxyItems} />
      )}

      <div className={styles.navWrapper}>
        <div className={styles.mobileNav} ref={menuRef}>
          <TooltipWrapper text={isOpen ? 'Close Menu' : 'Open Menu'}>
            <button 
              className={`${styles.hamburger} native-btn-scale`}
              onClick={() => { setIsOpen(!isOpen); playSound('scroll'); }}
              aria-label={isOpen ? "Close menu" : "Open menu"} 
            >
              {isOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </TooltipWrapper>
          
          {isMounted && (
            <div 
              className={styles.mobileMenu}
              style={{
                transformOrigin: "top",
                transform: `scaleY(${isOpen ? 1 : 0})`,
                opacity: isOpen ? 1 : 0,
                transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                pointerEvents: isOpen ? 'auto' : 'none',
              }} 
            >
              {/* 4. MAP OVER MASTER CONFIG */}
              {NAV_ITEMS.map((link, index) => {
                const delay = isOpen ? index * 0.05 : (NAV_ITEMS.length - index - 1) * 0.05;
                
                return (
                  <div 
                    key={link.name} 
                    onClick={() => {
                      playSound('click'); 
                      setIsOpen(false);
                      handleSmoothScroll(link.id); 
                    }}
                    className={`${styles.mobileLink} native-mobile-link`}
                    style={{
                      opacity: isOpen ? 1 : 0,
                      transform: `translateY(${isOpen ? 0 : -15}px)`,
                      filter: `blur(${isOpen ? 0 : 4}px)`,
                      transition: `all 0.3s cubic-bezier(0.25, 1, 0.5, 1) ${delay}s`,
                    }}
                  >
                    {link.name}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {scrollMounted && (
        <TooltipWrapper text='Scroll to top'>
          <button
            className="native-btn-scale"
            onClick={() => {
              playSound('scroll');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{
              position: 'fixed',
              bottom: '25px',
              right: isMobile ? '76px' : '96px', 
              width: isMobile ? '48px' : '56px',
              height: isMobile ? '48px' : '56px',
              borderRadius: '50%',
              backgroundColor: '#38bdf8', 
              color: '#0f172a',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1005, 
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              opacity: (!showScrollTop || shouldHideScrollTop) ? 0 : 1,
              transform: !showScrollTop ? 'scale(0)' : (shouldHideScrollTop ? 'scale(0.8) translateY(20px)' : 'scale(1) translateY(0)'),
              pointerEvents: (!showScrollTop || shouldHideScrollTop) ? 'none' : 'auto',
              transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
            aria-label="Scroll to top"
          >
            <svg width={isMobile ? "20" : "24"} height={isMobile ? "20" : "24"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 15l-6-6-6 6"/>
            </svg>
          </button>
        </TooltipWrapper>
      )}
    </>
  );
}
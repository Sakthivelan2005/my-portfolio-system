import { useState, useEffect, useRef } from 'react';
import styles from './Navbar.module.css';
import { useSound } from '../hooks/useSound';
import TooltipWrapper from './TooltipWrapper';

const links = [
  { name: "Top", id: "top" },
  { name: "Git Stats", id: "git" },
  { name: "Technical Arsenal", id: "tech" },
  { name: "Projects", id: "Projects" },
  { name: "Experience", id: "experience" },
  { name: "Academics", id: "academics" },
  { name: "Contact", id: "contact" },
  { name: "Bottom", id: "bottom" }
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

  // THE FIX: Pushed synchronous state updates to the micro-task queue to prevent double-renders
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsMounted(true), 0);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setIsMounted(false), 300); // 300ms matches animation duration
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
        playSound('hover');
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
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const shouldHideScrollTop = isMobile && isAtBottom;

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

      <div className={styles.navWrapper}>
        <div className={styles.mobileNav} ref={menuRef}>
          <button 
            className={`${styles.hamburger} native-btn-scale`}
            onClick={() => { setIsOpen(!isOpen); playSound('hover'); }}
            aria-label={isOpen ? "Close menu" : "Open menu"} 
          >
            {isOpen ? (
              <TooltipWrapper text='Close Menu'>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </TooltipWrapper>
            ) : (
              <TooltipWrapper text='Open Menu'>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </TooltipWrapper>
            )}
          </button>
          
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
              {links.map((link, index) => {
                const delay = isOpen ? index * 0.05 : (links.length - index - 1) * 0.05;
                
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
            zIndex: 8, 
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            opacity: (!showScrollTop || shouldHideScrollTop) ? 0 : 1,
            transform: !showScrollTop ? 'scale(0)' : (shouldHideScrollTop ? 'scale(0.8) translateY(20px)' : 'scale(1) translateY(0)'),
            pointerEvents: (!showScrollTop || shouldHideScrollTop) ? 'none' : 'auto',
            transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
          aria-label="Scroll to top"
        >
          <TooltipWrapper text='Scroll to top'>
            <svg width={isMobile ? "20" : "24"} height={isMobile ? "20" : "24"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 15l-6-6-6 6"/>
            </svg>
          </TooltipWrapper>
        </button>
      )}
    </>
  );
}
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
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

const wrapperVariants: Variants = {
  open: {
    scaleY: 1,
    opacity: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.05, ease: [0.25, 1, 0.5, 1], duration: 0.3 },
  },
  closed: {
    scaleY: 0,
    opacity: 0,
    transition: { when: "afterChildren", staggerChildren: 0.05, staggerDirection: -1, ease: [0.25, 1, 0.5, 1], duration: 0.3 },
  },
};

const itemVariants: Variants = {
  open: { opacity: 1, y: 0, filter: "blur(0px)" },
  closed: { opacity: 0, y: -15, filter: "blur(4px)" }, 
};

export default function Navbar() {
  const {playSound} = useSound();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    setIsMobile(mediaQuery.matches);
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

    window.addEventListener('scroll', handleScrollTracking);
    handleScrollTracking(); 
    return () => window.removeEventListener('scroll', handleScrollTracking);
  }, []);

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
      <div className={styles.navWrapper}>
        <div className={styles.mobileNav}>
          <motion.button 
            className={styles.hamburger}
            onClick={() => {setIsOpen(!isOpen); playSound('hover')}}
            whileTap={{ scale: 0.9 }}
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
          </motion.button>
          
          <AnimatePresence>
            {isOpen && (
              <motion.div 
                className={styles.mobileMenu}
                variants={wrapperVariants}
                initial="closed"
                animate="open"
                exit="closed"
                style={{ originY: "top" }} 
              >
                {links.map((link) => (
                  <motion.div 
                    key={link.name} 
                    variants={itemVariants}
                    onClick={() => {
                      playSound('click'); 
                      setIsOpen(false);
                      handleSmoothScroll(link.id); 
                    }}
                    className={styles.mobileLink}
                    whileHover={{ x: 5, color: "var(--accent-color)" }} 
                  >
                    {link.name}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{ 
              opacity: shouldHideScrollTop ? 0 : 1, 
              scale: shouldHideScrollTop ? 0.8 : 1,
              y: shouldHideScrollTop ? 20 : 0 
            }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              playSound('scroll');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{
              position: 'fixed',
              // THE FIX: Calculates placement to sit exactly next to the scaled terminal button
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
              pointerEvents: shouldHideScrollTop ? 'none' : 'auto'
            }}
            aria-label="Scroll to top"
          >
            <TooltipWrapper text='Scroll to top'>
            <svg width={isMobile ? "20" : "24"} height={isMobile ? "20" : "24"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 15l-6-6-6 6"/>
            </svg>
            </TooltipWrapper>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
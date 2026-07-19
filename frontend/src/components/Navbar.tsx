import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Navbar.module.css';

// THE FIX 1: Converted to objects to map the names to physical HTML element IDs
const links = [
  { name: "Top", id: "top" },
  { name: "Git Stats", id: "git" },
  { name: "Technical Arsenal", id: "tech" },
  { name: "Engineering Showcases", id: "experience"},
  { name: "Academics", id: "academics" }
];

const wrapperVariants = {
  open: {
    scaleY: 1,
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.05, 
      ease: [0.25, 1, 0.5, 1] as [number, number, number, number], 
      duration: 0.3
    },
  },
  closed: {
    scaleY: 0,
    opacity: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1, 
      ease: [0.25, 1, 0.5, 1] as [number, number, number, number],
      duration: 0.3
    },
  },
};

const itemVariants = {
  open: { opacity: 1, y: 0, filter: "blur(0px)" },
  closed: { opacity: 0, y: -15, filter: "blur(4px)" }, 
};

export default function Navbar() {
  const [active, setActive] = useState("Home");
  const [isOpen, setIsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // THE FIX 2: Track window scroll to show/hide the Top button
  useEffect(() => {
    const handleScrollTracking = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScrollTracking);
    return () => window.removeEventListener('scroll', handleScrollTracking);
  }, []);

  // THE FIX 3: Master smooth scroll logic for both desktop and mobile
  const handleSmoothScroll = (id: string) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      // Calculate offset if you have a sticky navbar covering the content
      const offset = 80; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
  
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <>
      <div className={styles.navWrapper}>
        
        <nav className={styles.desktopNav}>
          {links.map((link) => (
            <button 
              key={link.name} 
              onClick={() => {
                setActive(link.name);
                handleSmoothScroll(link.id);
              }} 
              className={`${styles.navButton} ${active === link.name ? styles.activeText : ''}`}
            >
              {active === link.name && (
                <motion.div 
                  layoutId="react-bits-pill" 
                  className={styles.pill} 
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} 
                />
              )}
              <span className={styles.navText}>{link.name}</span>
            </button>
          ))}
        </nav>

        <div className={styles.mobileNav}>
          <motion.button 
            className={styles.hamburger}
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.9 }}
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
                      setActive(link.name);
                      setIsOpen(false);
                      handleSmoothScroll(link.id); // Execute scroll after closing menu
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

      {/* THE FIX 4: Floating Scroll-to-Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setActive("Home");
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{
              position: 'fixed',
              bottom: '30px',
              right: '30px',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: '#38bdf8', // Adjust to match your theme
              color: '#0f172a',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999, // Keeps it strictly above all content
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
            }}
            aria-label="Scroll to top"
          >
            {/* Pure SVG Up Arrow */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 15l-6-6-6 6"/>
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
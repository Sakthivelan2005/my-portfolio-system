import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Navbar.module.css';

const links = ["Home", "Projects", "About", "Contact"];

// The Exact React Bits Staggered Menu Physics
const wrapperVariants = {
  open: {
    scaleY: 1,
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.05, // Rapid fire drop-in
      ease: [0.25, 1, 0.5, 1] as [number, number, number, number], // Custom easing curve
      duration: 0.3
    },
  },
  closed: {
    scaleY: 0,
    opacity: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1, // Retracts upwards
      ease: [0.25, 1, 0.5, 1] as [number, number, number, number],
      duration: 0.3
    },
  },
};

const itemVariants = {
  open: { opacity: 1, y: 0, filter: "blur(0px)" },
  closed: { opacity: 0, y: -15, filter: "blur(4px)" }, // Blur effect makes it look expensive
};

export default function Navbar() {
  const [active, setActive] = useState("Home");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.navWrapper}>
      
      <nav className={styles.desktopNav}>
        {links.map((link) => (
          <button 
            key={link} 
            onClick={() => setActive(link)} 
            className={`${styles.navButton} ${active === link ? styles.activeText : ''}`}
          >
            {active === link && (
              <motion.div 
                layoutId="react-bits-pill" 
                className={styles.pill} 
                // React Bits signature bouncy spring
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} 
              />
            )}
            <span className={styles.navText}>{link}</span>
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
    /* Pure SVG for X icon (Zero KB dependency) */
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ) : (
    /* Pure SVG for Menu icon (Zero KB dependency) */
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
              style={{ originY: "top" }} // Forces it to open from the top down
            >
              {links.map((link) => (
                <motion.div 
                  key={link} 
                  variants={itemVariants}
                  onClick={() => {
                    setActive(link);
                    setIsOpen(false);
                  }}
                  className={styles.mobileLink}
                  whileHover={{ x: 5, color: "var(--accent-color)" }} // Small interactive slide
                >
                  {link}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
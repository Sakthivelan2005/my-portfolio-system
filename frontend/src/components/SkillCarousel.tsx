import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const skills = [
  "Full Stack Developer",
  "React Native Developer",
  "Clean Code Advocate"
];

export default function SkillCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % skills.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      id='skill' 
      style={{ 
        height: '30px', 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center',
        overflow: 'hidden' // Prevents exiting animations from spilling outside the container
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          // FIX 1: Use the actual string data as the key. It is globally unique and un-confusable.
          key={skills[index]} 
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -15, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ 
            color: 'var(--pill-text)', 
            margin: 0, 
            fontFamily: 'monospace',
            // FIX 2: Absolute positioning guarantees the old and new nodes never push each other around if the browser lags.
            position: 'absolute', 
            width: '100%'
          }}
        >
          {/* FIX 3: Always wrap animated raw text in a span. This shields it from browser intervention. */}
          <span>{skills[index]}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
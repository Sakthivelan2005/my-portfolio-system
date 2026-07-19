import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const skills = [
  "Software Dev Engineer",
  "React Native Developer",
  "Clean Code Advocate"
];

export default function SkillCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // This timer is now trapped inside this component.
    // It will not trigger re-renders in the parent HeroSection.
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % skills.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div id='skill' style={{ height: '30px', position: 'relative', display: 'flex', alignItems: 'center' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ color: '#60a5fa', margin: 0, fontFamily: 'monospace' }}
        >
          {skills[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
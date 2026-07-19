import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Keep the precise 1-second sync
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get the string (e.g., "10:45 AM")
  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Split it into an array of individual characters
  const timeArray = formattedTime.split('');

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center',
      fontSize: '14px', 
      fontWeight: 'bold', 
      color: 'var(--text-main)',
      // Pro-tip: 'tabular-nums' forces all numbers to be the exact same width.
      // This prevents the text from jittering left and right when a wide '0' changes to a skinny '1'.
      fontVariantNumeric: 'tabular-nums' 
    }}>
      
      <div style={{ display: 'flex', height: '20px', overflow: 'hidden' }}>
        {timeArray.map((char, index) => (
          // The wrapper div acts as a static slot for each character
          <div 
            key={index} // The position index stays constant
            style={{ 
              position: 'relative', 
              // Make spaces and colons narrower than numbers for a cleaner look
              width: char === ':' || char === ' ' ? '6px' : '10px', 
              display: 'inline-flex',
              justifyContent: 'center'
            }}
          >
            <AnimatePresence>
              <motion.span
                // The key is the character itself. 
                // Framer Motion compares this key to the previous render. 
                // If it is the same (e.g., 'A' -> 'A'), it does nothing. 
                // If it changes (e.g., '3' -> '4'), it triggers the spring animation.
                key={char} 
                initial={{ y: 20, opacity: 0, position: 'absolute' }}
                animate={{ y: 0, opacity: 1, position: 'absolute' }}
                exit={{ y: -20, opacity: 0, position: 'absolute' }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 25, 
                  mass: 1 
                }}
                style={{ top: 0 }}
              >
                {char}
              </motion.span>
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
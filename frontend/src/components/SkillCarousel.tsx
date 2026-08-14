import { useState, useEffect } from 'react';

const skills = [
  "Full Stack Developer",
  "React Native Developer",
  "Clean Code Advocate"
];

export default function SkillCarousel() {
  const [index, setIndex] = useState(0);
  // Start in the visible state
  const [fadeClass, setFadeClass] = useState('carousel-visible');

  useEffect(() => {
    const interval = setInterval(() => {
      // 1. EXIT: Slide up and fade out (takes 300ms)
      setFadeClass('carousel-exit');
      
      // 2. PREPARE: Wait exactly 300ms for the exit animation to finish
      setTimeout(() => {
        // Change the word while it is invisible
        setIndex((prev) => (prev + 1) % skills.length);
        
        // Instantly snap it to the bottom (+15px) without any animation
        setFadeClass('carousel-prepare');
        
        // 3. ENTER: Wait a tiny 50ms tick for the browser to register the new position, then animate up to 0
        setTimeout(() => {
          setFadeClass('carousel-visible');
        }, 50);
        
      }, 300);
      
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
        overflow: 'hidden' 
      }}
    >
      <style>
        {`
          .carousel-text {
            position: absolute;
            width: 100%;
            font-family: var(--mono);
            color: var(--pill-text);
            margin: 0;
            will-change: transform, opacity;
          }
          /* State 1: Fully visible in the center */
          .carousel-visible {
            opacity: 1;
            transform: translateY(0);
            transition: all 0.3s ease-in-out;
          }
          /* State 2: Sliding up and fading out */
          .carousel-exit {
            opacity: 0;
            transform: translateY(-15px);
            transition: all 0.3s ease-in-out;
          }
          /* State 3: Snapped to the bottom invisibly (NO transition) */
          .carousel-prepare {
            opacity: 0;
            transform: translateY(15px);
            transition: none; 
          }
        `}
      </style>
      <span className={`carousel-text ${fadeClass}`}>
        {skills[index]}
      </span>
    </div>
  );
}
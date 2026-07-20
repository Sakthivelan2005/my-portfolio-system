import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface UnderlineTextProps {
  children: ReactNode;
  color?: string;
}

export default function UnderlineText({ children, color = '#3b82f6' }: UnderlineTextProps) {
  return (
    <motion.span
      /* 1. THE TRIGGER: We watch the parent span for scroll, not the absolute SVG */
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }} // Triggers slightly after it enters the screen
      style={{ 
        position: 'relative', 
        display: 'inline-block',
        color: 'var(--text-main)',
        /* 2. THE Z-INDEX SHIELD: This guarantees the line never falls behind your page background */
        isolation: 'isolate' 
      }}
    >
      {/* The Text */}
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>

      {/* The Mask Reveal Animation Container */}
      <motion.span
        /* 3. THE ANIMATION: We link to the parent's "hidden" and "visible" states */
        variants={{
          hidden: { clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" },
          visible: { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" }
        }}
        transition={{ 
          duration: 0.6, 
          ease: "easeOut", 
          delay: 0.1 
        }}
        style={{
          position: 'absolute',
          bottom: '-2px',
          left: 0,
          width: '100%',
          height: '12px',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      >
        {/* The Static SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 15"
          preserveAspectRatio="none"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <path
            d="M2,12 Q45,2 98,10"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
            vectorEffect="non-scaling-stroke" 
          />
        </svg>
      </motion.span>
    </motion.span>
  );
}
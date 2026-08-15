import { type ReactNode, useEffect, useRef, useState } from 'react';

interface UnderlineTextProps {
  children: ReactNode;
  color?: string;
}

export default function UnderlineText({ children, color = '#3b82f6' }: UnderlineTextProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Matches viewport={{ once: true }}
        }
      },
      { rootMargin: "-10% 0px" } // Triggers slightly after entering the screen
    );

    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      style={{ 
        position: 'relative', 
        display: 'inline-block',
        color: 'var(--text-main)',
        isolation: 'isolate' 
      }}
    >
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>

      <span
        style={{
          position: 'absolute',
          bottom: '-2px',
          left: 0,
          width: '100%',
          height: '12px',
          zIndex: 0,
          pointerEvents: 'none',
          /* The Mask Reveal Animation using pure CSS clip-path */
          clipPath: isVisible ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" : "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
          transition: "clip-path 0.6s ease-out 0.1s"
        }}
      >
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
      </span>
    </span>
  );
}
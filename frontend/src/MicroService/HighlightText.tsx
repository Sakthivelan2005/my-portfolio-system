import { useState, useEffect, useRef, type ReactNode } from 'react';

interface HighlightProps {
  children: ReactNode;
  color?: string;
}

export default function HighlightText({ children, color = "rgba(59, 130, 246, 0.4)" }: HighlightProps) {
  const [isVisible, setIsVisible] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Native IntersectionObserver triggers the animation when scrolled into view
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect(); 
      }
    });

    if (textRef.current) {
      observer.observe(textRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <span 
      ref={textRef} 
      style={{
        // The marker ink (covers the bottom 40% of the text)
        backgroundImage: `linear-gradient(transparent 0%, ${color} 40%)`,
        
        // Animates from left to right
        backgroundSize: isVisible ? '100% 100%' : '0% 100%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left center',
        transition: 'background-size 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)',
        
        // THE FIX: Forces the highlight to clone perfectly across multiple lines on mobile
        WebkitBoxDecorationBreak: 'clone',
        boxDecorationBreak: 'clone',
        
        display: 'inline',
        padding: '0 4px',
        borderRadius: '2px',
        color: 'var(--text-main)'
      }}
    >
      {children}
    </span>
  );
}
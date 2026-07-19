import { type ReactNode } from 'react';

interface UnderlineTextProps {
  children: ReactNode;
  color?: string;
}

export default function UnderlineText({ children, color = '#3b82f6' }: UnderlineTextProps) {
  // We use an SVG encoded as a background image. 
  // It stretches perfectly to the width of the text and never breaks on mobile.
  const svgLine = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 15' preserveAspectRatio='none'%3E%3Cpath d='M2,12 Q45,2 98,10' stroke='${encodeURIComponent(color)}' stroke-width='3' stroke-linecap='round' fill='none' opacity='0.8'/%3E%3C/svg%3E")`;

  return (
    <span style={{
      backgroundImage: svgLine,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'bottom',
      backgroundSize: '100% 12px',
      paddingBottom: '4px', // Lifts the text slightly above the drawn line
      display: 'inline',
      color: 'var(--text-main)' // Keeps the text color sharp
    }}>
      {children}
    </span>
  );
}
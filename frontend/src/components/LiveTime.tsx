import { useState, useEffect } from 'react';

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
      fontVariantNumeric: 'tabular-nums' 
    }}>
      
      <style>
        {`
          @keyframes springUp {
            0% { transform: translateY(15px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          .time-char {
            display: inline-block;
            will-change: transform, opacity;
            /* The cubic-bezier matches Framer Motion's spring effect */
            animation: springUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
        `}
      </style>

      <div style={{ display: 'flex', height: '20px', overflow: 'hidden' }}>
        {timeArray.map((char, index) => (
          // The wrapper div acts as a static slot for each character
          <div 
            key={index} 
            style={{ 
              position: 'relative', 
              width: char === ':' || char === ' ' ? '6px' : '10px', 
              display: 'inline-flex',
              justifyContent: 'center'
            }}
          >
            {/* Forcing React to remount the DOM node triggers the CSS animation natively */}
            <span key={`${index}-${char}`} className="time-char">
              {char}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';

export default function Greeting() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    // 1. The Logic Engine
    const checkTime = () => {
      const hour = new Date().getHours();
      
      if (hour >= 0 && hour < 4) return " Morning";
      if (hour >= 4 && hour < 5) return " Dawn";
      if (hour >= 5 && hour < 12) return " Morning";
      if (hour >= 12 && hour < 15) return " Afternoon";
      return " Evening";
    };

    // 2. Set the initial state immediately on load
    setGreeting(checkTime());

    // 3. The Live Tracker: Checks the clock every 1 second
    const timer = setInterval(() => {
      setGreeting(prevGreeting => {
        const currentGreeting = checkTime();
        // Only update state (and trigger animation) if the greeting actually changes
        if (prevGreeting !== currentGreeting) {
          return currentGreeting;
        }
        return prevGreeting;
      });
    }, 1000);

    // Cleanup the interval when the component unmounts
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ 
      fontSize: '1.8rem', 
      color: 'var(--text-main)', 
      marginBottom: '15px',
      fontWeight: 'bold',
      // overflow hidden creates a "mask" so the text slides up from nowhere
      overflow: 'hidden', 
      display: 'block' 
    }}>
      
      <style>
        {`
          @keyframes slideUpFade {
            0% { 
              transform: translateY(100%); 
              opacity: 0; 
            }
            100% { 
              transform: translateY(0); 
              opacity: 1; 
            }
          }
        `}
      </style>

      {/* THE FIX: The 'key' prop tells React to destroy and rebuild this div whenever the greeting changes, which forces the animation to replay instantly. */}
      Good 
      <span 
        key={greeting} 
        style={{ 
          animation: 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' 
        }}
      >
        {greeting}
      </span>
    </div>
  );
}
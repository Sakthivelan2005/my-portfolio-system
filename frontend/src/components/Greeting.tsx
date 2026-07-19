import { useState, useEffect } from 'react';

export default function Greeting() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();

    if (hour >= 0 && hour < 4) {
      setGreeting("Good Morning");
    } else if (hour >= 4 && hour < 5) {
      setGreeting("Good Dawn");
    } else if (hour >= 5 && hour < 12) {
      setGreeting("Good Morning");
    } else if (hour >= 12 && hour < 15) {
      setGreeting("Good Afternoon");
    } else  {
      setGreeting("Good Evening");
    }
  }, []);

  return (
    <div style={{ 
      marginTop: '50px', 
      fontSize: '2rem', 
      fontWeight: 'bold',
      animation: 'fadeIn 0.5s ease-in' 
    }}>
      {greeting},
    </div>
  );
}
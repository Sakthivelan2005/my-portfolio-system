import { createContext, useContext, useState, type ReactNode } from 'react';
import clickWav from '../assets/sounds/click.wav';

// 1. Clean, correct TypeScript interface. No complex overloading.
interface SoundContextType {
  isSoundEnabled: boolean;
  toggleSound: () => void;
}

// 2. Create a dedicated raw audio instance just for the toggle button
const toggleAudio = new Audio(clickWav);
toggleAudio.volume = 0.4;

const SoundContext = createContext<SoundContextType>({
  isSoundEnabled: false, 
  toggleSound: () => {},
});

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);

  const toggleSound = () => {
    // 3. We use the previous state to calculate the exact new state safely
    setIsSoundEnabled((prev) => {
      const newState = !prev;
      
      // 4. If the user is turning the sound ON, play it instantly.
      // We bypass the hook completely to avoid race conditions.
      if (newState) {
        toggleAudio.currentTime = 0;
        toggleAudio.play().catch((err) => console.log('Audio blocked:', err));
      }
      
      return newState;
    });
  };

  return (
    <SoundContext.Provider value={{ isSoundEnabled, toggleSound }}>
      {children}
    </SoundContext.Provider>
  );
}

export const useSoundContext = () => useContext(SoundContext);
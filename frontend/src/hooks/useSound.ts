import { useCallback } from 'react';
import { useSoundContext } from '../context/SoundContext';

// 1. Import your audio files (named correctly)
import clickWav from '../assets/sounds/mixkit-modern-technology-select-3124.wav';
import hoverWav from '../assets/sounds/hover.mp3';
import successWav from '../assets/sounds/success.mp3';
import scroll from '../assets/sounds/scroll.wav';
import errorWav from '../assets/sounds/error.mp3';

// 2. Define strict TypeScript types so you get autocomplete and catch typos
export type SoundType = 'click' | 'hover' | 'success' | 'scroll' | 'error';

// 3. Create the Global Audio Registry
// This executes exactly ONCE when the file is loaded.
const audioRegistry: Record<SoundType, HTMLAudioElement> = {
  click: new Audio(clickWav),
  hover: new Audio(hoverWav),
  success: new Audio(successWav),
  scroll: new Audio(scroll),
  error: new Audio(errorWav)
};

// 4. Pre-configure custom volumes for each sound
audioRegistry.click.volume = 0.4;
audioRegistry.hover.volume = 0.15; // Hover sounds should be barely noticeable
audioRegistry.success.volume = 0.5;
audioRegistry.scroll.volume = 0.9;

export function useSound() {
  const { isSoundEnabled } = useSoundContext();

  // 5. One master function to rule them all
  const playSound = useCallback((type: SoundType) => {
    if (!isSoundEnabled) return;
    
    const audio = audioRegistry[type];
    
    // Safety check just in case an invalid type slips through
    if (!audio) {
      console.warn(`Sound type "${type}" not found in registry.`);
      return;
    }

    // Reset and play
    audio.currentTime = 0; 
    audio.play().catch((err) => console.log('Audio blocked by browser:', err));
  }, [isSoundEnabled]);

  return { playSound };
}
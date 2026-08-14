import { useCallback } from 'react';
import { useSoundContext } from '../context/SoundContext';

export type SoundType = 'click' | 'hover' | 'success' | 'scroll' | 'error';

// 1. Create an empty cache. ZERO memory is used on initial load.
const audioCache: Partial<Record<SoundType, HTMLAudioElement>> = {};

// 2. Dynamic Asset Fetcher
// This guarantees Vite completely separates these files from your main JS bundle.
const fetchAudioUrl = async (type: SoundType): Promise<string> => {
  switch (type) {
    case 'click': return (await import('../assets/sounds/mixkit-modern-technology-select-3124.wav')).default;
    case 'hover': return (await import('../assets/sounds/scroll.mp3')).default;
    case 'success': return (await import('../assets/sounds/success.mp3')).default;
    case 'scroll': return (await import('../assets/sounds/scroll.mp3')).default;
    case 'error': return (await import('../assets/sounds/error.mp3')).default;
    default: return '';
  }
};

export function useSound() {
  const { isSoundEnabled } = useSoundContext();

  const playSound = useCallback(async (type: SoundType) => {
    if (!isSoundEnabled) return;
    
    // 3. Lazy Instantiation: We only download and build the Audio object 
    // the VERY FIRST TIME the user triggers it.
    if (!audioCache[type]) {
      const url = await fetchAudioUrl(type);
      if (!url) {
        console.warn(`Sound type "${type}" URL not found.`);
        return;
      }
      
      const audio = new Audio(url);
      
      // Pre-configure custom volumes
      if (type === 'click') audio.volume = 0.4;
      if (type === 'hover') audio.volume = 0.15;
      if (type === 'success') audio.volume = 0.5;
      if (type === 'scroll') audio.volume = 0.9;
      
      audioCache[type] = audio;
    }

    // 4. Play the cached sound instantly on all subsequent triggers
    const audio = audioCache[type];
    if (audio) {
      audio.currentTime = 0; 
      audio.play().catch((err) => console.log('Audio blocked by browser:', err));
    }
  }, [isSoundEnabled]);

  return { playSound };
}
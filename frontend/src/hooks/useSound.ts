import { useCallback } from 'react';
import { useSoundContext } from '../context/SoundContext';

export type SoundType = 'click' | 'hover' | 'success' | 'scroll' | 'error';

const audioCache: Partial<Record<SoundType, HTMLAudioElement>> = {};

// --- GLOBAL POINTER TRACKER ---
// Tracks exact (X, Y) of the user's thumb or mouse with ZERO React re-renders.
let lastX = 0;
let lastY = 0;

if (typeof window !== 'undefined') {
  // Track where the user clicks
  window.addEventListener('pointerdown', (e) => {
    lastX = e.clientX;
    lastY = e.clientY;
  }, { passive: true });

  // Track where the user hovers
  window.addEventListener('pointermove', (e) => {
    lastX = e.clientX;
    lastY = e.clientY;
  }, { passive: true });
}

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
    
    // --- VISUAL SPARK TRIGGER ---
    // Fires spark exactly where the cursor is for clicks, hovers, and scroll buttons
    if (type === 'click' || type === 'hover' || type === 'scroll') {
      window.dispatchEvent(new CustomEvent('fire-spark', { 
        detail: { x: lastX, y: lastY } 
      }));
    }

    if (!isSoundEnabled) return;
    
    // Lazy Instantiation: Download and build the Audio object ONLY on first use
    if (!audioCache[type]) {
      const url = await fetchAudioUrl(type);
      if (!url) return;
      
      const audio = new Audio(url);
      
      // Pre-configure custom volumes
      if (type === 'click') audio.volume = 0.4;
      if (type === 'hover') audio.volume = 0.15;
      if (type === 'success') audio.volume = 0.5;
      if (type === 'scroll') audio.volume = 0.9;
      
      audioCache[type] = audio;
    }

    const audio = audioCache[type];
    if (audio) {
      audio.currentTime = 0; 
      audio.play().catch(() => {});
    }
  }, [isSoundEnabled]);

  return { playSound };
}
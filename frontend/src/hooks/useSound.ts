import { useCallback } from 'react';
import { useSoundContext } from '../context/SoundContext';

export type SoundType = 'click' | 'hover' | 'success' | 'scroll' | 'error' | 'extend' | 'Sound-Band';

const audioCache: Partial<Record<SoundType, HTMLAudioElement>> = {};
// THE FIX: An Async Kill Switch to prevent sounds from looping if the user lets go during a network fetch
const stopFlags: Partial<Record<SoundType, boolean>> = {};

// --- GLOBAL POINTER TRACKER ---
let lastX = 0;
let lastY = 0;

if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', (e) => {
    lastX = e.clientX;
    lastY = e.clientY;
  }, { passive: true });

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
    case 'extend': return (await import('../assets/sounds/Rope-Tighten-knot-6.mp3')).default;
    case 'Sound-Band': return (await import('../assets/sounds/Sound-Band-3.mp3')).default;
    default: return '';
  }
};

export function useSound() {
  const { isSoundEnabled } = useSoundContext();

  const preloadSound = useCallback(async (type: SoundType) => {
    if (!audioCache[type]) {
      const url = await fetchAudioUrl(type);
      if (url) audioCache[type] = new Audio(url);
    }
  }, []);

  const playSound = useCallback(async (type: SoundType, options?: { volume?: number, loop?: boolean }) => {
    if (type === 'click' || type === 'hover' || type === 'scroll') {
      window.dispatchEvent(new CustomEvent('fire-spark', { 
        detail: { x: lastX, y: lastY } 
      }));
    }

    if (!isSoundEnabled) return;
    
    // Clear any previous kill switches for this sound
    stopFlags[type] = false;
    
    if (!audioCache[type]) {
      const url = await fetchAudioUrl(type);
      if (!url) return;
      audioCache[type] = new Audio(url);
    }

    // THE FIX: If the user called stopSound() while we were fetching, ABORT!
    if (stopFlags[type]) return;

    const audio = audioCache[type];
    if (audio) {
      let baseVolume = 1;
      if (type === 'click') baseVolume = 0.4;
      if (type === 'hover') baseVolume = 0.15;
      if (type === 'success') baseVolume = 0.5;
      if (type === 'scroll') baseVolume = 0.9;
      if (type === 'extend') baseVolume = 1.0; 
      if (type === 'Sound-Band') baseVolume = 1.0; 
      
      audio.volume = options?.volume !== undefined ? options.volume : baseVolume;
      audio.loop = options?.loop || false;
      
      if (!options?.loop) audio.currentTime = 0; 
      audio.play().catch(() => {});
    }
  }, [isSoundEnabled]);

  const stopSound = useCallback((type: SoundType) => {
    // THE FIX: Instantly flag the kill switch to prevent async ghost loops
    stopFlags[type] = true; 
    
    const audio = audioCache[type];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const setVolume = useCallback((type: SoundType, volume: number) => {
    const audio = audioCache[type];
    if (audio && isSoundEnabled) {
      audio.volume = Math.max(0, Math.min(1, volume));
    }
  }, [isSoundEnabled]);

  return { playSound, stopSound, setVolume, preloadSound };
}
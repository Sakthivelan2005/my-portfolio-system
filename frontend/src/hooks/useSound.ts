import { useEffect, useCallback } from 'react';
import { useSoundContext } from '../context/SoundContext';
import { audioPool } from '../utils/audioPool';

// Import assets directly so Vite/Webpack hashes the URLs correctly
import clickSnd from '../assets/sounds/mixkit-modern-technology-select-3124.wav';
import scrollSnd from '../assets/sounds/scroll.mp3';
import errorSnd from '../assets/sounds/error.mp3';
import successSnd from '../assets/sounds/success.mp3';
import bandSnd from '../assets/sounds/Sound-Band-3.mp3';
import extendSnd from '../assets/sounds/Rope-Tighten-knot-6.mp3';

export type SoundType = 'click' | 'hover' | 'success' | 'scroll' | 'error' | 'extend' | 'Sound-Band';

const SOUND_ASSETS: Record<SoundType, string> = {
  click: clickSnd,
  hover: scrollSnd, 
  scroll: scrollSnd,
  error: errorSnd,
  success: successSnd,
  'Sound-Band': bandSnd,
  extend: extendSnd
};

const BASE_VOLUMES: Record<SoundType, number> = {
  click: 0.4,
  hover: 0.15,
  success: 0.5,
  scroll: 0.9,
  error: 1.0,
  extend: 1.0,
  'Sound-Band': 1.0
};

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

export function useSound() {
  const { isSoundEnabled } = useSoundContext();

  const preloadSound = useCallback((type: SoundType) => {
    audioPool.load(type, SOUND_ASSETS[type]);
  }, []);

  useEffect(() => {
    // Pre-decode UI sounds immediately into RAM
    const preloadUI = () => {
      preloadSound('click');
      preloadSound('hover');
      preloadSound('scroll');
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(preloadUI, { timeout: 2000 });
    } else {
      setTimeout(preloadUI, 1000);
    }
  }, [preloadSound]);

  const playSound = useCallback((type: SoundType, options?: { volume?: number; loop?: boolean }) => {
    if (type === 'click' || type === 'hover' || type === 'scroll') {
      window.dispatchEvent(new CustomEvent('fire-spark', { 
        detail: { x: lastX, y: lastY } 
      }));
    }

    if (!isSoundEnabled) return;

    const finalVolume = options?.volume !== undefined ? options.volume : BASE_VOLUMES[type];
    audioPool.play(type, { volume: finalVolume, loop: options?.loop });
  }, [isSoundEnabled]);

  const stopSound = useCallback((type: SoundType) => {
    audioPool.stop(type);
  }, []);

  const setVolume = useCallback((type: SoundType, volume: number) => {
    if (!isSoundEnabled) return;
    
    // If the sound isn't actively playing, start it. If it is, adjust the volume live.
    if (!audioPool.activeNodes.has(type)) {
      playSound(type, { volume, loop: true });
    } else {
      audioPool.setVolume(type, volume);
    }
  }, [isSoundEnabled, playSound]);

  return { playSound, stopSound, setVolume, preloadSound };
}
/**
 * useWindowSize Hook
 * 
 * Tracks window size changes
 * Useful for responsive layouts and virtualization
 * Debounced to avoid excessive re-renders
 */

import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

const DEBOUNCE_DELAY = 150; // ms

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, DEBOUNCE_DELAY);
    };

    // Set initial size
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(debounceTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
}

import { useState, useEffect } from 'react';
import { CanvasDimensions } from '../types/simulation';

export function useResponsiveCanvas() {
  const [dimensions, setDimensions] = useState<CanvasDimensions>({ width: 400, height: 400 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateDimensions = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const isCurrentlyMobile = windowWidth < 1024;
      
      setIsMobile(isCurrentlyMobile);

      if (isCurrentlyMobile) {
        // Mobile layout
        if (windowWidth < windowHeight) {
          // Portrait: 3:4 aspect ratio based on screen width
          const width = Math.min(windowWidth - 32, 400); // 32px for padding
          const height = Math.floor(width * 4 / 3);
          setDimensions({ width, height });
        } else {
          // Landscape: Fixed dimensions
          setDimensions({ width: 300, height: 200 });
        }
      } else {
        // Desktop: Square up to 600x600px maximum
        const availableWidth = windowWidth - 384 - 48; // Sidebar width + padding
        const maxSize = Math.min(600, availableWidth, windowHeight - 96);
        setDimensions({ width: maxSize, height: maxSize });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return { dimensions, isMobile };
}
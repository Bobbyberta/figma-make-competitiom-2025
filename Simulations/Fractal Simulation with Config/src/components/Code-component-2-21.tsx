import { useEffect, useRef } from 'react';
import { FractalConfig } from './types/FractalTypes';

interface FractalAnimatorProps {
  config: FractalConfig;
  onConfigChange: (config: Partial<FractalConfig>) => void;
}

export function FractalAnimator({ config, onConfigChange }: FractalAnimatorProps) {
  const animationRef = useRef<number>();
  const timeRef = useRef<number>(0);

  useEffect(() => {
    if (!config.animate) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (!timeRef.current) timeRef.current = timestamp;
      
      const deltaTime = (timestamp - timeRef.current) / 1000; // Convert to seconds
      timeRef.current = timestamp;

      if (config.fractalType === 'julia') {
        // Animate Julia set constant
        const time = timestamp * 0.001 * config.animationSpeed;
        const newReal = Math.cos(time) * 0.5;
        const newImaginary = Math.sin(time * 0.7) * 0.5;
        
        onConfigChange({
          juliaC: {
            real: newReal,
            imaginary: newImaginary
          }
        });
      } else {
        // Animate Mandelbrot zoom and position
        const time = timestamp * 0.0005 * config.animationSpeed;
        const zoomFactor = 1 + Math.sin(time) * 0.1;
        const offsetX = Math.cos(time * 0.3) * 0.1;
        const offsetY = Math.sin(time * 0.5) * 0.1;
        
        onConfigChange({
          zoom: config.zoom * zoomFactor,
          centerX: config.centerX + offsetX * deltaTime,
          centerY: config.centerY + offsetY * deltaTime
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [config.animate, config.fractalType, config.animationSpeed, config.zoom, config.centerX, config.centerY, onConfigChange]);

  return null; // This component doesn't render anything
}
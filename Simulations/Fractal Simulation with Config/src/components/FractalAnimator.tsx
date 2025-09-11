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
    if (!config.animate || config.animationPaused) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (!timeRef.current) timeRef.current = timestamp;
      
      const deltaTime = (timestamp - timeRef.current) / 1000; // Convert to seconds
      timeRef.current = timestamp;

      // Animate iterations between min and max values
      const time = timestamp * 0.001 * config.animationSpeed;
      const { animationMinIterations, animationMaxIterations } = config;
      
      // Create triangular wave: goes from 0 to 1 and back to 0 linearly
      const period = 2; // Complete cycle takes 2 seconds at 1x speed
      const normalizedTime = (time % period) / period; // 0 to 1 over one period
      
      // Create triangular wave (0 -> 1 -> 0)
      const triangularWave = normalizedTime <= 0.5 
        ? normalizedTime * 2  // Going up: 0 to 1
        : 2 - (normalizedTime * 2); // Going down: 1 to 0
      
      const iterationRange = animationMaxIterations - animationMinIterations;
      const animatedIterations = Math.round(animationMinIterations + (triangularWave * iterationRange));
      
      onConfigChange({
        maxIterations: animatedIterations
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [config.animate, config.animationPaused, config.fractalType, config.animationSpeed, config.zoom, config.centerX, config.centerY, onConfigChange]);

  return null; // This component doesn't render anything
}
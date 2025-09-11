import React, { useRef, useEffect, useCallback } from 'react';
import { Bird } from './Bird';
import { Predator } from './Predator';
import { Tree } from './Tree';
import { Vector2 } from './Vector2';
import { SimulationParams } from './SimulationParams';

interface SimulationCanvasProps {
  birds: Bird[];
  predators: Predator[];
  trees: Tree[];
  params: SimulationParams;
  isPaused: boolean;
  onAddBird: (x: number, y: number) => void;
  onAddPredator: (x: number, y: number) => void;
  onAddTree: (x: number, y: number) => void;
  setBirds: (birds: Bird[]) => void;
  isMobile: boolean;
}

export function SimulationCanvas({
  birds,
  predators,
  trees,
  params,
  isPaused,
  onAddBird,
  onAddPredator,
  onAddTree,
  setBirds,
  isMobile
}: SimulationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout>();
  const isLongPressRef = useRef(false);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  }, []);

  const animate = useCallback((currentTime: number) => {
    if (!canvasRef.current || isPaused) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    const deltaTime = (currentTime - lastTimeRef.current) / 1000;
    lastTimeRef.current = currentTime;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#4682B4');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Update and render trees
    for (const tree of trees) {
      const newBird = tree.update(birds, params, deltaTime);
      if (newBird) {
        setBirds([...birds, newBird]);
      }
      tree.render(ctx, params);
    }

    // Update and render predators
    for (const predator of predators) {
      predator.update(birds, params, width, height, deltaTime);
      predator.render(ctx, params);
    }

    // Update and render birds
    for (const bird of birds) {
      bird.update(birds, predators, trees, params, width, height);
      bird.render(ctx, params);
    }

    // Render stats
    if (params.showStats) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 200, 120);
      
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.fillText(`Birds: ${birds.length}`, 20, 30);
      ctx.fillText(`Predators: ${predators.length}`, 20, 50);
      ctx.fillText(`Trees: ${trees.length}`, 20, 70);
      
      const totalCaptured = predators.reduce((sum, p) => sum + p.capturedBirds, 0);
      ctx.fillText(`Birds Captured: ${totalCaptured}`, 20, 90);
      
      const fps = Math.round(1 / deltaTime);
      ctx.fillText(`FPS: ${fps}`, 20, 110);
    }

    // Mobile instructions
    if (isMobile) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(width - 220, 10, 210, 80);
      
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.fillText('Tap: Add Bird', width - 210, 30);
      ctx.fillText('Long Press: Add Predator', width - 210, 50);
      ctx.fillText('Double Tap: Add Tree', width - 210, 70);
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [birds, predators, trees, params, isPaused, setBirds, isMobile]);

  useEffect(() => {
    resizeCanvas();
    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [animate, resizeCanvas]);

  const getCanvasCoordinates = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if ('clientX' in event) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      return { x: 0, y: 0 };
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleMouseClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isMobile) return; // Handle differently on mobile
    
    const { x, y } = getCanvasCoordinates(event);
    
    if (event.ctrlKey || event.metaKey) {
      onAddPredator(x, y);
    } else if (event.shiftKey) {
      onAddTree(x, y);
    } else {
      onAddBird(x, y);
    }
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    isLongPressRef.current = false;
    
    const { x, y } = getCanvasCoordinates(event);
    
    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onAddPredator(x, y);
      // Vibrate if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    
    if (!isLongPressRef.current) {
      const { x, y } = getCanvasCoordinates(event);
      onAddBird(x, y);
    }
  };

  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isMobile) return;
    const { x, y } = getCanvasCoordinates(event);
    onAddTree(x, y);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    // Cancel long press if touch moves
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  // Handle double tap for mobile
  const lastTapRef = useRef<number>(0);
  const handleTouchTap = (event: React.TouchEvent<HTMLCanvasElement>) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap detected
      const { x, y } = getCanvasCoordinates(event);
      onAddTree(x, y);
    }
    lastTapRef.current = now;
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-crosshair touch-none"
      onClick={handleMouseClick}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={(e) => {
        handleTouchEnd(e);
        handleTouchTap(e);
      }}
      onTouchMove={handleTouchMove}
      style={{ touchAction: 'none' }}
    />
  );
}
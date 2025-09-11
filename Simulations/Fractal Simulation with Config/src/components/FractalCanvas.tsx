import React, { useRef, useEffect, useCallback } from 'react';
import { FractalConfig } from './types/FractalTypes';

interface FractalCanvasProps {
  config: FractalConfig;
  onConfigChange: (config: Partial<FractalConfig>) => void;
  width: number;
  height: number;
}

export function FractalCanvas({ config, onConfigChange, width, height }: FractalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const isDragging = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });
  const touchStartDistance = useRef(0);
  const touchStartZoom = useRef(1);

  const calculateMandelbrot = useCallback((x: number, y: number, maxIterations: number): number => {
    let zx = 0;
    let zy = 0;
    let iteration = 0;
    
    while (zx * zx + zy * zy < 4 && iteration < maxIterations) {
      const temp = zx * zx - zy * zy + x;
      zy = 2 * zx * zy + y;
      zx = temp;
      iteration++;
    }
    
    return iteration;
  }, []);

  const calculateJulia = useCallback((x: number, y: number, cx: number, cy: number, maxIterations: number): number => {
    let zx = x;
    let zy = y;
    let iteration = 0;
    
    while (zx * zx + zy * zy < 4 && iteration < maxIterations) {
      const temp = zx * zx - zy * zy + cx;
      zy = 2 * zx * zy + cy;
      zx = temp;
      iteration++;
    }
    
    return iteration;
  }, []);

  const calculateBurningShip = useCallback((x: number, y: number, maxIterations: number): number => {
    let zx = 0;
    let zy = 0;
    let iteration = 0;
    
    while (zx * zx + zy * zy < 4 && iteration < maxIterations) {
      const temp = zx * zx - zy * zy + x;
      zy = Math.abs(2 * zx * zy) + y;
      zx = temp;
      iteration++;
    }
    
    return iteration;
  }, []);

  const calculateNewton = useCallback((x: number, y: number, root: number, maxIterations: number): number => {
    let zx = x;
    let zy = y;
    let iteration = 0;
    
    const roots = [];
    for (let i = 0; i < root; i++) {
      const angle = (2 * Math.PI * i) / root;
      roots.push({ x: Math.cos(angle), y: Math.sin(angle) });
    }
    
    while (iteration < maxIterations) {
      // Calculate z^n
      let znx = 1, zny = 0;
      for (let i = 0; i < root; i++) {
        const temp = znx * zx - zny * zy;
        zny = znx * zy + zny * zx;
        znx = temp;
      }
      
      // Calculate n * z^(n-1)
      let derivx = 1, derivy = 0;
      for (let i = 0; i < root - 1; i++) {
        const temp = derivx * zx - derivy * zy;
        derivy = derivx * zy + derivy * zx;
        derivx = temp;
      }
      derivx *= root;
      derivy *= root;
      
      // Newton's method: z = z - (z^n - 1) / (n * z^(n-1))
      const denominator = derivx * derivx + derivy * derivy;
      if (denominator < 1e-10) break;
      
      const numeratorx = znx - 1;
      const numeratory = zny;
      
      const deltax = (numeratorx * derivx + numeratory * derivy) / denominator;
      const deltay = (numeratory * derivx - numeratorx * derivy) / denominator;
      
      zx -= deltax;
      zy -= deltay;
      
      // Check convergence to any root
      for (let i = 0; i < roots.length; i++) {
        const dx = zx - roots[i].x;
        const dy = zy - roots[i].y;
        if (dx * dx + dy * dy < 1e-6) {
          return iteration + i * maxIterations / root;
        }
      }
      
      iteration++;
    }
    
    return maxIterations;
  }, []);

  const calculateTricorn = useCallback((x: number, y: number, maxIterations: number): number => {
    let zx = 0;
    let zy = 0;
    let iteration = 0;
    
    while (zx * zx + zy * zy < 4 && iteration < maxIterations) {
      const temp = zx * zx - zy * zy + x;
      zy = -2 * zx * zy + y; // Note the negative sign - this is what makes it different from Mandelbrot
      zx = temp;
      iteration++;
    }
    
    return iteration;
  }, []);



  const getColor = useCallback((iterations: number, maxIterations: number, palette: string): string => {
    if (iterations === maxIterations) return '#000000';
    
    const ratio = iterations / maxIterations;
    
    switch (palette) {
      case 'classic':
        const hue = (ratio * 360) % 360;
        return `hsl(${hue}, 100%, ${50 + ratio * 50}%)`;
      case 'fire':
        const r = Math.min(255, ratio * 255 * 2);
        const g = Math.min(255, Math.max(0, (ratio - 0.5) * 255 * 2));
        const b = Math.max(0, (ratio - 0.8) * 255 * 5);
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
      case 'ocean':
        const blue = Math.min(255, ratio * 255 * 1.5);
        const green = Math.min(255, Math.max(0, (ratio - 0.3) * 255 * 1.5));
        const red = Math.max(0, (ratio - 0.7) * 255 * 2);
        return `rgb(${Math.floor(red)}, ${Math.floor(green)}, ${Math.floor(blue)})`;
      case 'grayscale':
        const gray = Math.floor(ratio * 255);
        return `rgb(${gray}, ${gray}, ${gray})`;
      default:
        return `hsl(${(ratio * 360) % 360}, 100%, 50%)`;
    }
  }, []);

  const renderFractal = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    const { centerX, centerY, zoom, maxIterations, fractalType, juliaC, newtonRoot, colorPalette } = config;
    
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const x = (px - width / 2) / (width / 4) / zoom + centerX;
        const y = (py - height / 2) / (height / 4) / zoom + centerY;
        
        let iterations: number;
        switch (fractalType) {
          case 'mandelbrot':
            iterations = calculateMandelbrot(x, y, maxIterations);
            break;
          case 'julia':
            iterations = calculateJulia(x, y, juliaC.real, juliaC.imaginary, maxIterations);
            break;
          case 'burning-ship':
            iterations = calculateBurningShip(x, y, maxIterations);
            break;
          case 'newton':
            iterations = calculateNewton(x, y, newtonRoot, maxIterations);
            break;
          case 'tricorn':
            iterations = calculateTricorn(x, y, maxIterations);
            break;
          default:
            iterations = calculateMandelbrot(x, y, maxIterations);
        }
        
        const color = getColor(iterations, maxIterations, colorPalette);
        const rgb = color.match(/\d+/g);
        
        if (rgb) {
          const index = (py * width + px) * 4;
          data[index] = parseInt(rgb[0]);     // R
          data[index + 1] = parseInt(rgb[1]); // G
          data[index + 2] = parseInt(rgb[2]); // B
          data[index + 3] = 255;              // A
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }, [config, width, height, calculateMandelbrot, calculateJulia, calculateBurningShip, calculateNewton, calculateTricorn, getColor]);

  useEffect(() => {
    renderFractal();
  }, [renderFractal]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    
    const deltaX = e.clientX - lastPosition.current.x;
    const deltaY = e.clientY - lastPosition.current.y;
    
    const sensitivity = 1 / (config.zoom * width / 4);
    
    onConfigChange({
      centerX: config.centerX - deltaX * sensitivity,
      centerY: config.centerY - deltaY * sensitivity
    });
    
    lastPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    onConfigChange({ zoom: config.zoom * zoomFactor });
  };

  const getTouchDistance = (touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      isDragging.current = true;
      lastPosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      touchStartDistance.current = getTouchDistance(e.touches);
      touchStartZoom.current = config.zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1 && isDragging.current) {
      const deltaX = e.touches[0].clientX - lastPosition.current.x;
      const deltaY = e.touches[0].clientY - lastPosition.current.y;
      
      const sensitivity = 1 / (config.zoom * width / 4);
      
      onConfigChange({
        centerX: config.centerX - deltaX * sensitivity,
        centerY: config.centerY - deltaY * sensitivity
      });
      
      lastPosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      const currentDistance = getTouchDistance(e.touches);
      const zoomRatio = currentDistance / touchStartDistance.current;
      onConfigChange({ zoom: touchStartZoom.current * zoomRatio });
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border border-border cursor-move touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
}
import { useRef, useEffect, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { SimulationParams, CanvasDimensions, PATTERN_PRESETS, COLOR_GRADIENTS, RESOLUTION_SETTINGS } from '../types/simulation';

interface ReactionDiffusionProps {
  params: SimulationParams;
  dimensions: CanvasDimensions;
  resetTrigger: number;
}

export function ReactionDiffusion({ params, dimensions, resetTrigger }: ReactionDiffusionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Simulation state
  const gridARef = useRef<Float32Array>();
  const gridBRef = useRef<Float32Array>();
  const newGridARef = useRef<Float32Array>();
  const newGridBRef = useRef<Float32Array>();
  const gridWidthRef = useRef<number>(0);
  const gridHeightRef = useRef<number>(0);

  const initializeGrid = useCallback(() => {
    const resolutionScale = RESOLUTION_SETTINGS[params.resolution].scale;
    const gridWidth = Math.floor(dimensions.width * resolutionScale);
    const gridHeight = Math.floor(dimensions.height * resolutionScale);
    
    gridWidthRef.current = gridWidth;
    gridHeightRef.current = gridHeight;
    
    const size = gridWidth * gridHeight;
    gridARef.current = new Float32Array(size);
    gridBRef.current = new Float32Array(size);
    newGridARef.current = new Float32Array(size);
    newGridBRef.current = new Float32Array(size);
    
    // Initialize with A=1, B=0 everywhere
    gridARef.current.fill(1.0);
    gridBRef.current.fill(0.0);
    
    // Apply pattern-specific initialization
    const centerX = Math.floor(gridWidth / 2);
    const centerY = Math.floor(gridHeight / 2);
    
    switch (params.pattern) {
      case 'coral':
        // Single central circular blob (radius 8px scaled)
        const coralRadius = 8 * resolutionScale;
        for (let y = 0; y < gridHeight; y++) {
          for (let x = 0; x < gridWidth; x++) {
            const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            if (dist <= coralRadius) {
              const index = y * gridWidth + x;
              gridARef.current[index] = 0.0;
              gridBRef.current[index] = 1.0;
            }
          }
        }
        break;
        
      case 'spots':
        // 3x3 grid of small spots (radius 3px, spaced 30px apart)
        const spotRadius = 3 * resolutionScale;
        const spotSpacing = 30 * resolutionScale;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const spotX = centerX + i * spotSpacing;
            const spotY = centerY + j * spotSpacing;
            for (let y = 0; y < gridHeight; y++) {
              for (let x = 0; x < gridWidth; x++) {
                const dist = Math.sqrt((x - spotX) ** 2 + (y - spotY) ** 2);
                if (dist <= spotRadius) {
                  const index = y * gridWidth + x;
                  gridARef.current[index] = 0.0;
                  gridBRef.current[index] = 1.0;
                }
              }
            }
          }
        }
        break;
        
      case 'zebra':
        // Vertical stripes (10px wide, 20px spacing)
        const stripeWidth = 10 * resolutionScale;
        const stripeSpacing = 20 * resolutionScale;
        for (let y = 0; y < gridHeight; y++) {
          for (let x = 0; x < gridWidth; x++) {
            if (Math.floor(x / stripeSpacing) % 2 === 0 && (x % stripeSpacing) < stripeWidth) {
              const index = y * gridWidth + x;
              gridARef.current[index] = 0.0;
              gridBRef.current[index] = 1.0;
            }
          }
        }
        break;
        
      case 'maze':
        // Grid pattern (5px lines every 25px)
        const lineWidth = 5 * resolutionScale;
        const gridSpacing = 25 * resolutionScale;
        for (let y = 0; y < gridHeight; y++) {
          for (let x = 0; x < gridWidth; x++) {
            const onVerticalLine = (x % gridSpacing) < lineWidth;
            const onHorizontalLine = (y % gridSpacing) < lineWidth;
            if (onVerticalLine || onHorizontalLine) {
              const index = y * gridWidth + x;
              gridARef.current[index] = 0.0;
              gridBRef.current[index] = 1.0;
            }
          }
        }
        break;
        
      case 'waves':
        // Sine wave (amplitude 20, frequency 0.3, thickness 2px each side)
        const amplitude = 20 * resolutionScale;
        const frequency = 0.3 / resolutionScale;
        const thickness = 2 * resolutionScale;
        for (let y = 0; y < gridHeight; y++) {
          for (let x = 0; x < gridWidth; x++) {
            const waveY = centerY + amplitude * Math.sin(frequency * x);
            if (Math.abs(y - waveY) <= thickness) {
              const index = y * gridWidth + x;
              gridARef.current[index] = 0.0;
              gridBRef.current[index] = 1.0;
            }
          }
        }
        break;
        
      case 'spirals':
        // Logarithmic spiral (8π turns, r = t*2, thickness 3x3px)
        const maxT = 8 * Math.PI;
        const spiralThickness = 3 * resolutionScale;
        for (let y = 0; y < gridHeight; y++) {
          for (let x = 0; x < gridWidth; x++) {
            for (let t = 0; t < maxT; t += 0.1) {
              const r = t * 2 * resolutionScale;
              const spiralX = centerX + r * Math.cos(t);
              const spiralY = centerY + r * Math.sin(t);
              const dist = Math.sqrt((x - spiralX) ** 2 + (y - spiralY) ** 2);
              if (dist <= spiralThickness) {
                const index = y * gridWidth + x;
                gridARef.current[index] = 0.0;
                gridBRef.current[index] = 1.0;
                break;
              }
            }
          }
        }
        break;
        
      case 'unstable':
        // 12 random clusters (radius 3-8px each)
        for (let cluster = 0; cluster < 12; cluster++) {
          const clusterX = Math.floor(Math.random() * gridWidth);
          const clusterY = Math.floor(Math.random() * gridHeight);
          const clusterRadius = (3 + Math.random() * 5) * resolutionScale;
          for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
              const dist = Math.sqrt((x - clusterX) ** 2 + (y - clusterY) ** 2);
              if (dist <= clusterRadius) {
                const index = y * gridWidth + x;
                gridARef.current[index] = 0.0;
                gridBRef.current[index] = 1.0;
              }
            }
          }
        }
        break;
    }
    
    // Add 0.8% controlled noise
    for (let i = 0; i < size; i++) {
      if (Math.random() < 0.008) {
        gridARef.current[i] = 0.0;
        gridBRef.current[i] = 1.0;
      }
    }
  }, [params.pattern, params.resolution, dimensions]);

  const interpolateColor = useCallback((value: number): [number, number, number] => {
    const gradient = COLOR_GRADIENTS[params.colorScheme];
    const colors = gradient.colors;
    
    // Clamp value between 0 and 1
    const clampedValue = Math.max(0, Math.min(1, value));
    
    if (clampedValue <= 0) return colors[0];
    if (clampedValue >= 1) return colors[colors.length - 1];
    
    // Find the two colors to interpolate between
    const scaledValue = clampedValue * (colors.length - 1);
    const index = Math.floor(scaledValue);
    const fraction = scaledValue - index;
    
    const color1 = colors[index];
    const color2 = colors[Math.min(index + 1, colors.length - 1)];
    
    return [
      Math.floor(color1[0] + (color2[0] - color1[0]) * fraction),
      Math.floor(color1[1] + (color2[1] - color1[1]) * fraction),
      Math.floor(color1[2] + (color2[2] - color1[2]) * fraction)
    ];
  }, [params.colorScheme]);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gridBRef.current) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const gridWidth = gridWidthRef.current;
    const gridHeight = gridHeightRef.current;
    const imageData = ctx.createImageData(gridWidth, gridHeight);
    const data = imageData.data;
    
    for (let i = 0; i < gridBRef.current.length; i++) {
      const [r, g, b] = interpolateColor(gridBRef.current[i]);
      const pixelIndex = i * 4;
      data[pixelIndex] = r;
      data[pixelIndex + 1] = g;
      data[pixelIndex + 2] = b;
      data[pixelIndex + 3] = 255;
    }
    
    ctx.putImageData(imageData, 0, 0);
  }, [interpolateColor]);

  const simulationStep = useCallback(() => {
    if (!gridARef.current || !gridBRef.current || !newGridARef.current || !newGridBRef.current) return;
    
    const gridWidth = gridWidthRef.current;
    const gridHeight = gridHeightRef.current;
    const dt = 0.5;
    const { feedRate, killRate, diffusionA, diffusionB } = params;
    
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const index = y * gridWidth + x;
        
        // Calculate Laplacian for A and B using periodic boundary conditions
        const left = y * gridWidth + ((x - 1 + gridWidth) % gridWidth);
        const right = y * gridWidth + ((x + 1) % gridWidth);
        const up = ((y - 1 + gridHeight) % gridHeight) * gridWidth + x;
        const down = ((y + 1) % gridHeight) * gridWidth + x;
        
        const laplacianA = gridARef.current[left] + gridARef.current[right] + 
                          gridARef.current[up] + gridARef.current[down] - 
                          4 * gridARef.current[index];
        
        const laplacianB = gridBRef.current[left] + gridBRef.current[right] + 
                          gridBRef.current[up] + gridBRef.current[down] - 
                          4 * gridBRef.current[index];
        
        const A = gridARef.current[index];
        const B = gridBRef.current[index];
        const reaction = A * B * B;
        
        // Gray-Scott equations
        const deltaA = diffusionA * laplacianA - reaction + feedRate * (1 - A);
        const deltaB = diffusionB * laplacianB + reaction - (killRate + feedRate) * B;
        
        // Update with clamping
        newGridARef.current[index] = Math.max(0, Math.min(1, A + deltaA * dt));
        newGridBRef.current[index] = Math.max(0, Math.min(1, B + deltaB * dt));
      }
    }
    
    // Swap grids
    [gridARef.current, newGridARef.current] = [newGridARef.current, gridARef.current];
    [gridBRef.current, newGridBRef.current] = [newGridBRef.current, gridBRef.current];
  }, [params]);

  const animate = useCallback((currentTime: number) => {
    if (startTimeRef.current === 0) {
      startTimeRef.current = currentTime;
    }
    
    const elapsed = (currentTime - startTimeRef.current) / 1000; // Convert to seconds
    setElapsedTime(elapsed);
    
    // Check if animation should stop
    if (params.animationDuration > 0 && elapsed >= params.animationDuration) {
      setIsAnimating(false);
      return;
    }
    
    const resolutionScale = RESOLUTION_SETTINGS[params.resolution].scale;
    const steps = resolutionScale <= 0.5 ? 25 : Math.max(10, Math.floor(25 / resolutionScale));
    
    for (let i = 0; i < steps; i++) {
      simulationStep();
    }
    
    renderCanvas();
    animationRef.current = requestAnimationFrame(animate);
  }, [simulationStep, renderCanvas, params.resolution, params.animationDuration]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsLoading(true);
    
    const resolutionScale = RESOLUTION_SETTINGS[params.resolution].scale;
    const gridWidth = Math.floor(dimensions.width * resolutionScale);
    const gridHeight = Math.floor(dimensions.height * resolutionScale);
    
    // Set canvas dimensions immediately
    canvas.width = gridWidth;
    canvas.height = gridHeight;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
    
    // Apply pixelated rendering for low resolution
    if (resolutionScale <= 0.5) {
      canvas.style.imageRendering = 'pixelated';
    } else {
      canvas.style.imageRendering = 'auto';
    }
    
    // Initialize and render pattern synchronously
    initializeGrid();
    renderCanvas();
    setIsLoading(false);
    
    // Reset animation state
    setIsAnimating(params.animationDuration === 0 || params.animationDuration > 0);
    setElapsedTime(0);
    startTimeRef.current = 0;
    
    // Start simulation in next frame
    setTimeout(() => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (params.animationDuration === 0 || params.animationDuration > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    }, 16);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [params, dimensions, resetTrigger, initializeGrid, renderCanvas, animate]);

  return (
    <div className="relative inline-block">
      <canvas
        ref={canvasRef}
        className="border border-border rounded-lg bg-background"
      />
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
        </div>
      )}
      {/* Animation Status Indicator */}
      {!isLoading && (
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {params.animationDuration === 0 ? (
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Running
            </span>
          ) : isAnimating ? (
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              {Math.floor(elapsedTime)}s / {params.animationDuration}s
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              Static ({params.animationDuration}s)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
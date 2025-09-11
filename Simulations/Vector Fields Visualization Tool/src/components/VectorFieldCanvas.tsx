import React, { useEffect, useRef, useCallback } from 'react';

interface VectorFieldProps {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
  xn: number;
  yn: number;
  v: number;
  vh: number;
  particleSpeed: number;
  vxEquation: string;
  vyEquation: string;
  particles: Particle[];
  isPlaying: boolean;
  onAddParticle: (particle: Particle) => void;
  onRemoveParticle: (particleId: number) => void;
  onUpdateParticles: (particles: Particle[]) => void;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  trail: { x: number; y: number }[];
}

export const VectorFieldCanvas: React.FC<VectorFieldProps> = ({
  xmin,
  xmax,
  ymin,
  ymax,
  xn,
  yn,
  v,
  vh,
  particleSpeed,
  vxEquation,
  vyEquation,
  particles,
  isPlaying,
  onAddParticle,
  onRemoveParticle,
  onUpdateParticles
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastUpdateTime = useRef<number>(0);

  // Evaluate mathematical expression safely
  const evaluateExpression = useCallback((expression: string, xVal: number, yVal: number): number => {
    try {
      // Replace variables and mathematical functions
      let expr = expression
        .replace(/\bx\b/g, xVal.toString())
        .replace(/\by\b/g, yVal.toString())
        .replace(/\^/g, '**')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/exp/g, 'Math.exp')
        .replace(/log/g, 'Math.log')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/abs/g, 'Math.abs')
        .replace(/pi/g, 'Math.PI')
        .replace(/e(?![a-zA-Z])/g, 'Math.E');

      // Security check
      if (expr.includes('eval') || 
          expr.includes('Function') || 
          expr.includes('constructor') ||
          expr.includes('prototype')) {
        return 0;
      }

      const result = Function('"use strict"; return (' + expr + ')')();
      return typeof result === 'number' && !isNaN(result) ? result : 0;
    } catch {
      return 0;
    }
  }, []);

  // Vector field equations using user-defined expressions
  const getVectorField = useCallback((x: number, y: number) => {
    const vx = evaluateExpression(vxEquation, x, y);
    const vy = evaluateExpression(vyEquation, x, y);
    return { vx, vy };
  }, [vxEquation, vyEquation, evaluateExpression]);

  // Convert world coordinates to canvas coordinates
  const worldToCanvas = useCallback((x: number, y: number, canvas: HTMLCanvasElement) => {
    const displayWidth = canvas.width / window.devicePixelRatio;
    const displayHeight = canvas.height / window.devicePixelRatio;
    const canvasX = ((x - xmin) / (xmax - xmin)) * displayWidth;
    const canvasY = displayHeight - ((y - ymin) / (ymax - ymin)) * displayHeight;
    return { x: canvasX, y: canvasY };
  }, [xmin, xmax, ymin, ymax]);

  // Convert canvas coordinates to world coordinates
  const canvasToWorld = useCallback((canvasX: number, canvasY: number, canvas: HTMLCanvasElement) => {
    const displayWidth = canvas.width / window.devicePixelRatio;
    const displayHeight = canvas.height / window.devicePixelRatio;
    const x = xmin + (canvasX / displayWidth) * (xmax - xmin);
    const y = ymin + ((displayHeight - canvasY) / displayHeight) * (ymax - ymin);
    return { x, y };
  }, [xmin, xmax, ymin, ymax]);

  // Draw vector field arrows
  const drawVectorField = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 1;

    for (let i = 0; i <= xn; i++) {
      for (let j = 0; j <= yn; j++) {
        const x = xmin + (i / xn) * (xmax - xmin);
        const y = ymin + (j / yn) * (ymax - ymin);
        
        const { vx, vy } = getVectorField(x, y);
        const magnitude = Math.sqrt(vx * vx + vy * vy);
        
        if (magnitude > 0.001) {
          const startPos = worldToCanvas(x, y, canvas);
          const endX = x + (vx / magnitude) * v * 50; // v controls vector length
          const endY = y + (vy / magnitude) * v * 50;
          const endPos = worldToCanvas(endX, endY, canvas);

          // Draw arrow shaft
          ctx.beginPath();
          ctx.moveTo(startPos.x, startPos.y);
          ctx.lineTo(endPos.x, endPos.y);
          ctx.stroke();

          // Draw arrowhead - vh controls arrowhead size
          const angle = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x);
          const headLength = vh * 100; // vh controls arrowhead size
          
          ctx.beginPath();
          ctx.moveTo(endPos.x, endPos.y);
          ctx.lineTo(
            endPos.x - headLength * Math.cos(angle - Math.PI / 6),
            endPos.y - headLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(endPos.x, endPos.y);
          ctx.lineTo(
            endPos.x - headLength * Math.cos(angle + Math.PI / 6),
            endPos.y - headLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
        }
      }
    }
  }, [xmin, xmax, ymin, ymax, xn, yn, v, vh, getVectorField, worldToCanvas]);

  // Draw labeled grid
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const devicePixelRatio = window.devicePixelRatio;
    const displayWidth = canvas.width / devicePixelRatio;
    const displayHeight = canvas.height / devicePixelRatio;

    // Grid lines
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 0.5;

    // Calculate nice step values for labels
    const xRange = xmax - xmin;
    const yRange = ymax - ymin;
    const xStep = xRange / 10; // Aim for about 10 major divisions
    const yStep = yRange / 10;

    // Round steps to nice values
    const roundToNiceNumber = (value: number) => {
      const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
      const normalized = value / magnitude;
      if (normalized <= 1) return magnitude;
      if (normalized <= 2) return 2 * magnitude;
      if (normalized <= 5) return 5 * magnitude;
      return 10 * magnitude;
    };

    const niceXStep = roundToNiceNumber(xStep);
    const niceYStep = roundToNiceNumber(yStep);

    // Draw vertical grid lines with labels
    const xStart = Math.ceil(xmin / niceXStep) * niceXStep;
    for (let x = xStart; x <= xmax; x += niceXStep) {
      if (Math.abs(x) < niceXStep / 2) x = 0; // Snap to exact zero
      
      const startPos = worldToCanvas(x, ymin, canvas);
      const endPos = worldToCanvas(x, ymax, canvas);
      
      // Draw grid line
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(endPos.x, endPos.y);
      ctx.stroke();
      
      // Add label if not zero (zero will be labeled separately)
      if (Math.abs(x) > niceXStep / 2) {
        ctx.fillStyle = '#6B7280';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        // Position label below x-axis if visible, otherwise at bottom
        let labelY;
        if (ymin <= 0 && ymax >= 0) {
          const axisPos = worldToCanvas(x, 0, canvas);
          labelY = axisPos.y + 8;
        } else {
          labelY = displayHeight - 8;
        }
        
        ctx.fillText(x.toFixed(1).replace('.0', ''), startPos.x, labelY);
      }
    }

    // Draw horizontal grid lines with labels
    const yStart = Math.ceil(ymin / niceYStep) * niceYStep;
    for (let y = yStart; y <= ymax; y += niceYStep) {
      if (Math.abs(y) < niceYStep / 2) y = 0; // Snap to exact zero
      
      const startPos = worldToCanvas(xmin, y, canvas);
      const endPos = worldToCanvas(xmax, y, canvas);
      
      // Draw grid line
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(endPos.x, endPos.y);
      ctx.stroke();
      
      // Add label if not zero (zero will be labeled separately)
      if (Math.abs(y) > niceYStep / 2) {
        ctx.fillStyle = '#6B7280';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        
        // Position label to left of y-axis if visible, otherwise at left edge
        let labelX;
        if (xmin <= 0 && xmax >= 0) {
          const axisPos = worldToCanvas(0, y, canvas);
          labelX = axisPos.x - 8;
        } else {
          labelX = 8;
        }
        
        ctx.fillText(y.toFixed(1).replace('.0', ''), labelX, startPos.y);
      }
    }

    // Draw axes with enhanced styling
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    
    // X-axis (y = 0)
    if (ymin <= 0 && ymax >= 0) {
      const startPos = worldToCanvas(xmin, 0, canvas);
      const endPos = worldToCanvas(xmax, 0, canvas);
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(endPos.x, endPos.y);
      ctx.stroke();
      
      // X-axis arrow
      ctx.beginPath();
      ctx.moveTo(endPos.x - 10, endPos.y - 4);
      ctx.lineTo(endPos.x, endPos.y);
      ctx.lineTo(endPos.x - 10, endPos.y + 4);
      ctx.stroke();
      
      // X label
      ctx.fillStyle = '#374151';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText('x', endPos.x - 15, endPos.y - 8);
    }

    // Y-axis (x = 0)
    if (xmin <= 0 && xmax >= 0) {
      const startPos = worldToCanvas(0, ymin, canvas);
      const endPos = worldToCanvas(0, ymax, canvas);
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(endPos.x, endPos.y);
      ctx.stroke();
      
      // Y-axis arrow
      ctx.beginPath();
      ctx.moveTo(endPos.x - 4, endPos.y + 10);
      ctx.lineTo(endPos.x, endPos.y);
      ctx.lineTo(endPos.x + 4, endPos.y + 10);
      ctx.stroke();
      
      // Y label
      ctx.fillStyle = '#374151';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText('y', endPos.x + 8, endPos.y + 15);
    }

    // Origin label
    if (xmin <= 0 && xmax >= 0 && ymin <= 0 && ymax >= 0) {
      const originPos = worldToCanvas(0, 0, canvas);
      ctx.fillStyle = '#374151';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText('0', originPos.x - 8, originPos.y - 8);
    }
  }, [xmin, xmax, ymin, ymax, worldToCanvas]);

  // Draw particles and their trails
  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    particles.forEach(particle => {
      // Draw trail
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      
      if (particle.trail.length > 1) {
        ctx.beginPath();
        const firstPoint = worldToCanvas(particle.trail[0].x, particle.trail[0].y, canvas);
        ctx.moveTo(firstPoint.x, firstPoint.y);
        
        for (let i = 1; i < particle.trail.length; i++) {
          const point = worldToCanvas(particle.trail[i].x, particle.trail[i].y, canvas);
          ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
      }

      // Draw particle
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#DC2626';
      const pos = worldToCanvas(particle.x, particle.y, canvas);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [particles, worldToCanvas]);

  // Update particles with proper React state handling
  const updateParticles = useCallback(() => {
    if (!isPlaying || particles.length === 0) return;
    
    const particlesToRemove: number[] = [];
    const updatedParticles = particles.map(particle => {
      const { vx, vy } = getVectorField(particle.x, particle.y);
      
      // Calculate new position
      const newX = particle.x + vx * particleSpeed;
      const newY = particle.y + vy * particleSpeed;
      
      // Check for boundary collision
      if (newX < xmin || newX > xmax || newY < ymin || newY > ymax) {
        particlesToRemove.push(particle.id);
        return null; // Mark for removal
      }
      
      // Create new trail array with updated position
      const newTrail = [...particle.trail, { x: newX, y: newY }];
      if (newTrail.length > 200) {
        newTrail.shift();
      }
      
      return {
        ...particle,
        x: newX,
        y: newY,
        trail: newTrail
      };
    }).filter((particle): particle is Particle => particle !== null);
    
    // Update particles state with new positions
    onUpdateParticles(updatedParticles);
    
    // Remove particles that hit boundaries (this will be handled by the filter above)
    // No need to call onRemoveParticle since we're already filtering them out
  }, [isPlaying, particles, getVectorField, particleSpeed, xmin, xmax, ymin, ymax, onUpdateParticles]);

  // Main drawing function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    drawGrid(ctx, canvas);
    
    // Draw vector field
    drawVectorField(ctx, canvas);
    
    // Draw particles
    drawParticles(ctx, canvas);
  }, [drawGrid, drawVectorField, drawParticles]);

  // Animation loop with better throttling
  const animate = useCallback(() => {
    if (!animationRef.current) return; // Stop if animation was cancelled
    
    const now = performance.now();
    
    // Only draw if enough time has passed (60fps throttle)
    if (now - lastUpdateTime.current >= 16.67) {
      draw();
      lastUpdateTime.current = now;
      
      // Update particles only when playing
      if (isPlaying) {
        updateParticles();
      }
    }
    
    // Continue animation
    animationRef.current = requestAnimationFrame(animate);
  }, [draw, updateParticles, isPlaying]);

  // Handle canvas click/touch to add particles
  const handleCanvasInteraction = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;
    
    const worldPos = canvasToWorld(canvasX, canvasY, canvas);
    
    const newParticle: Particle = {
      id: Date.now() + Math.random(),
      x: worldPos.x,
      y: worldPos.y,
      trail: [{ x: worldPos.x, y: worldPos.y }]
    };
    
    onAddParticle(newParticle);
  }, [canvasToWorld, onAddParticle]);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    handleCanvasInteraction(event.clientX, event.clientY);
  }, [handleCanvasInteraction]);

  const handleCanvasTouch = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      handleCanvasInteraction(touch.clientX, touch.clientY);
    }
  }, [handleCanvasInteraction]);

  // Set up canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
      
      // Redraw after resize
      draw();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [draw]);

  // Start animation once and let it run continuously
  useEffect(() => {
    lastUpdateTime.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    };
  }, [animate]);

  // Force redraw when parameters change (but don't restart animation)
  useEffect(() => {
    if (!isPlaying) {
      draw(); // Only force redraw when paused
    }
    // When playing, the animation loop will handle updates automatically
  }, [draw, isPlaying, xmin, xmax, ymin, ymax, xn, yn, v, vh, vxEquation, vyEquation]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full border border-border rounded-lg cursor-crosshair bg-white touch-none"
      onClick={handleCanvasClick}
      onTouchStart={handleCanvasTouch}
    />
  );
};
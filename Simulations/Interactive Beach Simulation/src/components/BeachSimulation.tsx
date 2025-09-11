import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface SimulationParams {
  tidalRange: number;
  tidalPeriod: number;
  beachSlope: number;
  grainSize: number;
  waveHeight: number;
  wavePeriod: number;
  simulationSpeed: number;
  sedimentSupply: number;
}

export interface GridPoint {
  x: number;
  h: number; // water depth
  u: number; // velocity
  zb: number; // bed elevation
  qs: number; // sediment transport rate
  sedimentThickness: number; // available sediment thickness
  bedrockLevel: number; // immobile bedrock elevation
  initialSedimentThickness: number; // original sediment thickness for comparison
  cumulativeChange: number; // total change since start
}

// Export function to calculate simulation statistics
export const calculateSimulationStats = (grid: GridPoint[]) => {
  let totalErosion = 0;
  let totalDeposition = 0;
  let maxChange = 0;
  let activeTransportPoints = 0;
  
  for (let i = 0; i < grid.length; i++) {
    const change = grid[i].cumulativeChange;
    if (change > 0) totalDeposition += change;
    if (change < 0) totalErosion += Math.abs(change);
    maxChange = Math.max(maxChange, Math.abs(change));
    if (Math.abs(grid[i].qs) > 0.00001) activeTransportPoints++;
  }
  
  return {
    totalErosion,
    totalDeposition,
    maxChange,
    activeTransportPoints
  };
};

interface BeachSimulationProps {
  onGridUpdate?: (grid: GridPoint[], time: number) => void;
}

export const BeachSimulation: React.FC<BeachSimulationProps> = ({ onGridUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const onGridUpdateRef = useRef(onGridUpdate);
  
  // Update the ref when the callback changes
  useEffect(() => {
    onGridUpdateRef.current = onGridUpdate;
  }, [onGridUpdate]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [showInitialProfile, setShowInitialProfile] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; data?: GridPoint } | null>(null);
  
  const [params, setParams] = useState<SimulationParams>({
    tidalRange: 2.0,
    tidalPeriod: 12.0,
    beachSlope: 0.05,
    grainSize: 0.5,
    waveHeight: 1.0,
    wavePeriod: 8.0,
    simulationSpeed: 1.0,
    sedimentSupply: 1.0
  });

  // Grid setup
  const gridSize = 200;
  const domainLength = 1000; // meters
  const dx = domainLength / gridSize;
  const dt = 0.1; // time step in seconds
  
  const [grid, setGrid] = useState<GridPoint[]>(() => {
    const initialGrid: GridPoint[] = [];
    for (let i = 0; i < gridSize; i++) {
      const x = i * dx;
      // Bedrock profile (fixed base)
      let bedrockLevel;
      if (x < 300) {
        bedrockLevel = -8 + x * 0.01; // gentle underwater slope
      } else if (x < 600) {
        bedrockLevel = -5 + (x - 300) * params.beachSlope; // beach face
      } else {
        bedrockLevel = -5 + 300 * params.beachSlope + (x - 600) * params.beachSlope * 0.5; // upper beach
      }
      
      // Sediment thickness varies by location
      let sedimentThickness;
      if (x < 200) {
        sedimentThickness = 0.2 * params.sedimentSupply; // increased minimal sediment in deep water
      } else if (x < 400) {
        sedimentThickness = 0.8 * params.sedimentSupply; // increased moderate sediment
      } else if (x < 700) {
        sedimentThickness = 1.5 * params.sedimentSupply; // increased maximum sediment on beach face
      } else {
        sedimentThickness = 1.0 * params.sedimentSupply; // increased sediment on upper beach
      }
      
      const zb = bedrockLevel + sedimentThickness;
      
      initialGrid.push({
        x,
        h: Math.max(0, -zb), // water depth (positive for water)
        u: 0,
        zb,
        qs: 0,
        sedimentThickness,
        bedrockLevel,
        initialSedimentThickness: sedimentThickness,
        cumulativeChange: 0
      });
    }
    return initialGrid;
  });

  // Initialize grid when parameters change
  useEffect(() => {
    const initialGrid: GridPoint[] = [];
    for (let i = 0; i < gridSize; i++) {
      const x = i * dx;
      // Bedrock profile (fixed base)
      let bedrockLevel;
      if (x < 300) {
        bedrockLevel = -8 + x * 0.01; // gentle underwater slope
      } else if (x < 600) {
        bedrockLevel = -5 + (x - 300) * params.beachSlope; // beach face
      } else {
        bedrockLevel = -5 + 300 * params.beachSlope + (x - 600) * params.beachSlope * 0.5; // upper beach
      }
      
      // Sediment thickness varies by location
      let sedimentThickness;
      if (x < 200) {
        sedimentThickness = 0.2 * params.sedimentSupply; // increased minimal sediment in deep water
      } else if (x < 400) {
        sedimentThickness = 0.8 * params.sedimentSupply; // increased moderate sediment
      } else if (x < 700) {
        sedimentThickness = 1.5 * params.sedimentSupply; // increased maximum sediment on beach face
      } else {
        sedimentThickness = 1.0 * params.sedimentSupply; // increased sediment on upper beach
      }
      
      const zb = bedrockLevel + sedimentThickness;
      
      initialGrid.push({
        x,
        h: Math.max(0, -zb),
        u: 0,
        zb,
        qs: 0,
        sedimentThickness,
        bedrockLevel,
        initialSedimentThickness: sedimentThickness,
        cumulativeChange: 0
      });
    }
    setGrid(initialGrid);
    // Use setTimeout to avoid updating during render
    setTimeout(() => {
      onGridUpdateRef.current?.(initialGrid, timeRef.current);
    }, 0);
  }, [params.beachSlope, params.sedimentSupply]);

  // Tidal water level calculation
  const getTidalLevel = (time: number): number => {
    return (params.tidalRange / 2) * Math.sin(2 * Math.PI * time / (params.tidalPeriod * 3600));
  };

  // Wave-induced water level fluctuation
  const getWaveLevel = (time: number, x: number): number => {
    return params.waveHeight * Math.sin(2 * Math.PI * time / params.wavePeriod - x / 100);
  };

  // Bedload transport calculation (simplified Meyer-Peter Muller)
  const calculateSedimentTransport = (u: number, h: number, sedimentThickness: number): number => {
    const g = 9.81;
    const rho = 1000; // water density
    const rho_s = 2650; // sediment density
    const d50 = params.grainSize / 1000; // convert mm to m
    const tau = rho * g * h * Math.abs(u) * u / (h + 0.01); // bed shear stress
    const tau_crit = 0.03 * (rho_s - rho) * g * d50; // reduced critical shear stress for easier transport
    
    // Sediment availability factor (reduces transport when sediment is limited)
    const availabilityFactor = Math.min(1, sedimentThickness / 0.02); // full transport with 0.02m or more sediment
    
    if (Math.abs(tau) > tau_crit && h > 0.01 && sedimentThickness > 0.001) { // very low thresholds
      const tau_star = Math.abs(tau) / (tau_crit + 0.0001);
      // Much higher transport rate for guaranteed visible effects
      const transport = 5.0 * Math.sqrt(g * d50) * d50 * Math.pow(Math.min(tau_star - 1, 8), 1.5) * Math.sign(u) * availabilityFactor;
      return Math.max(-0.02, Math.min(0.02, transport)); // higher transport rate limits
    }
    return 0;
  };

  // Update simulation step
  const updateSimulation = useCallback((currentGrid: GridPoint[], currentTime: number): GridPoint[] => {
    const newGrid = [...currentGrid];
    const tideLevel = getTidalLevel(currentTime);
    
    // Apply boundary conditions and update water levels
    for (let i = 0; i < gridSize; i++) {
      const waveLevel = getWaveLevel(currentTime, newGrid[i].x);
      const totalWaterLevel = tideLevel + waveLevel;
      newGrid[i].h = Math.max(0, totalWaterLevel - newGrid[i].zb);
    }

    // Shallow water equations (simplified)
    const newVelocities: number[] = new Array(gridSize).fill(0);
    
    for (let i = 1; i < gridSize - 1; i++) {
      if (newGrid[i].h > 0.05) { // only in water with sufficient depth
        // Momentum equation (simplified)
        const dh_dx = (newGrid[i + 1].h - newGrid[i - 1].h) / (2 * dx);
        const friction = 0.02 * newGrid[i].u * Math.abs(newGrid[i].u) / (newGrid[i].h + 0.01);
        
        // Add pressure gradient and wave-induced forces
        const waveForce = params.waveHeight * 0.2 * Math.cos(2 * Math.PI * currentTime / params.wavePeriod - newGrid[i].x / 100);
        
        newVelocities[i] = newGrid[i].u - dt * (9.81 * dh_dx + friction - waveForce);
        
        // Limit velocity to prevent numerical instabilities
        newVelocities[i] = Math.max(-2.0, Math.min(2.0, newVelocities[i]));
      } else {
        newVelocities[i] = 0;
      }
    }
    
    // Update velocities and calculate sediment transport
    for (let i = 0; i < gridSize; i++) {
      newGrid[i].u = newVelocities[i];
      newGrid[i].qs = calculateSedimentTransport(newGrid[i].u, newGrid[i].h, newGrid[i].sedimentThickness);
    }
    
    // Boundary conditions for velocity
    newGrid[0].u = 0;
    newGrid[gridSize-1].u = 0;

    // Morphodynamic update (Exner equation)
    const porosity = 0.2; // even lower porosity for maximum dramatic changes
    const maxErosionRate = 0.1; // very high maximum bed change per timestep (m)
    
    // Calculate bed changes
    const bedChanges: number[] = new Array(gridSize).fill(0);
    for (let i = 1; i < gridSize - 1; i++) {
      const dqs_dx = (newGrid[i + 1].qs - newGrid[i - 1].qs) / (2 * dx);
      const dzb_dt = -dqs_dx / (1 - porosity);
      let bedChange = dzb_dt * dt * params.simulationSpeed * 10.0; // maximum scaling factor
      
      // Limit bed change rate to prevent instabilities
      bedChange = Math.max(-maxErosionRate, Math.min(maxErosionRate, bedChange));
      bedChanges[i] = bedChange;
    }
    
    // No smoothing to preserve all changes
    for (let i = 2; i < gridSize - 2; i++) {
      // Use raw bed change for maximum effect
      const rawChange = bedChanges[i];
      
      // Update sediment thickness (cannot go below zero)
      const oldThickness = newGrid[i].sedimentThickness;
      const newSedimentThickness = Math.max(0, oldThickness + rawChange);
      newGrid[i].sedimentThickness = newSedimentThickness;
      
      // Track cumulative change
      newGrid[i].cumulativeChange += (newSedimentThickness - oldThickness);
      
      // Update bed elevation (bedrock + sediment)
      newGrid[i].zb = newGrid[i].bedrockLevel + newGrid[i].sedimentThickness;
      
      // Allow larger sediment thicknesses for more dramatic changes
      if (newGrid[i].x < 300) { // underwater region
        newGrid[i].sedimentThickness = Math.min(8.0, newGrid[i].sedimentThickness);
      } else { // beach region
        newGrid[i].sedimentThickness = Math.min(12.0, newGrid[i].sedimentThickness);
      }
      
      // Recalculate bed elevation after limiting
      newGrid[i].zb = newGrid[i].bedrockLevel + newGrid[i].sedimentThickness;
    }
    
    // Fixed boundary conditions to prevent edge effects
    newGrid[0].sedimentThickness = newGrid[1].sedimentThickness;
    newGrid[0].zb = newGrid[1].zb;
    newGrid[gridSize-1].sedimentThickness = newGrid[gridSize-2].sedimentThickness;
    newGrid[gridSize-1].zb = newGrid[gridSize-2].zb;

    return newGrid;
  }, [params, gridSize, dx, dt]);

  // Animation loop
  const animate = useCallback(() => {
    timeRef.current += dt * params.simulationSpeed;
    setGrid(currentGrid => {
      const newGrid = updateSimulation(currentGrid, timeRef.current);
      onGridUpdateRef.current?.(newGrid, timeRef.current);
      return newGrid;
    });
    
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isRunning, params.simulationSpeed, updateSimulation]);

  useEffect(() => {
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, animate]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#87CEEB'; // sky blue background
    ctx.fillRect(0, 0, width, height);

    // Set up coordinate transformation
    const xScale = width / domainLength;
    const yScale = height / 20; // 20 meters vertical range
    const yOffset = height * 0.8; // water level reference

    // Draw bedrock profile
    ctx.beginPath();
    ctx.moveTo(0, yOffset);
    for (let i = 0; i < grid.length; i++) {
      const x = grid[i].x * xScale;
      const y = yOffset - grid[i].bedrockLevel * yScale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = '#654321'; // dark brown for bedrock
    ctx.fill();

    // Draw sediment layer
    ctx.beginPath();
    for (let i = 0; i < grid.length; i++) {
      const x = grid[i].x * xScale;
      const y = yOffset - grid[i].bedrockLevel * yScale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let i = grid.length - 1; i >= 0; i--) {
      const x = grid[i].x * xScale;
      const y = yOffset - grid[i].zb * yScale;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = '#D2B48C'; // tan for sediment
    ctx.fill();

    // Draw initial beach profile (if enabled)
    if (showInitialProfile) {
      ctx.beginPath();
      ctx.moveTo(0, yOffset);
      for (let i = 0; i < grid.length; i++) {
        const x = grid[i].x * xScale;
        const initialZb = grid[i].bedrockLevel + grid[i].initialSedimentThickness;
        const y = yOffset - initialZb * yScale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(244, 164, 96, 0.5)'; // transparent sandy brown for initial
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw current beach profile (sediment layer) with change visualization
    ctx.beginPath();
    ctx.moveTo(0, yOffset);
    for (let i = 0; i < grid.length; i++) {
      const x = grid[i].x * xScale;
      const y = yOffset - grid[i].zb * yScale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#F4A460'; // sandy brown
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw change indicators - erosion (red) vs deposition (green)
    for (let i = 0; i < grid.length; i += 5) {
      const change = grid[i].cumulativeChange;
      if (Math.abs(change) > 0.01) { // only show significant changes
        const x = grid[i].x * xScale;
        const y = yOffset - grid[i].zb * yScale;
        
        // Color based on erosion vs deposition
        const intensity = Math.min(1, Math.abs(change) / 0.5);
        if (change > 0) {
          // Deposition - green
          ctx.fillStyle = `rgba(0, 255, 0, ${0.3 + intensity * 0.7})`;
        } else {
          // Erosion - red
          ctx.fillStyle = `rgba(255, 0, 0, ${0.3 + intensity * 0.7})`;
        }
        
        ctx.beginPath();
        ctx.arc(x, y, 4 + intensity * 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // Draw water surface
    ctx.beginPath();
    for (let i = 0; i < grid.length; i++) {
      const x = grid[i].x * xScale;
      const waterSurface = grid[i].zb + grid[i].h;
      const y = yOffset - waterSurface * yScale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#0066CC';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fill water area
    ctx.beginPath();
    for (let i = 0; i < grid.length; i++) {
      const x = grid[i].x * xScale;
      const waterSurface = grid[i].zb + grid[i].h;
      const y = yOffset - waterSurface * yScale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let i = grid.length - 1; i >= 0; i--) {
      const x = grid[i].x * xScale;
      const y = yOffset - grid[i].zb * yScale;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 102, 204, 0.3)';
    ctx.fill();

    // Draw velocity vectors
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 1;
    for (let i = 0; i < grid.length; i += 8) { // more frequent vectors
      if (grid[i].h > 0.05 && Math.abs(grid[i].u) > 0.005) {
        const x = grid[i].x * xScale;
        const waterSurface = grid[i].zb + grid[i].h / 2;
        const y = yOffset - waterSurface * yScale;
        const velScale = 30; // increased scale for visibility
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + grid[i].u * velScale, y);
        ctx.stroke();
        
        // Arrow head
        if (Math.abs(grid[i].u) > 0.02) {
          const angle = grid[i].u > 0 ? 0 : Math.PI;
          ctx.beginPath();
          ctx.moveTo(x + grid[i].u * velScale, y);
          ctx.lineTo(x + grid[i].u * velScale - 5 * Math.cos(angle - 0.3), y - 5 * Math.sin(angle - 0.3));
          ctx.moveTo(x + grid[i].u * velScale, y);
          ctx.lineTo(x + grid[i].u * velScale - 5 * Math.cos(angle + 0.3), y - 5 * Math.sin(angle + 0.3));
          ctx.stroke();
        }
      }
    }

    // Draw sediment transport indicators
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 3;
    for (let i = 0; i < grid.length; i += 10) { // more frequent indicators
      if (Math.abs(grid[i].qs) > 0.00001) { // lower threshold for showing transport
        const x = grid[i].x * xScale;
        const y = yOffset - grid[i].zb * yScale;
        const transportScale = 20000; // adjusted scale for visibility
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + grid[i].qs * transportScale, y - 8);
        ctx.stroke();
        
        // Larger circle to indicate transport location
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFFF00';
        ctx.fill();
        
        // Add transport magnitude indicator
        const intensity = Math.min(1, Math.abs(grid[i].qs) * 100000);
        ctx.globalAlpha = 0.3 + intensity * 0.7; // vary transparency by transport rate
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFFF00';
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    }

    // Draw grid lines and labels
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      const x = (i * domainLength / 10) * xScale;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }



  }, [grid, domainLength]);

  // Handle canvas mouse events
  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert to simulation coordinates
    const simX = (x / canvas.width) * domainLength;
    const gridIndex = Math.floor(simX / dx);
    
    if (gridIndex >= 0 && gridIndex < grid.length) {
      setHoveredPoint({
        x: event.clientX,
        y: event.clientY,
        data: grid[gridIndex]
      });
    }
  };

  const handleCanvasMouseLeave = () => {
    setHoveredPoint(null);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    timeRef.current = 0;
    const initialGrid: GridPoint[] = [];
    for (let i = 0; i < gridSize; i++) {
      const x = i * dx;
      // Bedrock profile (fixed base)
      let bedrockLevel;
      if (x < 300) {
        bedrockLevel = -8 + x * 0.01; // gentle underwater slope
      } else if (x < 600) {
        bedrockLevel = -5 + (x - 300) * params.beachSlope; // beach face
      } else {
        bedrockLevel = -5 + 300 * params.beachSlope + (x - 600) * params.beachSlope * 0.5; // upper beach
      }
      
      // Sediment thickness varies by location
      let sedimentThickness;
      if (x < 200) {
        sedimentThickness = 0.2 * params.sedimentSupply; // increased minimal sediment in deep water
      } else if (x < 400) {
        sedimentThickness = 0.8 * params.sedimentSupply; // increased moderate sediment
      } else if (x < 700) {
        sedimentThickness = 1.5 * params.sedimentSupply; // increased maximum sediment on beach face
      } else {
        sedimentThickness = 1.0 * params.sedimentSupply; // increased sediment on upper beach
      }
      
      const zb = bedrockLevel + sedimentThickness;
      
      initialGrid.push({
        x,
        h: Math.max(0, -zb),
        u: 0,
        zb,
        qs: 0,
        sedimentThickness,
        bedrockLevel,
        initialSedimentThickness: sedimentThickness,
        cumulativeChange: 0
      });
    }
    setGrid(initialGrid);
    // Use setTimeout to avoid updating during render
    setTimeout(() => {
      onGridUpdateRef.current?.(initialGrid, timeRef.current);
    }, 0);
  };

  const setHighTransportPreset = () => {
    setIsRunning(false);
    timeRef.current = 0;
    setParams({
      tidalRange: 4.0,      // Maximum tidal range
      tidalPeriod: 8.0,     // Faster tidal cycles
      beachSlope: 0.08,     // Steep slope
      grainSize: 0.2,       // Very fine sand (easy to move)
      waveHeight: 2.5,      // Large waves
      wavePeriod: 6.0,      // Shorter period (more energetic)
      simulationSpeed: 2.0, // Faster simulation
      sedimentSupply: 1.5   // Plenty of sediment
    });
    
    // Reset grid with new parameters will happen via useEffect
    setTimeout(() => {
      const initialGrid: GridPoint[] = [];
      for (let i = 0; i < gridSize; i++) {
        const x = i * dx;
        // Bedrock profile (fixed base)
        let bedrockLevel;
        if (x < 300) {
          bedrockLevel = -8 + x * 0.01; // gentle underwater slope
        } else if (x < 600) {
          bedrockLevel = -5 + (x - 300) * 0.08; // beach face with steep slope
        } else {
          bedrockLevel = -5 + 300 * 0.08 + (x - 600) * 0.08 * 0.5; // upper beach
        }
        
        // More sediment for high transport preset
        let sedimentThickness;
        if (x < 200) {
          sedimentThickness = 0.3 * 1.5; // more sediment in deep water
        } else if (x < 400) {
          sedimentThickness = 1.2 * 1.5; // more moderate sediment
        } else if (x < 700) {
          sedimentThickness = 2.0 * 1.5; // maximum sediment on beach face
        } else {
          sedimentThickness = 1.5 * 1.5; // more sediment on upper beach
        }
        
        const zb = bedrockLevel + sedimentThickness;
        
        initialGrid.push({
          x,
          h: Math.max(0, -zb),
          u: 0,
          zb,
          qs: 0,
          sedimentThickness,
          bedrockLevel,
          initialSedimentThickness: sedimentThickness,
          cumulativeChange: 0
        });
      }
      setGrid(initialGrid);
      // Use setTimeout to avoid updating during render
      setTimeout(() => {
        onGridUpdateRef.current?.(initialGrid, timeRef.current);
      }, 0);
    }, 100);
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4">
      {/* Main simulation area */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            variant={isRunning ? "destructive" : "default"}
            size="sm"
          >
            {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isRunning ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={resetSimulation} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={setHighTransportPreset} variant="secondary" size="sm">
            🌊 High Transport
          </Button>
          <Button 
            onClick={() => setShowInitialProfile(!showInitialProfile)} 
            variant="outline" 
            size="sm"
          >
            {showInitialProfile ? 'Hide' : 'Show'} Initial Profile
          </Button>
          <div className="text-sm text-muted-foreground">
            Time: {(timeRef.current / 3600).toFixed(2)} hours
          </div>
        </div>
        
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="border rounded-lg bg-white cursor-crosshair flex-1"
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={handleCanvasMouseLeave}
        />
        
        {/* Hover tooltip */}
        {hoveredPoint && (
          <div
            className="fixed bg-black text-white text-xs p-2 rounded shadow-lg pointer-events-none z-10"
            style={{
              left: hoveredPoint.x + 10,
              top: hoveredPoint.y - 50
            }}
          >
            <div>X: {hoveredPoint.data?.x.toFixed(1)}m</div>
            <div>Water Depth: {hoveredPoint.data?.h.toFixed(2)}m</div>
            <div>Velocity: {hoveredPoint.data?.u.toFixed(2)}m/s</div>
            <div>Bed Elevation: {hoveredPoint.data?.zb.toFixed(2)}m</div>
            <div>Sediment Thickness: {hoveredPoint.data?.sedimentThickness.toFixed(2)}m</div>
            <div>Initial Thickness: {hoveredPoint.data?.initialSedimentThickness.toFixed(2)}m</div>
            <div>Change: {hoveredPoint.data?.cumulativeChange.toFixed(3)}m</div>
            <div>Bedrock Level: {hoveredPoint.data?.bedrockLevel.toFixed(2)}m</div>
            <div>Sediment Transport: {hoveredPoint.data?.qs.toFixed(4)}m²/s</div>
          </div>
        )}
      </div>

      {/* Control panel */}
      <Card className="w-full lg:w-80 h-fit">
        <CardHeader>
          <CardTitle>Simulation Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm mb-2">Tidal Range: {params.tidalRange.toFixed(1)}m</label>
            <Slider
              value={[params.tidalRange]}
              onValueChange={(value) => setParams(prev => ({ ...prev, tidalRange: value[0] }))}
              min={0.5}
              max={5.0}
              step={0.1}
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Tidal Period: {params.tidalPeriod.toFixed(1)}h</label>
            <Slider
              value={[params.tidalPeriod]}
              onValueChange={(value) => setParams(prev => ({ ...prev, tidalPeriod: value[0] }))}
              min={6}
              max={24}
              step={0.5}
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Beach Slope: {params.beachSlope.toFixed(3)}</label>
            <Slider
              value={[params.beachSlope]}
              onValueChange={(value) => setParams(prev => ({ ...prev, beachSlope: value[0] }))}
              min={0.01}
              max={0.1}
              step={0.005}
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Grain Size: {params.grainSize.toFixed(1)}mm</label>
            <Slider
              value={[params.grainSize]}
              onValueChange={(value) => setParams(prev => ({ ...prev, grainSize: value[0] }))}
              min={0.1}
              max={2.0}
              step={0.1}
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Wave Height: {params.waveHeight.toFixed(1)}m</label>
            <Slider
              value={[params.waveHeight]}
              onValueChange={(value) => setParams(prev => ({ ...prev, waveHeight: value[0] }))}
              min={0.2}
              max={3.0}
              step={0.1}
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Wave Period: {params.wavePeriod.toFixed(1)}s</label>
            <Slider
              value={[params.wavePeriod]}
              onValueChange={(value) => setParams(prev => ({ ...prev, wavePeriod: value[0] }))}
              min={4}
              max={16}
              step={0.5}
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Sediment Supply: {params.sedimentSupply.toFixed(1)}x</label>
            <Slider
              value={[params.sedimentSupply]}
              onValueChange={(value) => setParams(prev => ({ ...prev, sedimentSupply: value[0] }))}
              min={0.1}
              max={2.0}
              step={0.1}
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Simulation Speed: {params.simulationSpeed.toFixed(1)}x</label>
            <Slider
              value={[params.simulationSpeed]}
              onValueChange={(value) => setParams(prev => ({ ...prev, simulationSpeed: value[0] }))}
              min={0.1}
              max={3.0}
              step={0.1}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
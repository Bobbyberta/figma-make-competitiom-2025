import React, { useState, useCallback } from 'react';
import { VectorFieldCanvas, Particle } from './components/VectorFieldCanvas';
import { ControlPanel } from './components/ControlPanel';

export default function App() {
  // Parameters with centered origin
  const [parameters, setParameters] = useState({
    xmin: -3,
    xmax: 3,
    ymin: -3,
    ymax: 3,
    xn: 10,
    yn: 10,
    v: 0.005,
    vh: 0.040,
    particleSpeed: 0.02
  });

  // Vector field equations - start with Wave Field preset
  const [vectorField, setVectorField] = useState({
    vx: 'sin(y)',
    vy: 'cos(x)'
  });

  const [particles, setParticles] = useState<Particle[]>([
    {
      id: 1,
      x: 0.5,
      y: 0,
      trail: [{ x: 0.5, y: 0 }]
    },
    {
      id: 2,
      x: 1,
      y: 0,
      trail: [{ x: 1, y: 0 }]
    },
    {
      id: 3,
      x: 1.5,
      y: 0,
      trail: [{ x: 1.5, y: 0 }]
    },
    {
      id: 4,
      x: 2,
      y: 0,
      trail: [{ x: 2, y: 0 }]
    },
    {
      id: 5,
      x: 2.5,
      y: 0,
      trail: [{ x: 2.5, y: 0 }]
    }
  ]);
  const [isPlaying, setIsPlaying] = useState(true);

  const handleParameterChange = useCallback((param: string, value: number) => {
    setParameters(prev => ({
      ...prev,
      [param]: value
    }));
  }, []);

  const handleEquationChange = useCallback((vx: string, vy: string) => {
    setVectorField({ vx, vy });
    // Clear particles when equations change to avoid confusion
    setParticles([]);
  }, []);

  const handleAddParticle = useCallback((particle: Particle) => {
    setParticles(prev => [...prev, particle]);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleClearParticles = useCallback(() => {
    setParticles([]);
  }, []);

  const handleRemoveParticle = useCallback((particleId: number) => {
    setParticles(prev => prev.filter(p => p.id !== particleId));
  }, []);

  const handleUpdateParticles = useCallback((updatedParticles: Particle[]) => {
    setParticles(updatedParticles);
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-background">
      {/* Page Title */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-border bg-card">
        <h1 className="text-xl font-semibold text-foreground">Vector Field Visualizer</h1>
        <p className="text-sm text-muted-foreground">Interactive mathematical vector field exploration with particle simulation</p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Main Canvas Area - First on mobile, second on desktop */}
        <div className="flex-1 order-1 lg:order-2 p-2 lg:p-4">
          <div className="h-full w-full min-h-[40vh] md:min-h-[30vh] lg:min-h-full">
            <VectorFieldCanvas
              {...parameters}
              vxEquation={vectorField.vx}
              vyEquation={vectorField.vy}
              particles={particles}
              isPlaying={isPlaying}
              onAddParticle={handleAddParticle}
              onRemoveParticle={handleRemoveParticle}
              onUpdateParticles={handleUpdateParticles}
            />
          </div>
        </div>

        {/* Control Panel - Second on mobile, first on desktop */}
        <div className="flex-shrink-0 order-2 lg:order-1 border-t lg:border-t-0 lg:border-r border-border bg-card h-[60vh] md:h-[70vh] lg:h-full lg:w-80 flex flex-col overflow-hidden touch-pan-y">
          <ControlPanel
            {...parameters}
            vxEquation={vectorField.vx}
            vyEquation={vectorField.vy}
            isPlaying={isPlaying}
            particleCount={particles.length}
            onParameterChange={handleParameterChange}
            onEquationChange={handleEquationChange}
            onPlayPause={handlePlayPause}
            onClearParticles={handleClearParticles}
          />
        </div>
      </div>
    </div>
  );
}
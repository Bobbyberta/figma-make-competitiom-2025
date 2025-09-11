import React, { useState, useEffect, useCallback } from 'react';
import { SimulationCanvas } from './components/SimulationCanvas';
import { ControlPanel } from './components/ControlPanel';
import { Bird } from './components/Bird';
import { Predator } from './components/Predator';
import { Tree } from './components/Tree';
import { SimulationParams, defaultParams } from './components/SimulationParams';
import { Button } from './components/ui/button';
import { Play, Pause } from 'lucide-react';

export default function App() {
  const [params, setParams] = useState<SimulationParams>(defaultParams);
  const [birds, setBirds] = useState<Bird[]>([]);
  const [predators, setPredators] = useState<Predator[]>([]);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize entities
  const initializeEntities = useCallback(() => {
    const canvasWidth = window.innerWidth - (isMobile ? 0 : 320);
    const canvasHeight = window.innerHeight;

    // Initialize birds
    const newBirds: Bird[] = [];
    for (let i = 0; i < params.birdCount; i++) {
      const x = Math.random() * canvasWidth;
      const y = Math.random() * canvasHeight;
      newBirds.push(new Bird(x, y));
    }

    // Initialize predators
    const newPredators: Predator[] = [];
    for (let i = 0; i < params.predatorCount; i++) {
      const x = Math.random() * canvasWidth;
      const y = Math.random() * canvasHeight;
      newPredators.push(new Predator(x, y));
    }

    // Initialize trees
    const newTrees: Tree[] = [];
    for (let i = 0; i < params.treeCount; i++) {
      const x = Math.random() * canvasWidth;
      const y = Math.random() * canvasHeight;
      newTrees.push(new Tree(x, y));
    }

    setBirds(newBirds);
    setPredators(newPredators);
    setTrees(newTrees);
  }, [params.birdCount, params.predatorCount, params.treeCount, isMobile]);

  // Update entity counts when parameters change
  useEffect(() => {
    const canvasWidth = window.innerWidth - (isMobile ? 0 : 320);
    const canvasHeight = window.innerHeight;

    // Adjust bird count
    const currentBirdCount = birds.length;
    if (currentBirdCount < params.birdCount) {
      const newBirds = [...birds];
      for (let i = currentBirdCount; i < params.birdCount; i++) {
        const x = Math.random() * canvasWidth;
        const y = Math.random() * canvasHeight;
        newBirds.push(new Bird(x, y));
      }
      setBirds(newBirds);
    } else if (currentBirdCount > params.birdCount) {
      setBirds(birds.slice(0, params.birdCount));
    }

    // Adjust predator count
    const currentPredatorCount = predators.length;
    if (currentPredatorCount < params.predatorCount) {
      const newPredators = [...predators];
      for (let i = currentPredatorCount; i < params.predatorCount; i++) {
        const x = Math.random() * canvasWidth;
        const y = Math.random() * canvasHeight;
        newPredators.push(new Predator(x, y));
      }
      setPredators(newPredators);
    } else if (currentPredatorCount > params.predatorCount) {
      setPredators(predators.slice(0, params.predatorCount));
    }

    // Adjust tree count
    const currentTreeCount = trees.length;
    if (currentTreeCount < params.treeCount) {
      const newTrees = [...trees];
      for (let i = currentTreeCount; i < params.treeCount; i++) {
        const x = Math.random() * canvasWidth;
        const y = Math.random() * canvasHeight;
        newTrees.push(new Tree(x, y));
      }
      setTrees(newTrees);
    } else if (currentTreeCount > params.treeCount) {
      setTrees(trees.slice(0, params.treeCount));
    }
  }, [params.birdCount, params.predatorCount, params.treeCount, birds, predators, trees, isMobile]);

  // Initialize on mount
  useEffect(() => {
    initializeEntities();
  }, []);

  const handleParamsChange = (newParams: SimulationParams) => {
    setParams(newParams);
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setParams(defaultParams);
    initializeEntities();
  };

  const handleRandomize = () => {
    const randomParams: SimulationParams = {
      // Flock Behavior
      birdCount: Math.floor(Math.random() * 300) + 50,
      maxSpeed: Math.random() * 5 + 1,
      maxForce: Math.random() * 0.3 + 0.05,
      visionRange: Math.random() * 100 + 30,
      birdSize: Math.random() * 6 + 2,

      // Separation
      separationDistance: Math.random() * 50 + 10,
      separationForce: Math.random() * 3 + 0.5,

      // Alignment
      alignmentDistance: Math.random() * 80 + 20,
      alignmentForce: Math.random() * 2 + 0.5,

      // Cohesion
      cohesionDistance: Math.random() * 80 + 20,
      cohesionForce: Math.random() * 2 + 0.5,

      // Predators
      predatorCount: Math.floor(Math.random() * 5),
      avoidanceDistance: Math.random() * 100 + 50,
      avoidanceForce: Math.random() * 5 + 1,
      predatorSpeed: Math.random() * 6 + 2,
      predatorSize: Math.random() * 15 + 8,
      huntRange: Math.random() * 150 + 75,
      wanderStrength: Math.random() * 2 + 0.2,
      captureDistance: Math.random() * 15 + 10,
      feedingTime: Math.random() * 5 + 2,

      // Trees
      treeCount: Math.floor(Math.random() * 8),
      attractionDistance: Math.random() * 150 + 75,
      attractionForce: Math.random() * 1 + 0.1,

      // Environment
      boundaryForce: Math.random() * 2 + 0.5,
      animationSpeed: Math.random() * 2 + 0.5,
      trailLength: Math.floor(Math.random() * 30),

      // Visual Debug
      showVisionRange: Math.random() > 0.8,
      showForces: Math.random() > 0.8,
      showStats: true,
    };

    setParams(randomParams);
  };

  const handleAddBird = (x: number, y: number) => {
    setBirds([...birds, new Bird(x, y)]);
  };

  const handleAddPredator = (x: number, y: number) => {
    setPredators([...predators, new Predator(x, y)]);
  };

  const handleAddTree = (x: number, y: number) => {
    setTrees([...trees, new Tree(x, y)]);
  };

  return (
    <div className="flex h-screen bg-background">
      {!isMobile && (
        <ControlPanel
          params={params}
          onParamsChange={handleParamsChange}
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          onReset={handleReset}
          onRandomize={handleRandomize}
          isMobile={isMobile}
        />
      )}
      
      <div className="flex-1 relative">
        <SimulationCanvas
          birds={birds}
          predators={predators}
          trees={trees}
          params={params}
          isPaused={isPaused}
          onAddBird={handleAddBird}
          onAddPredator={handleAddPredator}
          onAddTree={handleAddTree}
          setBirds={setBirds}
          isMobile={isMobile}
        />
        
        {/* Mobile play/pause button */}
        {isMobile && (
          <Button
            size="lg"
            onClick={handleTogglePause}
            className="fixed bottom-4 left-4 z-50 rounded-full h-14 w-14 shadow-lg"
          >
            {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
          </Button>
        )}
        
        {/* Mobile control panel */}
        {isMobile && (
          <ControlPanel
            params={params}
            onParamsChange={handleParamsChange}
            isPaused={isPaused}
            onTogglePause={handleTogglePause}
            onReset={handleReset}
            onRandomize={handleRandomize}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
}
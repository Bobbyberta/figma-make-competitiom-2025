import { useState, useEffect, useRef, useCallback } from 'react';
import { TerrainCell, TerrainType, PrecipitationField, SimulationState } from '../types/terrain';

const GRID_SIZE = 10;
const UPDATE_INTERVAL = 100; // milliseconds

const createInitialGrid = (): TerrainCell[][] => {
  const grid: TerrainCell[][] = [];
  
  for (let row = 0; row < GRID_SIZE; row++) {
    grid[row] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      // Create a varied landscape
      let type = TerrainType.LAND;
      
      // Coastline (edges)
      if (row === 0 || row === GRID_SIZE - 1 || col === 0 || col === GRID_SIZE - 1) {
        type = Math.random() > 0.7 ? TerrainType.SEA : TerrainType.LAND;
      }
      // Mountains in center-top
      else if (row < 4 && col > 3 && col < 7) {
        type = Math.random() > 0.4 ? TerrainType.MOUNTAIN : TerrainType.LAND;
      }
      // Forest patches
      else if (Math.random() > 0.8) {
        type = TerrainType.FOREST;
      }
      // Desert patches
      else if (Math.random() > 0.9) {
        type = TerrainType.DESERT;
      }

      grid[row][col] = {
        type,
        elevation: type === TerrainType.MOUNTAIN ? Math.random() * 0.8 + 0.2 : Math.random() * 0.3,
        rainIntensity: 0,
        humidity: 0.5,
        precipitationDensity: 0,
        pressure: 1013.25 + (Math.random() - 0.5) * 20 // Base atmospheric pressure with variation
      };
    }
  }
  
  return grid;
};

const createInitialPrecipitationField = (): PrecipitationField => {
  const density: number[][] = [];
  const windVelocityX: number[][] = [];
  const windVelocityY: number[][] = [];
  const moistureField: number[][] = [];
  const pressureField: number[][] = [];
  
  for (let row = 0; row < GRID_SIZE; row++) {
    density[row] = [];
    windVelocityX[row] = [];
    windVelocityY[row] = [];
    moistureField[row] = [];
    pressureField[row] = [];
    
    for (let col = 0; col < GRID_SIZE; col++) {
      // Create initial weather patterns
      const centerX = GRID_SIZE / 2;
      const centerY = GRID_SIZE / 2;
      const distanceFromCenter = Math.sqrt((col - centerX) ** 2 + (row - centerY) ** 2);
      
      // Create a weather front moving across the map
      const waveX = Math.sin((col / GRID_SIZE) * Math.PI * 2) * 0.3;
      const waveY = Math.cos((row / GRID_SIZE) * Math.PI * 2) * 0.3;
      
      density[row][col] = Math.max(0, (waveX + waveY + Math.random() * 0.3) * 0.5);
      windVelocityX[row][col] = (Math.random() - 0.5) * 0.4;
      windVelocityY[row][col] = (Math.random() - 0.5) * 0.4;
      moistureField[row][col] = 0.3 + Math.random() * 0.4;
      pressureField[row][col] = 1013 + (Math.random() - 0.5) * 30;
    }
  }
  
  return {
    density,
    windVelocityX,
    windVelocityY,
    moistureField,
    pressureField
  };
};

export const useWeatherSimulation = () => {
  const [simulationState, setSimulationState] = useState<SimulationState>({
    isRunning: false,
    speed: 1,
    time: 0,
    grid: createInitialGrid(),
    precipitationField: createInitialPrecipitationField()
  });

  const [weatherSettings, setWeatherSettings] = useState({
    windStrength: 0.5,
    humidity: 0.6,
    temperature: 20,
    cloudDensity: 0.4
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateSimulation = useCallback(() => {
    setSimulationState(prev => {
      const newState = { ...prev };
      newState.time += simulationState.speed;

      // Create new precipitation field
      const newPrecipField = {
        density: prev.precipitationField.density.map(row => [...row]),
        windVelocityX: prev.precipitationField.windVelocityX.map(row => [...row]),
        windVelocityY: prev.precipitationField.windVelocityY.map(row => [...row]),
        moistureField: prev.precipitationField.moistureField.map(row => [...row]),
        pressureField: prev.precipitationField.pressureField.map(row => [...row])
      };

      // Update precipitation field using fluid dynamics principles
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          const terrain = prev.grid[row][col];
          
          // Add weather pattern movement (simulate weather fronts)
          const timeOffset = newState.time * 0.01;
          const wavePattern = Math.sin((col + timeOffset) / 2) * Math.cos((row + timeOffset) / 3) * 0.3;
          
          // Base precipitation from atmospheric patterns
          let newDensity = prev.precipitationField.density[row][col];
          
          // Add some natural variation and movement
          newDensity += wavePattern * weatherSettings.cloudDensity;
          
          // Wind advection - move precipitation based on wind
          const windX = prev.precipitationField.windVelocityX[row][col] * weatherSettings.windStrength;
          const windY = prev.precipitationField.windVelocityY[row][col] * weatherSettings.windStrength;
          
          // Simple advection - sample from neighboring cells based on wind direction
          const sourceCol = Math.max(0, Math.min(GRID_SIZE - 1, Math.round(col - windX * 2)));
          const sourceRow = Math.max(0, Math.min(GRID_SIZE - 1, Math.round(row - windY * 2)));
          
          if (sourceCol !== col || sourceRow !== row) {
            newDensity = newDensity * 0.7 + prev.precipitationField.density[sourceRow][sourceCol] * 0.3;
          }

          // Terrain effects on precipitation
          if (terrain.type === TerrainType.MOUNTAIN) {
            // Orographic lift - mountains force air upward, creating precipitation
            newDensity += 0.1 * terrain.elevation;
            newPrecipField.windVelocityY[row][col] -= 0.02; // Updraft
          } else if (terrain.type === TerrainType.SEA) {
            // Oceans add moisture to the air
            newPrecipField.moistureField[row][col] = Math.min(1, newPrecipField.moistureField[row][col] + 0.05);
            newDensity += 0.02 * weatherSettings.humidity;
          } else if (terrain.type === TerrainType.DESERT) {
            // Deserts reduce moisture and precipitation
            newPrecipField.moistureField[row][col] = Math.max(0, newPrecipField.moistureField[row][col] - 0.03);
            newDensity *= 0.7;
          } else if (terrain.type === TerrainType.FOREST) {
            // Forests add some moisture through evapotranspiration
            newPrecipField.moistureField[row][col] = Math.min(1, newPrecipField.moistureField[row][col] + 0.02);
            newDensity *= 1.1;
          }

          // Temperature effects
          const tempEffect = Math.max(0.1, (weatherSettings.temperature + 10) / 50);
          newDensity *= tempEffect * weatherSettings.humidity;

          // Apply diffusion (smoothing) to prevent sharp edges
          if (row > 0 && row < GRID_SIZE - 1 && col > 0 && col < GRID_SIZE - 1) {
            const neighbors = [
              prev.precipitationField.density[row - 1][col],
              prev.precipitationField.density[row + 1][col],
              prev.precipitationField.density[row][col - 1],
              prev.precipitationField.density[row][col + 1]
            ];
            const avgNeighbor = neighbors.reduce((sum, val) => sum + val, 0) / neighbors.length;
            newDensity = newDensity * 0.9 + avgNeighbor * 0.1;
          }

          // Clamp values
          newPrecipField.density[row][col] = Math.max(0, Math.min(1, newDensity));
          
          // Update wind patterns (add some randomness and terrain effects)
          const windChange = (Math.random() - 0.5) * 0.02;
          newPrecipField.windVelocityX[row][col] = Math.max(-0.5, Math.min(0.5, 
            prev.precipitationField.windVelocityX[row][col] + windChange
          ));
          newPrecipField.windVelocityY[row][col] = Math.max(-0.5, Math.min(0.5, 
            prev.precipitationField.windVelocityY[row][col] + windChange
          ));
        }
      }

      newState.precipitationField = newPrecipField;

      // Update grid based on precipitation field
      newState.grid = newState.grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          let newCell = { ...cell };
          
          // Set precipitation density from the field
          newCell.precipitationDensity = newPrecipField.density[rowIndex][colIndex];
          newCell.rainIntensity = newCell.precipitationDensity;
          
          // Update humidity based on precipitation and evaporation
          if (newCell.rainIntensity > 0.2) {
            newCell.humidity = Math.min(newCell.humidity + 0.05, 1);
          } else {
            newCell.humidity = Math.max(newCell.humidity - 0.01, 0.1);
          }

          return newCell;
        })
      );

      return newState;
    });
  }, [simulationState.speed, weatherSettings]);

  useEffect(() => {
    if (simulationState.isRunning) {
      intervalRef.current = setInterval(updateSimulation, UPDATE_INTERVAL);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [simulationState.isRunning, updateSimulation]);

  const toggleSimulation = useCallback(() => {
    setSimulationState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  }, []);

  const setSpeed = useCallback((speed: number) => {
    setSimulationState(prev => ({ ...prev, speed }));
  }, []);

  const resetSimulation = useCallback(() => {
    setSimulationState({
      isRunning: false,
      speed: 1,
      time: 0,
      grid: createInitialGrid(),
      precipitationField: createInitialPrecipitationField()
    });
  }, []);

  const updateTerrainCell = useCallback((row: number, col: number, terrainType: TerrainType) => {
    setSimulationState(prev => ({
      ...prev,
      grid: prev.grid.map((r, rIndex) =>
        r.map((cell, cIndex) => {
          if (rIndex === row && cIndex === col) {
            return {
              ...cell,
              type: terrainType,
              elevation: terrainType === TerrainType.MOUNTAIN ? Math.random() * 0.8 + 0.2 : Math.random() * 0.3,
              pressure: terrainType === TerrainType.MOUNTAIN ? cell.pressure - 50 : cell.pressure
            };
          }
          return cell;
        })
      )
    }));
  }, []);

  const updateWeatherSettings = useCallback((newSettings: Partial<typeof weatherSettings>) => {
    setWeatherSettings(prev => ({ ...prev, ...newSettings }));
    
    // Cloud density affects the overall precipitation intensity
    if (newSettings.cloudDensity !== undefined) {
      setSimulationState(prev => {
        const newPrecipField = {
          ...prev.precipitationField,
          density: prev.precipitationField.density.map(row =>
            row.map(density => density * (0.5 + newSettings.cloudDensity! * 0.5))
          )
        };

        return { ...prev, precipitationField: newPrecipField };
      });
    }
  }, []);

  return {
    simulationState,
    weatherSettings,
    toggleSimulation,
    setSpeed,
    resetSimulation,
    updateTerrainCell,
    updateWeatherSettings
  };
};
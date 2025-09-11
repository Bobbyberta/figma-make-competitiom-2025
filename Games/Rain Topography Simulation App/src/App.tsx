import React, { useState } from 'react';
import { TerrainGrid } from './components/TerrainGrid';
import { ControlPanel } from './components/ControlPanel';
import { useWeatherSimulation } from './hooks/useWeatherSimulation';
import { TerrainType } from './types/terrain';

export default function App() {
  const {
    simulationState,
    weatherSettings,
    toggleSimulation,
    setSpeed,
    resetSimulation,
    updateTerrainCell,
    updateWeatherSettings
  } = useWeatherSimulation();

  const [selectedTerrainType, setSelectedTerrainType] = useState<TerrainType>(TerrainType.LAND);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);

  const handleCellClick = (row: number, col: number) => {
    updateTerrainCell(row, col, selectedTerrainType);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-white mb-2">Rain Topography Desktop Simulation</h1>
          <p className="text-gray-400">
            Interactive weather simulation showing rain patterns across different terrain types
          </p>
        </div>

        {/* Main Content */}
        <div className="flex gap-6 justify-center items-start">
          {/* Simulation Grid */}
          <div className="flex-shrink-0">
            <TerrainGrid
              grid={simulationState.grid}
              precipitationField={simulationState.precipitationField}
              onCellClick={handleCellClick}
              selectedTerrainType={selectedTerrainType}
            />
            
            {/* Instructions */}
            <div className="mt-4 p-4 bg-gray-800 rounded-lg text-gray-300 text-sm max-w-[500px]">
              <h3 className="text-white mb-2">Instructions:</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Click on grid cells to change terrain type</li>
                <li>Use the control panel to adjust weather parameters</li>
                <li>Watch how precipitation density varies across terrain</li>
                <li>Mountains create orographic lift, increasing precipitation</li>
                <li>Sea areas add moisture to the atmosphere</li>
                <li>Desert areas reduce moisture and precipitation intensity</li>
                <li>Wind arrows show atmospheric flow patterns</li>
              </ul>
            </div>
          </div>

          {/* Control Panel */}
          <div className="flex-shrink-0">
            <ControlPanel
              isRunning={simulationState.isRunning}
              speed={simulationState.speed}
              time={simulationState.time}
              selectedTerrainType={selectedTerrainType}
              windStrength={weatherSettings.windStrength}
              humidity={weatherSettings.humidity}
              temperature={weatherSettings.temperature}
              cloudDensity={weatherSettings.cloudDensity}
              isExpanded={isPanelExpanded}
              onToggleSimulation={toggleSimulation}
              onSpeedChange={setSpeed}
              onReset={resetSimulation}
              onTerrainTypeChange={setSelectedTerrainType}
              onWindStrengthChange={(strength) => updateWeatherSettings({ windStrength: strength })}
              onHumidityChange={(humidity) => updateWeatherSettings({ humidity })}
              onTemperatureChange={(temperature) => updateWeatherSettings({ temperature })}
              onCloudDensityChange={(density) => updateWeatherSettings({ cloudDensity: density })}
              onToggleExpanded={() => setIsPanelExpanded(!isPanelExpanded)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
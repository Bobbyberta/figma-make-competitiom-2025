import React from 'react';
import { TerrainCell, TerrainType, PrecipitationField } from '../types/terrain';

interface TerrainGridProps {
  grid: TerrainCell[][];
  precipitationField: PrecipitationField;
  onCellClick: (row: number, col: number) => void;
  selectedTerrainType: TerrainType;
}

const getTerrainColor = (cell: TerrainCell): string => {
  const baseColors = {
    [TerrainType.SEA]: 'bg-blue-500',
    [TerrainType.LAND]: 'bg-green-400',
    [TerrainType.MOUNTAIN]: 'bg-gray-600',
    [TerrainType.FOREST]: 'bg-green-700',
    [TerrainType.DESERT]: 'bg-yellow-400'
  };

  return baseColors[cell.type];
};

const getPrecipitationColor = (density: number): string => {
  if (density < 0.1) return 'transparent';
  if (density < 0.3) return 'rgba(147, 197, 253, 0.3)'; // Light blue
  if (density < 0.5) return 'rgba(59, 130, 246, 0.5)';  // Blue
  if (density < 0.7) return 'rgba(37, 99, 235, 0.7)';   // Darker blue
  if (density < 0.9) return 'rgba(29, 78, 216, 0.8)';   // Deep blue
  return 'rgba(239, 68, 68, 0.9)'; // Red for very heavy precipitation
};

const getWindArrowRotation = (velocityX: number, velocityY: number): number => {
  return Math.atan2(velocityY, velocityX) * (180 / Math.PI);
};

const getWindStrength = (velocityX: number, velocityY: number): number => {
  return Math.sqrt(velocityX * velocityX + velocityY * velocityY);
};

export const TerrainGrid: React.FC<TerrainGridProps> = ({ 
  grid, 
  precipitationField, 
  onCellClick, 
  selectedTerrainType 
}) => {
  return (
    <div className="relative bg-gray-900 p-4 rounded-lg border">
      {/* Grid */}
      <div className="grid grid-cols-10 gap-1 w-[500px] h-[500px]">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                relative cursor-pointer transition-all duration-200 rounded-sm
                ${getTerrainColor(cell)}
                hover:brightness-110 hover:scale-105
              `}
              onClick={() => onCellClick(rowIndex, colIndex)}
              style={{
                filter: `brightness(${1 - cell.elevation * 0.3})`
              }}
            >
              {/* Precipitation overlay */}
              <div
                className="absolute inset-0 rounded-sm transition-all duration-300"
                style={{
                  backgroundColor: getPrecipitationColor(precipitationField.density[rowIndex][colIndex])
                }}
              />
              
              {/* Rain animation lines for heavy precipitation */}
              {precipitationField.density[rowIndex][colIndex] > 0.4 && (
                <div className="absolute inset-0 overflow-hidden rounded-sm">
                  {Array.from({ length: Math.floor(precipitationField.density[rowIndex][colIndex] * 5) }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-0.5 bg-white opacity-60 animate-pulse"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 50}%`,
                        height: `${20 + precipitationField.density[rowIndex][colIndex] * 20}%`,
                        animationDelay: `${Math.random() * 1000}ms`,
                        animationDuration: '800ms'
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Wind direction indicators for areas with wind */}
              {getWindStrength(precipitationField.windVelocityX[rowIndex][colIndex], precipitationField.windVelocityY[rowIndex][colIndex]) > 0.1 && (
                <div 
                  className="absolute inset-0 flex items-center justify-center opacity-40"
                  style={{
                    transform: `rotate(${getWindArrowRotation(precipitationField.windVelocityX[rowIndex][colIndex], precipitationField.windVelocityY[rowIndex][colIndex])}deg)`
                  }}
                >
                  <div className="w-3 h-0.5 bg-white relative">
                    <div className="absolute right-0 top-0 w-0 h-0 border-l-2 border-l-white border-t border-b border-transparent"></div>
                  </div>
                </div>
              )}
              
              {/* Terrain elevation indicator */}
              {cell.type === TerrainType.MOUNTAIN && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full opacity-60" />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Precipitation intensity scale */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white p-2 rounded text-xs">
        <div className="text-white mb-2">Precipitation</div>
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-2 rounded" style={{ backgroundColor: 'rgba(147, 197, 253, 0.5)' }}></div>
            <span>Light</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-2 bg-blue-500 rounded"></div>
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-2 bg-blue-700 rounded"></div>
            <span>Heavy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-2 bg-red-500 rounded"></div>
            <span>Extreme</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white p-2 rounded text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Sea</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <span>Land</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-600 rounded"></div>
            <span>Mountain</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-700 rounded"></div>
            <span>Forest</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded"></div>
            <span>Desert</span>
          </div>
        </div>
      </div>
    </div>
  );
};
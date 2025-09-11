import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { calculateSimulationStats, type GridPoint } from './BeachSimulation';

interface SimulationStatsProps {
  grid: GridPoint[];
  time: number;
}

export const SimulationStats: React.FC<SimulationStatsProps> = ({ grid, time }) => {
  const stats = calculateSimulationStats(grid);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-time Morphodynamic Changes</CardTitle>
        <p className="text-sm text-muted-foreground">
          Live tracking of sediment erosion, deposition, and transport activity
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full opacity-70"></div>
              <span className="text-sm font-medium">Total Erosion</span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {stats.totalErosion.toFixed(3)}m
            </div>
            <div className="text-xs text-muted-foreground">
              Sediment removed
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full opacity-70"></div>
              <span className="text-sm font-medium">Total Deposition</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalDeposition.toFixed(3)}m
            </div>
            <div className="text-xs text-muted-foreground">
              Sediment added
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">Max Change</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.maxChange.toFixed(3)}m
            </div>
            <div className="text-xs text-muted-foreground">
              Largest local change
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-sm font-medium">Active Transport</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.activeTransportPoints}
            </div>
            <div className="text-xs text-muted-foreground">
              Grid points moving sediment
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Simulation Time:</span>
            <span className="font-medium">{(time / 3600).toFixed(2)} hours</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">Net Change:</span>
            <span className={`font-medium ${(stats.totalDeposition - stats.totalErosion) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(stats.totalDeposition - stats.totalErosion >= 0 ? '+' : '')}{(stats.totalDeposition - stats.totalErosion).toFixed(3)}m
            </span>
          </div>
        </div>

        {stats.maxChange === 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              No sediment movement detected. Try the <strong>🌊 High Transport</strong> preset for guaranteed activity.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
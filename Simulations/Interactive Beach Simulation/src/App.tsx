import React, { useState, useCallback } from 'react';
import { BeachSimulation, type GridPoint } from './components/BeachSimulation';
import { SimulationLegend } from './components/SimulationLegend';
import { SimulationStats } from './components/SimulationStats';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

export default function App() {
  const [currentGrid, setCurrentGrid] = useState<GridPoint[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const handleGridUpdate = useCallback((grid: GridPoint[], time: number) => {
    setCurrentGrid(grid);
    setCurrentTime(time);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Beach Erosion Simulation</h1>
          <p className="text-gray-600 mt-2">
            Interactive 2D visualization of tidal and wave effects on beach morphodynamics
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Simulation Area */}
          <div className="xl:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Beach Profile Evolution</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Watch how tides and waves reshape the beach through erosion and sediment deposition
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <BeachSimulation onGridUpdate={handleGridUpdate} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Statistics Panel */}
        <div className="mt-6">
          <SimulationStats grid={currentGrid} time={currentTime} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mt-6">
          {/* Information Panel */}
          <div className="xl:col-span-4 lg:col-span-2 space-y-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SimulationLegend />
            
            <Card>
              <CardHeader>
                <CardTitle>About the Simulation</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  This simulation implements simplified versions of the shallow-water equations and sediment transport models to demonstrate coastal morphodynamics.
                </p>
                <div>
                  <h4 className="text-foreground mb-1">Key Features:</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>1D shallow-water hydrodynamics</li>
                    <li>Meyer-Peter Müller sediment transport</li>
                    <li>Exner equation for bed evolution</li>
                    <li>Combined tidal and wave forcing</li>
                    <li>Real-time parameter adjustment</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-foreground mb-1">Educational Purpose:</h4>
                  <p className="text-xs">
                    Demonstrates the complex interactions between water motion and sediment transport that shape our coastlines over time.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <div className="text-xs space-y-2">
                  <p>• Click <strong>🌊 High Transport</strong> for guaranteed sediment movement</p>
                  <p>• Increase tidal range to see stronger erosion/deposition</p>
                  <p>• Adjust grain size to change transport sensitivity</p>
                  <p>• Steeper slopes lead to more dramatic changes</p>
                  <p>• Higher waves increase sediment mobility</p>
                  <p>• Lower sediment supply creates limited beach material</p>
                  <p>• Use simulation speed to observe long-term evolution</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
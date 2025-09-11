import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const SimulationLegend: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Legend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-3 bg-[#654321] border border-gray-300"></div>
              <span>Bedrock (immobile)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-3 bg-[#D2B48C] border border-gray-300"></div>
              <span>Sediment layer (mobile)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-1 bg-[#F4A460] border-2 border-[#F4A460]"></div>
              <span>Current beach profile</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-1 border-2 border-[#F4A460] bg-transparent" style={{borderStyle: 'dashed'}}></div>
              <span>Initial beach profile</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-1 bg-[#0066CC] border-2 border-[#0066CC]"></div>
              <span>Water surface</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-3 bg-[rgba(0,102,204,0.3)] border border-[#0066CC]"></div>
              <span>Water column</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <div className="w-4 h-0.5 bg-red-500"></div>
                <div className="w-0 h-0 border-l-2 border-l-red-500 border-t border-t-transparent border-b border-b-transparent"></div>
              </div>
              <span>Velocity vectors</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-4 h-0.5 bg-yellow-400"></div>
              </div>
              <span>Sediment transport</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full opacity-70"></div>
              <span>Erosion areas</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full opacity-70"></div>
              <span>Deposition areas</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-3 bg-[#87CEEB] border border-gray-300"></div>
              <span>Sky/atmosphere</span>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <h4 className="mb-2">Physical Processes</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• <strong>Tides:</strong> Long-period water level changes</p>
            <p>• <strong>Waves:</strong> Short-period oscillations</p>
            <p>• <strong>Sediment Transport:</strong> Movement of sand particles</p>
            <p>• <strong>Erosion/Deposition:</strong> Gradual beach profile changes</p>
            <p>• <strong>Sediment Supply:</strong> Controls available material for transport</p>
            <p>• <strong>Bedrock Limit:</strong> Erosion stops when sediment is depleted</p>
            <p>• <strong>High Transport Mode:</strong> Amplified effects for educational visibility</p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="mb-2">Observation Tips</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Use <strong>🌊 High Transport</strong> preset for guaranteed sediment movement</p>
            <p>• Check the statistics panel below for real-time erosion/deposition totals</p>
            <p>• Red dots show erosion locations, green dots show deposition</p>
            <p>• Dashed line shows initial profile vs solid current profile</p>
            <p>• Yellow dots and lines indicate active sediment transport</p>
            <p>• Brighter indicators = more intense transport activity</p>
            <p>• Focus on the beach face area (300-600m) for visible changes</p>
            <p>• Red velocity arrows show water movement direction</p>
            <p>• Hover for detailed data including cumulative changes</p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="mb-2">Hover Information</h4>
          <div className="text-xs text-muted-foreground">
            <p>Hover over the simulation to see detailed values at each point including water depth, velocity, bed elevation, sediment thickness, bedrock level, and transport rate.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
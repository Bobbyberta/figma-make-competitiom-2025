import React from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { TerrainType } from '../types/terrain';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp,
  Cloud,
  Thermometer,
  Wind,
  Droplets
} from 'lucide-react';

interface ControlPanelProps {
  isRunning: boolean;
  speed: number;
  time: number;
  selectedTerrainType: TerrainType;
  windStrength: number;
  humidity: number;
  temperature: number;
  cloudDensity: number;
  isExpanded: boolean;
  onToggleSimulation: () => void;
  onSpeedChange: (speed: number) => void;
  onReset: () => void;
  onTerrainTypeChange: (type: TerrainType) => void;
  onWindStrengthChange: (strength: number) => void;
  onHumidityChange: (humidity: number) => void;
  onTemperatureChange: (temperature: number) => void;
  onCloudDensityChange: (density: number) => void;
  onToggleExpanded: () => void;
}

const formatTime = (time: number): string => {
  const hours = Math.floor(time / 3600) % 24;
  const minutes = Math.floor((time % 3600) / 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isRunning,
  speed,
  time,
  selectedTerrainType,
  windStrength,
  humidity,
  temperature,
  cloudDensity,
  isExpanded,
  onToggleSimulation,
  onSpeedChange,
  onReset,
  onTerrainTypeChange,
  onWindStrengthChange,
  onHumidityChange,
  onTemperatureChange,
  onCloudDensityChange,
  onToggleExpanded
}) => {
  const speedOptions = [
    { value: 0.5, label: '0.5x' },
    { value: 1, label: '1x' },
    { value: 2, label: '2x' },
    { value: 4, label: '4x' },
    { value: 8, label: '8x' }
  ];

  return (
    <Card className="w-80 bg-gray-800 text-white border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Weather Control
          </CardTitle>
          <Badge variant="outline" className="bg-gray-700">
            {formatTime(time)}
          </Badge>
        </div>
        
        {/* Main Controls */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            onClick={onToggleSimulation}
            variant={isRunning ? "destructive" : "default"}
            size="sm"
            className="flex-1"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Play
              </>
            )}
          </Button>
          
          <Button onClick={onReset} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Speed Control */}
        <div className="space-y-2 pt-3">
          <label className="text-sm text-gray-300">Simulation Speed</label>
          <div className="flex items-center gap-2">
            <Slider
              value={[speed]}
              onValueChange={(value) => onSpeedChange(value[0])}
              min={0.5}
              max={8}
              step={0.5}
              className="flex-1"
            />
            <Badge variant="secondary" className="w-12 text-center">
              {speed}x
            </Badge>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={isExpanded} onOpenChange={onToggleExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4">
            <span>Advanced Settings</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <ScrollArea className="h-80">
              <div className="space-y-4">
                
                {/* Terrain Brush */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Terrain Brush</label>
                  <Select value={selectedTerrainType} onValueChange={onTerrainTypeChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TerrainType.SEA}>🌊 Sea</SelectItem>
                      <SelectItem value={TerrainType.LAND}>🟢 Land</SelectItem>
                      <SelectItem value={TerrainType.MOUNTAIN}>⛰️ Mountain</SelectItem>
                      <SelectItem value={TerrainType.FOREST}>🌲 Forest</SelectItem>
                      <SelectItem value={TerrainType.DESERT}>🏜️ Desert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="bg-gray-700" />

                {/* Wind Strength */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4" />
                    <label className="text-sm text-gray-300">Wind Strength</label>
                    <Badge variant="outline" className="ml-auto">
                      {Math.round(windStrength * 100)}%
                    </Badge>
                  </div>
                  <Slider
                    value={[windStrength]}
                    onValueChange={(value) => onWindStrengthChange(value[0])}
                    min={0}
                    max={1}
                    step={0.1}
                  />
                </div>

                {/* Humidity */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4" />
                    <label className="text-sm text-gray-300">Humidity</label>
                    <Badge variant="outline" className="ml-auto">
                      {Math.round(humidity * 100)}%
                    </Badge>
                  </div>
                  <Slider
                    value={[humidity]}
                    onValueChange={(value) => onHumidityChange(value[0])}
                    min={0}
                    max={1}
                    step={0.1}
                  />
                </div>

                {/* Temperature */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4" />
                    <label className="text-sm text-gray-300">Temperature</label>
                    <Badge variant="outline" className="ml-auto">
                      {Math.round(temperature)}°C
                    </Badge>
                  </div>
                  <Slider
                    value={[temperature]}
                    onValueChange={(value) => onTemperatureChange(value[0])}
                    min={-10}
                    max={40}
                    step={1}
                  />
                </div>

                {/* Cloud Density */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4" />
                    <label className="text-sm text-gray-300">Cloud Density</label>
                    <Badge variant="outline" className="ml-auto">
                      {Math.round(cloudDensity * 100)}%
                    </Badge>
                  </div>
                  <Slider
                    value={[cloudDensity]}
                    onValueChange={(value) => onCloudDensityChange(value[0])}
                    min={0}
                    max={1}
                    step={0.1}
                  />
                </div>

                <Separator className="bg-gray-700" />

                {/* Simulation Info */}
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Current Time:</span>
                    <span>{formatTime(time)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Grid Size:</span>
                    <span>10 × 10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant={isRunning ? "default" : "secondary"} className="text-xs">
                      {isRunning ? "Running" : "Paused"}
                    </Badge>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
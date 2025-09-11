import React from 'react';
import { FractalConfig } from './types/FractalTypes';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ZoomIn, ZoomOut, RotateCcw, Settings, Play, Pause } from 'lucide-react';

interface MobileControlsProps {
  config: FractalConfig;
  onConfigChange: (config: Partial<FractalConfig>) => void;
  onReset: () => void;
  onToggleSettings: () => void;
  className?: string;
}

export function MobileControls({ 
  config, 
  onConfigChange, 
  onReset, 
  onToggleSettings,
  className = '' 
}: MobileControlsProps) {
  const handleZoomIn = () => {
    onConfigChange({ zoom: config.zoom * 1.5 });
  };

  const handleZoomOut = () => {
    onConfigChange({ zoom: config.zoom / 1.5 });
  };

  const toggleAnimation = () => {
    if (!config.animate) {
      // Start animation
      onConfigChange({ animate: true, animationPaused: false });
    } else if (config.animationPaused) {
      // Resume animation
      onConfigChange({ animationPaused: false });
    } else {
      // Pause animation
      onConfigChange({ animationPaused: true });
    }
  };

  return (
    <Card className={`${className} p-2`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={toggleAnimation}>
            {config.animate && !config.animationPaused ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onToggleSettings}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
import React from 'react';
import { FractalConfig } from './types/FractalTypes';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface InfoPanelProps {
  config: FractalConfig;
  className?: string;
}

export function InfoPanel({ config, className = '' }: InfoPanelProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          Fractal Info
          <Badge variant={config.fractalType === 'mandelbrot' ? 'default' : 'secondary'}>
            {config.fractalType === 'mandelbrot' ? 'Mandelbrot' : 'Julia'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Position:</span>
            <span className="text-sm font-mono">
              ({config.centerX.toFixed(4)}, {config.centerY.toFixed(4)})
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Zoom:</span>
            <span className="text-sm font-mono">{config.zoom.toFixed(2)}x</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Iterations:</span>
            <span className="text-sm font-mono">{config.maxIterations}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Palette:</span>
            <span className="text-sm capitalize">{config.colorPalette}</span>
          </div>
          
          {config.fractalType === 'julia' && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Julia C:</span>
              <span className="text-sm font-mono">
                {config.juliaC.real.toFixed(3)} + {config.juliaC.imaginary.toFixed(3)}i
              </span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Animation:</span>
            <span className="text-sm">
              {config.animate ? `${config.animationSpeed}x` : 'Off'}
            </span>
          </div>
        </div>
        
        <div className="pt-2 text-xs text-muted-foreground">
          <p>
            {config.fractalType === 'mandelbrot' 
              ? 'The Mandelbrot set is the set of complex numbers c for which the function f(z) = z² + c does not diverge.'
              : 'Julia sets are fractals that are defined by the recurrence relation z_(n+1) = z_n² + c for a fixed complex number c.'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
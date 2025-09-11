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
            {config.fractalType === 'mandelbrot' ? 'Mandelbrot' : 
             config.fractalType === 'julia' ? 'Julia' :
             config.fractalType === 'burning-ship' ? 'Burning Ship' :
             config.fractalType === 'newton' ? 'Newton' :
             config.fractalType === 'tricorn' ? 'Tricorn' :
             config.fractalType === 'phoenix' ? 'Phoenix' : 'Unknown'}
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
            <span className="text-sm font-mono">
              {config.maxIterations}
              {config.animate && (
                <span className="text-xs text-muted-foreground ml-1">
                  ({config.animationMinIterations}-{config.animationMaxIterations})
                </span>
              )}
            </span>
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
          
          {config.fractalType === 'newton' && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Root Order:</span>
              <span className="text-sm font-mono">{config.newtonRoot}</span>
            </div>
          )}
          
          {config.fractalType === 'phoenix' && (
            <>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Phoenix C:</span>
                <span className="text-sm font-mono">
                  {config.phoenixC.real.toFixed(3)} + {config.phoenixC.imaginary.toFixed(3)}i
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Phoenix P:</span>
                <span className="text-sm font-mono">
                  {config.phoenixP.real.toFixed(3)} + {config.phoenixP.imaginary.toFixed(3)}i
                </span>
              </div>
            </>
          )}
          
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Animation:</span>
            <span className="text-sm">
              {config.animate ? (
                config.animationPaused ? 'Paused' : `${config.animationSpeed.toFixed(1)}x Speed`
              ) : 'Off'}
            </span>
          </div>
        </div>
        
        <div className="pt-2 text-xs text-muted-foreground">
          <p>
            {config.fractalType === 'mandelbrot' 
              ? 'The Mandelbrot set is the set of complex numbers c for which the function f(z) = z² + c does not diverge.'
              : config.fractalType === 'julia'
              ? 'Julia sets are fractals that are defined by the recurrence relation z_(n+1) = z_n² + c for a fixed complex number c.'
              : config.fractalType === 'burning-ship'
              ? 'The Burning Ship fractal uses z_(n+1) = (|Re(z_n)| + i|Im(z_n)|)² + c, creating ship-like structures.'
              : config.fractalType === 'newton'
              ? 'Newton fractals show the basins of attraction for Newton\'s method applied to finding roots of z^n - 1 = 0.'
              : config.fractalType === 'tricorn'
              ? 'The Tricorn fractal uses z_(n+1) = z̄_n² + c, where z̄ is the complex conjugate, creating three-fold symmetry.'
              : config.fractalType === 'phoenix'
              ? 'The Phoenix fractal uses z_(n+1) = z_n² + c + p·z_(n-1), involving the previous iteration value.'
              : 'Unknown fractal type.'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
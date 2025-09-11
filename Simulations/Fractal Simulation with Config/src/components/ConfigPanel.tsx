import React from 'react';
import { FractalConfig, FractalVariation, FractalType, FRACTAL_VARIATIONS } from './types/FractalTypes';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { RotateCcw, Play, Pause, ChevronDown } from 'lucide-react';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface ConfigPanelProps {
  config: FractalConfig;
  onConfigChange: (config: Partial<FractalConfig>) => void;
  onVariationLoad: (variation: FractalVariation) => void;
  onReset: () => void;
  className?: string;
}

export function ConfigPanel({ 
  config, 
  onConfigChange, 
  onVariationLoad, 
  onReset,
  className = '' 
}: ConfigPanelProps) {
  const [infoExpanded, setInfoExpanded] = React.useState(false);

  const handleSliderChange = (key: keyof FractalConfig) => (value: number[]) => {
    onConfigChange({ [key]: value[0] });
  };

  const handleInputChange = (key: keyof FractalConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      onConfigChange({ [key]: value });
    }
  };

  const handleJuliaCChange = (part: 'real' | 'imaginary') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      onConfigChange({
        juliaC: {
          ...config.juliaC,
          [part]: value
        }
      });
    }
  };



  return (
    <Card className={`${className} h-full overflow-hidden`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          Fractal Configuration
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto max-h-[calc(100vh-8rem)] space-y-6">
        
        {/* Fractal Type & Variations */}
        <div className="space-y-3">
          <Label>Fractal Type</Label>
          <Select 
            value={config.fractalType} 
            onValueChange={(value: FractalType) => onConfigChange({ fractalType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mandelbrot">Mandelbrot Set</SelectItem>
              <SelectItem value="julia">Julia Set</SelectItem>
              <SelectItem value="burning-ship">Burning Ship</SelectItem>
              <SelectItem value="newton">Newton Fractal</SelectItem>
              <SelectItem value="tricorn">Tricorn</SelectItem>
            </SelectContent>
          </Select>
          
          <div>
            <Label className="text-sm text-muted-foreground">Variations</Label>
            <Select 
              key={config.fractalType} // Reset selection when fractal type changes
              onValueChange={(value) => {
                const variations = FRACTAL_VARIATIONS[config.fractalType];
                const variation = variations.find(v => v.name === value);
                if (variation) onVariationLoad(variation);
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a variation..." />
              </SelectTrigger>
              <SelectContent>
                {FRACTAL_VARIATIONS[config.fractalType].map((variation) => (
                  <SelectItem key={variation.name} value={variation.name}>
                    <div className="flex flex-col">
                      <span>{variation.name}</span>
                      <span className="text-xs text-muted-foreground">{variation.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Expandable Fractal Information */}
          <Collapsible open={infoExpanded} onOpenChange={setInfoExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2 h-auto" size="sm">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Fractal Information</span>
                  <Badge variant={config.fractalType === 'mandelbrot' ? 'default' : 'secondary'} className="text-xs">
                    {config.fractalType === 'mandelbrot' ? 'Mandelbrot' : 
                     config.fractalType === 'julia' ? 'Julia' :
                     config.fractalType === 'burning-ship' ? 'Burning Ship' :
                     config.fractalType === 'newton' ? 'Newton' :
                     config.fractalType === 'tricorn' ? 'Tricorn' : 'Unknown'}
                  </Badge>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${infoExpanded ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <div className="bg-muted/30 rounded-lg p-3 space-y-2">
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
                      : 'Unknown fractal type.'
                    }
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <Separator />

        {/* Animation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Animation</Label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
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
              }}
            >
              {!config.animate || config.animationPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          </div>

          {config.animate && (
            <>
              <div>
                <Label className="text-sm text-muted-foreground">Animation Speed: {config.animationSpeed.toFixed(1)}x</Label>
                <Slider
                  value={[config.animationSpeed]}
                  onValueChange={handleSliderChange('animationSpeed')}
                  min={0.1}
                  max={5}
                  step={0.1}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Min Iterations: {config.animationMinIterations}</Label>
                <Slider
                  value={[config.animationMinIterations]}
                  onValueChange={(value) => onConfigChange({ 
                    animationMinIterations: Math.min(value[0], config.animationMaxIterations - 1)
                  })}
                  min={10}
                  max={500}
                  step={10}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Max Iterations: {config.animationMaxIterations}</Label>
                <Slider
                  value={[config.animationMaxIterations]}
                  onValueChange={(value) => onConfigChange({ 
                    animationMaxIterations: Math.max(value[0], config.animationMinIterations + 1)
                  })}
                  min={20}
                  max={1000}
                  step={10}
                  className="mt-2"
                />
              </div>
            </>
          )}
        </div>

        <Separator />

        {/* Position & Zoom */}
        <div className="space-y-3">
          <Label>Position & Zoom</Label>
          
          <div>
            <Label className="text-sm text-muted-foreground">Center X: {config.centerX.toFixed(6)}</Label>
            <Input
              type="number"
              step="0.001"
              value={config.centerX}
              onChange={handleInputChange('centerX')}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label className="text-sm text-muted-foreground">Center Y: {config.centerY.toFixed(6)}</Label>
            <Input
              type="number"
              step="0.001"
              value={config.centerY}
              onChange={handleInputChange('centerY')}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label className="text-sm text-muted-foreground">Zoom: {config.zoom.toFixed(2)}x</Label>
            <Slider
              value={[Math.log10(config.zoom)]}
              onValueChange={(value) => onConfigChange({ zoom: Math.pow(10, value[0]) })}
              min={-1}
              max={6}
              step={0.1}
              className="mt-2"
            />
          </div>
        </div>

        <Separator />

        {/* Iterations */}
        <div>
          <Label className="text-sm text-muted-foreground">Max Iterations: {config.maxIterations}</Label>
          <Slider
            value={[config.maxIterations]}
            onValueChange={handleSliderChange('maxIterations')}
            min={10}
            max={1000}
            step={10}
            className="mt-2"
          />
        </div>

        {/* Fractal-specific parameters */}
        {config.fractalType === 'julia' && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label>Julia Set Constant (C)</Label>
              
              <div>
                <Label className="text-sm text-muted-foreground">Real: {config.juliaC.real.toFixed(3)}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={config.juliaC.real}
                  onChange={handleJuliaCChange('real')}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Imaginary: {config.juliaC.imaginary.toFixed(3)}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={config.juliaC.imaginary}
                  onChange={handleJuliaCChange('imaginary')}
                  className="mt-1"
                />
              </div>
            </div>
          </>
        )}

        {config.fractalType === 'newton' && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label>Newton Parameters</Label>
              
              <div>
                <Label className="text-sm text-muted-foreground">Root Order: {config.newtonRoot}</Label>
                <Slider
                  value={[config.newtonRoot]}
                  onValueChange={(value) => onConfigChange({ newtonRoot: value[0] })}
                  min={3}
                  max={8}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
          </>
        )}



        <Separator />

        {/* Color Palette */}
        <div>
          <Label>Color Palette</Label>
          <Select 
            value={config.colorPalette} 
            onValueChange={(value: 'classic' | 'fire' | 'ocean' | 'grayscale') => onConfigChange({ colorPalette: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="classic">Classic Rainbow</SelectItem>
              <SelectItem value="fire">Fire</SelectItem>
              <SelectItem value="ocean">Ocean</SelectItem>
              <SelectItem value="grayscale">Grayscale</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />



      </CardContent>
    </Card>
  );
}
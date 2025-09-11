import { Info, RotateCcw, Zap, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { SimulationParams, PATTERN_PRESETS, COLOR_GRADIENTS, RESOLUTION_SETTINGS, ANIMATION_DURATIONS } from '../types/simulation';

interface ControlPanelProps {
  params: SimulationParams;
  onParamsChange: (params: SimulationParams) => void;
  onReset: () => void;
}

export function ControlPanel({ params, onParamsChange, onReset }: ControlPanelProps) {
  const updateParam = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => {
    const newParams = { ...params, [key]: value };
    
    // Auto-update feed/kill rates when pattern changes
    if (key === 'pattern') {
      const preset = PATTERN_PRESETS[value as string];
      newParams.feedRate = preset.feedRate;
      newParams.killRate = preset.killRate;
    }
    
    onParamsChange(newParams);
  };

  const ColorPreviewDot = ({ colors }: { colors: [number, number, number][] }) => (
    <div className="flex gap-1">
      {colors.map((color, index) => (
        <div
          key={index}
          className="w-3 h-3 rounded-full border border-border"
          style={{ backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 p-3 sm:p-3 p-2 w-full max-w-full min-w-0 overflow-x-hidden box-border min-h-full">
      {/* Pattern Presets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Pattern Presets
          </CardTitle>
          <CardDescription>
            Choose initial pattern configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="pattern">Pattern Type</Label>
            <Select
              value={params.pattern}
              onValueChange={(value) => updateParam('pattern', value as any)}
            >
              <SelectTrigger id="pattern">
                <SelectValue placeholder="Select pattern" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PATTERN_PRESETS).map(([key, preset]) => (
                  <SelectItem key={key} value={key}>
                    <div>
                      <div>{preset.name}</div>
                      <div className="text-xs text-muted-foreground">{preset.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
            <div className="flex items-center gap-1 mb-1">
              <Info className="w-3 h-3" />
              Current Configuration
            </div>
            <div>Feed: {params.feedRate.toFixed(3)} | Kill: {params.killRate.toFixed(3)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Reaction Parameters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Reaction Parameters</CardTitle>
          <CardDescription>
            Control chemical reaction rates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feed">Feed Rate: {params.feedRate.toFixed(3)}</Label>
            <Slider
              id="feed"
              min={0.010}
              max={0.080}
              step={0.001}
              value={[params.feedRate]}
              onValueChange={([value]) => updateParam('feedRate', value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kill">Kill Rate: {params.killRate.toFixed(3)}</Label>
            <Slider
              id="kill"
              min={0.040}
              max={0.070}
              step={0.001}
              value={[params.killRate]}
              onValueChange={([value]) => updateParam('killRate', value)}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Diffusion Parameters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Diffusion Parameters</CardTitle>
          <CardDescription>
            Control chemical spreading rates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="diffusionA">Diffusion A: {params.diffusionA.toFixed(1)}</Label>
            <Slider
              id="diffusionA"
              min={0.5}
              max={2.0}
              step={0.1}
              value={[params.diffusionA]}
              onValueChange={([value]) => updateParam('diffusionA', value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="diffusionB">Diffusion B: {params.diffusionB.toFixed(1)}</Label>
            <Slider
              id="diffusionB"
              min={0.1}
              max={1.0}
              step={0.1}
              value={[params.diffusionB]}
              onValueChange={([value]) => updateParam('diffusionB', value)}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Resolution Quality */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Resolution Quality</CardTitle>
          <CardDescription>
            Balance visual quality and performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="resolution">Quality Setting</Label>
            <Select
              value={params.resolution}
              onValueChange={(value) => updateParam('resolution', value as any)}
            >
              <SelectTrigger id="resolution">
                <SelectValue placeholder="Select resolution" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RESOLUTION_SETTINGS).map(([key, setting]) => (
                  <SelectItem key={key} value={key}>
                    <div>
                      <div>{setting.name}</div>
                      <div className="text-xs text-muted-foreground">{setting.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
            <div className="flex items-center gap-1 mb-1">
              <AlertCircle className="w-3 h-3" />
              Performance Impact
            </div>
            <div>{RESOLUTION_SETTINGS[params.resolution].performance}</div>
          </div>
        </CardContent>
      </Card>

      {/* Color Schemes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Color Schemes</CardTitle>
          <CardDescription>
            Visual appearance and color mapping
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="colorScheme">Color Scheme</Label>
            <Select
              value={params.colorScheme}
              onValueChange={(value) => updateParam('colorScheme', value as any)}
            >
              <SelectTrigger id="colorScheme">
                <SelectValue placeholder="Select color scheme" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(COLOR_GRADIENTS).map(([key, gradient]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center justify-between w-full">
                      <span>{gradient.name}</span>
                      <ColorPreviewDot colors={gradient.colors} />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Animation Duration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Animation Duration
          </CardTitle>
          <CardDescription>
            Control how long the animation runs before stopping
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="animationDuration">Duration Setting</Label>
            <Select
              value={params.animationDuration.toString()}
              onValueChange={(value) => updateParam('animationDuration', parseInt(value))}
            >
              <SelectTrigger id="animationDuration">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {ANIMATION_DURATIONS.map((duration) => (
                  <SelectItem key={duration.value} value={duration.value.toString()}>
                    <div>
                      <div>{duration.label}</div>
                      <div className="text-xs text-muted-foreground">{duration.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
            <div className="flex items-center gap-1 mb-1">
              <Info className="w-3 h-3" />
              Current Setting
            </div>
            <div>
              {params.animationDuration === 0 
                ? 'Animation runs continuously until manually stopped'
                : `Animation will stop after ${params.animationDuration} seconds`
              }
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Info and Reset */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            Simulation Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Gray-Scott reaction-diffusion model</div>
            <div>A + 2B → 3B with diffusion</div>
            <div>Real-time 60fps target rendering</div>
          </div>
          <Button
            onClick={onReset}
            variant="outline"
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Simulation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
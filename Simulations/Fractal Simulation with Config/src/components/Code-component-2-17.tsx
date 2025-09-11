import React from 'react';
import { FractalConfig, FractalPreset, FRACTAL_PRESETS } from './types/FractalTypes';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RotateCcw, Download, Upload } from 'lucide-react';

interface ConfigPanelProps {
  config: FractalConfig;
  onConfigChange: (config: Partial<FractalConfig>) => void;
  onPresetLoad: (preset: FractalPreset) => void;
  onReset: () => void;
  onExport: () => void;
  className?: string;
}

export function ConfigPanel({ 
  config, 
  onConfigChange, 
  onPresetLoad, 
  onReset, 
  onExport,
  className = '' 
}: ConfigPanelProps) {
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
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto max-h-[calc(100vh-8rem)]">
        <Tabs defaultValue="fractal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fractal">Fractal</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="fractal" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Fractal Type</Label>
                <Select 
                  value={config.fractalType} 
                  onValueChange={(value: 'mandelbrot' | 'julia') => onConfigChange({ fractalType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mandelbrot">Mandelbrot Set</SelectItem>
                    <SelectItem value="julia">Julia Set</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

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
            </div>
          </TabsContent>

          <TabsContent value="display" className="space-y-6">
            <div className="space-y-4">
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

              <div className="flex items-center justify-between">
                <Label>Animation</Label>
                <Switch
                  checked={config.animate}
                  onCheckedChange={(checked) => onConfigChange({ animate: checked })}
                />
              </div>

              {config.animate && (
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
              )}
            </div>
          </TabsContent>

          <TabsContent value="presets" className="space-y-4">
            <div className="space-y-3">
              {FRACTAL_PRESETS.map((preset, index) => (
                <Card key={index} className="cursor-pointer hover:bg-accent" onClick={() => onPresetLoad(preset)}>
                  <CardContent className="p-4">
                    <h4>{preset.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{preset.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
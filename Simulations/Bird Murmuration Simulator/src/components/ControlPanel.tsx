import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { Settings, Play, Pause, RotateCcw, Shuffle } from 'lucide-react';
import { SimulationParams, defaultParams } from './SimulationParams';

interface ControlPanelProps {
  params: SimulationParams;
  onParamsChange: (newParams: SimulationParams) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onReset: () => void;
  onRandomize: () => void;
  isMobile: boolean;
}

function ParameterSlider({
  label,
  value,
  min,
  max,
  step = 0.1,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm">{label}</Label>
        <span className="text-sm text-muted-foreground">{value.toFixed(step >= 1 ? 0 : 1)}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );
}

function ParameterSwitch({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function ControlsContent({ params, onParamsChange, isPaused, onTogglePause, onReset, onRandomize }: Omit<ControlPanelProps, 'isMobile'>) {
  const updateParam = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => {
    onParamsChange({ ...params, [key]: value });
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-1">
        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={onTogglePause} className="w-full" variant="outline">
              {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
              {isPaused ? 'Play' : 'Pause'}
            </Button>
            <Button onClick={onReset} className="w-full" variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={onRandomize} className="w-full" variant="outline">
              <Shuffle className="mr-2 h-4 w-4" />
              Randomize
            </Button>
          </CardContent>
        </Card>

        {/* Flock Behavior */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Flock Behavior</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ParameterSlider
              label="Bird Count"
              value={params.birdCount}
              min={1}
              max={500}
              step={1}
              onChange={(value) => updateParam('birdCount', value)}
            />
            <ParameterSlider
              label="Max Speed"
              value={params.maxSpeed}
              min={0.5}
              max={8}
              onChange={(value) => updateParam('maxSpeed', value)}
            />
            <ParameterSlider
              label="Max Force"
              value={params.maxForce}
              min={0.01}
              max={0.5}
              step={0.01}
              onChange={(value) => updateParam('maxForce', value)}
            />
            <ParameterSlider
              label="Vision Range"
              value={params.visionRange}
              min={20}
              max={200}
              step={1}
              onChange={(value) => updateParam('visionRange', value)}
            />
            <ParameterSlider
              label="Bird Size"
              value={params.birdSize}
              min={1}
              max={10}
              step={1}
              onChange={(value) => updateParam('birdSize', value)}
            />
          </CardContent>
        </Card>

        {/* Separation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Separation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ParameterSlider
              label="Distance"
              value={params.separationDistance}
              min={5}
              max={100}
              step={1}
              onChange={(value) => updateParam('separationDistance', value)}
            />
            <ParameterSlider
              label="Force"
              value={params.separationForce}
              min={0}
              max={5}
              onChange={(value) => updateParam('separationForce', value)}
            />
          </CardContent>
        </Card>

        {/* Alignment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ParameterSlider
              label="Distance"
              value={params.alignmentDistance}
              min={10}
              max={150}
              step={1}
              onChange={(value) => updateParam('alignmentDistance', value)}
            />
            <ParameterSlider
              label="Force"
              value={params.alignmentForce}
              min={0}
              max={3}
              onChange={(value) => updateParam('alignmentForce', value)}
            />
          </CardContent>
        </Card>

        {/* Cohesion */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cohesion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ParameterSlider
              label="Distance"
              value={params.cohesionDistance}
              min={10}
              max={150}
              step={1}
              onChange={(value) => updateParam('cohesionDistance', value)}
            />
            <ParameterSlider
              label="Force"
              value={params.cohesionForce}
              min={0}
              max={3}
              onChange={(value) => updateParam('cohesionForce', value)}
            />
          </CardContent>
        </Card>

        {/* Predators */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Predators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ParameterSlider
              label="Predator Count"
              value={params.predatorCount}
              min={0}
              max={10}
              step={1}
              onChange={(value) => updateParam('predatorCount', value)}
            />
            <ParameterSlider
              label="Avoidance Distance"
              value={params.avoidanceDistance}
              min={30}
              max={200}
              step={1}
              onChange={(value) => updateParam('avoidanceDistance', value)}
            />
            <ParameterSlider
              label="Avoidance Force"
              value={params.avoidanceForce}
              min={0}
              max={10}
              onChange={(value) => updateParam('avoidanceForce', value)}
            />
            <ParameterSlider
              label="Predator Speed"
              value={params.predatorSpeed}
              min={1}
              max={12}
              onChange={(value) => updateParam('predatorSpeed', value)}
            />
            <ParameterSlider
              label="Predator Size"
              value={params.predatorSize}
              min={5}
              max={25}
              step={1}
              onChange={(value) => updateParam('predatorSize', value)}
            />
            <ParameterSlider
              label="Hunt Range"
              value={params.huntRange}
              min={50}
              max={300}
              step={1}
              onChange={(value) => updateParam('huntRange', value)}
            />
            <ParameterSlider
              label="Wander Strength"
              value={params.wanderStrength}
              min={0.1}
              max={3}
              onChange={(value) => updateParam('wanderStrength', value)}
            />
            <ParameterSlider
              label="Capture Distance"
              value={params.captureDistance}
              min={5}
              max={30}
              step={1}
              onChange={(value) => updateParam('captureDistance', value)}
            />
            <ParameterSlider
              label="Feeding Time (s)"
              value={params.feedingTime}
              min={1}
              max={10}
              step={1}
              onChange={(value) => updateParam('feedingTime', value)}
            />
          </CardContent>
        </Card>

        {/* Trees */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ParameterSlider
              label="Tree Count"
              value={params.treeCount}
              min={0}
              max={15}
              step={1}
              onChange={(value) => updateParam('treeCount', value)}
            />
            <ParameterSlider
              label="Attraction Distance"
              value={params.attractionDistance}
              min={50}
              max={300}
              step={1}
              onChange={(value) => updateParam('attractionDistance', value)}
            />
            <ParameterSlider
              label="Attraction Force"
              value={params.attractionForce}
              min={0}
              max={2}
              onChange={(value) => updateParam('attractionForce', value)}
            />
          </CardContent>
        </Card>

        {/* Environment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Environment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ParameterSlider
              label="Boundary Force"
              value={params.boundaryForce}
              min={0}
              max={3}
              onChange={(value) => updateParam('boundaryForce', value)}
            />
            <ParameterSlider
              label="Animation Speed"
              value={params.animationSpeed}
              min={0.1}
              max={3}
              onChange={(value) => updateParam('animationSpeed', value)}
            />
            <ParameterSlider
              label="Trail Length"
              value={params.trailLength}
              min={0}
              max={50}
              step={1}
              onChange={(value) => updateParam('trailLength', value)}
            />
          </CardContent>
        </Card>

        {/* Visual Debug */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Visual Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ParameterSwitch
              label="Show Vision Range"
              checked={params.showVisionRange}
              onChange={(value) => updateParam('showVisionRange', value)}
            />
            <ParameterSwitch
              label="Show Forces"
              checked={params.showForces}
              onChange={(value) => updateParam('showForces', value)}
            />
            <ParameterSwitch
              label="Show Stats"
              checked={params.showStats}
              onChange={(value) => updateParam('showStats', value)}
            />
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}

export function ControlPanel({
  params,
  onParamsChange,
  isPaused,
  onTogglePause,
  onReset,
  onRandomize,
  isMobile
}: ControlPanelProps) {
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-4 right-4 z-50 rounded-full h-14 w-14 shadow-lg"
          >
            <Settings className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Simulation Controls</SheetTitle>
            <SheetDescription>
              Adjust parameters to customize the bird murmuration behavior
            </SheetDescription>
          </SheetHeader>
          <ControlsContent
            params={params}
            onParamsChange={onParamsChange}
            isPaused={isPaused}
            onTogglePause={onTogglePause}
            onReset={onReset}
            onRandomize={onRandomize}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="w-80 h-full bg-background border-r">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Bird Murmuration</h2>
        <p className="text-sm text-muted-foreground">Boids Simulation</p>
      </div>
      <ControlsContent
        params={params}
        onParamsChange={onParamsChange}
        isPaused={isPaused}
        onTogglePause={onTogglePause}
        onReset={onReset}
        onRandomize={onRandomize}
      />
    </div>
  );
}
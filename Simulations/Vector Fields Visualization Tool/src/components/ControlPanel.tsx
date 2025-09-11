import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Trash2, Play, Pause, ChevronDown, ChevronRight } from 'lucide-react';
import { VectorFieldEditor } from './VectorFieldEditor';

interface ControlPanelProps {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
  xn: number;
  yn: number;
  v: number;
  vh: number;
  particleSpeed: number;
  vxEquation: string;
  vyEquation: string;
  isPlaying: boolean;
  particleCount: number;
  onParameterChange: (param: string, value: number) => void;
  onEquationChange: (vx: string, vy: string) => void;
  onPlayPause: () => void;
  onClearParticles: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  xmin,
  xmax,
  ymin,
  ymax,
  xn,
  yn,
  v,
  vh,
  particleSpeed,
  vxEquation,
  vyEquation,
  isPlaying,
  particleCount,
  onParameterChange,
  onEquationChange,
  onPlayPause,
  onClearParticles
}) => {
  // Simplified state for collapsible sections
  const [openSections, setOpenSections] = useState({
    equations: false,
    simulation: true,
    domain: false,
    vectorDisplay: false,
    instructions: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="p-3 md:p-4 lg:p-4 space-y-3 md:space-y-4 lg:space-y-4 pb-40 md:pb-96 lg:pb-8">
        
        {/* Vector Field Equations */}
        <Collapsible open={openSections.equations} onOpenChange={() => toggleSection('equations')}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors py-3 md:py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg">Vector Field Equations</CardTitle>
                  {openSections.equations ? (
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 pb-4 md:pb-6">
                <VectorFieldEditor
                  vxEquation={vxEquation}
                  vyEquation={vyEquation}
                  onEquationChange={onEquationChange}
                />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Simulation Controls */}
        <Collapsible open={openSections.simulation} onOpenChange={() => toggleSection('simulation')}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors py-3 md:py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg">Simulation Controls</CardTitle>
                  {openSections.simulation ? (
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3 md:space-y-4 lg:space-y-4 pt-0 pb-4 md:pb-6">
                <div className="flex gap-2">
                  <Button
                    onClick={onPlayPause}
                    variant={isPlaying ? "secondary" : "default"}
                    className="flex-1"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                  <Button
                    onClick={onClearParticles}
                    variant="destructive"
                    size="icon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Particle Speed = {particleSpeed.toFixed(3)}</Label>
                  <Slider
                    value={[particleSpeed]}
                    onValueChange={([value]) => onParameterChange('particleSpeed', value)}
                    min={0.001}
                    max={0.1}
                    step={0.001}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Particles: {particleCount} | Click canvas to add particles
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Graph Settings */}
        <Collapsible open={openSections.domain} onOpenChange={() => toggleSection('domain')}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors py-3 md:py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg">Graph Settings</CardTitle>
                  {openSections.domain ? (
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3 md:space-y-4 lg:space-y-4 pt-0 pb-4 md:pb-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-muted-foreground">X Axis</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Minimum = {xmin}</Label>
                        <Slider
                          value={[xmin]}
                          onValueChange={([value]) => onParameterChange('xmin', value)}
                          min={-10}
                          max={5}
                          step={0.1}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Maximum = {xmax}</Label>
                        <Slider
                          value={[xmax]}
                          onValueChange={([value]) => onParameterChange('xmax', value)}
                          min={-5}
                          max={10}
                          step={0.1}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-muted-foreground">Y Axis</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Minimum = {ymin}</Label>
                        <Slider
                          value={[ymin]}
                          onValueChange={([value]) => onParameterChange('ymin', value)}
                          min={-10}
                          max={5}
                          step={0.1}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Maximum = {ymax}</Label>
                        <Slider
                          value={[ymax]}
                          onValueChange={([value]) => onParameterChange('ymax', value)}
                          min={-5}
                          max={10}
                          step={0.1}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Vector Display Settings */}
        <Collapsible open={openSections.vectorDisplay} onOpenChange={() => toggleSection('vectorDisplay')}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors py-3 md:py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg">Vector Display Settings</CardTitle>
                  {openSections.vectorDisplay ? (
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3 md:space-y-4 lg:space-y-4 pt-0 pb-4 md:pb-6">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Vector Resolution</Label>
                  </div>
                  <div className="space-y-2">
                    <Label>Vectors along x-axis = {xn}</Label>
                    <Slider
                      value={[xn]}
                      onValueChange={([value]) => onParameterChange('xn', value)}
                      min={4}
                      max={20}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vectors along y-axis = {yn}</Label>
                    <Slider
                      value={[yn]}
                      onValueChange={([value]) => onParameterChange('yn', value)}
                      min={4}
                      max={20}
                      step={1}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Vector Appearance</Label>
                  </div>
                  <div className="space-y-2">
                    <Label>Vector Length = {v.toFixed(3)}</Label>
                    <Slider
                      value={[v]}
                      onValueChange={([value]) => onParameterChange('v', value)}
                      min={0.001}
                      max={0.1}
                      step={0.001}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Arrowhead Size = {vh.toFixed(3)}</Label>
                    <Slider
                      value={[vh]}
                      onValueChange={([value]) => onParameterChange('vh', value)}
                      min={0.01}
                      max={0.2}
                      step={0.01}
                    />
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Instructions */}
        <Collapsible open={openSections.instructions} onOpenChange={() => toggleSection('instructions')}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors py-3 md:py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg">Instructions</CardTitle>
                  {openSections.instructions ? (
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 pb-4 md:pb-6">
                <div className="text-sm space-y-2">
                  <p>• Click anywhere on the canvas to add particles</p>
                  <p>• Particles will follow the vector field flow</p>
                  <p>• Use Play/Pause to control animation</p>
                  <p>• Adjust parameters to see different behaviors</p>
                  <p>• Clear particles with the trash button</p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

      </div>
    </div>
  );
};
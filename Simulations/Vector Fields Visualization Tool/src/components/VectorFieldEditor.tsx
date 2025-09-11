import React, { useState } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertCircle, Check } from 'lucide-react';

interface VectorFieldEditorProps {
  vxEquation: string;
  vyEquation: string;
  onEquationChange: (vx: string, vy: string) => void;
}

export const VectorFieldEditor: React.FC<VectorFieldEditorProps> = ({
  vxEquation,
  vyEquation,
  onEquationChange
}) => {
  const [localVx, setLocalVx] = useState(vxEquation);
  const [localVy, setLocalVy] = useState(vyEquation);
  const [vxError, setVxError] = useState('');
  const [vyError, setVyError] = useState('');

  // Test if an equation is valid by evaluating it with test values
  const validateEquation = (equation: string): string => {
    try {
      // Replace mathematical functions and operators for safe evaluation
      const testExpression = equation
        .replace(/\bx\b/g, '1')
        .replace(/\by\b/g, '1')
        .replace(/\^/g, '**')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/exp/g, 'Math.exp')
        .replace(/log/g, 'Math.log')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/abs/g, 'Math.abs')
        .replace(/pi/g, 'Math.PI')
        .replace(/e(?![a-zA-Z])/g, 'Math.E');

      // Check for potentially dangerous patterns
      if (testExpression.includes('eval') || 
          testExpression.includes('Function') || 
          testExpression.includes('constructor') ||
          testExpression.includes('prototype')) {
        return 'Invalid expression: potentially unsafe content';
      }

      // Test evaluation
      const result = Function('"use strict"; return (' + testExpression + ')')();
      
      if (typeof result !== 'number' || isNaN(result)) {
        return 'Expression must evaluate to a number';
      }
      
      return '';
    } catch (error) {
      return `Invalid expression: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  };

  const handleVxChange = (value: string) => {
    setLocalVx(value);
    const error = validateEquation(value);
    setVxError(error);
  };

  const handleVyChange = (value: string) => {
    setLocalVy(value);
    const error = validateEquation(value);
    setVyError(error);
  };

  const handleApply = () => {
    const vxErr = validateEquation(localVx);
    const vyErr = validateEquation(localVy);
    
    setVxError(vxErr);
    setVyError(vyErr);
    
    if (!vxErr && !vyErr) {
      onEquationChange(localVx, localVy);
    }
  };

  const handleReset = () => {
    const defaultVx = '-y';
    const defaultVy = 'x';
    setLocalVx(defaultVx);
    setLocalVy(defaultVy);
    setVxError('');
    setVyError('');
    onEquationChange(defaultVx, defaultVy);
  };

  const presetFields = [
    {
      id: 'circular-ccw',
      name: 'Circular Flow (CCW)',
      vx: '-y',
      vy: 'x'
    },
    {
      id: 'circular-cw',
      name: 'Circular Flow (CW)',
      vx: 'y',
      vy: '-x'
    },
    {
      id: 'outward-spiral',
      name: 'Outward Spiral',
      vx: '-y + 0.1*x',
      vy: 'x + 0.1*y'
    },
    {
      id: 'inward-spiral',
      name: 'Inward Spiral',
      vx: '-y - 0.1*x',
      vy: 'x - 0.1*y'
    },
    {
      id: 'radial-outward',
      name: 'Radial Outward',
      vx: 'x',
      vy: 'y'
    },
    {
      id: 'radial-inward',
      name: 'Radial Inward',
      vx: '-x',
      vy: '-y'
    },
    {
      id: 'complex-field',
      name: 'Complex Field',
      vx: 'x*x - y*y - 4',
      vy: '2*x*y'
    },
    {
      id: 'wave-field',
      name: 'Wave Field',
      vx: 'sin(y)',
      vy: 'cos(x)'
    }
  ];

  const handlePresetSelect = (presetId: string) => {
    const preset = presetFields.find(p => p.id === presetId);
    if (preset) {
      setLocalVx(preset.vx);
      setLocalVy(preset.vy);
      setVxError('');
      setVyError('');
      onEquationChange(preset.vx, preset.vy);
    }
  };

  // Find current preset if equations match exactly
  const getCurrentPreset = () => {
    return presetFields.find(preset => 
      preset.vx === vxEquation && preset.vy === vyEquation
    )?.id || '';
  };

  const hasChanges = localVx !== vxEquation || localVy !== vyEquation;
  const hasErrors = vxError || vyError;

  return (
    <div className="space-y-3 lg:space-y-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Vx(x,y) =</Label>
            <Input
              value={localVx}
              onChange={(e) => handleVxChange(e.target.value)}
              placeholder="Enter expression for x-component"
              className={vxError ? 'border-destructive' : ''}
            />
            {vxError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                {vxError}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Vy(x,y) =</Label>
            <Input
              value={localVy}
              onChange={(e) => handleVyChange(e.target.value)}
              placeholder="Enter expression for y-component"
              className={vyError ? 'border-destructive' : ''}
            />
            {vyError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                {vyError}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleApply}
            disabled={hasErrors || !hasChanges}
            className="flex-1"
          >
            <Check className="w-4 h-4 mr-2" />
            Apply Changes
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
          >
            Reset
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Preset Fields</Label>
          <Select value={getCurrentPreset()} onValueChange={handlePresetSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a preset field..." />
            </SelectTrigger>
            <SelectContent>
              {presetFields.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  <div className="flex flex-col items-start">
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-xs text-muted-foreground">
                      ({preset.vx}, {preset.vy})
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Supported functions:</strong></p>
          <p>• Basic: +, -, *, /, ^ (power)</p>
          <p>• Trig: sin, cos, tan</p>
          <p>• Other: exp, log, sqrt, abs</p>
          <p>• Constants: pi, e</p>
          <p>• Variables: x, y</p>
        </div>
    </div>
  );
};
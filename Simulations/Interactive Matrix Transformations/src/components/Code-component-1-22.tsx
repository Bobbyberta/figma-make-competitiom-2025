import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface ControlsProps {
  matrixSize: 2 | 3;
  onMatrixSizeChange: (size: 2 | 3) => void;
  shape: string;
  onShapeChange: (shape: string) => void;
  onReset: () => void;
  onPreset: (preset: string) => void;
}

export function Controls({ 
  matrixSize, 
  onMatrixSizeChange, 
  shape, 
  onShapeChange, 
  onReset, 
  onPreset 
}: ControlsProps) {
  const presets = [
    { name: "Identity", key: "identity" },
    { name: "Scale 2x", key: "scale2x" },
    { name: "Scale 0.5x", key: "scale05x" },
    { name: "Rotate 45°", key: "rotate45" },
    { name: "Rotate 90°", key: "rotate90" },
    { name: "Shear X", key: "shearX" },
    { name: "Shear Y", key: "shearY" },
    { name: "Reflect X", key: "reflectX" },
    { name: "Reflect Y", key: "reflectY" },
  ];

  return (
    <Card className="p-4 space-y-4">
      <div>
        <h3 className="mb-3">Controls</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-2">Matrix Size</label>
            <div className="flex gap-2">
              <Button
                variant={matrixSize === 2 ? "default" : "outline"}
                size="sm"
                onClick={() => onMatrixSizeChange(2)}
              >
                2×2
              </Button>
              <Button
                variant={matrixSize === 3 ? "default" : "outline"}
                size="sm"
                onClick={() => onMatrixSizeChange(3)}
              >
                3×3
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Shape</label>
            <Select value={shape} onValueChange={onShapeChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="triangle">Triangle</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
                <SelectItem value="house">House</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm mb-2">Preset Transformations</label>
            <div className="grid grid-cols-2 gap-1">
              {presets.map((preset) => (
                <Button
                  key={preset.key}
                  variant="outline"
                  size="sm"
                  onClick={() => onPreset(preset.key)}
                  className="text-xs"
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={onReset} variant="outline" className="w-full">
            Reset to Identity
          </Button>
        </div>
      </div>
    </Card>
  );
}
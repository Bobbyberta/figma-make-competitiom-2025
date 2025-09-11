import { useState } from "react";
import { MatrixInput } from "./components/MatrixInput";
import { ShapeCanvas } from "./components/ShapeCanvas";
import { Controls } from "./components/Controls";

export default function App() {
  const [matrixSize, setMatrixSize] = useState<2 | 3>(2);
  const [shape, setShape] = useState<string>("square");
  
  // Initialize matrices
  const [matrix2x2, setMatrix2x2] = useState<number[][]>([
    [1, 0],
    [0, 1]
  ]);
  
  const [matrix3x3, setMatrix3x3] = useState<number[][]>([
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ]);

  const currentMatrix = matrixSize === 2 ? matrix2x2 : matrix3x3;
  const setCurrentMatrix = matrixSize === 2 ? setMatrix2x2 : setMatrix3x3;

  const handleMatrixSizeChange = (size: 2 | 3) => {
    setMatrixSize(size);
    // Change default shape when switching between 2D and 3D
    if (size === 2) {
      setShape("square");
    } else {
      setShape("cube");
    }
  };

  const handleReset = () => {
    if (matrixSize === 2) {
      setMatrix2x2([
        [1, 0],
        [0, 1]
      ]);
    } else {
      setMatrix3x3([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ]);
    }
  };

  const handlePreset = (preset: string) => {
    const cos45 = Math.cos(Math.PI / 4);
    const sin45 = Math.sin(Math.PI / 4);
    
    switch (preset) {
      case "identity":
        handleReset();
        break;
      case "scale2x":
        if (matrixSize === 2) {
          setMatrix2x2([[2, 0], [0, 2]]);
        } else {
          setMatrix3x3([[2, 0, 0], [0, 2, 0], [0, 0, 2]]);
        }
        break;
      case "scale05x":
        if (matrixSize === 2) {
          setMatrix2x2([[0.5, 0], [0, 0.5]]);
        } else {
          setMatrix3x3([[0.5, 0, 0], [0, 0.5, 0], [0, 0, 0.5]]);
        }
        break;
      case "rotate45":
        if (matrixSize === 2) {
          setMatrix2x2([[cos45, -sin45], [sin45, cos45]]);
        } else {
          setMatrix3x3([[cos45, -sin45, 0], [sin45, cos45, 0], [0, 0, 1]]);
        }
        break;
      case "rotate90":
        if (matrixSize === 2) {
          setMatrix2x2([[0, -1], [1, 0]]);
        } else {
          setMatrix3x3([[0, -1, 0], [1, 0, 0], [0, 0, 1]]);
        }
        break;
      case "shearX":
        if (matrixSize === 2) {
          setMatrix2x2([[1, 0.5], [0, 1]]);
        } else {
          setMatrix3x3([[1, 0.5, 0], [0, 1, 0], [0, 0, 1]]);
        }
        break;
      case "shearY":
        if (matrixSize === 2) {
          setMatrix2x2([[1, 0], [0.5, 1]]);
        } else {
          setMatrix3x3([[1, 0, 0], [0.5, 1, 0], [0, 0, 1]]);
        }
        break;
      case "reflectX":
        if (matrixSize === 2) {
          setMatrix2x2([[-1, 0], [0, 1]]);
        } else {
          setMatrix3x3([[-1, 0, 0], [0, 1, 0], [0, 0, 1]]);
        }
        break;
      case "reflectY":
        if (matrixSize === 2) {
          setMatrix2x2([[1, 0], [0, -1]]);
        } else {
          setMatrix3x3([[1, 0, 0], [0, -1, 0], [0, 0, 1]]);
        }
        break;
      case "rotateX90":
        setMatrix3x3([[1, 0, 0], [0, 0, -1], [0, 1, 0]]);
        break;
      case "rotateY90":
        setMatrix3x3([[0, 0, 1], [0, 1, 0], [-1, 0, 0]]);
        break;
      case "reflectZ":
        setMatrix3x3([[1, 0, 0], [0, 1, 0], [0, 0, -1]]);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="mb-2">Interactive Matrix Transformations</h1>
          <p className="text-muted-foreground">
            Explore how matrices transform shapes in real time. Use 2×2 matrices for 2D shapes 
            and 3×3 matrices for 3D objects. Adjust matrix values to see rotation, scaling, 
            shearing, and reflection effects.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visualization - First on mobile, second on desktop */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white rounded-lg p-4 h-full">
              <h3 className="mb-4">Transformation Visualization</h3>
              <ShapeCanvas
                matrix={currentMatrix}
                shape={shape}
                matrixSize={matrixSize}
              />
            </div>
          </div>

          {/* Controls and Matrix Input - Second on mobile, first on desktop */}
          <div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
            <Controls
              matrixSize={matrixSize}
              onMatrixSizeChange={handleMatrixSizeChange}
              shape={shape}
              onShapeChange={setShape}
              onReset={handleReset}
              onPreset={handlePreset}
            />
            
            <MatrixInput
              matrix={currentMatrix}
              onChange={setCurrentMatrix}
              size={matrixSize}
            />
          </div>
        </div>

        {/* Educational information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="mb-2">Understanding the Determinant</h4>
            <p className="text-sm text-muted-foreground">
              {matrixSize === 2 
                ? "The determinant tells you how the transformation scales areas. A determinant of 2 means areas are doubled, while 0.5 means they're halved. Negative determinants flip the shape's orientation."
                : "For 3×3 matrices, the determinant shows how the transformation scales volumes. A determinant of 2 means volumes are multiplied by 8 (2³), while 0.5 means they're divided by 8. Negative determinants indicate orientation reversal."
              }
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <h4 className="mb-2">Matrix Operations</h4>
            <p className="text-sm text-muted-foreground">
              {matrixSize === 2 
                ? "Each point (x,y) is multiplied by the matrix to get the new position. For 2×2 matrices: [a b; c d] transforms (x,y) to (ax+by, cx+dy)."
                : "Each point (x,y,z) is multiplied by the 3×3 matrix. The transformation applies to all three dimensions, enabling rotations around different axes, 3D scaling, and skewing."
              }
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <h4 className="mb-2">{matrixSize === 2 ? "2D" : "3D"} Transformations</h4>
            <p className="text-sm text-muted-foreground">
              {matrixSize === 2 
                ? "Try the preset buttons to see classic 2D transformations like rotations, scaling, shearing, and reflections. Notice how each affects the determinant."
                : "Explore 3D transformations including 3D scaling, rotations around the Z-axis, and more complex deformations. The wireframe view helps visualize how the entire 3D structure changes."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
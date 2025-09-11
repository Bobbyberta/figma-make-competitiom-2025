import { useEffect, useState } from "react";

interface Point {
  x: number;
  y: number;
  z?: number;
}

interface ShapeCanvasProps {
  matrix: number[][];
  shape: string;
  matrixSize: 2 | 3;
}

export function ShapeCanvas({ matrix, shape, matrixSize }: ShapeCanvasProps) {
  const [originalPoints, setOriginalPoints] = useState<Point[]>([]);
  const [transformedPoints, setTransformedPoints] = useState<Point[]>([]);

  // Define shapes
  const getShapePoints = (shape: string): Point[] => {
    switch (shape) {
      case "square":
        return [
          { x: -50, y: -50, z: 0 },
          { x: 50, y: -50, z: 0 },
          { x: 50, y: 50, z: 0 },
          { x: -50, y: 50, z: 0 }
        ];
      case "triangle":
        return [
          { x: 0, y: -60, z: 0 },
          { x: -50, y: 40, z: 0 },
          { x: 50, y: 40, z: 0 }
        ];
      case "circle":
        // Approximate circle with 16 points
        const points: Point[] = [];
        for (let i = 0; i < 16; i++) {
          const angle = (i / 16) * 2 * Math.PI;
          points.push({
            x: Math.cos(angle) * 50,
            y: Math.sin(angle) * 50,
            z: 0
          });
        }
        return points;
      case "house":
        return [
          { x: -40, y: 40, z: 0 },   // bottom left
          { x: 40, y: 40, z: 0 },    // bottom right
          { x: 40, y: -10, z: 0 },   // roof bottom right
          { x: 0, y: -50, z: 0 },    // roof top
          { x: -40, y: -10, z: 0 },  // roof bottom left
        ];
      default:
        return [];
    }
  };

  // Transform point using matrix
  const transformPoint = (point: Point, matrix: number[][]): Point => {
    if (matrixSize === 2) {
      return {
        x: matrix[0][0] * point.x + matrix[0][1] * point.y,
        y: matrix[1][0] * point.x + matrix[1][1] * point.y,
        z: point.z
      };
    } else {
      return {
        x: matrix[0][0] * point.x + matrix[0][1] * point.y + matrix[0][2] * (point.z || 0),
        y: matrix[1][0] * point.x + matrix[1][1] * point.y + matrix[1][2] * (point.z || 0),
        z: matrix[2][0] * point.x + matrix[2][1] * point.y + matrix[2][2] * (point.z || 0)
      };
    }
  };

  // Convert points to SVG path
  const pointsToPath = (points: Point[]): string => {
    if (points.length === 0) return "";
    
    let path = `M ${points[0].x + 200} ${points[0].y + 200}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x + 200} ${points[i].y + 200}`;
    }
    path += " Z";
    return path;
  };

  useEffect(() => {
    const original = getShapePoints(shape);
    const transformed = original.map(point => transformPoint(point, matrix));
    
    setOriginalPoints(original);
    setTransformedPoints(transformed);
  }, [matrix, shape, matrixSize]);

  return (
    <div className="w-full h-full min-h-[400px] bg-gray-50 rounded-lg overflow-hidden">
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 400 400"
        className="bg-white"
      >
        {/* Grid */}
        <defs>
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="#f0f0f0"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="400" height="400" fill="url(#grid)" />
        
        {/* Axes */}
        <line x1="0" y1="200" x2="400" y2="200" stroke="#ddd" strokeWidth="2" />
        <line x1="200" y1="0" x2="200" y2="400" stroke="#ddd" strokeWidth="2" />
        
        {/* Axis labels */}
        <text x="380" y="195" className="text-xs fill-gray-500">x</text>
        <text x="205" y="15" className="text-xs fill-gray-500">y</text>
        
        {/* Original shape */}
        {originalPoints.length > 0 && (
          <path
            d={pointsToPath(originalPoints)}
            fill="rgba(59, 130, 246, 0.3)"
            stroke="rgb(59, 130, 246)"
            strokeWidth="2"
          />
        )}
        
        {/* Transformed shape */}
        {transformedPoints.length > 0 && (
          <path
            d={pointsToPath(transformedPoints)}
            fill="rgba(239, 68, 68, 0.3)"
            stroke="rgb(239, 68, 68)"
            strokeWidth="2"
          />
        )}
        
        {/* Origin point */}
        <circle cx="200" cy="200" r="3" fill="#333" />
        
        {/* Legend */}
        <g transform="translate(10, 10)">
          <rect width="120" height="60" fill="white" stroke="#ddd" rx="4" />
          <circle cx="15" cy="20" r="6" fill="rgba(59, 130, 246, 0.3)" stroke="rgb(59, 130, 246)" strokeWidth="2" />
          <text x="28" y="25" className="text-xs fill-gray-700">Original</text>
          <circle cx="15" cy="40" r="6" fill="rgba(239, 68, 68, 0.3)" stroke="rgb(239, 68, 68)" strokeWidth="2" />
          <text x="28" y="45" className="text-xs fill-gray-700">Transformed</text>
        </g>
      </svg>
    </div>
  );
}
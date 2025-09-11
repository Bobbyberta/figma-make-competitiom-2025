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
    if (matrixSize === 2) {
      // 2D shapes
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
    } else {
      // 3D shapes
      switch (shape) {
        case "cube":
          return [
            // Front face
            { x: -40, y: -40, z: -40 },
            { x: 40, y: -40, z: -40 },
            { x: 40, y: 40, z: -40 },
            { x: -40, y: 40, z: -40 },
            // Back face
            { x: -40, y: -40, z: 40 },
            { x: 40, y: -40, z: 40 },
            { x: 40, y: 40, z: 40 },
            { x: -40, y: 40, z: 40 }
          ];
        case "pyramid":
          return [
            // Base
            { x: -40, y: 40, z: -40 },
            { x: 40, y: 40, z: -40 },
            { x: 40, y: 40, z: 40 },
            { x: -40, y: 40, z: 40 },
            // Apex
            { x: 0, y: -60, z: 0 }
          ];
        case "sphere":
          const spherePoints: Point[] = [];
          // Create sphere with latitude and longitude lines
          for (let lat = 0; lat <= 8; lat++) {
            for (let lon = 0; lon < 16; lon++) {
              const phi = (lat / 8) * Math.PI;
              const theta = (lon / 16) * 2 * Math.PI;
              spherePoints.push({
                x: 50 * Math.sin(phi) * Math.cos(theta),
                y: 50 * Math.cos(phi),
                z: 50 * Math.sin(phi) * Math.sin(theta)
              });
            }
          }
          return spherePoints;
        case "tetrahedron":
          const h = 60; // height
          return [
            { x: 0, y: -h/2, z: 0 },         // top vertex
            { x: -40, y: h/2, z: -23 },      // base vertex 1
            { x: 40, y: h/2, z: -23 },       // base vertex 2
            { x: 0, y: h/2, z: 46 }          // base vertex 3
          ];
        default:
          return [];
      }
    }
  };

  // Transform point using matrix
  const transformPoint = (point: Point, matrix: number[][]): Point => {
    if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
      return { x: 0, y: 0, z: 0 }; // Return origin if invalid point
    }

    if (!matrix || matrix.length === 0) {
      return point; // Return original point if invalid matrix
    }

    if (matrixSize === 2) {
      if (matrix.length >= 2 && matrix[0].length >= 2 && matrix[1].length >= 2) {
        return {
          x: matrix[0][0] * point.x + matrix[0][1] * point.y,
          y: matrix[1][0] * point.x + matrix[1][1] * point.y,
          z: point.z
        };
      }
    } else {
      if (matrix.length >= 3 && matrix[0].length >= 3 && matrix[1].length >= 3 && matrix[2].length >= 3) {
        const z = typeof point.z === 'number' ? point.z : 0;
        return {
          x: matrix[0][0] * point.x + matrix[0][1] * point.y + matrix[0][2] * z,
          y: matrix[1][0] * point.x + matrix[1][1] * point.y + matrix[1][2] * z,
          z: matrix[2][0] * point.x + matrix[2][1] * point.y + matrix[2][2] * z
        };
      }
    }
    
    return point; // Return original point if matrix is invalid
  };

  // Project 3D point to 2D for display
  const project3DTo2D = (point: Point): { x: number; y: number } => {
    // Simple orthographic projection with slight perspective
    if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
      return { x: 200, y: 200 }; // Default center point if invalid
    }
    
    const perspective = 600;
    const z = typeof point.z === 'number' ? point.z : 0;
    const scale = perspective / (perspective + z);
    
    return {
      x: (point.x * scale) + 200,
      y: (point.y * scale) + 200
    };
  };

  // Convert points to SVG path
  const pointsToPath = (points: Point[]): string => {
    if (points.length === 0) return "";
    
    if (matrixSize === 2) {
      // 2D path
      let path = `M ${points[0].x + 200} ${points[0].y + 200}`;
      for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i].x + 200} ${points[i].y + 200}`;
      }
      path += " Z";
      return path;
    } else {
      // 3D shapes need special handling - just connect visible points
      const projectedPoints = points.map(project3DTo2D);
      
      if (shape === "cube") {
        // Draw cube wireframe
        return "";
      } else if (shape === "pyramid") {
        // Connect base points
        let path = `M ${projectedPoints[0].x} ${projectedPoints[0].y}`;
        for (let i = 1; i < 4; i++) {
          path += ` L ${projectedPoints[i].x} ${projectedPoints[i].y}`;
        }
        path += " Z";
        return path;
      } else if (shape === "tetrahedron") {
        // Connect base points
        let path = `M ${projectedPoints[1].x} ${projectedPoints[1].y}`;
        path += ` L ${projectedPoints[2].x} ${projectedPoints[2].y}`;
        path += ` L ${projectedPoints[3].x} ${projectedPoints[3].y}`;
        path += " Z";
        return path;
      } else {
        // For sphere, connect adjacent points
        const projPoints = points.map(project3DTo2D);
        if (projPoints.length > 0) {
          let path = `M ${projPoints[0].x} ${projPoints[0].y}`;
          for (let i = 1; i < Math.min(16, projPoints.length); i++) {
            path += ` L ${projPoints[i].x} ${projPoints[i].y}`;
          }
          path += " Z";
          return path;
        }
      }
    }
    return "";
  };

  // Render 3D wireframe
  const render3DWireframe = (points: Point[], color: string, opacity: number) => {
    if (matrixSize !== 3 || points.length === 0) return null;
    
    const projectedPoints = points.map(project3DTo2D).filter(p => p && !isNaN(p.x) && !isNaN(p.y));
    
    if (shape === "cube" && projectedPoints.length >= 8) {
      return (
        <g stroke={color} fill="none" strokeWidth="2" opacity={opacity}>
          {/* Front face */}
          <path d={`M ${projectedPoints[0].x} ${projectedPoints[0].y} L ${projectedPoints[1].x} ${projectedPoints[1].y} L ${projectedPoints[2].x} ${projectedPoints[2].y} L ${projectedPoints[3].x} ${projectedPoints[3].y} Z`} />
          {/* Back face */}
          <path d={`M ${projectedPoints[4].x} ${projectedPoints[4].y} L ${projectedPoints[5].x} ${projectedPoints[5].y} L ${projectedPoints[6].x} ${projectedPoints[6].y} L ${projectedPoints[7].x} ${projectedPoints[7].y} Z`} />
          {/* Connecting edges */}
          <line x1={projectedPoints[0].x} y1={projectedPoints[0].y} x2={projectedPoints[4].x} y2={projectedPoints[4].y} />
          <line x1={projectedPoints[1].x} y1={projectedPoints[1].y} x2={projectedPoints[5].x} y2={projectedPoints[5].y} />
          <line x1={projectedPoints[2].x} y1={projectedPoints[2].y} x2={projectedPoints[6].x} y2={projectedPoints[6].y} />
          <line x1={projectedPoints[3].x} y1={projectedPoints[3].y} x2={projectedPoints[7].x} y2={projectedPoints[7].y} />
        </g>
      );
    } else if (shape === "pyramid" && projectedPoints.length >= 5) {
      return (
        <g stroke={color} fill="none" strokeWidth="2" opacity={opacity}>
          {/* Base */}
          <path d={`M ${projectedPoints[0].x} ${projectedPoints[0].y} L ${projectedPoints[1].x} ${projectedPoints[1].y} L ${projectedPoints[2].x} ${projectedPoints[2].y} L ${projectedPoints[3].x} ${projectedPoints[3].y} Z`} />
          {/* Edges to apex */}
          <line x1={projectedPoints[0].x} y1={projectedPoints[0].y} x2={projectedPoints[4].x} y2={projectedPoints[4].y} />
          <line x1={projectedPoints[1].x} y1={projectedPoints[1].y} x2={projectedPoints[4].x} y2={projectedPoints[4].y} />
          <line x1={projectedPoints[2].x} y1={projectedPoints[2].y} x2={projectedPoints[4].x} y2={projectedPoints[4].y} />
          <line x1={projectedPoints[3].x} y1={projectedPoints[3].y} x2={projectedPoints[4].x} y2={projectedPoints[4].y} />
        </g>
      );
    } else if (shape === "tetrahedron" && projectedPoints.length >= 4) {
      return (
        <g stroke={color} fill="none" strokeWidth="2" opacity={opacity}>
          {/* Base triangle */}
          <path d={`M ${projectedPoints[1].x} ${projectedPoints[1].y} L ${projectedPoints[2].x} ${projectedPoints[2].y} L ${projectedPoints[3].x} ${projectedPoints[3].y} Z`} />
          {/* Edges to top vertex */}
          <line x1={projectedPoints[0].x} y1={projectedPoints[0].y} x2={projectedPoints[1].x} y2={projectedPoints[1].y} />
          <line x1={projectedPoints[0].x} y1={projectedPoints[0].y} x2={projectedPoints[2].x} y2={projectedPoints[2].y} />
          <line x1={projectedPoints[0].x} y1={projectedPoints[0].y} x2={projectedPoints[3].x} y2={projectedPoints[3].y} />
        </g>
      );
    } else if (shape === "sphere" && points.length >= 144) { // 9 * 16
      return (
        <g stroke={color} fill="none" strokeWidth="1" opacity={opacity}>
          {/* Draw latitude and longitude lines */}
          {Array.from({ length: 9 }, (_, lat) => {
            const latPoints = points.slice(lat * 16, (lat + 1) * 16);
            if (latPoints.length === 16) {
              return (
                <path
                  key={`lat-${lat}`}
                  d={latPoints.map((point, i) => {
                    const proj = project3DTo2D(point);
                    return `${i === 0 ? 'M' : 'L'} ${proj.x} ${proj.y}`;
                  }).join(' ') + ' Z'}
                />
              );
            }
            return null;
          })}
          {Array.from({ length: 16 }, (_, lon) => {
            const lonPoints = Array.from({ length: 9 }, (_, lat) => points[lat * 16 + lon]).filter(Boolean);
            if (lonPoints.length === 9) {
              return (
                <path
                  key={`lon-${lon}`}
                  d={lonPoints.map((point, lat) => {
                    const proj = project3DTo2D(point);
                    return `${lat === 0 ? 'M' : 'L'} ${proj.x} ${proj.y}`;
                  }).join(' ')}
                />
              );
            }
            return null;
          })}
        </g>
      );
    }
    
    return null;
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
        {matrixSize === 2 ? (
          originalPoints.length > 0 && (
            <path
              d={pointsToPath(originalPoints)}
              fill="rgba(59, 130, 246, 0.3)"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
            />
          )
        ) : (
          render3DWireframe(originalPoints, "rgb(59, 130, 246)", 0.8)
        )}
        
        {/* Transformed shape */}
        {matrixSize === 2 ? (
          transformedPoints.length > 0 && (
            <path
              d={pointsToPath(transformedPoints)}
              fill="rgba(239, 68, 68, 0.3)"
              stroke="rgb(239, 68, 68)"
              strokeWidth="2"
            />
          )
        ) : (
          render3DWireframe(transformedPoints, "rgb(239, 68, 68)", 0.8)
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
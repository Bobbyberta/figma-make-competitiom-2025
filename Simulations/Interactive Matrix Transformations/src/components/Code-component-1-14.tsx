import { Input } from "./ui/input";
import { Card } from "./ui/card";

interface MatrixInputProps {
  matrix: number[][];
  onChange: (matrix: number[][]) => void;
  size: 2 | 3;
}

export function MatrixInput({ matrix, onChange, size }: MatrixInputProps) {
  const handleChange = (row: number, col: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newMatrix = matrix.map((r, i) =>
      r.map((c, j) => (i === row && j === col ? numValue : c))
    );
    onChange(newMatrix);
  };

  return (
    <Card className="p-4">
      <h3 className="mb-4">Transformation Matrix ({size}×{size})</h3>
      <div 
        className={`grid gap-2 ${size === 2 ? 'grid-cols-2' : 'grid-cols-3'} max-w-fit`}
        style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      >
        {matrix.slice(0, size).map((row, i) =>
          row.slice(0, size).map((cell, j) => (
            <Input
              key={`${i}-${j}`}
              type="number"
              step="0.1"
              value={cell}
              onChange={(e) => handleChange(i, j, e.target.value)}
              className="w-16 h-12 text-center"
            />
          ))
        )}
      </div>
      
      <div className="mt-4 space-y-2">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Determinant:</span>{" "}
          {size === 2 
            ? (matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]).toFixed(3)
            : (
                matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
                matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
                matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0])
              ).toFixed(3)
          }
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Area scaling:</span>{" "}
          {Math.abs(
            size === 2 
              ? matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]
              : matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
                matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
                matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0])
          ).toFixed(3)}×
        </p>
      </div>
    </Card>
  );
}
# Interactive Matrix Transformations - Project Guidelines

## Project Overview

The Interactive Matrix Transformations application is an educational tool designed to help students visualize and understand how 2×2 and 3×3 matrices transform geometric shapes in real time. The application demonstrates fundamental linear algebra concepts including rotation, scaling, shearing, reflection, and the geometric meaning of determinants.

### Educational Goals
- Make abstract matrix operations concrete through visual feedback
- Show the relationship between matrix values and geometric transformations
- Demonstrate how determinants affect area (2D) and volume (3D) scaling
- Provide hands-on exploration of linear transformations

## Architecture & Components

### Core Components

#### App.tsx (Main Container)
- **Purpose**: Central state management and layout orchestration
- **Responsibilities**: 
  - Matrix state management (2×2 and 3×3)
  - Shape selection and matrix size switching
  - Preset transformation handling
  - Responsive layout coordination

#### MatrixInput.tsx
- **Purpose**: Interactive matrix value input with real-time feedback
- **Key Features**:
  - Numerical input validation
  - Live determinant calculation
  - Area/volume scaling display
  - Responsive grid layout

#### ShapeCanvas.tsx
- **Purpose**: Visual rendering of original and transformed shapes
- **Technical Details**:
  - SVG-based rendering for scalability
  - 2D and 3D shape definitions
  - Matrix transformation algorithms
  - 3D to 2D projection for wireframe display

#### Controls.tsx
- **Purpose**: User interface for shape and matrix selection
- **Features**:
  - Matrix size toggle (2×2 vs 3×3)
  - Shape selection (context-aware for 2D/3D)
  - Preset transformation buttons
  - Reset functionality

## Educational Design Principles

### Progressive Complexity
- Start with 2×2 matrices and 2D shapes for accessibility
- Advance to 3×3 matrices and 3D objects for deeper understanding
- Provide preset transformations as learning scaffolds

### Immediate Visual Feedback
- Real-time transformation rendering
- Determinant calculation and display
- Side-by-side original vs. transformed comparison
- Clear visual distinction between original (blue) and transformed (red) shapes

### Mathematical Accuracy
- Precise matrix multiplication algorithms
- Correct determinant calculations for both 2×2 and 3×3 matrices
- Accurate geometric transformations
- Proper handling of edge cases (zero determinants, invalid inputs)

## Technical Implementation Guidelines

### Matrix Operations
```typescript
// Always validate matrix dimensions before operations
if (matrix.length >= size && matrix[0].length >= size) {
  // Perform transformation
}

// Handle invalid inputs gracefully
if (!point || typeof point.x !== 'number') {
  return { x: 0, y: 0, z: 0 }; // Safe fallback
}
```

### Shape Definitions
- **2D Shapes**: square, triangle, circle (16-point approximation), house
- **3D Shapes**: cube, pyramid, sphere (9×16 grid), tetrahedron
- All shapes centered at origin for consistent transformations
- Coordinate ranges: approximately -60 to +60 units

### 3D Visualization
- Use wireframe rendering for 3D shapes
- Implement orthographic projection with perspective scaling
- Maintain visual clarity through proper stroke weights and opacity
- Handle depth sorting implicitly through SVG rendering order

## UI/UX Guidelines

### Responsive Design
- **Mobile First**: Visualization appears above controls on small screens
- **Desktop**: Side-by-side layout with controls on left, visualization on right
- **Breakpoint**: `lg` (1024px) for layout switching

### Visual Hierarchy
```css
/* Primary actions use default button variant */
variant={matrixSize === 2 ? "default" : "outline"}

/* Secondary actions use outline variant */
variant="outline"

/* Small interactive elements */
size="sm"
```

### Color System
- **Original shapes**: Blue (`rgb(59, 130, 246)`) with 30% opacity fill
- **Transformed shapes**: Red (`rgb(239, 68, 68)`) with 30% opacity fill
- **Grid and axes**: Light gray (`#f0f0f0` and `#ddd`)
- **Background**: White canvas with gray frame (`bg-gray-50`)

### Accessibility
- Maintain sufficient color contrast
- Use clear, descriptive labels
- Provide both visual and textual feedback (determinant values)
- Ensure touch targets meet minimum size requirements (44px)

## Code Style and Patterns

### Component Structure
```typescript
interface ComponentProps {
  // Required props first
  matrix: number[][];
  onChange: (matrix: number[][]) => void;
  
  // Optional props with defaults
  size?: 2 | 3;
}

export function Component({ matrix, onChange, size = 2 }: ComponentProps) {
  // Validation
  // State management
  // Event handlers
  // Render
}
```

### State Management
- Use separate state for 2×2 and 3×3 matrices
- Maintain persistence when switching between matrix sizes
- Reset to identity matrix when appropriate
- Handle shape switching based on matrix dimensions

### Error Handling
- Validate all numerical inputs
- Provide fallbacks for invalid data
- Use TypeScript for compile-time safety
- Implement runtime checks for array bounds

## Performance Considerations

### Efficient Rendering
- Use `useEffect` with proper dependencies for shape updates
- Minimize SVG path recalculations
- Filter invalid points before rendering
- Optimize 3D wireframe generation

### Memory Management
- Avoid memory leaks in complex calculations
- Use appropriate data structures for point arrays
- Clean up event listeners and effects

## Mathematical Constants and Presets

### Common Transformations
```typescript
// Identity matrix (no transformation)
2D: [[1, 0], [0, 1]]
3D: [[1, 0, 0], [0, 1, 0], [0, 0, 1]]

// Rotation matrices (45° and 90°)
const cos45 = Math.cos(Math.PI / 4);
const sin45 = Math.sin(Math.PI / 4);

// Scaling matrices
scale2x: [[2, 0], [0, 2]]
scale0.5x: [[0.5, 0], [0, 0.5]]
```

### 3D Specific Rotations
```typescript
// Rotation around X-axis (90°)
[[1, 0, 0], [0, 0, -1], [0, 1, 0]]

// Rotation around Y-axis (90°)
[[0, 0, 1], [0, 1, 0], [-1, 0, 0]]
```

## Extensibility Guidelines

### Adding New Shapes
1. Define shape points in appropriate coordinate system
2. Add shape case to `getShapePoints()` function
3. Update shape selection UI in `Controls.tsx`
4. Test with various transformations

### Adding New Transformations
1. Define mathematical transformation matrix
2. Add preset button in `Controls.tsx`
3. Implement handler in `App.tsx`
4. Test edge cases and visual results

### Future Enhancements
- Animation between transformations
- Multiple shape support
- Custom matrix input validation
- Export/import functionality
- Step-by-step transformation breakdown

## Testing Guidelines

### Mathematical Accuracy
- Verify determinant calculations
- Test transformation correctness
- Validate edge cases (zero, negative determinants)
- Check inverse transformations

### Visual Validation
- Ensure shapes render correctly
- Verify coordinate system consistency
- Test responsive layout breakpoints
- Validate 3D projection accuracy

### User Experience
- Test all preset transformations
- Verify smooth matrix size switching
- Ensure input validation works
- Check mobile usability

## Maintenance Notes

### Dependencies
- Uses Tailwind CSS v4 for styling
- React hooks for state management
- TypeScript for type safety
- shadcn/ui components for consistent UI

### Browser Compatibility
- Modern browsers with SVG support
- Touch device compatibility
- Responsive design for various screen sizes

### Performance Monitoring
- Watch for rendering performance with complex 3D shapes
- Monitor memory usage during extended use
- Optimize calculations for real-time feedback
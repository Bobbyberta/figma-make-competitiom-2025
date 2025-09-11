# Vector Field Visualizer - Development Guidelines

## Project Overview
This is an interactive mathematical vector field visualization tool that displays vector fields on a canvas and allows users to add particles that follow the field flow with smooth animation and colorful trails. The application is built with React, TypeScript, and Canvas API with full mobile responsiveness.

## Architecture Principles

### Component Organization
- **Single Responsibility**: Each component has a focused purpose
  - `App.tsx`: Main application state and layout orchestration
  - `VectorFieldCanvas.tsx`: Canvas rendering and particle physics
  - `ControlPanel.tsx`: UI controls and parameter management
  - `VectorFieldEditor.tsx`: Mathematical equation input and validation
- **Separation of Concerns**: UI components are separate from rendering logic
- **State Management**: Use React's built-in state management with proper callback patterns

### File Structure Standards
- Keep components in `/components` directory
- Use shadcn/ui components from `/components/ui` 
- Main application logic in `App.tsx` with default export
- Shared types and interfaces defined within component files
- CSS variables and design tokens in `/styles/globals.css`

## Canvas and Performance Guidelines

### Canvas Rendering Best Practices
- **Device Pixel Ratio**: Always account for high-DPI displays by scaling canvas with `window.devicePixelRatio`
- **Animation Loop**: Use `requestAnimationFrame` with proper cleanup and 60fps throttling
- **Coordinate Systems**: Maintain separate world coordinates and canvas coordinates with conversion functions
- **Redraw Optimization**: Only force redraws when paused; let animation loop handle updates when playing

### Memory Management
- **Trail Limits**: Cap particle trails at reasonable lengths (200 points) to prevent memory leaks
- **Animation Cleanup**: Always cancel `requestAnimationFrame` in useEffect cleanup
- **Particle Removal**: Clean up particles that exit boundaries to prevent infinite growth

## Mathematical Expression Handling

### Security First
- **Sanitization**: Replace mathematical functions with `Math.*` equivalents
- **Validation**: Block dangerous patterns like `eval`, `Function`, `constructor`, `prototype`
- **Error Handling**: Gracefully handle invalid expressions with fallback to zero
- **Input Validation**: Validate expressions return numbers and handle NaN cases

### Expression Processing
```typescript
// Safe evaluation pattern
const evaluateExpression = (expression: string, x: number, y: number): number => {
  try {
    let expr = expression
      .replace(/\bx\b/g, x.toString())
      .replace(/\by\b/g, y.toString())
      .replace(/\^/g, '**')
      .replace(/sin/g, 'Math.sin')
      // ... other replacements
    
    // Security check before evaluation
    if (expr.includes('eval') || expr.includes('Function')) {
      return 0;
    }
    
    const result = Function('"use strict"; return (' + expr + ')')();
    return typeof result === 'number' && !isNaN(result) ? result : 0;
  } catch {
    return 0;
  }
};
```

## Mobile Responsiveness Standards

### Layout Patterns
- **Flexible Layout**: Use flexbox with proper ordering for mobile-first design
- **Touch Interactions**: Handle both mouse and touch events for canvas interactions
- **Scrolling**: Use `overscroll-contain` and `touch-pan-y` for proper mobile scrolling
- **Viewport Management**: Ensure proper canvas sizing across different screen sizes

### Control Panel Design
- **Collapsible Sections**: Use collapsible components to manage screen real estate
- **Touch Targets**: Ensure adequate spacing for touch interactions
- **Bottom Padding**: Provide sufficient padding to prevent content from being hidden behind mobile UI

## State Management Patterns

### Parameter Updates
- Use `useCallback` for stable function references
- Implement proper parameter validation and bounds checking
- Clear dependent state (like particles) when equations change

### Particle Management
- Use immutable updates for particle arrays
- Implement efficient particle removal without causing re-renders of other particles
- Batch updates when possible to minimize re-renders

## UI/UX Design Principles

### Interaction Design
- **Immediate Feedback**: Provide real-time validation for mathematical expressions
- **Clear Controls**: Use intuitive play/pause and clear buttons with proper icons
- **Progressive Disclosure**: Hide advanced options in collapsible sections
- **Error States**: Show clear error messages for invalid inputs

### Visual Hierarchy
- **Card-based Layout**: Group related controls in cards for better organization
- **Consistent Spacing**: Use design system spacing tokens (space-y-3, space-y-4)
- **Color Coding**: Use semantic colors (destructive for errors, primary for actions)

## Performance Optimization

### Canvas Performance
- **Efficient Drawing**: Minimize canvas operations and batch drawing calls
- **Trail Optimization**: Limit trail lengths and use efficient trail rendering
- **Boundary Checking**: Remove off-screen particles to reduce computational load

### React Performance
- **Memo Optimization**: Use `useCallback` and `useMemo` appropriately for expensive operations
- **State Updates**: Batch state updates and avoid unnecessary re-renders
- **Component Splitting**: Keep heavy canvas logic separate from UI components

## Error Handling and Validation

### Input Validation
- **Real-time Validation**: Validate mathematical expressions as users type
- **Visual Feedback**: Use border colors and error messages to indicate invalid inputs
- **Graceful Degradation**: Continue operation with default values when inputs are invalid

### Boundary Conditions
- **Domain Limits**: Enforce reasonable limits on coordinate ranges
- **Particle Limits**: Handle edge cases like particles reaching boundaries
- **Expression Limits**: Handle division by zero and other mathematical edge cases

## Code Quality Standards

### TypeScript Usage
- **Strict Types**: Use proper TypeScript interfaces for all component props
- **Type Safety**: Avoid `any` types; use proper type definitions
- **Interface Consistency**: Maintain consistent interfaces across components

### Code Organization
- **Pure Functions**: Keep mathematical calculations as pure functions
- **Side Effect Management**: Properly manage side effects in useEffect hooks
- **Code Reusability**: Extract common functionality into reusable functions

## Testing Considerations

### Mathematical Accuracy
- Test vector field calculations with known mathematical functions
- Verify coordinate transformations between world and canvas space
- Validate particle physics and boundary detection

### User Interactions
- Test canvas interactions on both mouse and touch devices
- Verify control panel functionality across different screen sizes
- Test mathematical expression validation with various inputs

## Accessibility Guidelines

### Keyboard Navigation
- Ensure all controls are keyboard accessible
- Provide proper focus management for collapsible sections
- Use semantic HTML elements where appropriate

### Screen Reader Support
- Provide meaningful labels for all form controls
- Use proper heading hierarchy for content organization
- Include alternative text for visual elements where applicable

## Future Enhancement Patterns

### Extensibility
- **Plugin Architecture**: Design for easy addition of new vector field presets
- **Export Functionality**: Structure for potential image/animation export features
- **Advanced Math**: Framework for supporting more complex mathematical functions

### Performance Scaling
- **WebGL Migration**: Structure allows for future WebGL implementation for better performance
- **Web Workers**: Canvas calculations could be moved to web workers for heavy computations
- **Virtualization**: For handling large numbers of particles efficiently

## Dependencies and Libraries

### Core Dependencies
- React with TypeScript for component architecture
- shadcn/ui for consistent UI components
- Tailwind CSS v4 for styling system
- Lucide React for icons

### Canvas Considerations
- Use native Canvas API for maximum performance and control
- Avoid heavy graphics libraries unless absolutely necessary
- Maintain direct control over rendering pipeline for mathematical accuracy
# Fractal Explorer - Complete Application Recreation Prompt

## Project Overview

Create a comprehensive fractal simulation application called "Fractal Explorer" that renders interactive mathematical fractals in real-time. The application should be a modern, responsive web app built with React and TypeScript, featuring both desktop and mobile-optimized interfaces.

## Technical Stack Requirements

- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: shadcn/ui component library
- **Canvas Rendering**: HTML5 Canvas API for fractal visualization
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **State Management**: React hooks (useState, useCallback, useRef)

## Core Features & Functionality

### 1. Fractal Types
Implement five distinct fractal types, each with specialized mathematics:

1. **Mandelbrot Set**
   - Classic fractal: z = z² + c
   - Parameters: zoom, center coordinates, max iterations, escape radius

2. **Julia Set**
   - Variant: z = z² + c (with fixed c parameter)
   - Parameters: zoom, center coordinates, max iterations, escape radius, complex constant (cx, cy)

3. **Burning Ship**
   - Modified formula: z = (|Re(z)| + i|Im(z)|)² + c
   - Parameters: zoom, center coordinates, max iterations, escape radius

4. **Newton Fractal**
   - Root-finding algorithm visualization
   - Parameters: zoom, center coordinates, max iterations, convergence threshold

5. **Tricorn (Mandelbar)**
   - Conjugate variant: z = z̄² + c
   - Parameters: zoom, center coordinates, max iterations, escape radius

### 2. Interactive Controls

**Canvas Interactions:**
- Mouse drag to pan the fractal view
- Mouse wheel scroll to zoom in/out
- Touch drag for mobile panning
- Pinch-to-zoom for mobile devices
- Real-time parameter updates during interaction

**Configuration Interface:**
- Fractal type selection dropdown
- Parameter sliders with real-time preview
- Color palette selector with predefined schemes
- Animation controls (play/pause, speed adjustment)
- Reset to default settings
- Preset fractal variations

### 3. Responsive Design

**Desktop Layout (≥768px):**
- Split layout: main canvas area + right sidebar configuration panel
- Canvas: up to 800x600px, centered in main area
- Sidebar: 320px wide, fixed position with scroll
- Full parameter controls visible
- Keyboard shortcuts support

**Mobile Layout (<768px):**
- Single-column stacked layout
- Canvas: responsive size (max 400x400px)
- Bottom sheet configuration panel (80vh height)
- Compact mobile controls bar
- Touch-optimized interactions

### 4. Configuration System

**Parameter Controls:**
- Zoom level (logarithmic scale)
- Center coordinates (X, Y)
- Maximum iterations (performance vs quality)
- Escape radius (for escape-time fractals)
- Fractal-specific parameters (Julia constant, etc.)

**Visual Customization:**
- Color palettes: Vibrant, Monochrome, Sunset, Ocean, Fire
- Color cycling/shifting options
- Gradient interpolation methods

**Animation System:**
- Parameter interpolation over time
- Zoom animations
- Parameter cycling (Julia constant, color shifts)
- Animation speed control
- Play/pause functionality

### 5. Information & Education

**Fractal Information Panel:**
- Expandable section within configuration
- Mathematical description for each fractal type
- Historical context and discovery information
- Parameter explanations
- Visual examples and variations

## Technical Implementation Requirements

### Component Architecture

**Main Components:**
1. `App.tsx` - Root component with layout management
2. `FractalCanvas.tsx` - Canvas rendering and interaction handling
3. `ConfigPanel.tsx` - Parameter configuration interface
4. `MobileControls.tsx` - Mobile-specific control buttons
5. `FractalAnimator.tsx` - Animation system management

**Type System:**
- Comprehensive TypeScript interfaces for all fractal configurations
- Type-safe parameter validation
- Default configuration constants
- Fractal variation presets

**Utility Functions:**
- Mathematical computation helpers
- Canvas drawing optimizations
- Color interpolation functions
- Mobile/desktop detection hook

### Canvas Rendering

**Performance Optimizations:**
- Web Workers for computation (if needed)
- Efficient pixel manipulation
- Debounced parameter updates
- Optimized rendering loops

**Mathematical Accuracy:**
- High-precision floating-point calculations
- Proper complex number arithmetic
- Numerical stability considerations
- Iteration limit optimization

### Color System Implementation

**Palette Options:**
- Vibrant: HSL color cycling through spectrum
- Monochrome: Grayscale gradient
- Sunset: Warm orange/red/purple gradient
- Ocean: Blue/cyan/teal gradient
- Fire: Red/orange/yellow gradient

**Color Mapping:**
- Escape-time to color mapping
- Smooth color transitions
- Customizable color intensity
- Gradient interpolation

### State Management

**Global State:**
- Current fractal configuration
- Animation state and parameters
- UI state (mobile panel visibility)
- Canvas interaction state

**Performance Considerations:**
- Memoized callback functions
- Optimized re-render prevention
- Efficient state updates
- Canvas reference management

## UI/UX Design Requirements

### Design System

**Color Tokens:**
```css
/* Light Theme */
--background: #ffffff
--foreground: oklch(0.145 0 0)
--primary: #030213
--secondary: oklch(0.95 0.0058 264.53)
--muted: #ececf0
--border: rgba(0, 0, 0, 0.1)

/* Dark Theme Support */
--background: oklch(0.145 0 0)
--foreground: oklch(0.985 0 0)
/* ... additional dark theme tokens */
```

**Typography:**
- Base font size: 16px
- Heading weights: medium (500)
- Body text: normal (400)
- Consistent line height: 1.5

**Spacing & Layout:**
- Border radius: 0.625rem
- Consistent gap spacing
- Responsive padding/margins

### Component Styling

**shadcn/ui Components Used:**
- Button, Card, Sheet (mobile bottom sheet)
- Slider, Select, Switch, Tabs
- Collapsible, Separator, Label
- Tooltip for enhanced UX

**Custom Styling:**
- Canvas container with proper aspect ratio
- Responsive grid layouts
- Mobile-first breakpoints
- Touch-friendly interactive elements

### Accessibility Features

- Proper ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- High contrast color options
- Focus management
- Semantic HTML structure

## File Structure

```
├── App.tsx                          # Main application component
├── components/
│   ├── FractalCanvas.tsx            # Canvas rendering component
│   ├── ConfigPanel.tsx              # Configuration interface
│   ├── MobileControls.tsx           # Mobile control buttons
│   ├── FractalAnimator.tsx          # Animation system
│   ├── types/
│   │   └── FractalTypes.ts          # TypeScript type definitions
│   └── ui/                          # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── sheet.tsx
│       ├── slider.tsx
│       ├── select.tsx
│       ├── switch.tsx
│       ├── tabs.tsx
│       ├── collapsible.tsx
│       ├── separator.tsx
│       ├── label.tsx
│       ├── tooltip.tsx
│       └── use-mobile.ts            # Mobile detection hook
└── styles/
    └── globals.css                  # Tailwind v4 global styles
```

## Implementation Guidelines

### Mathematical Implementation

**Complex Number Operations:**
- Implement proper complex arithmetic for each fractal type
- Handle numerical precision and overflow
- Optimize iteration loops for performance
- Use appropriate escape conditions

**Fractal-Specific Algorithms:**
- Mandelbrot: Standard escape-time algorithm
- Julia: Fixed parameter variation
- Burning Ship: Absolute value modification
- Newton: Root-finding with derivative approximation
- Tricorn: Complex conjugate implementation

### Rendering Optimization

**Canvas Performance:**
- Use ImageData for direct pixel manipulation
- Implement efficient coordinate transformations
- Cache calculations where possible
- Optimize color interpolation

**Interaction Handling:**
- Smooth pan/zoom transitions
- Responsive parameter updates
- Debounced heavy computations
- Touch event optimization for mobile

### Animation System

**Parameter Interpolation:**
- Smooth transitions between states
- Configurable animation duration
- Easing functions for natural motion
- Real-time parameter updates

**Performance Management:**
- RequestAnimationFrame for smooth rendering
- Pause/resume capability
- Performance monitoring
- Memory leak prevention

## User Experience Goals

1. **Intuitive Exploration**: Users should easily discover and manipulate fractal parameters
2. **Educational Value**: Provide mathematical context and learning opportunities
3. **Visual Appeal**: Beautiful, high-quality fractal rendering with appealing color schemes
4. **Performance**: Smooth interactions on both desktop and mobile devices
5. **Accessibility**: Inclusive design supporting various user needs and devices

## Quality Standards

- **Code Quality**: TypeScript strict mode, proper error handling, comprehensive comments
- **Performance**: 60fps interactions, optimized rendering, memory efficiency
- **Responsiveness**: Seamless experience across device sizes
- **Browser Support**: Modern browsers with Canvas API support
- **Maintainability**: Modular architecture, reusable components, clear separation of concerns

## Expected Deliverables

A complete, production-ready fractal exploration application with:
- All five fractal types fully implemented
- Responsive design working on desktop and mobile
- Complete configuration system with real-time updates
- Animation capabilities with user controls
- Educational information about each fractal type
- Modern, accessible user interface using shadcn/ui
- Comprehensive TypeScript type safety
- Optimized performance and smooth interactions

This application should serve as both an educational tool for understanding fractals and an engaging interactive experience for users to explore mathematical beauty.
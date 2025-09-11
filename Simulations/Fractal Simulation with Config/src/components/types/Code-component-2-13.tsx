export type FractalType = 'mandelbrot' | 'julia';

export type ColorPalette = 'classic' | 'fire' | 'ocean' | 'grayscale';

export interface ComplexNumber {
  real: number;
  imaginary: number;
}

export interface FractalConfig {
  fractalType: FractalType;
  centerX: number;
  centerY: number;
  zoom: number;
  maxIterations: number;
  colorPalette: ColorPalette;
  juliaC: ComplexNumber;
  animate: boolean;
  animationSpeed: number;
}

export interface FractalPreset {
  name: string;
  description: string;
  config: FractalConfig;
}

export const DEFAULT_CONFIG: FractalConfig = {
  fractalType: 'mandelbrot',
  centerX: -0.5,
  centerY: 0,
  zoom: 1,
  maxIterations: 100,
  colorPalette: 'classic',
  juliaC: { real: -0.7, imaginary: 0.27 },
  animate: false,
  animationSpeed: 1
};

export const FRACTAL_PRESETS: FractalPreset[] = [
  {
    name: 'Classic Mandelbrot',
    description: 'The iconic Mandelbrot set view',
    config: {
      ...DEFAULT_CONFIG,
      fractalType: 'mandelbrot',
      centerX: -0.5,
      centerY: 0,
      zoom: 1
    }
  },
  {
    name: 'Mandelbrot Detail',
    description: 'Zoomed into an interesting region',
    config: {
      ...DEFAULT_CONFIG,
      fractalType: 'mandelbrot',
      centerX: -0.7529,
      centerY: 0.1102,
      zoom: 50,
      maxIterations: 200
    }
  },
  {
    name: 'Julia Set - Rabbit',
    description: 'Classic Julia set resembling a rabbit',
    config: {
      ...DEFAULT_CONFIG,
      fractalType: 'julia',
      centerX: 0,
      centerY: 0,
      zoom: 1,
      juliaC: { real: -0.123, imaginary: 0.745 }
    }
  },
  {
    name: 'Julia Set - Dragon',
    description: 'Julia set with dragon-like appearance',
    config: {
      ...DEFAULT_CONFIG,
      fractalType: 'julia',
      centerX: 0,
      centerY: 0,
      zoom: 1,
      juliaC: { real: -0.8, imaginary: 0.156 }
    }
  },
  {
    name: 'Fire Mandelbrot',
    description: 'Mandelbrot set with fire color palette',
    config: {
      ...DEFAULT_CONFIG,
      fractalType: 'mandelbrot',
      centerX: -0.5,
      centerY: 0,
      zoom: 1,
      colorPalette: 'fire'
    }
  },
  {
    name: 'Ocean Julia',
    description: 'Julia set with ocean color palette',
    config: {
      ...DEFAULT_CONFIG,
      fractalType: 'julia',
      centerX: 0,
      centerY: 0,
      zoom: 1,
      juliaC: { real: -0.7, imaginary: 0.27 },
      colorPalette: 'ocean'
    }
  }
];
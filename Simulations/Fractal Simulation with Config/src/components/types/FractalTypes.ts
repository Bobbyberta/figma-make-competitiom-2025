export type FractalType = 'mandelbrot' | 'julia' | 'burning-ship' | 'newton' | 'tricorn';

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
  newtonRoot: number;
  animate: boolean;
  animationPaused: boolean;
  animationSpeed: number;
  animationMinIterations: number;
  animationMaxIterations: number;
}

export interface FractalVariation {
  name: string;
  description: string;
  config: Partial<FractalConfig>;
}

export const DEFAULT_CONFIG: FractalConfig = {
  fractalType: 'julia',
  centerX: 0,
  centerY: 0,
  zoom: 1,
  maxIterations: 100,
  colorPalette: 'ocean',
  juliaC: { real: -0.7, imaginary: 0.27 },
  newtonRoot: 3,
  animate: true,
  animationPaused: false,
  animationSpeed: 1,
  animationMinIterations: 100,
  animationMaxIterations: 400
};

export const FRACTAL_VARIATIONS: Record<FractalType, FractalVariation[]> = {
  mandelbrot: [
    {
      name: 'Classic',
      description: 'The iconic Mandelbrot set view',
      config: {
        centerX: -0.5,
        centerY: 0,
        zoom: 1,
        maxIterations: 100,
        colorPalette: 'ocean'
      }
    },
    {
      name: 'Seahorse Valley',
      description: 'Beautiful seahorse-like formations',
      config: {
        centerX: -0.7529,
        centerY: 0.1102,
        zoom: 50,
        maxIterations: 200,
        colorPalette: 'ocean'
      }
    },
    {
      name: 'Lightning',
      description: 'Electric lightning patterns',
      config: {
        centerX: -1.25066,
        centerY: 0.02012,
        zoom: 100,
        maxIterations: 300,
        colorPalette: 'fire'
      }
    },
    {
      name: 'Spiral',
      description: 'Mesmerizing spiral formations',
      config: {
        centerX: -0.8,
        centerY: 0.156,
        zoom: 5,
        maxIterations: 150,
        colorPalette: 'classic'
      }
    }
  ],
  julia: [
    {
      name: 'Original',
      description: 'Classic Julia set configuration',
      config: {
        centerX: 0,
        centerY: 0,
        zoom: 1,
        juliaC: { real: -0.7, imaginary: 0.27 },
        colorPalette: 'ocean'
      }
    },
    {
      name: 'Rabbit',
      description: 'Julia set resembling a rabbit',
      config: {
        centerX: 0,
        centerY: 0,
        zoom: 1,
        juliaC: { real: -0.123, imaginary: 0.745 },
        colorPalette: 'classic'
      }
    },
    {
      name: 'Dragon',
      description: 'Dragon-like Julia set',
      config: {
        centerX: 0,
        centerY: 0,
        zoom: 1,
        juliaC: { real: -0.8, imaginary: 0.156 },
        colorPalette: 'fire'
      }
    },
    {
      name: 'Spiral',
      description: 'Spiral arms Julia set',
      config: {
        centerX: 0,
        centerY: 0,
        zoom: 1,
        juliaC: { real: -0.4, imaginary: 0.6 },
        colorPalette: 'ocean'
      }
    },
    {
      name: 'Fireworks',
      description: 'Explosive firework patterns',
      config: {
        centerX: 0,
        centerY: 0,
        zoom: 1,
        juliaC: { real: -0.162, imaginary: 1.04 },
        colorPalette: 'fire'
      }
    }
  ],
  'burning-ship': [
    {
      name: 'Classic Ship',
      description: 'The famous burning ship',
      config: {
        centerX: -0.5,
        centerY: -0.6,
        zoom: 1,
        maxIterations: 100,
        colorPalette: 'fire'
      }
    },
    {
      name: 'Ship Detail',
      description: 'Intricate ship structure detail',
      config: {
        centerX: -1.762,
        centerY: -0.028,
        zoom: 100,
        maxIterations: 200,
        colorPalette: 'fire'
      }
    },
    {
      name: 'Ocean Waves',
      description: 'Wave-like patterns in ocean colors',
      config: {
        centerX: -1.8,
        centerY: -0.05,
        zoom: 20,
        maxIterations: 150,
        colorPalette: 'ocean'
      }
    }
  ],
  newton: [
    {
      name: 'Cubic Roots',
      description: 'Newton fractal for cubic equation',
      config: {
        centerX: 0,
        centerY: 0,
        zoom: 1,
        newtonRoot: 3,
        maxIterations: 50,
        colorPalette: 'classic'
      }
    },
    {
      name: 'Fourth Order',
      description: 'Fourth-order polynomial roots',
      config: {
        centerX: 0,
        centerY: 0,
        zoom: 1,
        newtonRoot: 4,
        maxIterations: 50,
        colorPalette: 'ocean'
      }
    },
    {
      name: 'Fifth Order',
      description: 'Fifth-order polynomial complexity',
      config: {
        centerX: 0,
        centerY: 0,
        zoom: 1,
        newtonRoot: 5,
        maxIterations: 75,
        colorPalette: 'fire'
      }
    },
    {
      name: 'High Order',
      description: 'Complex high-order patterns',
      config: {
        centerX: 0,
        centerY: 0,
        zoom: 1,
        newtonRoot: 7,
        maxIterations: 100,
        colorPalette: 'classic'
      }
    }
  ],
  tricorn: [
    {
      name: 'Classic Tricorn',
      description: 'The standard Tricorn fractal',
      config: {
        centerX: 0,
        centerY: 0,
        zoom: 1,
        maxIterations: 100,
        colorPalette: 'classic'
      }
    },
    {
      name: 'Tricorn Detail',
      description: 'Detailed view of Tricorn structure',
      config: {
        centerX: -0.5,
        centerY: -0.5,
        zoom: 5,
        maxIterations: 200,
        colorPalette: 'ocean'
      }
    },
    {
      name: 'Fire Tricorn',
      description: 'Tricorn with fiery appearance',
      config: {
        centerX: 0,
        centerY: 0,
        zoom: 1,
        maxIterations: 150,
        colorPalette: 'fire'
      }
    }
  ]
};
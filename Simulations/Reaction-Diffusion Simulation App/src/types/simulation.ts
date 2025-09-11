export type PatternType = 'coral' | 'spots' | 'zebra' | 'maze' | 'waves' | 'spirals' | 'unstable';
export type ColorScheme = 'classic' | 'ocean' | 'fire' | 'forest' | 'plasma' | 'sunset' | 'monochrome';
export type ResolutionQuality = 'low' | 'medium' | 'high' | 'ultra';

export interface SimulationParams {
  pattern: PatternType;
  colorScheme: ColorScheme;
  feedRate: number;
  killRate: number;
  diffusionA: number;
  diffusionB: number;
  resolution: ResolutionQuality;
  animationDuration: number; // in seconds, 0 means infinite
}

export interface CanvasDimensions {
  width: number;
  height: number;
}

export interface PatternPreset {
  name: string;
  description: string;
  feedRate: number;
  killRate: number;
}

export interface ColorGradient {
  name: string;
  colors: [number, number, number][];
}

export interface ResolutionSetting {
  name: string;
  description: string;
  scale: number;
  performance: string;
}

export const PATTERN_PRESETS: Record<PatternType, PatternPreset> = {
  coral: {
    name: 'Coral',
    description: 'Single central circular growth pattern',
    feedRate: 0.055,
    killRate: 0.062
  },
  spots: {
    name: 'Spots',
    description: 'Multiple small circular formations',
    feedRate: 0.030,
    killRate: 0.057
  },
  zebra: {
    name: 'Zebra',
    description: 'Vertical stripe patterns',
    feedRate: 0.026,
    killRate: 0.051
  },
  maze: {
    name: 'Maze',
    description: 'Intricate labyrinth structures',
    feedRate: 0.029,
    killRate: 0.057
  },
  waves: {
    name: 'Waves',
    description: 'Oscillating wave formations',
    feedRate: 0.014,
    killRate: 0.045
  },
  spirals: {
    name: 'Spirals',
    description: 'Rotating spiral patterns',
    feedRate: 0.018,
    killRate: 0.051
  },
  unstable: {
    name: 'Unstable',
    description: 'Chaotic irregular patterns',
    feedRate: 0.026,
    killRate: 0.055
  }
};

export const COLOR_GRADIENTS: Record<ColorScheme, ColorGradient> = {
  classic: {
    name: 'Classic',
    colors: [[0, 0, 0], [255, 0, 0], [255, 255, 0], [255, 255, 255]]
  },
  ocean: {
    name: 'Ocean',
    colors: [[0, 0, 32], [0, 64, 128], [0, 128, 255], [128, 255, 255]]
  },
  fire: {
    name: 'Fire',
    colors: [[16, 0, 0], [128, 0, 0], [255, 64, 0], [255, 255, 128]]
  },
  forest: {
    name: 'Forest',
    colors: [[0, 16, 0], [0, 64, 0], [64, 128, 32], [128, 255, 64]]
  },
  plasma: {
    name: 'Plasma',
    colors: [[64, 0, 128], [128, 0, 255], [255, 64, 128], [255, 255, 64]]
  },
  sunset: {
    name: 'Sunset',
    colors: [[32, 0, 64], [128, 32, 0], [255, 128, 0], [255, 255, 128]]
  },
  monochrome: {
    name: 'Monochrome',
    colors: [[0, 0, 0], [64, 64, 64], [128, 128, 128], [255, 255, 255]]
  }
};

export const RESOLUTION_SETTINGS: Record<ResolutionQuality, ResolutionSetting> = {
  low: {
    name: 'Low (25%)',
    description: 'Pixelated rendering for performance',
    scale: 0.25,
    performance: 'Best performance, visible pixels'
  },
  medium: {
    name: 'Medium (50%)',
    description: 'Balanced quality and performance',
    scale: 0.5,
    performance: 'Good performance, some scaling artifacts'
  },
  high: {
    name: 'High (100%)',
    description: 'Full resolution rendering',
    scale: 1.0,
    performance: 'Moderate performance, crisp details'
  },
  ultra: {
    name: 'Ultra (150%)',
    description: 'Enhanced detail rendering',
    scale: 1.5,
    performance: 'Reduced performance, maximum detail'
  }
};

export const ANIMATION_DURATIONS = [
  { value: 0, label: 'Infinite', description: 'Animation runs continuously' },
  { value: 5, label: '5 seconds', description: 'Short preview animation' },
  { value: 10, label: '10 seconds', description: 'Quick pattern development' },
  { value: 30, label: '30 seconds', description: 'Medium evolution time' },
  { value: 60, label: '1 minute', description: 'Full pattern maturation' },
  { value: 120, label: '2 minutes', description: 'Extended development' },
  { value: 300, label: '5 minutes', description: 'Long evolution cycle' }
];
export enum TerrainType {
  SEA = 'sea',
  LAND = 'land',
  MOUNTAIN = 'mountain',
  FOREST = 'forest',
  DESERT = 'desert'
}

export interface TerrainCell {
  type: TerrainType;
  elevation: number;
  rainIntensity: number;
  humidity: number;
  precipitationDensity: number;
  pressure: number;
}

export interface PrecipitationField {
  density: number[][];
  windVelocityX: number[][];
  windVelocityY: number[][];
  moistureField: number[][];
  pressureField: number[][];
}

export interface SimulationState {
  isRunning: boolean;
  speed: number;
  time: number;
  grid: TerrainCell[][];
  precipitationField: PrecipitationField;
}
export interface SimulationParams {
  // Flock Behavior
  birdCount: number;
  maxSpeed: number;
  maxForce: number;
  visionRange: number;
  birdSize: number;

  // Separation
  separationDistance: number;
  separationForce: number;

  // Alignment
  alignmentDistance: number;
  alignmentForce: number;

  // Cohesion
  cohesionDistance: number;
  cohesionForce: number;

  // Predators
  predatorCount: number;
  avoidanceDistance: number;
  avoidanceForce: number;
  predatorSpeed: number;
  predatorSize: number;
  huntRange: number;
  wanderStrength: number;
  captureDistance: number;
  feedingTime: number;

  // Trees
  treeCount: number;
  attractionDistance: number;
  attractionForce: number;

  // Environment
  boundaryForce: number;
  animationSpeed: number;
  trailLength: number;

  // Visual Debug
  showVisionRange: boolean;
  showForces: boolean;
  showStats: boolean;
}

export const defaultParams: SimulationParams = {
  // Flock Behavior
  birdCount: 100,
  maxSpeed: 3,
  maxForce: 0.1,
  visionRange: 50,
  birdSize: 3,

  // Separation
  separationDistance: 25,
  separationForce: 1.5,

  // Alignment
  alignmentDistance: 50,
  alignmentForce: 1,

  // Cohesion
  cohesionDistance: 50,
  cohesionForce: 1,

  // Predators
  predatorCount: 2,
  avoidanceDistance: 80,
  avoidanceForce: 3,
  predatorSpeed: 4,
  predatorSize: 8,
  huntRange: 100,
  wanderStrength: 0.5,
  captureDistance: 15,
  feedingTime: 3,

  // Trees
  treeCount: 3,
  attractionDistance: 150,
  attractionForce: 0.3,

  // Environment
  boundaryForce: 1,
  animationSpeed: 1,
  trailLength: 10,

  // Visual Debug
  showVisionRange: false,
  showForces: false,
  showStats: true,
};
import { Vector2 } from './Vector2';
import { Bird } from './Bird';
import { SimulationParams } from './SimulationParams';

export class Tree {
  position: Vector2;
  spawnCooldown: number = 0;
  lastSpawnTime: number = 0;
  id: string;

  constructor(x: number, y: number) {
    this.position = new Vector2(x, y);
    this.id = Math.random().toString(36).substr(2, 9);
  }

  update(birds: Bird[], params: SimulationParams, deltaTime: number): Bird | null {
    this.spawnCooldown -= deltaTime;

    // Spawn new birds if population is low
    if (birds.length < params.birdCount && this.spawnCooldown <= 0) {
      this.spawnCooldown = 3; // 3 second cooldown between spawns
      return this.spawnBird();
    }

    return null;
  }

  spawnBird(): Bird {
    // Spawn bird near the tree with some randomness
    const angle = Math.random() * Math.PI * 2;
    const distance = 20 + Math.random() * 30;
    const spawnX = this.position.x + Math.cos(angle) * distance;
    const spawnY = this.position.y + Math.sin(angle) * distance;
    
    return new Bird(spawnX, spawnY);
  }

  render(ctx: CanvasRenderingContext2D, params: SimulationParams) {
    const baseSize = 30;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);

    // Attraction range (debug)
    if (params.showVisionRange) {
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, params.attractionDistance, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Tree trunk
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-baseSize * 0.15, 0, baseSize * 0.3, baseSize * 0.8);

    // Tree canopy - main circle
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.arc(0, -baseSize * 0.2, baseSize * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Additional canopy layers for depth
    ctx.fillStyle = '#32CD32';
    ctx.beginPath();
    ctx.arc(-baseSize * 0.2, -baseSize * 0.3, baseSize * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(baseSize * 0.15, -baseSize * 0.1, baseSize * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Leaves details
    ctx.fillStyle = '#90EE90';
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const leafX = Math.cos(angle) * baseSize * 0.4;
      const leafY = Math.sin(angle) * baseSize * 0.4 - baseSize * 0.2;
      
      ctx.beginPath();
      ctx.arc(leafX, leafY, baseSize * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tree shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.ellipse(0, baseSize * 0.8, baseSize * 0.8, baseSize * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Spawn indicator when ready to spawn
    if (this.spawnCooldown <= 0) {
      const pulseAlpha = 0.3 + Math.sin(Date.now() * 0.01) * 0.2;
      ctx.fillStyle = `rgba(255, 215, 0, ${pulseAlpha})`;
      ctx.beginPath();
      ctx.arc(0, -baseSize * 0.2, baseSize * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
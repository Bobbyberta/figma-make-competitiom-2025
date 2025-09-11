import { Vector2 } from './Vector2';
import { Bird } from './Bird';
import { SimulationParams } from './SimulationParams';

export type PredatorState = 'wandering' | 'hunting' | 'feeding' | 'resting';

export class Predator {
  position: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  state: PredatorState = 'wandering';
  target: Bird | null = null;
  capturedBirds: number = 0;
  stateTimer: number = 0;
  wanderAngle: number = Math.random() * Math.PI * 2;
  wingPhase: number = Math.random() * Math.PI * 2;
  id: string;

  constructor(x: number, y: number) {
    this.position = new Vector2(x, y);
    this.velocity = Vector2.random().multiply(2);
    this.acceleration = Vector2.zero();
    this.id = Math.random().toString(36).substr(2, 9);
  }

  update(birds: Bird[], params: SimulationParams, canvasWidth: number, canvasHeight: number, deltaTime: number) {
    this.stateTimer += deltaTime;

    switch (this.state) {
      case 'wandering':
        this.wander(params);
        this.checkForPrey(birds, params);
        break;
      case 'hunting':
        this.hunt(birds, params);
        break;
      case 'feeding':
        this.feed(params);
        break;
      case 'resting':
        this.rest(params);
        break;
    }

    // Apply boundary avoidance
    const boundary = this.avoidBoundaries(canvasWidth, canvasHeight, params);
    this.acceleration = this.acceleration.add(boundary);

    // Update motion
    this.velocity = this.velocity.add(this.acceleration);
    const maxSpeed = this.state === 'hunting' ? params.predatorSpeed * 1.5 : params.predatorSpeed;
    this.velocity = this.velocity.limit(maxSpeed);
    this.position = this.position.add(this.velocity.multiply(params.animationSpeed));
    this.acceleration = Vector2.zero();

    // Update wing animation
    this.wingPhase += this.velocity.magnitude() * 0.2;

    // Wrap around screen
    this.wrapAroundScreen(canvasWidth, canvasHeight);
  }

  wander(params: SimulationParams) {
    // Random wander behavior
    this.wanderAngle += (Math.random() - 0.5) * 0.3;
    const wanderForce = Vector2.fromAngle(this.wanderAngle, params.wanderStrength);
    this.acceleration = this.acceleration.add(wanderForce);
  }

  checkForPrey(birds: Bird[], params: SimulationParams) {
    let closest: Bird | null = null;
    let minDistance = params.huntRange;

    for (const bird of birds) {
      const distance = this.position.distance(bird.position);
      if (distance < minDistance) {
        closest = bird;
        minDistance = distance;
      }
    }

    if (closest) {
      this.target = closest;
      this.state = 'hunting';
      this.stateTimer = 0;
    }
  }

  hunt(birds: Bird[], params: SimulationParams) {
    if (!this.target || !birds.includes(this.target)) {
      this.state = 'wandering';
      this.target = null;
      return;
    }

    // Pursue the target
    const seek = this.seek(this.target.position, params);
    this.acceleration = this.acceleration.add(seek.multiply(3));

    // Check for capture
    const distance = this.position.distance(this.target.position);
    if (distance < params.captureDistance) {
      this.capture(this.target, birds, params);
    }

    // Give up if too far or hunting too long
    if (distance > params.huntRange * 1.5 || this.stateTimer > 10) {
      this.state = 'wandering';
      this.target = null;
    }
  }

  capture(bird: Bird, birds: Bird[], params: SimulationParams) {
    const index = birds.indexOf(bird);
    if (index > -1) {
      birds.splice(index, 1);
      this.capturedBirds++;
      this.state = 'feeding';
      this.stateTimer = 0;
      this.target = null;
    }
  }

  feed(params: SimulationParams) {
    // Stay stationary while feeding
    this.velocity = this.velocity.multiply(0.8);
    
    if (this.stateTimer > params.feedingTime) {
      this.state = 'resting';
      this.stateTimer = 0;
    }
  }

  rest(params: SimulationParams) {
    // Brief rest period
    this.velocity = this.velocity.multiply(0.9);
    
    if (this.stateTimer > 1) {
      this.state = 'wandering';
      this.stateTimer = 0;
    }
  }

  seek(target: Vector2, params: SimulationParams): Vector2 {
    let desired = target.subtract(this.position);
    desired = desired.normalize();
    desired = desired.multiply(params.maxSpeed);
    
    const steer = desired.subtract(this.velocity);
    return steer.limit(params.maxForce * 2);
  }

  avoidBoundaries(width: number, height: number, params: SimulationParams): Vector2 {
    const margin = 30;
    let steer = Vector2.zero();

    if (this.position.x < margin) {
      steer = steer.add(new Vector2(params.predatorSpeed, this.velocity.y));
    }
    if (this.position.x > width - margin) {
      steer = steer.add(new Vector2(-params.predatorSpeed, this.velocity.y));
    }
    if (this.position.y < margin) {
      steer = steer.add(new Vector2(this.velocity.x, params.predatorSpeed));
    }
    if (this.position.y > height - margin) {
      steer = steer.add(new Vector2(this.velocity.x, -params.predatorSpeed));
    }

    return steer.limit(params.maxForce);
  }

  wrapAroundScreen(width: number, height: number) {
    if (this.position.x < -20) this.position.x = width + 20;
    if (this.position.x > width + 20) this.position.x = -20;
    if (this.position.y < -20) this.position.y = height + 20;
    if (this.position.y > height + 20) this.position.y = -20;
  }

  render(ctx: CanvasRenderingContext2D, params: SimulationParams) {
    const angle = this.velocity.heading();
    const size = params.predatorSize;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(angle);

    // Hunt range (debug)
    if (params.showVisionRange && this.state === 'hunting') {
      ctx.save();
      ctx.rotate(-angle);
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, params.huntRange, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Target line
    if (this.target && params.showForces) {
      ctx.save();
      ctx.rotate(-angle);
      ctx.translate(-this.position.x, -this.position.y);
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.position.x, this.position.y);
      ctx.lineTo(this.target.position.x, this.target.position.y);
      ctx.stroke();
      ctx.restore();
    }

    // Predator body - larger and more aggressive
    const colors = {
      wandering: '#e74c3c',
      hunting: '#c0392b',
      feeding: '#e67e22',
      resting: '#8e44ad'
    };
    
    ctx.fillStyle = colors[this.state];
    ctx.beginPath();
    ctx.moveTo(size * 1.8, 0);
    ctx.lineTo(-size * 0.8, -size * 0.8);
    ctx.lineTo(-size * 0.4, 0);
    ctx.lineTo(-size * 0.8, size * 0.8);
    ctx.closePath();
    ctx.fill();

    // Animated wings - more aggressive
    const wingFlap = Math.sin(this.wingPhase) * 0.4;
    ctx.strokeStyle = colors[this.state];
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-size * 0.4, -size * 0.5);
    ctx.lineTo(-size * 1.5, -size * (1.2 + wingFlap));
    ctx.moveTo(-size * 0.4, size * 0.5);
    ctx.lineTo(-size * 1.5, size * (1.2 + wingFlap));
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(size * 0.5, -size * 0.2, size * 0.15, 0, Math.PI * 2);
    ctx.arc(size * 0.5, size * 0.2, size * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(size * 0.6, -size * 0.2, size * 0.08, 0, Math.PI * 2);
    ctx.arc(size * 0.6, size * 0.2, size * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Feeding particles
    if (this.state === 'feeding') {
      for (let i = 0; i < 5; i++) {
        const particleAngle = (Date.now() * 0.01 + i * Math.PI / 2.5) % (Math.PI * 2);
        const particleRadius = size * 0.3 + Math.sin(Date.now() * 0.02 + i) * size * 0.2;
        const px = Math.cos(particleAngle) * particleRadius;
        const py = Math.sin(particleAngle) * particleRadius;
        
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
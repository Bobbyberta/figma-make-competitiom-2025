import { Vector2 } from './Vector2';
import { SimulationParams } from './SimulationParams';

export class Bird {
  position: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  trail: Vector2[] = [];
  wingPhase: number = Math.random() * Math.PI * 2;
  id: string;

  constructor(x: number, y: number) {
    this.position = new Vector2(x, y);
    this.velocity = Vector2.random().multiply(2);
    this.acceleration = Vector2.zero();
    this.id = Math.random().toString(36).substr(2, 9);
  }

  update(birds: Bird[], predators: any[], trees: any[], params: SimulationParams, canvasWidth: number, canvasHeight: number) {
    // Apply boids behavior
    const separation = this.separate(birds, params);
    const alignment = this.align(birds, params);
    const cohesion = this.cohere(birds, params);
    const avoidance = this.avoidPredators(predators, params);
    const treeAttraction = this.seekTrees(trees, params);
    const boundary = this.avoidBoundaries(canvasWidth, canvasHeight, params);

    // Apply forces
    this.acceleration = this.acceleration.add(separation.multiply(params.separationForce));
    this.acceleration = this.acceleration.add(alignment.multiply(params.alignmentForce));
    this.acceleration = this.acceleration.add(cohesion.multiply(params.cohesionForce));
    this.acceleration = this.acceleration.add(avoidance.multiply(params.avoidanceForce));
    this.acceleration = this.acceleration.add(treeAttraction.multiply(params.attractionForce));
    this.acceleration = this.acceleration.add(boundary.multiply(params.boundaryForce));

    // Update motion
    this.velocity = this.velocity.add(this.acceleration);
    this.velocity = this.velocity.limit(params.maxSpeed);
    this.position = this.position.add(this.velocity.multiply(params.animationSpeed));
    this.acceleration = Vector2.zero();

    // Update wing animation
    this.wingPhase += this.velocity.magnitude() * 0.3;

    // Update trail
    this.trail.push(this.position.clone());
    if (this.trail.length > params.trailLength) {
      this.trail.shift();
    }

    // Wrap around screen
    this.wrapAroundScreen(canvasWidth, canvasHeight);
  }

  separate(birds: Bird[], params: SimulationParams): Vector2 {
    const desiredSeparation = params.separationDistance;
    let steer = Vector2.zero();
    let count = 0;

    for (const other of birds) {
      const distance = this.position.distance(other.position);
      if (distance > 0 && distance < desiredSeparation) {
        const diff = this.position.subtract(other.position).normalize().divide(distance);
        steer = steer.add(diff);
        count++;
      }
    }

    if (count > 0) {
      steer = steer.divide(count);
      steer = steer.normalize().multiply(params.maxSpeed);
      steer = steer.subtract(this.velocity);
      steer = steer.limit(params.maxForce);
    }

    return steer;
  }

  align(birds: Bird[], params: SimulationParams): Vector2 {
    const neighborDistance = params.alignmentDistance;
    let sum = Vector2.zero();
    let count = 0;

    for (const other of birds) {
      const distance = this.position.distance(other.position);
      if (distance > 0 && distance < neighborDistance) {
        sum = sum.add(other.velocity);
        count++;
      }
    }

    if (count > 0) {
      sum = sum.divide(count);
      sum = sum.normalize().multiply(params.maxSpeed);
      const steer = sum.subtract(this.velocity);
      return steer.limit(params.maxForce);
    }

    return Vector2.zero();
  }

  cohere(birds: Bird[], params: SimulationParams): Vector2 {
    const neighborDistance = params.cohesionDistance;
    let sum = Vector2.zero();
    let count = 0;

    for (const other of birds) {
      const distance = this.position.distance(other.position);
      if (distance > 0 && distance < neighborDistance) {
        sum = sum.add(other.position);
        count++;
      }
    }

    if (count > 0) {
      sum = sum.divide(count);
      return this.seek(sum, params);
    }

    return Vector2.zero();
  }

  avoidPredators(predators: any[], params: SimulationParams): Vector2 {
    let steer = Vector2.zero();
    let count = 0;

    for (const predator of predators) {
      const distance = this.position.distance(predator.position);
      if (distance < params.avoidanceDistance) {
        const diff = this.position.subtract(predator.position).normalize().divide(distance);
        steer = steer.add(diff);
        count++;
      }
    }

    if (count > 0) {
      steer = steer.divide(count);
      steer = steer.normalize().multiply(params.maxSpeed * 2);
      steer = steer.subtract(this.velocity);
      steer = steer.limit(params.maxForce * 3);
    }

    return steer;
  }

  seekTrees(trees: any[], params: SimulationParams): Vector2 {
    let closest: any = null;
    let minDistance = params.attractionDistance;

    for (const tree of trees) {
      const distance = this.position.distance(tree.position);
      if (distance < minDistance) {
        closest = tree;
        minDistance = distance;
      }
    }

    if (closest) {
      return this.seek(closest.position, params).multiply(0.5);
    }

    return Vector2.zero();
  }

  seek(target: Vector2, params: SimulationParams): Vector2 {
    let desired = target.subtract(this.position);
    desired = desired.normalize();
    desired = desired.multiply(params.maxSpeed);
    
    const steer = desired.subtract(this.velocity);
    return steer.limit(params.maxForce);
  }

  avoidBoundaries(width: number, height: number, params: SimulationParams): Vector2 {
    const margin = 50;
    let steer = Vector2.zero();

    if (this.position.x < margin) {
      steer = steer.add(new Vector2(params.maxSpeed, this.velocity.y));
    }
    if (this.position.x > width - margin) {
      steer = steer.add(new Vector2(-params.maxSpeed, this.velocity.y));
    }
    if (this.position.y < margin) {
      steer = steer.add(new Vector2(this.velocity.x, params.maxSpeed));
    }
    if (this.position.y > height - margin) {
      steer = steer.add(new Vector2(this.velocity.x, -params.maxSpeed));
    }

    if (steer.magnitude() > 0) {
      steer = steer.normalize().multiply(params.maxSpeed);
      steer = steer.subtract(this.velocity);
      steer = steer.limit(params.maxForce);
    }

    return steer;
  }

  wrapAroundScreen(width: number, height: number) {
    if (this.position.x < -10) this.position.x = width + 10;
    if (this.position.x > width + 10) this.position.x = -10;
    if (this.position.y < -10) this.position.y = height + 10;
    if (this.position.y > height + 10) this.position.y = -10;
  }

  render(ctx: CanvasRenderingContext2D, params: SimulationParams) {
    const angle = this.velocity.heading();
    const size = params.birdSize;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(angle);

    // Render trail
    if (params.trailLength > 0 && this.trail.length > 1) {
      ctx.save();
      ctx.rotate(-angle);
      ctx.translate(-this.position.x, -this.position.y);
      
      for (let i = 0; i < this.trail.length - 1; i++) {
        const alpha = i / this.trail.length;
        ctx.strokeStyle = `rgba(100, 149, 237, ${alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.trail[i].x, this.trail[i].y);
        ctx.lineTo(this.trail[i + 1].x, this.trail[i + 1].y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Bird body
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.moveTo(size * 1.5, 0);
    ctx.lineTo(-size, -size * 0.5);
    ctx.lineTo(-size * 0.5, 0);
    ctx.lineTo(-size, size * 0.5);
    ctx.closePath();
    ctx.fill();

    // Animated wings
    const wingFlap = Math.sin(this.wingPhase) * 0.3;
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-size * 0.5, -size * 0.3);
    ctx.lineTo(-size * 1.2, -size * (0.8 + wingFlap));
    ctx.moveTo(-size * 0.5, size * 0.3);
    ctx.lineTo(-size * 1.2, size * (0.8 + wingFlap));
    ctx.stroke();

    // Vision range (debug)
    if (params.showVisionRange) {
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, params.visionRange, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
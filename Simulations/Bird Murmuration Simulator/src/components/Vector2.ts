export class Vector2 {
  constructor(public x: number = 0, public y: number = 0) {}

  static zero(): Vector2 {
    return new Vector2(0, 0);
  }

  static fromAngle(angle: number, magnitude: number = 1): Vector2 {
    return new Vector2(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
  }

  static random(): Vector2 {
    return Vector2.fromAngle(Math.random() * Math.PI * 2);
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  add(v: Vector2): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  subtract(v: Vector2): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  multiply(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  divide(scalar: number): Vector2 {
    return new Vector2(this.x / scalar, this.y / scalar);
  }

  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  normalize(): Vector2 {
    const mag = this.magnitude();
    return mag > 0 ? this.divide(mag) : new Vector2(0, 0);
  }

  limit(max: number): Vector2 {
    const mag = this.magnitude();
    return mag > max ? this.normalize().multiply(max) : this;
  }

  distance(v: Vector2): number {
    return this.subtract(v).magnitude();
  }

  distanceSquared(v: Vector2): number {
    return this.subtract(v).magnitudeSquared();
  }

  heading(): number {
    return Math.atan2(this.y, this.x);
  }

  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }

  lerp(target: Vector2, amount: number): Vector2 {
    return this.add(target.subtract(this).multiply(amount));
  }
}
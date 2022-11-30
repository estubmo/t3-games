import Circle from "./Circle";

export default class Projectile extends Circle {
  velocity: { x: number; y: number };
  isSuperPower: boolean;

  constructor(
    x: number,
    y: number,
    radius: number,
    color: string,
    context: CanvasRenderingContext2D,
    velocity: { x: number; y: number },
    stroke?: string,
    isSuperPower = false
  ) {
    super(x, y, radius, color, context, stroke);
    this.velocity = velocity;
    this.isSuperPower = isSuperPower;
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    if (this.isSuperPower) this.radius += 1;
  }
}

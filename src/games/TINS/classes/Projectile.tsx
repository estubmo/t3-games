import Circle from "./Circle";

export default class Projectile extends Circle {
  velocity: { x: number; y: number };
  isSuperPower: boolean;
  damage: number;

  constructor(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string,
    velocity: { x: number; y: number },
    damage: number,
    stroke?: string,
    isSuperPower = false
  ) {
    super(context, x, y, radius, color, stroke);
    this.velocity = velocity;
    this.isSuperPower = isSuperPower;
    this.damage = damage;
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    if (this.isSuperPower) this.radius += 1;
  }
}

import Circle from "./Circle";

export default class Powerup extends Circle {
  velocity: { x: number; y: number };

  constructor(
    x: number,
    y: number,
    radius: number,
    color: string,
    context: CanvasRenderingContext2D,
    stroke: string,
    velocity: { x: number; y: number }
  ) {
    super(x, y, radius, color, context, stroke);
    this.velocity = velocity;
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

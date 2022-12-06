import Circle from "./Circle";

const friction = 0.99;

export default class Particle extends Circle {
  velocity: { x: number; y: number };
  alpha: number;

  constructor(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string,
    velocity: { x: number; y: number }
  ) {
    super(context, x, y, radius, color);
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw() {
    this.context.save();
    this.context.globalAlpha = 0.1;
    this.context.beginPath();
    this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    this.context.fillStyle = this.color;
    this.context.fill();
    this.context.restore();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.alpha -= 0.01;
  }
}

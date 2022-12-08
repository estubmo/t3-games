import gsap from "gsap";
import Circle from "./Circle";

export default class Enemy extends Circle {
  velocity: { x: number; y: number };
  damageTaken: number;
  originialRadius: number;

  constructor(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string,
    velocity: { x: number; y: number }
  ) {
    super(context, x, y, radius, color);
    this.damageTaken = 0;
    this.velocity = velocity;
    this.originialRadius = radius;
  }

  update(playerX: number, playerY: number, showEnemyHealth: boolean) {
    this.draw(showEnemyHealth);

    const updatedVelocity = {
      x: Math.cos(Math.atan2(playerY - this.y, playerX - this.x)) * 5,
      y: Math.sin(Math.atan2(playerY - this.y, playerX - this.x)) * 5,
    };
    this.x = this.x + updatedVelocity.x / (this.radius / 7.5);
    this.y = this.y + updatedVelocity.y / (this.radius / 7.5);
  }

  takeDamage(damage: number) {
    this.damageTaken += damage;
    const newRadius = this.originialRadius - this.damageTaken;
    gsap.to(this, {
      radius: newRadius > 0 ? newRadius : 0,
    });
  }
}

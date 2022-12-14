export default class Circle {
  x: number;
  y: number;
  radius: number;
  color: string;
  context: CanvasRenderingContext2D;
  stroke?: string;

  constructor(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string,
    stroke?: string
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.context = context;
    this.stroke = stroke;
  }

  drawHealth() {
    this.context.fillStyle = "white";

    this.context.fillText(
      Math.floor(this.radius).toString(),
      this.x - 5,
      this.y + 3
    );
    this.context.fillStyle = "transparent";
  }

  draw(showHealth = false) {
    this.context.save();
    this.context.beginPath();
    this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    this.context.closePath();
    this.context.fillStyle = this.color;
    this.context.fill();
    this.context.strokeStyle = this.stroke || "transparent";
    this.context.stroke();
    this.context.restore();

    if (showHealth) {
      this.drawHealth();
    }
  }
}

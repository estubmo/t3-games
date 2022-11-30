export default class Circle {
  x: number;
  y: number;
  radius: number;
  color: string;
  context: CanvasRenderingContext2D;
  stroke?: string;
  superPowerOn: boolean;

  constructor(
    x: number,
    y: number,
    radius: number,
    color: string,
    context: CanvasRenderingContext2D,
    stroke?: string
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.context = context;
    this.stroke = stroke;
    this.superPowerOn = false;
  }

  draw() {
    this.context.save();
    this.context.beginPath();
    this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    this.context.closePath();
    this.context.fillStyle = this.color;
    this.context.fill();
    this.context.strokeStyle = this.stroke || "transparent";
    this.context.stroke();
    this.context.restore();
  }

  toggleSuperPower(value: boolean) {
    this.superPowerOn = value;

    this.color = this.superPowerOn ? "red" : "white";
  }
}

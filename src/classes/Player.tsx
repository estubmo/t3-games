export default class Player {
  x: number;
  y: number;
  radius: number;
  color: string;
  context: CanvasRenderingContext2D;
  stroke?: string;
  superPowerOn: boolean;
  superPowerCharge: number;
  movementSpeed: number;
  velX = 0;
  velY = 0;
  friction = 0.98;

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
    this.superPowerCharge = 0;
    this.movementSpeed = 2;
  }

  draw() {
    this.context.beginPath();
    this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    this.context.fillStyle = this.color;
    this.context.fill();
    this.context.strokeStyle = this.stroke || "transparent";
    this.context.stroke();
    // this.context.transform(1, 0, 0, 1, this.x, this.y);
    // Super power charge line
    this.context.strokeStyle = "white";
    this.context.setLineDash([6, 3.5]);
    // this.context.setLineDash([2, 5]);
    this.context.moveTo(this.x, this.y);
    this.context.beginPath();

    this.context.fillStyle = "transparent";

    this.velY *= this.friction;
    this.y += this.velY;
    this.velX *= this.friction;
    this.x += this.velX;

    this.context.arc(
      this.x,
      this.y,
      this.radius + 5,
      0,
      ((Math.PI * 2) / 10) * this.superPowerCharge,
      false
    );

    this.context.stroke();

    // Cleanup
    this.context.setLineDash([]);
    this.context.strokeStyle = "transparent";
  }

  toggleSuperPower(value: boolean) {
    this.superPowerOn = value;
    this.color = this.superPowerOn ? "red" : "white";
  }

  decrementSuperPowerCharge() {
    this.superPowerCharge--;
  }

  incrementSuperPowerCharge() {
    this.superPowerCharge++;
  }

  // W
  moveUp() {
    if (this.velY > -this.movementSpeed) {
      this.velY--;
    }
  }

  // A
  moveLeft() {
    if (this.velX > -this.movementSpeed) {
      this.velX--;
    }
  }

  // S
  moveDown() {
    if (this.velY < this.movementSpeed) {
      this.velY++;
    }
  }

  // D
  moveRight() {
    if (this.velX < this.movementSpeed) {
      this.velX++;
    }
  }
}

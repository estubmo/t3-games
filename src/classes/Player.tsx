import Projectile from "./Projectile";

const PROJECTILE_VELOCITY_MULTIPLIER = 5;
const SUPER_PROJECTILE_VELOCITY_MULTIPLIER = 15;
const DEFAULT_PROJECTILE_DAMAGE = 10;
const SUPER_PROJECTILE_DAMAGE = 100;

const fireSuperModeProjectile = (
  context: CanvasRenderingContext2D,
  player: Player,
  projectiles: Set<Projectile>,
  angle: number
) => {
  const stroke = `hsl(${Math.random() * 360}, 90%, 90%)`;
  const velocity = {
    x: Math.cos(angle) * SUPER_PROJECTILE_VELOCITY_MULTIPLIER,
    y: Math.sin(angle) * SUPER_PROJECTILE_VELOCITY_MULTIPLIER,
  };

  projectiles.add(
    new Projectile(
      context,
      player.x,
      player.y,
      2,
      "black",
      velocity,
      SUPER_PROJECTILE_DAMAGE,
      stroke,
      true
    )
  );
};

const fireNormalProjectile = (
  context: CanvasRenderingContext2D,
  player: Player,
  projectiles: Set<Projectile>,
  angle: number
) => {
  const velocity = {
    x: Math.cos(angle) * PROJECTILE_VELOCITY_MULTIPLIER,
    y: Math.sin(angle) * PROJECTILE_VELOCITY_MULTIPLIER,
  };

  projectiles.add(
    new Projectile(
      context,
      player.x,
      player.y,
      5,
      "white",
      velocity,
      DEFAULT_PROJECTILE_DAMAGE
    )
  );
};

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
  shotCooldownCounter = 0;
  attackSpeed = 10;
  isShooting = false;

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
    if (this.shotCooldownCounter > 0) this.shotCooldownCounter--;
    console.log(
      "%cLMKG%cline:127%cthis.shotCooldownCounter ",
      "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
      "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
      "color:#fff;background:rgb(179, 214, 110);padding:3px;border-radius:2px",
      this.shotCooldownCounter
    );

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

  shoot(
    projectiles: Set<Projectile>,
    cursorPosition: { x: number; y: number }
  ) {
    if (this.shotCooldownCounter === 0) {
      const angle = Math.atan2(
        cursorPosition.y - this.y,
        cursorPosition.x - this.x
      );

      if (this.superPowerOn) {
        fireSuperModeProjectile(this.context, this, projectiles, angle);
      } else {
        fireNormalProjectile(this.context, this, projectiles, angle);
      }
      this.shotCooldownCounter = this.attackSpeed;
    }
  }
}

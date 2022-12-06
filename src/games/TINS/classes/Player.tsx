import Projectile from "./Projectile";

const PROJECTILE_VELOCITY_MULTIPLIER = 5;
const SUPER_PROJECTILE_VELOCITY_MULTIPLIER = 15;
const DEFAULT_PROJECTILE_DAMAGE = 10;
const SUPER_PROJECTILE_DAMAGE = 100;
const BOUNCE_FACTOR = 4;

export default class Player {
  friction = 0.98;

  context: CanvasRenderingContext2D;
  mapWidth: number;
  mapHeight: number;

  x: number;
  y: number;
  radius: number;
  color: string;
  stroke?: string;

  superPowerOn: boolean;
  superPowerCharge: number;

  movementSpeed: number;
  velX = 0;
  velY = 0;
  shotCooldownCounter = 0;
  attackSpeed = 15;
  isShooting = false;

  projectiles: Set<Projectile>;

  keysPressed = {
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowDown: false,
    ArrowRight: false,
  };

  constructor(
    context: CanvasRenderingContext2D,
    mapWidth: number,
    mapHeight: number,
    x: number,
    y: number,
    radius: number,
    color: string,
    stroke?: string
  ) {
    this.context = context;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;

    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.stroke = stroke;
    this.superPowerOn = false;
    this.superPowerCharge = 0;
    this.movementSpeed = 3;
    this.projectiles = new Set<Projectile>();
  }

  outOfBoundsHandling() {
    if (this.x - this.radius < 1) {
      this.x = this.radius + 1;
      this.velX = -this.velX * BOUNCE_FACTOR;
    } else if (this.y - this.radius < 1) {
      this.y = this.radius + 1;
      this.velY = -this.velY * BOUNCE_FACTOR;
    } else if (this.x + this.radius > this.mapWidth) {
      this.x = this.mapWidth - (this.radius + 1);
      this.velX = -this.velX * BOUNCE_FACTOR;
    } else if (this.y + this.radius > this.mapHeight) {
      this.y = this.mapHeight - (this.radius + 1);
      this.velY = -this.velY * BOUNCE_FACTOR;
    } else {
      this.y += this.velY;
      this.x += this.velX;
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    this.keysPressed[event.key as keyof typeof this.keysPressed] = true;
  }

  handleKeyUp(event: KeyboardEvent) {
    this.keysPressed[event.key as keyof typeof this.keysPressed] = false;
  }

  // W ArrowUp
  moveUp() {
    if (this.velY > -this.movementSpeed) {
      this.velY--;
    }
  }

  // A ArrowLeft
  moveLeft() {
    if (this.velX > -this.movementSpeed) {
      this.velX--;
    }
  }

  // S ArrowDown
  moveDown() {
    if (this.velY < this.movementSpeed) {
      this.velY++;
    }
  }

  // D ArrowRight
  moveRight() {
    if (this.velX < this.movementSpeed) {
      this.velX++;
    }
  }

  // Update the players's velocity based on which keys are currently being pressed
  handleMovement() {
    // Handle if the player is out of bounds
    this.outOfBoundsHandling();

    if (this.keysPressed.w || this.keysPressed.ArrowUp) {
      this.moveUp();
    }
    if (this.keysPressed.a || this.keysPressed.ArrowLeft) {
      this.moveLeft();
    }
    if (this.keysPressed.s || this.keysPressed.ArrowDown) {
      this.moveDown();
    }

    if (this.keysPressed.d || this.keysPressed.ArrowRight) {
      this.moveRight();
    }
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

  fireSuperModeProjectile(
    context: CanvasRenderingContext2D,
    player: Player,
    angle: number
  ) {
    const stroke = `hsl(${Math.random() * 360}, 90%, 90%)`;
    const velocity = {
      x:
        Math.cos(angle) * SUPER_PROJECTILE_VELOCITY_MULTIPLIER + this.velX / 10,
      y:
        Math.sin(angle) * SUPER_PROJECTILE_VELOCITY_MULTIPLIER + this.velY / 10,
    };

    this.projectiles.add(
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
  }

  fireNormalProjectile(
    context: CanvasRenderingContext2D,
    player: Player,
    angle: number
  ) {
    const velocity = {
      x: Math.cos(angle) * PROJECTILE_VELOCITY_MULTIPLIER + this.velX / 10,
      y: Math.sin(angle) * PROJECTILE_VELOCITY_MULTIPLIER + this.velY / 10,
    };

    this.projectiles.add(
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
  }

  shoot(cursorPosition: { x: number; y: number }) {
    if (this.shotCooldownCounter === 0) {
      const angle = Math.atan2(
        cursorPosition.y - this.y,
        cursorPosition.x - this.x
      );

      if (this.superPowerOn) {
        this.fireSuperModeProjectile(this.context, this, angle);
      } else {
        this.fireNormalProjectile(this.context, this, angle);
      }
      this.shotCooldownCounter = this.attackSpeed;
    }
  }

  drawPlayer = () => {
    this.context.beginPath();
    this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    this.context.fillStyle = this.color;
    this.context.fill();
    this.context.strokeStyle = this.stroke || "transparent";
    this.context.stroke();
    this.context.closePath();
  };

  drawPowerChargeIndicator = () => {
    this.context.strokeStyle = "white";
    this.context.setLineDash([6, 3.5]);
    this.context.beginPath();
    this.context.fillStyle = "transparent";
    this.context.arc(
      this.x,
      this.y,
      this.radius + 5,
      0,
      ((Math.PI * 2) / 10) * this.superPowerCharge,
      false
    );
    this.context.stroke();
    this.context.closePath();

    if (this.shotCooldownCounter > 0) this.shotCooldownCounter--;
  };

  draw() {
    this.velY *= this.friction;
    this.velX *= this.friction;
    this.handleMovement();

    // draw player
    this.drawPlayer();
    // Draw super power charge line
    this.drawPowerChargeIndicator();
    // Cleanup
    this.context.setLineDash([]);
    this.context.strokeStyle = "transparent";

    // Projectiles
    this.projectiles.forEach((projectile) => {
      projectile.update();

      // Cleanup
      if (
        projectile.x - projectile.radius < 1 ||
        projectile.x - projectile.radius > this.mapWidth ||
        projectile.y - projectile.radius < 1 ||
        projectile.y - projectile.radius > this.mapHeight
      ) {
        this.projectiles.delete(projectile);
      }
    });
  }
}

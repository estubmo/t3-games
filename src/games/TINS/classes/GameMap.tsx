import Enemy from "./Enemy";
import Particle from "./Particle";
import Player from "./Player";

const SUPER_POWER_ENABLE_NUM = 10;
const ENEMY_SPAWN_TIMER = 750;
const MINIMUM_ENEMY_HEALTH = 10;
const DEFAULT_NUM_ENEMY_SPAWNERS = 1;

export default class GameMap {
  context: CanvasRenderingContext2D;
  animationFrameId = 0;
  width: number;
  height: number;
  showEnemyHealth: boolean;
  gameRunning = false;

  player: Player;
  enemies: Set<Enemy>;
  particles: Set<Particle>;

  enemySpawners: Array<NodeJS.Timer>;
  numEnemySpawners = DEFAULT_NUM_ENEMY_SPAWNERS;

  endGameCallback: () => void;
  updateScoreCallback: () => void;

  constructor(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    showEnemyHealth: boolean,

    endGameCallback: () => void,
    updateScoreCallback: () => void
  ) {
    this.context = context;
    this.width = width;
    this.height = height;

    this.showEnemyHealth = showEnemyHealth;

    this.player = new Player(
      context,
      width,
      height,
      width / 2,
      height / 2,
      10,
      "white"
    );
    this.enemies = new Set<Enemy>();
    this.particles = new Set<Particle>();

    this.endGameCallback = endGameCallback;
    this.updateScoreCallback = updateScoreCallback;
    this.enemySpawners = new Array<NodeJS.Timer>();
  }

  pause(value: boolean) {
    if (this.gameRunning) {
      if (value) this.pauseAllEnemySpawners();
      else this.startAllEnemySpawners();
    }
  }

  getSpawnFromAnyAngle = (
    radius: number
  ): { x: number; y: number; angle: number } => {
    let x;
    let y;

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : this.width + radius;
      y = Math.random() * this.height;
    } else {
      x = Math.random() * this.width;
      y = Math.random() < 0.5 ? 0 - radius : this.height + radius;
    }
    return { x, y, angle: Math.atan2(this.height / 2 - y, this.width / 2 - x) };
  };

  spawnEnemy = (showEnemyHealth: boolean): Enemy => {
    const radius = Math.floor(Math.random() * 10) * 10 + 10;
    const { x, y, angle } = this.getSpawnFromAnyAngle(radius);
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

    const velocity = {
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5,
    };

    return new Enemy(
      this.context,
      x,
      y,
      radius,
      color,
      velocity,
      showEnemyHealth
    );
  };

  startAllEnemySpawners = () => {
    for (let i = 0; i < this.numEnemySpawners; i++) {
      this.enemySpawners.push(
        setInterval(() => {
          this.enemies.add(this.spawnEnemy(this.showEnemyHealth));
        }, ENEMY_SPAWN_TIMER)
      );
    }
  };

  pauseAllEnemySpawners = () => {
    this.enemySpawners.forEach((id) => {
      clearInterval(id);
    });
    this.enemySpawners = [];
  };

  startOneEnemySpawner = () => {
    this.enemySpawners.push(
      setInterval(() => {
        this.enemies.add(this.spawnEnemy(this.showEnemyHealth));
      }, ENEMY_SPAWN_TIMER)
    );
  };

  pauseOneEnemySpawner = () => {
    this.enemySpawners.pop();
  };

  enemyExplosion = (enemy: Enemy) => {
    for (let i = 0; i < enemy.radius * 2; i++) {
      this.particles.add(
        new Particle(
          this.context,
          enemy.x,
          enemy.y,
          Math.random() * 2,
          enemy.color,
          {
            x: (Math.random() - 0.5) * (Math.random() * 6),
            y: (Math.random() - 0.5) * (Math.random() * 6),
          }
        )
      );
    }
  };

  enablePlayerSuperPower = () => {
    this.player.toggleSuperPower(true);
    const intervalId = setInterval(() => {
      if (this.player.superPowerCharge === 0) {
        this.player.toggleSuperPower(false);
        clearInterval(intervalId);
      } else this.player.decrementSuperPowerCharge();
    }, 500);
  };

  killPlayerByEnemy = (enemy: Enemy) => {
    // Death - When enemy touches player
    const dist = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
    if (dist - enemy.radius - this.player.radius < 1) {
      this.endGame();
    }
  };

  checkProjectileHitEnemy = (enemy: Enemy) => {
    this.player.projectiles.forEach((projectile) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

      // When projectile touches enemy
      if (dist - enemy.radius - projectile.radius < 1) {
        if (enemy.radius >= 10) {
          enemy.takeDamage(projectile.damage);

          if (!projectile.isSuperPower)
            this.player.projectiles.delete(projectile);
        }
      }
    });
  };

  decrementNumEnemySpawners = () => {
    this.numEnemySpawners--;
  };

  incrementNumEnemySpawners = () => {
    this.numEnemySpawners++;
  };

  beginGame = () => {
    this.gameRunning = true;
    this.startAllEnemySpawners();
  };

  endGame = () => {
    this.gameRunning = false;
    cancelAnimationFrame(this.animationFrameId);
    this.pauseAllEnemySpawners();
    this.endGameCallback();
  };

  draw(animationFrameId: number) {
    this.animationFrameId = animationFrameId;

    // Rect
    this.context.fillStyle = "rgba(0, 0, 0, 0.8)";
    this.context.fillRect(0, 0, this.width, this.height);

    this.player.draw();

    // Enemies
    this.enemies.forEach((enemy) => {
      enemy.update(this.player.x, this.player.y);

      if (enemy.radius < MINIMUM_ENEMY_HEALTH) {
        this.enemies.delete(enemy);
        this.enemyExplosion(enemy);

        if (!this.player.superPowerOn) this.player.incrementSuperPowerCharge();
        if (this.player.superPowerCharge === SUPER_POWER_ENABLE_NUM)
          this.enablePlayerSuperPower();

        this.updateScoreCallback();
      }

      this.killPlayerByEnemy(enemy);
      this.checkProjectileHitEnemy(enemy);
    });

    // Particle cleanup
    this.particles.forEach((particle) => {
      if (particle.alpha <= 0) {
        this.particles.delete(particle);
      }
      particle.update();
    });
  }
}

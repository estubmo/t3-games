import { useCallback, useEffect, useRef, useState } from "react";
import Enemy from "../classes/Enemy";
import Projectile from "../classes/Projectile";
import Particle from "../classes/Particle";
import Powerup from "../classes/Powerup";
import Player from "../classes/Player";

interface CanvasProps {
  width: number;
  height: number;
}

const PROJECTILE_VELOCITY_MULTIPLIER = 5;
const SUPER_PROJECTILE_VELOCITY_MULTIPLIER = 15;
const SUPER_POWER_ENABLE_NUM = 10;
const ENEMY_SPAWN_TIMER = 750;

const Canvas = ({ width, height }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasCenterX = width / 2;
  const canvasCenterY = height / 2;
  const [score, setScore] = useState(0);
  const [run, setRun] = useState(false);
  const [showEnemyHealth, setShowEnemyHealth] = useState(false);

  const onStartGameClick = () => {
    setRun((prev) => !prev);
  };

  const onClick = useCallback(
    (
      player: Player,
      projectiles: Array<Projectile>,
      enableSuperPower: boolean,
      event: MouseEvent,
      context: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement
    ) => {
      // Deals with mouse click event offset
      const x =
        event.clientX - canvas.offsetLeft + document.documentElement.scrollLeft;
      const y =
        event.clientY - canvas.offsetTop + document.documentElement.scrollTop;

      const angle = Math.atan2(y - player.y, x - player.x);

      if (enableSuperPower) {
        // Super power projectile
        const stroke = `hsl(${Math.random() * 360}, 90%, 90%)`;
        projectiles.push(
          new Projectile(
            player.x,
            player.y,
            2,
            "black",
            context,
            {
              x: Math.cos(angle) * SUPER_PROJECTILE_VELOCITY_MULTIPLIER,
              y: Math.sin(angle) * SUPER_PROJECTILE_VELOCITY_MULTIPLIER,
            },
            stroke,
            true
          )
        );
      } else {
        // Normal projectile
        projectiles.push(
          new Projectile(player.x, player.y, 5, "white", context, {
            x: Math.cos(angle) * PROJECTILE_VELOCITY_MULTIPLIER,
            y: Math.sin(angle) * PROJECTILE_VELOCITY_MULTIPLIER,
          })
        );
      }
    },
    []
  );

  const getSpawnFromAnyAngle = useCallback(
    (radius: number): { x: number; y: number; angle: number } => {
      let x;
      let y;

      if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? 0 - radius : width + radius;
        y = Math.random() * height;
      } else {
        x = Math.random() * width;
        y = Math.random() < 0.5 ? 0 - radius : height + radius;
      }
      return { x, y, angle: Math.atan2(canvasCenterY - y, canvasCenterX - x) };
    },
    [height, width, canvasCenterX, canvasCenterY]
  );

  const spawnEnemy = useCallback(
    (context: CanvasRenderingContext2D, showEnemyHealth: boolean): Enemy => {
      const radius = Math.floor(Math.random() * 10) * 10 + 10;

      const { x, y, angle } = getSpawnFromAnyAngle(radius);
      const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

      const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5,
      };

      return new Enemy(x, y, radius, color, context, velocity, showEnemyHealth);
    },
    [getSpawnFromAnyAngle]
  );

  const spawnPowerup = useCallback(
    (context: CanvasRenderingContext2D): Powerup => {
      const radius = 10;

      const stroke = `hsl(${Math.random() * 360}, 90%, 90%)`;

      const { x, y, angle } = getSpawnFromAnyAngle(radius);

      const velocity = {
        x: Math.cos(angle) * 10,
        y: Math.sin(angle) * 10,
      };

      return new Powerup(x, y, radius, "black", context, stroke, velocity);
    },
    [getSpawnFromAnyAngle]
  );

  const startSpawnEnemies = useCallback(
    (
      enemies: Set<Enemy>,
      context: CanvasRenderingContext2D,
      showEnemyHealth: boolean
    ) => {
      setInterval(() => {
        enemies.add(spawnEnemy(context, showEnemyHealth));
      }, ENEMY_SPAWN_TIMER);
    },
    [spawnEnemy]
  );

  useEffect(() => {
    if (canvasRef.current && run) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context == null) throw new Error("Could not get context");

      // Declare objects and arrays
      const player = new Player(width / 2, height / 2, 10, "white", context);
      const projectiles: Array<Projectile> = [];
      const enemies: Set<Enemy> = new Set();
      const particles: Array<Particle> = [];
      const powerups: Array<Powerup> = [];

      let frameCount = 0;
      let animationFrameId: number;
      let showDebugInfo = false;
      let numPowerups = 0;
      let enableSuperPower = false;

      const render = () => {
        // Color background
        context.fillStyle = "rgba(0, 0, 0, 0.3)";
        context.fillRect(0, 0, width, height);

        // Draw functions
        // Player
        player.draw();

        // Powerup text
        context.fillStyle = "blue";
        context.font = "12px serif";
        context.strokeStyle = "blue";
        context.textAlign = "center";

        // Particles
        particles.forEach((particle, index) => {
          if (particle.alpha <= 0) {
            particles.splice(index, 1);
          }
          particle.update();
        });

        // Projectiles
        projectiles.forEach((projectile, index) => {
          projectile.update();

          if (
            projectile.x - projectile.radius < 1 ||
            projectile.x - projectile.radius > width ||
            projectile.y - projectile.radius < 1 ||
            projectile.y - projectile.radius > height
          ) {
            projectiles.splice(index, 1);
          }
        });

        // Enemies
        enemies.forEach((enemy) => {
          enemy.update(player.x, player.y);
          if (enemy.radius < 10) {
            enemies.delete(enemy);
            for (let i = 0; i < enemy.radius * 2; i++) {
              particles.push(
                new Particle(
                  enemy.x,
                  enemy.y,
                  Math.random() * 2,
                  enemy.color,
                  context,
                  {
                    x: (Math.random() - 0.5) * (Math.random() * 6),
                    y: (Math.random() - 0.5) * (Math.random() * 6),
                  }
                )
              );
            }
            enemies.delete(enemy);

            // Handle kill counter and powerups
            if (!enableSuperPower) player.incrementSuperPowerCharge();
            if (player.superPowerCharge === SUPER_POWER_ENABLE_NUM) {
              enableSuperPower = true;
              player.toggleSuperPower(true);
              const intervalId = setInterval(() => {
                if (player.superPowerCharge === 0) {
                  enableSuperPower = false;
                  player.toggleSuperPower(false);
                  clearInterval(intervalId);
                } else player.decrementSuperPowerCharge();
              }, 500);
            }

            // Make score available outside useEffect
            setScore((prev) => prev + 1);
          }

          const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

          // Death - When enemy touches player
          if (dist - enemy.radius - player.radius < 1) {
            setRun(false);
            cancelAnimationFrame(animationFrameId);
          }

          projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(
              projectile.x - enemy.x,
              projectile.y - enemy.y
            );

            // when projectile touches enemy
            if (dist - enemy.radius - projectile.radius < 1) {
              if (enemy.radius >= 10) {
                enemy.takeDamage();

                if (!projectile.isSuperPower)
                  projectiles.splice(projectileIndex, 1);
              }
            }
          });
        });

        // Powerups
        powerups.forEach((powerup, index) => {
          powerup.update();

          const dist = Math.hypot(player.x - powerup.x, player.y - powerup.y);

          if (dist - powerup.radius - player.radius < 1) {
            powerups.splice(index, 1);
            numPowerups++;
            if (numPowerups === SUPER_POWER_ENABLE_NUM) {
            }
          }
        });

        // Update functions
        animationFrameId = window.requestAnimationFrame(render);
        frameCount++;
        if (frameCount === 1) setScore(0);
        if (showDebugInfo) {
          context.fillStyle = "white";
          context.font = "12px serif";
          context.fillText(`FrameCounter:  ${frameCount}`, 5, height - 5);
          context.fillText(`Enemies:  ${enemies.size}`, width / 2, height - 5);
          context.fillText(
            `Projectiles:  ${projectiles.length}`,
            width / 2 + 100,
            height - 5
          );
          context.fillText(
            `Particles:  ${particles.length}`,
            width / 2 + 200,
            height - 5
          );
        }
      };

      render();
      startSpawnEnemies(enemies, context, showEnemyHealth);

      const handleMouseClick = (event: MouseEvent) =>
        onClick(player, projectiles, enableSuperPower, event, context, canvas);

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.altKey && event.key === "d") showDebugInfo = !showDebugInfo;
        if (event.key === "w") player.moveUp();
        if (event.key === "a") player.moveLeft();
        if (event.key === "s") player.moveDown();
        if (event.key === "d") player.moveRight();
      };

      canvas.addEventListener("click", handleMouseClick);
      //   canvas.addEventListener('contextmenu', function(evt) { // Right click
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.cancelAnimationFrame(animationFrameId);
        window.removeEventListener("keydown", handleKeyDown);
        canvas.removeEventListener("click", handleMouseClick);
      };
    }
  }, [
    width,
    height,
    onClick,
    startSpawnEnemies,
    spawnPowerup,
    run,
    showEnemyHealth,
  ]);

  return (
    <div className="border border-gray-400 bg-black">
      <div className="absolute flex w-full select-none px-4 py-2 text-white">
        Score: {score}
      </div>

      {!run && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="flex w-full max-w-md select-none flex-col items-center justify-center rounded bg-white p-4">
            <h1 className="text-4xl font-bold">{score}</h1>
            <p className="text-sm text-gray-700">Points</p>
            <div className="py-2"></div>
            <button
              className="text-md w-full rounded-full bg-blue-500 p-2 text-white"
              onClick={onStartGameClick}
            >
              Start Game
            </button>
            <div className="flex gap-2 pt-1 text-sm">
              <p>Show enemy health:</p>
              <input
                type="checkbox"
                checked={showEnemyHealth}
                onChange={() => setShowEnemyHealth((prev) => !prev)}
              />
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} height={height} width={width} />
    </div>
  );
};

export default Canvas;

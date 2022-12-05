import { useCallback, useEffect, useRef, useState } from "react";
import Enemy from "../../classes/Enemy";
import type Projectile from "../../classes/Projectile";
import Particle from "../../classes/Particle";
import Player from "../../classes/Player";
import { trpc } from "@utils/trpc";
import StartScreen from "./StartScreen";

type CanvasProps = {
  width: number;
  height: number;
};

const SUPER_POWER_ENABLE_NUM = 10;
const ENEMY_SPAWN_TIMER = 750;
const MINIMUM_ENEMY_HEALTH = 10;

export type GameState =
  | "WELCOME"
  | "RUNNING"
  | "ENDED"
  | "ADDNAME"
  | "HIGHSCORE";

const TINSGame = ({ width, height }: CanvasProps) => {
  // trpc
  const { data, isLoading } = trpc.game.byShortName.useQuery({
    shortName: "tins",
  });
  const gameId = data?.id;
  const addScoreMutation = trpc.score.addScoreByGameId.useMutation();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasCenterX = width / 2;
  const canvasCenterY = height / 2;

  // Score stuff
  const [score, setScore] = useState(0);
  const [name, setName] = useState("");

  const [showEnemyHealth, setShowEnemyHealth] = useState(false);

  // Debug info
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [numEnemies, setNumEnemies] = useState(0);
  const [numProjectiles, setNumProjectiles] = useState(0);
  const [numParticles, setNumParticles] = useState(0);

  const [gameState, setGameState] = useState<GameState>("WELCOME");

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

      return new Enemy(context, x, y, radius, color, velocity, showEnemyHealth);
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

  const handleSaveScore = (name: string) => {
    if (!gameId) throw new Error("No gameId");
    addScoreMutation.mutate({
      gameId,
      score,
      name,
    });
  };

  useEffect(() => {
    if (canvasRef.current) {
      if (gameState !== "RUNNING") return;
      // Reset score on start
      setGameState("RUNNING");
      setScore(0);
      // Canvas init
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d", { alpha: false });

      if (context == null) throw new Error("Could not get context");

      // Declare objects and arrays
      const player = new Player(context, width / 2, height / 2, 10, "white");
      const projectiles = new Set<Projectile>();
      const enemies = new Set<Enemy>();
      const particles = new Set<Particle>();

      //Mouse
      const cursorPosition = { x: 0, y: 0 };
      let leftMouseDown = false;

      // Framerate management
      let animationFrameId: number;
      let then = Date.now();
      const fps = 60;
      const fpsInterval = 1000 / fps;

      // Functions
      const updateScore = () => {
        setScore((prev) => prev + 1); // Make score available outside useEffect
      };

      const killPlayerByEnemy = (enemy: Enemy) => {
        // Death - When enemy touches player
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist - enemy.radius - player.radius < 1) {
          cancelAnimationFrame(animationFrameId);
          setGameState("ENDED");
        }
      };

      const checkProjectileHitEnemy = (enemy: Enemy) => {
        // Projectiles
        projectiles.forEach((projectile) => {
          const dist = Math.hypot(
            projectile.x - enemy.x,
            projectile.y - enemy.y
          );

          // When projectile touches enemy
          if (dist - enemy.radius - projectile.radius < 1) {
            if (enemy.radius >= 10) {
              enemy.takeDamage(projectile.damage);

              if (!projectile.isSuperPower) projectiles.delete(projectile);
            }
          }
        });
      };

      const enemyExplosion = (enemy: Enemy) => {
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.add(
            new Particle(
              context,
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

      const enablePlayerSuperPower = () => {
        player.toggleSuperPower(true);
        const intervalId = setInterval(() => {
          if (player.superPowerCharge === 0) {
            player.toggleSuperPower(false);
            clearInterval(intervalId);
          } else player.decrementSuperPowerCharge();
        }, 500);
      };

      const render = () => {
        // This animates the next frame
        animationFrameId = window.requestAnimationFrame(render);

        // Framerate handling
        const now = Date.now();
        const delta = now - then;
        if (delta > fpsInterval) {
          then = now - (delta % fpsInterval);

          if (leftMouseDown) {
            player.shoot(projectiles, cursorPosition);
          }

          // Color background
          context.fillStyle = "rgba(0, 0, 0, 0.3)";
          context.fillRect(0, 0, width, height);

          // Draw functions
          // Player
          player.draw();

          // Particles
          particles.forEach((particle) => {
            if (particle.alpha <= 0) {
              particles.delete(particle);
            }
            particle.update();
          });

          // Projectiles
          projectiles.forEach((projectile) => {
            projectile.update();

            // Cleanup
            if (
              projectile.x - projectile.radius < 1 ||
              projectile.x - projectile.radius > width ||
              projectile.y - projectile.radius < 1 ||
              projectile.y - projectile.radius > height
            ) {
              projectiles.delete(projectile);
            }
          });

          // Enemies
          enemies.forEach((enemy) => {
            enemy.update(player.x, player.y);

            if (enemy.radius < MINIMUM_ENEMY_HEALTH) {
              enemies.delete(enemy);
              enemyExplosion(enemy);

              if (!player.superPowerOn) player.incrementSuperPowerCharge();
              if (player.superPowerCharge === SUPER_POWER_ENABLE_NUM)
                enablePlayerSuperPower();

              updateScore();
            }

            killPlayerByEnemy(enemy);
            checkProjectileHitEnemy(enemy);
          });

          // Update functions
          setNumEnemies(enemies.size);
          setNumProjectiles(projectiles.size);
          setNumParticles(particles.size);
        }
      };

      render();
      startSpawnEnemies(enemies, context, showEnemyHealth);

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.altKey && event.key === "d")
          setShowDebugInfo((prev) => !prev);
        if (event.key === "w") player.moveUp();
        if (event.key === "a") player.moveLeft();
        if (event.key === "s") player.moveDown();
        if (event.key === "d") player.moveRight();
      };

      // Events and Event listeneres

      const getMousePos = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      };

      const mouseMovementEvent = (e: MouseEvent) => {
        const mousePos = getMousePos(e);
        cursorPosition["x"] = mousePos.x;
        cursorPosition["y"] = mousePos.y;
      };

      const onMouseDown = () => {
        leftMouseDown = true;
      };
      const onMouseUp = () => {
        leftMouseDown = false;
      };

      canvas.addEventListener("mousemove", mouseMovementEvent, false);
      canvas.addEventListener("mousedown", onMouseDown);
      canvas.addEventListener("mouseup", onMouseUp);
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.cancelAnimationFrame(animationFrameId);
        canvas.removeEventListener("mousemove", mouseMovementEvent);
        canvas.removeEventListener("mousedown", onMouseDown);
        canvas.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [width, height, startSpawnEnemies, showEnemyHealth, gameState]);

  if (isLoading || !gameId) return <div>Loading game</div>;

  return (
    <div className="border border-gray-400 bg-black">
      <div className="absolute flex w-full select-none px-4 py-2 text-white">
        Score: {score}
      </div>

      {gameState !== "RUNNING" && (
        <StartScreen
          gameId={gameId}
          gameState={gameState}
          setGameState={setGameState}
          score={score}
          name={name}
          onSaveName={setName}
          onSaveScore={handleSaveScore}
          showEnemyHealth={showEnemyHealth}
          onShowEnemyHealth={setShowEnemyHealth}
        />
      )}
      {/*
      {showStartScreen && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="relative flex w-full max-w-md select-none flex-col items-center justify-center rounded bg-white p-4">
            <Link className="absolute top-0 left-0 p-2" href="/">
              <ArrowLeftIcon className="h-6 w-6" />
            </Link>

            <h1 className="text-4xl font-bold">There Is No Sun!</h1>
            <div className="py-2" />
            <p className="text-sm text-gray-700">
              Try to beat the current highscore. You can{" "}
              <span className="bg-gray-500 font-mono text-gray-200">wasd</span>{" "}
              to move and hold{" "}
              <span className="bg-gray-500 font-mono text-gray-200">
                left mouse button
              </span>{" "}
              to shoot projectiles.
            </p>

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
      )} */}

      {/* {showRestart && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="relative flex w-full max-w-md select-none flex-col items-center justify-center rounded bg-white p-4">
            <Link className="absolute top-0 left-0 p-2" href="/">
              <ArrowLeftIcon className="h-6 w-6" />
            </Link>

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
      )} */}

      {showDebugInfo && (
        <div className="absolute bottom-0 left-0 flex  w-full select-none flex-col px-4 py-2 text-white">
          <p>Enemies: {numEnemies}</p>
          <p>Projectiles: {numProjectiles}</p>
          <p>Particles: {numParticles}</p>
        </div>
      )}

      <canvas ref={canvasRef} height={height} width={width} />
    </div>
  );
};

export default TINSGame;

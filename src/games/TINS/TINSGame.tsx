import { useEffect, useRef, useState } from "react";
import { trpc } from "@utils/trpc";
import StartScreen from "./StartScreen";
import GameMap from "./classes/GameMap";
import { sanitizeDatabaseInput } from "@utils/functions";

type CanvasProps = {
  width: number;
  height: number;
};

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

  const handleSaveScore = (name: string) => {
    if (!gameId) throw new Error("No gameId");
    addScoreMutation.mutate({
      gameId,
      score,
      name: sanitizeDatabaseInput(name),
    });
  };

  useEffect(() => {
    if (canvasRef.current) {
      if (gameState !== "RUNNING") return;

      setGameState("RUNNING");

      // Reset score on start
      setScore(0);

      // Canvas init
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d", { alpha: false });

      // Create an off-screen canvas to render the game
      const offScreenCanvas = document.createElement("canvas");
      const offScreenContext = offScreenCanvas.getContext("2d");

      // Set the dimensions of the off-screen canvas to match the on-screen canvas
      offScreenCanvas.width = canvas.width;
      offScreenCanvas.height = canvas.height;

      if (context === null) throw new Error("Could not get context");
      if (offScreenContext === null) throw new Error("Could not get context");

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

      const endGame = () => {
        cancelAnimationFrame(animationFrameId);
        setGameState("ENDED");
      };

      const map = new GameMap(
        offScreenContext,
        width,
        height,
        showEnemyHealth,
        endGame,
        updateScore
      );

      function drawGame() {
        // Clear the off-screen canvas
        offScreenContext?.clearRect(
          0,
          0,
          offScreenCanvas.width,
          offScreenCanvas.height
        );

        // Draw the game objects to the off-screen canvas
        map.draw();

        // Copy the entire off-screen canvas to the on-screen canvas
        context?.drawImage(offScreenCanvas, 0, 0);
      }

      const render = () => {
        // This animates the next frame
        animationFrameId = window.requestAnimationFrame(render);
        // map.draw();

        // Framerate handling
        const now = Date.now();
        const delta = now - then;
        if (delta > fpsInterval) {
          then = now - (delta % fpsInterval);

          if (leftMouseDown) {
            map.player.shoot(cursorPosition);
          }

          drawGame();

          // Update functions
          setNumEnemies(map.enemies.size);
          setNumProjectiles(map.player.projectiles.size);
          setNumParticles(map.particles.size);
        }
      };

      render();

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.ctrlKey && event.altKey && event.key === "d") {
          setShowDebugInfo((prev) => !prev);
        }
        map.player.handleKeyDown(event);
      };

      const handleKeyUp = (event: KeyboardEvent) => {
        map.player.handleKeyUp(event);
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

      const handleVisibilityChange = () => {
        map.pause(document.hidden);
      };

      canvas.addEventListener("mousemove", mouseMovementEvent, false);
      canvas.addEventListener("mousedown", onMouseDown);
      canvas.addEventListener("mouseup", onMouseUp);
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        window.cancelAnimationFrame(animationFrameId);
        canvas.removeEventListener("mousemove", mouseMovementEvent);
        canvas.removeEventListener("mousedown", onMouseDown);
        canvas.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        map.stopSpawnenemies();
      };
    }
  }, [width, height, showEnemyHealth, gameState]);

  if (isLoading || !gameId)
    return (
      <div className="flex h-screen w-full items-center justify-center border border-gray-400 bg-black text-lg text-white">
        Loading game...
      </div>
    );

  return (
    <div className="select-none border border-gray-400 bg-black">
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

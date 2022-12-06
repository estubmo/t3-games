import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { trpc } from "@utils/trpc";
import Link from "next/link";
import type { SetStateAction } from "react";
import React, { useState } from "react";
import type { GameState } from "./TINSGame";
import clsx from "clsx";

type StarScreenProps = {
  gameId: string;
  gameState: GameState;
  setGameState: (value: SetStateAction<GameState>) => void;
  name?: string;
  score: number;
  onSaveName: (name: string) => void;
  onSaveScore: (name: string) => void;
  showEnemyHealth: boolean;
  onShowEnemyHealth: (value: SetStateAction<boolean>) => void;
};

const StartScreen: React.FC<StarScreenProps> = ({
  gameId,
  gameState,
  setGameState,
  name,
  score,
  onSaveName,
  onSaveScore,
  showEnemyHealth,
  onShowEnemyHealth,
}) => {
  const [tempName, setTempName] = useState(name);

  const topTenScores = trpc.score.topTenByGameId.useQuery({
    gameId,
  });
  const topTenScoresAray = topTenScores?.data?.map((x) => x.score) || [];
  const lowestScore = Math.min(...topTenScoresAray);
  const isNewHighScore = score > lowestScore;

  const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Use a regular expression to remove disallowed characters
    const sanitizedValue = value.replace(/[^a-zA-Z0-9_]/g, "");
    setTempName(sanitizedValue);
  };

  const onSaveNameClick = () => {
    if (!tempName) return;
    onSaveName(tempName);
    onSaveScore(tempName);
    setGameState("HIGHSCORE");
  };

  if (gameState === "ENDED" && isNewHighScore && !name) setGameState("ADDNAME");
  if (gameState === "ENDED" && isNewHighScore && name) {
    setGameState("HIGHSCORE");
    onSaveScore(name);
  }

  const nameSpan = (
    <>
      <span className="font-bold text-green-700">
        {name ? " " + name : name}
      </span>
      ,
    </>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="relative flex w-full max-w-md select-text flex-col items-center justify-center rounded bg-white px-10 py-4">
        <Link className="absolute top-0 left-0 p-2" href="/">
          <ArrowLeftIcon className="h-6 w-6" />
        </Link>

        {gameState === "ENDED" && (
          <>
            <p className="text text-gray-700">
              Unfortunately{nameSpan} you need another {lowestScore - score + 1}{" "}
              points to get into the top 10.
            </p>
            <div className="py-2" />
          </>
        )}

        {(gameState === "HIGHSCORE" || gameState === "ADDNAME") && (
          <>
            <p className="text text-gray-700">
              Congratulations{nameSpan} your score is in the top 10!
            </p>
            <div className="py-2" />
          </>
        )}

        <h1 className="text-4xl font-bold">{score}</h1>
        <p className="text-sm text-gray-700">Points</p>

        <div className="py-2" />

        {gameState === "ADDNAME" && (
          <>
            <div className="">How would you like to be remembered?</div>

            <div className="flex w-full gap-2 p-4">
              <input
                type="text"
                pattern="[^a-zA-Z0-9_]"
                className="w-full rounded-sm bg-gray-100 p-2"
                placeholder="Name"
                onChange={handleChangeName}
              />
            </div>

            <button
              className={clsx("text-md w-full rounded-full  p-2 text-white", {
                " bg-blue-500": tempName,
                "cursor-not-allowed bg-gray-300": !tempName,
              })}
              onClick={onSaveNameClick}
              disabled={!tempName}
            >
              Save Name
            </button>
            <button
              className="text-md w-full p-2 text-blue-500"
              onClick={() => setGameState("RUNNING")}
            >
              Restart Game
            </button>
          </>
        )}

        {(gameState === "HIGHSCORE" ||
          gameState === "ENDED" ||
          gameState === "WELCOME") && (
          <button
            className="text-md w-full rounded-full bg-blue-500 p-2 text-white"
            onClick={() => setGameState("RUNNING")}
          >
            Start Game
          </button>
        )}
        <div className="py-2"></div>
        <div className="flex gap-2 pt-1 text-sm">
          <p>Show enemy health:</p>
          <input
            type="checkbox"
            checked={showEnemyHealth}
            onChange={() => onShowEnemyHealth((prev) => !prev)}
          />
        </div>
      </div>
    </div>
  );
};

export default StartScreen;

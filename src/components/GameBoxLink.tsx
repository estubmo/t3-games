import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { type Game } from "@server/trpc/router/game";
import Link from "next/link";

const GameBoxLink = (game: Game): JSX.Element => {
  const { name, description, shortName } = game;

  return (
    <Link
      className="relative flex max-w-xs scale-90 flex-col gap-4 rounded-xl bg-white/10 p-4 text-white drop-shadow-none transition  ease-in-out hover:scale-100 hover:bg-white/20 hover:drop-shadow-lg"
      href={shortName}
    >
      <div className="absolute top-0 right-0 p-4">
        <ArrowRightIcon className="h-6 w-6" />
      </div>
      <h3 className="text-2xl font-bold text-green-400"> {name} </h3>
      <div className="text-lg">{description} </div>
    </Link>
  );
};

export default GameBoxLink;

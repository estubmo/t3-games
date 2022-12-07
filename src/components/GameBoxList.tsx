import { trpc } from "@utils/trpc";
import Image from "next/image";
import GameBoxLink from "./GameBoxLink";

const GameBoxList = (): JSX.Element => {
  const { data: games, isLoading } = trpc.game.getAll.useQuery();

  if (isLoading)
    return (
      <div>
        <Image alt="loading" height={100} width={100} src="/rings.svg" />
      </div>
    );

  if (!games) return <div>No games in the library</div>;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
      {games.map((game) => (
        <GameBoxLink key={game.id} {...game} />
      ))}
    </div>
  );
};

export default GameBoxList;

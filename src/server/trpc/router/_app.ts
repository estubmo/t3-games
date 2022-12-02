import { router } from "../trpc";
import { authRouter } from "./auth";
import { gameRouter } from "./game";
import { scoreRouter } from "./score";

export const appRouter = router({
  game: gameRouter,
  score: scoreRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

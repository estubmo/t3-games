import { z } from "zod";

import { router, publicProcedure } from "../trpc";
import { Score } from "./score";

export const Game = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string(),
  description: z.nullable(z.string()),
  scores: z.optional(z.array(Score)),
});

export type Game = z.infer<typeof Game>;

export const gameRouter = router({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.game.findMany();
  }),
  byShortName: publicProcedure
    .input(z.object({ shortName: z.string() }))
    .query(({ ctx, input }) => {
      const { shortName } = input;
      return ctx.prisma.game.findUnique({
        where: {
          shortName,
        },
      });
    }),
});

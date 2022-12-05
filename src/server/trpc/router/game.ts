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
  addScoreByGameShortName: publicProcedure
    .input(
      z.object({ score: z.number(), name: z.string(), shortName: z.string() })
    )
    .mutation(({ ctx, input }) => {
      const { shortName, name, score } = input;
      ctx.prisma.game
        .findUnique({
          where: {
            shortName,
          },
        })
        .then((game) => {
          return ctx.prisma.score.create({
            data: {
              gameId: game?.id,
              name,
              score,
            },
          });
        });
    }),
});

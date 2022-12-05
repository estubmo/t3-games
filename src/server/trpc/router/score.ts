import { z } from "zod";

import { router, publicProcedure } from "../trpc";

export const Score = z.object({
  id: z.string(),
  createdAt: z.date(),
  score: z.number(),
  name: z.string(),
  gameId: z.string(),
});

export type Score = z.infer<typeof Score>;

export const scoreRouter = router({
  byGameId: publicProcedure
    .input(
      z.object({
        gameId: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      const { gameId } = input;
      return ctx.prisma.score.findMany({
        where: { gameId },
      });
    }),
  topTenByGameId: publicProcedure
    .input(
      z.object({
        gameId: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      const { gameId } = input;
      return ctx.prisma.score.findMany({
        where: { gameId },
        orderBy: { score: "desc" },
        take: 10,
      });
    }),
  addScoreByGameId: publicProcedure
    .input(
      z.object({ score: z.number(), name: z.string(), gameId: z.string() })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.score.create({
        data: {
          ...input,
        },
      });
    }),
});

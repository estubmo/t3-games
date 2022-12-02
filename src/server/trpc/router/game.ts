import { z } from "zod";

import { router, publicProcedure } from "../trpc";

const Score = z.object({
  id: z.string(),
  createdAt: z.date(),
  score: z.number(),
  name: z.string(),
  gameId: z.string(),
});
const Game = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string(),
  description: z.nullable(z.string()),
});

export type Score = z.infer<typeof Score>;
export type Game = z.infer<typeof Game>;

export const gameRouter = router({
  getGame: publicProcedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.game.findMany();
  }),
});

import { type NextApiRequest, type NextApiResponse } from "next";

import { prisma } from "../../server/db/client";

const scores = async (req: NextApiRequest, res: NextApiResponse) => {
  const scores = await prisma.score.findMany();
  res.status(200).json(scores);
};

export default scores;

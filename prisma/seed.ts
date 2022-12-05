import { prisma } from "../src/server/db/client";
import { v4 as uuidv4 } from "uuid";

async function main() {
  await prisma.game.deleteMany();
  let id = uuidv4();
  console.log(
    "%cLMKG%cline:6%cid",
    "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
    "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
    "color:#fff;background:rgb(118, 77, 57);padding:3px;border-radius:2px",
    id
  );
  let name = "There Is No Sun";
  let description =
    "A 2D HTML5 Canvas Space Shoot 'Em Up. \nOf course my first game is a space shooter. Anyway, my first game. Yay!";
  let shortName = "tins";

  await prisma.game.upsert({
    where: {
      id,
    },
    create: {
      id,
      name,
      description,
      shortName,
    },
    update: {},
  });

  id = uuidv4();
  console.log(
    "%cLMKG%cline:26%cid",
    "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
    "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
    "color:#fff;background:rgb(252, 157, 154);padding:3px;border-radius:2px",
    id
  );
  name = "React Three Fiber";
  description = "Just a canvas for a React Three Fiber game. [WIP]";
  shortName = "r3f";

  await prisma.game.upsert({
    where: {
      id,
    },
    create: {
      id,
      name,
      description,
      shortName,
    },
    update: {},
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

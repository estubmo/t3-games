/*
  Warnings:

  - A unique constraint covering the columns `[shortName]` on the table `Game` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Game_shortName_key" ON "Game"("shortName");

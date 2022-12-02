/*
  Warnings:

  - You are about to drop the column `url` on the `Game` table. All the data in the column will be lost.
  - Added the required column `shortName` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "shortName" TEXT NOT NULL
);
INSERT INTO "new_Game" ("description", "id", "name") SELECT "description", "id", "name" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateEnum
CREATE TYPE "HeroClass" AS ENUM ('WARRIOR', 'TANK', 'ASSASSIN', 'MAGE');

-- CreateTable
CREATE TABLE "Hero" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "class" "HeroClass" NOT NULL,
    "hp" INTEGER NOT NULL,
    "atk" INTEGER NOT NULL,
    "res" INTEGER NOT NULL,
    "speed" INTEGER NOT NULL,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "inventory" TEXT[],

    CONSTRAINT "Hero_pkey" PRIMARY KEY ("id")
);

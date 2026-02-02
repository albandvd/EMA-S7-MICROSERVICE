import { HeroRepositoryPort } from "../../application/ports/outbound/HeroRepositoryPort";
import { Hero } from "../../../generated/prisma/client";
import { prisma } from "../db/prisma";

export class PrismaHeroRepository implements HeroRepositoryPort {
	async findAll(): Promise<Hero[]> {
		return await prisma.hero.findMany();
	}

	async findById(id: string): Promise<Hero | null> {
		return await prisma.hero.findUnique({ where: { id } });
	}

	async create(heroData: Omit<Hero, "id">): Promise<Hero> {
		return await prisma.hero.create({
			data: heroData,
		});
	}

	async update(id: string, heroData: Partial<Hero>): Promise<Hero> {
		return await prisma.hero.update({
			where: { id },
			data: heroData,
		});
	}

	async delete(id: string): Promise<void> {
		await prisma.hero.delete({ where: { id } });
	}
}

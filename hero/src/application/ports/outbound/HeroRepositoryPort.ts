import { Hero } from "../../../../generated/prisma/client";

export interface HeroRepositoryPort {
	findAll(): Promise<Hero[]>;
	findById(id: string): Promise<Hero | null>;
	create(hero: Omit<Hero, "id">): Promise<Hero>;
	update(id: string, hero: Partial<Hero>): Promise<Hero>;
	delete(id: string): Promise<void>;
}

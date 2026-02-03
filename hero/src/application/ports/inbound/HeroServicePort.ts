import { Hero, HeroClass } from "../../../../generated/prisma/client";

export interface HeroServicePort {
	listAllHeroes(): Promise<Hero[]>;
	getHero(id: string): Promise<Hero | null>;
	createNewHero(heroData: { name: string; class: HeroClass }): Promise<Hero>;
	updateHero(id: string, heroData: Partial<Hero>): Promise<Hero>;
	deleteHero(id: string): Promise<void>;
	getHeroInventory(id: string): Promise<string[]>;
	addItemToHero(id: string, item: string): Promise<Hero>;
	removeItemFromHero(id: string, item: string): Promise<Hero>;
}

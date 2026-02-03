import { HeroServicePort } from "../../application/ports/inbound/HeroServicePort";
import { HeroRepositoryPort } from "../../application/ports/outbound/HeroRepositoryPort";
import { Hero, HeroClass } from "../../../generated/prisma/client";
import { NotFoundError } from "../error/NotFoundError";

export class HeroService implements HeroServicePort {
	constructor(private readonly heroRepository: HeroRepositoryPort) {}

	private getDefaultStatsForClass(heroClass: HeroClass) {
		const statsMap = {
			[HeroClass.WARRIOR]: { hp: 100, atk: 15, res: 10, speed: 10 },
			[HeroClass.TANK]: { hp: 150, atk: 8, res: 20, speed: 5 },
			[HeroClass.ASSASSIN]: { hp: 80, atk: 20, res: 5, speed: 20 },
			[HeroClass.MAGE]: { hp: 70, atk: 25, res: 5, speed: 12 },
		};
		return statsMap[heroClass];
	}

	async listAllHeroes(): Promise<Hero[]> {
		return await this.heroRepository.findAll();
	}

	async getHero(id: string): Promise<Hero | null> {
		const hero = await this.heroRepository.findById(id);
		if (!hero) {
			throw new NotFoundError(`Héros avec l'ID ${id} introuvable`);
		}
		return hero;
	}

	async createNewHero(heroData: {
		name: string;
		class: HeroClass;
	}): Promise<Hero> {
		if (heroData.name.length < 3) {
			throw new Error("Le nom du héros est trop court");
		}
		const defaultStats = this.getDefaultStatsForClass(heroData.class);

		const newHero: Omit<Hero, "id"> = {
			name: heroData.name,
			class: heroData.class,
			...defaultStats,
			gold: 0,
			inventory: [],
		};

		return await this.heroRepository.create(newHero);
	}

	async updateHero(id: string, heroData: Partial<Hero>): Promise<Hero> {
		const existingHero = await this.heroRepository.findById(id);
		if (!existingHero) {
			throw new NotFoundError(
				`Impossible de mettre à jour : Héros ${id} introuvable`,
			);
		}

		return await this.heroRepository.update(id, heroData);
	}

	async deleteHero(id: string): Promise<void> {
		const existingHero = await this.heroRepository.findById(id);
		if (!existingHero) {
			throw new NotFoundError(
				`Impossible de supprimer : Héros ${id} introuvable`,
			);
		}

		await this.heroRepository.delete(id);
	}

	async getHeroInventory(id: string): Promise<string[]> {
		return this.heroRepository.findById(id).then(hero => {
			if (!hero) {
				throw new NotFoundError(`Héros avec l'ID ${id} introuvable`);
			}
			return hero.inventory;
		});
	}

	async addItemToHero(id: string, item: string): Promise<Hero> {
		const hero = await this.heroRepository.findById(id);
		if (!hero) {
			throw new NotFoundError(`Héros avec l'ID ${id} introuvable`);
		}
		const updatedInventory = [...hero.inventory, item];
		return await this.heroRepository.update(id, { inventory: updatedInventory });
	}

	async removeItemFromHero(id: string, itemId: string): Promise<Hero> {
		const hero = await this.heroRepository.findById(id);
		if (!hero) {
			throw new NotFoundError(`Héros avec l'ID ${id} introuvable`);
		}
		const updatedInventory = hero.inventory.filter(i => i !== itemId);
		return await this.heroRepository.update(id, { inventory: updatedInventory });
	}
}

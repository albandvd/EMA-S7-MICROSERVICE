import { HeroServicePort } from "../../application/ports/inbound/HeroServicePort";
import { Express, Response, Request } from "express";
import { NotFoundError } from "../../domain/error/NotFoundError";

export class HeroController {
	constructor(private readonly heroService: HeroServicePort) {}

	registerRoutes(app: Express) {
		app.get("/hero", this.listAllHeroes.bind(this));
		app.get("/hero/:uuid", this.getHeroById.bind(this));
		app.post("/hero", this.createHero.bind(this));
		app.put("/hero/:uuid", this.updateHero.bind(this));
		app.delete("/hero/:uuid", this.deleteHero.bind(this));
		app.post("/hero/:uuid/inventory", this.addItemToHero.bind(this));
		app.delete("/hero/:uuid/inventory", this.removeItemFromHero.bind(this));
		app.get("/hero/:uuid/inventory", this.getHeroInventory.bind(this));
	}

	async addItemToHero(req: Request, res: Response) {
		try {
			const uuid: string = req.params.uuid;
			const { item } = req.body;
			const updatedHero = await this.heroService.addItemToHero(uuid, item);
			res.status(200).json(updatedHero);
		} catch (error) {
			if (error instanceof NotFoundError) {
				return res.status(404).json({ error: error.message });
			}
			res.status(500).json({ error: "Erreur serveur interne" });
		}
	}

	async removeItemFromHero(req: Request, res: Response) {
		try {
			const uuid: string = req.params.uuid;
			const { item } = req.body;
			const updatedHero = await this.heroService.removeItemFromHero(uuid, item);
			res.status(200).json(updatedHero);
		} catch (error) {
			if (error instanceof NotFoundError) {
				return res.status(404).json({ error: error.message });
			}
			res.status(500).json({ error: "Erreur serveur interne" });
		}
	}

	async getHeroInventory(req: Request, res: Response) {
		try {
			const uuid: string = req.params.uuid;
			const inventory = await this.heroService.getHeroInventory(uuid);
			res.status(200).json(inventory);
		} catch (error) {
			if (error instanceof NotFoundError) {
				return res.status(404).json({ error: error.message });
			}
			res.status(500).json({ error: "Erreur serveur interne" });
		}
	}

	async listAllHeroes(req: Request, res: Response) {
		const heroes = await this.heroService.listAllHeroes();
		res.status(200).send(heroes);
	}

	async getHeroById(req: Request, res: Response) {
		try {
			const uuid: string = req.params.uuid;
			const hero = await this.heroService.getHero(uuid);
			res.status(200).json(hero);
		} catch (error) {
			if (error instanceof NotFoundError) {
				return res.status(404).json({ error: error.message });
			}
			res.status(500).json({ error: "Erreur serveur interne" });
		}
	}

	async createHero(req: Request, res: Response) {
		try {
			const newHero = await this.heroService.createNewHero(req.body);
			res.status(201).json(newHero);
		} catch (err) {
			res
				.status(400)
				.json({ error: "Données invalides : nom (min 3) et classe requis" });
		}
	}

	async updateHero(req: Request, response: Response) {
		try {
			const uuid: string = req.params.uuid;
			const { hp, atk, res, speed, gold, inventory } = req.body;
			const updatedHero = await this.heroService.updateHero(uuid, {
				hp,
				atk,
				res,
				speed,
				gold,
				inventory,
			});
			response.status(200).send(updatedHero);
		} catch (error) {
			if (error instanceof NotFoundError) {
				return response.status(404).json({ error: error.message });
			}
			response.status(500).json({ error: "Erreur serveur interne" });
		}
	}

	async deleteHero(req: Request, res: Response) {
		try {
			const uuid: string = req.params.uuid;
			await this.heroService.deleteHero(uuid);
			res.status(204).send({ message: "Hero deleted successfully." });
		} catch (error) {
			if (error instanceof NotFoundError) {
				return res.status(404).json({ error: error.message });
			}
			res.status(500).json({ error: "Erreur serveur interne" });
		}
	}
}

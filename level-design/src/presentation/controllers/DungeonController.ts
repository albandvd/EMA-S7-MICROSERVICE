import { Request, Response, Express } from "express";
import { DungeonServicePort } from "../../application/ports/inbound/DungeonServicePort";
import { GenerationError } from "../../domain/errors/GenerationError";

export class DungeonController {
	constructor(private readonly dungeonService: DungeonServicePort) {}

	registerRoutes(app: Express) {
		app.post("/dungeon/generate", this.generate.bind(this));
	}

	async generate(req: Request, res: Response): Promise<void> {
		try {
			const dungeon = await this.dungeonService.generateDungeon();
			res.status(200).json(dungeon);
		} catch (error) {
			console.error(error);
			if (error instanceof GenerationError) {
				res.status(400).json({ error: error.message });
			} else {
				res.status(500).json({ error: "Internal Server Error" });
			}
		}
	}
}

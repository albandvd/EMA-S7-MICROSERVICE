import { Dungeon } from "../../../domain/models/Dungeon";

export interface DungeonServicePort {
	generateDungeon(): Promise<Dungeon>;
}

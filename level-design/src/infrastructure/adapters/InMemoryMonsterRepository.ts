import { MonsterRepositoryPort } from "../../application/ports/outbound/MonsterRepositoryPort";
import { Monster } from "../../domain/models/Monster";

const MONSTER_DB: Monster[] = [
	{
		id: "ram",
		name: "Barette de RAM",
		stats: { hp: 20, atk: 8, res: 1, vit: 20, gold: 25 },
	},
	{
		id: "goblin",
		name: "Gobelin",
		stats: { hp: 45, atk: 8, res: 2, vit: 12, gold: 10 },
	},
	{
		id: "slime",
		name: "Slime Acide",
		stats: { hp: 60, atk: 6, res: 5, vit: 5, gold: 8 },
	},
	{
		id: "bat",
		name: "Chauve-souris",
		stats: { hp: 25, atk: 10, res: 0, vit: 18, gold: 6 },
	},
];

const BOSS_DB: Monster[] = [
	{
		id: "clebart",
		name: "Cléb'art le Terrible",
		stats: { hp: 150, atk: 28, res: 15, vit: 25, gold: 100 },
	},
	{
		id: "boulangeart",
		name: "Boulange'art le Cruel",
		stats: { hp: 150, atk: 35, res: 15, vit: 15, gold: 100 },
	},
];

export class InMemoryMonsterRepository implements MonsterRepositoryPort {
	private randomIndex(max: number): number {
		return Math.floor(Math.random() * max);
	}
	getRandomMonsterTemplate(): Monster {
		const index = this.randomIndex(MONSTER_DB.length);
		return MONSTER_DB[index];
	}
	getBossTemplate(): Monster {
		const index = this.randomIndex(BOSS_DB.length);
		return BOSS_DB[index];
	}
}

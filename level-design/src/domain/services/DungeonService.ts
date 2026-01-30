import { DungeonServicePort } from "../../application/ports/inbound/DungeonServicePort";
import { MonsterRepositoryPort } from "../../application/ports/outbound/MonsterRepositoryPort";
import { DialogueRepositoryPort } from "../../application/ports/outbound/DialogRepositoryPort";
import { Dungeon } from "../models/Dungeon";
import { Room } from "../models/Room";
import { v4 as uuidv4 } from "uuid";
import { Monster } from "../models/Monster";
import { BattleStats } from "../models/BattleStats";

export class DungeonService implements DungeonServicePort {
	private static readonly MAX_DUNGEON_SIZE = 10;
	private static readonly MIN_DUNGEON_SIZE = 5;
	constructor(
		private readonly monsterRepo: MonsterRepositoryPort,
		private readonly dialogRepo: DialogueRepositoryPort
	) {}

	async generateDungeon(): Promise<Dungeon> {
		const dungeonSize =
			Math.floor(
				Math.random() *
					(DungeonService.MAX_DUNGEON_SIZE -
						DungeonService.MIN_DUNGEON_SIZE +
						1)
			) + DungeonService.MIN_DUNGEON_SIZE;
		const rooms: Room[] = [];

		for (let i = 0; i < dungeonSize; i++) {
			const isBossRoom: boolean = i === dungeonSize - 1;
			const roomId = uuidv4();

			let monster: Monster | null = null;

			if (isBossRoom) {
				monster = this.scaleMonster(this.monsterRepo.getBossTemplate(), i);
			} else {
				monster = this.scaleMonster(
					this.monsterRepo.getRandomMonsterTemplate(),
					i
				);
			}

			const room: Room = {
				id: roomId,
				index: i,
				dialogue: this.dialogRepo.getRandomDialogue(),
				monster: monster,
				nextRoomIds: [],
			};

			rooms.push(room);
		}

		// Adding links between rooms
		for (let i = 0; i < rooms.length - 1; i++) {
			rooms[i].nextRoomIds.push(rooms[i + 1].id);
		}

		const dungeon: Dungeon = {
			id: uuidv4(),
			rooms: rooms,
		};

		return dungeon;
	}
	private scaleMonster(monster: Monster, dungeonIndex: number): Monster {
		const multiplier = 1 + dungeonIndex * 0.2;
		const newStats: BattleStats = {
			hp: Math.floor(monster.stats.hp * multiplier),
			atk: Math.floor(monster.stats.atk * multiplier),
			res: Math.floor(monster.stats.res * multiplier),
			vit: Math.floor(monster.stats.vit * multiplier),
			gold: Math.floor(monster.stats.gold * multiplier),
		};

		const scaledMonster: Monster = {
			...monster,
			stats: newStats,
		};

		return scaledMonster;
	}
}

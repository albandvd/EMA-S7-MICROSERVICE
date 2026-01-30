import { DungeonService } from "./DungeonService";
import { MonsterRepositoryPort } from "../../application/ports/outbound/MonsterRepositoryPort";
import { DialogRepositoryPort } from "../../application/ports/outbound/DialogRepositoryPort";
import { Monster } from "../models/Monster";

const DUMMY_MONSTER: Monster = {
	id: "rat_test",
	name: "Rat Test",
	stats: { hp: 100, atk: 10, res: 5, vit: 10, gold: 10 },
};

const DUMMY_BOSS: Monster = {
	id: "boss_test",
	name: "Boss Test",
	stats: { hp: 1000, atk: 50, res: 20, vit: 20, gold: 100 },
};

describe("DungeonService", () => {
	let service: DungeonService;
	let mockMonsterRepo: jest.Mocked<MonsterRepositoryPort>;
	let mockDialogueRepo: jest.Mocked<DialogRepositoryPort>;

	beforeEach(() => {
		mockMonsterRepo = {
			getRandomMonsterTemplate: jest.fn().mockReturnValue(DUMMY_MONSTER),
			getBossTemplate: jest.fn().mockReturnValue(DUMMY_BOSS),
		};

		mockDialogueRepo = {
			getRandomDialogue: jest.fn().mockReturnValue("Dialogue de test"),
		};

		service = new DungeonService(mockMonsterRepo, mockDialogueRepo);
	});

	it("devrait générer un donjon avec un ID et des salles", async () => {
		const dungeon = await service.generateDungeon();

		expect(dungeon).toBeDefined();
		expect(dungeon.id).toBeDefined();
		expect(Array.isArray(dungeon.rooms)).toBe(true);
	});

	it("devrait générer un nombre de salles compris entre 5 et 10", async () => {
		for (let i = 0; i < 20; i++) {
			const dungeon = await service.generateDungeon();
			expect(dungeon.rooms.length).toBeGreaterThanOrEqual(5);
			expect(dungeon.rooms.length).toBeLessThanOrEqual(10);
		}
	});

	it("devrait relier les salles entre elles (Chaînage)", async () => {
		const dungeon = await service.generateDungeon();
		const rooms = dungeon.rooms;

		for (let i = 0; i < rooms.length - 1; i++) {
			const currentRoom = rooms[i];
			const nextRoom = rooms[i + 1];

			expect(currentRoom.nextRoomIds).toContain(nextRoom.id);
		}

		const lastRoom = rooms[rooms.length - 1];
		expect(lastRoom.nextRoomIds).toHaveLength(0);
	});

	it("devrait augmenter la difficulté (Scaling) en fonction de l'index", async () => {
		const dungeon = await service.generateDungeon();
		const firstRoom = dungeon.rooms[0]; // Index 0
		const secondRoom = dungeon.rooms[1]; // Index 1

		expect(firstRoom.monster?.stats.hp).toBe(100);

		expect(secondRoom.monster?.stats.hp).toBe(120);

		expect(firstRoom.monster?.name).toBe("Rat Test");
	});

	it("devrait placer le Boss dans la dernière salle", async () => {
		const dungeon = await service.generateDungeon();
		const lastRoom = dungeon.rooms[dungeon.rooms.length - 1];

		expect(mockMonsterRepo.getBossTemplate).toHaveBeenCalled();

		expect(lastRoom.monster?.id).toBe(DUMMY_BOSS.id);

		expect(lastRoom.monster?.stats.hp).toBeGreaterThan(1000);
	});

	it("devrait assigner un dialogue à chaque salle", async () => {
		const dungeon = await service.generateDungeon();

		dungeon.rooms.forEach((room) => {
			expect(room.dialogue).toBe("Dialogue de test");
		});

		expect(mockDialogueRepo.getRandomDialogue).toHaveBeenCalledTimes(
			dungeon.rooms.length
		);
	});
});

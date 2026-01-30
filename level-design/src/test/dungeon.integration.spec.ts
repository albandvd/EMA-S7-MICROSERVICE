import request from "supertest";
import { app } from "../application/app"; // On importe l'app configurée

describe("Integration Tests - LevelDesign API", () => {
	describe("GET /", () => {
		it("devrait retourner 200 et 'Hello World!'", async () => {
			const response = await request(app).get("/");

			expect(response.status).toBe(200);
			expect(response.text).toBe("Hello World!");
		});
	});

	describe("POST /dungeon/generate", () => {
		it("devrait générer un donjon complet, valide et structuré via HTTP", async () => {
			const response = await request(app).post("/dungeon/generate");

			expect(response.status).toBe(200);

			const dungeon = response.body;

			expect(dungeon).toHaveProperty("id");
			expect(dungeon).toHaveProperty("rooms");
			expect(Array.isArray(dungeon.rooms)).toBe(true);

			expect(dungeon.rooms.length).toBeGreaterThanOrEqual(5);
			expect(dungeon.rooms.length).toBeLessThanOrEqual(10);

			const lastRoom = dungeon.rooms[dungeon.rooms.length - 1];
			const validBossIds = ["clebart", "boulangeart"];

			expect(lastRoom.monster).toBeDefined();
			expect(validBossIds).toContain(lastRoom.monster.id);

			const firstRoomMonster = dungeon.rooms[0].monster;
			const bossMonster = lastRoom.monster;

			if (firstRoomMonster && bossMonster) {
				expect(bossMonster.stats.hp).toBeGreaterThan(firstRoomMonster.stats.hp);
			}
		});
	});
});

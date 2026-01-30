import { InMemoryMonsterRepository } from "./InMemoryMonsterRepository";

describe("InMemoryMonsterRepository", () => {
	let repository: InMemoryMonsterRepository;

	beforeEach(() => {
		repository = new InMemoryMonsterRepository();
	});

	describe("getRandomMonsterTemplate", () => {
		it("devrait retourner un monstre valide de la liste DB", () => {
			const monster = repository.getRandomMonsterTemplate();

			const validIds = ["ram", "goblin", "slime", "bat"];

			expect(monster).toBeDefined();
			expect(validIds).toContain(monster.id);
			expect(monster.name).toBeTruthy();
		});

		it("devrait retourner un monstre avec des stats valides", () => {
			const monster = repository.getRandomMonsterTemplate();

			expect(monster.stats).toBeDefined();
			expect(monster.stats.hp).toBeGreaterThan(0);
			expect(monster.stats.gold).toBeGreaterThan(0);
		});
	});

	describe("getBossTemplate", () => {
		it("devrait retourner un des boss de la liste (Cléb'art ou Boulange'art)", () => {
			const boss = repository.getBossTemplate();

			const validBossIds = ["clebart", "boulangeart"];

			expect(boss).toBeDefined();
			expect(validBossIds).toContain(boss.id);

			expect(boss.stats.hp).toBeGreaterThanOrEqual(150);
		});

		it("devrait pouvoir être appelé plusieurs fois (test de robustesse aléatoire)", () => {
			for (let i = 0; i < 20; i++) {
				const boss = repository.getBossTemplate();
				expect(["clebart", "boulangeart"]).toContain(boss.id);
			}
		});
	});
});

import { InMemoryDialogRepository } from "./InMemoryDialogRepository";

describe("InMemoryDialogRepository", () => {
	let repository: InMemoryDialogRepository;

	beforeEach(() => {
		repository = new InMemoryDialogRepository();
	});

	describe("getRandomDialogue", () => {
		it("devrait retourner une chaîne de caractères", () => {
			const dialogue = repository.getRandomDialogue();

			expect(typeof dialogue).toBe("string");
		});

		it("devrait retourner un dialogue non vide", () => {
			const dialogue = repository.getRandomDialogue();

			expect(dialogue.length).toBeGreaterThan(0);
		});

		it("devrait retourner un dialogue différent (probabiliste)", () => {
			const dialoguesSet = new Set<string>();

			for (let i = 0; i < 50; i++) {
				dialoguesSet.add(repository.getRandomDialogue());
			}

			expect(dialoguesSet.size).toBeGreaterThan(1);
		});
	});
});

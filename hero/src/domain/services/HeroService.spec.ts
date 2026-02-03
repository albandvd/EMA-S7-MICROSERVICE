import { HeroService } from "./HeroService";
import { HeroRepositoryPort } from "../../application/ports/outbound/HeroRepositoryPort";
import { Hero, HeroClass } from "../../../generated/prisma/client";
import { NotFoundError } from "../error/NotFoundError";

const MOCK_HERO: Hero = {
	id: "uuid-123",
	name: "Lancelot",
	class: HeroClass.WARRIOR,
	hp: 100,
	atk: 15,
	res: 10,
	speed: 10,
	gold: 0,
	inventory: [],
};

describe("HeroService", () => {
	let service: HeroService;
	let mockRepo: jest.Mocked<HeroRepositoryPort>;

	beforeEach(() => {
		mockRepo = {
			findAll: jest.fn(),
			findById: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		};

		service = new HeroService(mockRepo);
	});

	describe("createNewHero", () => {
		it("devrait créer un WARRIOR avec les stats par défaut correctes", async () => {
			mockRepo.create.mockResolvedValue(MOCK_HERO);

			const result = await service.createNewHero({
				name: "Lancelot",
				class: HeroClass.WARRIOR,
			});

			expect(mockRepo.create).toHaveBeenCalledWith(
				expect.objectContaining({
					name: "Lancelot",
					class: "WARRIOR",
					hp: 100,
					atk: 15,
					gold: 0,
				}),
			);
			expect(result).toEqual(MOCK_HERO);
		});

		it("devrait créer un MAGE avec les stats par défaut correctes", async () => {
			mockRepo.create.mockResolvedValue({
				...MOCK_HERO,
				class: HeroClass.MAGE,
			});

			await service.createNewHero({ name: "Merlin", class: HeroClass.MAGE });

			expect(mockRepo.create).toHaveBeenCalledWith(
				expect.objectContaining({
					class: "MAGE",
					hp: 70,
					atk: 25,
				}),
			);
		});

		it("devrait lancer une erreur si le nom est trop court (< 3)", async () => {
			await expect(
				service.createNewHero({ name: "Jo", class: HeroClass.TANK }),
			).rejects.toThrow("Le nom du héros est trop court");

			expect(mockRepo.create).not.toHaveBeenCalled();
		});
	});

	describe("getHero", () => {
		it("devrait retourner un héros s'il existe", async () => {
			mockRepo.findById.mockResolvedValue(MOCK_HERO);

			const result = await service.getHero("uuid-123");
			expect(result).toEqual(MOCK_HERO);
		});

		it("devrait lancer NotFoundError si le héros n'existe pas", async () => {
			mockRepo.findById.mockResolvedValue(null);

			await expect(service.getHero("uuid-inconnu")).rejects.toBeInstanceOf(
				NotFoundError,
			);
		});
	});

	describe("updateHero", () => {
		it("devrait mettre à jour si le héros existe", async () => {
			mockRepo.findById.mockResolvedValue(MOCK_HERO); // Le héros existe
			mockRepo.update.mockResolvedValue({ ...MOCK_HERO, gold: 100 });

			const result = await service.updateHero("uuid-123", { gold: 100 });

			expect(mockRepo.update).toHaveBeenCalledWith("uuid-123", { gold: 100 });
			expect(result.gold).toBe(100);
		});

		it("devrait lancer NotFoundError si on tente de mettre à jour un héros inexistant", async () => {
			mockRepo.findById.mockResolvedValue(null);

			await expect(service.updateHero("uuid-123", {})).rejects.toBeInstanceOf(
				NotFoundError,
			);

			expect(mockRepo.update).not.toHaveBeenCalled();
		});
	});

	describe("deleteHero", () => {
		it("devrait supprimer si le héros existe", async () => {
			mockRepo.findById.mockResolvedValue(MOCK_HERO);

			await service.deleteHero("uuid-123");

			expect(mockRepo.delete).toHaveBeenCalledWith("uuid-123");
		});

		it("devrait lancer NotFoundError si le héros n'existe pas", async () => {
			mockRepo.findById.mockResolvedValue(null);

			await expect(service.deleteHero("uuid-123")).rejects.toBeInstanceOf(
				NotFoundError,
			);

			expect(mockRepo.delete).not.toHaveBeenCalled();
		});
	});

	describe("getHeroInventory", () => {
		it("devrait retourner l'inventaire d'un héros existant", async () => {
			mockRepo.findById.mockResolvedValue(MOCK_HERO);

			const result = await service.getHeroInventory("uuid-123");

			expect(result).toEqual(MOCK_HERO.inventory);
		});

		it("devrait lancer NotFoundError si le héros n'existe pas", async () => {
			mockRepo.findById.mockResolvedValue(null);

			await expect(service.getHeroInventory("uuid-inconnu")).rejects.toBeInstanceOf(
				NotFoundError,
			);
		});

		it("devrait lancer NotFoundError si le héros n'existe pas", async () => {
			mockRepo.findById.mockResolvedValue(null);

			await expect(service.deleteHero("uuid-123")).rejects.toBeInstanceOf(
				NotFoundError,
			);

			expect(mockRepo.delete).not.toHaveBeenCalled();
		});
	});

	describe("addItemToHero", () => {
		it("devrait ajouter un item à l'inventaire d'un héros existant", async () => {
			mockRepo.findById.mockResolvedValue(MOCK_HERO);
			mockRepo.update.mockResolvedValue({ ...MOCK_HERO, inventory: [...MOCK_HERO.inventory, "Potion"] });

			const result = await service.addItemToHero("uuid-123", "Potion");

			expect(mockRepo.update).toHaveBeenCalledWith("uuid-123", { inventory: [...MOCK_HERO.inventory, "Potion"] });
			expect(result.inventory).toEqual([...MOCK_HERO.inventory, "Potion"]);
		});

		it("devrait lancer NotFoundError si le héros n'existe pas", async () => {
			mockRepo.findById.mockResolvedValue(null);

			await expect(service.addItemToHero("uuid-inconnu", "Potion")).rejects.toBeInstanceOf(
				NotFoundError,
			);
		});
	});

	describe("removeItemFromHero", () => {
		it("devrait supprimer un item de l'inventaire d'un héros existant", async () => {
			mockRepo.findById.mockResolvedValue(MOCK_HERO);
			mockRepo.update.mockResolvedValue({ ...MOCK_HERO, inventory: MOCK_HERO.inventory.filter(i => i !== "Potion") });

			const result = await service.removeItemFromHero("uuid-123", "Potion");

			expect(mockRepo.update).toHaveBeenCalledWith("uuid-123", { inventory: MOCK_HERO.inventory.filter(i => i !== "Potion") });
			expect(result.inventory).toEqual(MOCK_HERO.inventory.filter(i => i !== "Potion"));
		});

		it("devrait lancer NotFoundError si le héros n'existe pas", async () => {
			mockRepo.findById.mockResolvedValue(null);

			await expect(service.removeItemFromHero("uuid-inconnu", "Potion")).rejects.toBeInstanceOf(
				NotFoundError,
			);
		});
	});
});

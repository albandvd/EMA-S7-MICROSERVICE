import { PrismaHeroRepository } from "./PrismaHeroRepository";
import { prisma } from "../db/prisma";
import { Hero, HeroClass } from "../../../generated/prisma/client";

jest.mock("../db/prisma", () => ({
	prisma: {
		hero: {
			findMany: jest.fn(),
			findUnique: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		},
	},
}));

const MOCK_HERO: Hero = {
	id: "123",
	name: "Test",
	class: HeroClass.WARRIOR,
	hp: 100,
	atk: 10,
	res: 10,
	speed: 10,
	gold: 0,
	inventory: [],
};

describe("PrismaHeroRepository", () => {
	let repository: PrismaHeroRepository;

	beforeEach(() => {
		repository = new PrismaHeroRepository();
		jest.clearAllMocks();
	});

	it("findAll devrait appeler prisma.hero.findMany", async () => {
		(prisma.hero.findMany as jest.Mock).mockResolvedValue([MOCK_HERO]);

		const result = await repository.findAll();

		expect(prisma.hero.findMany).toHaveBeenCalled();
		expect(result).toEqual([MOCK_HERO]);
	});

	it("findById devrait appeler prisma.hero.findUnique", async () => {
		(prisma.hero.findUnique as jest.Mock).mockResolvedValue(MOCK_HERO);

		const result = await repository.findById("123");

		expect(prisma.hero.findUnique).toHaveBeenCalledWith({
			where: { id: "123" },
		});
		expect(result).toEqual(MOCK_HERO);
	});

	it("create devrait appeler prisma.hero.create", async () => {
		(prisma.hero.create as jest.Mock).mockResolvedValue(MOCK_HERO);

		const { id, ...inputData } = MOCK_HERO;
		await repository.create(inputData);

		expect(prisma.hero.create).toHaveBeenCalledWith({ data: inputData });
	});

	it("update devrait appeler prisma.hero.update", async () => {
		(prisma.hero.update as jest.Mock).mockResolvedValue(MOCK_HERO);

		await repository.update("123", { gold: 50 });

		expect(prisma.hero.update).toHaveBeenCalledWith({
			where: { id: "123" },
			data: { gold: 50 },
		});
	});

	it("delete devrait appeler prisma.hero.delete", async () => {
		(prisma.hero.delete as jest.Mock).mockResolvedValue(MOCK_HERO);

		await repository.delete("123");

		expect(prisma.hero.delete).toHaveBeenCalledWith({ where: { id: "123" } });
	});
});

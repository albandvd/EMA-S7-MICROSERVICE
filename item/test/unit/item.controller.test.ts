import {
	getItems,
	createItem,
	getItemById,
	updateItem,
	deleteItem,
	getRandomItems,
} from "../../src/controllers/item.controller";
import { Request, Response } from "express";
import pool from "../../src/db";
import { isAuthenticated } from "../../src/middlewares/auth";

jest.mock("../../src/db", () => ({
	query: jest.fn(),
}));
jest.mock("../../src/middlewares/auth", () => ({
	isAuthenticated: jest.fn(),
}));

describe("Item Controller - Full Coverage", () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let jsonFn = jest.fn();
	let statusFn = jest.fn().mockReturnValue({ json: jsonFn, send: jest.fn() });

	beforeEach(() => {
		mockRequest = { params: {}, body: {} };
		mockResponse = { status: statusFn, json: jsonFn, send: jest.fn() };
		jest.clearAllMocks();
		(isAuthenticated as jest.Mock).mockReturnValue(true); // Par défaut, on est auth
	});

	// --- GET ALL ITEMS ---
	describe("getItems", () => {
		it("devrait retourner 401 si non authentifié", async () => {
			(isAuthenticated as jest.Mock).mockReturnValue(false);
			await getItems(mockRequest as Request, mockResponse as Response);
			expect(statusFn).toHaveBeenCalledWith(401);
		});

		it("devrait retourner 500 si la DB échoue", async () => {
			(pool.query as jest.Mock).mockRejectedValue(new Error("DB Error"));
			await getItems(mockRequest as Request, mockResponse as Response);
			expect(statusFn).toHaveBeenCalledWith(500);
		});
	});

	// --- CREATE ITEM ---
	describe("createItem", () => {
		it("devrait créer un item et retourner 201", async () => {
			mockRequest.body = { name: "Sword", atk: 10 };
			(pool.query as jest.Mock).mockResolvedValue({
				rows: [{ id: 1, name: "Sword" }],
			});
			await createItem(mockRequest as Request, mockResponse as Response);
			expect(statusFn).toHaveBeenCalledWith(201);
			expect(jsonFn).toHaveBeenCalledWith({ id: 1, name: "Sword" });
		});

		it("devrait retourner 400 si l'input est invalide", async () => {
			(pool.query as jest.Mock).mockRejectedValue(new Error("Invalid"));
			await createItem(mockRequest as Request, mockResponse as Response);
			expect(statusFn).toHaveBeenCalledWith(400);
		});
	});

	// --- GET ITEM BY ID ---
	describe("getItemById", () => {
		it("devrait retourner 404 si l'item n'existe pas", async () => {
			mockRequest.params = { id: "999" };
			(pool.query as jest.Mock).mockResolvedValue({ rows: [] });
			await getItemById(mockRequest as Request, mockResponse as Response);
			expect(statusFn).toHaveBeenCalledWith(404);
		});

		it("devrait retourner l'item si trouvé", async () => {
			mockRequest.params = { id: "1" };
			(pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 1 }] });
			await getItemById(mockRequest as Request, mockResponse as Response);
			expect(jsonFn).toHaveBeenCalledWith({ id: 1 });
		});
	});

	// --- UPDATE ITEM ---
	describe("updateItem", () => {
		it("devrait retourner 404 si l'item à updater n'existe pas", async () => {
			mockRequest.params = { id: "1" };
			(pool.query as jest.Mock).mockResolvedValue({ rows: [] });
			await updateItem(mockRequest as Request, mockResponse as Response);
			expect(statusFn).toHaveBeenCalledWith(404);
		});
	});

	// --- DELETE ITEM ---
	describe("deleteItem", () => {
		it("devrait retourner 204 en cas de succès", async () => {
			mockRequest.params = { id: "1" };
			(pool.query as jest.Mock).mockResolvedValue({ rowCount: 1 });
			await deleteItem(mockRequest as Request, mockResponse as Response);
			expect(mockResponse.status).toHaveBeenCalledWith(204);
		});

		it("devrait retourner 404 si rien à supprimer", async () => {
			mockRequest.params = { id: "1" };
			(pool.query as jest.Mock).mockResolvedValue({ rowCount: 0 });
			await deleteItem(mockRequest as Request, mockResponse as Response);
			expect(statusFn).toHaveBeenCalledWith(404);
		});
	});

	// --- GET RANDOM ITEMS ---
	describe("getRandomItems", () => {
		it("devrait retourner 400 si le nombre demandé est invalide", async () => {
			mockRequest.params = { nb: "abc" };
			await getRandomItems(mockRequest as Request, mockResponse as Response);
			expect(statusFn).toHaveBeenCalledWith(400);
		});

		it("devrait retourner 404 si la table est vide", async () => {
			mockRequest.params = { nb: "5" };
			(pool.query as jest.Mock).mockResolvedValue({ rows: [] });
			await getRandomItems(mockRequest as Request, mockResponse as Response);
			expect(statusFn).toHaveBeenCalledWith(404);
		});

		it("devrait retourner une liste mélangée", async () => {
			mockRequest.params = { nb: "1" };
			(pool.query as jest.Mock).mockResolvedValue({
				rows: [{ id: 1 }, { id: 2 }],
			});
			await getRandomItems(mockRequest as Request, mockResponse as Response);
			expect(jsonFn).toHaveBeenCalled();
			expect(Array.isArray(jsonFn.mock.calls[0][0])).toBe(true);
		});
	});
});

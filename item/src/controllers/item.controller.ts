import { Request, Response } from 'express';
import prisma from '../db.js';

export const getItems = async (req: Request, res: Response) => {
  try {
    const items = await prisma.item.findMany();
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

export const createItem = async (req: Request, res: Response) => {
  try {
    const { name, description, hp, atk, res: resistance, speed } = req.body;
    const item = await prisma.item.create({
      data: {
        name,
        description,
        hp,
        atk,
        res: resistance,
        speed,
      },
    });
    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Invalid input' });
  }
};

export const getItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const item = await prisma.item.findUnique({
      where: { id },
    });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { name, description, hp, atk, res: resistance, speed } = req.body;
    const item = await prisma.item.update({
      where: { id },
      data: {
        name,
        description,
        hp,
        atk,
        res: resistance,
        speed,
      },
    });
    res.json(item);
  } catch (error) {
    if ((error as any).code === 'P2025') {
      res.status(404).json({ error: 'Item not found' });
    } else {
      res.status(400).json({ error: 'Invalid input' });
    }
  }
};

export const deleteItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    await prisma.item.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    if ((error as any).code === 'P2025') {
      res.status(404).json({ error: 'Item not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete item' });
    }
  }
};

export const getRandomItems = async (req: Request, res: Response) => {
  try {
    const nb = Number.parseInt(String(req.params.nb), 10);
    if (isNaN(nb) || nb <= 0) {
      return res.status(400).json({ error: 'Invalid number of items requested' });
    }

    const items = await prisma.item.findMany();
    if (items.length === 0) {
      return res.status(404).json({ error: 'No items available' });
    }

    const shuffledItems = items.sort(() => 0.5 - Math.random());
    const selectedItems = shuffledItems.slice(0, Math.min(nb, items.length));

    res.json(selectedItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch random items' });
  }
}
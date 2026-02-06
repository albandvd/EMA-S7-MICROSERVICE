import { Request, Response } from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import pool from '../db.js';

export const getItems = async (req: Request, res: Response) => {
  // if (!isAuthenticated(req)) {
    // console.log(req.cookies)
    // return res.status(401).json({ error: 'Unauthorized' });
  // } else { 
    try {
      const { rows } = await pool.query('SELECT * FROM "items"');
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch items' });
    }
  // }
};

export const createItem = async (req: Request, res: Response) => {
  // if (!isAuthenticated(req)) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // } else { 
    try {
      const { name, description, hp, atk, res: resistance, speed } = req.body;
      const { rows } = await pool.query(
        'INSERT INTO "items" (name, description, hp, atk, res, speed) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [name, description, hp, atk, resistance, speed]
      );
      res.status(201).json(rows[0]);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Invalid input' });
    }
  // }
};

export const getItemById = async (req: Request, res: Response) => {
  // if (!isAuthenticated(req)) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // } else { 
    try {
      const { id } = req.params as { id: string };
      const { rows } = await pool.query('SELECT * FROM "items" WHERE id = $1', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch item' });
    }
  // }
};

export const updateItem = async (req: Request, res: Response) => {
  // if (!isAuthenticated(req)) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // } else {
    try {
      const { id } = req.params as { id: string };
      const { name, description, hp, atk, res: resistance, speed } = req.body;
      const { rows } = await pool.query(
        'UPDATE "items" SET name = $1, description = $2, hp = $3, atk = $4, res = $5, speed = $6 WHERE id = $7 RETURNING *',
        [name, description, hp, atk, resistance, speed, id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(rows[0]);
    } catch (error) {
      res.status(400).json({ error: 'Invalid input' });
    }
  // }
};

export const deleteItem = async (req: Request, res: Response) => {
  // if (!isAuthenticated(req)) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // } else { 
    try {
      const { id } = req.params as { id: string };
      const { rowCount } = await pool.query('DELETE FROM "items" WHERE id = $1', [id]);
      if (rowCount === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete item' });
    }
  // }
};

export const getRandomItems = async (req: Request, res: Response) => {
  // if (!isAuthenticated(req)) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // } else { 
    try {
      const nb = Number.parseInt(String(req.params.nb), 10);
      if (isNaN(nb) || nb <= 0) {
        return res.status(400).json({ error: 'Invalid number of items requested' });
      }

      const { rows } = await pool.query('SELECT * FROM "items"');
      if (rows.length === 0) {
        return res.status(404).json({ error: 'No items available' });
      }

      const shuffledItems = rows.sort(() => 0.5 - Math.random());
      const selectedItems = shuffledItems.slice(0, Math.min(nb, rows.length));

      res.json(selectedItems);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch random items' });
    }
  // }
};
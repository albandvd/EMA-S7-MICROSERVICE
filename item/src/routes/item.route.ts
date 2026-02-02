import { Router } from 'express';
import { getItems, createItem, getItemById, updateItem, deleteItem, getRandomItems } from '../controllers/item.controller.js';

const router = Router();

router.get('/items', getItems);
router.post('/items', createItem);
router.get('/items/:id', getItemById);
router.put('/items/:id', updateItem);
router.delete('/items/:id', deleteItem);
router.get('/items/alea/:nb', getRandomItems);

export default router;
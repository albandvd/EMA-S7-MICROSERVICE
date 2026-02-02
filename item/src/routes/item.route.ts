import { Router } from 'express';
import { getItems, createItem, getItemById, updateItem, deleteItem } from '../controllers/item.controller';

const router = Router();

router.get('/items', getItems);
router.post('/items', createItem);
router.get('/items/:id', getItemById);
router.put('/items/:id', updateItem);
router.delete('/items/:id', deleteItem);

export default router;
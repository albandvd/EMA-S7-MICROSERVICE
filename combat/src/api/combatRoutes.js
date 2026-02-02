import express from 'express';
import { fight } from '../logic/combatLogic.js';

const router = express.Router();

router.get('/combat/', (req, res) => {
    res.send("Combat Service API is alive and listening to RabbitMQ");
});

router.post('/combat/fight-manual', (req, res) => {
    const { hero, monster } = req.body;

    if (!hero || !monster) {
        return res.status(400).json({ error: "Données de combat manquantes (hero et monster requis)" });
    }

    try {
        const result = fight(hero, monster);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors du calcul du combat", details: error.message });
    }
});

export default router;
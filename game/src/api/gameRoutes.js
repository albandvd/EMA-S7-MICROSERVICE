import express from 'express';
import * as GameService from '../services/gameService.js';

const router = express.Router();

router.get('/game', (req, res) => {
    res.send("Game Service API On");
});

// router.post('/game/select-class', async (req, res) => {
//     try {
//         const { userId, className } = req.body;
//         const hero = await GameService.selectHeroClass(userId, className);
//         res.json({ status: "EXPLORING", hero, message: "Aventure commencée !" });
//     } catch (error) {
//         res.status(error.message === "INVALID_CLASS" ? 400 : 500).json({ error: error.message });
//     }
// });

router.post('/game/next-step', async (req, res) => {
    try {
        const { userId, hero, dungeon, currentRoomIndex } = req.body;
        const gameState = await GameService.playNextStep(userId, hero, dungeon, currentRoomIndex);
        res.json(gameState);
    } catch (error) {
        if (error.message === "HERO_NOT_FOUND") {
            return res.status(404).json({ error: "Héros introuvable. Veuillez créer un personnage." });
        }
        res.status(500).json({ error: error.message });
    }
});

// router.post('/game/start', async (req, res) => {
//     try {
//         const { userId, name, className } = req.body;
//         if (!userId || !name || !className) {
//             return res.status(400).json({ error: "userId, name et className requis" });
//         } 
//         const initialState = await GameService.initializeGame(userId, name, className);
//         res.json(initialState);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

export default router;
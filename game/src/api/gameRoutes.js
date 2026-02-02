import express from 'express';
import * as GameService from '../services/gameService.js';

const router = express.Router();

router.get('/game/', (req, res) => {
    res.send("Game Service API On");
});

router.post('/game/select-class', async (req, res) => {
    try {
        const { userId, className } = req.body;
        const hero = await GameService.selectHeroClass(userId, className);
        res.json({ status: "EXPLORING", hero, message: "Aventure commencée !" });
    } catch (error) {
        res.status(error.message === "INVALID_CLASS" ? 400 : 500).json({ error: error.message });
    }
});

router.post('/game/next-step', async (req, res) => {
    try {
        const { userId } = req.body;
        const gameState = await GameService.playNextStep(userId);
        res.json(gameState);
    } catch (error) {
        if (error.message === "HERO_NOT_FOUND") {
            return res.status(404).json({ error: "Héros introuvable. Veuillez créer un personnage." });
        }
        res.status(500).json({ error: error.message });
    }
});

router.post('/game/start', async (req, res) => {
    try {
        const { userId, name, className } = req.body;
        if (!userId || !name || !className) {
            return res.status(400).json({ error: "userId, name et className requis" });
        } 
        const initialState = await GameService.initializeGame(userId, name, className);
        res.json(initialState);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/game/rewards', async (req, res) => {
    try {
        const rewards = await GameService.getDungeonRewards();
        res.json(rewards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/game/claim-reward', async (req, res) => {
    try {
        const { userId, itemId } = req.body;
        const result = await GameService.claimDungeonReward(userId, itemId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
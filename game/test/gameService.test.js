import { test, describe } from 'node:test';
import assert from 'node:assert';
import * as GameService from '../src/services/gameService.js';

describe('GameService - playNextStep (Sans heroHp en retour)', () => {

    test('devrait passer à la salle suivante ', async () => {
        // Mock : Victoire
        let capturedData = null;
        const mockDeps = {
            requestCombat: async () => ({ winner: 'hero', finalHeroHp: 80, goldLooted: 50 }),
            sendHeroAction: async (action, data) => { 
                if (action === 'UPDATE_HERO') capturedData = data; 
            }
        };

        const mockHero = { hp: 100, gold: 10, atk: 15, speed: 15, res: 5 };
        const mockDungeon = { 
            id: 'dungeon-123',
            rooms: [
                { monster: { name: 'Orc', hp: 50, atk: 10, speed: 10, gold: 50 } },
                { monster: { name: 'Gobelin', hp: 30, atk: 5, speed: 5, gold: 10 } }
            ] 
        };

        const result = await GameService.playNextStep('user-1', mockHero, mockDungeon, 0, 'EXPLORING', mockDeps);

        // 1. Vérification du retour API (Strict)
        assert.strictEqual(result.status, 'EXPLORING');
        assert.strictEqual(result.dungeonId, 'dungeon-123');
        assert.deepStrictEqual(result.currentRoom, mockDungeon.rooms[1]);
        assert.deepStrictEqual(result.currentRoom.monster.name, mockDungeon.rooms[1].monster.name);

        // 2. Vérification de la notification RabbitMQ (Le "Fire and Forget")
        assert.ok(capturedData, "La notification UPDATE_HERO aurait dû être envoyée");
        assert.strictEqual(capturedData.newGold, 60, "L'or cumulé (10 + 50) devrait être de 60");
        assert.strictEqual(capturedData.newHp, 80);
    });

    test('devrait gérer la fin du donjon sans erreur', async () => {
        const mockDeps = {
            requestCombat: async () => ({ winner: 'hero', finalHeroHp: 50, goldLooted: 10 }),
            sendHeroAction: async () => {}
        };

        const mockHero = { hp: 100, gold: 0 };
        const mockDungeon = { rooms: [{ monster: { name: 'Boss' } }] };

        const result = await GameService.playNextStep('user-1', mockHero, mockDungeon, 0, 'EXPLORING', mockDeps);

        assert.strictEqual(result.status, 'DUNGEON_CLEARED');
        assert.strictEqual(result.heroHp, undefined);
    });
});

describe('GameService - Cas Limites et Erreurs', () => {

    const mockHero = { hp: 100, gold: 0, atk: 15 };
    
    test('devrait gérer une salle sans monstre (exploration simple)', async () => {
        const mockDeps = {
            requestCombat: async () => { throw new Error("Ne devrait pas être appelé !"); },
            sendHeroAction: async () => {}
        };

        const mockDungeon = { 
            id: 'dungeon-empty',
            rooms: [
                { monster: null }, // Salle vide
                { monster: { name: 'Prochain Monstre' } }
            ] 
        };

        const result = await GameService.playNextStep('user-1', mockHero, mockDungeon, 0, 'EXPLORING', mockDeps);

        assert.strictEqual(result.status, 'EXPLORING');
        assert.strictEqual(result.currentRoom.monster.name, 'Prochain Monstre');
    });

    test('devrait notifier la mort du héros et renvoyer GAME_OVER', async () => {
        let deathNotified = false;
        const mockDeps = {
            requestCombat: async () => ({ winner: 'monster' }),
            sendHeroAction: async (action) => { 
                if (action === 'HERO_DIED') deathNotified = true; 
            }
        };

        const mockDungeon = { 
            rooms: [{ monster: { name: 'Ultra Boss' } }] 
        };

        const result = await GameService.playNextStep('user-1', mockHero, mockDungeon, 0, 'EXPLORING', mockDeps);

        assert.strictEqual(result.status, 'GAME_OVER');
        assert.strictEqual(deathNotified, true, "L'action HERO_DIED doit être envoyée");
    });

    test('devrait bloquer la progression si le statut initial est GAME_OVER', async () => {
        const result = await GameService.playNextStep('user-1', mockHero, {}, 0, 'GAME_OVER');

        assert.strictEqual(result.status, 'GAME_OVER');
        assert.strictEqual(result.message, 'Partie terminée.');
    });

    test('devrait lever une erreur si les données du donjon sont corrompues', async () => {
        // On passe un donjon sans rooms pour forcer une erreur
        const corruptedDungeon = {}; 
        
        await assert.rejects(
            async () => {
                await GameService.playNextStep('user-1', mockHero, corruptedDungeon, 0, 'EXPLORING');
            },
            { message: 'ERREUR_PROGRESSION' }
        );
    });
});
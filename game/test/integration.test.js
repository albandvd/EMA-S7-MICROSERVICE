import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import * as GameService from '../src/services/gameService.js';
import { HeroSender } from '../src/messaging/heroSender.js';
import { CombatClient } from '../src/messaging/combatClient.js';

const mockHttp = new MockAdapter(axios);

describe('GameService - Scénarios de Tests Intégrés', () => {
    const userId = 'user_123';

    beforeEach(() => {
        mockHttp.reset();
        // Mocks par défaut pour éviter les fuites vers le vrai RabbitMQ
        HeroSender.sendHeroAction = async () => {};
        CombatClient.requestCombat = async () => ({
            winner: 'hero', finalHeroHp: 50, goldLooted: 10, battleLog: ["Victoire par défaut"]
        });
    });

    // --- 1. TEST DE VALIDATION ---
    test('selectHeroClass - Devrait rejeter une classe inexistante', async () => {
        await assert.rejects(
            async () => await GameService.selectHeroClass(userId, 'NINJA'),
            { message: 'INVALID_CLASS' }
        );
    });

    // --- 2. TEST DE MORT AU COMBAT ---
    test('playNextStep - DÉFAITE : Le héros meurt et la sauvegarde est supprimée', async () => {
        // Mock du combat : défaite
        CombatClient.requestCombat = async () => ({
            winner: 'monster',
            battleLog: ["Le monstre a porté un coup fatal !"]
        });

        mockHttp.onGet(new RegExp(`/save/${userId}`)).reply(200, {
            currentRoomIndex: 0,
            rooms: [{ monster: { name: "Dragon", stats: { hp: 100, atk: 50, gold: 0, vit: 10 } } }]
        });
        mockHttp.onGet(new RegExp(`/hero/${userId}`)).reply(200, { id: userId, hp: 10 });
        
        // On s'attend à ce que le service appelle DELETE pour nettoyer la partie
        mockHttp.onDelete(new RegExp(`/save/${userId}`)).reply(200);

        const result = await GameService.playNextStep(userId, { id: userId, hp: 10 }, { rooms: [{ monster: { name: "Dragon", stats: { hp: 100, atk: 50, gold: 0, vit: 10 } } }] }, 0);

        assert.strictEqual(result.status, 'GAME_OVER');
        assert.match(result.message, /Mort au combat/);
    });

    // --- 3. TEST DE L'INVENTAIRE PLEIN ---
    test('claimDungeonReward - INVENTAIRE PLEIN : Ne doit pas permettre d\'ajouter d\'item', async () => {
        // Mock du héros avec déjà 3 items
        mockHttp.onGet(new RegExp(`/hero/${userId}`)).reply(200, {
            id: userId,
            inventory: [{ name: 'item1' }, { name: 'item2' }, { name: 'item3' }]
        });

        const result = await GameService.claimDungeonReward(userId, { name: 'Excalibur' });

        assert.strictEqual(result.status, 'INVENTORY_FULL');
        assert.strictEqual(result.inventory.length, 3);
    });

    // --- 4. TEST DE RÉCUPÉRATION DES RÉCOMPENSES (Axios ItemService) ---
    test('getDungeonRewards - Devrait retourner 5 items aléatoires', async () => {
        mockHttp.onGet(/\/alea\/5/).reply(200, [
            { id: 1, name: 'Potion' }, { id: 2, name: '67Sword' }, 
            { id: 3, name: 'Bouclier' }, { id: 4, name: 'Bague' }, { id: 5, name: 'Cape' }
        ]);

        const rewards = await GameService.getDungeonRewards();
        assert.strictEqual(rewards.length, 5);
        assert.strictEqual(rewards[0].name, 'Potion');
    });

    // --- 5. TEST DE PROGRESSION NORMALE (EXPLORING) ---
    test('playNextStep - PROGRESSION : Devrait passer à la salle suivante si ce n\'est pas la fin', async () => {
        // Mock Save : Donjon de 2 salles, on est à la salle 0
        mockHttp.onGet(new RegExp(`/save/${userId}`)).reply(200, {
            currentRoomIndex: 0,
            rooms: [
                { id: 'r1', monster: null }, // Salle 0 vide
                { id: 'r2', monster: null }  // Salle 1 vide
            ]
        });
        mockHttp.onGet(new RegExp(`/hero/${userId}`)).reply(200, { id: userId, hp: 100 });
        mockHttp.onPut(new RegExp(`/save/${userId}`)).reply(200);

        const result = await GameService.playNextStep(userId, { id: userId, hp: 100 }, { rooms: [{ id: 'r1', monster: null }, { id: 'r2', monster: null }] }, 0);

        assert.strictEqual(result.status, 'EXPLORING');
        // La salle renvoyée doit être la r2 (index 1)
        assert.strictEqual(result.currentRoom.id, 'r2');
    });
});
import axios from 'axios';
import { sendHeroAction } from '../messaging/heroSender.js';
import { requestCombat } from '../messaging/combatClient.js';

const HERO_SERVICE_URL = process.env.HERO_SERVICE_URL || 'http://localhost:3005/hero';
const LEVEL_SERVICE_URL = process.env.LEVEL_SERVICE_URL || 'http://localhost:3007/levelDesign';
const SAVE_SERVICE_URL = process.env.SAVE_SERVICE_URL || 'http://localhost:3009/save';
const ITEM_SERVICE_URL = process.env.ITEM_SERVICE_URL || 'http://localhost:3006/items';

const ALLOWED_CLASSES = ['WARRIOR', 'TANK', 'ASSASSIN'];

const activeDungeons = new Map();

/**
 * Valide la classe choisie par le front avant le lancement.
 */
export const selectHeroClass = async (userId, className) => {
    const upperClass = className?.toUpperCase();

    if (!ALLOWED_CLASSES.includes(upperClass)) {
        throw new Error("INVALID_CLASS");
    }

    return { 
        className: upperClass,
        message: `Classe ${upperClass} présélectionnée.` 
    };
};

/**
 * Initialise la partie : Crée le héros et génère le donjon.
 */
export const initializeGame = async (userId, name, className) => {
    try {
        const upperClass = className?.toUpperCase() || 'WARRIOR';
        
        // 1. CREATION DU HEROS
        await sendHeroAction('CREATE_HERO', { 
            userId, 
            name, 
            heroClass: upperClass
        });

        // 2. GENERATION DU DONJON 
        const dungeonRes = await axios.post(`${LEVEL_SERVICE_URL}/generate`);
        const dungeon = dungeonRes.data;

        // 3. SAUVEGARDE de l'état initial
        await axios.post(SAVE_SERVICE_URL, {
            userId: userId,
            dungeonId: dungeon.id,
            rooms: dungeon.rooms,
            currentRoomIndex: 0,
            status: "ACTIVE"
        });

        return {
            status: "STARTING",
            userId: userId,
            dungeonId: dungeon.id,
            currentRoom: dungeon.rooms[0],
            message: `Aventure lancée pour ${name} le ${upperClass} !`
        };
    } catch (error) {
        // AJOUTE CE LOG pour voir si c'est Axios, une faute de frappe, ou autre chose
        console.error("DEBUG REEL:", error.response?.data || error.message); 
        throw new Error("ECHEC_INITIALISATION",);
    }
};

/**
 * PLAY NEXT STEP : Récupère la sauvegarde, traite, et met à jour.
 */
export const playNextStep = async (userId) => {
    try {
        // 1. Récupérer l'état depuis le SaveService
        const saveRes = await axios.get(`${SAVE_SERVICE_URL}/${userId}`);
        const session = saveRes.data;

        const heroRes = await axios.get(`${HERO_SERVICE_URL}/${userId}`);
        const hero = heroRes.data;

        const currentRoom = session.rooms[session.currentRoomIndex];
        const monster = currentRoom.monster;

        // 2. Logique de combat
        let newHp = hero.hp;
        if (monster) {
            const result = await requestCombat({
                hero: { id: hero.id, hp: hero.hp, atk: hero.atk, res: hero.res, speed: hero.speed },
                monster: { 
                    name: monster.name, hp: monster.stats.hp, 
                    atk: monster.stats.atk, gold: monster.stats.gold, speed: monster.stats.vit 
                }
            });

            if (result.winner === 'monster') {
                await sendHeroAction('HERO_DIED', { userId });
                await axios.delete(`${SAVE_SERVICE_URL}/${userId}`);
                return { status: "GAME_OVER", message: "Mort au combat." };
            }
            newHp = result.finalHeroHp;
            await sendHeroAction('UPDATE_HERO', { userId, newHp, goldGained: result.goldLooted });
        }

        // 3. MISE À JOUR de la sauvegarde
        const nextIndex = session.currentRoomIndex + 1;
        
        if (nextIndex >= session.rooms.length) {
            await axios.delete(`${SAVE_SERVICE_URL}/${userId}`);
            return { status: "DUNGEON_CLEARED", message: "Donjon fini !" };
        }

        await axios.put(`${SAVE_SERVICE_URL}/${userId}`, { currentRoomIndex: nextIndex });

        return {
            status: "EXPLORING",
            heroHp: newHp,
            currentRoom: session.rooms[nextIndex]
        };

    } catch (error) {
        console.error(" [GameService] Erreur Progression:", error.message);
        throw new Error("ERREUR_PROGRESSION");
    }
};

/**
 * Récupère 5 items aléatoires directement via la route spécialisée de l'ItemService.
 */
export const getDungeonRewards = async () => {
    try {
        const response = await axios.get(`${ITEM_SERVICE_URL}/alea/5`);
        
        return response.data; 
    } catch (error) {
        console.error(" [GameService] Erreur lors de la récupération des récompenses aléatoires:", error.message);
        
        throw new Error("ERREUR_RECUPERATION_RECOMPENSES");
    }
};

/**
 * Permet au joueur de choisir une récompense à la fin du donjon.
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} selectedItem - L'item choisi parmi les 5 proposés
 */
export const claimDungeonReward = async (userId, selectedItem) => {
    try {
        // 1. On récupère l'état actuel du héros pour vérifier son inventaire
        const heroRes = await axios.get(`${HERO_SERVICE_URL}/${userId}`);
        const hero = heroRes.data;

        // 2. Vérification de la limite de 3 emplacements
        if (hero.inventory && hero.inventory.length >= 3) {
            return {
                status: "INVENTORY_FULL",
                message: "Votre inventaire est plein (3/3). Vous devez jeter un objet pour en ramasser un nouveau.",
                inventory: hero.inventory
            };
        }

        // 3. Envoi de l'ordre d'ajout d'item au HeroService (via RabbitMQ)
        await sendHeroAction('ADD_ITEM', { 
            userId: userId, 
            item: selectedItem 
        });

        return {
            status: "REWARD_CLAIMED",
            message: `Félicitations ! Vous avez récupéré : ${selectedItem.name}`,
            item: selectedItem
        };

    } catch (error) {
        if (error.response?.status === 404) throw new Error("HERO_NOT_FOUND");
        console.error(" [GameService] Erreur Reward:", error.message);
        throw new Error("ERREUR_RECOMPENSE");
    }
};
import axios from 'axios';
import { sendHeroAction } from '../messaging/heroSender.js';
import { requestCombat } from '../messaging/combatClient.js';

const HERO_SERVICE_URL = process.env.HERO_SERVICE_URL || 'http://localhost:3005/hero';
const LEVEL_SERVICE_URL = process.env.LEVEL_SERVICE_URL || 'http://localhost:3007/levelDesign';
const SAVE_SERVICE_URL = process.env.SAVE_SERVICE_URL || 'http://localhost:3009/save';
const ITEM_SERVICE_URL = process.env.ITEM_SERVICE_URL || 'http://localhost:3006/items';

const activeDungeons = new Map();

/**
 * PLAY NEXT STEP : Récupère la sauvegarde, traite, et met à jour.
 */
export const playNextStep = async (userId, hero, dungeon, currentRoomIndex) => {
    try {
        // 1. Récupérer l'état depuis le SaveService
        // const saveRes = await axios.get(`${SAVE_SERVICE_URL}/${userId}`);
        // const session = saveRes.data;

        // const heroRes = await axios.get(`${HERO_SERVICE_URL}/${userId}`);
        // const hero = heroRes.data;
        // en attendant la Q

        // Sinon, playNextStep(userId, hero, room)

        const currentRoom = dungeon.rooms[currentRoomIndex];
        const monster = currentRoom.monster;

        // 2. Logique de combat
        let newHp = hero.hp;
        if (monster) {
            const result = await requestCombat({ hero, monster });

            if (result.winner === 'monster') {
                await sendHeroAction('HERO_DIED', { userId });
                //await axios.delete(`${SAVE_SERVICE_URL}/${userId}`);
                return { status: "GAME_OVER", message: "Mort au combat." };
            }
            newHp = result.finalHeroHp;
            const newGold = result.goldLooted + hero.gold;
            await sendHeroAction('UPDATE_HERO', { userId, newHp, newGold });
        }

        // 3. MISE À JOUR de la sauvegarde
        const nextIndex = currentRoomIndex + 1;
        
        if (nextIndex >= rooms.length) {
            // await axios.delete(`${SAVE_SERVICE_URL}/${userId}`);
            return { status: "DUNGEON_CLEARED", message: "Donjon fini !" };
        }

        //await axios.put(`${SAVE_SERVICE_URL}/${userId}`, { currentRoomIndex: nextIndex });

        return {
            status: "EXPLORING",
            heroHp: newHp,
            currentRoom: rooms.nextRoomIds[nextIndex]
        };

    } catch (error) {
        console.error(" [GameService] Erreur Progression:", error.message);
        throw new Error("ERREUR_PROGRESSION");
    }
};

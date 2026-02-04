import { sendHeroAction } from '../messaging/heroSender.js';
import { requestCombat } from '../messaging/combatClient.js';
import { log } from 'node:console';

const activeDungeons = new Map();

/**
 * PLAY NEXT STEP : effectue un tour de jeu
 */
export const playNextStep = async (userId, hero, dungeon, currentRoomIndex, status,
     deps = { requestCombat, sendHeroAction }) => {
    
    try {

        if(status == "GAME_OVER") {
            return { status: "GAME_OVER", message: "Partie terminée." };
        }

        const currentRoom = dungeon.rooms[currentRoomIndex];
        const monster = currentRoom.monster;

        // 2. Logique de combat
        let newHp = hero.hp;
        if (monster) {
            const result = await deps.requestCombat({ hero, monster });
            
            if (result.winner === 'monster') {
                await deps.sendHeroAction('HERO_DIED', { userId });
                return { status: "GAME_OVER", message: "Mort au combat." };
            }
            newHp = result.finalHeroHp;
            const newGold = result.goldLooted + hero.gold;
            
            await deps.sendHeroAction('UPDATE_HERO', { userId, newHp, newGold });
        }

        const nextIndex = currentRoomIndex + 1;
        
        if (nextIndex >= dungeon.rooms.length) {
            return { status: "DUNGEON_CLEARED", message: "Donjon fini !" };
        }

        return {
            status: "EXPLORING",
            currentRoom: dungeon.rooms[nextIndex],
            dungeonId: dungeon.id,
        };

    } catch (error) {
        console.error(" [GameService] Erreur Progression:", error.message);
        throw new Error("ERREUR_PROGRESSION");
    }
};

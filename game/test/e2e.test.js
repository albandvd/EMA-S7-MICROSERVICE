import axios from 'axios';
import assert from 'node:assert';

const GAME_URL = 'http://localhost:3003';
const HERO_URL = 'http://localhost:3005';

async function runFullFlowTest() {
    console.log("🚀 Lancement du test de flux complet...");

    try {
        // --- 1. CRÉATION DU HÉROS ---
        console.log("🆕 Création d'un nouveau héros...");
        const newHeroPayload = {
            name: "Testeur_" + Math.floor(Math.random() * 1000),
            class: "WARRIOR"
        };
        
        // On utilise la route de création de ton HeroService
        const createRes = await axios.post(`${HERO_URL}/hero`, newHeroPayload);
        const hero = createRes.data;
        const heroId = hero.id;
        
        console.log(`✅ Héros créé : ${hero.name} (ID: ${heroId})`);
        console.log(hero.res);
        
        assert.strictEqual(hero.hp, 100);
        assert.strictEqual(hero.gold, 0);

        // --- 2. DÉCLENCHEMENT DU COMBAT VIA GAME SERVICE ---
        console.log("⚔️  Envoi au combat via GameService...");
        const gamePayload = {
            userId: heroId,
            hero: hero, 
            dungeon: {
                id: "dungeon-test",
                rooms: [
                    { 
                        monster: { 
                            name: "Gobelin de Test", 
                            hp: 50, 
                            atk: 12, 
                            gold: 50 
                        } 
                    }
                ]
            },
            currentRoomIndex: 0,
            status: "EXPLORING"
        };

        const stepRes = await axios.post(`${GAME_URL}/game/next-step`, gamePayload);
        console.log(`✅ GameService répond : ${stepRes.data.status}`);

        // --- 3. ATTENTE DE LA PROPAGATION RABBITMQ ---
        console.log("⏳ Attente du traitement asynchrone (2s)...");
        await new Promise(resolve => setTimeout(resolve, 2000));

        // --- 4. VÉRIFICATION FINALE ---
        console.log("🔍 Vérification de la mise à jour dans HeroService...");
        const finalRes = await axios.get(`${HERO_URL}/hero/${heroId}`);
        const updatedHero = finalRes.data;

        console.log(`📊 Résultat final : HP=${updatedHero.hp}, OR=${updatedHero.gold}`);

        // Vérifications de la logique métier
        assert.ok(updatedHero.gold === 50, "L'or devrait être exactement de 50");
        assert.ok(updatedHero.hp < 100, "Le héros aurait dû perdre quelques points de vie");

        console.log("🎉 SUCCÈS : La chaîne complète fonctionne de la création au combat !");

    } catch (error) {
        console.error("❌ ÉCHEC DU TEST :");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data:`, error.response.data);
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

runFullFlowTest();
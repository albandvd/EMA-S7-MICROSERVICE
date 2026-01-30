import { fight } from './combatLogic.js';

describe('Combat Logic Tests', () => {
    
    test('Le héros doit gagner s’il est plus fort', () => {
        const hero = { hp: 100, atk: 50, res: 10, vit: 20 };
        const monster = { hp: 20, atk: 5, or: 10, vit: 10 };

        const result = fight(hero, monster);

        expect(result.winner).toBe('hero');
        expect(result.goldLooted).toBe(10);
    });

    test('L’initiative : le plus rapide attaque en premier', () => {
        const hero = { hp: 100, atk: 10, res: 0, vit: 10 };
        const monster = { hp: 5, atk: 10, or: 10, vit: 20 };

        const result = fight(hero, monster);

        // Le monstre attaque en premier, le log doit le montrer au Tour 1
        expect(result.battleLog[1]).toContain('Monstre inflige 10 dégâts (RES: 0). PV Héros: 90');
    });

    test('La résistance doit réduire les dégâts du monstre', () => {
        const hero = { hp: 100, atk: 10, res: 10, vit: 10 };
        const monster = { hp: 100, atk: 15, or: 10, vit: 5 };

        const result = fight(hero, monster);

        // Dégâts subis : 15 (atk) - 10 (res) = 5
        // Au tour 11, le héros devrait avoir 55 hp à la fin (11*5)
        expect(result.finalHeroHp).toBeLessThan(100);
        expect(result.finalHeroHp).toBe(55);
        expect(result.battleLog.some(log => log.includes('inflige 5 dégâts'))).toBeTruthy();
    });

    test('Le héros gagne en cas d’égalité de vitesse', () => {
        const hero = { hp: 10, atk: 10, res: 0, vit: 10 };
        const monster = { hp: 10, atk: 10, or: 10, vit: 10 };

        const result = fight(hero, monster);

        // Le héros tape en premier et tue le monstre direct
        expect(result.winner).toBe('hero');
        expect(result.finalHeroHp).toBe(10);
    });

    test('Le monstre gagne', () => {
        const hero = { hp: 10, atk: 10, res: 0, vit: 10 };
        const monster = { hp: 10, atk: 10, or: 10, vit: 11 };

        const result = fight(hero, monster);

        // Le monstre tape en premier et tue le héros direct
        expect(result.winner).toBe('monster');
        expect(result.finalHeroHp).toBe(0);
    });
});
export const fight = (hero, monster) => {
    let logs = [];
    let tour = 0;

    let attacker = (hero.vit >= monster.vit) ? 'hero' : 'monster';
    logs.push(`Combat commence ! Initiative : ${attacker}`);

    while (hero.hp > 0 && monster.hp > 0) {
        tour++;
        if (attacker === 'hero') {
            monster.hp -= hero.atk;
            logs.push(`Tour ${tour}: Héros inflige ${hero.atk} dégâts. PV Monstre: ${monster.hp}`);
            attacker = 'monster';
        } else {
            let damage = monster.atk - hero.res;
            if(damage < 0) {
                damage = 0;
            }
            hero.hp -= damage;
            logs.push(`Tour ${tour}: Monstre inflige ${damage} dégâts (RES: ${hero.res}). PV Héros: ${hero.hp}`);
            attacker = 'hero';
        }
    }

    const winner = hero.hp > 0 ? 'hero' : 'monster';
    return {
        winner,
        finalHeroHp: hero.hp,
        goldLooted: winner === 'hero' ? monster.or : 0,
        battleLog: logs
    };
};
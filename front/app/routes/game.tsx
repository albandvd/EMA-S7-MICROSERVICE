import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/game";

// --- INTERFACES ---
interface BattleStats {
    hp: number;
    atk: number;
    res: number;
    vit: number;
    gold: number;
}

interface Item {
    id: string;
    name: string;
    atk?: number;
    res?: number;
    hp?: number;
    vit?: number;
    type: string;
}

interface Monster {
    id?: string;
    name: string;
    hp: number;
    atk: number;
    gold: number;
    stats?: BattleStats; 
}

interface Room {
    id: string;
    index: number;
    dialogue: string;
    monster?: Monster | null;
    item?: Item | null;
    nextRoomIds: string[];
}

interface DungeonMap {
    id: string;
    rooms: Room[];
}

interface Hero {
    id: string;
    name: string;
    class: string;
    // base (unequipped) stats — never include item bonuses here
    hp: number;
    atk: number;
    res: number;
    vit: number;
    gold: number;
    // currentHp is the actual current HP (may be <= base+item bonuses).
    // We store it separately so we never mutate base stats when applying
    // temporary combat damage or when the backend returns HP that
    // already includes item bonuses.
    currentHp?: number;
    inventory: Item[];
}

export function meta(_: Route.MetaArgs) {
    return [
        { title: "Dungeon Crawler - Exploration" },
        { name: "description", content: "Affrontez des gobelins et survivez au donjon" },
    ];
}

export default function Game({ params }: Route.ComponentProps) {
    const navigate = useNavigate();
    
    // --- ÉTATS ---
    const [dungeon, setDungeon] = useState<DungeonMap | null>(null);
    const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
    const [hero, setHero] = useState<Hero | null>(null);
    const [isFighting, setIsFighting] = useState(false);
    const [isDead, setIsDead] = useState(false);
    const [itemToSwap, setItemToSwap] = useState<Item | null>(null);
    const [fightResult, setFightResult] = useState<{ roomId: string; gold: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const heroId = (params as { heroId: string }).heroId;
    const GATEWAY_URL = "http://localhost:3000";
    const INVENTORY_SIZE = 3;

    // --- CALCUL DES STATS (Clean Logic) ---
    // Helper: sum bonuses from an inventory list
    const sumItemBonuses = (items: Item[] = []) => items.reduce(
        (acc, it) => ({
            hp: acc.hp + (it.hp || 0),
            atk: acc.atk + (it.atk || 0),
            res: acc.res + (it.res || 0),
            vit: acc.vit + (it.vit || 0),
        }),
        { hp: 0, atk: 0, res: 0, vit: 0 }
    );

    // Normalize hero object received from the server so that `hp/atk/res/vit`
    // always represent the base (unequipped) stats. The server may return
    // stats that already include item bonuses; this function reverses that
    // (when possible) to avoid double-counting on the client.
    const normalizeHeroFromServer = (h: any, keepInventory?: Item[]): Hero => {
        const inventory = keepInventory ?? (h.inventory ?? []);
        const bonuses = sumItemBonuses(inventory);

        // If the server already returned base stats (i.e. subtracting the
        // bonuses would produce unrealistic values), fall back to the
        // server-provided numbers.
        const candidateBase = {
            hp: Math.max(0, (h.hp ?? 0) - bonuses.hp),
            atk: Math.max(0, (h.atk ?? 0) - bonuses.atk),
            res: Math.max(0, (h.res ?? 0) - bonuses.res),
            vit: Math.max(0, (h.vit ?? 0) - bonuses.vit),
            gold: h.gold ?? 0,
        };

        const looksValid = (
            candidateBase.hp > 0 &&
            candidateBase.atk >= 0 &&
            candidateBase.res >= 0 &&
            candidateBase.vit >= 0
        );

        const base = looksValid ? candidateBase : {
            hp: h.hp ?? 0,
            atk: h.atk ?? 0,
            res: h.res ?? 0,
            vit: h.vit ?? 0,
            gold: h.gold ?? 0,
        };

        // Preserve server's notion of current HP (used for death checks).
        const currentHp = typeof h.hp === 'number' ? (h.hp as number) : base.hp;

        return {
            id: h.id,
            name: h.name,
            class: h.class,
            hp: base.hp,
            atk: base.atk,
            res: base.res,
            vit: base.vit,
            gold: base.gold,
            currentHp,
            inventory,
        };
    };

    // Cette valeur est recalculée proprement à chaque fois que 'hero' change.
    // Elle ne modifie jamais l'état original — elle combine base stats +
    // item bonuses ONCE to produce the effective (buffed) hero used for
    // display and for sending to the game engine.
    const buffedHero = useMemo(() => {
        if (!hero) return null;

        const bonuses = sumItemBonuses(hero.inventory);

        const maxHp = hero.hp + bonuses.hp;
        // currentHp comes from server (may include damage). When showing the
        // buffed current HP we add item HP bonuses but cap to maxHp.
        const currentHp = Math.min((hero.currentHp ?? hero.hp) + bonuses.hp, maxHp);

        return {
            ...hero,
            hp: maxHp,
            atk: hero.atk + bonuses.atk,
            res: hero.res + bonuses.res,
            vit: hero.vit + bonuses.vit,
            currentHp,
        } as Hero & { currentHp: number };
    }, [hero]);

    // --- INITIALISATION ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const heroRes = await fetch(`${GATEWAY_URL}/hero/${heroId}`, {
                    credentials: 'include'
                });
                if (!heroRes.ok) throw new Error("Aventurier introuvable");
                const heroData = await heroRes.json();
                setHero(normalizeHeroFromServer(heroData, heroData.inventory || []));

                const dungeonRes = await fetch(`${GATEWAY_URL}/levelDesign/generate`, {
                    credentials: 'include'
                });
                if (!dungeonRes.ok) throw new Error("Erreur génération donjon");
                const dungeonData: DungeonMap = await dungeonRes.json();

                // Distribution des objets
                const itemsCount = Math.floor(dungeonData.rooms.length / 2);
                const itemsRes = await fetch(`${GATEWAY_URL}/items/alea/${itemsCount}`, {
                    credentials: 'include'
                });
                const itemsData: Item[] = itemsRes.ok ? await itemsRes.json() : [];

                const updatedRooms = dungeonData.rooms.map((room, idx) => {
                    if (idx > 0 && idx % 2 === 0 && itemsData.length > 0) {
                        return { ...room, item: itemsData.shift() };
                    }
                    return room;
                });

                setDungeon({ ...dungeonData, rooms: updatedRooms });
            } catch (err) {
                setError(err instanceof Error ? err.message : "Erreur de connexion au royaume");
            }
        };
        fetchData();
    }, [heroId]);

    const refreshHeroStats = async () => {
        try {
            const res = await fetch(`${GATEWAY_URL}/hero/${heroId}`, {
                    credentials: 'include'
                });
            if (res.ok) {
                const updatedHero = await res.json();
                // Normalize server response and preserve client inventory when
                // appropriate so we don't accidentally double-apply item
                // bonuses. Keep server's current HP for death checks.
                setHero(prev => {
                    const normalized = normalizeHeroFromServer(updatedHero, prev?.inventory || updatedHero.inventory || []);
                    if ((updatedHero.hp ?? normalized.currentHp) <= 0) setIsDead(true);
                    return normalized;
                });
            }
        } catch (err) {
            console.error("Erreur refresh stats:", err);
        }
    };

    // --- GESTION DU COMBAT ---
    const handleFight = async () => {
        if (!dungeon || !buffedHero || isFighting || isDead) return;
        const currentRoom = dungeon.rooms[currentRoomIndex];
        if (!currentRoom.monster) return;

        setIsFighting(true);

        try {
            const monsterStats = {
                name: currentRoom.monster.name,
                hp: currentRoom.monster.stats?.hp ?? currentRoom.monster.hp,
                atk: currentRoom.monster.stats?.atk ?? currentRoom.monster.atk,
                gold: currentRoom.monster.stats?.gold ?? currentRoom.monster.gold,
            };

            const gamePayload = {
                userId: heroId,
                hero: buffedHero, // Envoi des stats avec bonus inclus
                dungeon: {
                    ...dungeon,
                    rooms: dungeon.rooms.map((r, idx) => ({
                        ...r,
                        monster: idx === currentRoomIndex ? monsterStats : r.monster
                    }))
                },
                currentRoomIndex: currentRoomIndex,
                status: "EXPLORING"
            };

            await fetch(`${GATEWAY_URL}/game/next-step`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(gamePayload),
            });

            await new Promise(resolve => setTimeout(resolve, 1500));
            await refreshHeroStats();

            setFightResult({ roomId: currentRoom.id, gold: monsterStats.gold || 0 });
            setDungeon({
                ...dungeon,
                rooms: dungeon.rooms.map((r) =>
                    r.id === currentRoom.id ? { ...r, monster: null } : r,
                ),
            });
        } catch (err) {
            console.error(err); // Log the caught error
            setError("Le combat a échoué..."); // Set error message
        } finally {
            setIsFighting(false);
        }
    };

    // --- INVENTAIRE ---
    const handleAddItem = (item: Item) => {
        if (!hero) return;
        if (hero.inventory.length >= INVENTORY_SIZE) {
            setItemToSwap(item);
        } else {
            setHero({ ...hero, inventory: [...hero.inventory, item] });
            removeRoomItem();
        }
    };

    const replaceItem = (oldItemId: string) => {
        if (!hero || !itemToSwap) return;
        const newInventory = hero.inventory.filter(i => i.id !== oldItemId);
        setHero({ ...hero, inventory: [...newInventory, itemToSwap] });
        setItemToSwap(null);
        removeRoomItem();
    };

    const removeRoomItem = () => {
        if (!dungeon) return;
        setDungeon({
            ...dungeon,
            rooms: dungeon.rooms.map((r, idx) => 
                idx === currentRoomIndex ? { ...r, item: null } : r
            )
        });
    };

    const handleNextRoom = (nextRoomId: string) => {
        const nextIndex = dungeon?.rooms.findIndex((r) => r.id === nextRoomId);
        if (nextIndex !== undefined && nextIndex !== -1) {
            setCurrentRoomIndex(nextIndex);
            setFightResult(null);
            setItemToSwap(null);
        }
    };

    // --- RENDU ---
    if (isDead) return (
        <div className='min-h-screen bg-slate-950 flex items-center justify-center p-4 text-center'>
            <div className='max-w-md w-full border-4 border-red-900 bg-slate-900 p-10 rounded-xl shadow-2xl'>
                <h2 className='text-5xl font-serif text-red-600 mb-6 uppercase tracking-widest'>Mort au Combat</h2>
                <p className='text-slate-400 mb-8'>Votre quête s'achève ici, au fond des ténèbres...</p>
                <button onClick={() => navigate("/")} className='w-full py-4 bg-red-800 text-white font-bold rounded-lg hover:bg-red-700'>RETOUR AU VILLAGE</button>
            </div>
        </div>
    );

    if (error) return <div className='min-h-screen bg-slate-950 flex items-center justify-center text-red-500 font-bold font-serif'>{error}</div>;
    if (!dungeon || !hero || !buffedHero) return <div className='min-h-screen bg-slate-950 flex items-center justify-center text-amber-500 animate-pulse font-serif'>INCANTATION DU DONJON...</div>;

    const currentRoom = dungeon.rooms[currentRoomIndex];

    // sum of bonuses provided by current inventory (used for UI breakdown)
    const itemBonuses = sumItemBonuses(hero.inventory);

    return (
        <div className='min-h-screen bg-slate-950 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black p-6 text-slate-200 font-serif'>
            <div className='max-w-6xl mx-auto'>
                {/* Header */}
                <div className='mb-8 flex justify-between items-end border-b border-amber-700/50 pb-4'>
                    <div>
                        <h1 className='text-4xl font-serif text-amber-600 tracking-widest'>⚔️ DUNGEON CRAWLER</h1>
                        <p className='text-amber-200/60 uppercase text-xs tracking-[0.2em]'>Aventurier : {hero.name} | {hero.class}</p>
                        <div className='text-slate-400 text-[12px] mt-1'>
                            <span className='mr-3'>HP de base (classe {hero.class}): <span className='text-amber-200 font-semibold'>{hero.hp}</span></span>
                            <span>Bonus objets: <span className='text-amber-300 font-semibold'>+{itemBonuses.hp}</span></span>
                        </div>
                    </div>
                    <div className='text-right text-amber-600'>
                        <p className='text-xl font-bold'>PROFONDEUR : {currentRoom.index + 1}</p>
                    </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                    <div className='lg:col-span-2'>
                        <div className='bg-slate-900/80 border-2 border-amber-900/50 rounded-lg p-10 mb-6 shadow-2xl relative min-h-[350px] flex flex-col justify-center'>
                            {isFighting && <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20 rounded-lg"><p className="text-amber-500 animate-pulse font-serif text-2xl italic">Combat acharné...</p></div>}
                            
                            <p className='text-slate-300 text-2xl mb-12 italic text-center leading-relaxed font-serif'>"{currentRoom.dialogue}"</p>

                            {/* Section Action */}
                            {currentRoom.monster ? (
                                <div className='border border-red-900/50 rounded-lg p-6 bg-red-950/10 text-center animate-in fade-in'>
                                    <h3 className='text-2xl font-serif text-red-500 mb-6 uppercase tracking-wider underline decoration-red-900 underline-offset-8'>Un {currentRoom.monster.name} surgit !</h3>
                                    <button onClick={handleFight} className='px-12 py-4 font-bold text-white bg-red-900/80 border border-red-700 rounded-md hover:bg-red-800 transition-all shadow-[0_0_15px_rgba(153,27,27,0.4)] uppercase tracking-widest'>Dégainer l'épée</button>
                                </div>
                            ) : fightResult ? (
                                <div className='p-8 bg-amber-950/20 border border-amber-600/30 rounded-lg mb-6 text-center animate-in zoom-in'>
                                    <h3 className='text-3xl font-serif text-amber-400 mb-2 uppercase'>L'ennemi est terrassé !</h3>
                                    <p className='text-amber-200/80'>Vous récupérez {fightResult.gold} pièces d'or sur le cadavre.</p>
                                    <button onClick={() => setFightResult(null)} className='mt-6 px-10 py-2 bg-amber-700 text-black font-bold rounded-md hover:bg-amber-600 transition-colors uppercase text-sm'>Continuer l'exploration</button>
                                </div>
                            ) : currentRoom.item ? (
                                <div className='p-8 bg-blue-950/10 border border-blue-500/30 rounded-lg mb-6 text-center animate-in slide-in-from-bottom-4'>
                                    <h3 className='text-xl font-serif text-blue-400 mb-4 uppercase'>Vous trouvez un trésor : {currentRoom.item.name}</h3>
                                    <div className='flex justify-center gap-4 text-xs font-mono text-blue-300 mb-8'>
                                        {currentRoom.item.atk && <span>ATK +{currentRoom.item.atk}</span>}
                                        {currentRoom.item.res && <span>RES +{currentRoom.item.res}</span>}
                                        {currentRoom.item.hp && <span>HP +{currentRoom.item.hp}</span>}
                                        {currentRoom.item.vit && <span>VIT +{currentRoom.item.vit}</span>}
                                    </div>
                                    <button onClick={() => handleAddItem(currentRoom.item!)} className='px-8 py-3 bg-blue-900/60 text-white font-bold rounded-md hover:bg-blue-800 transition-colors uppercase text-sm tracking-widest'>Saisir l'objet</button>
                                </div>
                            ) : (
                                <div className='p-4 border-t border-slate-800 text-center'><p className='text-slate-500 uppercase text-xs tracking-[0.3em] italic'>Le silence règne dans cette salle...</p></div>
                            )}
                        </div>

                        {/* Modal Équipement */}
                        {itemToSwap && (
                            <div className='fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm'>
                                <div className='bg-slate-900 border-2 border-amber-700 p-8 rounded-lg max-w-lg w-full shadow-[0_0_50px_rgba(0,0,0,1)]'>
                                    <h3 className='text-2xl font-serif text-amber-500 mb-2 uppercase'>Sac à dos plein</h3>
                                    <p className='text-slate-400 mb-8 italic'>Quel objet voulez-vous abandonner pour prendre le/la <span className='text-amber-200 font-bold'>{itemToSwap.name}</span> ?</p>
                                    <div className='space-y-3'>
                                        {hero.inventory.map((item) => (
                                            <button key={item.id} onClick={() => replaceItem(item.id)} className='w-full p-4 bg-slate-800/40 border border-slate-700 hover:border-amber-600 text-left rounded transition-all group'>
                                                <div className='flex justify-between items-center font-serif'>
                                                    <span className='font-bold text-slate-200 group-hover:text-amber-400'>{item.name}</span>
                                                    <span className='text-[10px] text-red-500 opacity-0 group-hover:opacity-100 uppercase tracking-widest font-bold'>Jeter</span>
                                                </div>
                                            </button>
                                        ))}
                                        <button onClick={() => setItemToSwap(null)} className='w-full py-3 mt-6 text-slate-600 hover:text-white uppercase text-xs font-bold tracking-[0.2em]'>Laisser l'objet au sol</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Chemins */}
                        {!currentRoom.monster && !fightResult && !itemToSwap && (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-700'>
                                {currentRoom.nextRoomIds.length > 0 ? (
                                    currentRoom.nextRoomIds.map((nextId) => (
                                        <button key={nextId} onClick={() => handleNextRoom(nextId)} className='p-6 bg-slate-900/40 border border-amber-900/30 rounded-lg text-amber-200/80 font-serif hover:border-amber-500 hover:bg-slate-800 transition-all text-center uppercase tracking-widest text-sm'>Vers la salle suivante ➡️</button>
                                    ))
                                ) : (
                                    <button onClick={() => navigate("/")} className='col-span-2 p-10 bg-amber-800 text-white font-serif font-bold rounded-lg shadow-2xl hover:bg-amber-700 transition-all uppercase tracking-[0.3em] text-xl'> Sortir du Donjon (Victoire)</button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Feuille de Perso */}
                    <div className='lg:col-span-1 space-y-8'>
                        {/* Stats Panel */}
                        <div className='bg-slate-900/90 border border-amber-900/50 rounded-lg p-6 shadow-xl'>
                            <h4 className='text-amber-600 font-serif mb-6 uppercase tracking-widest text-sm border-b border-amber-900/30 pb-2'>Feuille de Personnage</h4>
                            <div className='space-y-3'>
                                {hero.inventory.length > 0 ? (
                                    <>
                                        <div className='p-3 bg-blue-950/5 border border-blue-900/10 rounded flex justify-between items-center text-[13px] text-slate-300'>
                                            <div className='font-mono text-sm text-slate-400'>Bonus des objets</div>
                                            <div className='flex gap-4 text-[12px]'>
                                                <div className='text-green-500'>HP <span className='font-bold'>+{itemBonuses.hp}</span></div>
                                                <div className='text-red-400'>ATK <span className='font-bold'>+{itemBonuses.atk}</span></div>
                                                <div className='text-blue-400'>RES <span className='font-bold'>+{itemBonuses.res}</span></div>
                                                <div className='text-purple-400'>VIT <span className='font-bold'>+{itemBonuses.vit}</span></div>
                                            </div>
                                        </div>

                                        {hero.inventory.map((item) => (
                                            <div key={item.id} className='p-3 bg-blue-950/10 border border-blue-900/20 rounded shadow-inner'>
                                                <p className='font-serif text-blue-200 text-sm uppercase mb-1'>{item.name}</p>
                                                <div className='flex flex-wrap gap-x-3 gap-y-1'>
                                                    {item.hp && <span className='text-[10px] text-green-600 font-bold'>+ {item.hp} HP</span>}
                                                    {item.atk && <span className='text-[10px] text-red-700 font-bold'>+ {item.atk} ATK</span>}
                                                    {item.res && <span className='text-[10px] text-blue-700 font-bold'>+ {item.res} RES</span>}
                                                    {item.vit && <span className='text-[10px] text-purple-700 font-bold'>+ {item.vit} VIT</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <p className='py-6 text-center text-slate-600 italic text-sm'>Votre sac est vide...</p>
                                )}
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                <div className='grid grid-cols-1 gap-2'>
                                    <div className='flex flex-col gap-2 p-3 bg-black/40 rounded border border-slate-800'>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-xs text-slate-500 uppercase'>Attaque</span>
                                            <span className='font-bold text-amber-400 font-mono text-lg'>{buffedHero.atk}</span>
                                        </div>
                                        <div className='text-[11px] text-slate-400 flex justify-between'>
                                            <div>Base: <span className='text-slate-200 font-semibold'>{hero.atk}</span></div>
                                            <div>Objets: <span className='text-amber-400 font-semibold'>+{itemBonuses.atk}</span></div>
                                        </div>
                                    </div>
                                    <div className='flex flex-col gap-2 p-3 bg-black/40 rounded border border-slate-800'>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-xs text-slate-500 uppercase'>Résistance</span>
                                            <span className='font-bold text-amber-400 font-mono text-lg'>{buffedHero.res}</span>
                                        </div>
                                        <div className='text-[11px] text-slate-400 flex justify-between'>
                                            <div>Base: <span className='text-slate-200 font-semibold'>{hero.res}</span></div>
                                            <div>Objets: <span className='text-amber-400 font-semibold'>+{itemBonuses.res}</span></div>
                                        </div>
                                    </div>
                                    <div className='flex flex-col gap-2 p-3 bg-black/40 rounded border border-slate-800'>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-xs text-slate-500 uppercase'>Vitesse</span>
                                            <span className='font-bold text-amber-400 font-mono text-lg'>{buffedHero.vit}</span>
                                        </div>
                                        <div className='text-[11px] text-slate-400 flex justify-between'>
                                            <div>Base: <span className='text-slate-200 font-semibold'>{hero.vit}</span></div>
                                            <div>Objets: <span className='text-amber-400 font-semibold'>+{itemBonuses.vit}</span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className='p-4 bg-amber-900/10 border border-amber-600/20 rounded text-center'>
                                    <p className='text-2xl font-serif font-bold text-amber-500'>{buffedHero.gold} PO</p>
                                </div>
                            </div>
                        </div>

                        {/* Inventaire Panel */}
                        <div className='bg-slate-900/90 border border-blue-900/50 rounded-lg p-6 shadow-xl'>
                            <h4 className='text-blue-500 font-serif mb-6 uppercase tracking-widest text-sm border-b border-blue-900/30 pb-2'>Équipement ({hero.inventory.length}/{INVENTORY_SIZE})</h4>
                            <div className='space-y-3'>
                                {hero.inventory.length > 0 ? hero.inventory.map((item) => (
                                    <div key={item.id} className='p-3 bg-blue-950/10 border border-blue-900/20 rounded shadow-inner'>
                                        <p className='font-serif text-blue-200 text-sm uppercase mb-1'>{item.name}</p>
                                        <div className='flex flex-wrap gap-x-3 gap-y-1'>
                                            {item.hp && <span className='text-[10px] text-green-600 font-bold'>+ {item.hp} HP</span>}
                                            {item.atk && <span className='text-[10px] text-red-700 font-bold'>+ {item.atk} ATK</span>}
                                            {item.res && <span className='text-[10px] text-blue-700 font-bold'>+ {item.res} RES</span>}
                                            {item.vit && <span className='text-[10px] text-purple-700 font-bold'>+ {item.vit} VIT</span>}
                                        </div>
                                    </div>
                                )) : (
                                    <p className='py-6 text-center text-slate-600 italic text-sm'>Votre sac est vide...</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
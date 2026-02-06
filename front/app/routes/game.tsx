import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/game";

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
    hp: number;
    atk: number;
    res: number;
    vit: number;
    gold: number;
    inventory: Item[];
}

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Jeu - Maranello Speedrun" },
        { name: "description", content: "Explorez le donjon" },
    ];
}

export default function Game({ params }: Route.ComponentProps) {
    const navigate = useNavigate();
    const [dungeon, setDungeon] = useState<DungeonMap | null>(null);
    const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
    const [hero, setHero] = useState<Hero | null>(null);
    const [isFighting, setIsFighting] = useState(false);
    const [isDead, setIsDead] = useState(false);
    const [itemToSwap, setItemToSwap] = useState<Item | null>(null);
    const [fightResult, setFightResult] = useState<{
        roomId: string;
        gold: number;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const heroId = (params as { heroId: string }).heroId;
    const GATEWAY_URL = "http://localhost:3000";
    const INVENTORY_SIZE = 3;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Récupération du Héros
                const heroRes = await fetch(`${GATEWAY_URL}/hero/${heroId}`);
                if (!heroRes.ok) throw new Error("Héros introuvable");
                const heroData = await heroRes.json();
                setHero({ ...heroData, inventory: heroData.inventory || [] });

                // 2. Récupération du Donjon
                const dungeonRes = await fetch(`${GATEWAY_URL}/levelDesign/generate`);
                if (!dungeonRes.ok) throw new Error("Erreur génération donjon");
                const dungeonData: DungeonMap = await dungeonRes.json();

                // 3. Récupération des Items Aléatoires (1/2 salles)
                const itemsCount = Math.floor(dungeonData.rooms.length / 2);
                const itemsRes = await fetch(`${GATEWAY_URL}/items/random/${itemsCount}`);
                const itemsData: Item[] = itemsRes.ok ? await itemsRes.json() : [];

                // 4. Distribution des items dans les salles
                const updatedRooms = dungeonData.rooms.map((room, idx) => {
                    if (idx > 0 && idx % 2 === 0 && itemsData.length > 0) {
                        return { ...room, item: itemsData.shift() };
                    }
                    return room;
                });

                setDungeon({ ...dungeonData, rooms: updatedRooms });
            } catch (err) {
                setError(err instanceof Error ? err.message : "Erreur de connexion");
            }
        };
        fetchData();
    }, [heroId]);

    const refreshHeroStats = async () => {
        try {
            const res = await fetch(`${GATEWAY_URL}/hero/${heroId}`);
            if (res.ok) {
                const updatedHero = await res.json();
                setHero(prev => ({ ...updatedHero, inventory: prev?.inventory || [] }));
                if (updatedHero.hp <= 0) setIsDead(true);
            }
        } catch (err) {
            console.error("Erreur refresh stats:", err);
        }
    };

    const handleFight = async () => {
        if (!dungeon || !hero || isFighting || isDead) return;
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
                hero: hero, 
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

            await new Promise(resolve => setTimeout(resolve, 2000));
            await refreshHeroStats();

            setFightResult({ roomId: currentRoom.id, gold: monsterStats.gold || 0 });
            setDungeon({
                ...dungeon,
                rooms: dungeon.rooms.map((r) =>
                    r.id === currentRoom.id ? { ...r, monster: null } : r,
                ),
            });
        } catch (err) {
            setError("Échec du combat.");
        } finally {
            setIsFighting(false);
        }
    };

    const handleAddItem = (item: Item) => {
        if (!hero) return;
        if (hero.inventory.length >= INVENTORY_SIZE) {
            setItemToSwap(item);
        } else {
            const updatedHero = { ...hero, inventory: [...hero.inventory, item] };
            setHero(updatedHero);
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

    if (isDead) return (
        <div className='min-h-screen bg-black flex items-center justify-center p-4 text-center'>
            <div className='max-w-md w-full border-4 border-red-900 bg-slate-900 p-10 rounded-3xl shadow-[0_0_50px_rgba(255,0,0,0.3)]'>
                <h2 className='text-6xl font-black text-red-600 mb-6 italic'>GAME OVER</h2>
                <button onClick={() => navigate("/")} className='w-full py-4 bg-red-700 text-white font-black rounded-xl'>RETOUR AU MENU</button>
            </div>
        </div>
    );

    if (error) return <div className='min-h-screen bg-slate-950 flex items-center justify-center text-red-500 font-bold'>{error}</div>;
    if (!dungeon || !hero) return <div className='min-h-screen bg-slate-950 flex items-center justify-center text-yellow-400 animate-pulse font-bold'>SYNCHRONISATION...</div>;

    const currentRoom = dungeon.rooms[currentRoomIndex];

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 p-6 text-slate-200'>
            <div className='max-w-6xl mx-auto'>
                {/* Header */}
                <div className='mb-8 flex justify-between items-end border-b border-amber-900/50 pb-4'>
                    <div>
                        <h1 className='text-4xl font-black text-orange-600 italic tracking-tighter'>🏎️ MARANELLO SPEEDRUN</h1>
                        <p className='text-yellow-500 font-bold uppercase'>Pilote : {hero.name} | Classe : {hero.class}</p>
                    </div>
                    <div className='text-right font-mono text-yellow-600'>
                        <p className='text-2xl font-bold'>SALLE {currentRoom.index + 1}</p>
                    </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                    <div className='lg:col-span-2'>
                        <div className='bg-slate-900/95 border-4 border-amber-900 rounded-2xl p-8 mb-6 shadow-2xl relative'>
                            {isFighting && <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20"><p className="text-orange-500 animate-pulse">COMBAT EN COURS...</p></div>}
                            
                            <p className='text-yellow-100 text-xl mb-8 italic'>"{currentRoom.dialogue}"</p>

                            {/* Section Combat */}
                            {currentRoom.monster ? (
                                <div className='border-2 border-red-900 rounded-xl p-6 bg-red-950/20'>
                                    <h3 className='text-xl font-bold text-red-500 mb-4 uppercase'>⚠️ ENNEMI : {currentRoom.monster.name}</h3>
                                    <button onClick={handleFight} className='w-full py-4 font-black text-white bg-red-700 rounded-xl hover:bg-red-600'>ENGAGER LE COMBAT</button>
                                </div>
                            ) : fightResult ? (
                                <div className='p-8 bg-yellow-950/40 border-2 border-yellow-600 rounded-xl mb-6 text-center'>
                                    <h3 className='text-3xl font-black text-yellow-400 mb-2'>VICTOIRE !</h3>
                                    <p className='text-yellow-200'>+{fightResult.gold} OR RÉCUPÉRÉ</p>
                                    <button onClick={() => setFightResult(null)} className='mt-4 px-8 py-2 bg-yellow-600 text-black font-bold rounded-full'>CONTINUER</button>
                                </div>
                            ) : currentRoom.item ? (
                                <div className='p-6 bg-blue-950/40 border-2 border-blue-500 rounded-xl mb-6 animate-in zoom-in'>
                                    <h3 className='text-xl font-bold text-blue-400 mb-2'>📦 OBJET TROUVÉ : {currentRoom.item.name}</h3>
                                    <p className='text-sm text-blue-200 mb-4'>ATK: {currentRoom.item.atk || 0} | RES: {currentRoom.item.res || 0} | HP: {currentRoom.item.hp || 0}</p>
                                    <button onClick={() => handleAddItem(currentRoom.item!)} className='w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500'>RAMASSER L'OBJET</button>
                                </div>
                            ) : (
                                <div className='p-4 bg-green-950/20 border-2 border-green-900/50 rounded-xl text-center'><p className='text-green-400 font-bold uppercase'>Zone Sécurisée</p></div>
                            )}
                        </div>

                        {/* Remplacement d'item (Modal-like) */}
                        {itemToSwap && (
                            <div className='fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4'>
                                <div className='bg-slate-900 border-4 border-blue-600 p-8 rounded-2xl max-w-lg w-full'>
                                    <h3 className='text-2xl font-black text-white mb-2 uppercase'>Inventaire Plein !</h3>
                                    <p className='text-slate-400 mb-6'>Choisissez un objet à abandonner pour : <span className='text-blue-400'>{itemToSwap.name}</span></p>
                                    <div className='space-y-3'>
                                        {hero.inventory.map((item) => (
                                            <button key={item.id} onClick={() => replaceItem(item.id)} className='w-full p-4 bg-slate-800 border border-slate-700 hover:border-red-500 text-left rounded-xl transition-all group'>
                                                <div className='flex justify-between items-center'>
                                                    <span className='font-bold'>{item.name}</span>
                                                    <span className='text-xs text-red-500 opacity-0 group-hover:opacity-100 uppercase'>Remplacer</span>
                                                </div>
                                            </button>
                                        ))}
                                        <button onClick={() => setItemToSwap(null)} className='w-full py-3 mt-4 text-slate-500 font-bold hover:text-white'>IGNORER LE NOUVEL OBJET</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        {!currentRoom.monster && !fightResult && !itemToSwap && (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {currentRoom.nextRoomIds.length > 0 ? (
                                    currentRoom.nextRoomIds.map((nextId) => (
                                        <button key={nextId} onClick={() => handleNextRoom(nextId)} className='p-5 bg-slate-800 border-2 border-amber-900/50 rounded-xl text-yellow-100 font-bold hover:border-yellow-500 transition-all'>➡️ SALLE SUIVANTE</button>
                                    ))
                                ) : (
                                    <button onClick={() => navigate("/")} className='col-span-2 p-10 bg-yellow-600 text-black font-black rounded-2xl'>🏁 VICTOIRE FINALE : RETOUR AU GARAGE</button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Stats & Inventaire */}
                    <div className='lg:col-span-1 space-y-6'>
                        <div className='bg-slate-900 border-4 border-amber-900 rounded-2xl p-6 shadow-2xl'>
                            <h4 className='text-orange-500 font-black mb-4 uppercase tracking-widest text-sm'>Statistiques</h4>
                            <div className='space-y-4'>
                                <div>
                                    <div className='flex justify-between text-[10px] font-black text-red-500 mb-1 uppercase'><span>Points de Vie</span><span>{hero.hp}/100</span></div>
                                    <div className='h-3 bg-black rounded-full p-0.5 border border-slate-800'><div className='h-full bg-red-600 rounded-full transition-all' style={{ width: `${Math.max(0, hero.hp)}%` }}></div></div>
                                </div>
                                <div className='grid grid-cols-2 gap-2 text-center'>
                                    <div className='p-2 bg-slate-800 rounded border border-slate-700'><p className='text-[10px] text-slate-500 uppercase'>ATK</p><p className='font-bold'>{hero.atk}</p></div>
                                    <div className='p-2 bg-slate-800 rounded border border-slate-700'><p className='text-[10px] text-slate-500 uppercase'>RES</p><p className='font-bold'>{hero.res}</p></div>
                                </div>
                                <div className='p-4 bg-yellow-500/10 border border-yellow-600/50 rounded-xl text-center'><p className='text-2xl font-black text-yellow-400'>{hero.gold}G</p></div>
                            </div>
                        </div>

                        <div className='bg-slate-900 border-4 border-blue-900 rounded-2xl p-6 shadow-2xl'>
                            <h4 className='text-blue-500 font-black mb-4 uppercase tracking-widest text-sm'>Inventaire ({hero.inventory.length}/{INVENTORY_SIZE})</h4>
                            <div className='space-y-2'>
                                {hero.inventory.length > 0 ? hero.inventory.map((item, i) => (
                                    <div key={i} className='p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-sm flex justify-between'>
                                        <span className='font-bold text-slate-300'>{item.name}</span>
                                        <span className='text-blue-400 font-mono text-xs'>+{item.atk || item.res || item.hp}</span>
                                    </div>
                                )) : <p className='text-slate-600 text-xs text-center italic'>Votre coffre est vide...</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
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
    const [fightResult, setFightResult] = useState<{
        roomId: string;
        gold: number;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const heroId = (params as { heroId: string }).heroId;
    const GATEWAY_URL = "http://localhost:3000";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const heroRes = await fetch(`${GATEWAY_URL}/hero/${heroId}`);
                if (!heroRes.ok) throw new Error("Héros introuvable");
                const heroData = await heroRes.json();
                setHero(heroData);

                const dungeonRes = await fetch(`${GATEWAY_URL}/levelDesign/generate`);
                if (!dungeonRes.ok) throw new Error("Erreur génération donjon");
                const dungeonData = await dungeonRes.json();
                setDungeon(dungeonData);
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
                setHero(updatedHero);
                if (updatedHero.hp <= 0) {
                    setIsDead(true);
                }
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
            // --- CRUCIAL: APLATIR LE MONSTRE POUR LE COMBAT SERVICE ---
            // On extrait les stats de .stats si elles y sont, sinon on prend la racine
            const monsterStats = {
                name: currentRoom.monster.name,
                hp: currentRoom.monster.stats?.hp ?? currentRoom.monster.hp,
                atk: currentRoom.monster.stats?.atk ?? currentRoom.monster.atk,
                gold: currentRoom.monster.stats?.gold ?? currentRoom.monster.gold,
            };

            // On reconstruit un donjon simplifié avec le monstre aplati pour le service
            const simplifiedDungeon = {
                ...dungeon,
                rooms: dungeon.rooms.map((r, idx) => ({
                    ...r,
                    monster: idx === currentRoomIndex ? monsterStats : r.monster
                }))
            };

            const gamePayload = {
                userId: heroId,
                hero: hero, 
                dungeon: simplifiedDungeon,
                currentRoomIndex: currentRoomIndex,
                status: "EXPLORING"
            };

            const response = await fetch(`${GATEWAY_URL}/game/next-step`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(gamePayload),
            });

            if (!response.ok) throw new Error("Le GameService n'a pas répondu");

            // Attente du traitement RabbitMQ
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Récupération des stats finales
            await refreshHeroStats();

            // Si le héros n'est pas mort (vérifié dans refreshHeroStats), on affiche la victoire
            if (hero && hero.hp > 0) {
                setFightResult({ 
                    roomId: currentRoom.id, 
                    gold: monsterStats.gold || 0 
                });

                setDungeon({
                    ...dungeon,
                    rooms: dungeon.rooms.map((r) =>
                        r.id === currentRoom.id ? { ...r, monster: null } : r,
                    ),
                });
            }
        } catch (err) {
            setError("Échec de la communication avec les services de combat.");
        } finally {
            setIsFighting(false);
        }
    };

    const handleNextRoom = (nextRoomId: string) => {
        const nextIndex = dungeon?.rooms.findIndex((r) => r.id === nextRoomId);
        if (nextIndex !== undefined && nextIndex !== -1) {
            setCurrentRoomIndex(nextIndex);
            setFightResult(null);
        }
    };

    // --- ÉCRAN DE MORT ---
    if (isDead) {
        return (
            <div className='min-h-screen bg-black flex items-center justify-center p-4 text-center'>
                <div className='max-w-md w-full border-4 border-red-900 bg-slate-900 p-10 rounded-3xl shadow-[0_0_50px_rgba(255,0,0,0.3)]'>
                    <h2 className='text-6xl font-black text-red-600 mb-6 italic'>GAME OVER</h2>
                    <p className='text-slate-300 mb-8'>Votre aventure s'arrête ici. Votre héros a succombé à ses blessures.</p>
                    <button 
                        onClick={() => navigate("/")}
                        className='w-full py-4 bg-red-700 text-white font-black rounded-xl hover:bg-red-600 transition-transform active:scale-95'
                    >
                        RETOUR AU MENU
                    </button>
                </div>
            </div>
        );
    }

    if (error) return <div className='min-h-screen bg-slate-950 flex items-center justify-center text-red-500 font-bold'>{error}</div>;
    if (!dungeon || !hero) return <div className='min-h-screen bg-slate-950 flex items-center justify-center text-yellow-400 animate-pulse font-bold'>SYNCHRONISATION MARANELLO...</div>;

    const currentRoom = dungeon.rooms[currentRoomIndex];

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 p-6 font-sans text-slate-200'>
            <div className='max-w-6xl mx-auto'>
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
                        <div className='bg-slate-900/95 border-4 border-amber-900 rounded-2xl p-8 mb-6 shadow-2xl relative overflow-hidden'>
                            {isFighting && (
                                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
                                    <div className="w-16 h-16 border-4 border-t-orange-500 border-slate-800 rounded-full animate-spin mb-4"></div>
                                    <p className="text-orange-500 font-black tracking-widest animate-pulse">COMBAT EN COURS...</p>
                                </div>
                            )}

                            <p className='text-yellow-100 text-xl mb-8 leading-relaxed italic font-serif'>"{currentRoom.dialogue}"</p>

                            {currentRoom.monster ? (
                                <div className='border-2 border-red-900 rounded-xl p-6 mb-6 bg-red-950/20'>
                                    <h3 className='text-2xl font-bold text-red-500 mb-4 uppercase tracking-tighter'>⚠️ MENACE : {currentRoom.monster.name}</h3>
                                    <div className='grid grid-cols-2 gap-4 text-center mb-6'>
                                        <div className='p-3 bg-black/40 rounded border border-red-800'>
                                            <p className='text-[10px] text-red-400 font-bold uppercase'>PV Ennemi</p>
                                            <p className='text-2xl font-black text-white'>{currentRoom.monster.stats?.hp ?? currentRoom.monster.hp}</p>
                                        </div>
                                        <div className='p-3 bg-black/40 rounded border border-orange-800'>
                                            <p className='text-[10px] text-orange-400 font-bold uppercase'>Attaque</p>
                                            <p className='text-2xl font-black text-white'>{currentRoom.monster.stats?.atk ?? currentRoom.monster.atk}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleFight}
                                        className='w-full py-4 font-black text-white bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 rounded-xl shadow-lg transition-all active:scale-95'
                                    >
                                        LANCER LE COMBAT
                                    </button>
                                </div>
                            ) : fightResult ? (
                                <div className='p-8 bg-yellow-950/40 border-2 border-yellow-600 rounded-xl mb-6 text-center animate-in zoom-in'>
                                    <h3 className='text-4xl font-black text-yellow-400 mb-2 italic'>VICTOIRE</h3>
                                    <p className='text-yellow-200 text-lg font-bold tracking-widest'>+{fightResult.gold} OR RÉCUPÉRÉ</p>
                                    <button
                                        className='mt-6 px-12 py-3 bg-yellow-600 text-black font-black rounded-full hover:bg-yellow-500 transition-colors'
                                        onClick={() => setFightResult(null)}
                                    >
                                        CONTINUER L'EXPLORATION
                                    </button>
                                </div>
                            ) : (
                                <div className='p-6 bg-green-950/20 border-2 border-green-900/50 rounded-xl mb-6 text-center'>
                                    <p className='text-green-400 font-bold uppercase tracking-widest'>Route dégagée</p>
                                </div>
                            )}

                            <div className='w-full bg-slate-800 rounded-full h-3 border border-amber-900/50'>
                                <div
                                    className='bg-gradient-to-r from-orange-600 to-yellow-500 h-full transition-all duration-700'
                                    style={{ width: `${((currentRoom.index + 1) / (dungeon.rooms.length || 1)) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {!currentRoom.monster && !fightResult && (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4'>
                                {currentRoom.nextRoomIds.length > 0 ? (
                                    currentRoom.nextRoomIds.map((nextId) => (
                                        <button
                                            key={nextId}
                                            onClick={() => handleNextRoom(nextId)}
                                            className='p-5 bg-slate-800/80 border-2 border-amber-900/50 rounded-xl text-yellow-100 font-bold hover:border-yellow-500 hover:bg-slate-700 transition-all text-left shadow-lg'
                                        >
                                            ➡️ SALLE SUIVANTE
                                        </button>
                                    ))
                                ) : (
                                    <div className='col-span-2 p-10 bg-gradient-to-r from-yellow-700 to-orange-800 rounded-2xl text-center border-4 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.3)]'>
                                        <h3 className='text-4xl font-black text-white mb-4 italic tracking-tighter'>🏆 CHAMPION DE MARANELLO</h3>
                                        <button onClick={() => navigate("/")} className='px-10 py-3 bg-white text-black font-black rounded-full hover:scale-105 transition-transform'>RETOUR AU GARAGE</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className='lg:col-span-1'>
                        <div className='bg-slate-900 border-4 border-amber-900 rounded-2xl p-6 sticky top-6 shadow-2xl'>
                            <h4 className='text-orange-500 font-black mb-6 border-b border-amber-900/50 pb-2 uppercase tracking-widest text-sm'>Statistiques du Pilote</h4>
                            
                            <div className='space-y-6'>
                                <div>
                                    <div className='flex justify-between text-[10px] font-black text-red-500 mb-1 uppercase tracking-tighter'>
                                        <span>Points de Structure</span>
                                        <span>{hero.hp} / 100</span>
                                    </div>
                                    <div className='h-4 bg-black rounded-full border border-slate-800 overflow-hidden p-0.5 shadow-inner'>
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${hero.hp < 30 ? 'bg-red-600 animate-pulse' : 'bg-gradient-to-r from-red-600 to-red-400'}`}
                                            style={{ width: `${Math.max(0, hero.hp)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-center shadow-inner'>
                                        <p className='text-[10px] text-slate-500 font-bold uppercase mb-1'>Attaque</p>
                                        <p className='text-2xl font-black text-white font-mono'>{hero.atk}</p>
                                    </div>
                                    <div className='p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-center shadow-inner'>
                                        <p className='text-[10px] text-slate-500 font-bold uppercase mb-1'>Défense</p>
                                        <p className='text-2xl font-black text-white font-mono'>{hero.res}</p>
                                    </div>
                                </div>

                                <div className='p-5 bg-gradient-to-b from-yellow-500/10 to-transparent border-2 border-yellow-600/30 rounded-2xl text-center shadow-xl'>
                                    <p className='text-[10px] text-yellow-600 font-black uppercase mb-1 tracking-widest'>Butin de course</p>
                                    <p className='text-5xl font-black text-yellow-400 font-mono tracking-tighter'>{hero.gold}<span className='text-lg ml-1 text-yellow-600'>G</span></p>
                                </div>
                            </div>

                            <div className='mt-8 pt-6 border-t border-amber-900/30'>
                                <p className='text-[10px] text-slate-500 font-black uppercase mb-4 tracking-widest'>Radar de Course</p>
                                <div className='flex gap-1.5'>
                                    {dungeon.rooms.map((r) => (
                                        <div 
                                            key={r.id} 
                                            className={`h-2 flex-1 rounded-full transition-colors ${r.index === currentRoomIndex ? 'bg-orange-500 shadow-[0_0_8px_rgba(234,88,12,0.6)]' : r.index < currentRoomIndex ? 'bg-amber-900/50' : 'bg-slate-800'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
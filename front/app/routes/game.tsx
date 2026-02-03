import { useEffect, useState } from "react";
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
	stats: BattleStats;
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

const FAKE_DUNGEON: DungeonMap = {
	id: "dungeon-001",
	rooms: [
		{
			id: "room-1",
			index: 0,
			dialogue:
				"Vous entrez dans une salle froide et humide. Des torches accrochées aux murs vacillent faiblement.",
			monster: null,
			nextRoomIds: ["room-2"],
		},
		{
			id: "room-2",
			index: 1,
			dialogue:
				"Un bruit de grattement résonne dans l'obscurité. Vous apercevez une silhouette bouger...",
			monster: {
				id: "rat_01",
				name: "Rat d'égout",
				stats: { hp: 30, atk: 3, res: 1, vit: 8, gold: 10 },
			},
			nextRoomIds: ["room-3"],
		},
		{
			id: "room-3",
			index: 2,
			dialogue:
				"Vous avancez prudemment. Des ossements jonchent le sol. L'odeur devient plus fétide.",
			monster: {
				id: "skeleton_01",
				name: "Squelette Guerrier",
				stats: { hp: 45, atk: 5, res: 3, vit: 6, gold: 25 },
			},
			nextRoomIds: ["room-4", "room-5"],
		},
		{
			id: "room-4",
			index: 3,
			dialogue:
				"Une chambre remplie de trésors anciens. Une aura mystérieuse émane de ces objets.",
			monster: {
				id: "wizard_01",
				name: "Sorcier des Ombres",
				stats: { hp: 35, atk: 8, res: 2, vit: 7, gold: 40 },
			},
			nextRoomIds: ["room-6"],
		},
		{
			id: "room-5",
			index: 3,
			dialogue:
				"Un tunnel étroit qui sent la bête. Des griffes ont creusé des marques profondes dans la pierre.",
			monster: {
				id: "wolf_01",
				name: "Loup Gris",
				stats: { hp: 50, atk: 6, res: 2, vit: 10, gold: 35 },
			},
			nextRoomIds: ["room-6"],
		},
		{
			id: "room-6",
			index: 4,
			dialogue:
				"Vous approchez de la chambre du boss. Un sentiment d'oppression vous envahit. L'air crépite d'électricité.",
			monster: {
				id: "dragon_01",
				name: "Dragon Ancien",
				stats: { hp: 150, atk: 12, res: 8, vit: 5, gold: 500 },
			},
			nextRoomIds: [],
		},
	],
};

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Jeu - Maranello Speedrun" },
		{ name: "description", content: "Explorez le donjon" },
	];
}

export default function Game() {
	const [dungeon, setDungeon] = useState<DungeonMap | null>(null);
	const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
	const [hero, setHero] = useState<{ name: string; class: string } | null>(
		null,
	);
	const [heroStats, setHeroStats] = useState<BattleStats | null>(null);
	const [fightResult, setFightResult] = useState<{
		roomId: string;
		gold: number;
		item: string;
	} | null>(null);

	useEffect(() => {
		const storedHero = localStorage.getItem("currentHero");
		if (storedHero) {
			setHero(JSON.parse(storedHero));
		}
		setDungeon(FAKE_DUNGEON);
	}, []);

	useEffect(() => {
		if (hero) {
			const base: Record<string, BattleStats> = {
				WARRIOR: { hp: 100, atk: 10, res: 5, vit: 7, gold: 0 },
				MAGE: { hp: 70, atk: 15, res: 2, vit: 8, gold: 0 },
				TANK: { hp: 150, atk: 6, res: 10, vit: 4, gold: 0 },
				ASSASSIN: { hp: 80, atk: 12, res: 3, vit: 15, gold: 0 },
			};
			setHeroStats(base[hero.class] ?? base.WARRIOR);
		}
	}, [hero]);

	const currentRoom = dungeon?.rooms[currentRoomIndex];

	const handleNextRoom = (nextRoomId: string) => {
		if (currentRoom?.monster) {
			alert("Vous devez vaincre le monstre avant d'avancer !");
			return;
		}

		if (dungeon) {
			const nextIndex = dungeon.rooms.findIndex((r) => r.id === nextRoomId);
			if (nextIndex !== -1) {
				setCurrentRoomIndex(nextIndex);
				setFightResult(null);
			}
		}
	};

	const handleFight = () => {
		if (!dungeon || !currentRoom || !currentRoom.monster) return;

		const goldEarned = currentRoom.monster.stats.gold ?? 0;
		const possibleItems = [
			"Anneau rouillé",
			"Potion de soin",
			"Épée ébréchée",
			"Runes anciennes",
		];
		const item =
			possibleItems[Math.floor(Math.random() * possibleItems.length)];

		const newDungeon = {
			...dungeon,
			rooms: dungeon.rooms.map((r) =>
				r.id === currentRoom.id ? { ...r, monster: null } : r,
			),
		};
		setDungeon(newDungeon);
		setFightResult({ roomId: currentRoom.id, gold: goldEarned, item });
		setHeroStats((hs) => (hs ? { ...hs, gold: hs.gold + goldEarned } : hs));
	};

	if (!dungeon || !currentRoom) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 flex items-center justify-center'>
				<p className='text-yellow-400 text-xl'>Chargement du donjon...</p>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 p-6 font-sans'>
			<div className='max-w-6xl mx-auto'>
				{/* Header */}
				<div className='mb-8'>
					<h1
						className='text-4xl font-bold text-orange-600 mb-2'
						style={{ textShadow: "0 0 10px #ff6b00" }}
					>
						🏎️ Maranello Speedrun 8000MHz
					</h1>
					<div className='flex justify-between items-center text-yellow-400'>
						<div>
							<p className='font-bold'>
								Héros: <span className='text-yellow-300'>{hero?.name}</span>
							</p>
							<p className='text-sm'>Classe: {hero?.class}</p>
						</div>
						<div className='text-right'>
							<p className='font-bold'>Étage: {currentRoom.index + 1}</p>
							<p className='text-sm'>Salles: {dungeon.rooms.length}</p>
						</div>
					</div>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
					<div className='lg:col-span-2'>
						<div className='bg-slate-900/95 border-4 border-amber-900 rounded-2xl p-8 mb-6 shadow-2xl'>
							<p className='text-yellow-100 text-lg mb-8 leading-relaxed italic'>
								{currentRoom.dialogue}
							</p>

							{currentRoom.monster ? (
								<div className='border-2 border-red-900 rounded-lg p-6 mb-6 bg-red-950/30'>
									<h3 className='text-2xl font-bold text-red-400 mb-4'>
										⚔️ {currentRoom.monster.name}
									</h3>
									<div className='grid grid-cols-2 md:grid-cols-5 gap-4 text-yellow-200'>
										<div className='p-2 bg-slate-800 rounded border border-red-800 text-center'>
											<p className='text-xs text-red-400 font-bold'>HP</p>
											<p className='text-lg font-bold'>
												{currentRoom.monster.stats.hp}
											</p>
										</div>
										<div className='p-2 bg-slate-800 rounded border border-orange-800 text-center'>
											<p className='text-xs text-orange-400 font-bold'>ATK</p>
											<p className='text-lg font-bold'>
												{currentRoom.monster.stats.atk}
											</p>
										</div>
										{/* ... autres stats identiques ... */}
									</div>
									<button
										onClick={handleFight}
										className='w-full mt-6 px-6 py-3 font-bold text-yellow-400 bg-gradient-to-br from-red-700 to-red-900 border-2 border-red-500 rounded-lg'
									>
										⚔️ Combattre
									</button>
								</div>
							) : fightResult && fightResult.roomId === currentRoom.id ? (
								<div className='p-6 bg-yellow-950/40 border-2 border-yellow-600 rounded-lg mb-6 text-center'>
									<h3 className='text-2xl font-bold text-yellow-100 mb-2'>
										🏆 Victoire !
									</h3>
									<p className='text-yellow-200'>
										Or gagné : {fightResult.gold}
									</p>
									<p className='text-yellow-200 mb-4'>
										Objet : {fightResult.item}
									</p>
									<button
										className='px-6 py-2 bg-yellow-600 text-slate-900 font-bold rounded-lg'
										onClick={() => setFightResult(null)}
									>
										Continuer
									</button>
								</div>
							) : (
								<div className='p-6 bg-green-950/30 border-2 border-green-900 rounded-lg mb-6'>
									<p className='text-green-300 font-bold text-lg'>
										✨ Salle sûre - Aucun ennemi
									</p>
								</div>
							)}

							{/* Barre de progression */}
							<div className='w-full bg-slate-800 rounded-full h-3 border border-amber-900 overflow-hidden'>
								<div
									className='bg-gradient-to-r from-orange-600 to-orange-400 h-full'
									style={{
										width: `${((currentRoom.index + 1) / dungeon.rooms.length) * 100}%`,
									}}
								></div>
							</div>
						</div>

						{/* Navigation */}
						<div className='mt-6'>
							{currentRoom.nextRoomIds.length > 0 ? (
								<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
									{currentRoom.nextRoomIds.map((nextId) => (
										<button
											key={nextId}
											onClick={() => handleNextRoom(nextId)}
											className='p-4 bg-slate-800 border-2 border-amber-900 rounded-lg text-yellow-100 hover:border-yellow-500 transition-colors'
										>
											Aller vers la salle suivante
										</button>
									))}
								</div>
							) : (
								<div className='p-6 bg-gradient-to-r from-yellow-900 to-orange-900 border-2 border-yellow-600 rounded-lg text-center'>
									<h3 className='text-2xl font-bold text-yellow-100 mb-2'>
										🎉 Victoire Finale!
									</h3>
									<button className='px-6 py-2 bg-yellow-600 text-slate-900 font-bold rounded-lg'>
										Retour au menu
									</button>
								</div>
							)}
						</div>
					</div>

					{/* Sidebar */}
					<div className='lg:col-span-1'>
						{heroStats && (
							<div className='mb-6 p-4 bg-slate-900 border-4 border-amber-900 rounded-2xl'>
								<h4 className='text-yellow-300 font-bold mb-4 border-b border-amber-900 pb-2'>
									Statistiques
								</h4>
								<div className='grid grid-cols-2 gap-4 text-yellow-100'>
									<p>
										HP: <span className='text-yellow-400'>{heroStats.hp}</span>
									</p>
									<p>
										ATK:{" "}
										<span className='text-yellow-400'>{heroStats.atk}</span>
									</p>
									<p>
										Gold:{" "}
										<span className='text-yellow-400'>{heroStats.gold}</span>
									</p>
								</div>
							</div>
						)}

						<div className='bg-slate-900 border-4 border-amber-900 rounded-2xl p-6'>
							<h3 className='text-yellow-400 font-bold mb-4'>📍 Carte</h3>
							<div className='space-y-2'>
								{dungeon.rooms.map((room) => (
									<div
										key={room.id}
										className={`p-3 rounded-lg border-2 ${room.id === currentRoom.id ? "border-yellow-500 bg-yellow-950/50" : "border-amber-900 bg-slate-800"}`}
									>
										<p className='text-sm font-bold text-yellow-100'>
											Salle {room.index + 1}
										</p>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

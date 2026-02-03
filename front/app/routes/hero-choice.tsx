import { useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/hero-choice";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Créer votre héros" },
		{ name: "description", content: "Choisissez votre classe et votre nom" },
	];
}

const CLASSES = ["WARRIOR", "MAGE", "TANK", "ASSASSIN"];

export default function HeroChoice() {
	const [heroName, setHeroName] = useState("");
	const [selectedClass, setSelectedClass] = useState("WARRIOR");
	const navigate = useNavigate();

	const handleCreateHero = (e: React.FormEvent) => {
		e.preventDefault();

		if (!heroName.trim()) {
			alert("Veuillez entrer un nom pour votre héros");
			return;
		}

		// Stocker le héros créé (plus tard on l'enverra à l'API)
		const hero = {
			name: heroName,
			class: selectedClass,
		};

		// Stocker temporairement dans localStorage
		localStorage.setItem("currentHero", JSON.stringify(hero));

		// Redirection vers /game
		navigate("/game");
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 flex items-center justify-center font-sans relative overflow-hidden p-4'>
			{/* Background effects */}
			<div className='absolute inset-0 radial-gradient from-red-900/10 via-transparent to-indigo-900/10 pointer-events-none'></div>

			{/* Form Container */}
			<div
				className='relative z-10 w-full max-w-md bg-slate-900/95 px-12 py-12 border-4 border-amber-900 rounded-2xl shadow-2xl backdrop-blur-md'
				style={{
					boxShadow:
						"0 0 30px rgba(255, 69, 0, 0.5), inset 0 0 30px rgba(0, 0, 0, 0.8), 0 0 60px rgba(139, 0, 0, 0.3)",
				}}
			>
				{/* Header */}
				<div className='mb-8 text-center'>
					<h1
						className='text-4xl font-bold text-orange-600 drop-shadow-2xl mb-2 tracking-wider'
						style={{
							textShadow:
								"0 0 10px #ff6b00, 0 0 20px #ff3300, 2px 2px 4px rgba(0, 0, 0, 0.8)",
						}}
					>
						⚔️ Créer votre héros
					</h1>
					<div
						className='h-0.5 bg-gradient-to-r from-transparent via-amber-900 to-transparent'
						style={{ boxShadow: "0 0 10px #d4af37" }}
					></div>
				</div>

				{/* Form */}
				<form
					onSubmit={handleCreateHero}
					className='space-y-6'
				>
					{/* Name Input */}
					<div>
						<label
							htmlFor='heroName'
							className='block text-yellow-400 font-bold text-lg mb-2'
						>
							Nom du héros
						</label>
						<input
							id='heroName'
							type='text'
							value={heroName}
							onChange={(e) => setHeroName(e.target.value)}
							placeholder='Entrez le nom de votre héros...'
							className='w-full px-4 py-3 bg-slate-800 border-2 border-amber-900 rounded-lg text-yellow-100 placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition-colors'
							style={{
								boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.5)",
							}}
						/>
					</div>

					{/* Class Select */}
					<div>
						<label
							htmlFor='heroClass'
							className='block text-yellow-400 font-bold text-lg mb-2'
						>
							Classe
						</label>
						<select
							id='heroClass'
							value={selectedClass}
							onChange={(e) => setSelectedClass(e.target.value)}
							className='w-full px-4 py-3 bg-slate-800 border-2 border-amber-900 rounded-lg text-yellow-100 focus:outline-none focus:border-yellow-500 transition-colors cursor-pointer'
							style={{
								boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.5)",
							}}
						>
							{CLASSES.map((cls) => (
								<option
									key={cls}
									value={cls}
								>
									{cls}
								</option>
							))}
						</select>
					</div>

					{/* Class Description */}
					<div className='p-4 bg-slate-800/50 border-l-4 border-yellow-500 rounded'>
						<p className='text-yellow-200 text-sm'>
							{selectedClass === "WARRIOR" &&
								"Guerrier puissant avec une bonne défense et attaque."}
							{selectedClass === "MAGE" &&
								"Mage avec des attaques magiques mais faible en défense."}
							{selectedClass === "TANK" &&
								"Tank avec énormément de points de vie et de défense."}
							{selectedClass === "ASSASSIN" &&
								"Assassin rapide avec une attaque critique élevée."}
						</p>
					</div>

					{/* Submit Button */}
					<button
						type='submit'
						className='w-full px-6 py-3 text-lg font-bold text-yellow-400 bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-amber-900 rounded-lg cursor-pointer transition-all duration-300 hover:border-yellow-500 hover:text-yellow-300 hover:shadow-2xl active:shadow-lg'
						style={{
							textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)",
							boxShadow:
								"0 0 15px rgba(255, 215, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
						}}
					>
						🎮 Commencer l'aventure
					</button>
				</form>
			</div>
		</div>
	);
}

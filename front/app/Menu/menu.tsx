import { Link } from "react-router";

export function Menu() {
	return (
		<div className='min-h-screen bg-linear-to-br from-slate-900 via-slate-950 to-blue-950 flex items-center justify-center font-sans relative overflow-hidden'>
			{/* Background effects */}
			<div className='absolute inset-0 radial-gradient from-red-900/10 via-transparent to-indigo-900/10 pointer-events-none'></div>

			{/* Menu Container */}
			<div
				className='relative z-10 text-center bg-slate-900/95 px-16 py-16 border-4 border-amber-900 rounded-2xl shadow-2xl backdrop-blur-md max-w-2xl mx-4'
				style={{
					boxShadow:
						"0 0 30px rgba(255, 69, 0, 0.5), inset 0 0 30px rgba(0, 0, 0, 0.8), 0 0 60px rgba(139, 0, 0, 0.3)",
				}}
			>
				{/* Header */}
				<div className='mb-12'>
					<h1
						className='text-5xl font-bold text-orange-600 drop-shadow-2xl mb-4 tracking-wider'
						style={{
							textShadow:
								"0 0 10px #ff6b00, 0 0 20px #ff3300, 2px 2px 4px rgba(0, 0, 0, 0.8)",
							animation: "glow-pulse 2s ease-in-out infinite",
						}}
					>
						🏎️ Maranello Speedrun 8000MHz
					</h1>
					<div
						className='h-0.5 bg-linear-to-r from-transparent via-amber-900 to-transparent'
						style={{ boxShadow: "0 0 10px #d4af37" }}
					></div>
				</div>

				{/* Buttons */}
				<div className='flex flex-col gap-5 mb-10'>
					<Link
						to='/commandes'
						className='px-10 py-4 text-xl font-bold text-yellow-400 bg-linear-to-br from-slate-700 to-slate-900 border-2 border-amber-900 rounded-lg cursor-pointer transition-all duration-300 hover:border-yellow-500 hover:text-yellow-300 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 inline-block'
						style={{
							textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)",
							boxShadow:
								"0 0 15px rgba(255, 215, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
						}}
					>
						<span className='flex items-center justify-center gap-2'>
							⚔️ Commandes
						</span>
					</Link>

					<Link
						to='/hero-choice'
						className='px-10 py-4 text-xl font-bold text-yellow-400 bg-linear-to-br from-slate-700 to-slate-900 border-2 border-amber-900 rounded-lg cursor-pointer transition-all duration-300 hover:border-yellow-500 hover:text-yellow-300 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 inline-block'
						style={{
							textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)",
							boxShadow:
								"0 0 15px rgba(255, 215, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
						}}
					>
						<span className='flex items-center justify-center gap-2'>
							🎮 Nouvelle partie
						</span>
					</Link>

					<button
						className='px-10 py-4 text-xl font-bold text-yellow-400 bg-linear-to-br from-slate-700 to-slate-900 border-2 border-amber-900 rounded-lg cursor-pointer transition-all duration-300 hover:border-yellow-500 hover:text-yellow-300 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0'
						style={{
							textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)",
							boxShadow:
								"0 0 15px rgba(255, 215, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
						}}
					>
						<span className='flex items-center justify-center gap-2'>
							📜 Charger une partie
						</span>
					</button>

					<a
						href='https://tinyurl.com/4kjryuw4'
						target='_blank'
						rel='noopener noreferrer'
						className='px-10 py-4 text-xl font-bold text-yellow-400 bg-linear-to-br from-slate-700 to-slate-900 border-2 border-amber-900 rounded-lg cursor-pointer transition-all duration-300 hover:border-yellow-500 hover:text-yellow-300 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 inline-block'
						style={{
							textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)",
							boxShadow:
								"0 0 15px rgba(255, 215, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
						}}
					>
						<span className='flex items-center justify-center gap-2'>
							🔓 Cheat codes
						</span>
					</a>
				</div>

				{/* Torches */}
				<div className='flex justify-between items-end h-24 opacity-70'>
					<div
						className='w-14 h-20 bg-linear-to-b from-transparent via-amber-900 to-amber-950 rounded-t-lg border-2 border-amber-950 relative'
						style={{
							boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.8)",
						}}
					>
						<div
							className='absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-orange-600 rounded-full blur-md'
							style={{
								boxShadow: "0 0 20px #ff6b00, 0 0 40px #ff3300",
								animation: "flame-flicker 0.5s ease-in-out infinite",
							}}
						></div>
					</div>

					<div
						className='w-14 h-20 bg-linear-to-b from-transparent via-amber-900 to-amber-950 rounded-t-lg border-2 border-amber-950 relative'
						style={{
							boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.8)",
						}}
					>
						<div
							className='absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-orange-600 rounded-full blur-md'
							style={{
								boxShadow: "0 0 20px #ff6b00, 0 0 40px #ff3300",
								animation: "flame-flicker 0.5s ease-in-out infinite",
							}}
						></div>
					</div>
				</div>
			</div>

			<style>{`
				@keyframes glow-pulse {
					0%, 100% {
						text-shadow: 0 0 10px #ff6b00, 0 0 20px #ff3300, 2px 2px 4px rgba(0, 0, 0, 0.8);
					}
					50% {
						text-shadow: 0 0 20px #ff6b00, 0 0 30px #ff3300, 0 0 40px #ff9900, 2px 2px 4px rgba(0, 0, 0, 0.8);
					}
				}
				@keyframes flame-flicker {
					0%, 100% {
						transform: scaleY(1);
					}
					50% {
						transform: scaleY(1.1);
					}
				}
			`}</style>
		</div>
	);
}

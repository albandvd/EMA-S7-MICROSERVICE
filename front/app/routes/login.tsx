import { useState } from "react";

export default function LoginPage() {
	const [login, setLogin] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ login, password }),
			});

			if (!response.ok) {
				throw new Error("Identifiants invalides");
			}

			const data = await response.json();
			console.log("Connexion réussie:", data);
			localStorage.setItem("token", data.token);
			window.location.href = "/";
		} catch (err) {
			setError(err instanceof Error ? err.message : "Une erreur est survenue");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex justify-center items-center min-h-screen bg-linear-to-br from-indigo-500 to-purple-600 p-4'>
			<div className='bg-white rounded-lg shadow-2xl p-10 w-full max-w-md'>
				<h1 className='text-3xl font-bold text-center text-gray-800 mb-8'>
					Connexion
				</h1>

				{error && (
					<div className='bg-red-50 text-red-700 px-4 py-3 rounded border-l-4 border-red-700 mb-6'>
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit}>
					<div className='mb-6'>
						<label
							htmlFor='login'
							className='block text-gray-700 font-semibold mb-2'
						>
							Identifiant:
						</label>
						<input
							id='login'
							type='text'
							value={login}
							onChange={(e) => setLogin(e.target.value)}
							placeholder='Entrez votre identifiant'
							required
							disabled={loading}
							className='w-full text-black px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition disabled:bg-gray-100 disabled:cursor-not-allowed'
						/>
					</div>

					<div className='mb-8'>
						<label
							htmlFor='password'
							className='block text-gray-700 font-semibold mb-2'
						>
							Mot de passe:
						</label>
						<input
							id='password'
							type='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder='Entrez votre mot de passe'
							required
							disabled={loading}
							className='w-full px-4 text-black py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition disabled:bg-gray-100 disabled:cursor-not-allowed'
						/>
					</div>

					<button
						type='submit'
						disabled={loading}
						className='w-full py-3 bg-linear-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed'
					>
						{loading ? "Connexion en cours..." : "Se connecter"}
					</button>
				</form>

				<p className='text-center mt-6 text-gray-600'>
					Pas encore de compte?{" "}
					<a
						href='/signup'
						className='text-indigo-500 font-semibold hover:text-purple-600 transition'
					>
						S'inscrire
					</a>
				</p>
			</div>
		</div>
	);
}

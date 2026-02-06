import { useState } from "react";
import { useNavigate } from "react-router";

export default function SignupForm() {
	const [login, setLogin] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setLoading(true);

		// Validation
		if (password !== confirmPassword) {
			setError("Les mots de passe ne correspondent pas");
			setLoading(false);
			return;
		}

		if (password.length < 6) {
			setError("Le mot de passe doit contenir au moins 6 caractères");
			setLoading(false);
			return;
		}

		try {
			const response = await fetch("http://localhost:3000/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					"email": login,
					password,
				}),
			});
			navigate("/");
			console.log("Données formulaire :", login, password, confirmPassword);
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
					Créer un compte
				</h1>

				{error && (
					<div className='bg-red-50 text-red-700 px-4 py-3 rounded border-l-4 border-red-700 mb-6'>
						{error}
					</div>
				)}

				{success && (
					<div className='bg-green-50 text-green-700 px-4 py-3 rounded border-l-4 border-green-700 mb-6'>
						{success}
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
							placeholder='Choisissez un identifiant'
							required
							disabled={loading}
							className='w-full px-4 text-black py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition disabled:bg-gray-100 disabled:cursor-not-allowed'
						/>
					</div>

					<div className='mb-6'>
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
							placeholder='Minimum 6 caractères'
							required
							disabled={loading}
							className='w-full text-black px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition disabled:bg-gray-100 disabled:cursor-not-allowed'
						/>
					</div>

					<div className='mb-8'>
						<label
							htmlFor='confirmPassword'
							className='block text-gray-700 font-semibold mb-2'
						>
							Confirmer le mot de passe:
						</label>
						<input
							id='confirmPassword'
							type='password'
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder='Confirmez votre mot de passe'
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
						{loading ? "Inscription en cours..." : "S'inscrire"}
					</button>
				</form>

				<p className='text-center mt-6 text-gray-600'>
					Déjà inscrit?{" "}
					<a
						href='/login'
						className='text-indigo-500 font-semibold hover:text-purple-600 transition'
					>
						Se connecter
					</a>
				</p>
			</div>
		</div>
	);
}

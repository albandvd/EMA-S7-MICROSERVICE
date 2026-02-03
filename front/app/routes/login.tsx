import LoginForm from "~/login/login-form";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Login" },
		{ name: "description", content: "Page de connexion" },
	];
}

export default function Login() {
	return <LoginForm />;
}

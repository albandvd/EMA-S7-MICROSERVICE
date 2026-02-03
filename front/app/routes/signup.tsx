import SignupForm from "~/signup/signup-form";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Sign Up" },
		{ name: "description", content: "Page de création de compte" },
	];
}

export default function Home() {
	return <SignupForm />;
}

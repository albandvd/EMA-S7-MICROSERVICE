import type { Route } from "./+types/home";
import { Menu } from "../Menu/menu";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Main menu" },
		{ name: "description", content: "Menu principal" },
	];
}

export default function Home() {
	return <Menu />;
}

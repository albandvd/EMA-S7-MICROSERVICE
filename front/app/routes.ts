import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("login", "routes/login.tsx"),
	route("signup", "routes/signup.tsx"),
	route("hero-choice", "routes/hero-choice.tsx"),
	route("game/:heroId", "routes/game.tsx"),
] satisfies RouteConfig;

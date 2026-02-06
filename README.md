# EMA-S7-MICROSERVICE

Un ensemble de microservices pour un jeu de type dungeon / RPG. Ce dépôt contient plusieurs services (frontend, authentification, items, héros, sauvegardes, etc.) conçus pour être exécutés localement via Docker Compose pendant le développement.

Ce README explique la structure du projet, comment lancer les services en local, les points d'entrée API importants, et des recommandations pour le développement et le débogage.

## Structure du dépôt

Racine du projet (extraits) :

- `front/` : application frontend React + TypeScript (Vite). Contient les routes, composants et le bundle de production (dans `build/`).
- `auth/` : service d'authentification (Express). Gère l'inscription / connexion et la génération de JWT.
- `hero/`, `item/`, `game/`, `save/`, `combat/`, `level-design/` : microservices back-end pour la logique du jeu, les objets, les héros, les sauvegardes, etc.
- `nginx/` : configuration nginx pour reverse-proxy (optionnelle en dev).
- `compose.yml` et fichiers `*.yml` : orchestrations Docker Compose pour lancer les services.
- `init-scripts/` : scripts SQL d'initialisation (base de données).

Chaque service contient son propre `package.json` (ou manifest), Dockerfile et tests unitaires quand applicable.

## Prérequis

- Docker & Docker Compose (ou `docker compose`) installés.
- Node.js + pnpm (pour le dev frontend si vous lancez le front hors container).

## Lancer en local (Docker Compose)

La façon la plus simple est d'utiliser Docker Compose depuis la racine du dépôt :

```bash
docker-compose up --build
```

Vérifiez les logs des services pour confirmer que les dépendances (BDD, etc.) sont prêtes.

## Points d'entrée API importants

Le projet expose plusieurs endpoints (les chemins peuvent être préfixés par un gateway selon votre configuration) — voici les plus utilisés par le frontend :

- Auth
	- POST `/auth/login` — body: `{ email, password }` → renvoie `{ message, token }` et pose un cookie `token` (HttpOnly en production).
	- POST `/auth/register` — body: `{ email, password }` → crée un utilisateur et renvoie `{ message, token }`.

- Héros
	- GET `/hero/:heroId` — récupère les données du héros (base stats, inventory, currentHp...)

- Game
	- POST `/game/next-step` — payload de combat / progression (le frontend envoie le héros buffé et l'état du donjon pour calculer l'étape suivante).

- Items
	- GET `/items/alea/:count` — récupère `count` objets aléatoires.

- Level design
	- GET `/levelDesign/generate` — génère/retourne la structure du donjon (rooms, monstres, clés de progression).

- Saves
	- GET `/save/:userId` — récupère la sauvegarde du joueur.
	- POST `/save` — crée une nouvelle sauvegarde. Exemple body minimal :
		```json
		{
			"userId": "string",
			"dungeonId": "string",
			"currentRoomIndex": 0,
			"status": "string",
			"rooms": []
		}
		```
	- PUT `/save/:userId` — met à jour la sauvegarde (ex: `{ "currentRoomIndex": 1 }`).

Remarque : Le frontend utilise `GATEWAY_URL` : `http://localhost:3000`.
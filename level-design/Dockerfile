# --- Étape 1 : Builder ---
FROM node:20-alpine AS builder

# Installation de pnpm globalement
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copie des fichiers de configuration pnpm
# On copie pnpm-lock.yaml pour que pnpm puisse faire une installation stricte
COPY package.json pnpm-lock.yaml ./

# Installation des dépendances (équivalent de npm ci)
RUN pnpm install --frozen-lockfile

# Copie du reste du code et build
COPY . .
RUN pnpm run build

# --- Étape 2 : Runner ---
FROM node:20-alpine

# On réinstalle pnpm dans l'image finale
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./

# Installation des dépendances de production uniquement
RUN pnpm install --prod --frozen-lockfile

# Récupération du build et du YAML
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/api ./dist/api

USER node

EXPOSE 3007

CMD ["node", "dist/application/server.js"]
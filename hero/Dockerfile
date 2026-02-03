# --- Étape 1 : Builder ---
FROM node:24-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

RUN pnpm install --frozen-lockfile

# Génère ./generated à la racine
RUN pnpm exec prisma generate

COPY . .
RUN pnpm run build

# --- Étape 2 : Runner ---
FROM node:24-alpine
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apk -U add openssl

WORKDIR /app
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# 1. On copie le contenu de dist (qui contient src et generated compilés)
# Comme ton tree montre que dist contient déjà 'generated' et 'src', 
# copier le contenu de dist à la racine /app respecte ton architecture.
COPY --from=builder /app/dist ./

# 2. On copie aussi le dossier prisma original pour les migrations
COPY prisma ./prisma

USER node
EXPOSE 3005

# Ton server.js est dans /app/src/application/server.js (après la copie du contenu de dist)
CMD ["node", "src/application/server.js"]
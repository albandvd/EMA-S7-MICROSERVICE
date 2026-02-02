# Stage 1: Build the app
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN pnpm dlx prisma generate
RUN pnpm build

# Stage 2: Run the app
FROM node:20-alpine
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile
# Generate Prisma client in production stage
RUN pnpm dlx prisma generate
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
# Copy prisma schema (needed for prisma generate to work)
COPY prisma ./prisma
EXPOSE 3006

CMD ["node", "dist/src/server.js"]
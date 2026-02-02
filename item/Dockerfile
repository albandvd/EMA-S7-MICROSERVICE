# Stage 1: Build the app
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./

# Fix 1: Ensure pnpm scripts run so Prisma engines are downloaded correctly
RUN pnpm config set ignore-scripts false
RUN pnpm install

COPY . .
RUN pnpm dlx prisma generate
RUN pnpm build

# Stage 2: Run the app
FROM node:20-alpine
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm config set ignore-scripts false
RUN pnpm install --prod --frozen-lockfile

# Fix 2: COPY the prisma folder BEFORE running generate
COPY prisma ./prisma

# Fix 3: Run generate now that the schema exists
RUN pnpm dlx prisma generate

COPY --from=builder /app/dist ./dist
# Only keep this if you have a custom output path in your schema
COPY --from=builder /app/generated ./generated

EXPOSE 3006
CMD ["node", "dist/src/server.js"]
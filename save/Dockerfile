FROM node:20

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm build

EXPOSE 3009

CMD ["node", "dist/main"]
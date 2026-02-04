FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS development-dependencies-env
COPY . /app
RUN pnpm install --frozen-lockfile

FROM base AS production-dependencies-env
COPY ./package.json pnpm-lock.yaml /app/
RUN pnpm install --prod --frozen-lockfile

FROM base AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
RUN pnpm run build

FROM base
COPY ./package.json pnpm-lock.yaml /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build

CMD ["pnpm", "run", "start"]
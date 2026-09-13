FROM node:24-slim AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:24-slim AS production-dependencies-env
COPY ./package.json pnpm-lock.yaml pnpm-workspace.yaml /app/
WORKDIR /app
RUN corepack enable && pnpm install --frozen-lockfile --prod

FROM node:24-slim AS build-env
ARG DOMAIN
ENV DOMAIN=$DOMAIN
RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN corepack enable && pnpm run build

FROM node:24-slim
COPY ./package.json pnpm-lock.yaml pnpm-workspace.yaml /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
RUN corepack enable
CMD ["pnpm", "run", "start"]

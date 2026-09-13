FROM node:24-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:24-alpine AS production-dependencies-env
COPY ./package.json pnpm-lock.yaml /app/
WORKDIR /app
RUN corepack enable && pnpm install --frozen-lockfile --prod

FROM node:24-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN corepack enable && pnpm run build

FROM node:24-alpine
COPY ./package.json pnpm-lock.yaml /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
RUN corepack enable
CMD ["pnpm", "run", "start"]

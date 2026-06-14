FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-*.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN --mount=type=secret,id=sentry_auth_token \
    SENTRY_AUTH_TOKEN=$(cat /run/secrets/sentry_auth_token) pnpm build-only

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY docker-entrypoint.sh /docker-entrypoint.d/99-runtime-env.sh

RUN chmod +x /docker-entrypoint.d/99-runtime-env.sh

EXPOSE 80

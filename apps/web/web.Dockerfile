FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
RUN npm ci

FROM deps AS build
COPY . .
RUN corepack enable
WORKDIR /app/apps/web
RUN npm install
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/web/.next ./apps/web/.next
COPY --from=build /app/apps/web/public ./apps/web/public
COPY --from=build /app/apps/web/package.json ./apps/web/package.json
COPY --from=build /app/apps/web/next.config.* ./apps/web/
COPY --from=build /app/apps/web/node_modules ./apps/web/node_modules

WORKDIR /app/apps/web
EXPOSE 3000

CMD ["npm", "run", "start", "--", "-p", "3000"]
FROM node:20-alpine AS base
WORKDIR /app/apps/api

FROM base AS deps
COPY apps/api/package*.json ./
RUN npm install

FROM deps AS build
COPY apps/api ./
RUN npx prisma generate --config=./prisma.config.ts
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app/apps/api
ENV NODE_ENV=production

COPY --from=deps /app/apps/api/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/apps/api/prisma.config.ts ./prisma.config.ts

# important: copiem si clientul generat prisma
COPY --from=build /app/apps/api/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/apps/api/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3001

CMD ["node", "dist/src/main.js"]
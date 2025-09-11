# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

ENV NODE_ENV=production

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --include=dev

FROM deps AS build
COPY . .
RUN npx prisma generate && npm run build

FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install only production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built app and prisma client
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]



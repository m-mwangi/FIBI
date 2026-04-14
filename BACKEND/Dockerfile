# FIBI API — Node + Prisma (PostgreSQL)
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat

FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
# postinstall runs `prisma generate`; Prisma CLI is a devDependency — full install required
RUN npm ci

FROM deps AS release
COPY . .
RUN chmod +x docker-entrypoint.sh
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs fibi
RUN chown -R fibi:nodejs /app

USER fibi
EXPOSE 5000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "index.js"]
